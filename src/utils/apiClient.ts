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
