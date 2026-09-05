import { test, expect, sseFrame, sseComment } from './fixtures';

/**
 * The optimizer's streaming enhance path, driven by a synthesized SSE body. This
 * is the real browser stream parser (streamEnhance) consuming bytes we control,
 * end to end through the rendered UI — the piece Vitest can only approximate.
 */

test.describe('optimizer streaming enhance (mocked SSE)', () => {
  async function typeAndOptimize(page: import('@playwright/test').Page, text: string) {
    await page.goto('/dashboard/optimizer');
    const editor = page.getByPlaceholder('Paste or write below...');
    await expect(editor).toBeVisible();
    await editor.fill(text);
    await page.getByRole('button', { name: /^optimize$/i }).click();
  }

  test('renders the enhanced prompt from the done frame', async ({ page, authed }) => {
    await authed.sse('/enhance/stream', [
      sseComment(),
      sseFrame('meta', { detected_level: 'standard', level_reason: 'medium complexity' }),
      sseFrame('token', { text: 'You are ' }),
      sseFrame('token', { text: 'an expert assistant.' }),
      sseFrame('done', {
        original_prompt: 'help me write docs',
        enhanced_prompt: 'You are an expert assistant. Write clear documentation.',
        detected_level: 'standard',
        level_reason: 'medium complexity',
      }),
    ]);

    await typeAndOptimize(page, 'help me write docs');

    await expect(
      page.getByText('You are an expert assistant. Write clear documentation.'),
    ).toBeVisible({ timeout: 20_000 });
    // The button settles back to its idle label once the stream is done.
    await expect(page.getByRole('button', { name: /^optimize$/i })).toBeEnabled();
  });

  test('falls back to the blocking /enhance endpoint when the stream pre-fails', async ({ page, authed }) => {
    // Stream 500s before any frame; the app retries the blocking endpoint.
    await authed.json('POST', '/enhance/stream', { detail: 'stream unavailable' }, 500);
    await authed.json('POST', '/enhance', {
      success: true,
      data: { enhanced_prompt: 'Blocking fallback result.', original_prompt: 'do a thing' },
    });

    await typeAndOptimize(page, 'do a thing');

    await expect(page.getByText('Blocking fallback result.')).toBeVisible({ timeout: 20_000 });
  });

  test('an error frame with a failing fallback leaves the enhanced panel empty', async ({ page, authed }) => {
    await authed.sse('/enhance/stream', [sseFrame('error', { detail: 'model overloaded' })]);
    await authed.json('POST', '/enhance', { detail: 'still overloaded' }, 503);

    await typeAndOptimize(page, 'do a thing');

    // The button re-enables (flow settled) but no enhanced output was produced.
    await expect(page.getByRole('button', { name: /^optimize$/i })).toBeEnabled({ timeout: 20_000 });
    await expect(page.getByText('Blocking fallback result.')).toHaveCount(0);
  });
});
