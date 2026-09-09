import React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface ThemeStepProps {
  selectedTheme: 'light' | 'dark' | 'system';
  onSelectTheme: (theme: 'light' | 'dark' | 'system') => void;
  isDark: boolean;
}

export const ThemeStep: React.FC<ThemeStepProps> = ({
  selectedTheme,
  onSelectTheme,
  isDark,
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)');

  const themes = [
    {
      id: 'light' as const,
      label: 'Light',
      description: 'Clean, bright, and vibrant appearance',
      previewBg: '#F4F4F5',
      previewCard: '#FFFFFF',
      previewNav: '#E4E4E7',
      previewText: '#A1A1AA',
    },
    {
      id: 'dark' as const,
      label: 'Dark',
      description: 'Deep, sleek palette for focused work',
      previewBg: '#0F0528',
      previewCard: '#1E1238',
      previewNav: '#2D1B54',
      previewText: '#6366F1',
    },
    {
      id: 'system' as const,
      label: 'System',
      description: 'Follows your operating system scheme',
      previewBg: 'linear-gradient(135deg, #F4F4F5 50%, #0F0528 50%)',
      previewCard: 'linear-gradient(135deg, #FFFFFF 50%, #1E1238 50%)',
      previewNav: '#8B5CF6',
      previewText: '#8B5CF6',
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: isMobile ? 8 : 12,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: isMobile ? '4px 6px' : '8px 12px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? 10 : 16,
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {themes.map((item) => {
          const isSelected = selectedTheme === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTheme(item.id)}
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'row' : 'column',
                alignItems: isMobile ? 'center' : 'stretch',
                justifyContent: isMobile ? 'space-between' : 'flex-start',
                gap: isMobile ? 12 : 10,
                padding: isMobile ? '10px 14px' : '14px 12px',
                borderRadius: isMobile ? 14 : 18,
                border: isSelected
                  ? '2px solid #6366F1'
                  : `1.5px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#E4E4E7'}`,
                outline: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                position: 'relative',
                boxSizing: 'border-box',
                overflow: 'hidden',
                transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                background: isSelected
                  ? (isDark ? 'rgba(99, 102, 241, 0.16)' : '#F5F3FF')
                  : (isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF'),
                boxShadow: isSelected
                  ? (isDark
                      ? '0 0 0 1px rgba(99, 102, 241, 0.4), 0 8px 24px rgba(99, 102, 241, 0.25)'
                      : '0 0 0 1px rgba(99, 102, 241, 0.25), 0 8px 20px rgba(99, 102, 241, 0.15)')
                  : (isDark
                      ? '0 2px 6px rgba(0,0,0,0.2)'
                      : '0 2px 6px rgba(0,0,0,0.03)'),
              }}
              className="interactive-card hover:scale-[1.015] active:scale-[0.98]"
            >
              {/* Left Section on Mobile (or top on Desktop): Mock Preview + Labels */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'row' : 'column',
                  alignItems: isMobile ? 'center' : 'stretch',
                  gap: isMobile ? 12 : 10,
                  flex: 1,
                  minWidth: 0,
                  width: isMobile ? 'auto' : '100%',
                }}
              >
                {/* Mock Interface Preview Box */}
                <div
                  style={{
                    height: isMobile ? 44 : 76,
                    width: isMobile ? 64 : '100%',
                    borderRadius: isMobile ? 7 : 9,
                    background: item.previewBg,
                    padding: isMobile ? 4 : 8,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? 2.5 : 4,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: '40%',
                      height: isMobile ? 3.5 : 5,
                      borderRadius: 3,
                      background: item.previewNav,
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      borderRadius: 4,
                      background: item.previewCard,
                      padding: isMobile ? 3 : 6,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div
                      style={{
                        width: '70%',
                        height: 2.5,
                        borderRadius: 2,
                        background: item.previewText,
                      }}
                    />
                    <div
                      style={{
                        width: '50%',
                        height: 2.5,
                        borderRadius: 2,
                        background: item.previewText,
                        opacity: 0.5,
                      }}
                    />
                  </div>
                </div>

                {/* Title & Description */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: isMobile ? 13.5 : 13.5,
                      fontWeight: 700,
                      color: isDark ? '#FFFFFF' : '#18181B',
                    }}
                  >
                    {item.label}
                  </span>
                  {isMobile && (
                    <span
                      style={{
                        fontSize: 11,
                        color: isDark ? 'rgba(255,255,255,0.5)' : '#71717A',
                        marginTop: 1,
                      }}
                    >
                      {item.description}
                    </span>
                  )}
                </div>
              </div>

              {/* Radio Circle */}
              <div
                style={{
                  width: isMobile ? 16 : 18,
                  height: isMobile ? 16 : 18,
                  borderRadius: '50%',
                  border: isSelected
                    ? '5px solid #6366F1'
                    : `2px solid ${isDark ? 'rgba(255,255,255,0.3)' : '#D4D4D8'}`,
                  background: isSelected ? '#FFFFFF' : 'transparent',
                  transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                  boxSizing: 'border-box',
                  flexShrink: 0,
                  display: isMobile ? 'block' : 'inline-block',
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
