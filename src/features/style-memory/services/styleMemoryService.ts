import { useState, useEffect } from 'react';
import { apiClient } from '@/utils/apiClient';

export type StyleCategory = 'character' | 'art_style' | 'cinematic' | 'environment' | 'brand_voice';

export interface StyleProfile {
  id: string;
  name: string;
  description: string;
  category: StyleCategory;
  injectionPrompt: string;
  tags: string[];
  enabled: boolean;
  lastUsed?: string;
  color?: string;
}

export interface BackendStyleProfile {
  id: string;
  name: string;
  type: string;
  attributes: Record<string, any>;
  thumbnail_url?: string | null;
  is_active: boolean;
  use_count: number;
  created_at: string;
}

export const CATEGORY_COLORS: Record<StyleCategory, string> = {
  'character': '#7C3AED',
  'art_style': '#EC4899',
  'cinematic': '#F59E0B',
  'environment': '#10B981',
  'brand_voice': '#3B82F6',
};

const STORAGE_KEY = 'aure_style_memory_profiles';
const EVENT_NAME = 'aure_style_memory_updated';

export function normalizeCategory(raw: string): StyleCategory {
  if (raw === 'art-style' || raw === 'art_style') return 'art_style';
  if (raw === 'cinematic-style' || raw === 'cinematic') return 'cinematic';
  if (raw === 'brand_voice' || raw === 'brand-voice') return 'brand_voice';
  if (['character', 'environment'].includes(raw)) return raw as StyleCategory;
  return 'character';
}

export function mapBackendToFrontendStyle(item: BackendStyleProfile): StyleProfile {
  const category = normalizeCategory(item.type);
  const attrs = item.attributes || {};

  // Extract description
  let description = attrs.description;
  if (!description) {
    const parts: string[] = [];
    Object.entries(attrs).forEach(([k, v]) => {
      if (['description', 'injectionPrompt', 'tags', 'injection_prompt'].includes(k)) return;
      if (Array.isArray(v)) {
        parts.push(`${k}: ${v.join(', ')}`);
      } else if (typeof v === 'object' && v !== null) {
        parts.push(`${k}: ${JSON.stringify(v)}`);
      } else {
        parts.push(`${k}: ${v}`);
      }
    });
    description = parts.length > 0 ? parts.join(' • ') : 'Custom style profile configuration.';
  }

  // Extract injection prompt
  let injectionPrompt = attrs.injectionPrompt || attrs.injection_prompt;
  if (!injectionPrompt) {
    const lines = Object.entries(attrs)
      .filter(([k]) => !['description', 'injectionPrompt', 'tags', 'injection_prompt'].includes(k))
      .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${Array.isArray(v) ? v.join(', ') : v}`);
    injectionPrompt = lines.length > 0 ? lines.join('. ') : `Apply ${item.name} style characteristics.`;
  }

  // Extract tags
  let tags: string[] = [];
  if (Array.isArray(attrs.tags)) {
    tags = attrs.tags.map((t: string) => (t.startsWith('#') ? t : `#${t}`));
  } else {
    const derived: string[] = [];
    Object.entries(attrs).forEach(([k, v]) => {
      if (['description', 'injectionPrompt', 'tags', 'injection_prompt'].includes(k)) return;
      if (Array.isArray(v)) {
        v.forEach(val => derived.push(`#${String(val).toLowerCase().replace(/\s+/g, '-')}`));
      } else if (typeof v === 'string') {
        derived.push(`#${v.toLowerCase().replace(/\s+/g, '-')}`);
      }
    });
    tags = Array.from(new Set(derived)).slice(0, 5);
    if (tags.length === 0) {
      tags = [`#${category.replace('_', '-')}`, `#${item.name.toLowerCase().replace(/\s+/g, '-')}`];
    }
  }

  return {
    id: item.id,
    name: item.name,
    description,
    category,
    injectionPrompt,
    tags,
    enabled: item.is_active,
    lastUsed: item.created_at ? 'Recently' : 'Never',
    color: CATEGORY_COLORS[category],
  };
}

export function getStoredStyleProfiles(): StyleProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStyleProfilesLocally(profiles: StyleProfile[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch (err) {
    console.error('Failed to cache style profiles locally:', err);
  }
}

/**
 * Fetch style profiles directly from backend table (`style_profiles`).
 */
export async function fetchStyleProfiles(): Promise<StyleProfile[]> {
  try {
    const backendData = await apiClient.get<BackendStyleProfile[]>('/api/v1/styles');
    if (Array.isArray(backendData)) {
      const mapped = backendData.map(mapBackendToFrontendStyle);
      // Sort deterministically by id so cards never jump positions when updated or toggled
      mapped.sort((a, b) => a.id.localeCompare(b.id));
      saveStyleProfilesLocally(mapped);
      return mapped;
    }
  } catch (err) {
    console.error('Error fetching style profiles from backend:', err);
  }
  return getStoredStyleProfiles();
}

/**
 * Create a new style profile in backend table.
 */
export async function createStyleProfile(data: Omit<StyleProfile, 'id'>): Promise<StyleProfile[]> {
  const backendPayload = {
    name: data.name,
    type: data.category,
    attributes: {
      description: data.description,
      injectionPrompt: data.injectionPrompt,
      tags: data.tags,
    },
    injection_template: data.injectionPrompt,
  };
  await apiClient.post('/api/v1/styles', backendPayload);
  return await fetchStyleProfiles();
}

/**
 * Update an existing style profile in backend table.
 */
export async function updateStyleProfile(id: string, data: Partial<StyleProfile>): Promise<StyleProfile[]> {
  const backendPayload: Record<string, any> = {};
  if (data.name !== undefined) backendPayload.name = data.name;
  if (data.category !== undefined) backendPayload.type = data.category;
  if (data.description !== undefined || data.injectionPrompt !== undefined || data.tags !== undefined) {
    backendPayload.attributes = {
      description: data.description,
      injectionPrompt: data.injectionPrompt,
      tags: data.tags,
    };
  }
  if (data.enabled !== undefined) backendPayload.is_active = data.enabled;

  await apiClient.patch(`/api/v1/styles/${id}`, backendPayload);
  return await fetchStyleProfiles();
}

/**
 * Toggle activation state following backend logic:
 * Activating a style profile calls `/activate`, which automatically deactivates other profiles of the same type.
 * Deactivating calls `/deactivate`.
 */
export async function toggleStyleActivation(id: string, currentlyEnabled: boolean): Promise<StyleProfile[]> {
  if (currentlyEnabled) {
    await apiClient.patch(`/api/v1/styles/${id}/deactivate`);
  } else {
    await apiClient.patch(`/api/v1/styles/${id}/activate`);
  }
  return await fetchStyleProfiles();
}

/**
 * Soft delete a style profile in backend.
 */
export async function deleteStyleProfile(id: string): Promise<StyleProfile[]> {
  await apiClient.delete(`/api/v1/styles/${id}`);
  return await fetchStyleProfiles();
}

export interface DropdownStyleOption {
  label: string;
  color: string;
  id?: string;
}

export function getEnabledStyleOptions(): DropdownStyleOption[] {
  const profiles = getStoredStyleProfiles();
  const enabledProfiles = profiles.filter((p) => p.enabled);
  const options: DropdownStyleOption[] = [{ label: 'None', color: '#94A3B8' }];

  enabledProfiles.forEach((p) => {
    options.push({
      id: p.id,
      label: p.name,
      color: p.color || CATEGORY_COLORS[p.category] || '#7C3AED',
    });
  });

  return options;
}

export function useEnabledStyleOptions(): DropdownStyleOption[] {
  const [options, setOptions] = useState<DropdownStyleOption[]>(() => {
    if (typeof window === 'undefined') return [{ label: 'None', color: '#94A3B8' }];
    return getEnabledStyleOptions();
  });

  useEffect(() => {
    const updateOptions = () => {
      setOptions(getEnabledStyleOptions());
    };

    updateOptions();
    window.addEventListener(EVENT_NAME, updateOptions);
    window.addEventListener('storage', updateOptions);

    return () => {
      window.removeEventListener(EVENT_NAME, updateOptions);
      window.removeEventListener('storage', updateOptions);
    };
  }, []);

  return options;
}

/**
 * React hook to manage style profiles with real-time backend synchronization.
 */
export function useStyleProfiles(): [
  StyleProfile[],
  boolean,
  {
    reload: () => Promise<void>;
    add: (data: Omit<StyleProfile, 'id'>) => Promise<void>;
    update: (id: string, data: Partial<StyleProfile>) => Promise<void>;
    toggle: (id: string, enabled: boolean) => Promise<void>;
    remove: (id: string) => Promise<void>;
  }
] {
  const [profiles, setProfiles] = useState<StyleProfile[]>(() => getStoredStyleProfiles());
  const [loading, setLoading] = useState(true);

  const loadFromBackend = async () => {
    setLoading(true);
    const data = await fetchStyleProfiles();
    setProfiles(data);
    setLoading(false);
  };

  useEffect(() => {
    loadFromBackend();

    const handleUpdate = () => {
      setProfiles(getStoredStyleProfiles());
    };
    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const add = async (data: Omit<StyleProfile, 'id'>) => {
    const updated = await createStyleProfile(data);
    setProfiles(updated);
  };

  const update = async (id: string, data: Partial<StyleProfile>) => {
    const updated = await updateStyleProfile(id, data);
    setProfiles(updated);
  };

  const toggle = async (id: string, currentlyEnabled: boolean) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, enabled: !currentlyEnabled } : p));
    const updated = await toggleStyleActivation(id, currentlyEnabled);
    setProfiles(updated);
  };

  const remove = async (id: string) => {
    const updated = await deleteStyleProfile(id);
    setProfiles(updated);
  };

  return [profiles, loading, { reload: loadFromBackend, add, update, toggle, remove }];
}
