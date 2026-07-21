'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronDown, Zap } from 'lucide-react';
import { useEnabledStyleOptions } from '@/features/style-memory/services/styleMemoryService';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Header({ activeTab = 'Draft', onTabChange }: HeaderProps) {
  const router = useRouter();
  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const [activeStyle, setActiveStyle]             = useState('None');
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [activeTarget, setActiveTarget]           = useState('ChatGPT');
  const [activeEngine, setActiveEngine]           = useState('Claude Sonnet 4.5');

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

  const styleOptions = useEnabledStyleOptions();
  const styles = styleOptions.map(o => ({ name: o.label, color: o.color }));

  useEffect(() => {
    if (!styles.some(s => s.name === activeStyle)) {
      setActiveStyle('None');
    }
  }, [styles, activeStyle]);

  const models  = ['ChatGPT', 'Claude', 'Gemini', 'Grok', 'Midjourney', 'VEO', 'DALL-E', 'Stable Diffusion'];
  const engines = ['Claude Sonnet 4.5', 'GPT-5.2'];

  const activeStyleObj = styles.find(s => s.name === activeStyle) || styles[0];

  /* ── Shared inline styles as objects for readability ── */
  const pillBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
    borderRadius: 9999, fontSize: 13, fontWeight: 500, cursor: 'pointer',
    whiteSpace: 'nowrap', transition: 'all 250ms ease',
  };

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '32px 48px 24px', gap: 16, flexShrink: 0,
      maxWidth: 1100, margin: '0 auto', width: '100%',
      position: 'relative', zIndex: 10,
    }}>
      {/* Left: Title + Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
          {activeTab === 'Vault' ? 'Vault' : 'Optimizer'}
        </h1>

        {/* Recessed tab trough */}
        <div style={{
          display: 'flex', alignItems: 'center',
          background: 'linear-gradient(160deg, rgba(109,40,217,0.10) 0%, rgba(124,58,237,0.04) 100%)',
          border: '1px solid rgba(124,58,237,0.13)', borderRadius: 9999, padding: 3, gap: 2,
          boxShadow: 'inset 0 2px 5px rgba(80,20,180,0.14), inset 0 1px 2px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.75)',
        }}>
          {['Draft', 'Vault'].map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange?.(tab)}
              style={{
                fontSize: 13, fontWeight: tab === activeTab ? 600 : 500,
                color: tab === activeTab ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                padding: '5px 14px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                background: tab === activeTab ? '#ffffff' : 'transparent',
                boxShadow: tab === activeTab
                  ? 'inset 0 1px 0 rgba(255,255,255,0.90), 0 4px 8px rgba(80,20,180,0.12), 0 1px 3px rgba(0,0,0,0.10), 0 0 0 1px rgba(124,58,237,0.07)'
                  : 'none',
                transform: tab === activeTab ? 'translateY(-0.5px)' : 'none',
                transition: 'all 250ms ease',
              }}
            >{tab}</button>
          ))}
        </div>
      </div>

      {/* Right: Style + Target pills or New Prompt */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {activeTab === 'Vault' ? (
          <button id="vault-new-prompt-btn" style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', color: 'white', boxShadow: '0 4px 14px rgba(124,58,237,0.30)', transition: 'all 200ms ease',
          }} className="hover:translate-y-[-1px] hover:brightness-105" onClick={() => router.push('/dashboard/optimizer')}>
            <Zap size={14} strokeWidth={2} />New Prompt
          </button>
        ) : (
          <>
            {/* Style dropdown */}
            <div style={{ position: 'relative' }} ref={styleDropdownRef}>
              <button
                onClick={() => { setShowStyleDropdown(!showStyleDropdown); setShowTargetDropdown(false); }}
                style={{
                  ...pillBase,
                  background: 'linear-gradient(160deg, rgba(109,40,217,0.07) 0%, rgba(255,255,255,0.80) 100%)',
                  border: '1px solid rgba(124,58,237,0.13)', color: 'var(--color-text-primary)',
                  boxShadow: 'inset 0 2px 4px rgba(80,20,180,0.10), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.90)',
                }}
                className="hover:translate-y-[-1px] hover:border-[rgba(124,58,237,0.22)] hover:shadow-[inset_0_1px_3px_rgba(80,20,180,0.08),0_3px_10px_rgba(124,58,237,0.10),0_1px_0_rgba(255,255,255,1)]"
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: activeStyleObj.color, display: 'inline-block', flexShrink: 0 }} />
                <span style={{ opacity: 0.6 }}>Style</span>
                <span style={{ opacity: 0.3 }}>|</span>
                <span style={{ fontWeight: 600 }}>{activeStyle}</span>
                <ChevronDown size={13} style={{ opacity: 0.5 }} />
              </button>

              <AnimatePresence>
                {showStyleDropdown && (
                  <motion.div
                    key="style-dropdown"
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white',
                    border: '1px solid rgba(124,58,237,0.10)', borderRadius: 12, minWidth: 200,
                    overflow: 'hidden', zIndex: 100,
                    boxShadow: '0 8px 24px rgba(109,40,217,0.10), 0 2px 8px rgba(0,0,0,0.06)',
                    transformOrigin: 'top right',
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', padding: '10px 12px 6px' }}>
                      Style Memory
                    </div>
                    <div style={{ padding: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {styles.map(style => (
                        <button key={style.name} onClick={() => { setActiveStyle(style.name); setShowStyleDropdown(false); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px',
                            fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)',
                            borderRadius: 8, textAlign: 'left', border: 'none', cursor: 'pointer', background: 'transparent',
                            transition: 'background 150ms ease',
                          }}
                          className="hover:bg-[rgba(124,58,237,0.05)]"
                        >
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: style.color, display: 'inline-block' }} />
                          {style.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Target dropdown */}
            <div style={{ position: 'relative' }} ref={targetDropdownRef}>
              <button
                onClick={() => { setShowTargetDropdown(!showTargetDropdown); setShowStyleDropdown(false); }}
                style={{
                  ...pillBase,
                  background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', color: 'white',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 5px 16px rgba(124,58,237,0.38), 0 2px 5px rgba(0,0,0,0.14), 0 0 0 1px rgba(124,58,237,0.20)',
                }}
                className="hover:translate-y-[-2px] hover:brightness-105 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_8px_24px_rgba(124,58,237,0.48),0_3px_8px_rgba(0,0,0,0.16),0_0_0_1px_rgba(124,58,237,0.25)]"
              >
                <span style={{ opacity: 0.75 }}>Target</span>
                <span style={{ opacity: 0.4 }}>|</span>
                <span style={{ fontWeight: 600 }}>{activeTarget}</span>
                <ChevronDown size={13} style={{ opacity: 0.6 }} />
              </button>

              <AnimatePresence>
                {showTargetDropdown && (
                  <motion.div
                    key="target-dropdown"
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white',
                    border: '1px solid rgba(124,58,237,0.10)', borderRadius: 12, minWidth: 220,
                    overflow: 'hidden', zIndex: 100,
                    boxShadow: '0 8px 24px rgba(109,40,217,0.10), 0 2px 8px rgba(0,0,0,0.06)',
                    transformOrigin: 'top right',
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', padding: '10px 12px 6px' }}>
                      Target AI model
                    </div>
                    <div style={{ padding: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {models.map(model => (
                        <button key={model} onClick={() => { setActiveTarget(model); setShowTargetDropdown(false); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px',
                            fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)',
                            borderRadius: 8, textAlign: 'left', border: 'none', cursor: 'pointer', background: 'transparent',
                            transition: 'background 150ms ease',
                          }}
                          className="hover:bg-[rgba(124,58,237,0.05)]"
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0, opacity: activeTarget === model ? 1 : 0, transition: 'opacity 150ms ease' }} />
                          {model}
                        </button>
                      ))}
                    </div>
                    <div style={{ height: 1, background: 'rgba(124,58,237,0.08)', margin: '4px 0' }} />
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-secondary)', padding: '6px 12px' }}>
                      Optimizer Engine
                    </div>
                    <div style={{ padding: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {engines.map(engine => (
                        <button key={engine} onClick={() => { setActiveEngine(engine); setShowTargetDropdown(false); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px',
                            fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)',
                            borderRadius: 8, textAlign: 'left', border: 'none', cursor: 'pointer', background: 'transparent',
                            transition: 'background 150ms ease',
                          }}
                          className="hover:bg-[rgba(124,58,237,0.05)]"
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0, opacity: activeEngine === engine ? 1 : 0, transition: 'opacity 150ms ease' }} />
                          {engine}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
