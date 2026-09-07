import { expect, test as base, type APIRequestContext, type Page } from '@playwright/test';

/**
 * Shared ground for the `live` project: real Next dev server, real FastAPI
 * backend, real Postgres (the *test* clone), real Mistral.
 *
 * Nothing here mocks anything. The one piece of scaffolding is `apiFromPage`,
 * which issues a request from inside the page so that CORS, the auth cookie and
 * the bearer header are all exercised exactly as the application exercises them
 * — a request made from Node would prove nothing about the browser's rules.
 */

/**
 * Must stay same-site with playwright.config.ts's baseURL, and must match the
 * NEXT_PUBLIC_API_URL the dev server was started with. auth.setup.ts checks
 * that the running app agrees with this value.
 */
export const API_URL = process.env.PLAYWRIGHT_API_URL || 'http://localhost:8000';

/**
 * The account scripts/bootstrap_test_db.sh guarantees in prompt_enhancer_test.
 * It exists in that database and nowhere else, so a successful login is itself
 * evidence the backend is on the test database rather than on dev.
 */
export const LIVE_EMAIL = process.env.PLAYWRIGHT_EMAIL || 'test@promptiq.test';
export const LIVE_PASSWORD = process.env.PLAYWRIGHT_PASSWORD || 'TestPassword123!';

/** Written by live-setup, replayed by every live spec. Gitignored. */
export const LIVE_STORAGE_STATE = 'playwright/.auth/live.json';

/** Name of the httpOnly auth cookie (app/core/config.py access_cookie_name). */
export const AUTH_COOKIE = 'promptiq_access_token';

export type ApiResult<T = unknown> = {
  status: number;
  ok: boolean;
  body: T;
};

/**
 * Call the API from the page's JavaScript context, the way apiClient does:
 * `credentials: 'include'` for the httpOnly cookie plus the localStorage bearer
 * token as a fallback (see src/utils/apiClient.ts).
 *
 * Returns the parsed body rather than throwing on a non-2xx, so specs can
 * assert on error statuses too.
 */
export async function apiFromPage<T = unknown>(
  page: Page,
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<ApiResult<T>> {
  return page.evaluate(
    async ([base, requestPath, method, rawBody]) => {
      const token =
        localStorage.getItem('token') || localStorage.getItem('promptiq_access_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${base}${requestPath}`, {
        method: method as string,
        headers,
        credentials: 'include',
        body: rawBody === null ? undefined : (rawBody as string),
      });

      let parsed: unknown = null;
      const text = await response.text();
      if (text) {
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = text;
        }
      }
      return { status: response.status, ok: response.ok, body: parsed };
    },
    [
      API_URL,
      path,
      init.method ?? 'GET',
      init.body === undefined ? null : JSON.stringify(init.body),
    ] as const,
  ) as Promise<ApiResult<T>>;
}

/** The bearer token the app stored at login, or null if there is no session. */
export function storedToken(page: Page): Promise<string | null> {
  return page.evaluate(
    () => localStorage.getItem('token') || localStorage.getItem('promptiq_access_token'),
  );
}

/**
 * Fail with an explanation instead of a bare assertion when the login limiter
 * has been spent. `sensitive_rate_limiter` is hardcoded 5 requests / 60s at
 * app/middleware/rate_limit.py:112 and no environment variable raises it, so a
 * few rapid re-runs of a login-touching spec will produce 429s that look
 * nothing like the bug you were chasing.
 */
export function explainIfRateLimited(status: number, context: string): void {
  if (status === 429) {
    throw new Error(
      `${context} was rate-limited (429). POST /auth/login allows 5 requests per ` +
        '60s per (path, IP) and that budget is hardcoded — the e2e compose ' +
        'overlay cannot raise it. Wait 60 seconds and re-run. This is also why ' +
        'the suite logs in once in auth.setup.ts and replays storageState.',
    );
  }
}

export const test = base;
export { expect };

/**
 * Ask the backend whether its LLM provider is reachable, using the backend's own
 * probe: GET /api/v1/health runs `MistralProvider.health_check()`, a 1-token
 * completion, and reports `llm_provider: "healthy" | "unhealthy"`
 * (app/api/v1/health.py:43-49). Public, unauthenticated, and it answered in
 * under a second here — no retry storm on this path.
 *
 * Note the path has NO trailing slash: `/api/v1/health/` answers 307.
 *
 * This exists so that a spec which genuinely needs the paid provider can say
 * "the provider is down" instead of failing somewhere downstream and implicating
 * the application. Mistral answers 429 with `x-ratelimit-limit-req-minute: 0`
 * once an account's allowance is spent, and the app's sanitised error responses
 * deliberately do not leak that — so the browser cannot tell a dead provider
 * from a broken app, but this endpoint can.
 */
export async function llmProviderHealth(request: APIRequestContext): Promise<string> {
  const response = await request.get(`${API_URL}/api/v1/health`);
  if (!response.ok()) {
    throw new Error(
      `GET /api/v1/health answered ${response.status()}, so the provider's state ` +
        'is unknown. Is `web` up under docker-compose.e2e.yml?',
    );
  }
  const body = (await response.json()) as { llm_provider?: string };
  return body.llm_provider ?? 'unknown';
}

