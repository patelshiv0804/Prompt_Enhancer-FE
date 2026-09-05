'use client';

import React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTheme } from '@/theme/theme';

export default function StyleMemorySkeleton() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isMobile = useMediaQuery('(max-width: 620px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isSmall = useMediaQuery('(max-width: 420px)');
  const pagePadX = isSmall ? 16 : isMobile ? 20 : isTablet ? 32 : 48;
  const nodeSize = isMobile ? 50 : 70;

  return (
    <div
      id="style-memory-skeleton"
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: `0 ${pagePadX}px`,
        paddingTop: 8,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: 64,
      }}
    >
      {/* ── Header Skeleton ── */}
      <div style={{ padding: isMobile ? '52px 0 22px' : '28px 0 24px' }}>
        <div className="skeleton" style={{ width: 140, height: 12, borderRadius: 4, marginBottom: 8 }} />
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="skeleton" style={{ width: 180, height: 26, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: isSmall ? 240 : 340, height: 14, borderRadius: 6 }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: isMobile ? '100%' : undefined }}>
            <div className="skeleton" style={{ width: 88, height: 38, borderRadius: 10, flexShrink: 0 }} />
            <div
              className="skeleton"
              style={{
                width: isMobile ? '100%' : 160,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(90deg, rgba(124,58,237,0.25) 0%, rgba(168,85,247,0.35) 50%, rgba(124,58,237,0.25) 100%)',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Filter Pills Skeleton ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {[48, 85, 80, 115, 95, 90].map((w, i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              width: w,
              height: 28,
              borderRadius: 9999,
              flexShrink: 0,
            }}
          />
        ))}
      </div>

      {/* ── Injection Flow Card Skeleton ── */}
      <div
        style={{
          position: 'relative',
          borderRadius: isMobile ? 20 : 28,
          marginBottom: isMobile ? 24 : 36,
          padding: 1,
          background: 'linear-gradient(135deg, rgba(124,58,237,0.35) 0%, rgba(56,189,248,0.20) 30%, rgba(192,132,252,0.30) 60%, rgba(52,211,153,0.25) 100%)',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(145deg, #0C0620 0%, #150D30 30%, #1A0E3A 55%, #0D0920 100%)',
            borderRadius: isMobile ? 19 : 27,
            padding: isMobile ? '28px 22px 30px' : isTablet ? '36px 32px 38px' : '40px 48px 44px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: isMobile ? 24 : 36 }}>
            <div
              className="skeleton"
              style={{
                width: 110,
                height: 24,
                borderRadius: 9999,
                marginBottom: 16,
              }}
            />
            <div
              className="skeleton"
              style={{
                width: isMobile ? '80%' : 260,
                height: isMobile ? 22 : 28,
                borderRadius: 6,
                marginBottom: 10,
              }}
            />
            <div
              className="skeleton"
              style={{
                width: '100%',
                maxWidth: 480,
                height: 14,
                borderRadius: 4,
              }}
            />
          </div>

          {/* 3-Step Pipeline Skeleton */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: isTablet ? 'flex-start' : 'center',
              justifyContent: 'center',
              gap: 0,
              padding: '8px 0 4px',
            }}
          >
            {[1, 2, 3].map((step, i) => (
              <React.Fragment key={step}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: isMobile ? 10 : 14,
                    flex: isTablet ? '1 1 0' : '0 0 auto',
                    minWidth: 0,
                    maxWidth: isTablet ? 120 : undefined,
                  }}
                >
                  <div
                    className="skeleton"
                    style={{
                      width: nodeSize,
                      height: nodeSize,
                      borderRadius: '50%',
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      width: '100%',
                    }}
                  >
                    <div
                      className="skeleton"
                      style={{
                        width: isMobile ? 60 : 80,
                        height: isMobile ? 12 : 14,
                        borderRadius: 4,
                      }}
                    />
                    <div
                      className="skeleton"
                      style={{
                        width: isMobile ? 80 : 100,
                        height: isMobile ? 10 : 12,
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>

                {i < 2 && (
                  <div
                    style={{
                      flex: isTablet ? '1 1 0' : '0 0 100px',
                      minWidth: isTablet ? 16 : 60,
                      height: isTablet ? 16 : 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: isTablet ? 0 : '0 12px',
                      marginBottom: isTablet ? undefined : 40,
                      marginTop: isTablet ? nodeSize / 2 - 8 : undefined,
                    }}
                  >
                    <div
                      className="skeleton"
                      style={{
                        width: '100%',
                        height: 2,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── Profile Cards Grid Skeleton ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
          gap: 16,
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              background: isDark ? 'rgba(20, 19, 32, 0.85)' : '#FFFFFF',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124,58,237,0.10)'}`,
              borderRadius: 16,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              justifyContent: 'space-between',
              minHeight: 280,
              boxShadow: '0 4px 20px rgba(109,40,217,0.04)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
              {/* Top row: Avatar + Name + Category + Delete */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="skeleton" style={{ width: '70%', height: 16, borderRadius: 4 }} />
                  <div className="skeleton" style={{ width: 80, height: 12, borderRadius: 4 }} />
                </div>
                <div className="skeleton" style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0 }} />
              </div>

              {/* Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="skeleton" style={{ width: '100%', height: 13, borderRadius: 4 }} />
                <div className="skeleton" style={{ width: '75%', height: 13, borderRadius: 4 }} />
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <div className="skeleton" style={{ width: 60, height: 20, borderRadius: 9999 }} />
                <div className="skeleton" style={{ width: 75, height: 20, borderRadius: 9999 }} />
                <div className="skeleton" style={{ width: 55, height: 20, borderRadius: 9999 }} />
              </div>
            </div>

            {/* Bottom Footer Section */}
            <div
              style={{
                borderTop: '1px solid rgba(124,58,237,0.08)',
                paddingTop: 14,
                marginTop: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="skeleton" style={{ width: 90, height: 16, borderRadius: 4 }} />
                <div className="skeleton" style={{ width: 44, height: 24, borderRadius: 9999 }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="skeleton" style={{ width: 75, height: 14, borderRadius: 4 }} />
                <div className="skeleton" style={{ width: 100, height: 12, borderRadius: 4 }} />
              </div>
            </div>
          </div>
        ))}

        {/* Add New Profile Skeleton Card */}
        <div
          style={{
            background: 'transparent',
            border: '2px dashed rgba(124,58,237,0.15)',
            borderRadius: 16,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            minHeight: 280,
          }}
        >
          <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }} />
          <div className="skeleton" style={{ width: 120, height: 16, borderRadius: 4 }} />
          <div className="skeleton" style={{ width: 160, height: 12, borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
}
