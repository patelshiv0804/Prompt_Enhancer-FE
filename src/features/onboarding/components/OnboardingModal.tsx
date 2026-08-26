'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/utils/apiClient';
import { getUserMessage } from '@/utils/errorMessages';
import { ONBOARDING_STEPS } from '../config/stepsConfig';
import { OnboardingProgress } from './OnboardingProgress';
import { DisplayNameStep } from './steps/DisplayNameStep';
import { RoleStep } from './steps/RoleStep';
import { ModeStep } from './steps/ModeStep';
import { AvatarStep } from './steps/AvatarStep';
import { ThemeStep } from './steps/ThemeStep';
import { CompletionStep } from './steps/CompletionStep';
import { ROLE_MODES } from '@/constants/roles';
import { AlertCircle, Check, HelpCircle, ArrowRight } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getUserStorageKey = (u?: any): string => {
  if (!u) return 'aure_onboarding_guest';
  const id = u.id || u.email || u.username;
  return id ? `aure_onboarding_draft_${id}` : 'aure_onboarding_guest';
};

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshUserProfile } = useAuth();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [displayName, setDisplayName] = useState<string>('');
  const [role, setRole] = useState<string>('student');
  const [mode, setMode] = useState<string>('Learnings');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreset, setAvatarPreset] = useState<number>(0);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);

  // Detect dark mode preference based on selected theme (Light is default)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'light') {
        setIsDark(false);
      } else if (theme === 'dark') {
        setIsDark(true);
      } else {
        const matchDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(matchDark);
      }
    }
  }, [theme]);

  // Load existing user-scoped draft or initialize fresh state for THIS specific user (Light theme by default)
  useEffect(() => {
    if (!isOpen) return;

    const storageKey = getUserStorageKey(user);

    // Clean up old non-user-scoped global draft if present
    try {
      localStorage.removeItem('aure_onboarding_draft');
    } catch (e) {
      // Ignore
    }

    let loadedFromDraft = false;

    try {
      const savedDraft = localStorage.getItem(storageKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.displayName) setDisplayName(parsed.displayName);
        if (parsed.role) setRole(parsed.role);
        if (parsed.mode) setMode(parsed.mode);
        if (parsed.avatarUrl !== undefined) setAvatarUrl(parsed.avatarUrl);
        if (parsed.avatarPreset !== undefined) setAvatarPreset(parsed.avatarPreset);
        if (parsed.theme && (parsed.theme === 'light' || parsed.theme === 'dark' || parsed.theme === 'system')) {
          setTheme(parsed.theme);
        } else {
          setTheme('light');
        }
        if (typeof parsed.currentStepIndex === 'number' && parsed.currentStepIndex < ONBOARDING_STEPS.length) {
          setCurrentStepIndex(parsed.currentStepIndex);
        }
        loadedFromDraft = true;
      }
    } catch (e) {
      console.warn('Failed to parse user onboarding draft:', e);
    }

    // If no draft exists for THIS specific user, initialize a brand new light-theme onboarding flow
    if (!loadedFromDraft) {
      const defaultName = user?.display_name || (user?.email ? user.email.split('@')[0] : '');
      setDisplayName(defaultName || '');
      setRole('student');
      setMode('Learnings');
      setAvatarUrl(user?.avatar_url || null);
      setAvatarPreset(0);
      setAvatarFile(null);
      setTheme('light'); // Light theme by default
      setCurrentStepIndex(0); // Start at Step 1 for new user
    }
  }, [isOpen, user]);

  // Persist user-scoped draft progress whenever state updates
  useEffect(() => {
    if (!isOpen) return;
    try {
      const storageKey = getUserStorageKey(user);
      const draftState = {
        displayName,
        role,
        mode,
        avatarUrl,
        avatarPreset,
        theme,
        currentStepIndex,
      };
      localStorage.setItem(storageKey, JSON.stringify(draftState));
    } catch (e) {
      console.warn('Failed to save user onboarding draft:', e);
    }
  }, [displayName, role, mode, avatarUrl, avatarPreset, theme, currentStepIndex, isOpen, user]);

  // Handle Role selection & reset mode if current mode doesn't belong to new role
  const handleSelectRole = (newRoleId: string) => {
    setRole(newRoleId);
    const availableModes = ROLE_MODES[newRoleId.toLowerCase()] || ROLE_MODES['general'];
    if (!availableModes.includes(mode)) {
      setMode(availableModes[0] || 'Study');
    }
  };

  const currentStep = ONBOARDING_STEPS[currentStepIndex];

  const isStepValid = (): boolean => {
    switch (currentStep.id) {
      case 'display_name':
        return displayName.trim().length >= 2;
      case 'role':
        return Boolean(role);
      case 'mode':
        return Boolean(mode);
      case 'avatar':
        return true;
      case 'theme':
        return Boolean(theme);
      case 'complete':
        return true;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (!isStepValid()) return;
    setErrorMessage(null);
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Skip Onboarding Action Handler
  const handleSkipOnboarding = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await apiClient.patch('/api/v1/profile/onboarding', { onboarding_completed: true });

      if (refreshUserProfile) {
        await refreshUserProfile();
      }

      // Clean up user draft upon skipping
      try {
        const storageKey = getUserStorageKey(user);
        localStorage.removeItem(storageKey);
        localStorage.removeItem('aure_onboarding_draft');
      } catch (e) {
        // Ignore
      }

      onClose();
    } catch (err: any) {
      console.error('Skip onboarding error:', err);
      setErrorMessage(getUserMessage(err, 'Failed to skip onboarding. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Final Setup Completion Handler
  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      if (displayName.trim()) {
        formData.append('display_name', displayName.trim());
      }
      if (role) {
        formData.append('role', role);
      }
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await apiClient.patch('/api/v1/profile/me', formData);

      try {
        await apiClient.patch('/api/v1/settings/default-mode', { default_mode: mode.toLowerCase() });
      } catch (err) {
        console.warn('Backend mode update warning:', err);
      }

      try {
        await apiClient.patch('/api/v1/settings/theme', { theme });
      } catch (err) {
        console.warn('Backend theme update warning:', err);
      }

      await apiClient.patch('/api/v1/profile/onboarding', { onboarding_completed: true });

      if (refreshUserProfile) {
        await refreshUserProfile();
      }

      // Clean up user draft upon completion
      try {
        const storageKey = getUserStorageKey(user);
        localStorage.removeItem(storageKey);
        localStorage.removeItem('aure_onboarding_draft');
      } catch (e) {
        // Ignore
      }

      onClose();
    } catch (err: any) {
      console.error('Onboarding completion error:', err);
      setErrorMessage(getUserMessage(err, 'Failed to complete setup. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const colors = {
    pageBg: isDark ? '#0A041A' : '#F6F5FB',
    cardBg: isDark ? '#140C2C' : '#FFFFFF',
    textPrimary: isDark ? '#FFFFFF' : '#0F172A',
    textSecondary: isDark ? 'rgba(255, 255, 255, 0.65)' : '#64748B',
    cardBorder: isDark ? 'rgba(124, 58, 237, 0.20)' : '#E2E8F0',
    divider: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: colors.pageBg,
        display: 'flex', flexDirection: 'column',
        height: '100vh', overflow: 'hidden', boxSizing: 'border-box',
        animation: 'fadeIn 240ms ease-out',
      }}
    >
      {/* Top Navbar Header */}
      <header
        style={{
          width: '100%', padding: '14px 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxSizing: 'border-box', flexShrink: 0,
        }}
      >
        {/* Brand Logo & Name: AURE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo_1.svg" alt="AURE Logo" style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'contain' }} />
          <span style={{ fontSize: 16, fontWeight: 800, color: colors.textPrimary, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
            AURE
          </span>
        </div>

        {/* Right Header Actions: Skip Onboarding & Need Help */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={handleSkipOnboarding}
            disabled={isSubmitting}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 14px', borderRadius: 99, fontSize: 12.5, fontWeight: 600,
              background: isDark ? 'rgba(99, 102, 241, 0.15)' : '#F5F3FF',
              color: '#6366F1', border: `1.5px solid ${isDark ? 'rgba(99, 102, 241, 0.3)' : '#C7D2FE'}`,
              cursor: isSubmitting ? 'wait' : 'pointer', transition: 'all 180ms ease'
            }}
            className="hover:!bg-[#6366F1] hover:!text-white active:scale-95"
            title="Skip setup and configure preferences later in Settings"
          >
            Skip for now <ArrowRight size={13} />
          </button>

          <button
            type="button"
            onClick={() => window.open('https://support.promptiq.com', '_blank')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12.5, fontWeight: 600, color: colors.textSecondary,
              transition: 'color 180ms ease'
            }}
            className="hover:!text-[#6366F1]"
          >
            <HelpCircle size={14} /> Need help?
          </button>
        </div>
      </header>

      {/* Main Centered Full-Screen Onboarding Page Container */}
      <main
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '8px 24px 20px', boxSizing: 'border-box', width: '100%', overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: '100%', maxWidth: 840, height: 590, maxHeight: 'calc(100vh - 75px)',
            background: colors.cardBg,
            border: `1.5px solid ${colors.cardBorder}`,
            borderRadius: 24,
            boxShadow: isDark
              ? '0 20px 60px rgba(0,0,0,0.45)'
              : '0 16px 50px rgba(124, 58, 237, 0.08), 0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            boxSizing: 'border-box',
            padding: '32px 44px 28px',
            animation: 'dropdownFadeIn 280ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          {/* Header Step Progress Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box', flexShrink: 0 }}>
            <OnboardingProgress steps={ONBOARDING_STEPS} currentStepIndex={currentStepIndex} isDark={isDark} />

            <div style={{ boxSizing: 'border-box', marginTop: 2 }}>
              <h1 style={{ fontSize: 23, fontWeight: 800, color: colors.textPrimary, margin: 0, letterSpacing: '-0.3px' }}>
                {currentStep.id === 'complete' ? `You're all set, ${displayName.trim().split(/\s+/)[0] || 'there'}!` : currentStep.title}
              </h1>
              <p style={{ fontSize: 13.5, color: colors.textSecondary, margin: '4px 0 0', lineHeight: 1.4 }}>
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          {/* Body Step Content Container with spacious 360px height */}
          <div style={{
            margin: '18px 0', flex: 1, height: 360, boxSizing: 'border-box',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            width: '100%', overflow: 'hidden'
          }}>
            {errorMessage && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#EF4444', fontSize: 12.5, marginBottom: 14,
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {currentStep.id === 'display_name' && (
              <DisplayNameStep
                value={displayName}
                onChange={setDisplayName}
                onEnter={handleNextStep}
                isDark={isDark}
              />
            )}

            {currentStep.id === 'role' && (
              <RoleStep
                selectedRole={role}
                onSelectRole={handleSelectRole}
                isDark={isDark}
              />
            )}

            {currentStep.id === 'mode' && (
              <ModeStep
                selectedRole={role}
                selectedMode={mode}
                onSelectMode={setMode}
                isDark={isDark}
              />
            )}

            {currentStep.id === 'avatar' && (
              <AvatarStep
                displayName={displayName}
                avatarUrl={avatarUrl}
                avatarPreset={avatarPreset}
                onUploadFile={(file) => {
                  setAvatarFile(file);
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setAvatarUrl(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }}
                onSelectPreset={(idx) => {
                  setAvatarPreset(idx);
                  setAvatarUrl(null);
                  setAvatarFile(null);
                }}
                onRemovePhoto={() => {
                  setAvatarUrl(null);
                  setAvatarFile(null);
                }}
                isDark={isDark}
              />
            )}

            {currentStep.id === 'theme' && (
              <ThemeStep
                selectedTheme={theme}
                onSelectTheme={setTheme}
                isDark={isDark}
              />
            )}

            {currentStep.id === 'complete' && (
              <CompletionStep
                displayName={displayName}
                role={role}
                mode={mode}
                avatarUrl={avatarUrl}
                avatarPreset={avatarPreset}
                theme={theme}
                isDark={isDark}
              />
            )}
          </div>

          {/* Footer Navigation Buttons */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: 16, borderTop: `1px solid ${colors.divider}`,
            boxSizing: 'border-box', width: '100%',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {currentStepIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={isSubmitting}
                  style={{
                    padding: '9.5px 20px', borderRadius: 10, fontSize: 13.5, fontWeight: 600,
                    background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0'}`,
                    color: colors.textPrimary, cursor: 'pointer', transition: 'all 180ms ease'
                  }}
                  className="hover:opacity-85 active:scale-95"
                >
                  ← Back
                </button>
              )}

              <button
                type="button"
                onClick={handleSkipOnboarding}
                disabled={isSubmitting}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, color: colors.textSecondary,
                  transition: 'color 180ms ease'
                }}
                className="hover:!text-[#6366F1]"
              >
                Skip Onboarding
              </button>
            </div>

            {currentStepIndex < ONBOARDING_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!isStepValid()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10.5px 26px', borderRadius: 10, fontSize: 13.5, fontWeight: 700,
                  background: isStepValid() ? '#6366F1' : 'rgba(99, 102, 241, 0.3)',
                  color: '#FFFFFF', border: 'none',
                  cursor: isStepValid() ? 'pointer' : 'not-allowed',
                  boxShadow: isStepValid() ? '0 5px 15px rgba(99, 102, 241, 0.35)' : 'none',
                  opacity: isStepValid() ? 1 : 0.6,
                  transition: 'all 180ms ease'
                }}
                className="hover:brightness-105 active:scale-95"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishOnboarding}
                disabled={isSubmitting}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10.5px 26px', borderRadius: 10, fontSize: 13.5, fontWeight: 700,
                  background: '#6366F1',
                  color: '#FFFFFF', border: 'none', cursor: isSubmitting ? 'wait' : 'pointer',
                  boxShadow: '0 5px 16px rgba(99, 102, 241, 0.40)',
                  opacity: isSubmitting ? 0.7 : 1,
                  transition: 'all 180ms ease'
                }}
                className="hover:brightness-110 active:scale-95"
              >
                {isSubmitting ? 'Saving Setup...' : 'Complete Setup'} <Check size={15} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
