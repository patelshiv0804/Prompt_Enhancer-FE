'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  User, Check, Settings, AlertTriangle, Trash2, Camera,
  Save, Sparkles, Code, Palette, Fingerprint, Zap,
  ChevronDown, CheckCircle2, X, ShieldAlert, AlertCircle, RefreshCw,
  Target, Flame, GraduationCap, Megaphone, Briefcase, Search, Code2,
  School, Rocket, PenTool, BarChart3, Video, BookOpen, Layers, Award,
  Users, Mail, TrendingUp, Lightbulb, DollarSign, Scale, ShoppingCart,
  Cpu, Server, Database, ShieldCheck, Smartphone, Monitor, FileText,
  Pencil
} from 'lucide-react';
import { apiClient } from '@/utils/apiClient';
import { ROLES, ROLE_MODES, getModeIcon } from '@/constants/roles';
import { presetAvatarGradients, presetIcons, getInitials, renderPresetAvatar } from '@/constants/avatars';

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
  const [modeSearchQuery, setModeSearchQuery] = useState<string>('');

  // Active / Dark calculations
  const [isDark, setIsDark] = useState<boolean>(false);

  // Inline editing states
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [editingNameValue, setEditingNameValue] = useState<string>('');
  const [showAvatarPicker, setShowAvatarPicker] = useState<boolean>(false);
  const [showOnboardingDetail, setShowOnboardingDetail] = useState<boolean>(false);

  const handleDirectAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        setAvatarPreset(0);
      };
      reader.readAsDataURL(file);

      try {
        const formData = new FormData();
        formData.append('avatar', file);
        const updated = await apiClient.patch('/api/v1/profile/me', formData);
        if (updated?.avatar_url) {
          setAvatarUrl(updated.avatar_url);
        }
        triggerSavedFeedback('profile_card');
        triggerToast('Avatar photo updated!');
      } catch {
        triggerSavedFeedback('profile_card');
        triggerToast('Avatar preview updated!');
      }
    }
  };

  const handleSelectPresetAvatar = async (presetIdx: number) => {
    setAvatarPreset(presetIdx);
    setAvatarUrl(null);
    setShowAvatarPicker(false);
    triggerSavedFeedback('profile_card');
    triggerToast('Avatar preset updated!');
  };

  const handleSaveDisplayName = async () => {
    const trimmed = editingNameValue.trim();
    if (!trimmed) return;
    setDisplayName(trimmed);
    setIsEditingName(false);
    triggerSavedFeedback('profile_card');
    try {
      const formData = new FormData();
      formData.append('display_name', trimmed);
      const updated = await apiClient.patch('/api/v1/profile/me', formData);
      if (updated?.display_name) {
        setDisplayName(updated.display_name);
      }
      triggerToast('Display name updated!');
    } catch {
      triggerToast('Display name updated!');
    }
  };

  // Toast System
  const [toast, setToast] = useState<{ message: string; visible: boolean; type?: 'success' | 'warning' }>({
    message: '', visible: false, type: 'success'
  });

  // Inline feedback saves
  const [savedFeedback, setSavedFeedback] = useState<Record<string, boolean>>({});

  /* ═══════════════════════════════════════════════════
     Effects & Event Listeners
     ═══════════════════════════════════════════════════ */



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

      const formData = new FormData();
      formData.append('role', userRole.toLowerCase());
      await apiClient.patch('/api/v1/profile/me', formData);
    } catch (err) {
      console.error('Save preferences notice:', err);
    }

    const d = new Date();
    const formatted = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    setUpdatedAt(formatted);

    triggerSavedFeedback('preferences_card');
    triggerToast('AI preferences saved successfully!');
  };

  const handleRoleChange = async (newRole: string) => {
    setUserRole(newRole);
    triggerSavedFeedback('user_role');
    try {
      const formData = new FormData();
      formData.append('role', newRole.toLowerCase());
      await apiClient.patch('/api/v1/profile/me', formData);
    } catch (err) {
      console.error('Failed to update role in backend:', err);
    }
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
                  {/* Avatar Image with overlay camera icon on hover */}
                  <div
                    style={{ position: 'relative', zIndex: 2, cursor: 'pointer' }}
                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                    title="Click to edit avatar"
                  >
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

                    {/* Camera overlay indicator badge */}
                    <div
                      style={{
                        position: 'absolute', bottom: -2, right: -2, zIndex: 4,
                        width: 24, height: 24, borderRadius: '50%',
                        background: '#7C3AED', color: '#FFFFFF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `2px solid ${colors.cardBg}`,
                        boxShadow: '0 2px 6px rgba(124,58,237,0.4)',
                      }}
                      title="Edit avatar"
                    >
                      <Camera size={12} strokeWidth={2.2} />
                    </div>
                  </div>
                  {/* Online dot */}
                  <div style={{ position: 'absolute', bottom: 3, left: 3, zIndex: 3, width: 10, height: 10, borderRadius: '50%', background: '#10B981', border: `2px solid ${colors.cardBg}` }} />

                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleDirectAvatarUpload}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Inline Avatar Selection Tray */}
                {showAvatarPicker && (
                  <div style={{
                    marginTop: 8, padding: '10px 14px', borderRadius: 14,
                    background: isDark ? 'rgba(30, 21, 53, 0.9)' : 'rgba(124, 58, 237, 0.05)',
                    border: `1px solid ${colors.cardBorder}`,
                    display: 'flex', flexDirection: 'column', gap: 8,
                    boxShadow: colors.cardShadow,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: colors.textPrimary }}>Choose Avatar</span>
                      <button onClick={() => setShowAvatarPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textSecondary, padding: 0 }}>
                        <X size={13} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        style={{
                          padding: '5px 10px', borderRadius: 8, fontSize: 11.5, fontWeight: 600,
                          background: '#7C3AED', color: '#FFFFFF', border: 'none',
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                        }}
                      >
                        <Camera size={12} /> Upload Photo
                      </button>
                      <button
                        onClick={() => handleSelectPresetAvatar(0)}
                        style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#7C3AED',
                          border: avatarPreset === 0 && !avatarUrl ? '2px solid #7C3AED' : '1px solid rgba(124,58,237,0.2)',
                          cursor: 'pointer'
                        }}
                        title="Initials avatar"
                      >
                        AP
                      </button>
                      {presetAvatarGradients.map((_: string, i: number) => {
                        const presetIdx = i + 1;
                        const isActive = avatarPreset === presetIdx && !avatarUrl;
                        return (
                          <button
                            key={presetIdx}
                            onClick={() => handleSelectPresetAvatar(presetIdx)}
                            style={{
                              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                              outline: isActive ? '2px solid #7C3AED' : 'none', borderRadius: '50%', outlineOffset: 2
                            }}
                          >
                            {renderPresetAvatar(presetIdx, 32, 14)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Name + inline editing */}
                <div style={{ marginTop: 10, marginBottom: 16 }}>
                  {isEditingName ? (
                    <form
                      onSubmit={(e) => { e.preventDefault(); handleSaveDisplayName(); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}
                    >
                      <input
                        type="text"
                        value={editingNameValue}
                        onChange={e => setEditingNameValue(e.target.value)}
                        autoFocus
                        style={{
                          padding: '5px 10px', fontSize: 14, fontWeight: 700,
                          borderRadius: 8, border: '1.5px solid #7C3AED',
                          background: colors.inputBg, color: colors.textPrimary,
                          outline: 'none', width: 200,
                        }}
                      />
                      <button
                        type="submit"
                        disabled={!editingNameValue.trim()}
                        style={{
                          background: '#7C3AED', color: '#FFF', border: 'none',
                          borderRadius: 6, padding: '6px 9px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        title="Save name"
                      >
                        <Check size={13} strokeWidth={3} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingName(false)}
                        style={{
                          background: colors.surfaceBg, color: colors.textSecondary, border: `1px solid ${colors.cardBorder}`,
                          borderRadius: 6, padding: '6px 9px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        title="Cancel"
                      >
                        <X size={13} />
                      </button>
                    </form>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: colors.textPrimary, margin: 0, letterSpacing: '-0.3px' }}>
                        {displayName || 'Anonymous User'}
                      </h3>
                      <button
                        onClick={() => { setEditingNameValue(displayName); setIsEditingName(true); }}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                          color: colors.textSecondary, display: 'inline-flex', alignItems: 'center',
                        }}
                        className="hover:!text-[#7C3AED]"
                        title="Click to edit name"
                      >
                        <Pencil size={13} />
                      </button>
                      <span style={{
                        fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px',
                        background: isDark ? 'rgba(167,139,250,0.18)' : 'rgba(124,58,237,0.10)',
                        color: '#7C3AED', border: isDark ? '1px solid rgba(167,139,250,0.25)' : '1px solid rgba(124,58,237,0.18)',
                        padding: '2.5px 9px', borderRadius: 6,
                      }}>{userRole}</span>
                    </div>
                  )}

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

              {/* ── Interactive Role Selection ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary, letterSpacing: '-0.1px' }}>
                      Default Role
                    </span>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, color: '#7C3AED',
                      background: isDark ? 'rgba(167,139,250,0.15)' : 'rgba(124,58,237,0.08)',
                      padding: '2px 8px', borderRadius: 99,
                      border: '1px solid rgba(124,58,237,0.15)'
                    }}>
                      12 Roles
                    </span>
                  </div>
                  {savedFeedback['user_role'] && (
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Check size={12} strokeWidth={2.5} /> Updated
                    </span>
                  )}
                </div>

                {/* Role Card Grid with Hover Elevation & Micro-Animations */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
                  gap: 8,
                }}>
                  {ROLES.map(role => {
                    const RoleIcon = role.icon;
                    const isSelected = userRole.toLowerCase() === role.id.toLowerCase() || userRole.toLowerCase() === role.label.toLowerCase();
                    const modeCount = (ROLE_MODES[role.id] || []).length;

                    return (
                      <button
                        key={role.id}
                        onClick={() => {
                          handleRoleChange(role.label);
                          setModeSearchQuery('');
                          const roleModes = ROLE_MODES[role.id] || ROLE_MODES['general'];
                          if (!roleModes.map(m => m.toLowerCase()).includes(defaultMode.toLowerCase())) {
                            handleModeChange(roleModes[0]);
                          }
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 12px', borderRadius: 12, fontSize: 12.5, fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer', outline: 'none',
                          border: isSelected
                            ? '1px solid transparent'
                            : `1px solid ${colors.cardBorder}`,
                          transition: 'all 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                          background: isSelected
                            ? 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)'
                            : colors.surfaceBg,
                          color: isSelected ? '#FFFFFF' : colors.textPrimary,
                          boxShadow: isSelected
                            ? '0 4px 14px rgba(124, 58, 237, 0.32), inset 0 1px 0 rgba(255,255,255,0.2)'
                            : 'none',
                          position: 'relative',
                        }}
                        className="interactive-pill hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <div style={{
                          width: 26, height: 26, borderRadius: 8,
                          background: isSelected ? 'rgba(255,255,255,0.20)' : (isDark ? 'rgba(167,139,250,0.12)' : 'rgba(124,58,237,0.08)'),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                          color: isSelected ? '#FFFFFF' : '#7C3AED',
                        }}>
                          <RoleIcon size={14} strokeWidth={2} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden', width: '100%' }}>
                          <span style={{
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%',
                            textAlign: 'left', fontSize: 12, lineHeight: 1.2
                          }}>
                            {role.label}
                          </span>
                          <span style={{
                            fontSize: 9.5, opacity: isSelected ? 0.85 : 0.6,
                            color: isSelected ? '#FFFFFF' : colors.textSecondary,
                            fontWeight: 400
                          }}>
                            {modeCount} modes
                          </span>
                        </div>
                        {isSelected && (
                          <div style={{
                            width: 14, height: 14, borderRadius: '50%', background: '#FFFFFF',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#7C3AED', flexShrink: 0,
                          }}>
                            <Check size={9} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Dynamic Mode Selection Panel ── */}
              <div style={{
                display: 'flex', flexDirection: 'column', gap: 12,
                background: isDark ? 'rgba(30, 21, 53, 0.45)' : 'rgba(124, 58, 237, 0.03)',
                border: `1px solid ${isDark ? 'rgba(167, 139, 250, 0.15)' : 'rgba(124, 58, 237, 0.10)'}`,
                borderRadius: 16, padding: '16px 20px',
                transition: 'all 250ms ease',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary }}>
                      Default Mode
                    </span>
                    {(() => {
                      const activeRoleObj = ROLES.find(r => r.label.toLowerCase() === userRole.toLowerCase() || r.id.toLowerCase() === userRole.toLowerCase()) || ROLES[0];
                      const ActiveRoleIcon = activeRoleObj.icon;
                      return (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 11, fontWeight: 700, color: '#7C3AED',
                          background: isDark ? 'rgba(167,139,250,0.18)' : 'rgba(124,58,237,0.10)',
                          padding: '3px 10px', borderRadius: 99,
                          border: '1px solid rgba(124,58,237,0.18)'
                        }}>
                          <ActiveRoleIcon size={12} />
                          <span>{activeRoleObj.label}</span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Search / Filter input for modes */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: 220 }}>
                    <div style={{
                      position: 'relative', width: '100%', display: 'flex', alignItems: 'center'
                    }}>
                      <Search size={12} style={{ position: 'absolute', left: 10, color: colors.textSecondary, pointerEvents: 'none' }} />
                      <input
                        type="text"
                        value={modeSearchQuery}
                        onChange={e => setModeSearchQuery(e.target.value)}
                        placeholder="Search modes..."
                        style={{
                          width: '100%', padding: '5px 10px 5px 28px', fontSize: 11.5,
                          borderRadius: 8, border: `1px solid ${colors.inputBorder}`,
                          background: colors.inputBg, color: colors.textPrimary,
                          outline: 'none', transition: 'all 150ms ease',
                        }}
                      />
                      {modeSearchQuery && (
                        <button
                          onClick={() => setModeSearchQuery('')}
                          style={{ position: 'absolute', right: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: colors.textSecondary }}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    {savedFeedback['default_mode'] && (
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: '#10B981', flexShrink: 0 }}>✓</span>
                    )}
                  </div>
                </div>

                {/* Animated Modes Grid Container */}
                <div style={{
                  display: 'flex', gap: 6, flexWrap: 'wrap',
                  maxHeight: 180, overflowY: 'auto', paddingRight: 4,
                  scrollbarWidth: 'thin',
                }}>
                  {(() => {
                    const currentRoleId = ROLES.find(
                      r => r.label.toLowerCase() === userRole.toLowerCase() || r.id.toLowerCase() === userRole.toLowerCase()
                    )?.id || 'general';
                    const availableModes = ROLE_MODES[currentRoleId] || ROLE_MODES['general'];
                    const filteredModes = availableModes.filter(m => m.toLowerCase().includes(modeSearchQuery.toLowerCase().trim()));

                    if (filteredModes.length === 0) {
                      return (
                        <div style={{ padding: '12px 0', fontSize: 12, color: colors.textSecondary, fontStyle: 'italic', width: '100%', textAlign: 'center' }}>
                          No modes matching &quot;{modeSearchQuery}&quot;
                        </div>
                      );
                    }

                    return filteredModes.map(modeOpt => {
                      const ModeIcon = getModeIcon(modeOpt);
                      const isSelected = defaultMode.toLowerCase() === modeOpt.toLowerCase();
                      return (
                        <button
                          key={modeOpt}
                          onClick={() => handleModeChange(modeOpt)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer', border: 'none', whiteSpace: 'nowrap',
                            transition: 'all 180ms cubic-bezier(0.2, 0.8, 0.2, 1)', flexShrink: 0,
                            background: isSelected
                              ? 'linear-gradient(135deg, #7C3AED, #A855F7)'
                              : (isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF'),
                            color: isSelected ? '#FFFFFF' : colors.textPrimary,
                            boxShadow: isSelected
                              ? '0 3px 10px rgba(124,58,237,0.30)'
                              : '0 1px 3px rgba(0,0,0,0.04)',
                            outline: isSelected
                              ? 'none'
                              : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.12)'}`,
                          }}
                          className="interactive-pill hover:scale-[1.03] active:scale-[0.97]"
                        >
                          <ModeIcon size={13} style={{ color: isSelected ? '#FFFFFF' : '#7C3AED', flexShrink: 0 }} />
                          <span>{modeOpt}</span>
                          {isSelected && <Check size={11} strokeWidth={3} style={{ marginLeft: 2 }} />}
                        </button>
                      );
                    });
                  })()}
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
            </div>
          )}
        </div>
      </div>



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
