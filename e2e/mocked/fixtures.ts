import { test as base, type Page, type Route } from '@playwright/test';

/**
 * Mocked-mode API harness. Every `**​/api/v1/**` call is fulfilled locally, so
 * the specs never touch a backend. Handlers registered later win (Playwright
 * checks routes most-recently-registered first), so a spec can override the
 * baseline just by calling `api.json(...)` after setup.
 */

export const TEST_PROFILE = {
  id: 'user-1',
  email: 'test@promptiq.test',
  display_name: 'Test User',
  plan: 'free',
  avatar_url: null,
  role: 'developer',
  onboarding_completed: true,
};

type Responder = (route: Route) => unknown | Promise<unknown>;

class ApiMock {
  constructor(private readonly page: Page) {}

  /** Match a v1 path suffix (exact pathname end) for a given method. */
  private glob(pathSuffix: string) {
    return `**/api/v1${pathSuffix}`;
  }

  /** Fulfill a route with JSON. `pathSuffix` is everything after `/api/v1`. */
  async json(
    method: string,
    pathSuffix: string,
    body: unknown,
    status = 200,
  ) {
    await this.page.route(this.glob(pathSuffix), async (route) => {
      if (route.request().method() !== method.toUpperCase()) {
        return route.fallback();
      }
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    });
  }

  /** Fulfill a route with a dynamic responder (inspect request, count calls). */
  async handle(method: string, pathSuffix: string, responder: Responder) {
    await this.page.route(this.glob(pathSuffix), async (route) => {
      if (route.request().method() !== method.toUpperCase()) {
        return route.fallback();
      }
      await responder(route);
    });
  }

  /**
   * Fulfill a POST with a synthesized SSE body. `frames` are joined verbatim,
   * so callers control the exact bytes (frame ordering, split `data:` lines,
   * comments) the client's stream parser sees.
   */
  async sse(pathSuffix: string, frames: string[]) {
    await this.page.route(this.glob(pathSuffix), async (route) => {
      if (route.request().method() !== 'POST') return route.fallback();
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: frames.join(''),
      });
    });
  }
}

export const sseFrame = (event: string, data: unknown) =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
export const sseComment = () => `: keep-alive\n\n`;

type Fixtures = {
  api: ApiMock;
  /** Registers the baseline world, then returns the mock so specs can override. */
  authed: ApiMock;
  loggedOut: ApiMock;
};

export const test = base.extend<Fixtures>({
  api: async ({ page }, use) => {
    await use(new ApiMock(page));
  },
  /** Authenticated baseline: /profile/me resolves, /styles empty, logout ok. */
  authed: async ({ page }, use) => {
    const api = new ApiMock(page);
    // Baseline catch-all first (lowest precedence): anything not overridden 404s
    // as JSON, which keeps unexpected calls visible without hanging the page.
    await page.route('**/api/v1/**', (route) =>
      route.fulfill({ status: 404, contentType: 'application/json', body: '{"detail":"unmocked"}' }),
    );
    await api.json('GET', '/profile/me', TEST_PROFILE);
    await api.json('GET', '/styles', []);
    await api.json('POST', '/auth/logout', { success: true });
    await use(api);
  },
  /** Logged-out baseline: the profile probe 401s, so AuthGuard redirects. */
  loggedOut: async ({ page }, use) => {
    const api = new ApiMock(page);
    await page.route('**/api/v1/**', (route) =>
      route.fulfill({ status: 404, contentType: 'application/json', body: '{"detail":"unmocked"}' }),
    );
    await api.json('GET', '/profile/me', { detail: 'Not authenticated' }, 401);
    await api.json('GET', '/styles', { detail: 'Not authenticated' }, 401);
    await use(api);
  },
});

export { expect } from '@playwright/test';
