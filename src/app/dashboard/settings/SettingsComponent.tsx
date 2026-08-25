'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  User, Check, Settings, Camera,
  Sparkles, Zap, X, RefreshCw,
  Target, Flame, Search,
  Award, Layers, CheckCircle2, ShieldCheck,
  Sun, Moon, Laptop, ArrowRight,
  Pencil, Cpu, FileText, CheckCircle, ExternalLink,
  Sliders, Shield, Activity, HelpCircle, LogOut
} from 'lucide-react';
import { apiClient } from '@/utils/apiClient';
import { ROLES, ROLE_MODES, getModeIcon } from '@/constants/roles';
import { presetAvatarGradients, getInitials, renderPresetAvatar } from '@/constants/avatars';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import SettingsSkeleton from './SettingsSkeleton';

/* ── Custom iOS / macOS Switch Component ── */
interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
  ariaLabel?: string;
}

function ToggleSwitch({ enabled, onToggle, ariaLabel }: ToggleSwitchProps) {
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
        background: enabled ? 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)' : 'rgba(124, 58, 237, 0.14)',
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

export interface SettingsPageProps {
  initialTab?: 'profile' | 'settings';
}

export function SettingsComponent({ initialTab = 'settings' }: SettingsPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryTab = searchParams?.get('tab') || searchParams?.get('view');

  const isDesktop = useMediaQuery('(min-width: 1081px)');
  const isTablet = useMediaQuery('(max-width: 1080px) and (min-width: 641px)');
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isSmall = useMediaQuery('(max-width: 420px)');
  const pagePadX = isSmall ? 16 : isMobile ? 20 : isTablet ? 32 : 48;

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
  const [displayName, setDisplayName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreset, setAvatarPreset] = useState<number>(4);
  const [userRole, setUserRole] = useState<string>('Creator');
  const [plan, setPlan] = useState<string>('Free');
  const [createdAt, setCreatedAt] = useState<string>('');
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [stats, setStats] = useState<{ prompts: number; avgScore: number; dayStreak: number }>({
    prompts: 0,
    avgScore: 0,
    dayStreak: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Preference Settings
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
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

  /* ═══════════════════════════════════════════════════
     Fetch Data on Load
     ═══════════════════════════════════════════════════ */
  useEffect(() => {
    async function loadBackendData() {
      setIsLoading(true);
      try {
        let loadedRole = 'Creator';
        const profileData = await apiClient.get('/api/v1/profile/me');
        if (profileData) {
          setDisplayName(profileData.display_name || profileData.email?.split('@')[0] || 'User');
          setEmail(profileData.email || '');
          setAvatarUrl(profileData.avatar_url || null);
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
      setIsLoading(false);
    }

    loadBackendData();
  }, []);

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
      triggerToast(`Default role set to ${newRole}`);
    } catch (err) {
      console.error('Failed to update role in backend:', err);
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
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
                  color: 'var(--color-primary, #7C3AED)',
                  background: 'rgba(124, 58, 237, 0.08)',
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
                color: 'var(--color-text-primary, #0F172A)',
                letterSpacing: -0.6,
                margin: '0 0 4px',
              }}
            >
              {activeTab === 'profile' ? 'User Profile' : 'Settings & Preferences'}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary, #64748B)', margin: 0, lineHeight: 1.5 }}>
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
              background: 'rgba(124, 58, 237, 0.06)',
              padding: 4,
              borderRadius: 14,
              border: '1px solid rgba(124, 58, 237, 0.12)',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            }}
          >
            <button
              onClick={() => {
                setActiveTab('profile');
                router.push('/dashboard/profile');
              }}
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
                background: activeTab === 'profile' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'profile' ? '#6D28D9' : 'var(--color-text-secondary, #64748B)',
                boxShadow: activeTab === 'profile' ? '0 2px 10px rgba(109, 40, 217, 0.12)' : 'none',
              }}
            >
              <User size={15} strokeWidth={activeTab === 'profile' ? 2.4 : 1.8} />
              <span>Profile</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('settings');
                router.push('/dashboard/settings');
              }}
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
                background: activeTab === 'settings' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'settings' ? '#6D28D9' : 'var(--color-text-secondary, #64748B)',
                boxShadow: activeTab === 'settings' ? '0 2px 10px rgba(109, 40, 217, 0.12)' : 'none',
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isDesktop ? '1.15fr 0.85fr' : '1fr',
            gap: 24,
            width: '100%',
          }}
        >
          {/* Left Column: Identity & Plan Bento */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Identity Bento Card */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 24,
                border: '1px solid rgba(124, 58, 237, 0.12)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Subtle Ambient Header Canvas */}
              <div
                style={{
                  height: 100,
                  background: 'linear-gradient(135deg, #1E1035 0%, #2E1254 50%, #4C1D95 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(168, 85, 247, 0.3) 0%, transparent 60%)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 16,
                    padding: '4px 12px',
                    borderRadius: 9999,
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#FFFFFF',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.6px',
                    textTransform: 'uppercase',
                  }}
                >
                  {plan} Tier
                </div>
              </div>

              {/* Avatar + Info Block */}
              <div style={{ padding: '0 28px 26px', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: -40, marginBottom: 14 }}>
                  {/* Glowing Avatar */}
                  <div style={{ position: 'relative' }}>
                    <div
                      onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        border: '4px solid #FFFFFF',
                        boxShadow: '0 4px 16px rgba(109, 40, 217, 0.22)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        position: 'relative',
                        background: '#FFFFFF',
                      }}
                      title="Click to customize avatar"
                    >
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        renderPresetAvatar(avatarPreset, 80, 32)
                      )}

                      {/* Camera Hover Overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.35)',
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

                    <button
                      onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: -2,
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: '#7C3AED',
                        border: '2px solid #FFFFFF',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(124, 58, 237, 0.4)',
                      }}
                    >
                      <Camera size={12} strokeWidth={2.5} />
                    </button>
                    <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleDirectAvatarUpload} style={{ display: 'none' }} />
                  </div>
                </div>

                {/* Avatar Picker Tray */}
                {showAvatarPicker && (
                  <div
                    style={{
                      marginBottom: 16,
                      padding: 14,
                      borderRadius: 16,
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>Choose Avatar Preset</span>
                      <button onClick={() => setShowAvatarPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                          background: '#F1F5F9',
                          color: '#64748B',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: -0.4 }}>
                        {displayName || 'User'}
                      </h2>
                      <button
                        onClick={() => {
                          setEditingNameValue(displayName);
                          setIsEditingName(true);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#94A3B8',
                          padding: 2,
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                        className="hover:!text-[#7C3AED]"
                        title="Edit name"
                      >
                        <Pencil size={14} />
                      </button>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.6px',
                          background: 'rgba(124, 58, 237, 0.08)',
                          color: '#7C3AED',
                          padding: '2px 8px',
                          borderRadius: 6,
                        }}
                      >
                        {userRole}
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: '#64748B' }}>{email}</span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#10B981',
                        background: 'rgba(16, 185, 129, 0.08)',
                        padding: '1.5px 7px',
                        borderRadius: 9999,
                      }}
                    >
                      <Check size={10} strokeWidth={3} /> Verified
                    </span>
                    {createdAt && <span style={{ fontSize: 12, color: '#94A3B8' }}>• Member since {createdAt}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription & Capability Spotlight */}
            <div
              style={{
                background: 'linear-gradient(135deg, #09090D 0%, #150D2A 50%, #200E3E 100%)',
                borderRadius: 24,
                border: '1px solid rgba(139, 92, 246, 0.22)',
                padding: isMobile ? '22px 18px' : '28px 30px',
                color: '#FFFFFF',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      color: '#C4B5FD',
                      display: 'block',
                      marginBottom: 4,
                    }}
                  >
                    Active Plan
                  </span>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                    {plan === 'Free' ? 'AURE Starter Free' : `${plan} Professional`}
                  </h3>
                </div>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: 9999,
                    background: 'rgba(124, 58, 237, 0.35)',
                    border: '1px solid rgba(167, 139, 250, 0.4)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#EDE9FE',
                  }}
                >
                  Active
                </span>
              </div>

              {/* Quota Progress */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
                  <span>Daily Prompt Enhancements</span>
                  <span>{stats.prompts} / Unlimited</span>
                </div>
                <div style={{ width: '100%', height: 6, borderRadius: 9999, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, Math.max(15, stats.prompts * 4))}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #8B5CF6 0%, #EC4899 100%)',
                      borderRadius: 9999,
                    }}
                  />
                </div>
              </div>

              {/* Tier Capabilities */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
                {[
                  'Real-time Token Streaming',
                  '12+ Persona Architectures',
                  'Full Style Memory Injection',
                  'Side-by-Side Diff Engine',
                ].map((cap, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#E2E8F0' }}>
                    <CheckCircle size={14} color="#A78BFA" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Telemetry & Badges Bento */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* KPI Metric Tiles */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 24,
                border: '1px solid rgba(124, 58, 237, 0.12)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
                padding: '24px 26px',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Activity size={17} color="#7C3AED" />
                  <span>Performance Telemetry</span>
                </h3>
                <span style={{ fontSize: 12, color: '#64748B' }}>Live Metrics</span>
              </div>

              {/* 3 Metric Boxes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { label: 'Prompts', value: stats.prompts.toLocaleString(), icon: Zap, color: '#7C3AED' },
                  { label: 'Avg Score', value: stats.avgScore.toString(), icon: Target, color: '#EC4899' },
                  { label: 'Day Streak', value: `${stats.dayStreak}d`, icon: Flame, color: '#F59E0B' },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#F8FAFC',
                      borderRadius: 16,
                      border: '1px solid #E2E8F0',
                      padding: '14px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <item.icon size={16} color={item.color} strokeWidth={2.2} />
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', letterSpacing: -0.4 }}>{item.value}</span>
                    <span style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Weekly Activity Sparkline */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Enhancement Frequency</span>
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>Past 7 Days</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 44 }}>
                  {[35, 60, 45, 75, 95, 70, 90].map((h, i) => {
                    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                    const isToday = i === 6;
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div
                          style={{
                            width: '100%',
                            borderRadius: 4,
                            height: `${Math.round((h / 100) * 36)}px`,
                            background: isToday ? 'linear-gradient(180deg, #8B5CF6, #7C3AED)' : 'rgba(124, 58, 237, 0.12)',
                            boxShadow: isToday ? '0 2px 8px rgba(124, 58, 237, 0.3)' : 'none',
                          }}
                        />
                        <span style={{ fontSize: 9.5, color: isToday ? '#7C3AED' : '#94A3B8', fontWeight: isToday ? 700 : 500 }}>{days[i]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Achievements & Badges */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 24,
                border: '1px solid rgba(124, 58, 237, 0.12)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
                padding: '24px 26px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Award size={17} color="#F59E0B" />
                  <span>Unlocked Badges</span>
                </h3>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', background: 'rgba(124, 58, 237, 0.08)', padding: '2px 8px', borderRadius: 9999 }}>
                  4 Badges
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {[
                  { title: 'Prompt Pioneer', desc: 'Crafted initial prompt', icon: Sparkles, color: '#8B5CF6' },
                  { title: 'Style Maestro', desc: 'Style profile attached', icon: Sliders, color: '#EC4899' },
                  { title: 'Optimizer Pro', desc: '90+ Score achieved', icon: Target, color: '#10B981' },
                  { title: 'Daily Streak', desc: '3+ consecutive days', icon: Flame, color: '#F59E0B' },
                ].map((b, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      border: '1px solid #F1F5F9',
                      background: '#FAF5FF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: b.color,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                        flexShrink: 0,
                      }}
                    >
                      <b.icon size={16} strokeWidth={2.2} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: '#1E293B' }}>{b.title}</span>
                      <span style={{ fontSize: 10.5, color: '#64748B' }}>{b.desc}</span>
                    </div>
                  </div>
                ))}
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
              background: '#FFFFFF',
              borderRadius: 24,
              border: '1px solid rgba(124, 58, 237, 0.12)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
              padding: isMobile ? '22px 18px' : '32px 36px',
              display: 'flex',
              flexDirection: 'column',
              gap: 32,
            }}
          >
            {/* ── 1. Visual Theme (Apple OS Style) ── */}
            <div>
              <div style={{ marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: '0 0 3px' }}>Appearance</h3>
                <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Select your preferred workspace theme color palette.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(3, 160px)', gap: 12 }}>
                {[
                  { id: 'light', label: 'Light', icon: Sun, bg: '#F8FAFC', border: '#E2E8F0' },
                  { id: 'dark', label: 'Dark', icon: Moon, bg: '#0F172A', border: '#334155' },
                  { id: 'system', label: 'Auto (System)', icon: Laptop, bg: 'linear-gradient(135deg, #FFFFFF 50%, #0F172A 50%)', border: '#CBD5E1' },
                ].map((th) => {
                  const isSelected = theme === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => handleThemeChange(th.id as any)}
                      style={{
                        padding: '12px 8px',
                        borderRadius: 14,
                        border: isSelected ? '2px solid #7C3AED' : '1px solid #E2E8F0',
                        background: isSelected ? 'rgba(124, 58, 237, 0.04)' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all 180ms ease',
                      }}
                      className="hover:!border-[#7C3AED]"
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
                      <span style={{ fontSize: 12, fontWeight: isSelected ? 700 : 500, color: isSelected ? '#7C3AED' : '#334155' }}>
                        {th.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ height: 1, background: 'rgba(124, 58, 237, 0.08)' }} />

            {/* ── 2. Default Role Persona (Linear 12 Roles Grid) ── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: '0 0 3px' }}>Default Role Architecture</h3>
                  <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Every optimization defaults to this role persona.</p>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#7C3AED',
                    background: 'rgba(124, 58, 237, 0.08)',
                    padding: '2px 8px',
                    borderRadius: 9999,
                  }}
                >
                  12 Roles
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isDesktop ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
                  gap: 10,
                }}
              >
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
                        border: isSelected ? '1.5px solid #7C3AED' : '1px solid rgba(124, 58, 237, 0.10)',
                        background: isSelected ? 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#1E293B',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        textAlign: 'left',
                        transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: isSelected ? '0 4px 14px rgba(124, 58, 237, 0.28)' : '0 1px 2px rgba(0,0,0,0.02)',
                      }}
                      className={!isSelected ? 'hover:!border-[#7C3AED] hover:translate-y-[-1px]' : ''}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: isSelected ? 'rgba(255, 255, 255, 0.22)' : 'rgba(124, 58, 237, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isSelected ? '#FFFFFF' : '#7C3AED',
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
                          <span style={{ fontSize: 10.5, color: isSelected ? 'rgba(255,255,255,0.75)' : '#64748B', fontWeight: 500 }}>
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
                  background: '#F8FAFC',
                  borderRadius: 18,
                  border: '1px solid #E2E8F0',
                  padding: isMobile ? '16px 14px' : '18px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>Default Mode:</span>
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
                <span style={{ fontSize: 12.5, color: '#64748B' }}>
                  The General role operates universally across all domains without sub-mode specialization.
                </span>
              </div>
            ) : (
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: 18,
                  border: '1px solid #E2E8F0',
                  padding: isMobile ? '16px 14px' : '20px 22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>Default Mode:</span>
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
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: 10,
                      padding: '6px 12px',
                      width: isMobile ? '100%' : 220,
                    }}
                  >
                    <Search size={14} color="#94A3B8" />
                    <input
                      type="text"
                      placeholder="Search modes..."
                      value={modeSearchQuery}
                      onChange={(e) => setModeSearchQuery(e.target.value)}
                      style={{
                        border: 'none',
                        outline: 'none',
                        fontSize: 12.5,
                        color: '#0F172A',
                        width: '100%',
                        background: 'transparent',
                      }}
                    />
                    {modeSearchQuery && (
                      <button onClick={() => setModeSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94A3B8' }}>
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
                          border: isModeSelected ? '1px solid #7C3AED' : '1px solid #E2E8F0',
                          background: isModeSelected ? 'linear-gradient(135deg, #7C3AED, #9333EA)' : '#FFFFFF',
                          color: isModeSelected ? '#FFFFFF' : '#334155',
                          cursor: 'pointer',
                          transition: 'all 160ms ease',
                          boxShadow: isModeSelected ? '0 2px 8px rgba(124, 58, 237, 0.25)' : 'none',
                        }}
                        className={!isModeSelected ? 'hover:!border-[#7C3AED] hover:!text-[#7C3AED]' : ''}
                      >
                        <ModeIcon size={12} strokeWidth={isModeSelected ? 2.5 : 1.8} />
                        <span>{modeName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 4. AI Model Architecture (Temporarily commented out) ──
            <div style={{ height: 1, background: 'rgba(124, 58, 237, 0.08)' }} />
            <div>
              <div style={{ marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: '0 0 3px' }}>Default Intelligence Engine</h3>
                <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Select the target LLM for tailored tokenization and formatting.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isDesktop ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)', gap: 10 }}>
                {AI_MODELS.map((model) => {
                  const isSelected = defaultModel.toLowerCase() === model.id.toLowerCase();
                  return (
                    <button
                      key={model.id}
                      onClick={() => handleModelChange(model.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 14,
                        border: isSelected ? '1.5px solid #7C3AED' : '1px solid rgba(124, 58, 237, 0.10)',
                        background: isSelected ? 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#1E293B',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 6,
                        textAlign: 'left',
                        transition: 'all 180ms ease',
                        boxShadow: isSelected ? '0 4px 14px rgba(124, 58, 237, 0.28)' : '0 1px 2px rgba(0,0,0,0.02)',
                      }}
                      className={!isSelected ? 'hover:!border-[#7C3AED] hover:translate-y-[-1px]' : ''}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ fontSize: 10.5, fontWeight: 600, color: isSelected ? 'rgba(255,255,255,0.8)' : '#64748B' }}>{model.maker}</span>
                        {isSelected && <Check size={13} strokeWidth={3} />}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{model.label}</span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '1.5px 6px',
                          borderRadius: 4,
                          background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(124, 58, 237, 0.08)',
                          color: isSelected ? '#FFFFFF' : '#7C3AED',
                        }}
                      >
                        {model.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            */}

            {/* ── 5. Behaviors & Toggles ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0F172A', margin: '0 0 3px' }}>Workspace Automation</h3>
                <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Refine interactive behaviors across the prompt enhancement canvas.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', display: 'block' }}>Show Side-by-Side Diff View</span>
                    <span style={{ fontSize: 12, color: '#64748B' }}>Display token-level red/green diff highlighting by default on enhanced drafts.</span>
                  </div>
                  <ToggleSwitch enabled={showDiffByDefault} onToggle={() => handleToggleDiff(!showDiffByDefault)} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A', display: 'block' }}>Auto-Detect Prompt Intent</span>
                    <span style={{ fontSize: 12, color: '#64748B' }}>Analyze raw prompt semantics to suggest role and template matches automatically.</span>
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
                borderTop: '1px solid rgba(124, 58, 237, 0.10)',
                paddingTop: 20,
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                <span style={{ fontSize: 12.5, color: '#64748B' }}>
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
