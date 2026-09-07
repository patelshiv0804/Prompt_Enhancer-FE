import { test as setup, expect } from '@playwright/test';

import {
  API_URL,
  AUTH_COOKIE,
  LIVE_EMAIL,
  LIVE_PASSWORD,
  LIVE_STORAGE_STATE,
  explainIfRateLimited,
} from './fixtures';

/**
 * The suite's one and only login.
 *
 * POST /auth/login is guarded by `sensitive_rate_limiter`, a hardcoded
 * RateLimiter(max_requests=5, window_seconds=60) attached unconditionally at
 * app/api/v1/auth.py:74. No environment variable raises it, so a live suite that
 * logged in per test would rate-limit itself into red after the fifth spec. This
 * project logs in once through the real form and saves the browser state; the
 * `live` project replays it, and only auth.spec.ts spends a second slot (on a
 * deliberate failure).
 *
 * It is also a real assertion, not just plumbing: a successful login here proves
 * the form posts an OAuth2 password grant the backend accepts, that the backend
 * sets its httpOnly cookie, and — because test@promptiq.test exists only in
 * prompt_enhancer_test — that the API is on the test database and not on dev.
 */

setup('log in once and save the session', async ({ page }) => {
  await page.goto('/auth');

  // Wait for the form to become *interactive* before timing anything else. The
  // email input is `disabled={isBusy}` and isBusy starts true (AuthContext's
  // `loading` initialises to true and only clears once its /profile/me probe
  // settles), so an enabled input proves three things at once: the route's
  // client bundle finished compiling, React hydrated, and the auth probe
  // returned. Under `next dev --webpack` that first compile can take tens of
  // seconds, and folding it into the response timeout below is what made this
  // setup flaky — the 30s budget was spent waiting for the page, not the API.
  const emailInput = page.locator('input[type="email"]').first();
  await expect(emailInput).toBeEnabled({ timeout: 120_000 });

  // Registered after the page is interactive but before the click, so the
  // response cannot be missed. Matching on the path only, because the whole
  // point of the origin check below is that the app might be talking to
  // somewhere we did not expect.
  const loginResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/auth/login') && response.request().method() === 'POST',
    { timeout: 60_000 },
  );

  await emailInput.fill(LIVE_EMAIL);
  await page.locator('input[type="password"]').first().fill(LIVE_PASSWORD);
  // "Sign In" is ambiguous on this page — a tab button and the form's submit
  // both carry that label — so target the submit by type.
  await page.locator('form button[type="submit"]').click();

  const response = await loginResponse;
  explainIfRateLimited(response.status(), 'the setup login');

  // If the dev server was started without NEXT_PUBLIC_API_URL (reuseExistingServer
  // is on locally), the app talks to apiClient's 127.0.0.1 default, which is
  // cross-site with localhost:3000 and silently drops the SameSite=lax auth
  // cookie. Say so here rather than letting the cookie assertion below fail.
  const actualOrigin = new URL(response.url()).origin;
  expect(
    actualOrigin,
    `The app posted its login to ${actualOrigin} but this suite expects ${API_URL}. ` +
      'Stop any dev server you started by hand and let Playwright start its own ' +
      '(it sets NEXT_PUBLIC_API_URL), or set PLAYWRIGHT_API_URL to match yours. ' +
      'The origins must be same-site with baseURL or the auth cookie is dropped.',
  ).toBe(API_URL);

  expect(
    response.status(),
    `Login as ${LIVE_EMAIL} failed. Has scripts/bootstrap_test_db.sh run, and is ` +
      'web up under docker-compose.e2e.yml? Switching profiles needs `up -d web`, ' +
      'not just a restart.',
  ).toBe(200);

  // The redirect is driven by the app itself (router.replace in AuthContext's
  // finalizeAuthentication), so reaching the optimizer proves the whole
  // post-login sequence ran: /profile/me and /styles both resolved against the
  // real backend and AuthGuard let the route render.
  await page.waitForURL('**/dashboard/optimizer', { timeout: 30_000 });
  await expect(page.getByPlaceholder('Paste or write below...')).toBeVisible();

  // The backend's httpOnly cookie really landed. This is the assertion that
  // silently regresses if the API origin is cross-site, hence the check above.
  const cookies = await page.context().cookies();
  const authCookie = cookies.find((cookie) => cookie.name === AUTH_COOKIE);
  expect(authCookie, `no ${AUTH_COOKIE} cookie was set by the login response`).toBeDefined();
  expect(authCookie!.httpOnly).toBe(true);

  await page.context().storageState({ path: LIVE_STORAGE_STATE });
});
