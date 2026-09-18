'use client';

import React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function VaultSkeleton() {
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const pagePadX = isMobile ? 16 : isTablet ? 32 : 48;
  const statsTwoCol = useMediaQuery('(max-width: 700px)');

  return (
    <div
      id="vault-page-skeleton"
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        paddingLeft: pagePadX,
        paddingRight: pagePadX,
        paddingTop: 8,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: 64,
      }}
    >
      {/* 4 Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: statsTwoCol ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? 12 : 16,
          marginBottom: isMobile ? 20 : 28,
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 116, borderRadius: 16 }} />
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {!isMobile && <div className="skeleton" style={{ height: 38, width: 86, borderRadius: 10 }} />}
        <div className="skeleton" style={{ height: 38, width: 130, borderRadius: 10 }} />
        <div className="skeleton" style={{ height: 40, width: isMobile ? '100%' : 260, borderRadius: 10 }} />
        <div className="skeleton" style={{ height: 34, flex: '1 1 200px', minWidth: 0, borderRadius: 9999 }} />
        <div className="skeleton" style={{ height: 38, width: 90, borderRadius: 10 }} />
      </div>

      {/* Prompt Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 72, borderRadius: 14 }} />
        ))}
      </div>
    </div>
  );
}
