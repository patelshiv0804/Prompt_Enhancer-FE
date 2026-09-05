const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, ...restOptions } = options;

  // Build URL with query parameters
  let url = `${API_URL}${path}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  // Build headers
  const defaultHeaders: Record<string, string> = {};

  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('promptiq_access_token')) : null;
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type if we're sending URL-encoded form data or FormData
  // (fetch will automatically set correct boundaries/Content-Type for FormData)
  if (!(restOptions.body instanceof FormData) && !(restOptions.body instanceof URLSearchParams)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const mergedHeaders = {
    ...defaultHeaders,
    ...headers,
  };

  const response = await fetch(url, {
    ...restOptions,
    headers: mergedHeaders,
    // Send/receive the httpOnly auth cookie set by the backend (VULN-017).
    // Auth is no longer carried in a JS-readable Authorization header.
    credentials: 'include',
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errorJson = await response.json();
      const rawDetail = errorJson.detail || errorJson.message || errorDetail;
      errorDetail = typeof rawDetail === 'string' ? rawDetail : JSON.stringify(rawDetail);
    } catch {
      // Ignore if not JSON
    }
    if (response.status === 401 && typeof window !== 'undefined') {
      const isAuthEndpoint =
        path.startsWith('/api/v1/auth/login') ||
        path.startsWith('/api/v1/auth/register') ||
        path.startsWith('/api/v1/auth/google') ||
        path.startsWith('/api/v1/auth/verify-reset-otp') ||
        path.startsWith('/api/v1/auth/reset-password') ||
        path.startsWith('/api/v1/auth/forgot-password');

      if (!isAuthEndpoint) {
        window.dispatchEvent(new CustomEvent('aure_unauthorized', { detail: { path } }));
        window.dispatchEvent(new CustomEvent('promptiq:unauthorized', { detail: { path } }));
        // Only bounce to /auth from protected (dashboard) routes. On public
        // pages like the landing page, a 401 from the session probe simply
        // means "not logged in" — redirecting there would drag every visitor
        // to /auth before they can click Log in, and block them from ever
        // returning home. The dashboard is still guarded by AuthGuard.
        if (window.location.pathname.startsWith('/dashboard')) {
          window.location.href = '/auth';
        }
      }
    }

    const error = new Error(errorDetail);
    (error as any).status = response.status;
    throw error;
  }

  // If status is 204 (No Content) or response has no content, return null/void
  if (response.status === 204) {
    return null as any;
  }

  return response.json();
}

export const apiClient = {
  get: <T = any>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),
  post: <T = any>(path: string, body?: any, options?: RequestOptions) => {
    const isSpecialBody = body instanceof FormData || body instanceof URLSearchParams;
    return apiRequest<T>(path, {
      ...options,
      method: 'POST',
      body: isSpecialBody ? body : JSON.stringify(body),
    });
  },
  patch: <T = any>(path: string, body?: any, options?: RequestOptions) => {
    const isSpecialBody = body instanceof FormData || body instanceof URLSearchParams;
    return apiRequest<T>(path, {
      ...options,
      method: 'PATCH',
      body: isSpecialBody ? body : JSON.stringify(body),
    });
  },
  delete: <T = any>(path: string, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }),
};

/* ────────────────────────────────────────────────────────────────────────
 * Server-Sent Events (SSE) streaming
 *
 * The enhance/stream endpoint is a cross-origin POST that carries a JSON body
 * and the httpOnly auth cookie, so the native EventSource API (GET-only, no
 * custom body) can't be used. We stream with fetch + ReadableStream instead
 * and parse the `event:`/`data:` frames by hand.
 * ──────────────────────────────────────────────────────────────────────── */

export interface EnhanceStreamMeta {
  template?: { id: string; title: string; similarity: number };
  detected_level?: string;
  level_reason?: string;
}

export interface EnhanceStreamDone {
  original_prompt: string;
  enhanced_prompt: string;
  template?: { id: string; title: string; similarity: number };
  version?: { prompt_id: string; version_number: number };
  detected_level?: string;
  level_reason?: string;
}

/**
 * Payload of the `done` frame emitted by POST /prompts/{id}/reenhance/stream.
 * Mirrors the blocking /reenhance response's `data` object: the new version is
 * already persisted and its per-version quality scores are computed
 * synchronously, so everything the UI needs arrives in this one frame (no
 * follow-up polling, unlike the initial enhancement).
 */
export interface ReenhanceStreamDone {
  prompt_id: string;
  version_id: string;
  version_number: number;
  enhanced_prompt: string;
  template_id?: string;
  old_analysis?: any;
  new_analysis?: any;
  tool_recommendations?: any;
}

export interface StreamEnhanceHandlers<TDone = EnhanceStreamDone> {
  onMeta?: (meta: EnhanceStreamMeta) => void;
  onToken?: (text: string) => void;
  onDone?: (data: TDone) => void;
  /**
   * Called once for any failure — transport error, non-2xx response, or a
   * server-emitted `error` frame. Never fires after onDone. Callers typically
   * fall back to the blocking endpoint here.
   */
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

/** Parse one raw SSE frame ("event: x\ndata: {...}") into {event, data}. */
function parseSSEFrame(frame: string): { event: string; data: any } {
  let event = 'message';
  const dataLines: string[] = [];
  for (const rawLine of frame.split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    if (!line || line.startsWith(':')) continue; // blank or comment/keep-alive
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      // A single leading space after the colon is part of the SSE framing.
      dataLines.push(line.slice(5).replace(/^ /, ''));
    }
  }
  if (dataLines.length === 0) return { event, data: null };
  const dataStr = dataLines.join('\n');
  try {
    return { event, data: JSON.parse(dataStr) };
  } catch {
    return { event, data: dataStr };
  }
}

/**
 * POST `body` to `path` and consume the Server-Sent Events response, invoking
 * the matching handler for each `meta` / `token` / `done` / `error` frame.
 *
 * Resolves when the stream finishes (or after onError). Does not throw for
 * network/HTTP/stream failures — those are routed to `onError` so a single
 * call site can decide how to recover. User-initiated aborts are swallowed.
 */
export async function streamEnhance<TDone = EnhanceStreamDone>(
  path: string,
  body: any,
  handlers: StreamEnhanceHandlers<TDone>
): Promise<void> {
  const url = `${API_URL}${path}`;
  let settled = false; // guards against onDone + onError both firing

  const fail = (error: Error) => {
    if (settled) return;
    settled = true;
    handlers.onError?.(error);
  };

  // Auth resilience: send the Bearer token from localStorage in addition to the
  // httpOnly cookie (credentials: 'include'). The cookie is cross-site here
  // (frontend :3000 → API :8000), and mobile browsers frequently block cross-site
  // cookies (iOS Safari "Prevent Cross-Site Tracking" is on by default; a non-HTTPS
  // LAN origin also rejects a SameSite=None;Secure cookie). Without a token header
  // the stream then 401s and silently falls back to the blocking endpoint, so the
  // live token streaming never shows on mobile/tablet. The backend's stream routes
  // accept the Authorization header first, then the cookie, so this mirrors the
  // blocking apiRequest path and is a no-op when no token is stored (desktop
  // behavior unchanged — the cookie is still sent regardless).
  const token = typeof window !== 'undefined'
    ? (localStorage.getItem('token') || localStorage.getItem('promptiq_access_token'))
    : null;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      credentials: 'include',
      signal: handlers.signal,
    });
  } catch (err: any) {
    if (handlers.signal?.aborted) return;
    fail(err instanceof Error ? err : new Error('Streaming request failed.'));
    return;
  }

  if (!response.ok) {
    // Pre-stream failures (auth, validation, bad template) arrive as a normal
    // JSON error body with a real status code — surface the detail.
    let errorDetail = response.statusText;
    try {
      const errorJson = await response.json();
      const rawDetail = errorJson.detail || errorJson.message || errorDetail;
      errorDetail = typeof rawDetail === 'string' ? rawDetail : JSON.stringify(rawDetail);
    } catch {
      // non-JSON body — keep statusText
    }
    const error = new Error(errorDetail);
    (error as any).status = response.status;
    fail(error);
    return;
  }

  if (!response.body) {
    fail(new Error('Streaming is not supported in this environment.'));
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const dispatch = (frame: string) => {
    if (!frame.trim()) return;
    const { event, data } = parseSSEFrame(frame);
    if (data === null) return;
    if (event === 'meta') {
      handlers.onMeta?.(data as EnhanceStreamMeta);
    } else if (event === 'token') {
      if (data && typeof data.text === 'string') handlers.onToken?.(data.text);
    } else if (event === 'done') {
      if (!settled) {
        settled = true;
        handlers.onDone?.(data as TDone);
      }
    } else if (event === 'error') {
      const detail = (data && (data.detail || data.message)) || 'Streaming failed.';
      fail(new Error(typeof detail === 'string' ? detail : JSON.stringify(detail)));
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      // Frames are delimited by a blank line. Process each complete one.
      let sep: number;
      while ((sep = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        dispatch(frame);
      }
    }
    // Flush any trailing frame not terminated by a blank line.
    buffer += decoder.decode();
    if (buffer.trim()) dispatch(buffer);
  } catch (err: any) {
    if (handlers.signal?.aborted) return;
    fail(err instanceof Error ? err : new Error('Streaming interrupted.'));
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // reader may already be released
    }
  }
}
