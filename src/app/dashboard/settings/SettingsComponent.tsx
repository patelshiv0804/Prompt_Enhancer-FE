'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  User, Check, Settings, Camera,
  Sparkles, Zap, X, RefreshCw,
  Target, Flame, Search,
  Award, Layers, CheckCircle2, ShieldCheck,
  Sun, Moon, Laptop, ArrowRight,
  Pencil, Cpu, FileText, CheckCircle, ExternalLink,
  Sliders, Shield, Activity, HelpCircle, LogOut,
  Crown, Brain, Calendar, Compass, Medal, Layout, GitCommit,
  Share2, Globe, Command, Filter, Grid, Lock
} from 'lucide-react';
import { apiClient } from '@/utils/apiClient';
import { useAuth } from '@/context/AuthContext';
import { ROLES, ROLE_MODES, getModeIcon } from '@/constants/roles';
import { presetAvatarGradients, getInitials, renderPresetAvatar } from '@/constants/avatars';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import SettingsSkeleton from './SettingsSkeleton';
import { ActivityHeatmap } from './ActivityHeatmap';
import { useTheme, D, hasUserSelectedThemeThisSession } from '@/theme/theme';

/* ── Custom iOS / macOS Switch Component ── */
interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
  ariaLabel?: string;
}

function ToggleSwitch({ enabled, onToggle, ariaLabel }: ToggleSwitchProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      aria-label={ariaLabel || 'Toggle switch'}
      style={{
        width: 44,
        height: 24,
        borderRadius: 9999,
        border: 'none',
        cursor: 'pointer',
        background: enabled ? 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)' : (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(124, 58, 237, 0.14)'),
        position: 'relative',
        transition: 'all 240ms cubic-bezier(0.16, 1, 0.3, 1)',
        flexShrink: 0,
        boxShadow: enabled ? '0 2px 10px rgba(124, 58, 237, 0.32)' : 'none',
        padding: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: enabled ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: '0 2px 5px rgba(0,0,0,0.18)',
          transition: 'left 240ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </button>
  );
}

export interface BadgeItem {
  id: string;
  title: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | string;
  category: string;
  description: string;
  unlock_criterion: string;
  icon: string;
  color: string;
  unlocked: boolean;
  progress: string;
  percentage: number;
}

const getBadgeIcon = (iconName: string) => {
  switch (iconName) {
    case 'Sparkles':
    case 'Sparkle':
      return Sparkles;
    case 'Award': return Award;
    case 'Flame': return Flame;
    case 'Cpu': return Cpu;
    case 'Crown': return Crown;
    case 'Target': return Target;
    case 'Brain': return Brain;
    case 'CheckCircle': return CheckCircle;
    case 'Zap': return Zap;
    case 'Calendar': return Calendar;
    case 'Compass': return Compass;
    case 'Shield': return Shield;
    case 'Activity': return Activity;
    case 'Medal': return Medal;
    case 'Layout': return Layout;
    case 'FileText': return FileText;
    case 'GitCommit': return GitCommit;
    case 'Share2': return Share2;
    case 'Layers': return Layers;
    case 'Globe': return Globe;
    case 'Command': return Command;
    case 'Sliders': return Sliders;
    case 'Filter': return Filter;
    case 'Grid': return Grid;
    default: return Award;
  }
};

const getTierStyle = (tier: string, isDark: boolean) => {
  switch ((tier || '').toLowerCase()) {
    case 'diamond':
      return {
        bg: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(14, 165, 233, 0.08)',
        border: 'rgba(56, 189, 248, 0.4)',
        color: '#38BDF8',
        glow: 'rgba(56, 189, 248, 0.25)',
        label: 'DIAMOND',
      };
    case 'gold':
      return {
        bg: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(217, 119, 6, 0.08)',
        border: 'rgba(245, 158, 11, 0.4)',
        color: '#F59E0B',
        glow: 'rgba(245, 158, 11, 0.25)',
        label: 'GOLD',
      };
    case 'silver':
      return {
        bg: isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(100, 116, 139, 0.08)',
        border: 'rgba(148, 163, 184, 0.35)',
        color: '#94A3B8',
        glow: 'rgba(148, 163, 184, 0.2)',
        label: 'SILVER',
      };
    case 'bronze':
    default:
      return {
        bg: isDark ? 'rgba(205, 127, 50, 0.12)' : 'rgba(180, 83, 9, 0.08)',
        border: 'rgba(205, 127, 50, 0.35)',
        color: '#CD7F32',
        glow: 'rgba(205, 127, 50, 0.2)',
        label: 'BRONZE',
      };
  }
};

export interface SettingsPageProps {
  initialTab?: 'profile' | 'settings';
}

export function SettingsComponent({ initialTab = 'settings' }: SettingsPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryTab = searchParams?.get('tab') || searchParams?.get('view');
  const isTablet = useMediaQuery('(max-width: 1080px) and (min-width: 641px)');
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isSmall = useMediaQuery('(max-width: 420px)');
  const pagePadX = isSmall ? 16 : isMobile ? 20 : isTablet ? 32 : 48;

  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>(() => {
    if (queryTab === 'profile') return 'profile';
    if (queryTab === 'settings') return 'settings';
    return initialTab;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { theme: appTheme, setTheme: setAppTheme, preference: appPreference } = useTheme();
  const isDark = appTheme === 'dark';

  useEffect(() => {
    if (queryTab === 'profile' && activeTab !== 'profile') {
      setIsLoading(true);
      setActiveTab('profile');
    } else if (queryTab === 'settings' && activeTab !== 'settings') {
      setIsLoading(true);
      setActiveTab('settings');
    }
  }, [queryTab, activeTab]);

  const { user, refreshUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState<string>(() => user?.display_name || '');
  const [email, setEmail] = useState<string>(() => user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => user?.avatar_url || null);
  const [avatarPreset, setAvatarPreset] = useState<number>(4);
  const [userRole, setUserRole] = useState<string>('Creator');
  const [plan, setPlan] = useState<string>(() => user?.plan || 'Free');
  const [createdAt, setCreatedAt] = useState<string>('');
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [stats, setStats] = useState<{
    prompts: number;
    avgScore: number;
    dayStreak: number;
    longestStreak: number;
    totalActiveDays: number;
    activityCalendar: Record<string, number>;
    userMaxScore: number;
    frequency7d: number[];
    unlockedBadgeCount: number;
    totalBadgeCount: number;
    badges: BadgeItem[];
  }>({
    prompts: 0,
    avgScore: 0,
    dayStreak: 0,
    longestStreak: 0,
    totalActiveDays: 0,
    activityCalendar: {},
    userMaxScore: 0,
    frequency7d: [0, 0, 0, 0, 0, 0, 0],
    unlockedBadgeCount: 0,
    totalBadgeCount: 29,
    badges: [],
  });

  // Dynamic streak calculation from activity calendar ensuring real-time accuracy across client timezones
  const effectiveDayStreak = useMemo(() => {
    const cal = stats.activityCalendar || {};
    const pad = (n: number) => String(n).padStart(2, '0');
    const getCount = (d: Date) => {
      const localKey = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      return cal[localKey] || 0;
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = getCount(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayCount = getCount(yesterday);

    let streak = 0;
    let checkD = new Date(today);
    if (todayCount === 0 && yesterdayCount > 0) {
      checkD = yesterday;
    } else if (todayCount === 0 && yesterdayCount === 0) {
      return stats.dayStreak > 0 ? stats.dayStreak : 0;
    }

    while (true) {
      if (getCount(checkD) > 0) {
        streak++;
        checkD.setDate(checkD.getDate() - 1);
      } else {
        break;
      }
    }
    return Math.max(streak, stats.dayStreak || 0);
  }, [stats.activityCalendar, stats.dayStreak]);

  const [badgeCategory, setBadgeCategory] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);
  const [showBadgesModal, setShowBadgesModal] = useState<boolean>(false);
  const [hoveredBadgeId, setHoveredBadgeId] = useState<string | null>(null);

  // Preference Settings — the theme control mirrors the global preference
  // (light / dark / system) so "System" shows selected and survives reloads.
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => appPreference);
  // Keep the local control in sync when the theme is changed elsewhere (e.g. the
  // navbar toggle), so the selected pill always reflects the real preference.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(appPreference);
  }, [appPreference]);
  const [defaultMode, setDefaultMode] = useState<string>('Creative');
  const [defaultModel, setDefaultModel] = useState<string>('Claude');
  const [showDiffByDefault, setShowDiffByDefault] = useState<boolean>(true);
  const [autoDetectIntent, setAutoDetectIntent] = useState<boolean>(true);
  const [modeSearchQuery, setModeSearchQuery] = useState<string>('');

  // Inline editing states
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [editingNameValue, setEditingNameValue] = useState<string>('');
  const [showAvatarPicker, setShowAvatarPicker] = useState<boolean>(false);

  // Toast System
  const [toast, setToast] = useState<{ message: string; visible: boolean; type?: 'success' | 'warning' }>({
    message: '',
    visible: false,
    type: 'success',
  });
  const [savedFeedback, setSavedFeedback] = useState<Record<string, boolean>>({});

  const triggerToast = (message: string, type: 'success' | 'warning' = 'success') => {
    setToast({ message, visible: true, type });
  };

  const triggerSavedFeedback = (key: string) => {
    setSavedFeedback((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setSavedFeedback((prev) => ({ ...prev, [key]: false }));
    }, 1800);
  };

  // Toast autohide
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await apiClient.get('/api/v1/profile/stats');
      if (statsData) {
        setStats({
          prompts: statsData.total_prompts ?? 0,
          avgScore: typeof statsData.average_score === 'number' ? Math.round(statsData.average_score) : 0,
          dayStreak: statsData.streak_days ?? 0,
          longestStreak: statsData.longest_streak ?? statsData.streak_days ?? 0,
          totalActiveDays: statsData.total_active_days ?? 0,
          activityCalendar: (typeof statsData.activity_calendar === 'object' && statsData.activity_calendar)
            ? statsData.activity_calendar
            : {},
          userMaxScore: statsData.user_max_score ?? 0,
          frequency7d: Array.isArray(statsData.frequency_7d) && statsData.frequency_7d.length === 7
            ? statsData.frequency_7d
            : [0, 0, 0, 0, 0, 0, 0],
          unlockedBadgeCount: statsData.unlocked_badge_count ?? 0,
          totalBadgeCount: statsData.total_badge_count ?? 29,
          badges: Array.isArray(statsData.badges) ? statsData.badges : [],
        });
      }
    } catch (e) {
      console.warn('Could not load stats:', e);
    }
  }, []);

  const handleTabSwitch = (targetTab: 'profile' | 'settings') => {
    if (targetTab === activeTab) return;
    setIsLoading(true);
    setActiveTab(targetTab);
    router.push(`/dashboard/${targetTab}`);
  };

  /* ═══════════════════════════════════════════════════
     Fetch Data on Load & Tab Switch
     ═══════════════════════════════════════════════════ */
  useEffect(() => {
    let isMounted = true;
    async function loadBackendData() {
      setIsLoading(true);
      try {
        let loadedRole = 'Creator';
        const profileData = await apiClient.get('/api/v1/profile/me');
        if (profileData) {
          setDisplayName(profileData.display_name || user?.display_name || profileData.email?.split('@')[0] || 'User');
          setEmail(profileData.email || user?.email || '');
          setAvatarUrl(profileData.avatar_url || user?.avatar_url || null);
          if (profileData.role) {
            const r = profileData.role;
            loadedRole = r.charAt(0).toUpperCase() + r.slice(1);
            setUserRole(loadedRole);
          }
          if (profileData.plan) {
            const p = profileData.plan;
            setPlan(p.charAt(0).toUpperCase() + p.slice(1));
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

      await fetchStats();

      try {
        const settingsData = await apiClient.get('/api/v1/settings');
        if (settingsData) {
          if (settingsData.theme) {
            const t = settingsData.theme.toLowerCase();
            if (t === 'dark' || t === 'light' || t === 'system') {
              // Reflect the account's saved theme, but never override a choice
              // the user just made on another page this session (e.g. toggled
              // on the optimizer). In that case the live provider preference is
              // fresher and wins — the `appPreference` → local `theme` effect
              // above already shows the right pill. Otherwise adopt the server
              // value so the account theme follows the user onto a fresh device.
              if (!hasUserSelectedThemeThisSession()) {
                setTheme(t);
                setAppTheme(t);
              }
            }
          }

          const roleKey = userRole.toLowerCase();
          const validModes = ROLE_MODES[roleKey] || [];
          if (roleKey === 'general' || validModes.length === 0) {
            setDefaultMode('General');
          } else if (settingsData.default_mode) {
            const m = settingsData.default_mode;
            const modeMap: Record<string, string> = {
              general: 'General',
              creative: 'Creative',
              technical: 'Technical',
              marketing: 'Marketing',
              coding: 'Coding',
              code: 'Coding',
            };
            const parsed = modeMap[m.toLowerCase()] || (m.charAt(0).toUpperCase() + m.slice(1));
            const matched = validModes.find((vm) => vm.toLowerCase() === parsed.toLowerCase());
            setDefaultMode(matched || validModes[0]);
          } else {
            setDefaultMode(validModes[0]);
          }

          if (settingsData.default_model) {
            const m = settingsData.default_model;
            const availableModels = ['ChatGPT', 'Claude', 'Gemini', 'Grok', 'Midjourney', 'VEO', 'Perplexity'];
            const found = availableModels.find((opt) => opt.toLowerCase() === m.toLowerCase());
            if (found) setDefaultModel(found);
          }
          if (settingsData.show_diff_by_default !== undefined) setShowDiffByDefault(settingsData.show_diff_by_default);
          if (settingsData.auto_detect_intent !== undefined) setAutoDetectIntent(settingsData.auto_detect_intent);
        }
      } catch (e) {
        console.warn('Could not load settings:', e);
      }
      if (isMounted) {
        setIsLoading(false);
      }
    }

    loadBackendData();
    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  /* ═══════════════════════════════════════════════════
     Handlers & API Mutations
     ═══════════════════════════════════════════════════ */
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
        if (refreshUserProfile) {
          await refreshUserProfile();
        }
        triggerSavedFeedback('profile_card');
        triggerToast('Profile avatar updated successfully!');
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
    try {
      const formData = new FormData();
      formData.append('avatar_preset', String(presetIdx));
      await apiClient.patch('/api/v1/profile/me', formData);
      if (refreshUserProfile) {
        await refreshUserProfile();
      }
    } catch {
      // fallback
    }
    triggerToast('Avatar preset applied!');
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
      if (refreshUserProfile) {
        await refreshUserProfile();
      }
      triggerToast('Display name updated!');
    } catch {
      triggerToast('Display name updated!');
    }
  };

  const handleRoleChange = async (newRole: string) => {
    setUserRole(newRole);
    triggerSavedFeedback('user_role');
    const roleKey = newRole.toLowerCase();
    const modes = ROLE_MODES[roleKey] || [];
    let updatedMode = '';
    if (roleKey === 'general' || modes.length === 0) {
      updatedMode = 'General';
    } else if (!modes.some((m) => m.toLowerCase() === defaultMode.toLowerCase())) {
      updatedMode = modes[0];
    } else {
      updatedMode = defaultMode;
    }
    setDefaultMode(updatedMode);

    try {
      const formData = new FormData();
      formData.append('role', newRole.toLowerCase());
      await apiClient.patch('/api/v1/profile/me', formData);
      await apiClient.patch('/api/v1/settings/default-mode', { default_mode: updatedMode.toLowerCase() });
      if (refreshUserProfile) {
        await refreshUserProfile();
      }
      triggerToast(`Default role set to ${newRole}`);
    } catch (err) {
      console.error('Failed to update role in backend:', err);
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    // Hand the preference to the global provider. It resolves "system" against
    // the OS and keeps following it live — no manual matchMedia needed here.
    setAppTheme(newTheme);
    triggerSavedFeedback('theme');
    try {
      await apiClient.patch('/api/v1/settings/theme', { theme: newTheme });
      triggerToast(`Theme set to ${newTheme.toUpperCase()}`);
    } catch (err) {
      console.error('Failed to update theme in backend:', err);
    }
  };

  const handleModeChange = async (newMode: string) => {
    setDefaultMode(newMode);
    triggerSavedFeedback('default_mode');
    try {
      await apiClient.patch('/api/v1/settings/default-mode', { default_mode: newMode.toLowerCase() });
      triggerToast(`Specialized mode updated to ${newMode}`);
    } catch (err) {
      console.error('Failed to update default mode in backend:', err);
    }
  };

  const handleModelChange = async (newModel: string) => {
    setDefaultModel(newModel);
    triggerSavedFeedback('default_model');
    try {
      await apiClient.patch('/api/v1/settings/default-model', { default_model: newModel.toLowerCase() });
      triggerToast(`AI engine set to ${newModel}`);
    } catch (err) {
      console.error('Failed to update default model in backend:', err);
    }
  };

  const handleToggleDiff = async (newVal: boolean) => {
    setShowDiffByDefault(newVal);
    triggerSavedFeedback('show_diff');
    try {
      await apiClient.patch('/api/v1/settings/diff-view', { enabled: newVal });
      triggerToast(newVal ? 'Side-by-side diff view enabled' : 'Side-by-side diff view disabled');
    } catch (err) {
      console.error('Failed to toggle diff view in backend:', err);
    }
  };

  const handleToggleIntent = async (newVal: boolean) => {
    setAutoDetectIntent(newVal);
    triggerSavedFeedback('auto_detect');
    try {
      await apiClient.patch('/api/v1/settings/intent-detection', { enabled: newVal });
      triggerToast(newVal ? 'Auto-intent detection enabled' : 'Auto-intent detection disabled');
    } catch (err) {
      console.error('Failed to toggle intent detection in backend:', err);
    }
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

      const d = new Date();
      setUpdatedAt(d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
      triggerSavedFeedback('preferences_card');
      triggerToast('All settings & preferences synced to cloud!');
    } catch (err) {
      console.error('Save preferences notice:', err);
      triggerToast('Settings saved successfully!');
    }
  };

  // Filter modes based on active role & search
  const currentRoleModes = useMemo(() => {
    const roleId = userRole.toLowerCase();
    const modes = ROLE_MODES[roleId] || ROLE_MODES['developer'] || [];
    if (!modeSearchQuery.trim()) return modes;
    return modes.filter((m) => m.toLowerCase().includes(modeSearchQuery.toLowerCase()));
  }, [userRole, modeSearchQuery]);

  // Model Engine definitions with performance badges
  const AI_MODELS = [
    { id: 'ChatGPT', label: 'GPT-4o', maker: 'OpenAI', badge: 'Omni Vision', color: '#10A37F' },
    { id: 'Claude', label: 'Claude 3.5 Sonnet', maker: 'Anthropic', badge: 'Top Reasoning', color: '#D97706' },
    { id: 'Gemini', label: 'Gemini 1.5 Pro', maker: 'Google', badge: '2M Context', color: '#2563EB' },
    { id: 'Perplexity', label: 'Sonar Pro', maker: 'Perplexity', badge: 'Live Search', color: '#0D9488' },
    { id: 'Grok', label: 'Grok 2.0', maker: 'xAI', badge: 'Realtime', color: '#111827' },
    { id: 'Midjourney', label: 'Midjourney v6.1', maker: 'Midjourney', badge: 'Diffusion Art', color: '#7C3AED' },
    { id: 'VEO', label: 'VEO Video AI', maker: 'Google DeepMind', badge: 'Gen Video', color: '#EC4899' },
  ];

  if (isLoading) {
    return <SettingsSkeleton activeTab={activeTab} />;
  }

  return (
    <div
      id="settings-page"
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: `0 ${pagePadX}px`,
        paddingTop: 8,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: 80,
      }}
    >
      {/* ── Apple / Linear Glass Top Header ── */}
      <div style={{ padding: isMobile ? '36px 0 20px' : '26px 0 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  color: isDark ? '#C084FC' : 'var(--color-primary, #7C3AED)',
                  background: isDark ? 'rgba(139, 92, 246, 0.18)' : 'rgba(124, 58, 237, 0.08)',
                  padding: '2.5px 9px',
                  borderRadius: 6,
                }}
              >
                {activeTab === 'profile' ? 'User Identity & Metrics' : 'System & Intelligence'}
              </span>
            </div>
            <h1
              style={{
                fontSize: isMobile ? 24 : 28,
                fontWeight: 800,
                color: isDark ? D.textPrimary : '#0F172A',
                letterSpacing: -0.6,
                margin: '0 0 4px',
              }}
            >
              {activeTab === 'profile' ? 'User Profile' : 'Settings & Preferences'}
            </h1>
            <p style={{ fontSize: 14, color: isDark ? D.textSecondary : '#64748B', margin: 0, lineHeight: 1.5 }}>
              {activeTab === 'profile'
                ? 'Manage your professional persona, telemetry stats, and subscription tier.'
                : 'Configure AI prompt architectures, role personas, engine models, and interface theme.'}
            </p>
          </div>

          {/* Segmented Tab Switcher (Apple macOS Style) */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: isDark ? 'rgba(20, 19, 32, 0.85)' : 'rgba(124, 58, 237, 0.06)',
              padding: 4,
              borderRadius: 14,
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(124, 58, 237, 0.12)'}`,
              flexShrink: 0,
              boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <button
              onClick={() => handleTabSwitch('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 18px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: activeTab === 'profile' ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                background: activeTab === 'profile' ? (isDark ? 'rgba(255, 255, 255, 0.12)' : '#FFFFFF') : 'transparent',
                color: activeTab === 'profile' ? (isDark ? '#C084FC' : '#6D28D9') : (isDark ? D.textMuted : '#64748B'),
                boxShadow: activeTab === 'profile' ? (isDark ? '0 2px 10px rgba(0,0,0,0.4)' : '0 2px 10px rgba(109, 40, 217, 0.12)') : 'none',
              }}
            >
              <User size={15} strokeWidth={activeTab === 'profile' ? 2.4 : 1.8} />
              <span>Profile</span>
            </button>
            <button
              onClick={() => handleTabSwitch('settings')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 18px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: activeTab === 'settings' ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                background: activeTab === 'settings' ? (isDark ? 'rgba(255, 255, 255, 0.12)' : '#FFFFFF') : 'transparent',
                color: activeTab === 'settings' ? (isDark ? '#C084FC' : '#6D28D9') : (isDark ? D.textMuted : '#64748B'),
                boxShadow: activeTab === 'settings' ? (isDark ? '0 2px 10px rgba(0,0,0,0.4)' : '0 2px 10px rgba(109, 40, 217, 0.12)') : 'none',
              }}
            >
              <Settings size={15} strokeWidth={activeTab === 'settings' ? 2.4 : 1.8} />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
         PROFILE VIEW (Apple ID & Telemetry Bento Grid)
         ═══════════════════════════════════════════════════ */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
          {/* Full-Width LeetCode Activity & Streak Heatmap (Top Hero Placement) */}
          <ActivityHeatmap
            activityCalendar={stats.activityCalendar}
            currentStreak={effectiveDayStreak}
            longestStreak={stats.longestStreak}
            totalActiveDays={stats.totalActiveDays}
            totalPrompts={stats.prompts}
          />

          <div className="bento-profile-grid">
            {/* Left Column: Identity & Plan Bento */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
              {/* Identity Bento Card */}
              <div
                style={{
                  background: isDark ? 'rgba(18, 16, 28, 0.88)' : '#FFFFFF',
                  borderRadius: 24,
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(124, 58, 237, 0.12)'}`,
                  boxShadow: isDark
                    ? 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 16px 40px -8px rgba(0, 0, 0, 0.5)'
                    : '0 8px 30px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
                  overflow: 'hidden',
                  position: 'relative',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Cinematic Ambient Apple-Style Header Canvas */}
                <div
                  style={{
                    height: 120,
                    background: 'linear-gradient(130deg, #0D071E 0%, #1A0B36 35%, #2B0D59 70%, #3B0F75 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Layered ambient glow orbs */}
                  <div
                    style={{
                      position: 'absolute',
                      width: 220,
                      height: 220,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(168, 85, 247, 0.45) 0%, transparent 68%)',
                      top: -80,
                      left: '12%',
                      filter: 'blur(30px)',
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      width: 200,
                      height: 200,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%)',
                      top: -60,
                      right: '15%',
                      filter: 'blur(35px)',
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      width: 140,
                      height: 140,
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, transparent 70%)',
                      bottom: -40,
                      right: '40%',
                      filter: 'blur(25px)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Frosted Glass Tier Chip */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 14,
                      right: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 13px',
                      borderRadius: 9999,
                      background: 'rgba(255, 255, 255, 0.12)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.22)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#34D399',
                        boxShadow: '0 0 8px #34D399',
                        display: 'inline-block',
                      }}
                    />
                    <span
                      style={{
                        color: '#FFFFFF',
                        fontSize: 10.5,
                        fontWeight: 750,
                        letterSpacing: '0.8px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {plan} Tier
                    </span>
                  </div>
                </div>

                {/* Avatar + Info Block */}
                <div style={{ padding: isMobile ? '0 18px 22px' : '0 28px 26px', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: -42, marginBottom: 16 }}>
                    {/* Glowing Ring Avatar */}
                    <div style={{ position: 'relative' }}>
                      <div
                        style={{
                          padding: 3,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #EC4899 100%)',
                          boxShadow: '0 8px 24px -2px rgba(124, 58, 237, 0.45)',
                          display: 'inline-block',
                        }}
                      >
                        <div
                          onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                          style={{
                            width: 78,
                            height: 78,
                            borderRadius: '50%',
                            border: `3px solid ${isDark ? '#110F1C' : '#FFFFFF'}`,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            position: 'relative',
                            background: isDark ? '#141320' : '#FFFFFF',
                          }}
                          title="Click to customize avatar"
                        >
                          {avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            renderPresetAvatar(avatarPreset, 78, 32)
                          )}

                          {/* Camera Hover Overlay */}
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(0,0,0,0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: 0,
                              transition: 'opacity 180ms ease',
                              color: '#FFFFFF',
                            }}
                            className="hover:opacity-100"
                          >
                            <Camera size={18} />
                          </div>
                        </div>
                      </div>

                      {/* Micro Camera Edit Button */}
                      <button
                        onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                        style={{
                          position: 'absolute',
                          bottom: 2,
                          right: -2,
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                          border: `2.5px solid ${isDark ? '#110F1C' : '#FFFFFF'}`,
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 3px 10px rgba(124, 58, 237, 0.5)',
                          transition: 'transform 160ms ease',
                        }}
                        className="hover:scale-110 active:scale-95"
                      >
                        <Camera size={13} strokeWidth={2.4} />
                      </button>
                      <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleDirectAvatarUpload} style={{ display: 'none' }} />
                    </div>

                    {/* Quick Profile Stat Pills (Apple ID Style) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingBottom: 2 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '5px 12px',
                          borderRadius: 10,
                          background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                        }}
                      >
                        <Zap size={13} color="#A78BFA" strokeWidth={2.4} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#F1F5F9' : '#0F172A' }}>{stats.prompts}</span>
                        <span style={{ fontSize: 11, color: isDark ? D.textMuted : '#64748B' }}>prompts</span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '5px 12px',
                          borderRadius: 10,
                          background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
                        }}
                      >
                        <Flame size={13} color="#F59E0B" strokeWidth={2.4} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#F1F5F9' : '#0F172A' }}>{effectiveDayStreak}d</span>
                        <span style={{ fontSize: 11, color: isDark ? D.textMuted : '#64748B' }}>streak</span>
                      </div>
                    </div>
                  </div>

                  {/* Avatar Picker Tray */}
                  {showAvatarPicker && (
                    <div
                      style={{
                        marginBottom: 18,
                        padding: 14,
                        borderRadius: 16,
                        background: isDark ? 'rgba(12, 10, 20, 0.95)' : '#F8FAFC',
                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: isDark ? D.textPrimary : '#1E293B' }}>Choose Avatar Preset</span>
                        <button onClick={() => setShowAvatarPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? D.textMuted : '#64748B' }}>
                          <X size={14} />
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => avatarInputRef.current?.click()}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 600,
                            background: '#7C3AED',
                            color: '#FFFFFF',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <Camera size={13} /> Upload Image
                        </button>
                        {presetAvatarGradients.map((_: string, i: number) => {
                          const presetIdx = i + 1;
                          const isCurrent = avatarPreset === presetIdx && !avatarUrl;
                          return (
                            <button
                              key={presetIdx}
                              onClick={() => handleSelectPresetAvatar(presetIdx)}
                              style={{
                                background: 'none',
                                border: isCurrent ? '2px solid #7C3AED' : '2px solid transparent',
                                padding: 2,
                                borderRadius: '50%',
                                cursor: 'pointer',
                                transform: isCurrent ? 'scale(1.1)' : 'none',
                                transition: 'all 160ms ease',
                              }}
                            >
                              {renderPresetAvatar(presetIdx, 32, 14)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Name & Title */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {isEditingName ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSaveDisplayName();
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: 360 }}
                      >
                        <input
                          type="text"
                          value={editingNameValue}
                          onChange={(e) => setEditingNameValue(e.target.value)}
                          autoFocus
                          style={{
                            padding: '6px 12px',
                            fontSize: 16,
                            fontWeight: 700,
                            borderRadius: 8,
                            border: '1.5px solid #7C3AED',
                            outline: 'none',
                            flex: 1,
                            background: isDark ? 'rgba(14, 13, 20, 0.9)' : '#FFFFFF',
                            color: isDark ? D.textPrimary : '#0F172A',
                          }}
                        />
                        <button
                          type="submit"
                          style={{
                            background: '#7C3AED',
                            color: '#FFF',
                            border: 'none',
                            borderRadius: 8,
                            padding: '8px 12px',
                            cursor: 'pointer',
                          }}
                        >
                          <Check size={14} strokeWidth={2.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingName(false)}
                          style={{
                            background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                            color: isDark ? D.textSecondary : '#64748B',
                            border: 'none',
                            borderRadius: 8,
                            padding: '8px 12px',
                            cursor: 'pointer',
                          }}
                        >
                          <X size={14} />
                        </button>
                      </form>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <h2 style={{ fontSize: 22, fontWeight: 800, color: isDark ? D.textPrimary : '#0F172A', margin: 0, letterSpacing: -0.5 }}>
                          {displayName || 'User'}
                        </h2>
                        <button
                          onClick={() => {
                            setEditingNameValue(displayName);
                            setIsEditingName(true);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9',
                            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.09)' : '#E2E8F0'}`,
                            borderRadius: 8,
                            padding: '3px 8px',
                            fontSize: 11,
                            fontWeight: 600,
                            color: isDark ? D.textSecondary : '#64748B',
                            cursor: 'pointer',
                            transition: 'all 160ms ease',
                          }}
                          className="hover:!border-[#7C3AED] hover:!text-[#7C3AED]"
                          title="Edit display name"
                        >
                          <Pencil size={11} strokeWidth={2.2} />
                          <span>Edit</span>
                        </button>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 750,
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px',
                            background: isDark ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.22), rgba(99, 102, 241, 0.16))' : 'rgba(124, 58, 237, 0.08)',
                            border: `1px solid ${isDark ? 'rgba(168, 85, 247, 0.35)' : 'rgba(124, 58, 237, 0.2)'}`,
                            color: isDark ? '#C084FC' : '#7C3AED',
                            padding: '3px 10px',
                            borderRadius: 8,
                          }}
                        >
                          {userRole}
                        </span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 2 }}>
                      <span style={{ fontSize: 13, color: isDark ? D.textSecondary : '#64748B' }}>{email}</span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#10B981',
                          background: 'rgba(16, 185, 129, 0.10)',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          padding: '2px 8px',
                          borderRadius: 9999,
                        }}
                      >
                        <ShieldCheck size={12} strokeWidth={2.5} /> Verified
                      </span>
                      {createdAt && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: isDark ? D.textMuted : '#94A3B8' }}>
                          <Calendar size={12} strokeWidth={2} /> Member since {createdAt}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Executive Subscription & Capability Spotlight Bento */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #0A0818 0%, #120926 40%, #1C0F38 100%)',
                  borderRadius: 24,
                  border: '1px solid rgba(168, 85, 247, 0.25)',
                  padding: isMobile ? '22px 18px' : '26px 28px',
                  color: '#FFFFFF',
                  boxShadow: isDark
                    ? 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 16px 40px -8px rgba(0, 0, 0, 0.5)'
                    : '0 8px 30px rgba(0, 0, 0, 0.06)',
                  position: 'relative',
                  overflow: 'hidden',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: isMobile ? 'auto' : 350,
                }}
              >
                {/* Subtle ambient light gradient */}
                <div
                  style={{
                    position: 'absolute',
                    top: -60,
                    right: -40,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.22) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Header: Icon + Title + Active Status Pill */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)',
                      }}
                    >
                      <Crown size={20} color="#FFFFFF" strokeWidth={2.4} />
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 750,
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          color: '#C4B5FD',
                          display: 'block',
                          marginBottom: 3,
                        }}
                      >
                        Active Subscription
                      </span>
                      <h3 style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: -0.4 }}>
                        {plan === 'Free' ? 'AURE Starter Free' : `${plan} Professional`}
                      </h3>
                    </div>
                  </div>

                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 12px',
                      borderRadius: 9999,
                      background: 'rgba(16, 185, 129, 0.14)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      fontSize: 11,
                      fontWeight: 750,
                      color: '#34D399',
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399', boxShadow: '0 0 8px #34D399' }} />
                    Active
                  </span>
                </div>

                {/* Quota Progress Bar */}
                <div style={{ marginBottom: 20, position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>Daily Prompt Enhancements</span>
                    <span style={{ fontWeight: 750, color: '#FFFFFF' }}>{stats.prompts} / Unlimited</span>
                  </div>
                  <div style={{ width: '100%', height: 7, borderRadius: 9999, background: 'rgba(255,255,255,0.10)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(16, stats.prompts * 4))}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #8B5CF6 0%, #D946EF 50%, #38BDF8 100%)',
                        borderRadius: 9999,
                        boxShadow: '0 0 14px rgba(168, 85, 247, 0.65)',
                      }}
                    />
                  </div>
                </div>

                {/* Tier Capabilities (Apple Bento Chips) */}
                <div className="bento-subscription-chips" style={{ marginBottom: 18 }}>
                  {[
                    { label: 'Real-time Token Streaming', icon: Zap, color: '#A78BFA' },
                    { label: '12+ Persona Architectures', icon: Cpu, color: '#38BDF8' },
                    { label: 'Full Style Memory Injection', icon: Brain, color: '#F472B6' },
                    { label: 'Side-by-Side Diff Engine', icon: Layers, color: '#34D399' },
                  ].map((cap, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 12,
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        transition: 'all 160ms ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 7,
                            background: 'rgba(255, 255, 255, 0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <cap.icon size={14} color={cap.color} strokeWidth={2.4} />
                        </div>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: '#F1F5F9' }}>{cap.label}</span>
                      </div>
                      <CheckCircle2 size={15} color="#34D399" strokeWidth={2.5} />
                    </div>
                  ))}
                </div>

                {/* Bottom Action Strip */}
                <div
                  style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.09)',
                    paddingTop: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255, 255, 255, 0.65)' }}>
                    <ShieldCheck size={15} color="#38BDF8" strokeWidth={2.4} />
                    <span>Neural prompt clusters operational</span>
                  </div>

                  <button
                    onClick={() => handleTabSwitch('settings')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 15px',
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.28), rgba(99, 102, 241, 0.28))',
                      border: '1px solid rgba(168, 85, 247, 0.45)',
                      color: '#EDE9FE',
                      fontSize: 12,
                      fontWeight: 750,
                      cursor: 'pointer',
                      transition: 'all 160ms ease',
                    }}
                    className="hover:scale-105 active:scale-95"
                  >
                    <Crown size={13} color="#FBBF24" />
                    <span>Upgrade Plan</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Telemetry & Badges Bento */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 24, height: '100%' }}>
              {/* KPI Metric Tiles */}
              <div
                style={{
                  background: isDark ? 'rgba(18, 16, 28, 0.88)' : '#FFFFFF',
                  borderRadius: 24,
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(124, 58, 237, 0.12)'}`,
                  boxShadow: isDark
                    ? 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 16px 40px -8px rgba(0, 0, 0, 0.5)'
                    : '0 8px 30px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
                  padding: isSmall ? '16px 14px' : isMobile ? '20px 18px' : '24px 26px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isMobile ? 16 : 20,
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: isSmall ? 15 : 16, fontWeight: 750, color: isDark ? D.textPrimary : '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Activity size={17} color="#7C3AED" />
                    <span>Performance Telemetry</span>
                  </h3>
                  <span style={{ fontSize: 12, color: isDark ? D.textMuted : '#64748B', fontWeight: 600 }}>Live Metrics</span>
                </div>

                {/* 4 Metric Boxes: 2x2 on mobile, 4x1 on desktop */}
                <div className="bento-telemetry-grid">
                  {[
                    { label: 'Prompts', value: stats.prompts.toLocaleString(), icon: Zap, color: '#7C3AED' },
                    { label: 'Avg Score', value: stats.avgScore.toString(), icon: Target, color: '#EC4899' },
                    { label: 'Day Streak', value: `${effectiveDayStreak}d`, icon: Flame, color: '#F59E0B' },
                    { label: 'Raw Best', value: `${Math.round(stats.userMaxScore)}`, icon: Award, color: '#10B981' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
                        borderRadius: isMobile ? 12 : 14,
                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : '#E2E8F0'}`,
                        padding: isMobile ? '12px 10px' : '12px 6px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        textAlign: 'center',
                        transition: 'transform 160ms ease, border-color 160ms ease',
                      }}
                      className="hover:scale-[1.03]"
                    >
                      <item.icon size={15} color={item.color} strokeWidth={2.4} />
                      <span style={{ fontSize: isMobile ? 17 : 16, fontWeight: 800, color: isDark ? D.textPrimary : '#0F172A', letterSpacing: -0.4 }}>{item.value}</span>
                      <span style={{ fontSize: 10, color: isDark ? D.textMuted : '#64748B', fontWeight: 600 }}>{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Weekly Activity Sparkline */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isDark ? D.textPrimary : '#334155' }}>Enhancement Frequency</span>
                    <span style={{ fontSize: 11, color: isDark ? D.textMuted : '#94A3B8' }}>Past 7 Days</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 44 }}>
                    {(() => {
                      const maxFreq = Math.max(...stats.frequency7d, 1);
                      const shortDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                      const dayLabels: string[] = [];
                      for (let dIdx = 6; dIdx >= 0; dIdx--) {
                        const d = new Date();
                        d.setDate(d.getDate() - dIdx);
                        dayLabels.push(shortDays[d.getDay()]);
                      }
                      return stats.frequency7d.map((count, i) => {
                        const isToday = i === 6;
                        const barHeight = Math.max(6, Math.round((count / maxFreq) * 36));
                        return (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <div
                              title={`${count} prompt${count === 1 ? '' : 's'}`}
                              style={{
                                width: '100%',
                                borderRadius: 4,
                                height: `${barHeight}px`,
                                background: isToday
                                  ? 'linear-gradient(180deg, #8B5CF6, #7C3AED)'
                                  : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124, 58, 237, 0.12)'),
                                boxShadow: isToday ? '0 2px 8px rgba(124, 58, 237, 0.35)' : 'none',
                                transition: 'height 240ms ease',
                              }}
                            />
                            <span style={{ fontSize: 9.5, color: isToday ? '#7C3AED' : (isDark ? D.textMuted : '#94A3B8'), fontWeight: isToday ? 700 : 500 }}>
                              {dayLabels[i]}
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* LeetCode-Style Badges Showcase Widget */}
              <div
                id="badges-showcase-card"
                onClick={() => {
                  setShowBadgesModal(true);
                }}
                style={{
                  background: isDark ? 'rgba(18, 16, 28, 0.88)' : '#FFFFFF',
                  borderRadius: 24,
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(124, 58, 237, 0.12)'}`,
                  boxShadow: isDark
                    ? 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 16px 40px -8px rgba(0, 0, 0, 0.5)'
                    : '0 8px 30px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
                  padding: isMobile ? '22px 18px' : '26px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  flex: 1,
                  minHeight: isMobile ? 'auto' : 350,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  backdropFilter: 'blur(20px)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Subtle ambient light gradient */}
                <div
                  style={{
                    position: 'absolute',
                    top: -50,
                    right: -40,
                    width: 180,
                    height: 180,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Top Section: Header + Large Count */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
                        }}
                      >
                        <Award size={18} color="#FFFFFF" strokeWidth={2.4} />
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: 750,
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            color: '#FCD34D',
                            display: 'block',
                            marginBottom: 2,
                          }}
                        >
                          Mastery & Honors
                        </span>
                        <span style={{ fontSize: 16, fontWeight: 800, color: isDark ? D.textPrimary : '#0F172A', letterSpacing: -0.3 }}>
                          Badges
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '5px 12px',
                        borderRadius: 9999,
                        background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
                        fontSize: 11,
                        fontWeight: 700,
                        color: isDark ? '#C084FC' : '#7C3AED',
                      }}
                    >
                      <span>View All</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>

                  {/* Large Count Number & Status */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: isSmall ? 28 : 32, fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', lineHeight: 1 }}>
                      {stats.unlockedBadgeCount}
                    </span>
                    <span style={{ fontSize: 12, color: isDark ? D.textMuted : '#64748B', fontWeight: 600 }}>
                      unlocked of {(stats.badges || []).length || 11} honors
                    </span>
                  </div>
                </div>

                {/* Horizontal Showcase of ONLY Achieved Badges */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: isSmall ? 16 : isMobile ? 20 : 26,
                    padding: '20px 0',
                    flex: 1,
                  }}
                >
                  {(() => {
                    const unlocked = (stats.badges || []).filter((b) => b.unlocked);
                    if (unlocked.length === 0) {
                      return (
                        <div style={{ fontSize: 12, color: isDark ? D.textMuted : '#94A3B8', textAlign: 'center', padding: '12px 0' }}>
                          No badges unlocked yet. Start enhancing prompts to earn your first badge!
                        </div>
                      );
                    }

                    // Show up to 3 achieved badges (center one prominent)
                    const displayBadges = unlocked.slice(Math.max(0, unlocked.length - 3));

                    return displayBadges.map((b, idx) => {
                      const isCenter = displayBadges.length === 3 ? idx === 1 : idx === displayBadges.length - 1;
                      const isHovered = hoveredBadgeId === b.id;
                      const size = isCenter ? (isSmall ? 60 : isMobile ? 66 : 72) : (isSmall ? 46 : isMobile ? 50 : 56);
                      const tierStyle = getTierStyle(b.tier, isDark);

                      return (
                        <div
                          key={b.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBadge(b);
                          }}
                          onMouseEnter={() => setHoveredBadgeId(b.id)}
                          onMouseLeave={() => setHoveredBadgeId(null)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative',
                            cursor: 'pointer',
                            transform: isHovered ? 'scale(1.14)' : (isCenter ? 'scale(1.05)' : 'scale(1)'),
                            transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        >
                          {/* Floating Tooltip matching reference screenshot */}
                          {isHovered && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 'calc(100% + 10px)',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: isDark ? '#2B2B2D' : '#1E293B',
                                color: '#FFFFFF',
                                fontSize: isSmall ? 12 : 13.5,
                                fontWeight: 500,
                                padding: isSmall ? '5px 10px' : '6px 14px',
                                borderRadius: 8,
                                whiteSpace: 'nowrap',
                                maxWidth: '85vw',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                pointerEvents: 'none',
                                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.45)',
                                border: isDark ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid rgba(0, 0, 0, 0.15)',
                                zIndex: 50,
                              }}
                            >
                              {b.title}
                            </div>
                          )}

                          <img
                            src={`/badges/${b.id}.png`}
                            alt={b.title}
                            style={{
                              width: size,
                              height: size,
                              objectFit: 'contain',
                              filter: `drop-shadow(0 6px 16px ${tierStyle.glow})`,
                              transition: 'all 200ms ease',
                            }}
                          />
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Bottom Info: Most Recent Badge */}
                <div
                  style={{
                    borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.08)'}`,
                    paddingTop: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.8px', color: isDark ? '#94A3B8' : '#64748B' }}>
                      Most Recent Badge
                    </div>
                    <div style={{ fontSize: isSmall ? 13.5 : 14.5, fontWeight: 750, color: isDark ? '#F1F5F9' : '#0F172A', marginTop: 2 }}>
                      {(() => {
                        const unlocked = (stats.badges || []).filter((b) => b.unlocked);
                        const displayBadges = unlocked.slice(Math.max(0, unlocked.length - 3));
                        const hovered = displayBadges.find(b => b.id === hoveredBadgeId);
                        if (hovered) return hovered.title;
                        return unlocked.length > 0 ? unlocked[unlocked.length - 1].title : 'None yet';
                      })()}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: '#F59E0B',
                      background: 'rgba(245, 158, 11, 0.12)',
                      border: '1px solid rgba(245, 158, 11, 0.28)',
                      padding: '4px 10px',
                      borderRadius: 8,
                    }}
                  >
                    <Medal size={13} strokeWidth={2.4} />
                    <span>Achieved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
         SETTINGS VIEW (macOS & Linear Bento Layout)
         ═══════════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
          {/* Main Settings Bento Box */}
          <div
            style={{
              background: isDark ? 'rgba(20, 19, 32, 0.85)' : '#FFFFFF',
              borderRadius: 24,
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124, 58, 237, 0.12)'}`,
              boxShadow: isDark ? '0 4px 24px rgba(0, 0, 0, 0.35)' : '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
              padding: isMobile ? '22px 18px' : '32px 36px',
              display: 'flex',
              flexDirection: 'column',
              gap: 32,
            }}
          >
            {/* ── 1. Visual Theme (Apple OS Style) ── */}
            <div>
              <div style={{ marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: isDark ? D.textPrimary : '#0F172A', margin: '0 0 3px' }}>Appearance</h3>
                <p style={{ fontSize: 13, color: isDark ? D.textSecondary : '#64748B', margin: 0 }}>Select your preferred workspace theme color palette.</p>
              </div>

              <div className="bento-appearance-grid">
                {[
                  { id: 'light', label: 'Light', icon: Sun, bg: '#F8FAFC', border: '#E2E8F0' },
                  { id: 'dark', label: 'Dark', icon: Moon, bg: '#0F172A', border: '#334155' },
                  { id: 'system', label: 'Auto (System)', icon: Laptop, bg: 'linear-gradient(135deg, #FFFFFF 50%, #0F172A 50%)', border: '#CBD5E1' },
                ].map((th) => {
                  const isSelected = theme === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => handleThemeChange(th.id as 'light' | 'dark' | 'system')}
                      style={{
                        padding: '12px 8px',
                        borderRadius: 14,
                        border: isSelected ? '2px solid #8B5CF6' : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.10)' : '#E2E8F0'}`,
                        background: isSelected ? (isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(124, 58, 237, 0.04)') : (isDark ? 'rgba(14, 13, 20, 0.75)' : '#FFFFFF'),
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 180ms ease',
                      }}
                      className="hover:!border-[#8B5CF6]"
                    >
                      <div
                        style={{
                          width: 42,
                          height: 28,
                          borderRadius: 6,
                          background: th.bg,
                          border: `1px solid ${th.border}`,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <th.icon size={14} color={th.id === 'dark' ? '#93C5FD' : '#64748B'} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: isSelected ? 700 : 500, color: isSelected ? (isDark ? '#C084FC' : '#7C3AED') : (isDark ? D.textSecondary : '#334155') }}>
                        {th.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ height: 1, background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124, 58, 237, 0.08)' }} />

            {/* ── 2. Default Role Persona (Linear 12 Roles Grid) ── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: isDark ? D.textPrimary : '#0F172A', margin: '0 0 3px' }}>Default Role Architecture</h3>
                  <p style={{ fontSize: 13, color: isDark ? D.textSecondary : '#64748B', margin: 0 }}>Every optimization defaults to this role persona.</p>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isDark ? '#C084FC' : '#7C3AED',
                    background: isDark ? 'rgba(139, 92, 246, 0.18)' : 'rgba(124, 58, 237, 0.08)',
                    padding: '2px 8px',
                    borderRadius: 9999,
                  }}
                >
                  12 Roles
                </span>
              </div>

              <div className="bento-roles-grid">
                {ROLES.map((role) => {
                  const isSelected = userRole.toLowerCase() === role.id.toLowerCase();
                  const RoleIcon = role.icon;
                  const modesCount = ROLE_MODES[role.id]?.length ?? 0;
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleRoleChange(role.label)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 14,
                        border: isSelected ? '1.5px solid #8B5CF6' : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124, 58, 237, 0.10)'}`,
                        background: isSelected ? 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)' : (isDark ? 'rgba(14, 13, 20, 0.75)' : '#FFFFFF'),
                        color: isSelected ? '#FFFFFF' : (isDark ? D.textPrimary : '#1E293B'),
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        textAlign: 'left',
                        transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: isSelected ? '0 4px 14px rgba(124, 58, 237, 0.28)' : '0 1px 2px rgba(0,0,0,0.02)',
                      }}
                      className={!isSelected ? 'hover:!border-[#8B5CF6] hover:translate-y-[-1px]' : ''}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: isSelected ? 'rgba(255, 255, 255, 0.22)' : (isDark ? 'rgba(139, 92, 246, 0.18)' : 'rgba(124, 58, 237, 0.08)'),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isSelected ? '#FFFFFF' : (isDark ? '#C084FC' : '#7C3AED'),
                          flexShrink: 0,
                        }}
                      >
                        <RoleIcon size={16} strokeWidth={2.2} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {role.label}
                        </span>
                        {modesCount > 0 && (
                          <span style={{ fontSize: 10.5, color: isSelected ? 'rgba(255,255,255,0.75)' : (isDark ? D.textMuted : '#64748B'), fontWeight: 500 }}>
                            {modesCount} modes
                          </span>
                        )}
                      </div>
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── 3. Deep Specialization Mode Container ── */}
            {currentRoleModes.length === 0 ? (
              <div
                style={{
                  background: isDark ? 'rgba(14, 13, 20, 0.85)' : '#F8FAFC',
                  borderRadius: 18,
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0'}`,
                  padding: isMobile ? '16px 14px' : '18px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: isDark ? D.textPrimary : '#0F172A' }}>Default Mode:</span>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: '#FFFFFF',
                      background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
                      padding: '2.5px 10px',
                      borderRadius: 9999,
                      boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
                    }}
                  >
                    Universal / All-Purpose
                  </span>
                </div>
                <span style={{ fontSize: 12.5, color: isDark ? D.textSecondary : '#64748B' }}>
                  The General role operates universally across all domains without sub-mode specialization.
                </span>
              </div>
            ) : (
              <div
                style={{
                  background: isDark ? 'rgba(14, 13, 20, 0.85)' : '#F8FAFC',
                  borderRadius: 18,
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0'}`,
                  padding: isMobile ? '16px 14px' : '20px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: isDark ? D.textPrimary : '#0F172A' }}>Default Mode:</span>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: '#FFFFFF',
                        background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
                        padding: '2.5px 10px',
                        borderRadius: 9999,
                        boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
                      }}
                    >
                      {defaultMode}
                    </span>
                  </div>

                  {/* Instant Search Bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: isDark ? 'rgba(20, 19, 32, 0.85)' : '#FFFFFF',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#CBD5E1'}`,
                      borderRadius: 10,
                      padding: '6px 12px',
                      width: isMobile ? '100%' : 220,
                    }}
                  >
                    <Search size={14} color={isDark ? D.textMuted : '#94A3B8'} />
                    <input
                      type="text"
                      placeholder="Search modes..."
                      value={modeSearchQuery}
                      onChange={(e) => setModeSearchQuery(e.target.value)}
                      style={{
                        border: 'none',
                        outline: 'none',
                        fontSize: 12.5,
                        color: isDark ? D.textPrimary : '#0F172A',
                        width: '100%',
                        background: 'transparent',
                      }}
                    />
                    {modeSearchQuery && (
                      <button onClick={() => setModeSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: isDark ? D.textMuted : '#94A3B8' }}>
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Mode Chips List */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 180, overflowY: 'auto', paddingRight: 4 }}>
                  {currentRoleModes.map((modeName) => {
                    const isModeSelected = defaultMode.toLowerCase() === modeName.toLowerCase();
                    const ModeIcon = getModeIcon(modeName);
                    return (
                      <button
                        key={modeName}
                        onClick={() => handleModeChange(modeName)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          borderRadius: 9999,
                          fontSize: 12,
                          fontWeight: isModeSelected ? 700 : 500,
                          border: isModeSelected ? '1px solid #8B5CF6' : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.10)' : '#E2E8F0'}`,
                          background: isModeSelected ? 'linear-gradient(135deg, #7C3AED, #9333EA)' : (isDark ? 'rgba(255, 255, 255, 0.06)' : '#FFFFFF'),
                          color: isModeSelected ? '#FFFFFF' : (isDark ? D.textSecondary : '#334155'),
                          cursor: 'pointer',
                          transition: 'all 160ms ease',
                          boxShadow: isModeSelected ? '0 2px 8px rgba(124, 58, 237, 0.25)' : 'none',
                        }}
                        className={!isModeSelected ? 'hover:!border-[#8B5CF6] hover:!text-[#C084FC]' : ''}
                      >
                        <ModeIcon size={12} strokeWidth={isModeSelected ? 2.5 : 1.8} />
                        <span>{modeName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 5. Behaviors & Toggles ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: isDark ? D.textPrimary : '#0F172A', margin: '0 0 3px' }}>Workspace Automation</h3>
                <p style={{ fontSize: 13, color: isDark ? D.textSecondary : '#64748B', margin: 0 }}>Refine interactive behaviors across the prompt enhancement canvas.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: isDark ? D.textPrimary : '#0F172A', display: 'block' }}>Show Side-by-Side Diff View</span>
                    <span style={{ fontSize: 12, color: isDark ? D.textSecondary : '#64748B' }}>Display token-level red/green diff highlighting by default on enhanced drafts.</span>
                  </div>
                  <ToggleSwitch enabled={showDiffByDefault} onToggle={() => handleToggleDiff(!showDiffByDefault)} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: isDark ? D.textPrimary : '#0F172A', display: 'block' }}>Auto-Detect Prompt Intent</span>
                    <span style={{ fontSize: 12, color: isDark ? D.textSecondary : '#64748B' }}>Analyze raw prompt semantics to suggest role and template matches automatically.</span>
                  </div>
                  <ToggleSwitch enabled={autoDetectIntent} onToggle={() => handleToggleIntent(!autoDetectIntent)} />
                </div>
              </div>
            </div>

            {/* ── 6. Bottom Sync Dock ── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124, 58, 237, 0.10)'}`,
                paddingTop: 20,
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                <span style={{ fontSize: 12.5, color: isDark ? D.textMuted : '#64748B' }}>
                  {updatedAt ? `Last synced ${updatedAt}` : 'All changes auto-saved'}
                </span>
              </div>

              <button
                onClick={handleSavePreferences}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 22px',
                  borderRadius: 12,
                  fontSize: 13.5,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.28)',
                  transition: 'all 200ms ease',
                }}
                className="hover:translate-y-[-1px] hover:brightness-105"
              >
                <CheckCircle2 size={16} strokeWidth={2.4} />
                <span>Save Preferences</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── All Earned Badges Showcase Modal ── */}
      {showBadgesModal && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowBadgesModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            background: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: isDark ? '#18181B' : '#FFFFFF',
              borderRadius: isMobile ? 20 : 24,
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0'}`,
              boxShadow: isDark ? '0 25px 60px rgba(0, 0, 0, 0.6)' : '0 25px 60px rgba(0, 0, 0, 0.12)',
              maxWidth: 580,
              width: '100%',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              padding: isSmall ? '16px 14px' : isMobile ? '20px 18px' : '24px 24px',
              gap: isMobile ? 12 : 16,
              position: 'relative',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ fontSize: isSmall ? 16 : 18, fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={isSmall ? 18 : 20} color="#F59E0B" />
                  <span>Your Unlocked Badges</span>
                </h3>
                <p style={{ fontSize: isSmall ? 11 : 12, color: isDark ? D.textMuted : '#64748B', margin: '4px 0 0' }}>
                  Click any badge to view why you earned it and your milestone stats.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isDark ? '#C084FC' : '#7C3AED',
                    background: isDark ? 'rgba(139, 92, 246, 0.18)' : 'rgba(124, 58, 237, 0.08)',
                    border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(124, 58, 237, 0.2)'}`,
                    padding: '3px 10px',
                    borderRadius: 9999,
                  }}
                >
                  {stats.unlockedBadgeCount} Unlocked
                </span>
                <button
                  type="button"
                  onClick={() => setShowBadgesModal(false)}
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                    border: 'none',
                    borderRadius: '50%',
                    width: 30,
                    height: 30,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isDark ? '#94A3B8' : '#64748B',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Grid of Unlocked Badges */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isSmall ? 'repeat(auto-fill, minmax(95px, 1fr))' : isMobile ? 'repeat(auto-fill, minmax(110px, 1fr))' : 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: isSmall ? 8 : 12,
                overflowY: 'auto',
                padding: '8px 4px',
              }}
            >
              {(() => {
                const unlocked = (stats.badges || []).filter((b) => b.unlocked);
                if (unlocked.length === 0) {
                  return (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 16px', color: isDark ? D.textMuted : '#94A3B8', fontSize: 13 }}>
                      You haven&apos;t unlocked any badges yet. Continue enhancing prompts and building streaks to earn them!
                    </div>
                  );
                }

                return unlocked.map((b) => {
                  const tierStyle = getTierStyle(b.tier, isDark);
                  return (
                    <div
                      key={b.id}
                      onClick={() => {
                        setSelectedBadge(b);
                      }}
                      style={{
                        padding: isSmall ? '10px 6px' : '14px 10px',
                        borderRadius: 16,
                        border: `1px solid ${tierStyle.border}`,
                        background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8FAFC',
                        boxShadow: `0 2px 10px ${tierStyle.glow}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        transition: 'all 200ms ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.borderColor = tierStyle.color;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = tierStyle.border;
                      }}
                    >
                      <img
                        src={`/badges/${b.id}.png`}
                        alt={b.title}
                        style={{
                          width: isSmall ? 44 : 52,
                          height: isSmall ? 44 : 52,
                          objectFit: 'contain',
                          filter: `drop-shadow(0 3px 8px ${tierStyle.glow})`,
                        }}
                      />
                      <div>
                        <div style={{ fontSize: isSmall ? 10.5 : 11.5, fontWeight: 700, color: isDark ? D.textPrimary : '#1E293B', lineHeight: 1.2 }}>
                          {b.title}
                        </div>
                        <span
                          style={{
                            fontSize: 8.5,
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: 4,
                            background: tierStyle.bg,
                            color: tierStyle.color,
                            border: `1px solid ${tierStyle.border}`,
                            letterSpacing: '0.4px',
                            display: 'inline-block',
                            marginTop: 4,
                          }}
                        >
                          {tierStyle.label}
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── Badge Detail "Why You Won This" Modal ── */}
      {selectedBadge && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedBadge(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: isDark ? '#18181B' : '#FFFFFF',
              borderRadius: isMobile ? 20 : 24,
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0'}`,
              boxShadow: isDark ? '0 25px 60px rgba(0, 0, 0, 0.6)' : '0 25px 60px rgba(0, 0, 0, 0.12)',
              maxWidth: 440,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: isSmall ? '20px 16px' : isMobile ? '24px 20px' : '28px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? 16 : 20,
              position: 'relative',
            }}
          >
            {/* Close X */}
            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDark ? '#94A3B8' : '#64748B',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              <X size={16} />
            </button>

            {/* Badge Artwork Hero */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 }}>
              <div
                style={{
                  position: 'relative',
                  padding: isSmall ? 10 : 14,
                  borderRadius: 24,
                  background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
                }}
              >
                <img
                  src={`/badges/${selectedBadge.id}.png`}
                  alt={selectedBadge.title}
                  style={{
                    width: isSmall ? 72 : 88,
                    height: isSmall ? 72 : 88,
                    objectFit: 'contain',
                    filter: selectedBadge.unlocked
                      ? `drop-shadow(0 6px 18px ${getTierStyle(selectedBadge.tier, isDark).glow})`
                      : 'grayscale(100%) opacity(40%)',
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 9999,
                      background: getTierStyle(selectedBadge.tier, isDark).bg,
                      color: getTierStyle(selectedBadge.tier, isDark).color,
                      border: `1px solid ${getTierStyle(selectedBadge.tier, isDark).border}`,
                      letterSpacing: '0.5px',
                    }}
                  >
                    {getTierStyle(selectedBadge.tier, isDark).label}
                  </span>
                  <span style={{ fontSize: 11, color: isDark ? D.textMuted : '#94A3B8', fontWeight: 600 }}>
                    • {selectedBadge.category}
                  </span>
                </div>

                <h3 style={{ fontSize: isSmall ? 18 : 20, fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', margin: 0 }}>
                  {selectedBadge.title}
                </h3>
              </div>
            </div>

            {/* Why You Won This Info Box */}
            <div
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.03)' : '#F8FAFC',
                borderRadius: 16,
                border: `1px solid ${selectedBadge.unlocked ? (isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.35)') : (isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0')}`,
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                    color: selectedBadge.unlocked ? '#10B981' : (isDark ? '#F59E0B' : '#D97706'),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                  }}
                >
                  <Award size={13} />
                  {selectedBadge.unlocked ? 'WHY YOU WON THIS BADGE' : 'HOW TO UNLOCK THIS BADGE'}
                </span>
                {selectedBadge.unlocked ? (
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Check size={11} strokeWidth={3} />
                    EARNED
                  </span>
                ) : (
                  <span style={{ fontSize: 10, fontWeight: 600, color: isDark ? '#94A3B8' : '#64748B', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Lock size={10} />
                    IN PROGRESS
                  </span>
                )}
              </div>

              <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? D.textPrimary : '#1E293B', lineHeight: 1.4 }}>
                {selectedBadge.description}
              </div>

              {selectedBadge.unlock_criterion && (
                <div style={{ fontSize: 11, color: isDark ? D.textMuted : '#64748B' }}>
                  <strong>Milestone:</strong> {selectedBadge.unlock_criterion}
                </div>
              )}

              {/* Progress */}
              <div style={{ marginTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: isDark ? D.textMuted : '#64748B', marginBottom: 4 }}>
                  <span>Your Progress</span>
                  <span>{selectedBadge.progress} ({Math.round(selectedBadge.percentage)}%)</span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: 6,
                    borderRadius: 9999,
                    background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(selectedBadge.unlocked ? 100 : 0, selectedBadge.percentage))}%`,
                      height: '100%',
                      borderRadius: 9999,
                      background: selectedBadge.unlocked
                        ? 'linear-gradient(90deg, #10B981, #059669)'
                        : `linear-gradient(90deg, #7C3AED, ${getTierStyle(selectedBadge.tier, isDark).color})`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Done Button */}
            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              style={{
                width: '100%',
                padding: '11px 0',
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(124, 58, 237, 0.3)',
                transition: 'all 160ms ease',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Floating Toast Feedback */}
      {toast.visible && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 20px',
            borderRadius: 14,
            background: '#0F172A',
            color: '#FFFFFF',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.15)',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <CheckCircle size={16} color="#10B981" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
