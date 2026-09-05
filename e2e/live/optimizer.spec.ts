import { test, expect, apiFromPage, llmProviderHealth } from './fixtures';

/**
 * One real enhance, through the UI, against the real Mistral API.
 *
 * This is the whole reason the live tier exists. e2e/mocked/optimizer-sse.spec.ts
 * already proves the browser's stream parser handles bytes we synthesized; what
 * it cannot prove is that the backend, the provider credentials, the SSE framing
 * and the persistence write all actually work together. Exactly one test here
 * does that, deliberately: /enhance and /enhance/stream sit behind
 * `llm_rate_limiter` (20 requests / 60s), each call costs real Mistral tokens,
 * and each one takes seconds.
 *
 * Everything is asserted twice over — once through the rendered UI, once through
 * the API — because a rendered panel proves nothing about what was saved, and a
 * saved row proves nothing about what the user saw.
 *
 * Two traps this file has already fallen into, both of which let a completely
 * failed enhance report success:
 *
 *   1. `POST /enhance/stream` answers 200 as soon as the response *headers* are
 *      sent, before the generator runs. When Mistral 429s, the generator yields
 *      `event: error` inside a 200 response, so asserting on the HTTP status
 *      asserts nothing. The status check below is kept only as a fast, readable
 *      failure for pre-stream problems (401, 429 from the app's own limiter).
 *   2. ComparisonBlock renders the optimized panel while `isOptimizing` is true
 *      and unmounts it entirely when the flow ends in failure (showOptimizedPanel
 *      = isOptimizing || isOptimized, :267). So "the heading is visible" holds
 *      mid-flight even when the enhance is doomed, and "the empty state is
 *      absent" holds afterwards *because the whole panel is gone*. Both checks
 *      are therefore only meaningful in the settled state — after the Optimize
 *      button re-enables — and that is where they now live.
 */

const OPTIMIZE_BUTTON = /^optimize$/i;
const EDITOR_PLACEHOLDER = 'Paste or write below...';
/** ComparisonBlock.tsx:788 — the optimized panel's own heading. */
const OPTIMIZED_HEADING = { name: 'Optimized Prompt' } as const;
/** ComparisonBlock.tsx:1045 — shown inside that panel while there is no content. */
const PANEL_EMPTY_STATE = 'Your optimized prompt will appear here';

test.describe('live optimizer', () => {
  // A real LLM round trip plus a cold Next route compile does not fit in the
  // 60s project timeout. Generous on purpose: a slow pass beats a flaky fail.
  test.setTimeout(240_000);

  test('a real enhance renders an optimized prompt and persists it', async ({ page, request }) => {
    // Pre-flight, before a single token is spent: ask the backend whether its
    // provider is reachable at all. A dead provider is an environment fact, not
    // an application defect, and it is the one thing this test cannot work
    // around — so it skips loudly instead of failing and blaming the app.
    const providerHealth = await llmProviderHealth(request);
    test.skip(
      providerHealth !== 'healthy',
      `the backend reports llm_provider: "${providerHealth}" — Mistral is not ` +
        'answering, so a real enhance is impossible. Check the account allowance: ' +
        'a spent Mistral quota returns 429 with x-ratelimit-limit-req-minute: 0 ' +
        'for every request, including a 5-token one.',
    );

    // Unique per run, so the persisted row can be found without assuming
    // anything about the rows the clone brought across.
    const marker = `live-e2e-${Date.now()}`;
    const promptText = `Write release notes for build ${marker} in three short bullets.`;

    // Bodies of every enhance attempt, read as they complete, so that a failure
    // below can say what the backend actually sent instead of leaving the reader
    // to guess. Collected as promises because an SSE body only resolves when the
    // generator finishes.
    const attempts: Array<Promise<string>> = [];
    page.on('response', (response) => {
      if (response.request().method() !== 'POST') return;
      if (!response.url().includes('/api/v1/enhance')) return;
      const label = `POST ${new URL(response.url()).pathname} → ${response.status()}`;
      attempts.push(
        response.text().then(
          (body) => `${label}: ${body.replace(/\s+/g, ' ').slice(0, 400)}`,
          (error) => `${label}: <body unavailable: ${error}>`,
        ),
      );
    });

    await page.goto('/dashboard/optimizer');

    const editor = page.getByPlaceholder(EDITOR_PLACEHOLDER);
    await expect(editor).toBeVisible({ timeout: 30_000 });
    // The right panel does not exist yet: ComparisonBlock only renders it once
    // analysis or optimization has started (showRightPanel, :266-268). So the
    // absence of its heading — not the presence of an empty state — is what
    // "nothing has happened yet" looks like here.
    await expect(page.getByRole('heading', OPTIMIZED_HEADING)).toHaveCount(0);

    // Registered before the click so a fast response cannot be missed. Matches
    // either endpoint: the app tries /enhance/stream first and falls back to the
    // blocking /enhance, and this test cares that *an* enhance succeeded.
    const enhanceResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/enhance') && response.request().method() === 'POST',
      { timeout: 180_000 },
    );

    // fill() replaces the editor's contents. That matters: ComparisonBlock seeds
    // originalText with a hardcoded sample prompt (:214), so the editor is never
    // empty and clicking Optimize without filling would enhance the sample.
    await editor.fill(promptText);
    await expect(editor).toHaveValue(promptText);
    await page.getByRole('button', { name: OPTIMIZE_BUTTON }).click();

    const response = await enhanceResponse;
    // Only catches pre-stream failures — see trap 1 in the file header. A 200
    // here does not mean the enhancement worked.
    expect(
      response.status(),
      `POST ${new URL(response.url()).pathname} failed before streaming. A 429 means ` +
        "the app's own llm_rate_limiter (20/60s) is spent — wait a minute. A 401 " +
        'means the replayed session expired; delete playwright/.auth/live.json.',
    ).toBe(200);

    // Wait for the flow to settle rather than for the panel to appear: the
    // button label flips back from "Optimizing..." once the stream, the blocking
    // fallback (if the stream failed) and the analysis calls have all finished.
    await expect(page.getByRole('button', { name: OPTIMIZE_BUTTON })).toBeEnabled({
      timeout: 180_000,
    });

    // Now the panel's state is a verdict. On success isOptimized is true and the
    // panel holds the enhancement; on failure both flags are false, the panel is
    // unmounted, and this is the assertion that catches it.
    const backendSaid = (await Promise.all(attempts)).join('\n  ') || '<no enhance request>';
    await expect(
      page.getByRole('heading', OPTIMIZED_HEADING),
      `the optimized panel is not on screen after the flow settled, so the enhance ` +
        `failed. What the backend sent:\n  ${backendSaid}`,
    ).toBeVisible();

    // Real content, not the panel's placeholder. This only clears once
    // optimizationResult.enhanced_prompt is non-empty (:1039).
    await expect(page.getByText(PANEL_EMPTY_STATE)).toHaveCount(0);

    // And the write really happened. /prompts/ is ordered created_at DESC
    // (app/repositories/prompt.py:94), so the new row is on the first page.
    const prompts = await apiFromPage<{
      data: Array<{
        id: string;
        original_prompt: string | null;
        current_version: { content: string | null } | null;
      }>;
    }>(page, '/api/v1/prompts/?page=1&page_size=20');
    expect(prompts.status).toBe(200);

    const saved = prompts.body.data.find((row) => row.original_prompt?.includes(marker));
    expect(
      saved,
      `no prompt containing "${marker}" was saved, even though the optimized panel ` +
        'rendered the enhancement — so the enhance produced a result and the write ' +
        `did not land. What the backend sent:\n  ${backendSaid}`,
    ).toBeDefined();

    // The enhanced text lives on the prompt's current version, and it should be
    // a real expansion of the input rather than an echo of it.
    const enhanced = saved!.current_version?.content ?? '';
    expect(enhanced.length, 'the saved version has no content').toBeGreaterThan(0);
    expect(enhanced.length).toBeGreaterThan(promptText.length);
    expect(enhanced).not.toBe(promptText);

    // Finally, tie the two together: something distinctive from the saved text is
    // on screen, so the panel is showing this enhancement and not a stale one.
    // A word rather than a phrase, because FormattedPromptViewer strips markdown.
    const distinctiveWord = (enhanced.match(/[A-Za-z]{9,}/g) ?? [])[0];
    if (distinctiveWord) {
      await expect(page.getByText(distinctiveWord, { exact: false }).first()).toBeVisible();
    }
  });

  test('an empty prompt is not sent to the LLM', async ({ page }) => {
    // Spends no LLM budget: handleOptimize returns early on blank input
    // (optimizer/page.tsx:270), so no request is made.
    await page.goto('/dashboard/optimizer');
    const editor = page.getByPlaceholder(EDITOR_PLACEHOLDER);
    await expect(editor).toBeVisible({ timeout: 30_000 });

    // Clearing is the whole point of the test. The editor arrives pre-filled with
    // ComparisonBlock's hardcoded sample prompt (:214) — clicking Optimize
    // without this line enhances that sample for real, which is what an earlier
    // version of this test did.
    await editor.fill('');
    await expect(editor).toHaveValue('');

    let enhanceCalls = 0;
    page.on('request', (request) => {
      if (request.url().includes('/api/v1/enhance')) enhanceCalls += 1;
    });

    await page.getByRole('button', { name: OPTIMIZE_BUTTON }).click();
    // Give a request time to leave if one was going to.
    await page.waitForTimeout(2_000);

    expect(enhanceCalls, 'clicking Optimize with an empty editor called the LLM').toBe(0);
    // The flow never started, so the right panel was never rendered.
    await expect(page.getByRole('heading', OPTIMIZED_HEADING)).toHaveCount(0);
    await expect(page.getByRole('button', { name: OPTIMIZE_BUTTON })).toBeEnabled();
  });
});
