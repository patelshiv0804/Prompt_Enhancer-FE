import React from 'react';
import { User, Briefcase, Zap, Sun, Check, Image as ImageIcon } from 'lucide-react';
import { ROLES } from '@/constants/roles';
import { renderPresetAvatar, getInitials } from '@/constants/avatars';

interface CompletionStepProps {
  displayName: string;
  role: string;
  mode: string;
  avatarUrl: string | null;
  avatarPreset: number;
  theme: 'light' | 'dark' | 'system';
  isDark: boolean;
}

export const CompletionStep: React.FC<CompletionStepProps> = ({
  displayName,
  role,
  mode,
  avatarUrl,
  avatarPreset,
  theme,
  isDark,
}) => {
  const roleObj = ROLES.find(
    (r) => r.id.toLowerCase() === role.toLowerCase() || r.label.toLowerCase() === role.toLowerCase()
  ) || ROLES[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, width: '100%', height: '100%', alignItems: 'center', textAlign: 'center', boxSizing: 'border-box' }}>
      {/* Green Checkmark Circle */}
      <div style={{ position: 'relative' }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: '#10B981', color: '#FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(16, 185, 129, 0.30)',
        }}>
          <Check size={28} strokeWidth={3.5} />
        </div>

        {/* Confetti particles */}
        <div style={{ position: 'absolute', top: -6, left: -8, width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} />
        <div style={{ position: 'absolute', top: 8, right: -10, width: 5, height: 5, borderRadius: '50%', background: '#EC4899' }} />
        <div style={{ position: 'absolute', bottom: -3, left: -5, width: 6, height: 6, borderRadius: '50%', background: '#3B82F6' }} />
        <div style={{ position: 'absolute', bottom: 3, right: -6, width: 6, height: 6, borderRadius: '50%', background: '#A855F7' }} />
      </div>

      {/* Summary Card with 2 Columns */}
      <div style={{
        width: '100%', padding: '14px 20px', borderRadius: 16,
        background: isDark ? 'rgba(255,255,255,0.03)' : '#FAFAFA',
        border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.10)' : '#E4E4E7'}`,
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
        textAlign: 'left', boxSizing: 'border-box',
      }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Display Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={15} style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#71717A', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.6)' : '#71717A', minWidth: 75 }}>Display Name</span>
            <strong style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#FFFFFF' : '#18181B' }}>{displayName}</strong>
          </div>

          {/* Role */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Briefcase size={15} style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#71717A', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.6)' : '#71717A', minWidth: 75 }}>Role</span>
            <strong style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#FFFFFF' : '#18181B' }}>{roleObj.label}</strong>
          </div>

          {/* Mode */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={15} style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#71717A', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.6)' : '#71717A', minWidth: 75 }}>Mode</span>
            <strong style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#FFFFFF' : '#18181B' }}>{mode}</strong>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ImageIcon size={15} style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#71717A', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.6)' : '#71717A', minWidth: 55 }}>Avatar</span>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Avatar" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
            ) : avatarPreset === 0 ? (
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#6366F1' }}>
                {getInitials(displayName)}
              </div>
            ) : (
              renderPresetAvatar(avatarPreset, 24, 11)
            )}
          </div>

          {/* Theme */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sun size={15} style={{ color: isDark ? 'rgba(255,255,255,0.5)' : '#71717A', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.6)' : '#71717A', minWidth: 55 }}>Theme</span>
            <strong style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#FFFFFF' : '#18181B', textTransform: 'capitalize' }}>{theme}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
