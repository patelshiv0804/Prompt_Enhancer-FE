'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  User, Check, Settings, AlertTriangle, Trash2, Camera,
  Save, Sparkles, Code, Palette, Fingerprint, Zap,
  ChevronDown, CheckCircle2, X, ShieldAlert, AlertCircle, RefreshCw,
  Target, Flame
} from 'lucide-react';
import { apiClient } from '@/utils/apiClient';

/* ── Custom Switch Component ── */
interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
  ariaLabel?: string;
}

function ToggleSwitch({ enabled, onToggle, ariaLabel }: ToggleSwitchProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={ariaLabel || 'Toggle switch'}
      style={{
        width: 38, height: 20, borderRadius: 9999, border: 'none', cursor: 'pointer',
        background: enabled ? 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)' : 'rgba(124,58,237,0.12)',
        position: 'relative', transition: 'background 250ms ease', flexShrink: 0,
        boxShadow: enabled ? '0 2px 8px rgba(124,58,237,0.25)' : 'none',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: enabled ? 20 : 2,
        width: 16, height: 16, borderRadius: '50%', background: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        transition: 'left 250ms ease',
      }} />
    </button>
  );
}

export interface SettingsPageProps {
  initialTab?: 'profile' | 'settings';
}

function SettingsContent({ initialTab = 'settings' }: SettingsPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryTab = searchParams?.get('tab') || searchParams?.get('view');

  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>(() => {
    if (queryTab === 'profile') return 'profile';
    if (queryTab === 'settings') return 'settings';
    return initialTab;
  });

  useEffect(() => {
    if (queryTab === 'profile') setActiveTab('profile');
    else if (queryTab === 'settings') setActiveTab('settings');
  }, [queryTab]);

  /* ═══════════════════════════════════════════════════
     State Definitions
     ═══════════════════════════════════════════════════ */

  // Profile Info
  const [displayName, setDisplayName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreset, setAvatarPreset] = useState<number>(4); // 4 = Fingerprint gradient preset
  const [userRole, setUserRole] = useState<string>('Creator');
  const [plan, setPlan] = useState<string>('Free');
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(false);
  const [createdAt, setCreatedAt] = useState<string>('');
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [stats, setStats] = useState<{ prompts: number; avgScore: number; dayStreak: number }>({
    prompts: 0,
    avgScore: 0,
    dayStreak: 0,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Preference Settings
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [defaultMode, setDefaultMode] = useState<string>('Creative');
  const [defaultModel, setDefaultModel] = useState<string>('Claude');
  const [showDiffByDefault, setShowDiffByDefault] = useState<boolean>(true);
  const [autoDetectIntent, setAutoDetectIntent] = useState<boolean>(true);

  // Active / Dark calculations
  const [isDark, setIsDark] = useState<boolean>(false);

  // UI Interactive States
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [showOnboardingDetail, setShowOnboardingDetail] = useState<boolean>(false);

  // Dropdown states
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState<boolean>(false);
  const modeDropdownRef = useRef<HTMLDivElement>(null);

  // Temp editing fields
  const [tempName, setTempName] = useState<string>('Alex P.');
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string>('');
  const [tempPreset, setTempPreset] = useState<number>(4);
  const [tempRole, setTempRole] = useState<string>('Creator');

  // Toast System
  const [toast, setToast] = useState<{ message: string; visible: boolean; type?: 'success' | 'warning' }>({
    message: '', visible: false, type: 'success'
  });

  // Inline feedback saves
  const [savedFeedback, setSavedFeedback] = useState<Record<string, boolean>>({});

  /* ═══════════════════════════════════════════════════
     Effects & Event Listeners
     ═══════════════════════════════════════════════════ */

  // Handle click outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(event.target as Node)) {
        setIsModeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch live backend user profile, stats & settings
  useEffect(() => {
    async function loadBackendData() {
      setIsLoading(true);
      try {
        const profileData = await apiClient.get('/api/v1/profile/me');
        if (profileData) {
          setDisplayName(profileData.display_name || profileData.email?.split('@')[0] || 'User');
          setEmail(profileData.email || '');
          setAvatarUrl(profileData.avatar_url || null);
          if (profileData.role) {
            const r = profileData.role;
            setUserRole(r.charAt(0).toUpperCase() + r.slice(1));
          }
          if (profileData.plan) {
            const p = profileData.plan;
            setPlan(p.charAt(0).toUpperCase() + p.slice(1));
          }
          if (profileData.onboarding_completed !== undefined) {
            setOnboardingComplete(profileData.onboarding_completed);
          }
          if (profileData.created_at) {
            const d = new Date(profileData.created_at);
            setCreatedAt(d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
          }
          if (profileData.updated_at) {
            const d = new Date(profileData.updated_at);
            setUpdatedAt(d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
          }
        }
      } catch (e) {
        console.warn('Could not load profile:', e);
      }

      try {
        const statsData = await apiClient.get('/api/v1/profile/stats');
        if (statsData) {
          setStats({
            prompts: statsData.total_prompts ?? 0,
            avgScore: typeof statsData.average_score === 'number' ? Math.round(statsData.average_score) : 0,
            dayStreak: statsData.streak_days ?? 0,
          });
        }
      } catch (e) {
        console.warn('Could not load stats:', e);
      }

      try {
        const settingsData = await apiClient.get('/api/v1/settings');
        if (settingsData) {
          if (settingsData.theme) setTheme(settingsData.theme.toLowerCase() as any);
          if (settingsData.default_mode) {
            const m = settingsData.default_mode;
            const modeMap: Record<string, string> = {
              general: 'General', creative: 'Creative', technical: 'Technical',
              marketing: 'Marketing', coding: 'Coding', code: 'Coding',
            };
            setDefaultMode(modeMap[m.toLowerCase()] || (m.charAt(0).toUpperCase() + m.slice(1)));
          }
          if (settingsData.default_model) {
            const m = settingsData.default_model;
            const availableModels = ['ChatGPT', 'Claude', 'Gemini', 'Grok', 'Midjourney', 'VEO', 'Perplexity'];
            const found = availableModels.find(opt => opt.toLowerCase() === m.toLowerCase());
            if (found) setDefaultModel(found);
          }
          if (settingsData.show_diff_by_default !== undefined) setShowDiffByDefault(settingsData.show_diff_by_default);
          if (settingsData.auto_detect_intent !== undefined) setAutoDetectIntent(settingsData.auto_detect_intent);
        }
      } catch (e) {
        console.warn('Could not load settings:', e);
      }
      setIsLoading(false);
    }

    loadBackendData();
  }, []);

  // System theme checks & dynamic dark class toggling
  useEffect(() => {
    if (theme === 'dark') {
      setIsDark(true);
    } else if (theme === 'light') {
      setIsDark(false);
    } else {
      // System choice
      if (typeof window !== 'undefined') {
        const match = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDark(match.matches);
        const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
        match.addEventListener('change', listener);
        return () => match.removeEventListener('change', listener);
      }
    }
  }, [theme]);

  // Toast autohide
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, visible: false }));
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  /* ═══════════════════════════════════════════════════
     Helper Handlers & Logic
     ═══════════════════════════════════════════════════ */

  const triggerToast = (message: string, type: 'success' | 'warning' = 'success') => {
    setToast({ message, visible: true, type });
  };

  const triggerSavedFeedback = (key: string) => {
    setSavedFeedback(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setSavedFeedback(prev => ({ ...prev, [key]: false }));
    }, 1800);
  };

  const handleSavePreferences = async () => {
    try {
      const modeVal = defaultMode.toLowerCase();
      const modelVal = defaultModel.toLowerCase();

      await apiClient.patch('/api/v1/settings', {
        theme: theme,
        default_mode: modeVal,
        default_model: modelVal,
        show_diff_by_default: showDiffByDefault,
        auto_detect_intent: autoDetectIntent,
      });
    } catch (err) {
      console.error('Save preferences notice:', err);
    }

    const d = new Date();
    const formatted = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    setUpdatedAt(formatted);

    triggerSavedFeedback('preferences_card');
    triggerToast('AI preferences saved successfully!');
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    triggerSavedFeedback('theme');
    try {
      await apiClient.patch('/api/v1/settings/theme', { theme: newTheme });
    } catch (err) {
      console.error('Failed to update theme in backend:', err);
    }
  };

  const handleModeChange = async (newMode: string) => {
    setDefaultMode(newMode);
    setIsModeDropdownOpen(false);
    triggerSavedFeedback('default_mode');
    try {
      await apiClient.patch('/api/v1/settings/default-mode', { default_mode: newMode.toLowerCase() });
    } catch (err) {
      console.error('Failed to update default mode in backend:', err);
    }
  };

  const handleModelChange = async (newModel: string) => {
    setDefaultModel(newModel);
    triggerSavedFeedback('default_model');
    try {
      await apiClient.patch('/api/v1/settings/default-model', { default_model: newModel.toLowerCase() });
    } catch (err) {
      console.error('Failed to update default model in backend:', err);
    }
  };

  const handleToggleDiff = async (newVal: boolean) => {
    setShowDiffByDefault(newVal);
    triggerSavedFeedback('show_diff');
    try {
      await apiClient.patch('/api/v1/settings/diff-view', { enabled: newVal });
    } catch (err) {
      console.error('Failed to toggle diff view in backend:', err);
    }
  };

  const handleToggleIntent = async (newVal: boolean) => {
    setAutoDetectIntent(newVal);
    triggerSavedFeedback('auto_detect');
    try {
      await apiClient.patch('/api/v1/settings/intent-detection', { enabled: newVal });
    } catch (err) {
      console.error('Failed to toggle intent detection in backend:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAvatarUrl(reader.result as string);
        setTempPreset(0); // clear preset selection on upload
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Edit Profile modal & populate temp states
  const openEditModal = () => {
    setTempName(displayName);
    setTempAvatarUrl(avatarUrl || '');
    setTempPreset(avatarPreset);
    setTempRole(userRole);
    setAvatarFile(null);
    setIsEditModalOpen(true);
  };

  const saveProfileData = async () => {
    try {
      const formData = new FormData();
      if (tempName.trim()) {
        formData.append('display_name', tempName.trim());
      }
      // Save role to backend
      formData.append('role', tempRole.toLowerCase());
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const updatedProfile = await apiClient.patch('/api/v1/profile/me', formData);
      if (updatedProfile) {
        if (updatedProfile.display_name) setDisplayName(updatedProfile.display_name);
        if (updatedProfile.avatar_url) setAvatarUrl(updatedProfile.avatar_url);
        if (updatedProfile.role) {
          setUserRole(updatedProfile.role.charAt(0).toUpperCase() + updatedProfile.role.slice(1));
        }
      } else {
        setDisplayName(tempName);
        setAvatarPreset(tempPreset);
        setAvatarUrl(tempAvatarUrl.trim() === '' ? null : tempAvatarUrl.trim());
      }
    } catch {
      setDisplayName(tempName);
      setAvatarPreset(tempPreset);
      setAvatarUrl(tempAvatarUrl.trim() === '' ? null : tempAvatarUrl.trim());
    }

    setUserRole(tempRole);
    setIsEditModalOpen(false);

    const d = new Date();
    const formatted = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    setUpdatedAt(formatted);

    triggerSavedFeedback('profile_card');
    triggerToast('Profile information updated!');
  };



  // Get Initials Helper
  const getInitials = (name: string) => {
    if (!name) return 'AP';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  /* ── Presets styling ── */
  const presetAvatarGradients = [
    'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', // Default Violet (Pro)
    'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)', // Tech Blue/Teal
    'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)', // Creative Pink/Rose
    'linear-gradient(135deg, #10B981 0%, #059669 100%)', // Organic Emerald
    'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', // Amber Gold
  ];

  const presetIcons = [
    User,
    Code,
    Palette,
    Sparkles,
    Fingerprint
  ];

  const renderPresetAvatar = (idx: number, size: number = 64, iconSize: number = 28) => {
    const Gradient = presetAvatarGradients[idx % presetAvatarGradients.length];
    const IconComponent = presetIcons[idx % presetIcons.length];
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: Gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 4px 10px rgba(124, 58, 237, 0.25)', flexShrink: 0,
      }}>
        <IconComponent size={iconSize} strokeWidth={1.8} />
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════
     Dynamic Design Theme Mapping
     ═══════════════════════════════════════════════════ */
  const colors = {
    canvasBg: isDark ? '#0E0B18' : 'transparent',
    cardBg: isDark ? '#160F26' : '#FFFFFF',
    cardBorder: isDark ? 'rgba(167, 139, 250, 0.15)' : 'rgba(124, 58, 237, 0.10)',
    cardShadow: isDark
      ? '0 4px 24px rgba(0, 0, 0, 0.45), 0 1px 3px rgba(167, 139, 250, 0.05)'
      : '0 4px 12px rgba(109, 40, 217, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
    textPrimary: isDark ? '#EDE9FE' : 'var(--color-text-primary, #1A1033)',
    textSecondary: isDark ? 'rgba(221, 214, 254, 0.45)' : 'var(--color-text-secondary, #6B6B8A)',
    surfaceBg: isDark ? '#1E1535' : 'rgba(124, 58, 237, 0.04)',
    divider: isDark ? 'rgba(167, 139, 250, 0.12)' : 'rgba(124, 58, 237, 0.08)',
    inputBg: isDark ? '#1E1535' : '#FFFFFF',
    inputBorder: isDark ? 'rgba(167, 139, 250, 0.25)' : 'rgba(124, 58, 237, 0.14)',
  };

  // Plan badges design
  const planBadgeStyles = {
    Free: { bg: 'rgba(107, 114, 128, 0.1)', color: isDark ? '#D1D5DB' : '#4B5563', text: 'Free' },
    Pro: { bg: 'linear-gradient(135deg, #7C3AED, #A855F7)', color: '#FFFFFF', text: 'Pro' },
    Team: { bg: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', color: '#FFFFFF', text: 'Team' },
    Enterprise: { bg: 'linear-gradient(135deg, #F59E0B, #B45309)', color: '#FFFFFF', text: 'Enterprise' },
  };

  // Onboarding tasks completion check
  const onboardingTasks = [
    { id: 't1', label: 'Configure your profile display name', done: displayName !== '' && displayName !== 'User' },
    { id: 't2', label: 'Choose a default AI model', done: defaultModel !== '' },
    { id: 't3', label: 'Save customized interface options', done: savedFeedback['preferences_card'] || false },
  ];
  const completedTasksCount = onboardingTasks.filter(t => t.done).length;
  const onboardingPercent = Math.round((completedTasksCount / onboardingTasks.length) * 100);
  const calculatedOnboardingComplete = completedTasksCount === onboardingTasks.length;

  // Sync auto onboarding completion
  useEffect(() => {
    if (calculatedOnboardingComplete && !onboardingComplete && !isLoading) {
      setOnboardingComplete(true);
      apiClient.patch('/api/v1/profile/onboarding', { onboarding_completed: true }).catch(() => { });
      triggerToast('Onboarding completed! Welcome to AURE');
    }
  }, [calculatedOnboardingComplete, onboardingComplete, isLoading]);

  return (
    <>
      <div id="settings-page" style={{
        maxWidth: 1100, margin: '0 auto', padding: '0 48px', paddingTop: 8,
        width: '100%', display: 'flex', flexDirection: 'column', paddingBottom: 64,
        background: colors.canvasBg, minHeight: '100vh', transition: 'background 250ms ease',
      }}>

        {/* Localized Layout & Animations Styles */}
        <style>{`
          .settings-grid {
            display: grid;
            grid-template-columns: 1fr 1.3fr;
            gap: 24px;
            margin-bottom: 24px;
            width: 100%;
          }
          @media (max-width: 900px) {
            .settings-grid {
              grid-template-columns: 1fr;
            }
          }
          .custom-select-option:hover {
            background-color: ${isDark ? 'rgba(167, 139, 250, 0.12)' : 'rgba(124, 58, 237, 0.06)'} !important;
            color: ${colors.textPrimary} !important;
          }
          .interactive-pill {
            transition: all 180ms ease;
          }
          .interactive-pill:hover {
            transform: translateY(-1px);
          }
          .btn-primary {
            background: linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
            color: #FFFFFF;
            box-shadow: 0 4px 14px rgba(124,58,237,0.30);
            transition: all 200ms ease;
          }
          .btn-primary:hover {
            transform: translateY(-1px);
            filter: brightness(1.06);
          }
          .btn-secondary {
            background: transparent;
            border: 1px solid rgba(124,58,237,0.18);
            color: ${colors.textSecondary};
            transition: all 200ms ease;
          }
          .btn-secondary:hover {
            background: ${isDark ? 'rgba(167,139,250,0.08)' : 'rgba(124,58,237,0.05)'};
            border-color: rgba(124,58,237,0.28);
            color: ${colors.textPrimary};
          }
          .avatar-preset-btn {
            border: 2px solid transparent;
            border-radius: 50%;
            cursor: pointer;
            padding: 2px;
            transition: all 150ms ease;
          }
          .avatar-preset-btn.active {
            border-color: #7C3AED;
            transform: scale(1.08);
          }
          .toast-fade {
            animation: toastIn 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          @keyframes toastIn {
            from { transform: translateY(20px) scale(0.9); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
          }
        `}</style>

        {/* ── Page Title Header (Eyebrow + Bold Title + Segmented Pills) ── */}
        <div style={{ padding: '28px 0 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <span style={{
                fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.9px', color: colors.textSecondary,
                display: 'block', marginBottom: 8, transition: 'color 250ms ease',
              }}>
                {activeTab === 'profile' ? 'USER ACCOUNT & BADGES' : 'SYSTEM & AI PREFERENCES'}
              </span>
              <h1 style={{
                fontSize: 22, fontWeight: 700, color: colors.textPrimary,
                letterSpacing: -0.3, margin: '0 0 6px', transition: 'color 250ms ease'
              }}>
                {activeTab === 'profile' ? 'User Profile' : 'Settings & Preferences'}
              </h1>
              <p style={{ fontSize: 14, color: colors.textSecondary, margin: 0, transition: 'color 250ms ease' }}>
                {activeTab === 'profile'
                  ? 'Manage your personal account profile, subscription plan, and activity stats'
                  : 'Customize your default workspace behaviors, theme, and AI model preferences'}
              </p>
            </div>

            {/* Segmented Control Pills */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(124, 58, 237, 0.06)', padding: 4,
              borderRadius: 14, border: '1px solid rgba(124, 58, 237, 0.10)',
              flexShrink: 0,
            }}>
              <button
                onClick={() => {
                  setActiveTab('profile');
                  router.push('/dashboard/profile');
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 16px', borderRadius: 10, fontSize: 13,
                  fontWeight: activeTab === 'profile' ? 700 : 500,
                  border: 'none', cursor: 'pointer', transition: 'all 200ms ease',
                  background: activeTab === 'profile' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'profile' ? '#6D28D9' : colors.textSecondary,
                  boxShadow: activeTab === 'profile' ? '0 2px 8px rgba(124, 58, 237, 0.12)' : 'none',
                }}
              >
                <User size={14} /> Profile
              </button>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  router.push('/dashboard/settings');
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 16px', borderRadius: 10, fontSize: 13,
                  fontWeight: activeTab === 'settings' ? 700 : 500,
                  border: 'none', cursor: 'pointer', transition: 'all 200ms ease',
                  background: activeTab === 'settings' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'settings' ? '#6D28D9' : colors.textSecondary,
                  boxShadow: activeTab === 'settings' ? '0 2px 8px rgba(124, 58, 237, 0.12)' : 'none',
                }}
              >
                <Settings size={14} /> Settings
              </button>
            </div>
          </div>
        </div>

        {/* ── Container Layout ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', marginBottom: 24 }}>

          {/* ═══════════════════════════════════════════════════
             1. Profile Overview Card (Left Column)
             ═══════════════════════════════════════════════════ */}
          {/* PROFILE CARD */}
          {activeTab === 'profile' && (
            <div style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 20,
              boxShadow: colors.cardShadow,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'background 250ms ease, border-color 250ms ease, box-shadow 250ms ease',
              width: '100%',
              maxWidth: 720,
              margin: '0 auto',
            }}>

              {/* ── Hero Banner ── */}
              <div style={{
                position: 'relative',
                height: 112,
                background: isDark
                  ? 'linear-gradient(135deg, #1a0a3e 0%, #2d1065 40%, #1a0a3e 70%, #160831 100%)'
                  : 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 30%, #9333ea 60%, #a855f7 100%)',
                overflow: 'hidden',
                flexShrink: 0,
              }}>
                {/* Mesh circles */}
                <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', top: -60, left: -40, background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', top: -20, right: 20, background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', bottom: -30, left: '40%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                {/* Sparkle dots */}
                {[[18, 22], [72, 14], [88, 52], [40, 60], [120, 8], [160, 40]].map(([lft, tp], i) => (
                  <div key={i} style={{ position: 'absolute', left: lft, top: tp, width: i % 2 === 0 ? 3 : 2, height: i % 2 === 0 ? 3 : 2, borderRadius: '50%', background: 'rgba(255,255,255,0.45)', pointerEvents: 'none' }} />
                ))}
                {/* "Pro" floating tag */}
                <div style={{
                  position: 'absolute', top: 14, right: 16,
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase',
                  color: '#fff', background: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.30)',
                  backdropFilter: 'blur(8px)',
                  padding: '3px 10px', borderRadius: 99,
                }}>
                  {plan} Plan
                </div>
              </div>

              {/* ── Avatar + Name Row ── */}
              <div style={{ padding: '0 22px', position: 'relative' }}>
                {/* Floating avatar — overlaps banner */}
                <div style={{ position: 'relative', display: 'inline-block', marginTop: -36 }}>
                  {/* Glow ring */}
                  <div style={{
                    position: 'absolute', inset: -4, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)',
                    zIndex: 0,
                  }} />
                  {/* White gap ring */}
                  <div style={{
                    position: 'absolute', inset: -2, borderRadius: '50%',
                    background: colors.cardBg,
                    zIndex: 1,
                  }} />
                  {/* Avatar */}
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="User Profile" onError={() => setAvatarUrl(null)}
                        style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
                    ) : avatarPreset === 0 ? (
                      <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(167,139,250,0.12))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, fontWeight: 700, color: '#7C3AED',
                      }}>{getInitials(displayName)}</div>
                    ) : renderPresetAvatar(avatarPreset, 72, 28)}
                  </div>
                  {/* Online dot */}
                  <div style={{ position: 'absolute', bottom: 3, right: 3, zIndex: 3, width: 12, height: 12, borderRadius: '50%', background: '#10B981', border: `2px solid ${colors.cardBg}`, boxShadow: '0 0 0 2px rgba(16,185,129,0.25)' }} />
                </div>

                {/* Name + badges */}
                <div style={{ marginTop: 10, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: colors.textPrimary, margin: 0, letterSpacing: '-0.3px' }}>
                      {displayName || 'Anonymous User'}
                    </h3>
                    <span style={{
                      fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px',
                      background: isDark ? 'rgba(167,139,250,0.18)' : 'rgba(124,58,237,0.10)',
                      color: '#7C3AED', border: isDark ? '1px solid rgba(167,139,250,0.25)' : '1px solid rgba(124,58,237,0.18)',
                      padding: '2.5px 9px', borderRadius: 6,
                    }}>{userRole}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12.5, color: colors.textSecondary }}>{email}</span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      fontSize: 10, fontWeight: 600, color: '#10B981',
                      background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)',
                      padding: '1.5px 7px', borderRadius: 5,
                    }}>
                      <Check size={8} strokeWidth={3} /> verified
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Stats Strip ── */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                borderTop: `1px solid ${colors.divider}`,
                borderBottom: `1px solid ${colors.divider}`,
              }}>
                {[
                  { label: 'Prompts', value: stats.prompts.toLocaleString(), icon: <Zap size={15} strokeWidth={2.2} style={{ color: '#7C3AED' }} /> },
                  { label: 'Avg. Score', value: stats.avgScore.toString(), icon: <Target size={15} strokeWidth={2.2} style={{ color: '#EC4899' }} /> },
                  { label: 'Day Streak', value: stats.dayStreak.toString(), icon: <Flame size={15} strokeWidth={2.2} style={{ color: '#F59E0B' }} /> },
                ].map((stat, i, arr) => (
                  <div key={stat.label} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '14px 8px', gap: 4,
                    borderRight: i < arr.length - 1 ? `1px solid ${colors.divider}` : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{stat.icon}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: colors.textPrimary, letterSpacing: '-0.4px' }}>{stat.value}</div>
                    <div style={{ fontSize: 10.5, color: colors.textSecondary, fontWeight: 500 }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* ── Activity Sparkline ── */}
              <div style={{ padding: '16px 22px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: colors.textPrimary, letterSpacing: '-0.1px' }}>Weekly Activity</span>
                  <span style={{ fontSize: 10.5, color: colors.textSecondary }}>This week</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 40 }}>
                  {[30, 55, 40, 70, 90, 65, 85].map((h, i) => {
                    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                    const isToday = i === 6;
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{
                          width: '100%', borderRadius: 4,
                          height: `${Math.round((h / 100) * 32)}px`,
                          background: isToday
                            ? 'linear-gradient(180deg, #a855f7, #7c3aed)'
                            : isDark ? 'rgba(167,139,250,0.2)' : 'rgba(124,58,237,0.12)',
                          transition: 'height 0.4s cubic-bezier(0.22,1,0.36,1)',
                          boxShadow: isToday ? '0 2px 8px rgba(124,58,237,0.35)' : 'none',
                        }} />
                        <span style={{ fontSize: 9, color: isToday ? '#7c3aed' : colors.textSecondary, fontWeight: isToday ? 700 : 400 }}>{days[i]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── Account Status + Onboarding ── */}
              <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: colors.textPrimary }}>Account Status</span>
                  <span style={{ fontSize: 11, color: colors.textSecondary }}>Since {createdAt}</span>
                </div>

                {!onboardingComplete ? (
                  <div style={{
                    background: isDark ? 'rgba(124,58,237,0.10)' : 'rgba(124,58,237,0.05)',
                    border: '1px dashed rgba(124,58,237,0.22)', borderRadius: 12, padding: '10px 14px',
                    display: 'flex', flexDirection: 'column', gap: 8,
                  }}>
                    <button onClick={() => setShowOnboardingDetail(!showOnboardingDetail)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', textAlign: 'left', fontSize: 12.5, fontWeight: 600, color: '#7C3AED' }}
                    >
                      <span>Complete onboarding ({onboardingPercent}%) →</span>
                      <ChevronDown size={13} style={{ transform: showOnboardingDetail ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }} />
                    </button>
                    <div style={{ height: 4, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.10)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${onboardingPercent}%`, background: 'linear-gradient(90deg,#7C3AED,#A855F7)', borderRadius: 99, transition: 'width 300ms ease' }} />
                    </div>
                    {showOnboardingDetail && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 2 }}>
                        {onboardingTasks.map(task => (
                          <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5 }}>
                            {task.done ? <CheckCircle2 size={12} style={{ color: '#10B981', flexShrink: 0 }} /> : <div style={{ width: 12, height: 12, borderRadius: '50%', border: `1.5px solid ${colors.textSecondary}`, flexShrink: 0 }} />}
                            <span style={{ color: task.done ? colors.textSecondary : colors.textPrimary, textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? 0.65 : 1 }}>{task.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: 10, padding: '10px 13px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 500, color: '#059669' }}>
                    <CheckCircle2 size={14} />
                    <span>Onboarding profile completed successfully</span>
                  </div>
                )}
              </div>

              {/* ── Subscription Plan (read-only) ── */}
              <div style={{ padding: '0 22px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subscription Plan</span>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {(['Free', 'Pro', 'Team', 'Enterprise'] as const).map(p => (
                    <div key={p}
                      style={{
                        padding: '5px 13px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        cursor: 'default', border: '1px solid',
                        background: plan === p ? '#7C3AED' : colors.surfaceBg,
                        borderColor: plan === p ? '#7C3AED' : colors.cardBorder,
                        color: plan === p ? '#FFFFFF' : colors.textSecondary,
                        boxShadow: plan === p ? '0 4px 12px rgba(124,58,237,0.30)' : 'none',
                        opacity: plan === p ? 1 : 0.45,
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      {plan === p && <Check size={10} strokeWidth={3} />}
                      {p}
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: colors.textSecondary, margin: '2px 0 0', fontStyle: 'italic' }}>
                  Contact support to change your plan.
                </p>
              </div>

              {/* ── Edit Profile CTA ── */}
              <div style={{ padding: '0 22px 22px', marginTop: 'auto' }}>
                <button id="edit-profile-btn" onClick={openEditModal}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '11px 18px', borderRadius: 12, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', width: '100%', border: 'none',
                    background: isDark
                      ? 'linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(168,85,247,0.18) 100%)'
                      : 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(168,85,247,0.05) 100%)',
                    color: '#7C3AED',
                    boxShadow: isDark
                      ? 'inset 0 1px 0 rgba(167,139,250,0.15), 0 2px 8px rgba(0,0,0,0.25)'
                      : 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(124,58,237,0.10)',
                    outline: `1.5px solid ${isDark ? 'rgba(167,139,250,0.20)' : 'rgba(124,58,237,0.15)'}`,
                    transition: 'all 220ms cubic-bezier(0.22,1,0.36,1)',
                  }}
                  className="btn-edit-profile"
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(124,58,237,0.25)'; (e.currentTarget as HTMLButtonElement).style.outlineColor = 'rgba(124,58,237,0.35)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = isDark ? 'inset 0 1px 0 rgba(167,139,250,0.15), 0 2px 8px rgba(0,0,0,0.25)' : 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(124,58,237,0.10)'; (e.currentTarget as HTMLButtonElement).style.outlineColor = isDark ? 'rgba(167,139,250,0.20)' : 'rgba(124,58,237,0.15)'; }}
                >
                  <Camera size={15} strokeWidth={2} />
                  Edit Profile
                </button>
              </div>
            </div>
          )}

          {/* PREFERENCES CARD */}
          {activeTab === 'settings' && (
            <div style={{
              background: colors.cardBg,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 20,
              padding: '28px 32px',
              boxShadow: colors.cardShadow,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              transition: 'background 250ms ease, border-color 250ms ease, box-shadow 250ms ease',
              width: '100%',
              maxWidth: 720,
              margin: '0 auto',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, margin: 0, transition: 'color 250ms ease' }}>
                  AI Preferences
                </h2>
                {savedFeedback['preferences_card'] && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 12, fontWeight: 600, color: '#10B981',
                    animation: 'fadeInRise 200ms ease'
                  }}>
                    <Check size={12} strokeWidth={3} /> Saved
                  </span>
                )}
              </div>

              {/* Theme Toggle (Segmented control) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>Theme Preference</span>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  background: colors.surfaceBg,
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: 9999, padding: 3, gap: 2,
                  width: 'fit-content',
                }}>
                  {(['light', 'dark', 'system'] as const).map(t => {
                    const active = theme === t;
                    return (
                      <button
                        key={t}
                        onClick={() => handleThemeChange(t)}
                        style={{
                          fontSize: 12.5, fontWeight: active ? 600 : 500,
                          color: active
                            ? (isDark ? '#EDE9FE' : 'var(--color-text-primary, #1A1033)')
                            : colors.textSecondary,
                          padding: '5px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                          background: active ? (isDark ? 'rgba(124,58,237,0.25)' : '#ffffff') : 'transparent',
                          boxShadow: active
                            ? (isDark ? '0 2px 6px rgba(0,0,0,0.3)' : '0 2px 6px rgba(109,40,217,0.10)')
                            : 'none',
                          transition: 'all 200ms ease',
                          textTransform: 'capitalize',
                        }}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Default Mode (Dropdown Selector) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} ref={modeDropdownRef}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>Default Mode</span>
                  {savedFeedback['default_mode'] && <span style={{ fontSize: 11, color: '#10B981' }}>Updated ✓</span>}
                </div>

                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      width: '100%', padding: '10px 14px', borderRadius: 10,
                      fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
                      background: colors.inputBg, border: `1px solid ${colors.inputBorder}`,
                      color: colors.textPrimary,
                      textAlign: 'left', outline: 'none', transition: 'all 200ms ease',
                    }}
                    className="hover:border-[rgba(124,58,237,0.3)] focus:border-[#7C3AED]"
                  >
                    <span>{defaultMode}</span>
                    <ChevronDown size={14} style={{
                      transform: isModeDropdownOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 200ms ease',
                      opacity: 0.7,
                    }} />
                  </button>

                  {isModeDropdownOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                      background: colors.cardBg, border: `1px solid ${colors.cardBorder}`,
                      borderRadius: 10, overflow: 'hidden', zIndex: 100,
                      boxShadow: colors.cardShadow,
                      animation: 'dropdownFadeIn 150ms ease',
                    }}>
                      {['General', 'Creative', 'Technical', 'Marketing', 'Coding'].map(modeOpt => (
                        <button
                          key={modeOpt}
                          onClick={() => handleModeChange(modeOpt)}
                          style={{
                            width: '100%', padding: '9px 12px', fontSize: 13,
                            fontWeight: defaultMode === modeOpt ? 600 : 500,
                            color: defaultMode === modeOpt ? '#7C3AED' : colors.textSecondary,
                            textAlign: 'left', border: 'none', cursor: 'pointer',
                            background: 'transparent', display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                          className="custom-select-option"
                        >
                          <span>{modeOpt}</span>
                          {defaultMode === modeOpt && <Check size={12} strokeWidth={2.5} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Default Model (Pill list layout) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>Default AI Model</span>
                  {savedFeedback['default_model'] && <span style={{ fontSize: 11, color: '#10B981' }}>Updated ✓</span>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['ChatGPT', 'Claude', 'Gemini', 'Grok', 'Midjourney', 'VEO', 'Perplexity'].map(modelOpt => {
                    const isSelected = defaultModel === modelOpt;
                    return (
                      <button
                        key={modelOpt}
                        onClick={() => handleModelChange(modelOpt)}
                        style={{
                          padding: '6px 14px', borderRadius: 9999, fontSize: 12.5, fontWeight: 500,
                          cursor: 'pointer', border: 'none', whiteSpace: 'nowrap',
                          transition: 'all 180ms ease', flexShrink: 0,
                          background: isSelected
                            ? 'linear-gradient(135deg, #7C3AED, #A855F7)'
                            : colors.surfaceBg,
                          color: isSelected ? '#FFFFFF' : colors.textSecondary,
                          boxShadow: isSelected ? '0 3px 10px rgba(124,58,237,0.25)' : 'none',
                        }}
                        className="interactive-pill"
                      >
                        {modelOpt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ height: 1, background: colors.divider }} />

              {/* Show Diff Switch */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: colors.textPrimary }}>Show Diff by Default</span>
                  <span style={{ fontSize: 12, color: colors.textSecondary }}>
                    Automatically show diff view after prompt optimization
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {savedFeedback['show_diff'] && <span style={{ fontSize: 11, color: '#10B981' }}>Saved</span>}
                  <ToggleSwitch
                    enabled={showDiffByDefault}
                    onToggle={() => handleToggleDiff(!showDiffByDefault)}
                    ariaLabel="Toggle show diff by default"
                  />
                </div>
              </div>

              {/* Auto-Detect Intent Switch */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: colors.textPrimary }}>Auto-Detect Intent</span>
                  <span style={{ fontSize: 12, color: colors.textSecondary }}>
                    Automatically detect prompt intent on user input
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {savedFeedback['auto_detect'] && <span style={{ fontSize: 11, color: '#10B981' }}>Saved</span>}
                  <ToggleSwitch
                    enabled={autoDetectIntent}
                    onToggle={() => handleToggleIntent(!autoDetectIntent)}
                    ariaLabel="Toggle auto detect intent"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  id="save-preferences-btn"
                  onClick={handleSavePreferences}
                  className="btn-primary"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  <Save size={14} />
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
         Modal Dialog: Edit Profile Modal
         ═══════════════════════════════════════════════════ */}
      {isEditModalOpen && (
        <>
          {/* Overlay background */}
          <div
            onClick={() => setIsEditModalOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15,5,40,0.50)',
              backdropFilter: 'blur(3px)', zIndex: 1000,
              animation: 'fadeIn 200ms ease-out',
            }}
          />
          {/* Centered Modal */}
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '90%', maxWidth: 440, zIndex: 1001,
            background: colors.cardBg, border: `1px solid ${colors.cardBorder}`,
            borderRadius: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.30)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            animation: 'dropdownFadeIn 220ms ease-out',
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 24px', borderBottom: `1px solid ${colors.divider}`,
            }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary }}>Edit Profile</span>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                  color: colors.textSecondary
                }}
                className="hover:opacity-70"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Preset avatar row selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Choose Avatar Preset</span>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', padding: '4px 0' }}>
                  <button
                    onClick={() => { setTempPreset(0); setTempAvatarUrl(''); }}
                    className={`avatar-preset-btn ${tempPreset === 0 && tempAvatarUrl === '' ? 'active' : ''}`}
                    style={{ background: 'none' }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: 'rgba(124, 58, 237, 0.08)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#7C3AED',
                      border: '1px solid rgba(124, 58, 237, 0.15)',
                    }}>
                      Initials
                    </div>
                  </button>

                  {presetAvatarGradients.map((_, i) => {
                    const presetIdx = i + 1;
                    const isActive = tempPreset === presetIdx && tempAvatarUrl === '';
                    return (
                      <button
                        key={presetIdx}
                        onClick={() => { setTempPreset(presetIdx); setTempAvatarUrl(''); }}
                        className={`avatar-preset-btn ${isActive ? 'active' : ''}`}
                        style={{ background: 'none' }}
                      >
                        {renderPresetAvatar(presetIdx, 44, 18)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Image Upload Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Or Upload Custom Avatar</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <label
                    style={{
                      padding: '8px 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                      background: 'rgba(124, 58, 237, 0.08)', color: '#7C3AED',
                      border: '1px dashed rgba(124, 58, 237, 0.35)',
                      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                      transition: 'all 180ms ease'
                    }}
                    className="hover:!bg-[rgba(124,58,237,0.14)] hover:!border-[rgba(124,58,237,0.50)]"
                  >
                    <Camera size={14} />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>

                  {tempAvatarUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={tempAvatarUrl}
                        alt="Uploaded preview"
                        style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: `1px solid ${colors.cardBorder}` }}
                      />
                      <button
                        onClick={() => setTempAvatarUrl('')}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                          color: '#EF4444', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2
                        }}
                        className="hover:opacity-80"
                      >
                        <X size={12} /> Remove
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: colors.textSecondary }}>No file selected</span>
                  )}
                </div>
              </div>

              {/* Display Name Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Display Name</span>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Add your name"
                  style={{
                    width: '100%', padding: '9px 12px', fontSize: 13,
                    border: `1px solid ${colors.inputBorder}`, borderRadius: 8,
                    background: colors.inputBg, color: colors.textPrimary,
                    boxSizing: 'border-box', outline: 'none',
                  }}
                />
              </div>

              {/* Default Role Selection Dropdown/Pills */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: colors.textSecondary }}>Default Role</span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                  {['Student', 'Creator', 'Entrepreneur', 'Researcher', 'Developer', 'Marketer', 'Designer', 'Writer', 'Educator'].map(roleOpt => {
                    const isSelected = tempRole === roleOpt;
                    return (
                      <button
                        key={roleOpt}
                        onClick={() => setTempRole(roleOpt)}
                        style={{
                          padding: '5px 10px', borderRadius: 8, fontSize: 11.5, fontWeight: 600,
                          cursor: 'pointer', border: '1px solid',
                          transition: 'all 150ms ease',
                          background: isSelected
                            ? 'linear-gradient(135deg, #7C3AED, #A855F7)'
                            : colors.surfaceBg,
                          borderColor: isSelected ? '#7C3AED' : colors.cardBorder,
                          color: isSelected ? '#FFFFFF' : colors.textSecondary,
                        }}
                      >
                        {roleOpt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 10,
              padding: '16px 24px', borderTop: `1px solid ${colors.divider}`,
              background: colors.surfaceBg,
            }}>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="btn-secondary"
                style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={saveProfileData}
                disabled={!tempName.trim()}
                className="btn-primary"
                style={{
                  padding: '8px 18px', borderRadius: 8, fontSize: 12.5, fontWeight: 600,
                  cursor: tempName.trim() ? 'pointer' : 'not-allowed', border: 'none',
                  opacity: tempName.trim() ? 1 : 0.6
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </>
      )}



      {/* ═══════════════════════════════════════════════════
         Toast Notification System
         ═══════════════════════════════════════════════════ */}
      {toast.visible && (
        <div
          className="toast-fade"
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 18px', borderRadius: 12,
            background: isDark ? 'rgba(30, 20, 50, 0.92)' : 'rgba(255, 255, 255, 0.95)',
            border: `1px solid ${toast.type === 'warning' ? '#EF4444' : '#10B981'}`,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(124, 58, 237, 0.08)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {toast.type === 'warning' ? (
            <AlertCircle size={16} style={{ color: '#EF4444', flexShrink: 0 }} />
          ) : (
            <CheckCircle2 size={16} style={{ color: '#10B981', flexShrink: 0 }} />
          )}
          <span style={{
            fontSize: 13, fontWeight: 600,
            color: isDark ? '#EDE9FE' : '#1A1033'
          }}>
            {toast.message}
          </span>
          <button
            onClick={() => setToast(prev => ({ ...prev, visible: false }))}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 2, display: 'flex', marginLeft: 4,
              color: isDark ? 'rgba(221, 214, 254, 0.4)' : 'rgba(107, 107, 138, 0.4)'
            }}
            className="hover:opacity-80"
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </>
  );
}

export function SettingsComponent({ initialTab = 'settings' }: SettingsPageProps) {
  return (
    <Suspense fallback={
      <div style={{ padding: 48, color: '#7C3AED', fontSize: 14, fontWeight: 600 }}>
        Loading Settings...
      </div>
    }>
      <SettingsContent initialTab={initialTab} />
    </Suspense>
  );
}

export default function SettingsPage() {
  return <SettingsComponent initialTab="settings" />;
}
