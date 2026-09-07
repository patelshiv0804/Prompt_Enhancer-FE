import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders } from '@/test/utils';
import { server } from '@/test/msw/server';
import { api } from '@/test/msw/handlers';
import { routerMock } from '@/test/router';
import VaultPage from '@/app/dashboard/vault/page';

/**
 * Backend prompt rows in the shape historyService.fetchHistory maps from:
 *   prompt      ← original_prompt || title
 *   score       ← new_analysis.overall_score
 *   targetModel ← ai_model.model_name
 *   mode        ← template.mode
 *   category    ← template.role (lower-cased)
 * The list and the stats endpoints share the pathname /api/v1/prompts/ (MSW
 * matches on pathname, ignoring the differing page_size query), so one handler
 * feeds both fetchHistory and fetchHistoryStats.
 */
const PROMPTS = [
  {
    id: 'p1',
    original_prompt: 'Refactor the authentication module for clarity',
    title: 'Coding - Full Stack',
    created_at: '2026-08-30T12:00:00Z',
    new_analysis: { overall_score: 88 },
    ai_model: { model_name: 'GPT-4' },
    template: { role: 'coding', mode: 'Full Stack' },
  },
  {
    id: 'p2',
    original_prompt: 'Write a launch announcement tweet',
    title: 'Marketing - Social',
    created_at: '2026-08-29T09:00:00Z',
    new_analysis: { overall_score: 72 },
    ai_model: { model_name: 'Claude' },
    template: { role: 'marketing', mode: 'Social' },
  },
];

function usePromptHandler(data: unknown[]) {
  server.use(
    http.get(api('/api/v1/prompts/'), () =>
      HttpResponse.json({ data, total: data.length }),
    ),
  );
}

/**
 * Integration: the Vault/history page wired to the real historyService. On
 * mount it loads the list + stats from the API, and the row interactions
 * (open, favourite) run through the actual service + component wiring.
 */
describe('History vault flow', () => {
  it('loads the prompt history from the API and renders each row', async () => {
    usePromptHandler(PROMPTS);
    renderWithProviders(<VaultPage />);

    // Both rows render with their mapped prompt text (original_prompt wins).
    expect(
      await screen.findByText('Refactor the authentication module for clarity'),
    ).toBeInTheDocument();
    expect(screen.getByText('Write a launch announcement tweet')).toBeInTheDocument();

    // Mapped facets are surfaced too: model + mode from the joined rows.
    expect(screen.getByText('GPT-4')).toBeInTheDocument();
    expect(screen.getByText('Full Stack')).toBeInTheDocument();
  });

  it('shows the empty state when the history is empty', async () => {
    usePromptHandler([]);
    renderWithProviders(<VaultPage />);

    expect(await screen.findByText('Your Vault is empty')).toBeInTheDocument();
    expect(
      screen.queryByText('Refactor the authentication module for clarity'),
    ).not.toBeInTheDocument();
  });

  it('opens a prompt in the chat view when its row is clicked', async () => {
    usePromptHandler(PROMPTS);
    renderWithProviders(<VaultPage />);

    // Click the row body (not a control) — the click bubbles to the row's
    // onOpenInOptimizer handler, which routes to /dashboard/chat/{id}.
    await userEvent.click(
      await screen.findByText('Refactor the authentication module for clarity'),
    );

    await waitFor(() => {
      expect(routerMock.push).toHaveBeenCalledWith('/dashboard/chat/p1');
    });
  });

  it('toggles a favourite and persists it to localStorage', async () => {
    usePromptHandler(PROMPTS);
    renderWithProviders(<VaultPage />);
    await screen.findByText('Refactor the authentication module for clarity');

    // Favourites are stored client-side only (no network call) under
    // promptiq_favorites; the star flips optimistically.
    await userEvent.click(document.getElementById('star-btn-p1')!);

    await waitFor(() => {
      const favs = JSON.parse(localStorage.getItem('promptiq_favorites') || '[]');
      expect(favs).toContain('p1');
    });
    expect(screen.getByTitle('Remove from favorites')).toBeInTheDocument();
  });
});
