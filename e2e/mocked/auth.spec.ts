import { test, expect } from './fixtures';

/**
 * Auth page: client-side validation, a successful login → dashboard redirect,
 * and a failed login that surfaces an error and stays on /auth. The backend is
 * entirely mocked, so these assert the frontend's own flow, not real auth.
 *
 * Note: "Sign In" is ambiguous on this page (a tab button and the form's submit
 * both carry that label), so specs target the form submit via type=submit.
 */

const submit = (page: import('@playwright/test').Page) =>
  page.locator('form button[type="submit"]');

test.describe('auth page', () => {
  test('empty submit is blocked by native validation (no login call, no navigation)', async ({ page, loggedOut }) => {
    let loginCalled = false;
    await loggedOut.handle('POST', '/auth/login', async (route) => {
      loginCalled = true;
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"access_token":"x"}' });
    });

    await page.goto('/auth');
    await submit(page).click();

    // The required email input blocks the submit; we never leave /auth and the
    // login endpoint is never hit.
    expect(new URL(page.url()).pathname).toBe('/auth');
    const emailInvalid = await page
      .locator('input[type="email"]')
      .first()
      .evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(emailInvalid).toBe(true);
    expect(loginCalled).toBe(false);
  });

  test('a successful login redirects to the optimizer', async ({ page, authed }) => {
    let sentBody = '';
    await authed.handle('POST', '/auth/login', async (route) => {
      sentBody = route.request().postData() ?? '';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access_token: 'test-token' }),
      });
    });

    await page.goto('/auth');
    await page.locator('input[type="email"]').first().fill('test@promptiq.test');
    await page.locator('input[type="password"]').first().fill('TestPassword123!');
    await submit(page).click();

    await page.waitForURL('**/dashboard/optimizer', { timeout: 20_000 });
    // The optimizer prompt editor is present, confirming the guarded route rendered.
    await expect(page.getByPlaceholder('Paste or write below...')).toBeVisible();
    // Login went out as form-encoded credentials (OAuth2 password grant shape).
    expect(sentBody).toContain('username=test%40promptiq.test');
    expect(sentBody).toContain('password=TestPassword123');
  });

  test('a failed login surfaces an error and stays on /auth', async ({ page, loggedOut }) => {
    await loggedOut.json('POST', '/auth/login', { detail: 'Invalid credentials' }, 401);

    await page.goto('/auth');
    await page.locator('input[type="email"]').first().fill('nobody@promptiq.test');
    await page.locator('input[type="password"]').first().fill('wrong-password');
    await submit(page).click();

    // No redirect: the guarded dashboard is never reached.
    await expect(page.getByPlaceholder('Paste or write below...')).toHaveCount(0);
    expect(new URL(page.url()).pathname).toBe('/auth');
    // The submit control returns to its idle label once the failure settles.
    await expect(submit(page)).toBeVisible();
  });
});
