/**
 * Single source of truth for the "target model" selector — the destination AI
 * model the enhanced prompt should be formatted for (Claude, ChatGPT, …).
 *
 * The header dropdown, the chat view, and history all read from this list so
 * the option set can never drift between surfaces. The `name` values are the
 * exact strings sent to the backend as `target_model`, so keep them in sync
 * with the backend directive keys in `app/services/prompt_builder.py`.
 */

export interface TargetModel {
  /** Canonical name — also the value POSTed to the backend as `target_model`. */
  name: string;
  /** Public path to the model's icon, or null for the universal "None" option. */
  icon: string | null;
  /** Invert the icon color in dark mode (e.g. black logos like Grok). */
  darkInvert?: boolean;
  /** Optional helper text shown in the dropdown. */
  description?: string;
}

/**
 * "None" means universal / any model — no model-specific formatting directive is
 * injected. It must stay first so it can serve as the default selection.
 */
export const TARGET_MODELS: TargetModel[] = [
  { name: 'None', icon: null, description: 'Universal / Any AI Model' },
  { name: 'ChatGPT', icon: '/chatgpt-icon.svg' },
  { name: 'Claude', icon: '/claude-ai-icon.svg' },
  { name: 'Gemini', icon: '/google-gemini-icon.svg' },
  { name: 'Grok', icon: '/grok-icon.svg', darkInvert: true },
  { name: 'Perplexity', icon: '/perplexity-ai-icon.svg' },
  { name: 'DeepSeek', icon: '/deepseek-logo-icon.svg' },
  { name: 'Midjourney', icon: '/midjourney-color-icon.svg' },
  { name: 'VEO', icon: '/veo-icon.svg' },
  { name: 'Higgsfield', icon: '/higgsfield-icon.svg' },
];

/** The universal / default option ("None"). */
export const DEFAULT_TARGET_MODEL: TargetModel = TARGET_MODELS[0];

/**
 * Resolve a stored/selected name to a TargetModel entry (case-insensitive),
 * falling back to the universal "None" option when the name is empty or unknown.
 */
export function getTargetModel(name?: string | null): TargetModel {
  if (!name) return DEFAULT_TARGET_MODEL;
  const match = TARGET_MODELS.find(
    (m) => m.name.toLowerCase() === name.toLowerCase(),
  );
  return match ?? DEFAULT_TARGET_MODEL;
}

/**
 * Normalize a target-model name for display in history/lists: unknown or
 * "None" values render as "Universal" rather than a raw model id.
 */
export function getTargetModelLabel(name?: string | null): string {
  if (!name || name.toLowerCase() === 'none') return 'Universal';
  return getTargetModel(name).name;
}
