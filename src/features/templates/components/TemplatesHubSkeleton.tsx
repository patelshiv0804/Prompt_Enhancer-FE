'use client';

import React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTheme } from '@/theme/theme';

export default function TemplatesHubSkeleton() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isTablet = useMediaQuery('(max-width: 1024px) and (min-width: 640px)');
  const isPhone = useMediaQuery('(max-width: 639px)');
  const isSmall = useMediaQuery('(max-width: 420px)');
  const pagePadX = isSmall ? 16 : isPhone ? 20 : isTablet ? 32 : 48;
  const gridColumns = isPhone ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';

  return (
    <div
      id="templates-hub-skeleton"
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        paddingLeft: pagePadX,
        paddingRight: pagePadX,
        paddingTop: 8,
        paddingBottom: 64,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Top Header Skeleton ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: isPhone ? 'column' : 'row',
          alignItems: isPhone ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          padding: isPhone ? '18px 0 14px' : '26px 0 22px',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="skeleton" style={{ width: isSmall ? 150 : 190, height: isSmall ? 22 : 26, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: 72, height: 20, borderRadius: 9999 }} />
          </div>
          <div className="skeleton" style={{ width: isSmall ? 200 : 320, height: 14, borderRadius: 6 }} />
        </div>

        {/* Search & View Mode Switcher Skeleton */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: isPhone ? '100%' : 'auto' }}>
          <div className="skeleton" style={{ width: isPhone ? '100%' : 280, height: 38, borderRadius: 10 }} />
          <div className="skeleton" style={{ width: 68, height: 34, borderRadius: 8, flexShrink: 0 }} />
        </div>
      </div>

      {/* ── Segmented Tab Navigation Skeleton ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(124,58,237,0.10)',
          marginBottom: 22,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
          {[130, 110, 140, 85].map((w, i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                width: isSmall ? w * 0.8 : w,
                height: isSmall ? 30 : 34,
                borderRadius: '10px 10px 0 0',
              }}
            />
          ))}
        </div>

        {/* Category Pills Skeleton */}
        <div style={{ display: 'flex', gap: 6, paddingBottom: 6, overflowX: 'auto', width: isPhone ? '100%' : 'auto', scrollbarWidth: 'none' }}>
          {[44, 75, 70, 65, 85, 70, 80, 64].map((w, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ width: w, height: 24, borderRadius: 9999, flexShrink: 0 }}
            />
          ))}
        </div>
      </div>

      {/* ── Spotlight Banner Skeleton ── */}
      <div
        style={{
          borderRadius: isSmall ? 18 : isPhone ? 22 : 28,
          overflow: 'hidden',
          marginBottom: isPhone ? 24 : 32,
          position: 'relative',
          background: 'linear-gradient(145deg, #0C0620 0%, #150D30 30%, #1A0E3A 55%, #0D0920 100%)',
          boxShadow: '0 8px 32px rgba(109, 40, 217, 0.14)',
          border: '1px solid rgba(167, 139, 250, 0.18)',
        }}
      >
        {isPhone ? (
          /* Phone Skeleton (~300px) */
          <div style={{ padding: isSmall ? '16px 14px' : '20px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div className="skeleton" style={{ width: 80, height: 22, borderRadius: 9999, background: 'rgba(124,58,237,0.35)' }} />
                <div className="skeleton" style={{ width: 85, height: 22, borderRadius: 9999, background: 'rgba(255,255,255,0.12)' }} />
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <div className="skeleton" style={{ width: 14, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.3)' }} />
                <div className="skeleton" style={{ width: 5, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.15)' }} />
                <div className="skeleton" style={{ width: 5, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.15)' }} />
              </div>
            </div>

            <div className="skeleton" style={{ width: '85%', height: isSmall ? 22 : 24, borderRadius: 6, background: 'rgba(255,255,255,0.2)' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="skeleton" style={{ width: '100%', height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.1)' }} />
              <div className="skeleton" style={{ width: '75%', height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.1)' }} />
            </div>

            <div className="skeleton" style={{ width: '100%', height: 28, borderRadius: 9, background: 'rgba(0,0,0,0.3)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <div className="skeleton" style={{ flex: 1, height: 38, borderRadius: 10, background: 'linear-gradient(90deg, rgba(124,58,237,0.4) 0%, rgba(168,85,247,0.5) 100%)' }} />
              <div className="skeleton" style={{ width: 70, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.12)' }} />
              <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.1)' }} />
            </div>
          </div>
        ) : (
          /* Tablet & Desktop Skeleton 2-Column */
          <div
            style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: isTablet ? '1.14fr 0.86fr' : '1.18fr 0.82fr',
              alignItems: 'stretch',
              padding: isTablet ? '26px 28px' : '36px 44px',
              gap: isTablet ? 24 : 36,
              minHeight: isTablet ? 280 : 320,
            }}
          >
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="skeleton" style={{ width: 90, height: 24, borderRadius: 9999, background: 'rgba(124,58,237,0.35)' }} />
                <div className="skeleton" style={{ width: 95, height: 24, borderRadius: 9999, background: 'rgba(255,255,255,0.12)' }} />
              </div>

              <div className="skeleton" style={{ width: '80%', height: isTablet ? 24 : 28, borderRadius: 8, background: 'rgba(255,255,255,0.18)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton" style={{ width: '100%', height: 15, borderRadius: 4, background: 'rgba(255,255,255,0.1)' }} />
                <div className="skeleton" style={{ width: '88%', height: 15, borderRadius: 4, background: 'rgba(255,255,255,0.1)' }} />
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                {[65, 55, 60, 75].map((tw, i) => (
                  <div key={i} className="skeleton" style={{ width: tw, height: 20, borderRadius: 9999, background: 'rgba(255,255,255,0.08)' }} />
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <div className="skeleton" style={{ width: 150, height: 40, borderRadius: 10, background: 'linear-gradient(90deg, rgba(124,58,237,0.4) 0%, rgba(168,85,247,0.5) 100%)' }} />
                <div className="skeleton" style={{ width: 100, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.10)' }} />
                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.08)' }} />
              </div>
            </div>

            {/* Right Column */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 18,
                border: '1px solid rgba(255,255,255,0.15)',
                padding: isTablet ? 16 : 20,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(239,68,68,0.4)' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(245,158,11,0.4)' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(16,185,129,0.4)' }} />
                </div>
                <div className="skeleton" style={{ width: 110, height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.15)' }} />
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="skeleton" style={{ width: 80, height: 12, borderRadius: 4, background: 'rgba(167,139,250,0.3)' }} />
                <div className="skeleton" style={{ width: '95%', height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.12)' }} />
              </div>

              <div style={{ background: 'rgba(139,92,246,0.16)', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="skeleton" style={{ width: 100, height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.15)' }} />
                <div className="skeleton" style={{ width: 50, height: 14, borderRadius: 9999, background: 'rgba(52,211,153,0.3)' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Role Collections Shelf Skeletons ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: isPhone ? 24 : 32 }}>
        {Array.from({ length: 2 }).map((_, shelfIndex) => (
          <section key={shelfIndex} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Shelf Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 8 }} />
                <div className="skeleton" style={{ width: isSmall ? 130 : 170, height: 20, borderRadius: 6 }} />
                <div className="skeleton" style={{ width: 26, height: 18, borderRadius: 9999 }} />
              </div>
              <div className="skeleton" style={{ width: 60, height: 16, borderRadius: 6 }} />
            </div>

            {/* Template Cards Grid / Track Skeleton */}
            {isPhone ? (
              <div style={{ display: 'flex', gap: 12, overflowX: 'hidden', paddingBottom: 6 }}>
                {Array.from({ length: 3 }).map((_, cardIndex) => (
                  <div
                    key={cardIndex}
                    style={{
                      width: 'min(82vw, 290px)',
                      flexShrink: 0,
                      background: isDark ? 'rgba(20, 19, 32, 0.85)' : '#FFFFFF',
                      borderRadius: 16,
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124,58,237,0.10)'}`,
                      padding: isSmall ? 14 : 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8 }} />
                        <div className="skeleton" style={{ width: 65, height: 20, borderRadius: 6 }} />
                      </div>
                      <div className="skeleton" style={{ width: 24, height: 24, borderRadius: 6 }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div className="skeleton" style={{ width: '80%', height: 16, borderRadius: 5 }} />
                      <div className="skeleton" style={{ width: '100%', height: 13, borderRadius: 4 }} />
                      <div className="skeleton" style={{ width: '65%', height: 13, borderRadius: 4 }} />
                    </div>

                    <div style={{ display: 'flex', gap: 5 }}>
                      <div className="skeleton" style={{ width: 50, height: 16, borderRadius: 9999 }} />
                      <div className="skeleton" style={{ width: 55, height: 16, borderRadius: 9999 }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 6 }}>
                      <div className="skeleton" style={{ width: 45, height: 14, borderRadius: 4 }} />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <div className="skeleton" style={{ width: 55, height: 28, borderRadius: 8 }} />
                        <div className="skeleton" style={{ width: 50, height: 28, borderRadius: 8, background: 'rgba(124,58,237,0.2)' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isTablet ? 'repeat(2, 1fr)' : gridColumns,
                  gap: 14,
                }}
              >
                {Array.from({ length: isTablet ? 2 : 3 }).map((_, cardIndex) => (
                  <div
                    key={cardIndex}
                    style={{
                      background: isDark ? 'rgba(20, 19, 32, 0.85)' : '#FFFFFF',
                      borderRadius: 18,
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124,58,237,0.10)'}`,
                      padding: 18,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10 }} />
                        <div className="skeleton" style={{ width: 75, height: 22, borderRadius: 6 }} />
                      </div>
                      <div className="skeleton" style={{ width: 26, height: 26, borderRadius: 8 }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div className="skeleton" style={{ width: '80%', height: 18, borderRadius: 6 }} />
                      <div className="skeleton" style={{ width: '100%', height: 14, borderRadius: 4 }} />
                      <div className="skeleton" style={{ width: '65%', height: 14, borderRadius: 4 }} />
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <div className="skeleton" style={{ width: 55, height: 18, borderRadius: 9999 }} />
                      <div className="skeleton" style={{ width: 65, height: 18, borderRadius: 9999 }} />
                      <div className="skeleton" style={{ width: 50, height: 18, borderRadius: 9999 }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 6 }}>
                      <div className="skeleton" style={{ width: 50, height: 14, borderRadius: 4 }} />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <div className="skeleton" style={{ width: 60, height: 30, borderRadius: 8 }} />
                        <div className="skeleton" style={{ width: 55, height: 30, borderRadius: 8, background: 'rgba(124,58,237,0.2)' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
