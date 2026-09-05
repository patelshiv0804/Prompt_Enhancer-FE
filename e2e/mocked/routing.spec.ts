import { test, expect } from './fixtures';

/**
 * Routing + auth guards in mocked mode. These assert the redirect behaviour the
 * AuthProvider/AuthGuard pair implements, with the /profile/me probe stubbed to
 * decide the logged-in/out world.
 */

test.describe('routing and guards', () => {
  test('unauthenticated visit to a dashboard route redirects to /auth', async ({ page, loggedOut }) => {
    await page.goto('/dashboard/optimizer');
    // AuthGuard pushes /auth once loading settles and no user is present.
    await page.waitForURL('**/auth', { timeout: 20_000 });
    expect(new URL(page.url()).pathname).toBe('/auth');
  });

  test('the landing page renders for a logged-out visitor and does not redirect', async ({ page, loggedOut }) => {
    await page.goto('/');
    // The profile probe 401s but the landing page only clears state — it stays put.
    await expect(page).toHaveURL(/\/$|\/$/);
    // The navbar "Log in" affordance is present.
    await expect(page.getByRole('link', { name: /log in/i }).first()).toBeVisible();
  });

  test('the navbar Log in link routes to /auth', async ({ page, loggedOut }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /log in/i }).first().click();
    await page.waitForURL('**/auth');
    expect(new URL(page.url()).pathname).toBe('/auth');
  });

  test('an authenticated user reaching /dashboard is sent to the optimizer', async ({ page, authed }) => {
    await page.goto('/dashboard');
    // /dashboard redirects to /dashboard/optimizer; the guard lets an authed user through.
    await page.waitForURL('**/dashboard/optimizer', { timeout: 20_000 });
    expect(new URL(page.url()).pathname).toBe('/dashboard/optimizer');
  });
});
