import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { CompletionStep } from './CompletionStep';

interface FinishStepProps {
  displayName: string;
  role: string;
  mode: string;
  avatarUrl: string | null;
  avatarPreset: number;
  theme: 'light' | 'dark' | 'system';
  onSelectTheme: (theme: 'light' | 'dark' | 'system') => void;
  isDark: boolean;
}

const THEME_OPTIONS = [
  { id: 'light' as const, label: 'Light', icon: Sun },
  { id: 'dark' as const, label: 'Dark', icon: Moon },
  { id: 'system' as const, label: 'System', icon: Laptop },
];

/**
 * Step 4 of the 4-step onboarding flow.
 * Merges the former "Theme" and "Review" sections. The appearance segmented
 * control applies live (via onSelectTheme) and the embedded CompletionStep
 * review card reflects the choice through its theme pill.
 */
export const FinishStep: React.FC<FinishStepProps> = ({
  displayName,
  role,
  mode,
  avatarUrl,
  avatarPreset,
  theme,
  onSelectTheme,
  isDark,
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)');

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
      {/* Review summary + celebration (embedded — sizes to content) */}
      <CompletionStep
        displayName={displayName}
        role={role}
        mode={mode}
        avatarUrl={avatarUrl}
        avatarPreset={avatarPreset}
        theme={theme}
        isDark={isDark}
        embedded
      />

      {/* Appearance segmented control */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: isMobile ? 12 : 12.5,
              fontWeight: 700,
              color: isDark ? '#FFFFFF' : '#18181B',
            }}
          >
            Choose your appearance
          </span>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              color: isDark ? 'rgba(255,255,255,0.45)' : '#94A3B8',
            }}
          >
            Applies instantly
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: isMobile ? 8 : 10,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {THEME_OPTIONS.map((item) => {
            const isSelected = theme === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTheme(item.id)}
                aria-pressed={isSelected}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  padding: isMobile ? '9px 8px' : '11px 10px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  border: isSelected
                    ? '2px solid #6366F1'
                    : `1.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#E4E4E7'}`,
                  background: isSelected
                    ? isDark
                      ? 'rgba(99, 102, 241, 0.16)'
                      : '#F5F3FF'
                    : isDark
                      ? 'rgba(255,255,255,0.04)'
                      : '#FFFFFF',
                  boxShadow: isSelected
                    ? isDark
                      ? '0 0 0 1px rgba(99, 102, 241, 0.4), 0 6px 18px rgba(99, 102, 241, 0.22)'
                      : '0 0 0 1px rgba(99, 102, 241, 0.25), 0 6px 16px rgba(99, 102, 241, 0.14)'
                    : 'none',
                  transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="interactive-card hover:scale-[1.015] active:scale-[0.98]"
              >
                <Icon
                  size={isMobile ? 15 : 16}
                  style={{ color: isSelected ? '#6366F1' : isDark ? 'rgba(255,255,255,0.6)' : '#71717A' }}
                />
                <span
                  style={{
                    fontSize: isMobile ? 12.5 : 13,
                    fontWeight: 700,
                    color: isSelected ? '#6366F1' : isDark ? '#FFFFFF' : '#18181B',
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
