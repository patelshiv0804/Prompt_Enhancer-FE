'use client';

import React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export interface SettingsSkeletonProps {
  activeTab?: 'settings' | 'profile';
}

export default function SettingsSkeleton({ activeTab = 'settings' }: SettingsSkeletonProps) {
  const isDesktop = useMediaQuery('(min-width: 1081px)');
  const isTablet = useMediaQuery('(max-width: 1080px) and (min-width: 641px)');
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isSmall = useMediaQuery('(max-width: 420px)');
  const pagePadX = isSmall ? 16 : isMobile ? 20 : isTablet ? 32 : 48;

  return (
    <div
      id="settings-skeleton"
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: `0 ${pagePadX}px`,
        paddingTop: 8,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: 80,
      }}
    >
      {/* ── Top Header Skeleton ── */}
      <div style={{ padding: isMobile ? '36px 0 20px' : '26px 0 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="skeleton" style={{ width: 140, height: 18, borderRadius: 6 }} />
            <div className="skeleton" style={{ width: isMobile ? 200 : 260, height: 28, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: isMobile ? 280 : 420, height: 14, borderRadius: 4 }} />
          </div>

          {/* Segmented Switcher Skeleton */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(124, 58, 237, 0.06)',
              padding: 4,
              borderRadius: 14,
              border: '1px solid rgba(124, 58, 237, 0.12)',
              gap: 4,
            }}
          >
            <div
              className="skeleton"
              style={{
                width: 80,
                height: 34,
                borderRadius: 10,
                background: activeTab === 'profile' ? '#FFFFFF' : 'transparent',
              }}
            />
            <div
              className="skeleton"
              style={{
                width: 88,
                height: 34,
                borderRadius: 10,
                background: activeTab === 'settings' ? '#FFFFFF' : 'transparent',
              }}
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
         PROFILE SKELETON (Bento Grid)
         ═══════════════════════════════════════════════════ */}
      {activeTab === 'profile' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isDesktop ? '1.15fr 0.85fr' : '1fr',
            gap: 24,
            width: '100%',
          }}
        >
          {/* Left Column: Identity & Plan Bento */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Identity Card Skeleton */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 24,
                border: '1px solid rgba(124, 58, 237, 0.12)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: 100,
                  background: 'linear-gradient(135deg, #1E1035 0%, #2E1254 50%, #4C1D95 100%)',
                  position: 'relative',
                }}
              >
                <div
                  className="skeleton"
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 16,
                    width: 70,
                    height: 22,
                    borderRadius: 99,
                    background: 'rgba(255, 255, 255, 0.25)',
                  }}
                />
              </div>

              <div style={{ padding: '0 28px 26px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: -40, marginBottom: 14 }}>
                  <div
                    className="skeleton"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      border: '4px solid #FFFFFF',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="skeleton" style={{ width: 140, height: 22, borderRadius: 6 }} />
                    <div className="skeleton" style={{ width: 65, height: 18, borderRadius: 6 }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="skeleton" style={{ width: 160, height: 14, borderRadius: 4 }} />
                    <div className="skeleton" style={{ width: 60, height: 16, borderRadius: 9999 }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Spotlight Skeleton */}
            <div
              style={{
                background: 'linear-gradient(135deg, #09090D 0%, #150D2A 50%, #200E3E 100%)',
                borderRadius: 24,
                border: '1px solid rgba(139, 92, 246, 0.22)',
                padding: isMobile ? '22px 18px' : '28px 30px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div className="skeleton" style={{ width: 80, height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.15)' }} />
                  <div className="skeleton" style={{ width: 160, height: 20, borderRadius: 6, background: 'rgba(255,255,255,0.25)' }} />
                </div>
                <div className="skeleton" style={{ width: 55, height: 20, borderRadius: 9999, background: 'rgba(255,255,255,0.18)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="skeleton" style={{ width: '100%', height: 6, borderRadius: 9999, background: 'rgba(255,255,255,0.12)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
                {[1, 2, 3, 4].map((_, i) => (
                  <div key={i} className="skeleton" style={{ width: '85%', height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.12)' }} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Telemetry & Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* KPI Metrics Skeleton */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 24,
                border: '1px solid rgba(124, 58, 237, 0.12)',
                padding: '24px 26px',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="skeleton" style={{ width: 160, height: 18, borderRadius: 6 }} />
                <div className="skeleton" style={{ width: 65, height: 12, borderRadius: 4 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[1, 2, 3].map((_, i) => (
                  <div key={i} style={{ background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0', padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div className="skeleton" style={{ width: 16, height: 16, borderRadius: '50%' }} />
                    <div className="skeleton" style={{ width: 36, height: 18, borderRadius: 4 }} />
                    <div className="skeleton" style={{ width: 45, height: 10, borderRadius: 4 }} />
                  </div>
                ))}
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div className="skeleton" style={{ width: 120, height: 12, borderRadius: 4 }} />
                  <div className="skeleton" style={{ width: 60, height: 12, borderRadius: 4 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 44 }}>
                  {[35, 60, 45, 75, 95, 70, 90].map((h, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div className="skeleton" style={{ width: '100%', borderRadius: 4, height: `${Math.round((h / 100) * 36)}px` }} />
                      <div className="skeleton" style={{ width: 10, height: 8, borderRadius: 2 }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Badges Skeleton */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 24,
                border: '1px solid rgba(124, 58, 237, 0.12)',
                padding: '24px 26px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="skeleton" style={{ width: 130, height: 18, borderRadius: 6 }} />
                <div className="skeleton" style={{ width: 60, height: 18, borderRadius: 9999 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {[1, 2, 3, 4].map((_, i) => (
                  <div key={i} style={{ padding: 12, borderRadius: 14, border: '1px solid #F1F5F9', background: '#FAF5FF', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                      <div className="skeleton" style={{ width: '80%', height: 12, borderRadius: 4 }} />
                      <div className="skeleton" style={{ width: '60%', height: 10, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ═══════════════════════════════════════════════════
           SETTINGS SKELETON (Bento Grid)
           ═══════════════════════════════════════════════════ */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 24,
              border: '1px solid rgba(124, 58, 237, 0.12)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              padding: isMobile ? '22px 18px' : '32px 36px',
              display: 'flex',
              flexDirection: 'column',
              gap: 32,
            }}
          >
            {/* Appearance */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="skeleton" style={{ width: 110, height: 16, borderRadius: 4 }} />
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(3, 160px)', gap: 12 }}>
                {[1, 2, 3].map((_, i) => (
                  <div key={i} style={{ padding: '12px 8px', borderRadius: 14, border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div className="skeleton" style={{ width: 42, height: 28, borderRadius: 6 }} />
                    <div className="skeleton" style={{ width: 45, height: 12, borderRadius: 4 }} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: 'rgba(124, 58, 237, 0.08)' }} />

            {/* 12 Roles Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="skeleton" style={{ width: 170, height: 16, borderRadius: 4 }} />
                <div className="skeleton" style={{ width: 55, height: 18, borderRadius: 9999 }} />
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isDesktop ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
                  gap: 10,
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((_, i) => (
                  <div key={i} style={{ padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(124, 58, 237, 0.10)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                      <div className="skeleton" style={{ width: '70%', height: 13, borderRadius: 4 }} />
                      {i !== 0 && <div className="skeleton" style={{ width: '45%', height: 10, borderRadius: 4 }} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mode Container */}
            <div style={{ background: '#F8FAFC', borderRadius: 18, border: '1px solid #E2E8F0', padding: isMobile ? '16px 14px' : '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="skeleton" style={{ width: 140, height: 18, borderRadius: 9999 }} />
                <div className="skeleton" style={{ width: isMobile ? 120 : 200, height: 32, borderRadius: 8 }} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[80, 95, 70, 85, 90, 75, 100, 80, 65, 90].map((w, i) => (
                  <div key={i} className="skeleton" style={{ width: w, height: 30, borderRadius: 9999 }} />
                ))}
              </div>
            </div>

            {/* AI Models (Temporarily commented out) ──
            <div style={{ height: 1, background: 'rgba(124, 58, 237, 0.08)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="skeleton" style={{ width: 180, height: 16, borderRadius: 4 }} />
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isDesktop ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)', gap: 10 }}>
                {[1, 2, 3, 4, 5, 6, 7].map((_, i) => (
                  <div key={i} style={{ padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(124, 58, 237, 0.10)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div className="skeleton" style={{ width: 60, height: 10, borderRadius: 4 }} />
                    <div className="skeleton" style={{ width: 90, height: 14, borderRadius: 4 }} />
                    <div className="skeleton" style={{ width: 65, height: 12, borderRadius: 4 }} />
                  </div>
                ))}
              </div>
            </div>
            */}

            {/* Automation Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[1, 2].map((_, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div className="skeleton" style={{ width: 160, height: 14, borderRadius: 4 }} />
                    <div className="skeleton" style={{ width: isMobile ? 180 : 280, height: 12, borderRadius: 4 }} />
                  </div>
                  <div className="skeleton" style={{ width: 44, height: 24, borderRadius: 9999 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
