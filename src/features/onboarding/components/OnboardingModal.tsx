'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/theme/theme';
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
import { useMediaQuery } from '@/hooks/useMediaQuery';

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
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isSmall = useMediaQuery('(max-width: 420px)');
  const { user, refreshUserProfile } = useAuth();
  const { theme: appResolvedTheme, preference: appPreference, setPreference: setAppPreference } = useTheme();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [displayName, setDisplayName] = useState<string>('');
  const [role, setRole] = useState<string>('student');
  const [mode, setMode] = useState<string>('Learnings');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreset, setAvatarPreset] = useState<number>(0);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => appPreference || 'system');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() => appResolvedTheme === 'dark');

  // Guard to ensure draft is loaded strictly once per modal session to prevent resetting state on theme changes
  const loadedDraftKeyRef = useRef<string | null>(null);

  // Synchronize dark mode state based on selected theme & system scheme
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (theme === 'light') {
      setIsDark(false);
      return;
    }
    if (theme === 'dark') {
      setIsDark(true);
      return;
    }

    // theme === 'system': follow operating scheme live
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setIsDark(mql.matches);
    update();

    if (mql.addEventListener) {
      mql.addEventListener('change', update);
      return () => mql.removeEventListener('change', update);
    }
    mql.addListener(update);
    return () => mql.removeListener(update);
  }, [theme]);

  // Load existing user-scoped draft or initialize fresh state for THIS specific user
  useEffect(() => {
    if (!isOpen) {
      loadedDraftKeyRef.current = null;
      return;
    }

    const storageKey = getUserStorageKey(user);
    if (loadedDraftKeyRef.current === storageKey) {
      // Already initialized for this modal session
      return;
    }
    loadedDraftKeyRef.current = storageKey;

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
        } else if (appPreference) {
          setTheme(appPreference);
        }
        if (typeof parsed.currentStepIndex === 'number' && parsed.currentStepIndex < ONBOARDING_STEPS.length) {
          setCurrentStepIndex(parsed.currentStepIndex);
        }
        loadedFromDraft = true;
      }
    } catch (e) {
      console.warn('Failed to parse user onboarding draft:', e);
    }

    // If no draft exists for THIS specific user, initialize a brand new onboarding flow matching system/app theme
    if (!loadedFromDraft) {
      const defaultName = user?.display_name || (user?.email ? user.email.split('@')[0] : '');
      setDisplayName(defaultName || '');
      setRole('student');
      setMode('Learnings');
      setAvatarUrl(user?.avatar_url || null);
      setAvatarPreset(0);
      setAvatarFile(null);
      setTheme(appPreference || 'system');
      setCurrentStepIndex(0);
    }
  }, [isOpen, user]); // Note: appPreference excluded so changing theme does not reset draft state!

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

  // Handle Theme selection & update app preference live with instant persistence (1-tap selection)
  const handleSelectTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setAppPreference(newTheme);
    try {
      const storageKey = getUserStorageKey(user);
      const savedDraft = localStorage.getItem(storageKey);
      const parsed = savedDraft ? JSON.parse(savedDraft) : {};
      localStorage.setItem(storageKey, JSON.stringify({ ...parsed, theme: newTheme }));
    } catch (e) {
      // Ignore
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
        return false;
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Apple / Notion style keyboard navigation: Enter to continue, Alt+ArrowLeft to go back
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        // Do not intercept if user is typing multiline or focused on an interactive button
        if (e.target instanceof HTMLTextAreaElement) return;
        if (e.target instanceof HTMLButtonElement && e.target.type !== 'submit') return;

        e.preventDefault();
        if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
          if (isStepValid()) {
            handleNextStep();
          }
        } else {
          if (!isSubmitting) {
            handleFinishOnboarding();
          }
        }
      } else if (e.key === 'ArrowLeft' && (e.altKey || e.metaKey)) {
        e.preventDefault();
        if (currentStepIndex > 0) {
          handlePrevStep();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, displayName, role, mode, theme, isSubmitting]);

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
        setAppPreference(theme);
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
      <style>{`
        @keyframes stepContentIn {
          0% {
            opacity: 0;
            transform: translateY(6px) scale(0.995);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* Top Navbar Header */}
      <header
        style={{
          width: '100%',
          padding: isMobile ? '12px 16px' : isTablet ? '14px 24px' : '14px 40px',
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

        {/* Right Header Actions: Need Help */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
          {!isSmall && (
            <button
              type="button"
              onClick={() => window.open('https://support.promptiq.com', '_blank')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: isMobile ? 11.5 : 12.5, fontWeight: 600, color: colors.textSecondary,
                transition: 'color 180ms ease'
              }}
              className="hover:!text-[#6366F1]"
            >
              <HelpCircle size={13} /> {isMobile ? 'Help' : 'Need help?'}
            </button>
          )}
        </div>
      </header>

      {/* Main Centered Full-Screen Onboarding Page Container */}
      <main
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: isMobile ? '4px 12px 14px' : isTablet ? '8px 20px 20px' : '8px 24px 20px',
          boxSizing: 'border-box', width: '100%',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 840,
            minHeight: isMobile ? 'auto' : 540,
            maxHeight: isMobile ? 'calc(100dvh - 65px)' : 'calc(100vh - 75px)',
            background: colors.cardBg,
            border: `1.5px solid ${colors.cardBorder}`,
            borderRadius: isMobile ? 18 : 24,
            boxShadow: isDark
              ? '0 20px 60px rgba(0,0,0,0.45)'
              : '0 16px 50px rgba(124, 58, 237, 0.08), 0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            boxSizing: 'border-box',
            padding: isMobile
              ? (isSmall ? '16px 14px 14px' : '20px 18px 16px')
              : isTablet
                ? '24px 28px 22px'
                : '32px 44px 28px',
            overflowY: isMobile ? 'auto' : 'hidden',
            animation: 'dropdownFadeIn 280ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          {/* Header Motivational Title, Subtitle & Progress Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 14, boxSizing: 'border-box', flexShrink: 0 }}>
            {/* Top Motivational Greeting & Subtitle + Top-Right Skip Button */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
              boxSizing: 'border-box',
              width: '100%',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{
                  fontSize: isMobile ? 18 : isTablet ? 21 : 24,
                  fontWeight: 800,
                  color: colors.textPrimary,
                  margin: 0,
                  letterSpacing: '-0.35px',
                  lineHeight: 1.25,
                }}>
                  {currentStep.id === 'complete'
                    ? `You're all set, ${displayName.trim().split(/\s+/)[0] || 'there'}! 🎊`
                    : currentStep.motivationalTitle || currentStep.title}
                </h1>
                <p style={{
                  fontSize: isMobile ? 12 : 13.5,
                  color: colors.textSecondary,
                  margin: '4px 0 0',
                  lineHeight: 1.4,
                }}>
                  {currentStep.motivationalSubtitle || currentStep.subtitle}
                </p>
              </div>

              {/* Top Most Right-side "Skip" button */}
              {currentStep.id !== 'complete' && (
                <button
                  type="button"
                  onClick={handleSkipOnboarding}
                  disabled={isSubmitting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: isMobile ? '4px 10px' : '5px 14px',
                    borderRadius: 99,
                    fontSize: isMobile ? 11.5 : 12.5,
                    fontWeight: 600,
                    background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0'}`,
                    color: colors.textSecondary,
                    cursor: isSubmitting ? 'wait' : 'pointer',
                    transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)',
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                  className="hover:!text-[#6366F1] hover:!border-[#6366F1] hover:!bg-[#6366F1]/10 active:scale-95"
                  title="Skip onboarding"
                >
                  Skip
                </button>
              )}
            </div>

            {/* Motivational Progress Card with interactive jump-to-step support */}
            <OnboardingProgress
              steps={ONBOARDING_STEPS}
              currentStepIndex={currentStepIndex}
              isDark={isDark}
              onSelectStep={(idx) => setCurrentStepIndex(idx)}
            />
          </div>

          {/* Body Step Content Container - Uniform fixed height on mobile across all 6 steps */}
          <div style={{
            margin: isMobile ? '8px 0' : '12px 0',
            padding: isMobile ? '2px 2px' : '8px 4px',
            flex: isMobile ? 'none' : 1,
            height: isMobile ? 325 : undefined,
            minHeight: isMobile ? 325 : 280,
            maxHeight: isMobile ? 325 : 380,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '100%',
            overflowY: isMobile ? 'auto' : 'visible',
            scrollbarWidth: 'thin',
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

            <div
              key={currentStep.id}
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxSizing: 'border-box',
                animation: 'stepContentIn 220ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
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
                  onSelectTheme={handleSelectTheme}
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
          </div>

          {/* Footer Navigation Buttons */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: currentStepIndex > 0 ? 'space-between' : 'flex-end',
            paddingTop: isMobile ? 12 : 16, borderTop: `1px solid ${colors.divider}`,
            boxSizing: 'border-box', width: '100%', gap: 8, flexShrink: 0,
          }}>
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                style={{
                  padding: isMobile ? '8px 14px' : '9.5px 20px', borderRadius: 10,
                  fontSize: isMobile ? 12.5 : 13.5, fontWeight: 600,
                  background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0'}`,
                  color: colors.textPrimary, cursor: 'pointer', transition: 'all 180ms ease'
                }}
                className="hover:opacity-85 active:scale-95"
              >
                ← Back
              </button>
            )}

            {currentStepIndex < ONBOARDING_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!isStepValid()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: isMobile ? '9px 18px' : '10.5px 24px', borderRadius: 10,
                  fontSize: isMobile ? 12.5 : 13.5, fontWeight: 700,
                  background: isStepValid() ? '#6366F1' : 'rgba(99, 102, 241, 0.3)',
                  color: '#FFFFFF', border: 'none',
                  cursor: isStepValid() ? 'pointer' : 'not-allowed',
                  boxShadow: isStepValid() ? '0 5px 15px rgba(99, 102, 241, 0.35)' : 'none',
                  opacity: isStepValid() ? 1 : 0.6,
                  transition: 'all 180ms ease',
                  whiteSpace: 'nowrap',
                }}
                className="hover:brightness-105 active:scale-95"
              >
                <span>Continue →</span>
                {!isMobile && (
                  <kbd style={{
                    fontSize: 10,
                    padding: '1.5px 5px',
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.22)',
                    fontWeight: 700,
                    letterSpacing: '0.3px',
                    border: '1px solid rgba(255, 255, 255, 0.30)',
                    lineHeight: 1,
                    display: 'inline-block',
                  }}>
                    ↵ Enter
                  </kbd>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishOnboarding}
                disabled={isSubmitting}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: isMobile ? '9px 18px' : '10.5px 26px', borderRadius: 10,
                  fontSize: isMobile ? 12.5 : 13.5, fontWeight: 700,
                  background: '#6366F1',
                  color: '#FFFFFF', border: 'none', cursor: isSubmitting ? 'wait' : 'pointer',
                  boxShadow: '0 5px 16px rgba(99, 102, 241, 0.40)',
                  opacity: isSubmitting ? 0.7 : 1,
                  transition: 'all 180ms ease',
                  whiteSpace: 'nowrap',
                }}
                className="hover:brightness-110 active:scale-95"
              >
                <span>{isSubmitting ? 'Saving...' : 'Complete Setup'}</span>
                <Check size={14} strokeWidth={3} />
                {!isMobile && !isSubmitting && (
                  <kbd style={{
                    fontSize: 10,
                    padding: '1.5px 5px',
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.22)',
                    fontWeight: 700,
                    letterSpacing: '0.3px',
                    border: '1px solid rgba(255, 255, 255, 0.30)',
                    lineHeight: 1,
                    display: 'inline-block',
                  }}>
                    ↵ Enter
                  </kbd>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
