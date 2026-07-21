import { useState, useEffect } from 'react';

export type StyleCategory = 'character' | 'art-style' | 'cinematic-style' | 'environment';

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

export const CATEGORY_COLORS: Record<StyleCategory, string> = {
  'character': '#7C3AED',
  'art-style': '#EC4899',
  'cinematic-style': '#F59E0B',
  'environment': '#10B981',
};

export const INITIAL_PROFILES: StyleProfile[] = [
  {
    id: 'sp-1',
    name: 'Cyberpunk Hero',
    description: 'Neon-lit, high-contrast character design with augmented cybernetic features and dystopian flair.',
    category: 'character',
    injectionPrompt: 'Apply cyberpunk aesthetic: neon glow, chrome implants, rain-soaked streets, holographic HUD overlays.',
    tags: ['#sci-fi', '#character', '#neon', '#cyberpunk'],
    enabled: true,
    lastUsed: '1d ago',
  },
  {
    id: 'sp-2',
    name: 'Watercolor Dream',
    description: 'Soft watercolor wash effect with bleeding edges, muted pastels, and organic brush textures.',
    category: 'art-style',
    injectionPrompt: 'Render in watercolor style: soft edges, paper texture, transparent layering, muted warm palette.',
    tags: ['#watercolor', '#soft', '#artistic', '#pastel'],
    enabled: false,
    lastUsed: '3d ago',
  },
  {
    id: 'sp-3',
    name: 'Film Noir',
    description: 'Classic black-and-white cinematic look with dramatic shadows, venetian blinds lighting, and moody atmosphere.',
    category: 'cinematic-style',
    injectionPrompt: 'Apply film noir style: high contrast B&W, deep shadows, low-key lighting, 1940s atmosphere, grain texture.',
    tags: ['#noir', '#cinematic', '#monochrome'],
    enabled: true,
    lastUsed: '2h ago',
  },
  {
    id: 'sp-4',
    name: 'Enchanted Forest',
    description: 'Mystical woodland environment with bioluminescent flora, misty atmosphere, and ancient tree canopies.',
    category: 'environment',
    injectionPrompt: 'Create enchanted forest setting: bioluminescent plants, volumetric fog, ancient trees, magical particles, twilight.',
    tags: ['#forest', '#fantasy', '#magical', '#nature'],
    enabled: false,
    lastUsed: '5d ago',
  },
  {
    id: 'sp-5',
    name: 'Anime Protagonist',
    description: 'Vibrant anime character design with large expressive eyes, dynamic hair, and cel-shaded rendering.',
    category: 'character',
    injectionPrompt: 'Design in anime style: large eyes, cel shading, vibrant palette, dynamic pose, speed lines, detailed hair.',
    tags: ['#anime', '#character', '#vibrant'],
    enabled: true,
    lastUsed: 'Just now',
  },
];

const STORAGE_KEY = 'aure_style_memory_profiles';
const EVENT_NAME = 'aure_style_memory_updated';

export function getStoredStyleProfiles(): StyleProfile[] {
  if (typeof window === 'undefined') return INITIAL_PROFILES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROFILES));
      return INITIAL_PROFILES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PROFILES;
  }
}

export function saveStyleProfiles(profiles: StyleProfile[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    window.dispatchEvent(new Event(EVENT_NAME));
  } catch (err) {
    console.error('Failed to save style profiles:', err);
  }
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

export function useStyleProfiles(): [StyleProfile[], (profiles: StyleProfile[]) => void] {
  const [profiles, setProfilesState] = useState<StyleProfile[]>(() => {
    if (typeof window === 'undefined') return INITIAL_PROFILES;
    return getStoredStyleProfiles();
  });

  useEffect(() => {
    const handleUpdate = () => {
      setProfilesState(getStoredStyleProfiles());
    };

    handleUpdate();
    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const setProfiles = (newProfiles: StyleProfile[]) => {
    setProfilesState(newProfiles);
    saveStyleProfiles(newProfiles);
  };

  return [profiles, setProfiles];
}
