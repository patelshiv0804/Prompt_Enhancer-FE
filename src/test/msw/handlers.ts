import { http, HttpResponse } from 'msw';

/**
 * All handlers match ABSOLUTE URLs against the API origin, because apiClient
 * builds `${NEXT_PUBLIC_API_URL}${path}` (see src/utils/apiClient.ts) and never
 * uses the relative `/api/:path*` rewrite. The origin is pinned to
 * http://localhost:8000 by vitest.config's `env`.
 */
export const API = 'http://localhost:8000';
export const api = (path: string) => `${API}${path}`;

export const TEST_PROFILE = {
  id: 'user-1',
  email: 'test@promptiq.test',
  display_name: 'Test User',
  plan: 'free',
  avatar_url: null,
  role: 'developer',
  onboarding_completed: true,
};

/** Baseline handlers. Individual tests override with `server.use(...)`. */
export const handlers = [
  http.get(api('/api/v1/profile/me'), () => HttpResponse.json(TEST_PROFILE)),
  http.get(api('/api/v1/styles'), () => HttpResponse.json([])),
  http.post(api('/api/v1/auth/logout'), () => HttpResponse.json({ success: true })),
];
