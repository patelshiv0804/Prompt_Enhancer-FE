'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import { useTheme, D } from '@/theme/theme';
import ThemeToggle from '@/components/ThemeToggle';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Header({ activeTab = 'Draft', onTabChange }: HeaderProps) {
  const {
    styleProfiles,
    activeStyle,
    setActiveStyle,
    activeTarget,
    setActiveTarget,
    activeEngine,
    setActiveEngine,
  } = useAuth();

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);

  // Below 768px the shared shell has a floating hamburger at top-left.
  // We distinguish phones (<640px) vs tablets (640px-1024px) so tablet retains the toggle.
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isPhone  = useMediaQuery('(max-width: 639px)');

  const styleDropdownRef  = useRef<HTMLDivElement>(null);
  const targetDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (styleDropdownRef.current && !styleDropdownRef.current.contains(event.target as Node))
        setShowStyleDropdown(false);
      if (targetDropdownRef.current && !targetDropdownRef.current.contains(event.target as Node))
        setShowTargetDropdown(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStyleColor = (type: string) => {
    if (type === 'cinematic' || type === 'cinematic-style') return '#f59e0b';
    if (type === 'art_style' || type === 'art-style') return '#ec4899';
    if (type === 'environment') return '#10b981';
    if (type === 'brand_voice' || type === 'brand-voice') return '#3b82f6';
    return '#7C3AED';
  };

  // Only active styles (is_active === true or enabled === true) should appear in the dropdown
  const activeProfiles = styleProfiles.filter(p => (p as any).is_active ?? (p as any).enabled ?? true);

  const styles = [
    { id: null, name: 'None', color: '#9ca3af' },
    ...activeProfiles.map(p => ({
      id: p.id,
      name: p.name,
      color: getStyleColor(p.type),
    })),
  ];

  const models  = ['ChatGPT', 'Claude', 'Gemini', 'Grok', 'Midjourney', 'VEO', 'DALL-E', 'Stable Diffusion'];
  const engines = ['Claude Sonnet 4.5', 'GPT-5.2'];

  const activeStyleObj = styles.find(s => s.id === activeStyle.id) || styles[0];

  /* ── Shared inline styles as objects for readability ── */
  const pillBase: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: isPhone ? 4 : 6,
    height: isPhone ? 28 : 36, padding: isPhone ? '0 8px' : '0 14px',
    borderRadius: 9999, fontSize: isPhone ? 11 : 13, fontWeight: 500, cursor: 'pointer',
    whiteSpace: 'nowrap', transition: 'all 200ms ease',
    background: isDark ? 'rgba(20, 19, 32, 0.85)' : 'rgba(255, 255, 255, 0.95)',
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(124, 58, 237, 0.16)'}`,
    color: isDark ? D.textPrimary : 'var(--color-text-primary)',
    boxShadow: isDark
      ? '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
      : '0 1px 3px rgba(109, 40, 217, 0.05), inset 0 1px 0 rgba(255, 255, 255, 1)',
  };

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: isPhone ? '14px 16px 10px' : (isMobile ? '18px 24px 14px' : '28px 36px 20px'),
      marginBottom: isPhone ? 18 : (isMobile ? 22 : 12),
      gap: isPhone ? 6 : 12, flexWrap: 'nowrap', flexShrink: 0,
      maxWidth: 1100, margin: isPhone ? '0 auto 18px' : (isMobile ? '0 auto 22px' : '0 auto 12px'), width: '100%',
    }}>
      {/* Left: Title + Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isPhone ? 8 : 14, paddingLeft: isMobile ? 40 : 0, minWidth: 0, flexShrink: 0 }}>
        <h1 style={{ fontSize: isPhone ? 17 : (isMobile ? 20 : 22), fontWeight: 700, color: isDark ? D.textPrimary : 'var(--color-text-primary)', letterSpacing: '-0.02em', margin: 0, whiteSpace: 'nowrap' }}>
          {activeTab === 'Vault' ? 'Vault' : 'Optimizer'}
        </h1>

        {/* Recessed tab trough — hidden ONLY on phones (<640px), visible on tablet & desktop */}
        {!isPhone && (
          <div style={{
            display: 'flex', alignItems: 'center',
            background: isDark
              ? 'rgba(20, 19, 32, 0.8)'
              : 'linear-gradient(160deg, rgba(109,40,217,0.10) 0%, rgba(124,58,237,0.04) 100%)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(124,58,237,0.13)'}`,
            borderRadius: 9999, padding: 3, gap: 2,
            boxShadow: isDark
              ? 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.08)'
              : 'inset 0 2px 5px rgba(80,20,180,0.14), inset 0 1px 2px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.75)',
          }}>
            {['Draft', 'Vault'].map(tab => (
              <button
                key={tab}
                onClick={() => onTabChange?.(tab)}
                style={{
                  fontSize: 12.5, fontWeight: tab === activeTab ? 600 : 500,
                  color: tab === activeTab ? (isDark ? D.textPrimary : 'var(--color-text-primary)') : (isDark ? D.textMuted : 'var(--color-text-secondary)'),
                  padding: '4px 13px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                  background: tab === activeTab ? (isDark ? '#1E1B2E' : '#ffffff') : 'transparent',
                  boxShadow: tab === activeTab
                    ? (isDark
                        ? 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 10px rgba(0,0,0,0.5), 0 0 0 1px rgba(167,139,250,0.2)'
                        : 'inset 0 1px 0 rgba(255,255,255,0.90), 0 4px 8px rgba(80,20,180,0.12), 0 1px 3px rgba(0,0,0,0.10), 0 0 0 1px rgba(124,58,237,0.07)')
                    : 'none',
                  transform: tab === activeTab ? 'translateY(-0.5px)' : 'none',
                  transition: 'all 250ms ease',
                }}
              >{tab}</button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Style + Target pills + ThemeToggle */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isPhone ? 6 : 10,
        flexShrink: 0,
        marginLeft: 'auto',
      }}>
        {activeTab !== 'Vault' && (
          <>
            {/* Style dropdown */}
            <div style={{ position: 'relative', flexShrink: 0 }} ref={styleDropdownRef}>
              <button
                onClick={() => { setShowStyleDropdown(!showStyleDropdown); setShowTargetDropdown(false); }}
                style={pillBase}
                className="hover:translate-y-[-1px] active:scale-[0.98]"
              >
                <span style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: isPhone ? 6 : 8,
                  height: isPhone ? 6 : 8,
                  flexShrink: 0,
                }}>
                  {activeStyleObj.id && (
                    <span
                      style={{
                        position: 'absolute',
                        inset: -2,
                        borderRadius: '50%',
                        background: activeStyleObj.color,
                        opacity: 0.4,
                      }}
                      className="animate-ping"
                    />
                  )}
                  <span style={{ width: isPhone ? 6 : 8, height: isPhone ? 6 : 8, borderRadius: '50%', background: activeStyleObj.color, display: 'inline-block' }} />
                </span>
                <span style={{ fontSize: isPhone ? 9.5 : 11, fontWeight: 700, color: isDark ? D.textMuted : 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Style</span>
                <span style={{ opacity: 0.3, fontSize: isPhone ? 9.5 : 11 }}>|</span>
                <span style={{ fontWeight: 600, fontSize: isPhone ? 11 : 12.5, color: isDark ? D.textPrimary : '#111', maxWidth: isPhone ? 65 : 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activeStyle.name}
                </span>
                <ChevronDown size={isPhone ? 10 : 13} style={{ opacity: 0.5, flexShrink: 0 }} />
              </button>

              {showStyleDropdown && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: isDark ? 'rgba(20, 19, 32, 0.96)' : 'rgba(255,255,255,0.98)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(124,58,237,0.15)'}`,
                  borderRadius: 16, minWidth: 200,
                  overflow: 'hidden', zIndex: 100,
                  boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.6)' : '0 12px 36px rgba(109,40,217,0.14), 0 4px 12px rgba(0,0,0,0.06)',
                  animation: 'dropdownFadeIn 150ms ease',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: isDark ? D.textMuted : 'var(--color-text-secondary)', padding: '10px 14px 6px' }}>
                    Style Memory
                  </div>
                  <div style={{ padding: '4px 6px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {styles.map(style => (
                      <button key={style.name} onClick={() => { setActiveStyle({ id: style.id, name: style.name }); setShowStyleDropdown(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px',
                          fontSize: 13, fontWeight: activeStyle.name === style.name ? 650 : 500,
                          color: activeStyle.name === style.name ? 'var(--color-primary)' : (isDark ? D.textPrimary : 'var(--color-text-primary)'),
                          background: activeStyle.name === style.name ? (isDark ? 'rgba(139,92,246,0.18)' : 'rgba(124,58,237,0.08)') : 'transparent',
                          borderRadius: 10, textAlign: 'left', border: 'none', cursor: 'pointer',
                        }}
                        className="transition-colors"
                      >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: style.color, display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{style.name}</span>
                        {activeStyle.name === style.name && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-primary)' }}>Active</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Target dropdown */}
            <div style={{ position: 'relative', flexShrink: 0 }} ref={targetDropdownRef}>
              <button
                onClick={() => { setShowTargetDropdown(!showTargetDropdown); setShowStyleDropdown(false); }}
                style={pillBase}
                className="hover:translate-y-[-1px] active:scale-[0.98]"
              >
                <span style={{ width: isPhone ? 6 : 7, height: isPhone ? 6 : 7, borderRadius: '50%', background: '#8B5CF6', display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontSize: isPhone ? 9.5 : 11, fontWeight: 700, color: isDark ? D.textMuted : 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Target</span>
                <span style={{ opacity: 0.3, fontSize: isPhone ? 9.5 : 11 }}>|</span>
                <span style={{ fontWeight: 650, fontSize: isPhone ? 11 : 12.5, color: '#8B5CF6', maxWidth: isPhone ? 65 : 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activeTarget}
                </span>
                <ChevronDown size={isPhone ? 10 : 13} style={{ opacity: 0.5, flexShrink: 0 }} />
              </button>

              {showTargetDropdown && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: isDark ? 'rgba(20, 19, 32, 0.96)' : 'rgba(255,255,255,0.98)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(124,58,237,0.15)'}`,
                  borderRadius: 16, minWidth: 220,
                  overflow: 'hidden', zIndex: 100,
                  boxShadow: isDark ? '0 12px 36px rgba(0,0,0,0.6)' : '0 12px 36px rgba(109,40,217,0.14), 0 4px 12px rgba(0,0,0,0.06)',
                  animation: 'dropdownFadeIn 150ms ease',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: isDark ? D.textMuted : 'var(--color-text-secondary)', padding: '10px 14px 6px' }}>
                    Target AI model
                  </div>
                  <div style={{ padding: '4px 6px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {models.map(model => (
                      <button key={model} onClick={() => { setActiveTarget(model); setShowTargetDropdown(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px',
                          fontSize: 13, fontWeight: activeTarget === model ? 650 : 500,
                          color: activeTarget === model ? 'var(--color-primary)' : (isDark ? D.textPrimary : 'var(--color-text-primary)'),
                          background: activeTarget === model ? (isDark ? 'rgba(139,92,246,0.18)' : 'rgba(124,58,237,0.08)') : 'transparent',
                          borderRadius: 10, textAlign: 'left', border: 'none', cursor: 'pointer',
                        }}
                        className="transition-colors"
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0, opacity: activeTarget === model ? 1 : 0 }} />
                        <span style={{ flex: 1 }}>{model}</span>
                        {activeTarget === model && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-primary)' }}>Selected</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div style={{ height: 1, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.08)', margin: '4px 8px' }} />
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: isDark ? D.textMuted : 'var(--color-text-secondary)', padding: '6px 14px' }}>
                    Optimizer Engine
                  </div>
                  <div style={{ padding: '4px 6px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {engines.map(engine => (
                      <button key={engine} onClick={() => { setActiveEngine(engine); setShowTargetDropdown(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px',
                          fontSize: 13, fontWeight: activeEngine === engine ? 650 : 500,
                          color: activeEngine === engine ? 'var(--color-primary)' : (isDark ? D.textPrimary : 'var(--color-text-primary)'),
                          background: activeEngine === engine ? (isDark ? 'rgba(139,92,246,0.18)' : 'rgba(124,58,237,0.08)') : 'transparent',
                          borderRadius: 10, textAlign: 'left', border: 'none', cursor: 'pointer',
                        }}
                        className="transition-colors"
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0, opacity: activeEngine === engine ? 1 : 0 }} />
                        <span style={{ flex: 1 }}>{engine}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Global Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
