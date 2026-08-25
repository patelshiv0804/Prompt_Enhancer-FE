'use client';

import React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function TemplatesHubSkeleton() {
  const isStackedSpotlight = useMediaQuery('(max-width: 920px)');
  const isTablet = useMediaQuery('(max-width: 1080px) and (min-width: 621px)');
  const isPhone = useMediaQuery('(max-width: 620px)');
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
            <div className="skeleton" style={{ width: isSmall ? 160 : 200, height: isSmall ? 24 : 28, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: 78, height: 22, borderRadius: 9999 }} />
          </div>
          <div className="skeleton" style={{ width: isSmall ? 220 : 360, height: 16, borderRadius: 6 }} />
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
          {[140, 120, 150, 95].map((w, i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                width: isSmall ? w * 0.8 : w,
                height: isSmall ? 32 : 36,
                borderRadius: '10px 10px 0 0',
              }}
            />
          ))}
        </div>

        {/* Category Pills Skeleton */}
        <div style={{ display: 'flex', gap: 6, paddingBottom: 6, overflowX: 'auto', width: isPhone ? '100%' : 'auto', scrollbarWidth: 'none' }}>
          {[48, 80, 75, 70, 95, 75, 85, 68, 60].map((w, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ width: w, height: 26, borderRadius: 9999, flexShrink: 0 }}
            />
          ))}
        </div>
      </div>

      {/* ── Spotlight Grand Showcase Banner Skeleton ── */}
      <div
        style={{
          borderRadius: isSmall ? 22 : 30,
          overflow: 'hidden',
          marginBottom: isStackedSpotlight ? 26 : 40,
          position: 'relative',
          background: 'linear-gradient(135deg, #09090D 0%, #150D2A 50%, #200E3E 100%)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(139,92,246,0.22)',
          minHeight: isStackedSpotlight ? 'auto' : 395,
        }}
      >
        {/* Ambient background glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 15% 25%, rgba(139,92,246,0.38) 0%, transparent 60%), radial-gradient(ellipse at 85% 70%, rgba(236,72,153,0.28) 0%, transparent 55%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: isStackedSpotlight ? '1fr' : '1.18fr 0.82fr',
            alignItems: 'center',
            padding: isSmall ? '22px 18px' : isStackedSpotlight ? '32px 26px' : '42px 46px',
            gap: isSmall ? 20 : isStackedSpotlight ? 26 : 38,
          }}
        >
          {/* Left Column Skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isSmall ? 14 : 18, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div
                className="skeleton"
                style={{
                  width: 90,
                  height: 24,
                  borderRadius: 9999,
                  background: 'linear-gradient(90deg, rgba(139,92,246,0.25) 0%, rgba(236,72,153,0.35) 50%, rgba(139,92,246,0.25) 100%)',
                }}
              />
              <div className="skeleton" style={{ width: 100, height: 24, borderRadius: 9999, background: 'rgba(255,255,255,0.12)' }} />
              <div className="skeleton" style={{ width: 85, height: 24, borderRadius: 9999, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <div className="skeleton" style={{ width: '80%', height: isSmall ? 24 : 32, borderRadius: 8, background: 'rgba(255,255,255,0.15)' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="skeleton" style={{ width: '100%', height: 16, borderRadius: 6, background: 'rgba(255,255,255,0.09)' }} />
              <div className="skeleton" style={{ width: '88%', height: 16, borderRadius: 6, background: 'rgba(255,255,255,0.09)' }} />
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[70, 55, 65, 80].map((tw, i) => (
                <div key={i} className="skeleton" style={{ width: tw, height: 22, borderRadius: 9999, background: 'rgba(255,255,255,0.08)' }} />
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <div
                className="skeleton"
                style={{
                  width: isSmall ? 130 : 155,
                  height: isSmall ? 40 : 44,
                  borderRadius: 12,
                  background: 'linear-gradient(90deg, rgba(139,92,246,0.4) 0%, rgba(168,85,247,0.5) 50%, rgba(139,92,246,0.4) 100%)',
                }}
              />
              <div className="skeleton" style={{ width: isSmall ? 100 : 115, height: isSmall ? 40 : 44, borderRadius: 12, background: 'rgba(255,255,255,0.10)' }} />
              <div className="skeleton" style={{ width: isSmall ? 40 : 44, height: isSmall ? 40 : 44, borderRadius: 12, background: 'rgba(255,255,255,0.08)' }} />
            </div>
          </div>

          {/* Right Column Skeleton (Code Preview Window) */}
          <div
            style={{
              background: 'rgba(9, 9, 13, 0.70)',
              backdropFilter: 'blur(16px)',
              borderRadius: 18,
              border: '1px solid rgba(139,92,246,0.22)',
              padding: isSmall ? 16 : 22,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(239,68,68,0.4)' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(245,158,11,0.4)' }} />
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(16,185,129,0.4)' }} />
              </div>
              <div className="skeleton" style={{ width: 120, height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.12)' }} />
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 12,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="skeleton" style={{ width: 90, height: 12, borderRadius: 4, background: 'rgba(139,92,246,0.3)' }} />
              <div className="skeleton" style={{ width: '95%', height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.12)' }} />
              <div className="skeleton" style={{ width: '80%', height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.12)' }} />
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 12,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div className="skeleton" style={{ width: 110, height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.12)' }} />
              <div className="skeleton" style={{ width: 60, height: 14, borderRadius: 9999, background: 'rgba(16,185,129,0.25)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Shelf 1: Role & Workflow Collections Skeleton ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {Array.from({ length: 2 }).map((_, shelfIndex) => (
          <section key={shelfIndex} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Shelf Header Skeleton */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 8 }} />
                <div className="skeleton" style={{ width: isSmall ? 140 : 190, height: 20, borderRadius: 6 }} />
                <div className="skeleton" style={{ width: 28, height: 18, borderRadius: 9999 }} />
              </div>
              <div className="skeleton" style={{ width: 65, height: 16, borderRadius: 6 }} />
            </div>

            {/* Template Cards Grid Skeleton */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: gridColumns,
                gap: 16,
              }}
            >
              {Array.from({ length: isTablet && !isSmall ? 2 : 3 }).map((_, cardIndex) => (
                <div
                  key={cardIndex}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 18,
                    border: '1px solid rgba(124,58,237,0.10)',
                    padding: isSmall ? 16 : 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    boxShadow: '0 4px 20px rgba(109,40,217,0.04)',
                  }}
                >
                  {/* Card Header (Icon + Category + Bookmark) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10 }} />
                      <div className="skeleton" style={{ width: 75, height: 22, borderRadius: 6 }} />
                    </div>
                    <div className="skeleton" style={{ width: 26, height: 26, borderRadius: 8 }} />
                  </div>

                  {/* Title & Description */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="skeleton" style={{ width: '80%', height: 18, borderRadius: 6 }} />
                    <div className="skeleton" style={{ width: '100%', height: 14, borderRadius: 4 }} />
                    <div className="skeleton" style={{ width: '65%', height: 14, borderRadius: 4 }} />
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <div className="skeleton" style={{ width: 55, height: 18, borderRadius: 9999 }} />
                    <div className="skeleton" style={{ width: 65, height: 18, borderRadius: 9999 }} />
                    <div className="skeleton" style={{ width: 50, height: 18, borderRadius: 9999 }} />
                  </div>

                  {/* Card Footer Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 'auto', paddingTop: 6 }}>
                    <div
                      className="skeleton"
                      style={{
                        flex: 1,
                        height: 36,
                        borderRadius: 10,
                        background: 'linear-gradient(90deg, rgba(124,58,237,0.12) 0%, rgba(124,58,237,0.22) 50%, rgba(124,58,237,0.12) 100%)',
                      }}
                    />
                    <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0 }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
