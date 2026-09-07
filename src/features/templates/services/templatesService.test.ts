import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { api } from '@/test/msw/handlers';
import { loadTemplates } from '@/features/templates/services/templatesService';

const AI_MODELS = {
  data: [
    { id: 'm1', provider: 'mistral', model_name: 'mistral-small-latest', is_active: true },
    { id: 'm2', provider: 'openai', model_name: 'gpt-4o', is_active: true },
  ],
};

function template(overrides: Record<string, unknown> = {}) {
  return {
    id: 't1',
    title: 'Blog Writer',
    category: null,
    role: 'writer',
    mode: 'concise',
    is_featured: false,
    is_approved: true,
    description: 'Writes blog posts',
    ai_model_id: 'm1',
    tags: ['blog', 'content'],
    use_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

function serveTemplates(data: unknown[]) {
  server.use(
    http.get(api('/api/v1/templates/'), () =>
      HttpResponse.json({ success: true, message: 'ok', data, page: 1, page_size: 100, total: data.length }),
    ),
    http.get(api('/api/v1/ai-models/'), () => HttpResponse.json(AI_MODELS)),
  );
}

describe('templatesService.loadTemplates', () => {
  it('maps a backend template and resolves its model name + provider colour', async () => {
    serveTemplates([template()]);

    const [t] = await loadTemplates();

    expect(t.id).toBe('t1');
    expect(t.title).toBe('Blog Writer');
    expect(t.category).toBe('writer'); // role preferred over null category
    expect(t.model).toBe('Mistral Small'); // -latest stripped, title-cased
    expect(t.modelColor).toBe('#F97316'); // mistral
    expect(t.tags).toEqual(['blog', 'content']);
  });

  it('drops artifact templates by title and by mode', async () => {
    serveTemplates([
      template({ id: 'keep', title: 'Real Template' }),
      template({ id: 'a1', title: 'Enhance Template' }),
      template({ id: 'a2', title: 'Legit', mode: 'test_opt' }),
    ]);

    const ids = (await loadTemplates()).map((t) => t.id);

    expect(ids).toEqual(['keep']);
  });

  it('flags the top used templates as trending, and never zero-use ones', async () => {
    serveTemplates([
      template({ id: 'hot', use_count: 50 }),
      template({ id: 'cold', use_count: 0 }),
    ]);

    const byId = Object.fromEntries((await loadTemplates()).map((t) => [t.id, t]));

    expect(byId.hot.isTrending).toBe(true);
    expect(byId.cold.isTrending).toBe(false);
  });

  it('degrades to a generic model label when the AI-models request fails', async () => {
    server.use(
      http.get(api('/api/v1/templates/'), () =>
        HttpResponse.json({ data: [template()], total: 1, success: true, message: '', page: 1, page_size: 100 }),
      ),
      http.get(api('/api/v1/ai-models/'), () => HttpResponse.json({ detail: 'boom' }, { status: 500 })),
    );

    const [t] = await loadTemplates();

    expect(t.model).toBe('AI Model');
    expect(t.modelColor).toBe('#7C3AED'); // default colour
  });

  it('rejects when the templates request itself fails', async () => {
    server.use(
      http.get(api('/api/v1/templates/'), () => HttpResponse.json({ detail: 'down' }, { status: 500 })),
      http.get(api('/api/v1/ai-models/'), () => HttpResponse.json(AI_MODELS)),
    );

    await expect(loadTemplates()).rejects.toBeTruthy();
  });
});
