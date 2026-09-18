'use client';

import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useIsDark } from '@/theme/theme';

export default function OptimizerSkeleton() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const stackCards = useMediaQuery('(max-width: 1024px)');
  const isDark = useIsDark();

  const [hasPromptId, setHasPromptId] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setHasPromptId(Boolean(params.get('prompt_id')));
    }
  }, []);

  const cardStyle: React.CSSProperties = {
    flex: stackCards ? 'none' : 1,
    padding: isMobile ? '18px 16px' : '26px 30px',
    borderRadius: isMobile ? 20 : 24,
    height: stackCards ? 'auto' : 640,
    maxHeight: stackCards ? 'none' : 640,
    minHeight: stackCards ? (isMobile ? 540 : 460) : undefined,
    background: isDark ? 'rgba(20, 19, 32, 0.85)' : '#FFFFFF',
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(124,58,237,0.10)'}`,
    boxShadow: isDark
      ? '0 4px 28px rgba(0,0,0,0.5), 0 0 20px rgba(139,92,246,0.04)'
      : '0 4px 24px rgba(109,40,217,0.07), 0 1px 4px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
  };

  const dropdownPillWidths = [135, 115];

  if (!hasPromptId) {
    return (
      <div
        id="optimizer-page-skeleton"
        className="workspace-container workspace-container--hero"
        style={{
          width: '100%',
          flex: isMobile ? 'none' : 1,
          minHeight: isMobile ? 'auto' : 0,
          height: isMobile ? 'auto' : '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: isMobile ? '12px 10px 16px' : '8px 16px 24px',
          paddingBottom: isMobile ? '12px' : '13vh',
        }}
      >
        {/* Title skeleton */}
        <div
          className="skeleton"
          style={{
            width: isMobile ? 180 : 260,
            height: isMobile ? 28 : 38,
            borderRadius: 12,
            marginBottom: isMobile ? 24 : 32,
          }}
        />

        {/* Capsule Skeleton */}
        <div
          style={{
            width: '100%',
            maxWidth: 780,
            borderRadius: 28,
            background: isDark ? 'rgba(28, 26, 42, 0.85)' : '#FFFFFF',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(124, 58, 237, 0.16)'}`,
            boxShadow: isDark
              ? '0 16px 48px -12px rgba(0, 0, 0, 0.65), 0 0 24px rgba(124, 58, 237, 0.10)'
              : '0 12px 36px -8px rgba(124, 58, 237, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04)',
            padding: isMobile ? '14px 16px 12px' : '18px 22px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* Input lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="skeleton" style={{ width: '55%', height: 15, borderRadius: 6 }} />
            <div className="skeleton" style={{ width: '35%', height: 15, borderRadius: 6 }} />
          </div>

          {/* Bottom toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', paddingTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {dropdownPillWidths.map((w, idx) => (
                <div key={idx} className="skeleton" style={{ width: w, height: 34, borderRadius: 9999 }} />
              ))}
              <div style={{ width: 1, height: 20, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', margin: '0 2px' }} />
              <div className="skeleton" style={{ width: 35, height: 35, borderRadius: 11 }} />
              <div className="skeleton" style={{ width: 37, height: 35, borderRadius: 11 }} />
              <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="optimizer-page-skeleton"
      className="workspace-container"
      style={{
        width: '100%',
        paddingBottom: 64,
      }}
    >
      {/* ── Main Comparison Row ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: stackCards ? 'column' : 'row',
          gap: stackCards ? 20 : 0,
          width: '100%',
          marginBottom: 32,
        }}
      >
        {/* ── Left Card: Your Prompt ── */}
        <div style={cardStyle}>
          {/* Header */}
          <div style={{ marginBottom: isMobile ? 12 : 16 }}>
            <div
              className="skeleton"
              style={{ width: 84, height: 11, borderRadius: 4, marginBottom: 6 }}
            />
            <div
              className="skeleton"
              style={{ width: isMobile ? 140 : 170, height: isMobile ? 18 : 22, borderRadius: 6 }}
            />
          </div>

          {/* Textarea Box Skeleton */}
          <div
            style={{
              flex: 1,
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124,58,237,0.10)'}`,
              borderRadius: isMobile ? 14 : 16,
              background: isDark ? 'rgba(14, 13, 20, 0.65)' : '#FDFCFF',
              padding: isMobile ? '14px 14px' : '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: isMobile ? 200 : 170,
              boxShadow: isDark
                ? 'inset 0 1px 3px rgba(0,0,0,0.3)'
                : 'inset 0 1px 3px rgba(109,40,217,0.03)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              <div className="skeleton" style={{ width: '48%', height: 13, borderRadius: 4 }} />
              <div className="skeleton" style={{ width: '32%', height: 13, borderRadius: 4 }} />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: isMobile ? 8 : 12,
              }}
            >
              <div className="skeleton" style={{ width: 130, height: 11, borderRadius: 4 }} />
            </div>
          </div>

          {/* Controls Section */}
          <div
            style={{
              marginTop: isMobile ? 12 : 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {/* Selectors Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {dropdownPillWidths.map((w, idx) => (
                  <div
                    key={idx}
                    className="skeleton"
                    style={{
                      width: w,
                      height: 34,
                      borderRadius: 9999,
                    }}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 1, height: 20, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)', margin: '0 2px' }} />
                <div className="skeleton" style={{ width: 35, height: 35, borderRadius: 11 }} />
                <div className="skeleton" style={{ width: 37, height: 35, borderRadius: 11 }} />
                <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Card: Enhanced Prompt (Shown when prompt_id is present) ── */}
        {hasPromptId && (
          <div
            style={{
              overflow: 'hidden',
              display: 'flex',
              width: stackCards ? '100%' : undefined,
              flex: stackCards ? 'none' : 0.818,
              paddingLeft: stackCards ? 0 : 24,
              height: stackCards ? (isMobile ? 520 : 600) : 640,
              maxHeight: stackCards ? (isMobile ? 520 : 600) : 640,
            }}
          >
            <div
              style={{
                ...cardStyle,
                width: '100%',
                flex: 'none',
                height: stackCards ? (isMobile ? 520 : 600) : '100%',
                maxHeight: stackCards ? (isMobile ? 520 : 600) : 640,
                padding: isMobile ? '18px 16px' : '26px 30px',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: isMobile ? 16 : 24,
                  height: 36,
                }}
              >
                <div className="skeleton" style={{ width: 130, height: 14, borderRadius: 4 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="skeleton" style={{ width: 68, height: 26, borderRadius: 9999 }} />
                  <div className="skeleton" style={{ width: 56, height: 32, borderRadius: 9999 }} />
                  <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8 }} />
                </div>
              </div>

              {/* Enhanced Prompt Body */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  padding: '8px 0',
                }}
              >
                <div className="skeleton" style={{ width: '45%', height: 18, borderRadius: 4, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: '92%', height: 14, borderRadius: 4 }} />
                <div className="skeleton" style={{ width: '98%', height: 14, borderRadius: 4 }} />
                <div className="skeleton" style={{ width: '85%', height: 14, borderRadius: 4 }} />
                <div className="skeleton" style={{ width: '90%', height: 14, borderRadius: 4 }} />
                <div className="skeleton" style={{ width: '38%', height: 16, borderRadius: 4, margin: '14px 0 4px' }} />
                <div className="skeleton" style={{ width: '94%', height: 14, borderRadius: 4 }} />
                <div className="skeleton" style={{ width: '88%', height: 14, borderRadius: 4 }} />
                <div className="skeleton" style={{ width: '70%', height: 14, borderRadius: 4 }} />
              </div>

              {/* Bottom Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 16,
                  borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(124,58,237,0.06)'}`,
                  marginTop: 'auto',
                }}
              >
                <div className="skeleton" style={{ width: 130, height: 38, borderRadius: 10 }} />
                <div className="skeleton" style={{ width: 88, height: 38, borderRadius: 10 }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Score Section Skeleton (Shown when prompt_id is present) ── */}
      {hasPromptId && (
        <div
          style={{
            borderRadius: isMobile ? 22 : 28,
            padding: isMobile ? '20px 16px' : 36,
            background: isDark ? 'rgba(20, 19, 32, 0.85)' : '#FFFFFF',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(124,58,237,0.10)'}`,
            boxShadow: isDark
              ? '0 4px 28px rgba(0,0,0,0.5), 0 0 20px rgba(139,92,246,0.04)'
              : '0 4px 24px rgba(109,40,217,0.07), 0 1px 4px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div className="skeleton" style={{ width: 90, height: 90, borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              <div className="skeleton" style={{ width: '40%', height: 20, borderRadius: 6 }} />
              <div className="skeleton" style={{ width: '70%', height: 14, borderRadius: 4 }} />
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: 12,
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 72, borderRadius: 14 }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
