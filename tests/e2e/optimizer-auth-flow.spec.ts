import { expect, type Page, type Route, test } from '@playwright/test';

const corsHeaders = {
  'access-control-allow-origin': 'http://127.0.0.1:3000',
  'access-control-allow-credentials': 'true',
  'access-control-allow-headers': 'authorization, content-type',
  'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS',
};

const userProfile = {
  id: 'user-e2e-1',
  email: 'demo@example.com',
  display_name: 'Demo User',
  plan: 'free',
  avatar_url: null,
  role: 'user',
  onboarding_completed: true,
};

async function fulfillJson(route: Route, json: unknown) {
  if (route.request().method() === 'OPTIONS') {
    await route.fulfill({ status: 204, headers: corsHeaders });
    return;
  }

  await route.fulfill({
    headers: corsHeaders,
    json,
  });
}

async function mockBackend(page: Page) {
  await page.route('**/api/v1/profile/me', async route => {
    await fulfillJson(route, userProfile);
  });

  await page.route('**/api/v1/styles', async route => {
    await fulfillJson(route, []);
  });

  await page.route('**/api/v1/auth/login', async route => {
    await fulfillJson(route, {
      access_token: 'e2e-access-token',
      token_type: 'bearer',
    });
  });

  await page.route('**/api/v1/prompts/e2e-prompt-1/versions', async route => {
    await fulfillJson(route, {
      data: [
        {
          id: 'version-e2e-1',
          prompt_id: 'e2e-prompt-1',
          version_number: 1,
          content: 'Optimized prompt for the e2e flow.',
        },
      ],
    });
  });

  await page.route('**/api/v1/prompts/e2e-prompt-1', async route => {
    await fulfillJson(route, {
      data: {
        id: 'e2e-prompt-1',
        original_prompt: 'Write a launch announcement for an AI prompt app.',
        old_analysis: {
          overall_score: 52,
          grade: 'C',
          dimensions: {},
        },
        new_analysis: {
          overall_score: 91,
          grade: 'A',
          dimensions: {},
        },
        current_version: {
          version_number: 1,
          content: 'Optimized prompt for the e2e flow.',
          old_analysis: {
            overall_score: 52,
            grade: 'C',
            dimensions: {},
          },
          new_analysis: {
            overall_score: 91,
            grade: 'A',
            dimensions: {},
          },
        },
      },
    });
  });

  await page.route('**/api/v1/enhance/stream', async route => {
    const body = [
      'event: meta',
      'data: {"detected_level":"standard","level_reason":"A clear marketing task benefits from structured launch messaging."}',
      '',
      'event: token',
      'data: {"text":"Optimized prompt for the e2e flow."}',
      '',
      'event: done',
      'data: {"original_prompt":"Write a launch announcement for an AI prompt app.","enhanced_prompt":"Optimized prompt for the e2e flow.","version":{"prompt_id":"e2e-prompt-1","version_number":1},"detected_level":"standard","level_reason":"A clear marketing task benefits from structured launch messaging."}',
      '',
      '',
    ].join('\n');

    await route.fulfill({
      status: 200,
      headers: {
        ...corsHeaders,
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-cache',
      },
      body,
    });
  });
}

test('signs in and optimizes a prompt with mocked backend responses', async ({ page }) => {
  await mockBackend(page);

  await page.goto('/auth');
  await page.getByPlaceholder('name@company.com').fill('demo@example.com');
  await page.getByPlaceholder('••••••••').first().fill('correct-horse-battery-staple');
  await page.locator('form').getByRole('button', { name: /^Sign In$/ }).click();

  await expect(page).toHaveURL(/\/dashboard\/optimizer/);
  await page.getByPlaceholder('Paste or write below...').fill('Write a launch announcement for an AI prompt app.');
  await page.getByRole('button', { name: /^Optimize$/ }).click();

  await expect(page.getByRole('heading', { name: 'Optimized Prompt' })).toBeVisible();
  await expect(page.getByRole('main')).toContainText('Optimized prompt for the e2e flow.');
});
