'use client';

import React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useIsDark } from '@/theme/theme';

export interface SettingsSkeletonProps {
  activeTab?: 'settings' | 'profile';
}

export default function SettingsSkeleton({ activeTab = 'settings' }: SettingsSkeletonProps) {
  const isDark = useIsDark();
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
         PROFILE SKELETON (Apple Bento & Heatmap Layout)
         ═══════════════════════════════════════════════════ */}
      {activeTab === 'profile' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
          {/* Top Full-Width Activity Heatmap Skeleton */}
          <div
            style={{
              background: isDark ? 'rgba(18, 16, 28, 0.88)' : '#FFFFFF',
              borderRadius: isMobile ? 18 : 24,
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(124, 58, 237, 0.12)'}`,
              boxShadow: isDark
                ? 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 16px 40px -8px rgba(0, 0, 0, 0.5)'
                : '0 8px 30px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
              padding: isSmall ? '16px 14px' : isMobile ? '18px 18px' : '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header: Title + Streak Pills */}
            <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
              <div className="skeleton" style={{ width: isMobile ? 220 : 280, height: 22, borderRadius: 6 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <div className="skeleton" style={{ width: 90, height: 28, borderRadius: 9999 }} />
                <div className="skeleton" style={{ width: 85, height: 28, borderRadius: 9999 }} />
              </div>
            </div>

            {/* Heatmap Grid Skeleton */}
            <div style={{ overflowX: 'hidden', paddingBottom: 6 }}>
              {/* Month label placeholders */}
              <div style={{ display: 'flex', gap: 24, marginBottom: 8, marginLeft: 32 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((_, i) => (
                  <div key={i} className="skeleton" style={{ width: 28, height: 12, borderRadius: 3 }} />
                ))}
              </div>
              {/* Day rows + 52-column grid */}
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 26, marginRight: 6 }}>
                  <div className="skeleton" style={{ width: 20, height: 10, borderRadius: 2 }} />
                  <div style={{ height: 10 }} />
                  <div className="skeleton" style={{ width: 20, height: 10, borderRadius: 2 }} />
                  <div style={{ height: 10 }} />
                  <div className="skeleton" style={{ width: 20, height: 10, borderRadius: 2 }} />
                </div>
                {Array.from({ length: isMobile ? 26 : 52 }).map((_, c) => (
                  <div key={c} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {Array.from({ length: 7 }).map((_, r) => (
                      <div
                        key={r}
                        className="skeleton"
                        style={{
                          width: 11,
                          height: 11,
                          borderRadius: 3,
                          background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.06)',
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Legend Skeleton */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
              <div className="skeleton" style={{ width: 180, height: 14, borderRadius: 4 }} />
              <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                <div className="skeleton" style={{ width: 30, height: 12, borderRadius: 3 }} />
                {[1, 2, 3, 4].map((_, i) => (
                  <div key={i} className="skeleton" style={{ width: 11, height: 11, borderRadius: 3 }} />
                ))}
                <div className="skeleton" style={{ width: 30, height: 12, borderRadius: 3 }} />
              </div>
            </div>
          </div>

          {/* 2-Column Bento Grid */}
          <div className="bento-profile-grid">
            {/* Left Column: Identity & Subscription Bento */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
              {/* Identity Bento Card Skeleton */}
              <div
                style={{
                  background: isDark ? 'rgba(18, 16, 28, 0.88)' : '#FFFFFF',
                  borderRadius: 24,
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(124, 58, 237, 0.12)'}`,
                  boxShadow: isDark
                    ? 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 16px 40px -8px rgba(0, 0, 0, 0.5)'
                    : '0 8px 30px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
                  overflow: 'hidden',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* 120px Header Canvas Skeleton */}
                <div
                  style={{
                    height: 120,
                    background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                    borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'}`,
                    position: 'relative',
                  }}
                >
                  <div
                    className="skeleton"
                    style={{
                      position: 'absolute',
                      top: 14,
                      right: 16,
                      width: 84,
                      height: 24,
                      borderRadius: 9999,
                      background: 'rgba(255, 255, 255, 0.2)',
                    }}
                  />
                </div>

                {/* Avatar + Info Block Skeleton */}
                <div style={{ padding: isMobile ? '0 18px 22px' : '0 28px 26px', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: -42, marginBottom: 16 }}>
                    {/* Glowing Ring Avatar Skeleton with Micro Camera Button */}
                    <div style={{ position: 'relative' }}>
                      <div
                        className="skeleton"
                        style={{
                          width: 84,
                          height: 84,
                          borderRadius: '50%',
                          border: `3px solid ${isDark ? '#110F1C' : '#FFFFFF'}`,
                        }}
                      />
                      <div
                        className="skeleton"
                        style={{
                          position: 'absolute',
                          bottom: 2,
                          right: -2,
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          border: `2.5px solid ${isDark ? '#110F1C' : '#FFFFFF'}`,
                        }}
                      />
                    </div>

                    {/* Quick Stats Pills Skeleton */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div className="skeleton" style={{ width: 90, height: 26, borderRadius: 10 }} />
                      <div className="skeleton" style={{ width: 75, height: 26, borderRadius: 10 }} />
                    </div>
                  </div>

                  {/* Name + Role + Contact Skeleton */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="skeleton" style={{ width: 150, height: 24, borderRadius: 6 }} />
                      <div className="skeleton" style={{ width: 45, height: 22, borderRadius: 8 }} />
                      <div className="skeleton" style={{ width: 70, height: 22, borderRadius: 8 }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="skeleton" style={{ width: 170, height: 14, borderRadius: 4 }} />
                      <div className="skeleton" style={{ width: 68, height: 18, borderRadius: 9999 }} />
                      <div className="skeleton" style={{ width: 120, height: 14, borderRadius: 4 }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Executive Subscription Card Skeleton */}
              <div
                style={{
                  background: isDark ? 'rgba(18, 16, 28, 0.88)' : '#FFFFFF',
                  borderRadius: 24,
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(124, 58, 237, 0.12)'}`,
                  padding: isMobile ? '22px 18px' : '26px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  flex: 1,
                  minHeight: isMobile ? 'auto' : 350,
                  boxShadow: isDark
                    ? 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 16px 40px -8px rgba(0, 0, 0, 0.5)'
                    : '0 8px 30px rgba(0, 0, 0, 0.06)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Header Skeleton */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.15)' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div className="skeleton" style={{ width: 95, height: 11, borderRadius: 4, background: 'rgba(255,255,255,0.18)' }} />
                        <div className="skeleton" style={{ width: 160, height: 20, borderRadius: 6, background: 'rgba(255,255,255,0.25)' }} />
                      </div>
                    </div>
                    <div className="skeleton" style={{ width: 62, height: 24, borderRadius: 9999, background: 'rgba(255,255,255,0.15)' }} />
                  </div>

                  {/* Quota Progress Bar Skeleton */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div className="skeleton" style={{ width: 140, height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.12)' }} />
                      <div className="skeleton" style={{ width: 80, height: 12, borderRadius: 4, background: 'rgba(255,255,255,0.2)' }} />
                    </div>
                    <div className="skeleton" style={{ width: '100%', height: 7, borderRadius: 9999, background: 'rgba(255,255,255,0.10)' }} />
                  </div>

                  {/* 2x2 Capability Bento Chips Skeleton */}
                  <div className="bento-subscription-chips">
                    {[1, 2, 3, 4].map((_, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: 12,
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.07)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div className="skeleton" style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(255,255,255,0.1)' }} />
                          <div className="skeleton" style={{ width: 110, height: 13, borderRadius: 4, background: 'rgba(255,255,255,0.14)' }} />
                        </div>
                        <div className="skeleton" style={{ width: 15, height: 15, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Strip Skeleton */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.09)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="skeleton" style={{ width: 170, height: 13, borderRadius: 4, background: 'rgba(255,255,255,0.12)' }} />
                  <div className="skeleton" style={{ width: 115, height: 30, borderRadius: 10, background: 'rgba(255,255,255,0.18)' }} />
                </div>
              </div>
            </div>

            {/* Right Column: Telemetry & Badges Bento */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 24, height: '100%' }}>
              {/* Performance Telemetry Card Skeleton */}
              <div
                style={{
                  background: isDark ? 'rgba(18, 16, 28, 0.88)' : '#FFFFFF',
                  borderRadius: 24,
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(124, 58, 237, 0.12)'}`,
                  boxShadow: isDark
                    ? 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 16px 40px -8px rgba(0, 0, 0, 0.5)'
                    : '0 8px 30px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
                  padding: isSmall ? '16px 14px' : isMobile ? '20px 18px' : '24px 26px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div className="skeleton" style={{ width: 160, height: 18, borderRadius: 6 }} />
                  <div className="skeleton" style={{ width: 68, height: 14, borderRadius: 4 }} />
                </div>

                {/* 4 Metric Boxes: 2x2 on mobile, 4x1 on desktop */}
                <div className="bento-telemetry-grid">
                  {[1, 2, 3, 4].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
                        borderRadius: isMobile ? 12 : 14,
                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : '#E2E8F0'}`,
                        padding: isMobile ? '12px 10px' : '12px 6px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <div className="skeleton" style={{ width: 16, height: 16, borderRadius: '50%' }} />
                      <div className="skeleton" style={{ width: 36, height: 18, borderRadius: 4 }} />
                      <div className="skeleton" style={{ width: 44, height: 10, borderRadius: 4 }} />
                    </div>
                  ))}
                </div>

                {/* 7-Day Sparkline Skeleton */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div className="skeleton" style={{ width: 130, height: 12, borderRadius: 4 }} />
                    <div className="skeleton" style={{ width: 60, height: 12, borderRadius: 4 }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 44 }}>
                    {[30, 50, 40, 70, 95, 60, 85].map((h, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div className="skeleton" style={{ width: '100%', borderRadius: 4, height: `${Math.round((h / 100) * 36)}px` }} />
                        <div className="skeleton" style={{ width: 10, height: 8, borderRadius: 2 }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Badges Showcase Card Skeleton */}
              <div
                style={{
                  background: isDark ? 'rgba(18, 16, 28, 0.88)' : '#FFFFFF',
                  borderRadius: 24,
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(124, 58, 237, 0.12)'}`,
                  boxShadow: isDark
                    ? 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 16px 40px -8px rgba(0, 0, 0, 0.5)'
                    : '0 8px 30px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
                  padding: isMobile ? '22px 18px' : '26px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  flex: 1,
                  minHeight: isMobile ? 'auto' : 350,
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Top Section */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div className="skeleton" style={{ width: 85, height: 10, borderRadius: 4 }} />
                        <div className="skeleton" style={{ width: 60, height: 16, borderRadius: 4 }} />
                      </div>
                    </div>
                    <div className="skeleton" style={{ width: 68, height: 24, borderRadius: 9999 }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <div className="skeleton" style={{ width: 42, height: 32, borderRadius: 6 }} />
                    <div className="skeleton" style={{ width: 120, height: 12, borderRadius: 4 }} />
                  </div>
                </div>

                {/* 3 Badges Showcase Area Skeleton */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '16px 0', flex: 1 }}>
                  <div className="skeleton" style={{ width: 54, height: 54, borderRadius: 16 }} />
                  <div className="skeleton" style={{ width: 70, height: 70, borderRadius: 20 }} />
                  <div className="skeleton" style={{ width: 54, height: 54, borderRadius: 16 }} />
                </div>

                {/* Most Recent Badge Footer Skeleton */}
                <div style={{ borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.08)'}`, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div className="skeleton" style={{ width: 105, height: 10, borderRadius: 3 }} />
                    <div className="skeleton" style={{ width: 140, height: 15, borderRadius: 4 }} />
                  </div>
                  <div className="skeleton" style={{ width: 72, height: 22, borderRadius: 8 }} />
                </div>
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
              background: isDark ? 'rgba(20, 19, 32, 0.85)' : '#FFFFFF',
              borderRadius: 24,
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124, 58, 237, 0.12)'}`,
              boxShadow: isDark ? '0 4px 24px rgba(0, 0, 0, 0.35)' : '0 4px 20px rgba(0, 0, 0, 0.04)',
              padding: isMobile ? '22px 18px' : '32px 36px',
              display: 'flex',
              flexDirection: 'column',
              gap: 32,
            }}
          >
            {/* Appearance */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div className="skeleton" style={{ width: 110, height: 16, borderRadius: 4 }} />
                <div className="skeleton" style={{ width: isMobile ? 240 : 280, height: 13, borderRadius: 4 }} />
              </div>
              <div className="bento-appearance-grid">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} style={{ padding: '12px 8px', borderRadius: 14, border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.10)' : '#E2E8F0'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div className="skeleton" style={{ width: 42, height: 28, borderRadius: 6 }} />
                    <div className="skeleton" style={{ width: 45, height: 12, borderRadius: 4 }} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124, 58, 237, 0.08)' }} />

            {/* 12 Roles Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div className="skeleton" style={{ width: 180, height: 16, borderRadius: 4 }} />
                  <div className="skeleton" style={{ width: isMobile ? 220 : 260, height: 13, borderRadius: 4 }} />
                </div>
                <div className="skeleton" style={{ width: 55, height: 18, borderRadius: 9999 }} />
              </div>
              <div className="bento-roles-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((_, i) => (
                  <div key={i} style={{ padding: '12px 14px', borderRadius: 14, border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124, 58, 237, 0.10)'}`, display: 'flex', alignItems: 'center', gap: 10 }}>
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
            <div style={{ background: isDark ? 'rgba(14, 13, 20, 0.85)' : '#F8FAFC', borderRadius: 18, border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0'}`, padding: isMobile ? '16px 14px' : '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
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

            {/* Automation Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div className="skeleton" style={{ width: 160, height: 16, borderRadius: 4 }} />
                <div className="skeleton" style={{ width: isMobile ? 260 : 340, height: 13, borderRadius: 4 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[1, 2].map((_, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div className="skeleton" style={{ width: 170, height: 14, borderRadius: 4 }} />
                      <div className="skeleton" style={{ width: isMobile ? 200 : 360, height: 12, borderRadius: 4 }} />
                    </div>
                    <div className="skeleton" style={{ width: 44, height: 24, borderRadius: 9999 }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Sync Dock */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124, 58, 237, 0.10)'}`,
                paddingTop: 20,
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="skeleton" style={{ width: 8, height: 8, borderRadius: '50%' }} />
                <div className="skeleton" style={{ width: 140, height: 13, borderRadius: 4 }} />
              </div>
              <div className="skeleton" style={{ width: 145, height: 38, borderRadius: 12 }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
