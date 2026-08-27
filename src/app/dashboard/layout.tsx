'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import AuthGuard from '@/components/layout/AuthGuard';
import { useAuth } from '@/context/AuthContext';
import { OnboardingModal } from '@/features/onboarding/components/OnboardingModal';

import { ThemeProvider } from '@/theme/theme';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  // Auto-open onboarding for non-onboarded users
  useEffect(() => {
    if (user && user.onboarding_completed === false) {
      setIsOnboardingOpen(true);
    }
  }, [user]);

  // Listen for explicit "Restart Onboarding" event from Settings
  useEffect(() => {
    const handleRestart = () => {
      setIsOnboardingOpen(true);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('aure_restart_onboarding', handleRestart);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('aure_restart_onboarding', handleRestart);
      }
    };
  }, []);

  // Derive activeTab for Header (Draft vs Vault)
  const isVault = pathname.includes('/vault');
  const activeTab = isVault ? 'Vault' : 'Draft';
  const isChat = pathname.startsWith('/dashboard/chat');

  const handleTabChange = (tab: string) => {
    if (tab === 'Vault') router.push('/dashboard/vault');
    if (tab === 'Draft') router.push('/dashboard/optimizer');
  };

  return (
    <ThemeProvider>
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

        {/* Onboarding Flow Modal */}
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
        />
      </AuthGuard>
    </ThemeProvider>
  );
}
