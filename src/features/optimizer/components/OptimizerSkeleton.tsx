'use client';

import React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function OptimizerSkeleton() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const pagePadX = isMobile ? 16 : isTablet ? 32 : 48;

  return (
    <div
      id="optimizer-page-skeleton"
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        paddingLeft: pagePadX,
        paddingRight: pagePadX,
        paddingTop: 8,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        paddingBottom: 64,
      }}
    >
      {/* Top Controls Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="skeleton" style={{ width: 110, height: 32, borderRadius: 9999 }} />
          <div className="skeleton" style={{ width: 130, height: 32, borderRadius: 9999 }} />
        </div>
        <div className="skeleton" style={{ width: 90, height: 32, borderRadius: 10 }} />
      </div>

      {/* Main Prompt Input Box Skeleton */}
      <div
        style={{
          borderRadius: 20,
          padding: isMobile ? 16 : 22,
          border: '1px solid rgba(124, 58, 237, 0.12)',
          background: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          minHeight: 180,
        }}
      >
        <div className="skeleton" style={{ width: '40%', height: 16, borderRadius: 4 }} />
        <div className="skeleton" style={{ width: '85%', height: 14, borderRadius: 4 }} />
        <div className="skeleton" style={{ width: '65%', height: 14, borderRadius: 4 }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8 }} />
            <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8 }} />
          </div>
          <div className="skeleton" style={{ width: 120, height: 38, borderRadius: 12 }} />
        </div>
      </div>

      {/* Side-by-Side Comparison Area Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: 16,
        }}
      >
        <div
          style={{
            borderRadius: 18,
            padding: 20,
            border: '1px solid rgba(124, 58, 237, 0.10)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            minHeight: 220,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="skeleton" style={{ width: 120, height: 16, borderRadius: 4 }} />
            <div className="skeleton" style={{ width: 50, height: 20, borderRadius: 9999 }} />
          </div>
          <div className="skeleton" style={{ width: '90%', height: 14, borderRadius: 4 }} />
          <div className="skeleton" style={{ width: '95%', height: 14, borderRadius: 4 }} />
          <div className="skeleton" style={{ width: '80%', height: 14, borderRadius: 4 }} />
          <div className="skeleton" style={{ width: '60%', height: 14, borderRadius: 4 }} />
        </div>

        <div
          style={{
            borderRadius: 18,
            padding: 20,
            border: '1px solid rgba(124, 58, 237, 0.10)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            minHeight: 220,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="skeleton" style={{ width: 140, height: 16, borderRadius: 4 }} />
            <div className="skeleton" style={{ width: 60, height: 20, borderRadius: 9999 }} />
          </div>
          <div className="skeleton" style={{ width: '95%', height: 14, borderRadius: 4 }} />
          <div className="skeleton" style={{ width: '90%', height: 14, borderRadius: 4 }} />
          <div className="skeleton" style={{ width: '85%', height: 14, borderRadius: 4 }} />
          <div className="skeleton" style={{ width: '70%', height: 14, borderRadius: 4 }} />
        </div>
      </div>
    </div>
  );
}
