import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { api } from '@/test/msw/handlers';
import {
  createStyleProfile,
  fetchStyleProfiles,
  mapBackendToFrontendStyle,
  normalizeCategory,
  type BackendStyleProfile,
} from '@/features/style-memory/services/styleMemoryService';

function backendProfile(overrides: Partial<BackendStyleProfile> = {}): BackendStyleProfile {
  return {
    id: 'sp1',
    name: 'Noir',
    type: 'cinematic',
    attributes: {},
    is_active: true,
    use_count: 0,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('normalizeCategory', () => {
  it.each([
    ['art-style', 'art_style'],
    ['cinematic-style', 'cinematic'],
    ['brand-voice', 'brand_voice'],
    ['environment', 'environment'],
    ['nonsense', 'character'], // unknown → character
  ])('normalizes %s → %s', (raw, expected) => {
    expect(normalizeCategory(raw)).toBe(expected);
  });
});

describe('mapBackendToFrontendStyle', () => {
  it('uses explicit description/injectionPrompt/tags from attributes', () => {
    const mapped = mapBackendToFrontendStyle(
      backendProfile({
        attributes: {
          description: 'A moody look',
          injectionPrompt: 'Apply noir lighting',
          tags: ['dark', 'shadow'],
        },
      }),
    );

    expect(mapped.description).toBe('A moody look');
    expect(mapped.injectionPrompt).toBe('Apply noir lighting');
    expect(mapped.tags).toEqual(['#dark', '#shadow']); // # prefix added
    expect(mapped.category).toBe('cinematic');
    expect(mapped.enabled).toBe(true);
    expect(mapped.color).toBe('#F59E0B'); // cinematic colour
  });

  it('derives a description and tags from arbitrary attributes when none are given', () => {
    const mapped = mapBackendToFrontendStyle(
      backendProfile({ attributes: { mood: 'tense', palette: ['black', 'grey'] } }),
    );

    expect(mapped.description).toContain('mood: tense');
    expect(mapped.description).toContain('palette: black, grey');
    expect(mapped.tags.length).toBeGreaterThan(0);
    expect(mapped.tags.every((t) => t.startsWith('#'))).toBe(true);
  });
});

describe('fetchStyleProfiles', () => {
  it('maps, sorts by id, and caches to localStorage', async () => {
    server.use(
      http.get(api('/api/v1/styles'), () =>
        HttpResponse.json([backendProfile({ id: 'b' }), backendProfile({ id: 'a' })]),
      ),
    );

    const profiles = await fetchStyleProfiles();

    expect(profiles.map((p) => p.id)).toEqual(['a', 'b']);
    expect(JSON.parse(localStorage.getItem('aure_style_memory_profiles')!)).toHaveLength(2);
  });

  it('falls back to locally stored profiles when the request fails', async () => {
    localStorage.setItem(
      'aure_style_memory_profiles',
      JSON.stringify([{ id: 'cached', name: 'Cached', category: 'character' }]),
    );
    server.use(
      http.get(api('/api/v1/styles'), () => HttpResponse.json({ detail: 'down' }, { status: 500 })),
    );

    const profiles = await fetchStyleProfiles();

    expect(profiles).toHaveLength(1);
    expect(profiles[0].id).toBe('cached');
  });
});

describe('createStyleProfile', () => {
  it('posts the backend payload shape then re-fetches', async () => {
    let posted: any = null;
    server.use(
      http.post(api('/api/v1/styles'), async ({ request }) => {
        posted = await request.json();
        return HttpResponse.json({ id: 'new' });
      }),
      http.get(api('/api/v1/styles'), () => HttpResponse.json([backendProfile({ id: 'new' })])),
    );

    await createStyleProfile({
      name: 'Vivid',
      description: 'bright',
      category: 'art_style',
      injectionPrompt: 'make it vivid',
      tags: ['vivid'],
      enabled: true,
    });

    expect(posted.name).toBe('Vivid');
    expect(posted.type).toBe('art_style');
    expect(posted.attributes.injectionPrompt).toBe('make it vivid');
    expect(posted.injection_template).toBe('make it vivid');
  });
});
