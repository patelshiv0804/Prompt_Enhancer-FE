import React from 'react';
import {
  Sparkles,
  Code,
  Palette,
  Zap,
  Flame,
  Fingerprint,
} from 'lucide-react';

export const presetAvatarGradients = [
  'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
  'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
  'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
  'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
];

export const presetIcons = [
  Sparkles,
  Code,
  Palette,
  Zap,
  Flame,
  Fingerprint,
];

export function getInitials(name: string): string {
  if (!name) return 'AP';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function renderPresetAvatar(
  idx: number,
  size: number = 64,
  iconSize: number = 28
): React.ReactElement {
  const Gradient = presetAvatarGradients[(idx - 1) % presetAvatarGradients.length] || presetAvatarGradients[0];
  const IconComponent = presetIcons[(idx - 1) % presetIcons.length] || presetIcons[0];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: Gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        border: '1px solid rgba(255, 255, 255, 0.20)',
        boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
        flexShrink: 0,
      }}
    >
      <IconComponent size={iconSize} strokeWidth={1.8} />
    </div>
  );
}
