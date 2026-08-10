import React from 'react';

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
  const themes = [
    {
      id: 'light' as const,
      label: 'Light',
      previewBg: '#F4F4F5',
      previewCard: '#FFFFFF',
      previewNav: '#E4E4E7',
      previewText: '#A1A1AA',
    },
    {
      id: 'dark' as const,
      label: 'Dark',
      previewBg: '#0F0528',
      previewCard: '#1E1238',
      previewNav: '#2D1B54',
      previewText: '#6366F1',
    },
    {
      id: 'system' as const,
      label: 'System',
      previewBg: 'linear-gradient(135deg, #F4F4F5 50%, #0F0528 50%)',
      previewCard: 'linear-gradient(135deg, #FFFFFF 50%, #1E1238 50%)',
      previewNav: '#8B5CF6',
      previewText: '#8B5CF6',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, width: '100%', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {themes.map((item) => {
          const isSelected = selectedTheme === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTheme(item.id)}
              style={{
                display: 'flex', flexDirection: 'column', gap: 10, padding: '12px',
                borderRadius: 16, border: 'none', cursor: 'pointer', textAlign: 'left',
                position: 'relative', transition: 'all 180ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                background: isSelected
                  ? (isDark ? 'rgba(99, 102, 241, 0.15)' : '#F5F3FF')
                  : (isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF'),
                outline: isSelected
                  ? '2px solid #6366F1'
                  : `1.5px solid ${isDark ? 'rgba(255,255,255,0.10)' : '#E4E4E7'}`,
                boxShadow: isSelected
                  ? '0 4px 14px rgba(99, 102, 241, 0.18)'
                  : '0 1px 2px rgba(0,0,0,0.02)',
              }}
              className="interactive-card hover:scale-[1.02] active:scale-[0.98]"
            >
              {/* Mock Interface Preview Box */}
              <div style={{
                height: 74, width: '100%', borderRadius: 10,
                background: item.previewBg, padding: 8,
                display: 'flex', flexDirection: 'column', gap: 4,
                border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden'
              }}>
                <div style={{ width: '40%', height: 5, borderRadius: 3, background: item.previewNav }} />
                <div style={{
                  flex: 1, borderRadius: 6, background: item.previewCard,
                  padding: 6, display: 'flex', flexDirection: 'column', gap: 3,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ width: '70%', height: 4, borderRadius: 2, background: item.previewText }} />
                  <div style={{ width: '50%', height: 4, borderRadius: 2, background: item.previewText, opacity: 0.5 }} />
                </div>
              </div>

              {/* Title & Radio button indicator */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#FFFFFF' : '#18181B' }}>
                  {item.label}
                </span>

                {/* Radio Circle */}
                <div style={{
                  width: 16, height: 16, borderRadius: '50%',
                  border: isSelected ? '4.5px solid #6366F1' : `1.5px solid ${isDark ? 'rgba(255,255,255,0.3)' : '#D4D4D8'}`,
                  background: isSelected ? '#FFFFFF' : 'transparent',
                  transition: 'all 180ms ease'
                }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
