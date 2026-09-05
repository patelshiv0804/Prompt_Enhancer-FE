import { test, expect, apiFromPage, explainIfRateLimited, API_URL, LIVE_EMAIL } from './fixtures';

/**
 * Real authentication against the real backend, from a deliberately empty
 * browser state.
 *
 * The success path is not repeated here — auth.setup.ts already drives it, and
 * every login costs one of five per minute from a limiter that cannot be raised.
 * What this file covers is the half the setup cannot: a genuine credential
 * rejection, and what the app does with no session at all.
 */

// Empty state, not the saved session: these tests are about being logged out.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('live auth', () => {
  test('KNOWN DEFECT: a wrong password is rejected, but the browser cannot read the rejection', async ({
    page,
    request,
  }) => {
    /**
     * KNOWN DEFECT — failed-login responses carry no CORS headers, so the
     * browser discards them and the app can never show "invalid credentials".
     *
     * app/main.py:256 registers `http_error_handler` for bare `Exception`.
     * Starlette installs an `Exception` handler on ServerErrorMiddleware, which
     * is the OUTERMOST layer — outside CORSMiddleware. `AuthService.login`
     * raises `UnauthorizedException` (app/services/auth_service.py:108), a
     * custom class rather than an HTTPException, so it escapes the inner
     * ExceptionMiddleware, is converted to a 401 at the outermost layer, and
     * that response never passes back through the CORS layer.
     *
     * Confirmed out of band, same origin header on both requests:
     *   POST /auth/login   wrong password -> 401, NO access-control-allow-origin
     *   GET  /profile/me   no session     -> 401, access-control-allow-origin present
     * The second raises a real HTTPException, so it keeps its CORS headers.
     *
     * The blast radius is every typed exception in app/core/exceptions.py:
     * UnauthorizedException, NotFoundException, AlreadyExistsException,
     * InvalidOTPException and the sanitised 500. In the browser all of them
     * surface as `TypeError: Failed to fetch` with no status and no detail.
     *
     * This test pins the current behaviour. It is not a request to change the
     * application.
     */

    // 1. The backend's own verdict, read from Node. Playwright's request context
    //    is not a browser, so CORS does not apply and the real response is
    //    visible — this is the security invariant, and it holds.
    const direct = await request.post(`${API_URL}/api/v1/auth/login`, {
      form: { username: LIVE_EMAIL, password: 'definitely-not-the-password' },
    });
    explainIfRateLimited(direct.status(), 'the out-of-band wrong-password login');
    // 401 from AuthService, not a 500 and not a redirect. Worth pinning: the
    // service has no lockout or failed-attempt counter, so a rejection is the
    // only thing standing between a wrong password and a session.
    expect(direct.status()).toBe(401);
    expect(await direct.json()).toHaveProperty('detail');

    // 2. The defect itself, from the same response: no CORS headers, which is
    //    what makes it unreadable in a browser. Contrast with contract.spec.ts,
    //    where a 200 and an HTTPException 401 both carry these headers.
    const headers = direct.headers();
    expect(
      headers['access-control-allow-origin'],
      'a CORS header appeared on a failed login — the defect above may be fixed, ' +
        'in which case this test should assert the 401 is readable in the browser',
    ).toBeUndefined();

    // 3. What the user actually gets. The fetch rejects rather than resolving,
    //    so the app never sees a status.
    await page.goto('/auth');
    const emailInput = page.locator('input[type="email"]').first();
    // Interactive, not merely present — see the note in auth.setup.ts.
    await expect(emailInput).toBeEnabled({ timeout: 120_000 });

    const loginFailed = page.waitForEvent('requestfailed', {
      predicate: (request_) => request_.url().includes('/api/v1/auth/login'),
      timeout: 60_000,
    });

    await emailInput.fill(LIVE_EMAIL);
    await page.locator('input[type="password"]').first().fill('definitely-not-the-password');
    await page.locator('form button[type="submit"]').click();

    const failed = await loginFailed;
    // Chrome blocks the response at the CORS check, so the request is reported
    // as failed and no `response` event is ever emitted for it.
    expect(failed.failure()?.errorText ?? '').toMatch(/failed|aborted|cors/i);

    // The guarded route is never reached and the URL does not move.
    await expect(page.getByPlaceholder('Paste or write below...')).toHaveCount(0);
    expect(new URL(page.url()).pathname).toBe('/auth');
    await expect(page.locator('form button[type="submit"]')).toBeVisible();

    // And no session was created, which is the part that matters.
    const profile = await apiFromPage(page, '/api/v1/profile/me');
    expect(profile.status).toBe(401);
  });

  test('the dashboard bounces an unauthenticated visitor to /auth', async ({ page }) => {
    // No login spent: the app probes /profile/me, the real backend 401s, and
    // AuthGuard redirects. This is the one guard behaviour the mocked tier can
    // only approximate, because there it is a fabricated 401.
    await page.goto('/dashboard/optimizer');
    await page.waitForURL('**/auth', { timeout: 30_000 });
    expect(new URL(page.url()).pathname).toBe('/auth');
  });

  test('protected endpoints really 401 without a session', async ({ page }) => {
    // Land somewhere public first so the page has an origin to fetch from.
    await page.goto('/');

    for (const path of ['/api/v1/profile/me', '/api/v1/settings', '/api/v1/prompts/']) {
      const result = await apiFromPage(page, path);
      expect(result.status, `${path} should be 401 with no session`).toBe(401);
    }
  });
});
