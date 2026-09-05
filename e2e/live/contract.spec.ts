import { test, expect, apiFromPage, API_URL } from './fixtures';

/**
 * The mocked tier's blind spot, covered.
 *
 * e2e/mocked/fixtures.ts fabricates every response, so it asserts what the
 * frontend *believes* the API returns. If the backend's shape drifts, that suite
 * stays green while production breaks. This file checks the same shapes against
 * the real API, so the two can disagree out loud.
 *
 * Assertions are on structure, never on values or counts: the test database is a
 * clone of dev and its rows drift.
 */

const PAGINATED_KEYS = ['success', 'data', 'page', 'page_size'] as const;

/** PaginatedResponse from app/schemas/common.py. */
function expectPaginated(body: unknown, label: string) {
  const envelope = body as Record<string, unknown>;
  for (const key of PAGINATED_KEYS) {
    expect(envelope, `${label} is missing "${key}" from the paginated envelope`).toHaveProperty(
      key,
    );
  }
  expect(envelope.success, `${label}.success`).toBe(true);
  expect(Array.isArray(envelope.data), `${label}.data should be an array`).toBe(true);
  expect(typeof envelope.page, `${label}.page should be a number`).toBe('number');
  expect(typeof envelope.page_size, `${label}.page_size should be a number`).toBe('number');
}

test.describe('live API contract', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/optimizer');
    await expect(page.getByPlaceholder('Paste or write below...')).toBeVisible({
      timeout: 30_000,
    });
  });

  test('/profile/me returns every field the frontend reads', async ({ page }) => {
    const result = await apiFromPage<Record<string, unknown>>(page, '/api/v1/profile/me');
    expect(result.status).toBe(200);

    // Mirrors UserProfile in src/context/AuthContext.tsx and the TEST_PROFILE
    // fixture in e2e/mocked/fixtures.ts. Presence only — display_name, role and
    // avatar_url are all legitimately null for a fresh account.
    for (const key of ['id', 'email', 'display_name', 'plan', 'avatar_url']) {
      expect(result.body, `/profile/me is missing "${key}"`).toHaveProperty(key);
    }
    expect(typeof result.body.email).toBe('string');
  });

  test('/styles returns a bare array, not an envelope', async ({ page }) => {
    // AuthContext does `setStyleProfiles(response || [])` and indexes it
    // directly, so an envelope here would break the dashboard silently.
    const result = await apiFromPage<unknown>(page, '/api/v1/styles');
    expect(result.status).toBe(200);
    expect(Array.isArray(result.body)).toBe(true);
  });

  test('/settings resolves for an authenticated user', async ({ page }) => {
    const result = await apiFromPage(page, '/api/v1/settings');
    expect(result.status).toBe(200);
  });

  test('the list endpoints all use the paginated envelope', async ({ page }) => {
    const prompts = await apiFromPage(page, '/api/v1/prompts/?page=1&page_size=5');
    expect(prompts.status).toBe(200);
    expectPaginated(prompts.body, '/prompts/');

    const templates = await apiFromPage(page, '/api/v1/templates/?limit=5');
    expect(templates.status).toBe(200);
    expectPaginated(templates.body, '/templates/');

    const models = await apiFromPage(page, '/api/v1/ai-models/');
    expect(models.status).toBe(200);
    expectPaginated(models.body, '/ai-models/');
  });

  test('the template catalogue is not empty in the test database', async ({ page }) => {
    // An invariant, not a count. If this fails, bootstrap_test_db.sh did not
    // clone the catalogue and every retrieval-dependent spec below is untrustworthy.
    const result = await apiFromPage<{ data: unknown[] }>(page, '/api/v1/templates/?limit=5');
    expect(result.body.data.length).toBeGreaterThan(0);
  });

  test('CORS lets the browser read credentialed responses', async ({ page }) => {
    // Read off the wire rather than from JS: these headers are not exposed to
    // fetch(), and they are exactly what would break a deployed frontend on a
    // different origin. app/core/config.py ships localhost:3000 in cors_origins.
    const responsePromise = page.waitForResponse(
      (response) => response.url() === `${API_URL}/api/v1/profile/me`,
      { timeout: 30_000 },
    );
    await page.reload();
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    const headers = response.headers();
    // A wildcard origin is invalid with credentials, so the backend must echo.
    expect(headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(headers['access-control-allow-credentials']).toBe('true');
  });
});
