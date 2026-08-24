import { apiClient } from '@/utils/apiClient';

/**
 * Templates library service.
 *
 * Fetches templates from the FastAPI backend and maps them into the shape the
 * Templates page renders. Model name/colour is resolved by joining each
 * template's `ai_model_id` against the AI models catalogue. Follows the same
 * feature-service pattern as styleMemoryService / historyService.
 */

/* ── Frontend shape rendered by the Templates page ── */
export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  model: string;
  modelColor: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  useCount?: number;
}

/* ── Backend response shapes (only the fields we consume) ──
   Note: the list endpoint deliberately omits the prompt `body` (the
   proprietary "recipe"), so it is intentionally absent here — the client
   never receives or renders it. ── */
interface BackendTemplate {
  id: string;
  title: string;
  category: string | null;
  role: string | null;
  mode: string | null;
  is_featured: boolean;
  is_approved: boolean;
  description: string | null;
  ai_model_id: string;
  tags: string[] | null;
  use_count: number;
  created_at: string;
  updated_at: string;
}

interface BackendAIModel {
  id: string;
  provider: string;
  model_name: string;
  is_active: boolean;
}

interface Paginated<T> {
  success: boolean;
  message: string;
  data: T[];
  page: number;
  page_size: number;
  total: number;
}

/* ── Model presentation helpers ── */
const PROVIDER_COLORS: Record<string, string> = {
  mistral: '#F97316',
  openai: '#10B981',
  anthropic: '#D97706',
  google: '#3B82F6',
};
const DEFAULT_MODEL_COLOR = '#7C3AED';

function providerColor(provider?: string): string {
  if (!provider) return DEFAULT_MODEL_COLOR;
  return PROVIDER_COLORS[provider.toLowerCase()] ?? DEFAULT_MODEL_COLOR;
}

// "mistral-small-latest" → "Mistral Small"
function prettyModelName(modelName: string): string {
  return modelName
    .replace(/-latest$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

const NEW_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
function isRecent(createdAt: string): boolean {
  const t = Date.parse(createdAt);
  if (Number.isNaN(t)) return false;
  return Date.now() - t < NEW_WINDOW_MS;
}

/**
 * Load the templates library: fetch templates + the AI models catalogue in
 * parallel, resolve each template's model, and derive presentation flags.
 * Throws if the templates request fails (the page surfaces an error + retry);
 * a failing AI-models request degrades gracefully to generic labels.
 */
export async function loadTemplates(): Promise<Template[]> {
  const [templatesRes, modelsRes] = await Promise.all([
    apiClient.get<Paginated<BackendTemplate>>('/api/v1/templates/?limit=100'),
    apiClient
      .get<Paginated<BackendAIModel>>('/api/v1/ai-models/?limit=100')
      .catch(() => null),
  ]);

  const modelMap = new Map<string, BackendAIModel>();
  for (const m of modelsRes?.data ?? []) modelMap.set(m.id, m);

  // The enhance/optimize pipeline and test scripts create throwaway Template
  // rows ("Enhance Template" / "Opt Template" with test modes). Drop those
  // obvious artifacts so the curated library stays clean.
  const ARTIFACT_TITLES = new Set(['enhance template', 'opt template']);
  const ARTIFACT_MODES = new Set(['api_test_enhance', 'test_opt']);
  const backendTemplates = (templatesRes?.data ?? []).filter(
    (t) =>
      !ARTIFACT_TITLES.has((t.title ?? '').trim().toLowerCase()) &&
      !ARTIFACT_MODES.has((t.mode ?? '').trim().toLowerCase()),
  );

  // Only templates with real usage can "trend"; the top few by use_count light
  // up the Trending section. A freshly-seeded DB (all zero) simply shows none.
  const trendingIds = new Set(
    [...backendTemplates]
      .filter((t) => (t.use_count ?? 0) > 0)
      .sort((a, b) => (b.use_count ?? 0) - (a.use_count ?? 0))
      .slice(0, 6)
      .map((t) => t.id),
  );

  return backendTemplates.map((t) => {
    const model = t.ai_model_id ? modelMap.get(t.ai_model_id) : undefined;
    return {
      id: t.id,
      title: t.title,
      description: t.description ?? '',
      // Facet for the category chips. The current data populates `role`
      // (developer, marketer, researcher, …) and leaves `category` null, so
      // prefer role; fall back to category, then a generic bucket.
      category: (t.role ?? t.category ?? 'general').toLowerCase(),
      tags: Array.isArray(t.tags) ? t.tags : [],
      model: model ? prettyModelName(model.model_name) : 'AI Model',
      modelColor: providerColor(model?.provider),
      isFeatured: t.is_featured,
      isTrending: trendingIds.has(t.id),
      isNew: isRecent(t.created_at),
      useCount: t.use_count ?? 0,
    };
  });
}
