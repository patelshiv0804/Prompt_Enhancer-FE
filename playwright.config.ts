import { defineConfig, devices } from '@playwright/test';

/**
 * Three projects, one dev server.
 *
 * - `mocked`      (e2e/mocked): every `**​/api/v1/**` request is fulfilled by
 *   `page.route` inside the test, so no backend, DB or LLM is touched. Runs on
 *   every PR; deterministic. The dev server's NEXT_PUBLIC_API_URL is irrelevant
 *   here because the route glob intercepts the call whatever origin it targets.
 *
 * - `live-setup`  (e2e/live/*.setup.ts): logs in once against the real backend
 *   and saves the browser state to playwright/.auth/live.json. A dependency of
 *   `live`, so selecting `live` runs it automatically and selecting `mocked`
 *   does not.
 *
 * - `live`        (e2e/live, minus the setup file): drives the real Next dev
 *   server against the real docker backend on the *test* database. Every test
 *   starts from the saved storageState, so the suite spends exactly one login
 *   against a limiter that allows five per minute and cannot be raised.
 *
 * Project selection is by `--project`, not by an environment variable:
 *   npm run test:e2e        → --project=mocked
 *   npm run test:e2e:live   → --project=live  (pulls in live-setup)
 * A bare `playwright test` runs all three and the live ones will fail without
 * the backend up, which is why both scripts name a project explicitly.
 *
 * Before running `live`, from the backend repo:
 *   bash scripts/bootstrap_test_db.sh
 *   docker compose -f docker-compose.yml -f docker-compose.e2e.yml up -d web
 * and afterwards put the dev stack back:
 *   docker compose -f docker-compose.yml up -d web
 */

/** Where the browser should reach the API. Must be same-site with baseURL. */
const API_URL = process.env.PLAYWRIGHT_API_URL || 'http://localhost:8000';

/** Session captured by live-setup and replayed by every live spec. */
const LIVE_STORAGE_STATE = 'playwright/.auth/live.json';

export default defineConfig({
  testDir: './e2e',
  // Requests every route once before the suite starts, so `next dev`'s per-route
  // first-compile is not charged to whichever test happens to arrive first. See
  // the file for the failure signature this removes.
  globalSetup: './e2e/global-setup.ts',
  // Windows dev-server startup + first compile is slow; give each test room.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // One retry everywhere. Warming the routes removed the flake this suite had,
  // but a single retry keeps a scheduling hiccup on a loaded machine from
  // reporting as a code failure — locally too, where a red run is otherwise
  // indistinguishable from a real break.
  retries: 1,
  // Serialize workers locally: one Next dev server, and parallel first-compiles
  // of different routes contend badly on this host.
  workers: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    // The app probes /profile/me on every mount; without a fast failure the
    // unauthenticated landing/auth pages would hang on a real network attempt.
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: 'mocked',
      testDir: './e2e/mocked',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'live-setup',
      testDir: './e2e/live',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'live',
      testDir: './e2e/live',
      // The setup file belongs to live-setup; without this it would also run
      // here, spending a second login out of a budget of five.
      testIgnore: /.*\.setup\.ts/,
      dependencies: ['live-setup'],
      use: { ...devices['Desktop Chrome'], storageState: LIVE_STORAGE_STATE },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe',
    // NEXT_PUBLIC_API_URL must be same-site with baseURL for the auth cookie to
    // be stored and sent: it is SameSite=lax in development (see
    // app/core/config.py cookie_samesite), and localhost:3000 → 127.0.0.1:8000
    // is cross-site, so the default apiClient origin would silently drop it and
    // leave auth riding on the localStorage bearer token alone.
    //
    // reuseExistingServer means a dev server you started yourself will NOT have
    // this set. e2e/live/auth.setup.ts asserts the origin the login actually
    // went to and fails with that explanation rather than a confusing cookie
    // assertion further down.
    env: { NEXT_PUBLIC_API_URL: API_URL },
  },
});
