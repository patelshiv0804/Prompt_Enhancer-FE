import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { api } from '@/test/msw/handlers';
import {
  fetchHistory,
  fetchHistoryStats,
  toggleFavorite,
} from '@/features/history/services/historyService';

function prompt(overrides: Record<string, unknown> = {}) {
  return {
    id: 'p1',
    original_prompt: 'Improve this',
    title: 'Improve this - Writer',
    created_at: new Date().toISOString(),
    new_analysis: { overall_score: 80 },
    ...overrides,
  };
}

describe('fetchHistoryStats', () => {
  it('counts prompts, averages only scored ones, and reflects favourites', async () => {
    localStorage.setItem('promptiq_favorites', JSON.stringify(['p1', 'stale-id']));
    server.use(
      http.get(api('/api/v1/prompts/'), () =>
        HttpResponse.json({
          data: [
            prompt({ id: 'p1', new_analysis: { overall_score: 90 } }),
            prompt({ id: 'p2', new_analysis: null, old_analysis: null }), // unscored → excluded
          ],
        }),
      ),
    );

    const stats = await fetchHistoryStats();

    expect(stats.totalPrompts).toBe(2);
    expect(stats.averageScore).toBe(90); // p2 excluded from the average
    // 'stale-id' isn't an active prompt, so it's pruned; only p1 remains a fav.
    expect(stats.favoritesCount).toBe(1);
    expect(JSON.parse(localStorage.getItem('promptiq_favorites')!)).toEqual(['p1']);
  });

  it('returns zeroes when the request fails', async () => {
    server.use(
      http.get(api('/api/v1/prompts/'), () => HttpResponse.json({ detail: 'down' }, { status: 500 })),
    );

    const stats = await fetchHistoryStats();

    expect(stats).toEqual({ totalPrompts: 0, averageScore: 0, thisWeekDelta: 0, favoritesCount: 0 });
  });
});

describe('fetchHistory', () => {
  const noFilters = { sortBy: 'newest', category: 'all', search: '' } as any;

  it('maps paginated prompts into HistoryItem rows', async () => {
    server.use(
      http.get(api('/api/v1/prompts/'), () =>
        HttpResponse.json({ data: [prompt({ id: 'p1' })], total: 1 }),
      ),
    );

    const page = await fetchHistory(1, 8, noFilters);

    expect(page.total).toBe(1);
    expect(page.items[0].id).toBe('p1');
    expect(page.items[0].score).toBe(80);
    expect(page.items[0].isFavorite).toBe(false);
  });

  it('marks favourites from localStorage', async () => {
    localStorage.setItem('promptiq_favorites', JSON.stringify(['p1']));
    server.use(
      http.get(api('/api/v1/prompts/'), () =>
        HttpResponse.json({ data: [prompt({ id: 'p1' }), prompt({ id: 'p2' })], total: 2 }),
      ),
    );

    const page = await fetchHistory(1, 8, noFilters);

    const byId = Object.fromEntries(page.items.map((i) => [i.id, i]));
    expect(byId.p1.isFavorite).toBe(true);
    expect(byId.p2.isFavorite).toBe(false);
  });

  it('routes an active search through the semantic search endpoint', async () => {
    let hitSearch = false;
    server.use(
      http.post(api('/api/v1/prompts/search'), () => {
        hitSearch = true;
        return HttpResponse.json({ results: [prompt({ id: 'found' })] });
      }),
    );

    const page = await fetchHistory(1, 8, { ...noFilters, search: 'postgres' });

    expect(hitSearch).toBe(true);
    expect(page.items[0].id).toBe('found');
  });

  it('returns an empty page when the backend errors', async () => {
    server.use(
      http.get(api('/api/v1/prompts/'), () => HttpResponse.json({ detail: 'down' }, { status: 500 })),
    );

    const page = await fetchHistory(1, 8, noFilters);

    expect(page.items).toEqual([]);
    expect(page.total).toBe(0);
  });
});

describe('toggleFavorite', () => {
  it('adds and removes ids in the localStorage favourites list', async () => {
    await toggleFavorite('p1', true);
    expect(JSON.parse(localStorage.getItem('promptiq_favorites')!)).toEqual(['p1']);

    await toggleFavorite('p1', false);
    expect(JSON.parse(localStorage.getItem('promptiq_favorites')!)).toEqual([]);
  });
});
