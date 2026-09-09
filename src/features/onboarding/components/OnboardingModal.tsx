'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/theme/theme';
import { apiClient } from '@/utils/apiClient';
import { getUserMessage } from '@/utils/errorMessages';
import { ONBOARDING_STEPS } from '../config/stepsConfig';
import { OnboardingProgress } from './OnboardingProgress';
import { ProfileStep } from './steps/ProfileStep';
import { RoleStep } from './steps/RoleStep';
import { ModeStep } from './steps/ModeStep';
import { FinishStep } from './steps/FinishStep';
import { ROLE_MODES } from '@/constants/roles';
import { AlertCircle, Check, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react';
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
  const prefersReduced = useReducedMotion();
  const { user, refreshUserProfile } = useAuth();
  const { theme: appResolvedTheme, preference: appPreference, setPreference: setAppPreference } = useTheme();

  // Desktop (> 1024px) gets the two-column rail layout; below that, single column.
  const isDesktop = !isTablet;

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
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
      case 'profile':
        return displayName.trim().length >= 2;
      case 'role':
        return Boolean(role);
      case 'focus':
        return Boolean(mode);
      case 'finish':
        return Boolean(theme);
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setDirection(1);
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setDirection(-1);
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleJumpToStep = (idx: number) => {
    if (idx === currentStepIndex) return;
    setDirection(idx > currentStepIndex ? 1 : -1);
    setCurrentStepIndex(idx);
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

  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1;
  const firstName = displayName.trim().split(/\s+/)[0] || 'there';

  const colors = {
    pageBg: isDark ? '#0A041A' : '#F6F5FB',
    cardBg: isDark ? '#140C2C' : '#FFFFFF',
    railBg: isDark
      ? 'linear-gradient(165deg, #1B1140 0%, #140C2C 55%, #120A26 100%)'
      : 'linear-gradient(165deg, #F5F3FF 0%, #FBFAFF 55%, #FFFFFF 100%)',
    textPrimary: isDark ? '#FFFFFF' : '#0F172A',
    textSecondary: isDark ? 'rgba(255, 255, 255, 0.65)' : '#64748B',
    cardBorder: isDark ? 'rgba(124, 58, 237, 0.20)' : '#E2E8F0',
    railBorder: isDark ? 'rgba(124, 58, 237, 0.24)' : '#ECE9FB',
    divider: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
  };

  // ── Framer Motion step transition variants ──────────────────────────────
  const offset = prefersReduced ? 0 : 28;
  const stepVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? offset : -offset }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -offset : offset }),
  };

  // ── Shared: current step title + subtitle ───────────────────────────────
  const stepTitle = isLastStep
    ? `You're all set, ${firstName}! 🎊`
    : currentStep.motivationalTitle || currentStep.title;
  const stepSubtitle = currentStep.motivationalSubtitle || currentStep.subtitle;

  // ── Shared: the active step component ────────────────────────────────────
  const renderStepInner = () => {
    switch (currentStep.id) {
      case 'profile':
        return (
          <ProfileStep
            displayName={displayName}
            onChangeName={setDisplayName}
            onEnter={handleNextStep}
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
        );
      case 'role':
        return <RoleStep selectedRole={role} onSelectRole={handleSelectRole} isDark={isDark} />;
      case 'focus':
        return <ModeStep selectedRole={role} selectedMode={mode} onSelectMode={setMode} isDark={isDark} />;
      case 'finish':
        return (
          <FinishStep
            displayName={displayName}
            role={role}
            mode={mode}
            avatarUrl={avatarUrl}
            avatarPreset={avatarPreset}
            theme={theme}
            onSelectTheme={handleSelectTheme}
            isDark={isDark}
          />
        );
      default:
        return null;
    }
  };

  // ── Shared: animated step content region ─────────────────────────────────
  const stepContent = (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={currentStep.id}
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {renderStepInner()}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  // ── Shared: footer navigation (Back / Continue / Complete) ───────────────
  const footerNav = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: currentStepIndex > 0 ? 'space-between' : 'flex-end',
        paddingTop: isMobile ? 12 : 16,
        borderTop: `1px solid ${colors.divider}`,
        boxSizing: 'border-box',
        width: '100%',
        gap: 8,
        flexShrink: 0,
      }}
    >
      {currentStepIndex > 0 && (
        <button
          type="button"
          onClick={handlePrevStep}
          disabled={isSubmitting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: isMobile ? '8px 14px' : '9.5px 20px',
            borderRadius: 10,
            fontSize: isMobile ? 12.5 : 13.5,
            fontWeight: 600,
            background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0'}`,
            color: colors.textPrimary,
            cursor: 'pointer',
            transition: 'all 180ms ease',
          }}
          className="hover:opacity-85 active:scale-95"
        >
          <ArrowLeft size={14} /> Back
        </button>
      )}

      {!isLastStep ? (
        <button
          type="button"
          onClick={handleNextStep}
          disabled={!isStepValid()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: isMobile ? '9px 18px' : '10.5px 24px',
            borderRadius: 10,
            fontSize: isMobile ? 12.5 : 13.5,
            fontWeight: 700,
            background: isStepValid() ? '#6366F1' : 'rgba(99, 102, 241, 0.3)',
            color: '#FFFFFF',
            border: 'none',
            cursor: isStepValid() ? 'pointer' : 'not-allowed',
            boxShadow: isStepValid() ? '0 5px 15px rgba(99, 102, 241, 0.35)' : 'none',
            opacity: isStepValid() ? 1 : 0.6,
            transition: 'all 180ms ease',
            whiteSpace: 'nowrap',
          }}
          className="hover:brightness-105 active:scale-95"
        >
          <span>Continue</span>
          <ArrowRight size={15} />
          {!isMobile && (
            <kbd
              style={{
                fontSize: 10,
                padding: '1.5px 5px',
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.22)',
                fontWeight: 700,
                letterSpacing: '0.3px',
                border: '1px solid rgba(255, 255, 255, 0.30)',
                lineHeight: 1,
                display: 'inline-block',
              }}
            >
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
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: isMobile ? '9px 18px' : '10.5px 26px',
            borderRadius: 10,
            fontSize: isMobile ? 12.5 : 13.5,
            fontWeight: 700,
            background: '#6366F1',
            color: '#FFFFFF',
            border: 'none',
            cursor: isSubmitting ? 'wait' : 'pointer',
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
            <kbd
              style={{
                fontSize: 10,
                padding: '1.5px 5px',
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.22)',
                fontWeight: 700,
                letterSpacing: '0.3px',
                border: '1px solid rgba(255, 255, 255, 0.30)',
                lineHeight: 1,
                display: 'inline-block',
              }}
            >
              ↵ Enter
            </kbd>
          )}
        </button>
      )}
    </div>
  );

  const brandMark = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo_1.svg" alt="AURE Logo" style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'contain' }} />
      <span style={{ fontSize: 16, fontWeight: 800, color: colors.textPrimary, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
        AURE
      </span>
    </div>
  );

  const skipButton = (
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
      className="hover:!text-[#6366F1] hover:!border-[#6366F1] active:scale-95"
      title="Skip onboarding"
    >
      Skip for now
    </button>
  );

  const helpLink = (
    <button
      type="button"
      onClick={() => window.open('https://support.promptiq.com', '_blank')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: isMobile ? 11.5 : 12.5,
        fontWeight: 600,
        color: colors.textSecondary,
        transition: 'color 180ms ease',
        padding: 0,
      }}
      className="hover:!text-[#6366F1]"
    >
      <HelpCircle size={13} /> Need help?
    </button>
  );

  const errorBanner = errorMessage ? (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        borderRadius: 10,
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        color: '#EF4444',
        fontSize: 12.5,
        marginBottom: 12,
        flexShrink: 0,
      }}
    >
      <AlertCircle size={15} style={{ flexShrink: 0 }} />
      <span>{errorMessage}</span>
    </div>
  ) : null;

  const stepHeader = (
    <div style={{ flexShrink: 0 }}>
      <h1
        style={{
          fontSize: isMobile ? 19 : isTablet ? 22 : 25,
          fontWeight: 800,
          color: colors.textPrimary,
          margin: 0,
          letterSpacing: '-0.4px',
          lineHeight: 1.2,
        }}
      >
        {stepTitle}
      </h1>
      <p
        style={{
          fontSize: isMobile ? 12.5 : 14,
          color: colors.textSecondary,
          margin: isMobile ? '4px 0 0' : '6px 0 0',
          lineHeight: 1.45,
          maxWidth: 560,
        }}
      >
        {stepSubtitle}
      </p>
    </div>
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: colors.pageBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        overflow: 'hidden',
        boxSizing: 'border-box',
        padding: isMobile ? '0' : isTablet ? '20px' : '28px',
        animation: 'onbOverlayIn 240ms ease-out',
      }}
    >
      <style>{`
        @keyframes onbOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes onbCardIn {
          from { opacity: 0; transform: translateY(10px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* ── DESKTOP: two-column card with branded left rail ── */}
      {isDesktop ? (
        <div
          style={{
            width: '100%',
            maxWidth: 980,
            height: 'min(660px, calc(100vh - 56px))',
            background: colors.cardBg,
            border: `1.5px solid ${colors.cardBorder}`,
            borderRadius: 24,
            boxShadow: isDark ? '0 24px 70px rgba(0,0,0,0.5)' : '0 20px 60px rgba(124, 58, 237, 0.1), 0 2px 8px rgba(0,0,0,0.03)',
            display: 'flex',
            overflow: 'hidden',
            boxSizing: 'border-box',
            animation: 'onbCardIn 320ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          {/* Left rail */}
          <aside
            style={{
              width: 320,
              flexShrink: 0,
              background: colors.railBg,
              borderRight: `1px solid ${colors.railBorder}`,
              padding: '30px 28px',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative brand glow */}
            <div
              style={{
                position: 'absolute',
                top: -70,
                right: -70,
                width: 180,
                height: 180,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.22) 0%, rgba(139, 92, 246, 0) 70%)',
                pointerEvents: 'none',
              }}
            />

            {brandMark}

            <p
              style={{
                fontSize: 13,
                color: colors.textSecondary,
                margin: '14px 0 22px',
                lineHeight: 1.5,
                position: 'relative',
              }}
            >
              Let&rsquo;s personalize your workspace in four quick steps.
            </p>

            <OnboardingProgress
              steps={ONBOARDING_STEPS}
              currentStepIndex={currentStepIndex}
              isDark={isDark}
              onSelectStep={handleJumpToStep}
              orientation="vertical"
            />

            {/* Rail footer */}
            <div style={{ marginTop: 'auto', paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              {!isLastStep ? skipButton : <span />}
              {helpLink}
            </div>
          </aside>

          {/* Right panel */}
          <section
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              padding: '36px 40px 26px',
              boxSizing: 'border-box',
              gap: 18,
            }}
          >
            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                overflowY: 'auto',
                boxSizing: 'border-box',
                scrollbarWidth: 'thin',
              }}
            >
              <div
                style={{
                  width: '100%',
                  margin: 'auto 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  boxSizing: 'border-box',
                }}
              >
                {stepHeader}
                {errorBanner}
                {stepContent}
              </div>
            </div>
            {footerNav}
          </section>
        </div>
      ) : (
        /* ── MOBILE / TABLET: single-column card ── */
        <div
          style={{
            width: '100%',
            maxWidth: 640,
            height: isMobile ? '100svh' : 'min(720px, calc(100vh - 40px))',
            maxHeight: isMobile ? '100svh' : '100vh',
            background: colors.cardBg,
            border: isMobile ? 'none' : `1.5px solid ${colors.cardBorder}`,
            borderRadius: isMobile ? 0 : 22,
            boxShadow: isMobile ? 'none' : isDark ? '0 20px 60px rgba(0,0,0,0.45)' : '0 16px 50px rgba(124, 58, 237, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            padding: isMobile ? (isSmall ? '14px 14px 12px' : '16px 16px 14px') : '24px 28px',
            gap: 0,
            overflow: 'hidden',
            animation: 'onbCardIn 300ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        >
          {/* ── Pinned top brand bar ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexShrink: 0, paddingBottom: isMobile ? 14 : 0 }}>
            {brandMark}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {!isSmall && helpLink}
              {!isLastStep && skipButton}
            </div>
          </div>

          {/* ── Pinned: Progress bar ── */}
          <div style={{ flexShrink: 0, paddingBottom: isMobile ? 14 : 0 }}>
            <OnboardingProgress
              steps={ONBOARDING_STEPS}
              currentStepIndex={currentStepIndex}
              isDark={isDark}
              onSelectStep={handleJumpToStep}
              orientation="horizontal"
            />
          </div>

          {/* ── Pinned: Step title + subtitle ── */}
          <div style={{ flexShrink: 0, paddingBottom: isMobile ? 12 : 0 }}>
            {stepHeader}
            {errorBanner}
          </div>

          {/* ── Scrollable: Step-specific content only ── */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              overflowY: 'auto',
              overflowX: 'hidden',
              boxSizing: 'border-box',
              scrollbarWidth: 'thin',
            }}
          >
            {stepContent}
          </div>

          {/* ── Pinned bottom footer nav ── */}
          <div style={{ flexShrink: 0, paddingTop: isMobile ? 10 : 0 }}>
            {footerNav}
          </div>
        </div>
      )}
    </div>
  );
};
