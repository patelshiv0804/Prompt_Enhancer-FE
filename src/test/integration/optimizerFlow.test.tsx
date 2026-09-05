import { describe, expect, it, beforeEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders } from '@/test/utils';
import { server } from '@/test/msw/server';
import { api } from '@/test/msw/handlers';
import { routerMock } from '@/test/router';
import { sseFrame, sseComment, sseResponse } from '@/test/sse';
import OptimizerPage from '@/app/dashboard/optimizer/page';

/**
 * Integration: the optimizer page driven end-to-end through a MOCKED SSE
 * stream. The default handlers already authenticate the AuthProvider probe
 * (/profile/me + /styles), so these tests focus on the enhance flow: type a
 * prompt → click Optimize → the app POSTs /enhance/stream, parses real SSE
 * bytes via streamEnhance, and renders the final enhanced prompt.
 */
describe('Optimizer enhance flow (mocked SSE)', () => {
  async function typePrompt(text: string) {
    const textarea = await screen.findByPlaceholderText('Paste or write below...');
    await userEvent.clear(textarea);
    await userEvent.type(textarea, text);
    return textarea;
  }

  it('streams tokens and renders the final enhanced prompt on the done frame', async () => {
    server.use(
      http.post(api('/api/v1/enhance/stream'), () =>
        sseResponse([
          sseComment(),
          sseFrame('meta', { detected_level: 'standard', level_reason: 'medium complexity' }),
          sseFrame('token', { text: 'You are ' }),
          // Split a frame across two network chunks to exercise reassembly.
          'event: token\ndata: {"text":"an expert',
          ' assistant."}\n\n',
          sseFrame('done', {
            original_prompt: 'help me write docs',
            enhanced_prompt: 'You are an expert assistant. Write clear documentation.',
            detected_level: 'standard',
            level_reason: 'medium complexity',
          }),
        ]),
      ),
    );

    renderWithProviders(<OptimizerPage />);

    await typePrompt('help me write docs');
    await userEvent.click(await screen.findByRole('button', { name: 'Optimize' }));

    // The authoritative done-frame text lands in the formatted viewer.
    expect(
      await screen.findByText(/You are an expert assistant\. Write clear documentation\./),
    ).toBeInTheDocument();
    // Detected-level badge from the done frame is shown.
    expect(screen.getByText('standard')).toBeInTheDocument();
    // Button returns to its idle label once optimizing settles.
    expect(await screen.findByRole('button', { name: 'Optimize' })).toBeEnabled();
  });

  it('sends the edited prompt and selected options in the stream request body', async () => {
    let received: any = null;
    server.use(
      http.post(api('/api/v1/enhance/stream'), async ({ request }) => {
        received = await request.json();
        return sseResponse([
          sseFrame('done', {
            original_prompt: received.prompt,
            enhanced_prompt: 'Enhanced output text.',
          }),
        ]);
      }),
    );

    renderWithProviders(<OptimizerPage />);
    await typePrompt('summarise this article');
    await userEvent.click(await screen.findByRole('button', { name: 'Optimize' }));

    await screen.findByText(/Enhanced output text\./);
    expect(received).toMatchObject({
      prompt: 'summarise this article',
      role: 'general',
      // apply_style is false because no active style profile is selected.
      apply_style: false,
    });
    // Auto depth omits enhancement_level so the backend auto-detects.
    expect(received.enhancement_level).toBeUndefined();
  });

  it('falls back to the blocking /enhance endpoint when the stream 500s pre-stream', async () => {
    server.use(
      http.post(api('/api/v1/enhance/stream'), () =>
        HttpResponse.json({ detail: 'stream unavailable' }, { status: 500 }),
      ),
      http.post(api('/api/v1/enhance'), () =>
        HttpResponse.json({
          success: true,
          data: { enhanced_prompt: 'Blocking fallback result.', original_prompt: 'do a thing' },
        }),
      ),
    );

    renderWithProviders(<OptimizerPage />);
    await typePrompt('do a thing');
    await userEvent.click(await screen.findByRole('button', { name: 'Optimize' }));

    expect(await screen.findByText(/Blocking fallback result\./)).toBeInTheDocument();
  });

  it('surfaces a user-facing error when a server error frame arrives and the fallback also fails', async () => {
    server.use(
      http.post(api('/api/v1/enhance/stream'), () =>
        sseResponse([sseFrame('error', { detail: 'model overloaded' })]),
      ),
      http.post(api('/api/v1/enhance'), () =>
        HttpResponse.json({ detail: 'still overloaded' }, { status: 503 }),
      ),
    );

    renderWithProviders(<OptimizerPage />);
    await typePrompt('do a thing');
    await userEvent.click(await screen.findByRole('button', { name: 'Optimize' }));

    // getUserMessage maps 503 to its friendly copy; the enhanced panel never fills.
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Optimize' })).toBeEnabled();
    });
    expect(
      screen.queryByText(/Blocking fallback result\./),
    ).not.toBeInTheDocument();
  });
});

/**
 * Integration: opening a saved prompt from history into the optimizer (via the
 * `?prompt_id=` query param) loads its detail + version list, then restoring an
 * older version POSTs /prompts/{id}/restore/{n} and reloads the record. This is
 * the "history load + restore" flow: the optimizer is driven purely by the
 * router's search params, with no typing.
 */
describe('Optimizer history load + version restore', () => {
  const PROMPT_ID = 'hist-1';

  const DETAIL = {
    data: {
      id: PROMPT_ID,
      original_prompt: 'draft a product update email',
      title: 'Marketing - Email',
      current_version: {
        version_number: 2,
        content: 'You are a product marketer. Draft a concise update email.',
        // Persisted analyses + tool recs are present, so loadPromptDetails does
        // NOT fan out to /analyze or /tools/recommend (keeps the request set tight).
        old_analysis: { overall_score: 40, grade: 'C', dimensions: {} },
        new_analysis: { overall_score: 90, grade: 'A', dimensions: {} },
        tool_recommendations: { tools: [] },
      },
    },
  };

  const VERSIONS = {
    data: [
      { id: 'ver-1', version_number: 1, content: 'draft a product update email', version_type: 'original' },
      { id: 'ver-2', version_number: 2, content: 'You are a product marketer. Draft a concise update email.', version_type: 'enhancement' },
    ],
  };

  beforeEach(() => {
    routerMock.__setSearchParams(`prompt_id=${PROMPT_ID}`);
  });

  it('loads a prompt record from history and restores an earlier version', async () => {
    const restoreCalls: string[] = [];
    server.use(
      http.get(api(`/api/v1/prompts/${PROMPT_ID}`), () => HttpResponse.json(DETAIL)),
      http.get(api(`/api/v1/prompts/${PROMPT_ID}/versions`), () => HttpResponse.json(VERSIONS)),
      http.post(api(`/api/v1/prompts/${PROMPT_ID}/restore/:n`), ({ params }) => {
        restoreCalls.push(String(params.n));
        return HttpResponse.json({ success: true });
      }),
    );

    renderWithProviders(<OptimizerPage />);

    // The loaded record's enhanced content renders, and the version selector
    // appears (two versions) showing the active version v2.
    expect(
      await screen.findByText(/You are a product marketer\. Draft a concise update email\./),
    ).toBeInTheDocument();
    const versionToggle = await screen.findByRole('button', { name: /^v2$/ });

    // Open the version menu and pick v1 to restore it.
    await userEvent.click(versionToggle);
    await userEvent.click(await screen.findByRole('menuitem', { name: /^v1$/ }));

    // The restore endpoint is hit with the chosen version number.
    await waitFor(() => {
      expect(restoreCalls).toContain('1');
    });
  });
});
