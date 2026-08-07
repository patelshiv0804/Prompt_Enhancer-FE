'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import AuthGuard from '@/components/layout/AuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  // Derive activeTab for Header (Draft vs Vault)
  const isVault    = pathname.includes('/vault');
  const activeTab  = isVault ? 'Vault' : 'Draft';
  const isChat     = pathname.startsWith('/dashboard/chat');

  const handleTabChange = (tab: string) => {
    if (tab === 'Vault') router.push('/dashboard/vault');
    if (tab === 'Draft') router.push('/dashboard/optimizer');
  };

  return (
    <AuthGuard>
      <div className="dashboard-root">
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <div className={`content-scroll${isChat ? ' content-scroll--chat' : ''}`}>
              {/* Header only for non-chat pages that need it */}
              {!isChat && (pathname.includes('/optimizer') || pathname.includes('/history') || pathname.includes('/vault') || pathname === '/dashboard') && (
                <Header activeTab={activeTab} onTabChange={handleTabChange} />
              )}
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
