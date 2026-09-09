import React from 'react';
import { User, AlertCircle, Check } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { AvatarStep } from './AvatarStep';

interface ProfileStepProps {
  displayName: string;
  onChangeName: (val: string) => void;
  onEnter?: () => void;
  avatarUrl: string | null;
  avatarPreset: number;
  onUploadFile: (file: File) => void;
  onSelectPreset: (presetIdx: number) => void;
  onRemovePhoto: () => void;
  isDark: boolean;
}

/**
 * Step 1 of the 4-step onboarding flow.
 * Merges the former "Display Name" and "Avatar" sections into a single
 * cohesive "Profile" step: the name field feeds the live avatar preview
 * rendered by the embedded AvatarStep.
 */
export const ProfileStep: React.FC<ProfileStepProps> = ({
  displayName,
  onChangeName,
  onEnter,
  avatarUrl,
  avatarPreset,
  onUploadFile,
  onSelectPreset,
  onRemovePhoto,
  isDark,
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isValid = displayName.trim().length >= 2;
  const isTooShort = displayName.trim().length > 0 && displayName.trim().length < 2;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? 14 : 18,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Name field */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label
          htmlFor="onboarding-display-name-input"
          style={{ fontSize: isMobile ? 12.5 : 13.5, fontWeight: 700, color: isDark ? '#FFFFFF' : '#18181B' }}
        >
          Your preferred name
        </label>
        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
          <User
            size={isMobile ? 16 : 18}
            style={{
              position: 'absolute',
              left: isMobile ? 14 : 16,
              color: isValid ? '#6366F1' : isDark ? 'rgba(255,255,255,0.4)' : '#A1A1AA',
              transition: 'color 200ms ease',
            }}
          />
          <input
            id="onboarding-display-name-input"
            type="text"
            value={displayName}
            onChange={(e) => onChangeName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isValid && onEnter) {
                e.preventDefault();
                onEnter();
              }
            }}
            placeholder="e.g. Shiv Patel"
            autoFocus
            style={{
              width: '100%',
              padding: isMobile ? '12px 38px 12px 40px' : '14px 44px 14px 46px',
              fontSize: isMobile ? 14 : 15,
              fontWeight: 600,
              borderRadius: 14,
              outline: 'none',
              background: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
              color: isDark ? '#FFFFFF' : '#18181B',
              border: isTooShort
                ? '2px solid #EF4444'
                : isValid
                  ? '2px solid #6366F1'
                  : `1.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#E4E4E7'}`,
              boxShadow: isValid ? '0 0 0 3px rgba(99, 102, 241, 0.15)' : '0 1px 3px rgba(0,0,0,0.03)',
              transition: 'all 200ms ease',
            }}
          />
          {isValid && (
            <div
              style={{
                position: 'absolute',
                right: isMobile ? 12 : 14,
                width: isMobile ? 20 : 22,
                height: isMobile ? 20 : 22,
                borderRadius: '50%',
                background: '#E6F4EA',
                color: '#10B981',
                border: '1.5px solid #10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Check size={isMobile ? 11 : 12} strokeWidth={3} />
            </div>
          )}
        </div>

        {isTooShort && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: '#EF4444',
              background: 'rgba(239, 68, 68, 0.08)',
              padding: '8px 12px',
              borderRadius: 10,
            }}
          >
            <AlertCircle size={14} /> Name must be at least 2 characters long.
          </div>
        )}
      </div>

      {/* Divider between name and avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 1, background: isDark ? 'rgba(255,255,255,0.08)' : '#EEF0F4' }} />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.3px',
            color: isDark ? 'rgba(255,255,255,0.5)' : '#94A3B8',
          }}
        >
          Profile picture
        </span>
        <div style={{ flex: 1, height: 1, background: isDark ? 'rgba(255,255,255,0.08)' : '#EEF0F4' }} />
      </div>

      {/* Avatar picker (embedded — sizes to content, feeds off displayName) */}
      <AvatarStep
        displayName={displayName || 'Shiv Patel'}
        avatarUrl={avatarUrl}
        avatarPreset={avatarPreset}
        onUploadFile={onUploadFile}
        onSelectPreset={onSelectPreset}
        onRemovePhoto={onRemovePhoto}
        isDark={isDark}
        embedded
      />
    </div>
  );
};
