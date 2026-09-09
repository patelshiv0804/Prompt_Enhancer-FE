'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div
        className="authguard-loading-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--authguard-bg)',
          fontFamily: "'Geist', sans-serif",
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div
            className="authguard-spinner"
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '3px solid var(--authguard-spinner-track)',
              borderTopColor: 'var(--authguard-spinner-head)',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p
            className="authguard-loading-text"
            style={{
              color: 'var(--authguard-text)',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            Initializing session...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Prevents flashing dashboard content while redirecting
  }

  return <>{children}</>;
}
