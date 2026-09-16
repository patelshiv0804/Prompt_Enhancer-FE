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
  role?: string;
  mode?: string;
  body?: string;
  tags: string[];
  model: string;
  modelColor: string;
  aiModelId?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  isCustom?: boolean;
  userId?: string;
  useCount?: number;
}

/* ── Backend response shapes ── */
interface BackendTemplate {
  id: string;
  title: string;
  category: string | null;
  role: string | null;
  mode: string | null;
  is_featured: boolean;
  is_approved: boolean;
  user_id?: string | null;
  is_custom?: boolean;
  description: string | null;
  body?: string | null;
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
export function prettyModelName(modelName: string): string {
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
 */
export async function loadTemplates(): Promise<Template[]> {
  const [templatesRes, customRes, modelsRes] = await Promise.all([
    apiClient.get<Paginated<BackendTemplate>>('/api/v1/templates/?limit=100'),
    apiClient
      .get<Paginated<BackendTemplate>>('/api/v1/templates/?mine=true&limit=100')
      .catch(() => null),
    apiClient
      .get<Paginated<BackendAIModel>>('/api/v1/ai-models/?limit=100')
      .catch(() => null),
  ]);

  const modelMap = new Map<string, BackendAIModel>();
  for (const m of modelsRes?.data ?? []) modelMap.set(m.id, m);

  // Filter out throwaway test artifacts
  const ARTIFACT_TITLES = new Set(['enhance template', 'opt template']);
  const ARTIFACT_MODES = new Set(['api_test_enhance', 'test_opt']);

  // Merge templates, ensuring custom templates are present and prioritized
  const templateMap = new Map<string, BackendTemplate>();
  for (const t of customRes?.data ?? []) {
    templateMap.set(t.id, t);
  }
  for (const t of templatesRes?.data ?? []) {
    if (!templateMap.has(t.id)) {
      templateMap.set(t.id, t);
    }
  }

  const backendTemplates = Array.from(templateMap.values()).filter(
    (t) =>
      !ARTIFACT_TITLES.has((t.title ?? '').trim().toLowerCase()) &&
      !ARTIFACT_MODES.has((t.mode ?? '').trim().toLowerCase()),
  );

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
      category: (t.role ?? t.category ?? 'general').toLowerCase(),
      role: t.role ?? undefined,
      mode: t.mode ?? undefined,
      body: t.body ?? undefined,
      tags: Array.isArray(t.tags) ? t.tags : [],
      model: model ? prettyModelName(model.model_name) : 'AI Model',
      modelColor: providerColor(model?.provider),
      aiModelId: t.ai_model_id,
      isFeatured: t.is_featured,
      isTrending: trendingIds.has(t.id),
      isNew: isRecent(t.created_at),
      isCustom: Boolean(t.is_custom || t.user_id),
      userId: t.user_id ?? undefined,
      useCount: t.use_count ?? 0,
    };
  });
}

export interface CreateCustomTemplateInput {
  title: string;
  description?: string;
  body: string;
  role?: string;
  mode?: string;
  category?: string;
  tags?: string[];
  ai_model_id?: string;
}

export async function createCustomTemplate(input: CreateCustomTemplateInput): Promise<Template> {
  const payload = {
    ...input,
    category: input.category || (input.role ? input.role.toLowerCase() : 'general'),
  };
  const t = await apiClient.post<BackendTemplate>('/api/v1/templates/', payload);
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? '',
    category: (t.role ?? t.category ?? input.role ?? 'general').toLowerCase(),
    role: t.role ?? input.role ?? undefined,
    mode: t.mode ?? input.mode ?? undefined,
    body: t.body ?? input.body ?? undefined,
    tags: Array.isArray(t.tags) ? t.tags : (input.tags ?? []),
    model: 'AI Model',
    modelColor: DEFAULT_MODEL_COLOR,
    aiModelId: t.ai_model_id ?? input.ai_model_id,
    isFeatured: false,
    isTrending: false,
    isNew: true,
    isCustom: true,
    userId: t.user_id ?? undefined,
    useCount: 0,
  };
}

export async function deleteCustomTemplate(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/templates/${id}`);
}

export async function loadAIModels(): Promise<Array<{ id: string; name: string; provider: string }>> {
  try {
    const res = await apiClient.get<Paginated<BackendAIModel>>('/api/v1/ai-models/?limit=100');
    return (res?.data ?? []).filter((m) => m.is_active).map((m) => ({
      id: m.id,
      name: prettyModelName(m.model_name),
      provider: m.provider,
    }));
  } catch {
    return [];
  }
}
