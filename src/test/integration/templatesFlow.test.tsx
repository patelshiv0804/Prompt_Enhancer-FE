import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { renderWithProviders } from '@/test/utils';
import { server } from '@/test/msw/server';
import { api } from '@/test/msw/handlers';
import { routerMock } from '@/test/router';
import TemplatesPage from '@/features/templates/components/TemplatesPage';

const MODELS = {
  data: [{ id: 'm1', model_name: 'mistral-small-latest', provider: 'mistral' }],
};

const TEMPLATES = {
  data: [
    {
      id: 't1',
      title: 'Code Reviewer',
      description: 'Reviews pull requests for bugs.',
      category: null,
      role: 'developer',
      mode: 'Full Stack',
      is_approved: true,
      is_featured: false,
      ai_model_id: 'm1',
      use_count: 12,
      tags: ['code', 'review'],
      created_at: '2020-01-01T00:00:00Z',
    },
    {
      id: 't2',
      title: 'SEO Blog Writer',
      description: 'Drafts search-optimised articles.',
      category: null,
      role: 'marketer',
      mode: 'SEO',
      is_approved: true,
      is_featured: false,
      ai_model_id: 'm1',
      use_count: 3,
      tags: ['seo', 'content'],
      created_at: '2020-01-01T00:00:00Z',
    },
  ],
};

function useTemplateHandlers() {
  server.use(
    http.get(api('/api/v1/templates/'), () => HttpResponse.json(TEMPLATES)),
    http.get(api('/api/v1/ai-models/'), () => HttpResponse.json(MODELS)),
  );
}

/**
 * Integration: the Templates Hub wired to the real templatesService (which
 * fans out to /templates + /ai-models, resolves model names and derives facet
 * flags), plus the search filter and the "Use in optimizer" navigation.
 */
describe('Templates hub', () => {
  it('loads templates from the API and shows the curated count', async () => {
    useTemplateHandlers();
    renderWithProviders(<TemplatesPage />);

    // Header count reflects the number loaded (no exact-ID assertions).
    expect(await screen.findByText('2 Curated')).toBeInTheDocument();
    expect(screen.getAllByText('Code Reviewer').length).toBeGreaterThan(0);
  });

  it('filters the grid by the search query', async () => {
    useTemplateHandlers();
    renderWithProviders(<TemplatesPage />);
    await screen.findByText('2 Curated');

    await userEvent.type(screen.getByPlaceholderText('Search by role, task, model...'), 'SEO');

    // The results header reports the filtered count and echoes the query.
    expect(await screen.findByText(/Showing 1 template/)).toBeInTheDocument();
    expect(screen.getByText('SEO Blog Writer')).toBeInTheDocument();
    expect(screen.queryByText('Code Reviewer')).not.toBeInTheDocument();
  });

  it('navigates to the optimizer with the template id when "Use" is clicked', async () => {
    useTemplateHandlers();
    renderWithProviders(<TemplatesPage />);
    await screen.findByText('2 Curated');

    // Narrow to a single card first so the Use button is unambiguous.
    await userEvent.type(screen.getByPlaceholderText('Search by role, task, model...'), 'SEO');
    await screen.findByText(/Showing 1 template/);

    await userEvent.click(screen.getByRole('button', { name: /^Use$/ }));

    await waitFor(() => {
      expect(routerMock.push).toHaveBeenCalledWith(
        '/dashboard/optimizer?template_id=t2&template=SEO%20Blog%20Writer',
      );
    });
  });

  it('shows an error message when the templates request fails', async () => {
    server.use(
      http.get(api('/api/v1/templates/'), () =>
        HttpResponse.json({ detail: 'Templates service unavailable' }, { status: 500 }),
      ),
      http.get(api('/api/v1/ai-models/'), () => HttpResponse.json(MODELS)),
    );
    renderWithProviders(<TemplatesPage />);

    expect(
      await screen.findByText('Templates service unavailable'),
    ).toBeInTheDocument();
  });
});
