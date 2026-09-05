/**
 * Pay Next's per-route compile cost once, before any test's clock is running.
 *
 * `next dev` compiles a route the first time it is requested. On this host that
 * is several seconds per route, and it lands inside whichever test happens to
 * visit the route first — so that test fails on a 15s action timeout while the
 * other nine pass, and which test loses is decided by scheduling. Two
 * consecutive runs failed on two *different* tests, both with
 * `locator.click: Timeout ... waiting for ...`, which is the signature of the
 * page still compiling rather than of a broken selector.
 *
 * Requesting each route here moves that cost outside the test timeouts. This is
 * warm-up only: it asserts nothing, and a route that 404s or redirects is fine —
 * the point is that the compiler has run.
 *
 * The server is polled rather than assumed: Playwright's ordering of `webServer`
 * against `globalSetup` is not something this file should depend on, and locally
 * `reuseExistingServer` may mean it was already up before this ran.
 */
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

/** Every route the mocked specs navigate to. Keep in step with `page.goto` calls. */
const ROUTES = ['/', '/auth', '/dashboard', '/dashboard/optimizer'];

/** Matches webServer.timeout in playwright.config.ts. */
const SERVER_TIMEOUT_MS = 180_000;

async function waitForServer(): Promise<void> {
  const deadline = Date.now() + SERVER_TIMEOUT_MS;
  let lastError: unknown = null;

  while (Date.now() < deadline) {
    try {
      await fetch(BASE_URL, { signal: AbortSignal.timeout(10_000) });
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  }

  throw new Error(
    `dev server at ${BASE_URL} did not respond within ${SERVER_TIMEOUT_MS}ms: ${String(lastError)}`,
  );
}

export default async function globalSetup(): Promise<void> {
  await waitForServer();

  for (const route of ROUTES) {
    const startedAt = Date.now();
    try {
      // Sequential on purpose: parallel first-compiles of different routes
      // contend badly, which is the same reason workers is 1 locally.
      const response = await fetch(`${BASE_URL}${route}`, {
        signal: AbortSignal.timeout(120_000),
      });
      console.log(`  warmed ${route} -> ${response.status} in ${Date.now() - startedAt}ms`);
    } catch (error) {
      // Never fail the suite here. A route that cannot be warmed will simply be
      // compiled by the first test that visits it — the old behaviour.
      console.warn(`  warming ${route} failed after ${Date.now() - startedAt}ms: ${String(error)}`);
    }
  }
}
