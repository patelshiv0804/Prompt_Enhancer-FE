import { expect, test } from '@playwright/test';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const LIVE_EMAIL = process.env.E2E_LIVE_EMAIL || 'loadtest@example.com';
const LIVE_PASSWORD = process.env.E2E_LIVE_PASSWORD || 'LoadTestPassword123!';
const LIVE_PROMPT =
  process.env.E2E_LIVE_PROMPT ||
  'Write a concise product announcement for an AI prompt optimization app.';

test.skip(
  process.env.PLAYWRIGHT_LIVE_STUB !== 'true',
  'Set PLAYWRIGHT_LIVE_STUB=true with a running backend to exercise the live-stub flow.'
);

test('signs in against a running backend and optimizes a prompt', async ({ page, request }) => {
  const liveness = await request.get(`${API_URL}/api/health/liveness`);
  expect(liveness.ok()).toBeTruthy();

  await request.post(`${API_URL}/api/v1/auth/register`, {
    data: {
      email: LIVE_EMAIL,
      password: LIVE_PASSWORD,
      display_name: 'Live E2E User',
    },
    failOnStatusCode: false,
  });

  await page.goto('/auth');
  await page.getByPlaceholder('name@company.com').fill(LIVE_EMAIL);
  await page.getByPlaceholder('••••••••').first().fill(LIVE_PASSWORD);
  await page.locator('form').getByRole('button', { name: /^Sign In$/ }).click();

  await expect(page).toHaveURL(/\/dashboard\/optimizer/);
  await page.getByPlaceholder('Paste or write below...').fill(LIVE_PROMPT);
  await page.getByRole('button', { name: /^Optimize$/ }).click();

  await expect(page.getByRole('heading', { name: 'Optimized Prompt' })).toBeVisible({
    timeout: 60_000,
  });
});
