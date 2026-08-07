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

  // Attach token if present
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('promptiq_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const mergedHeaders = {
    ...defaultHeaders,
    ...headers,
  };

  const response = await fetch(url, {
    ...restOptions,
    headers: mergedHeaders,
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
