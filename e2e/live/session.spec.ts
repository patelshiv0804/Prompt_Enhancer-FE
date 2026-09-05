import { test, expect, apiFromPage, storedToken, AUTH_COOKIE, LIVE_EMAIL } from './fixtures';

/**
 * The saved session, replayed. Every test in the `live` project starts from
 * playwright/.auth/live.json, so this file is really asking: is that state
 * sufficient to be logged in, against a backend that was never told about it?
 *
 * Deliberately asserts identity through the API rather than through rendered
 * text. The dashboard's chrome is free to change; "the session resolves to the
 * account we logged in as" is the invariant.
 */

test.describe('live session', () => {
  test('the guarded optimizer route renders without a fresh login', async ({ page }) => {
    await page.goto('/dashboard/optimizer');
    // AuthGuard only lets this through once /profile/me has resolved 200.
    await expect(page.getByPlaceholder('Paste or write below...')).toBeVisible({
      timeout: 30_000,
    });
    expect(new URL(page.url()).pathname).toBe('/dashboard/optimizer');
  });

  test('/dashboard redirects an authenticated user to the optimizer', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/dashboard/optimizer', { timeout: 30_000 });
    await expect(page.getByPlaceholder('Paste or write below...')).toBeVisible();
  });

  test('the restored state carries both the cookie and the bearer token', async ({ page }) => {
    await page.goto('/dashboard/optimizer');

    const cookies = await page.context().cookies();
    const authCookie = cookies.find((cookie) => cookie.name === AUTH_COOKIE);
    expect(authCookie, `${AUTH_COOKIE} was not restored from storageState`).toBeDefined();

    // AuthContext.login writes the token to localStorage under two keys
    // (src/context/AuthContext.tsx), and apiClient prefers it over the cookie.
    // storageState persists localStorage per origin, so it should survive too.
    expect(await storedToken(page)).toBeTruthy();
  });

  test('the session resolves to the account that logged in', async ({ page }) => {
    await page.goto('/dashboard/optimizer');

    const profile = await apiFromPage<{ id: string; email: string }>(
      page,
      '/api/v1/profile/me',
    );
    expect(profile.status).toBe(200);
    expect(profile.body.email).toBe(LIVE_EMAIL);
    expect(profile.body.id).toBeTruthy();
  });

  test('logging out clears the session and a protected route stops resolving', async ({
    page,
  }) => {
    await page.goto('/dashboard/optimizer');
    await expect(page.getByPlaceholder('Paste or write below...')).toBeVisible({
      timeout: 30_000,
    });

    const logoutResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/auth/logout') && response.request().method() === 'POST',
      { timeout: 30_000 },
    );

    // Logging out is two steps, not one. The sidebar footer control only opens a
    // confirmation modal (Sidebar.tsx:1008); logout() itself is called by the
    // modal's confirm button (Sidebar.tsx:1155). Their accessible names differ
    // only in case — "Log out" on the icon, "Log Out" in the modal — so both
    // locators are exact and case-sensitive: a relabel fails loudly here instead
    // of silently clicking the wrong control.
    await page.getByRole('button', { name: 'Log out', exact: true }).click();
    await expect(page.getByText('Confirm Logout')).toBeVisible();
    await page.getByRole('button', { name: 'Log Out', exact: true }).click();

    expect((await logoutResponse).status()).toBeLessThan(400);

    // AuthContext.logout removes both localStorage keys and pushes to '/'.
    await page.waitForURL((url) => !url.pathname.startsWith('/dashboard'), { timeout: 30_000 });
    expect(await storedToken(page)).toBeNull();

    // And the backend really cleared its cookie, so the API refuses us again.
    const afterLogout = await apiFromPage(page, '/api/v1/profile/me');
    expect(afterLogout.status).toBe(401);
  });
});
