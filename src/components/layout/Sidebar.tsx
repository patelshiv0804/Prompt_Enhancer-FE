'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles, LayoutTemplate, Library, Fingerprint,
  Settings, User, Clock,
  Code2, Search, Film, PlaySquare, Image as ImageIcon,
  Megaphone, BookOpen, Mail, Star, ChevronDown, ChevronRight,
  LogOut, Trash2, PanelLeftClose, PanelLeftOpen, Menu, X,
} from 'lucide-react';
import { fetchHistory, deleteHistoryItem } from '@/features/history/services/historyService';
import ScoreSpinner from '@/components/ScoreSpinner';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export type ActivePage = 'optimizer' | 'templates' | 'vault' | 'style-memory' | 'chaining' | 'settings' | 'chat';

interface NavItem { id: ActivePage; icon: React.ElementType; label: string; shortcut?: string; }
interface NavGroup { label: string; items: NavItem[]; }

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { id: 'optimizer', icon: Sparkles, label: 'Optimizer', shortcut: '⌘1' },
      { id: 'templates', icon: LayoutTemplate, label: 'Templates', shortcut: '⌘2' },
      { id: 'vault', icon: Library, label: 'Vault', shortcut: '⌘3' },
    ],
  },
  {
    label: 'Personalize',
    items: [
      { id: 'style-memory', icon: Fingerprint, label: 'Style Memory' },
      { id: 'settings', icon: Settings, label: 'Settings' },
    ],
  },
];

const SIDEBAR_HISTORY_ICONS: Record<string, React.ElementType> = {
  coding: Code2, research: Search, marketing: Megaphone,
  storytelling: BookOpen, 'image-gen': ImageIcon, cinematic: Film,
  youtube: PlaySquare, general: Sparkles, email: Mail,
};
const SIDEBAR_HISTORY_ACCENTS: Record<string, string> = {
  coding: '#0EA5E9', research: '#8B5CF6', marketing: '#10B981',
  storytelling: '#F59E0B', 'image-gen': '#EC4899', cinematic: '#8B5CF6',
  youtube: '#EF4444', general: '#7C3AED', email: '#0EA5E9',
};

const SIDEBAR_STORAGE_KEY = 'aure_sidebar_collapsed';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  // Collapse state
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  // Mobile drawer state — below 768px the sidebar becomes an off-canvas drawer.
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // On mobile the drawer always shows the full (expanded) nav — the 56px rail is desktop-only.
  const showCollapsed = isCollapsed && !isMobile;
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [recentCollapsed, setRecentCollapsed] = useState(false);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<{ id: string; prompt: string } | null>(null);
  const [showRecentFlyout, setShowRecentFlyout] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Tooltip hover state for collapsed mode
  const [activeTooltip, setActiveTooltip] = useState<{ text: string; shortcut?: string; top: number } | null>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);

  // Initialize collapse preference from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (stored !== null) {
        setIsCollapsed(stored === 'true');
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // Ignore
      }
      return next;
    });
    setShowRecentFlyout(false);
    setActiveTooltip(null);
  }, []);

  // Keyboard shortcut listener (⌘B / Ctrl+B to toggle sidebar, ⌘1-3 for nav)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof window !== 'undefined' && navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      
      const target = e.target as HTMLElement;
      const isInput = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      );

      if (modifier && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      if (modifier && !isInput) {
        if (e.key === '1') {
          e.preventDefault();
          router.push('/dashboard/optimizer');
        } else if (e.key === '2') {
          e.preventDefault();
          router.push('/dashboard/templates');
        } else if (e.key === '3') {
          e.preventDefault();
          router.push('/dashboard/vault');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, router]);

  // Click outside to close recent flyout in collapsed mode
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target as Node)) {
        setShowRecentFlyout(false);
      }
    };
    if (showRecentFlyout) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showRecentFlyout]);

  const loadRecentItems = useCallback(() => {
    fetchHistory(1, 8, { search: '', category: 'all', sortBy: 'most-recent' }).then(res => {
      const formatted = (res?.items || []).map(item => ({
        id: item.id,
        prompt: item.prompt,
        category: item.category || 'general',
        score: item.score,
        isFavorite: item.isFavorite,
        ago: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'
      }));
      setRecentItems(formatted);
    }).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    loadRecentItems();

    const handleHistoryUpdate = () => {
      loadRecentItems();
    };

    window.addEventListener('promptiq:history-updated', handleHistoryUpdate);
    return () => window.removeEventListener('promptiq:history-updated', handleHistoryUpdate);
  }, [loadRecentItems]);

  // Score polling
  const pollAttemptsRef = useRef(0);
  const hasPendingScores = recentItems.some(item => item.score == null);
  useEffect(() => {
    if (!hasPendingScores) {
      pollAttemptsRef.current = 0;
      return;
    }
    const timer = setInterval(() => {
      pollAttemptsRef.current += 1;
      loadRecentItems();
      if (pollAttemptsRef.current >= 12) clearInterval(timer);
    }, 3000);
    return () => clearInterval(timer);
  }, [hasPendingScores, loadRecentItems]);

  const toggleGroup = (label: string) =>
    setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }));

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const navigate = (page: ActivePage) => {
    setShowRecentFlyout(false);
    setActiveTooltip(null);
    setIsMobileOpen(false);
    router.push(`/dashboard/${page}`);
  };

  const isActive = (page: ActivePage) => pathname === `/dashboard/${page}` || (page === 'optimizer' && pathname === '/dashboard');

  const handleMouseEnterIcon = (e: React.MouseEvent, text: string, shortcut?: string) => {
    if (!showCollapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveTooltip({
      text,
      shortcut,
      top: rect.top + rect.height / 2,
    });
  };

  const handleMouseLeaveIcon = () => {
    setActiveTooltip(null);
  };

  return (
    <>
      <aside
        id="aure-dashboard-sidebar"
        aria-label="Main navigation"
        style={{
          width: showCollapsed ? 56 : 240,
          height: isMobile ? '100vh' : 'calc(100vh - 24px)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: isMobile ? 'fixed' : 'relative',
          left: isMobile ? 0 : undefined,
          top: isMobile ? 0 : undefined,
          zIndex: isMobile ? 1000 : 100,
          margin: isMobile ? 0 : 12,
          borderRadius: isMobile ? 0 : 16,
          overflow: 'hidden',
          background: 'rgba(250, 248, 255, 0.88)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          border: '1px solid rgba(139, 92, 246, 0.10)',
          boxShadow: isMobile
            ? '0 8px 40px rgba(15,23,42,0.20)'
            : '0 2px 20px rgba(109,40,217,0.06), 0 1px 3px rgba(0,0,0,0.03)',
          transform: isMobile ? (isMobileOpen ? 'translateX(0)' : 'translateX(-100%)') : undefined,
          transition: isMobile
            ? 'transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1)'
            : 'width 220ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {/* Header / Logo bar */}
        <div
          style={{
            padding: showCollapsed ? '14px 8px 12px' : '14px 14px 12px 16px',
            flexShrink: 0,
            borderBottom: '1px solid rgba(124,58,237,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: showCollapsed ? 'center' : 'space-between',
          }}
        >
          {showCollapsed ? (
            /* Collapsed Header: Aure Logo that reveals Sidebar expand icon on hover (ChatGPT style) */
            <button
              id="sidebar-expand-top-btn"
              onClick={toggleSidebar}
              onMouseEnter={(e) => handleMouseEnterIcon(e, 'Open sidebar', '⌘B')}
              onMouseLeave={handleMouseLeaveIcon}
              title="Open sidebar (⌘B)"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                color: 'rgba(45,27,105,0.75)',
                cursor: 'pointer',
                position: 'relative',
              }}
              className="group/toplogo aure-rail-btn"
            >
              {/* Default state: AURE Logo */}
              <div
                style={{
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'opacity 140ms ease, transform 140ms ease',
                  pointerEvents: 'none',
                }}
                className="group-hover/toplogo:opacity-0 group-hover/toplogo:scale-75 opacity-100 scale-100"
              >
                <img
                  src="/logo_1.svg"
                  alt="Aure Logo"
                  style={{ width: 22, height: 22, borderRadius: 6, objectFit: 'contain' }}
                />
              </div>

              {/* Hover state: Sidebar Expand Icon */}
              <div
                style={{
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4C1D95',
                  transition: 'opacity 140ms ease, transform 140ms ease',
                  pointerEvents: 'none',
                }}
                className="group-hover/toplogo:opacity-100 group-hover/toplogo:scale-100 opacity-0 scale-75"
              >
                <PanelLeftOpen size={18} strokeWidth={1.8} />
              </div>
            </button>
          ) : (
            /* Expanded Header: Logo + Brand + Collapse button (ChatGPT style) */
            <>
              <div
                onClick={() => router.push('/dashboard/optimizer')}
                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                title="Aure Optimizer"
              >
                <img
                  src="/logo_1.svg"
                  alt="Logo"
                  style={{ width: 22, height: 22, borderRadius: 6, objectFit: 'contain' }}
                />
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 750,
                    color: '#2D1B69',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}
                >
                  AURE
                </span>
              </div>

              <button
                id="sidebar-collapse-btn"
                onClick={isMobile ? () => setIsMobileOpen(false) : toggleSidebar}
                title={isMobile ? 'Close menu' : 'Close sidebar (⌘B)'}
                aria-label={isMobile ? 'Close menu' : 'Close sidebar'}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'transparent',
                  color: 'rgba(45,27,105,0.55)',
                  cursor: 'pointer',
                }}
                className="aure-soft-btn hover:!text-[#4C1D95]"
              >
                {isMobile
                  ? <X size={18} strokeWidth={1.9} />
                  : <PanelLeftClose size={17} strokeWidth={1.75} />}
              </button>
            </>
          )}
        </div>

        {/* Mobile View Only: Top Profile & Logout card */}
        {isMobile && (
          <div
            style={{
              margin: '8px 10px 4px',
              padding: '8px 10px',
              background: 'rgba(124, 58, 237, 0.06)',
              border: '1px solid rgba(124, 58, 237, 0.14)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              flexShrink: 0,
            }}
          >
            <button
              id="mobile-user-profile-btn"
              onClick={() => {
                setIsMobileOpen(false);
                router.push('/dashboard/profile');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                border: 'none',
                padding: 0,
                minWidth: 0,
                flex: 1,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  background: '#2D1B69',
                  color: '#FFFFFF',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                  boxShadow: '0 2px 6px rgba(45,27,105,0.25)',
                }}
              >
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name || user.email || 'User avatar'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 700 }}>
                    {(user?.display_name || user?.email || 'A').slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, flex: 1 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#2D1B69',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.display_name || user?.email || 'Dev Patel'}
                </span>
                <span
                  style={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#7C3AED',
                    letterSpacing: '0.4px',
                  }}
                >
                  {user?.plan || 'Free'} Plan
                </span>
              </div>
            </button>

            <button
              id="mobile-logout-btn"
              onClick={() => setShowLogoutConfirm(true)}
              title="Log out"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '5px 9px',
                borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.18)',
                color: '#DC2626',
                fontSize: 11.5,
                fontWeight: 600,
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 150ms ease',
              }}
              className="active:scale-95 hover:!bg-[rgba(239,68,68,0.15)]"
            >
              <LogOut size={12} strokeWidth={2} />
              <span>Logout</span>
            </button>
          </div>
        )}

        {/* Scrollable body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: showCollapsed ? '8px 6px' : '10px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: showCollapsed ? 4 : 2,
            scrollbarWidth: 'none',
          }}
        >
          {showCollapsed ? (
            /* COLLAPSED VIEW: Minimalist Clean Icon Rail (Matching ChatGPT Image 2) */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              {NAV_GROUPS.map((group, groupIdx) => (
                <React.Fragment key={group.label}>
                  {groupIdx > 0 && (
                    <div
                      style={{
                        width: 24,
                        height: 1,
                        background: 'rgba(124,58,237,0.08)',
                        margin: '3px 0',
                      }}
                    />
                  )}
                  {group.items.map(item => {
                    const Icon = item.icon;
                    const active = isActive(item.id);
                    return (
                      <button
                        key={item.id}
                        id={`nav-collapsed-${item.id}`}
                        onClick={() => navigate(item.id)}
                        onMouseEnter={(e) => handleMouseEnterIcon(e, item.label, item.shortcut)}
                        onMouseLeave={handleMouseLeaveIcon}
                        aria-label={item.label}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          border: 'none',
                          background: active ? 'rgba(124,58,237,0.10)' : 'transparent',
                          color: active ? '#7C3AED' : 'rgba(45,27,105,0.70)',
                        }}
                        className={`aure-rail-btn ${active ? 'is-active' : ''}`}
                      >
                        <Icon size={18} strokeWidth={active ? 2.1 : 1.75} />
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}

              {/* History / Recent Quick Icon in Collapsed Mode */}
              <div
                style={{
                  width: 24,
                  height: 1,
                  background: 'rgba(124,58,237,0.08)',
                  margin: '3px 0',
                }}
              />

              <div style={{ position: 'relative' }} ref={flyoutRef}>
                <button
                  id="nav-collapsed-recent"
                  onClick={() => setShowRecentFlyout(prev => !prev)}
                  onMouseEnter={(e) => handleMouseEnterIcon(e, 'Recent Chats', 'Click to view')}
                  onMouseLeave={handleMouseLeaveIcon}
                  aria-label="Recent Chats"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: 'none',
                    background: showRecentFlyout ? 'rgba(124,58,237,0.10)' : 'transparent',
                    color: showRecentFlyout ? '#7C3AED' : 'rgba(45,27,105,0.70)',
                  }}
                  className={`aure-rail-btn ${showRecentFlyout ? 'is-active' : ''}`}
                >
                  <Clock size={18} strokeWidth={1.75} />
                </button>

                {/* Collapsed Recent Flyout Menu */}
                {showRecentFlyout && (
                  <div
                    style={{
                      position: 'fixed',
                      left: 74,
                      top: 150,
                      width: 260,
                      maxHeight: 'calc(100vh - 180px)',
                      borderRadius: 12,
                      background: '#FFFFFF',
                      border: '1px solid rgba(124,58,237,0.12)',
                      boxShadow: '0 16px 36px rgba(109,40,217,0.12), 0 3px 10px rgba(0,0,0,0.05)',
                      zIndex: 9999,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      animation: 'dropdownFadeIn 140ms ease-out',
                    }}
                  >
                    <div
                      style={{
                        padding: '10px 12px 8px',
                        borderBottom: '1px solid rgba(124,58,237,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'rgba(248, 245, 255, 0.5)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.6px',
                          color: 'rgba(45,27,105,0.50)',
                        }}
                      >
                        Recent Prompts
                      </span>
                      <button
                        onClick={() => {
                          setShowRecentFlyout(false);
                          router.push('/dashboard/vault');
                        }}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#6D28D9',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                        className="hover:underline"
                      >
                        View all
                      </button>
                    </div>

                    <div
                      style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                      }}
                    >
                      {recentItems.length === 0 ? (
                        <div style={{ padding: '20px 10px', textAlign: 'center', fontSize: 12, color: '#64748B' }}>
                          No recent prompts
                        </div>
                      ) : (
                        recentItems.map(item => {
                          const Icon = SIDEBAR_HISTORY_ICONS[item.category] || Clock;
                          const accent = SIDEBAR_HISTORY_ACCENTS[item.category] || '#7C3AED';
                          const active = pathname === `/dashboard/chat/${item.id}`;
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                setShowRecentFlyout(false);
                                router.push(`/dashboard/chat/${item.id}`);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '6px 8px',
                                borderRadius: 6,
                                background: active ? 'rgba(124,58,237,0.08)' : 'transparent',
                                cursor: 'pointer',
                                transition: 'background 120ms ease',
                              }}
                              className="hover:bg-[rgba(124,58,237,0.05)]"
                            >
                              <Icon size={13} color={accent} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                              <p
                                style={{
                                  fontSize: 12.5,
                                  fontWeight: active ? 600 : 450,
                                  color: active ? '#4C1D95' : 'rgba(45,27,105,0.85)',
                                  margin: 0,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  flex: 1,
                                }}
                              >
                                {item.prompt}
                              </p>
                              {item.score != null && (
                                <span style={{ fontSize: 10, fontWeight: 600, color: accent }}>{item.score}</span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* EXPANDED VIEW: Clean ChatGPT style typography and icons (Matching Image 1) */
            <>
              {/* Nav Groups */}
              {NAV_GROUPS.map(group => {
                const isGroupCollapsed = !!collapsedGroups[group.label];
                return (
                  <div key={group.label} style={{ display: 'flex', flexDirection: 'column', marginBottom: 6 }}>
                    <button
                      onClick={() => toggleGroup(group.label)}
                      aria-expanded={!isGroupCollapsed}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px',
                        borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer',
                        width: '100%', textAlign: 'left', marginBottom: 1,
                      }}
                      className="aure-soft-btn"
                    >
                      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'capitalize', letterSpacing: '0.2px', color: 'rgba(45,27,105,0.45)', flex: 1 }}>
                        {group.label}
                      </span>
                      {isGroupCollapsed
                        ? <ChevronRight size={11} style={{ color: 'rgba(109,40,217,0.30)', flexShrink: 0 }} />
                        : <ChevronDown size={11} style={{ color: 'rgba(109,40,217,0.30)', flexShrink: 0 }} />
                      }
                    </button>

                    {!isGroupCollapsed && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {group.items.map(item => {
                          const Icon = item.icon;
                          const active = isActive(item.id);
                          return (
                            <button
                              key={item.id}
                              id={`nav-${item.id}`}
                              onClick={() => navigate(item.id)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 9, padding: '7px 8px',
                                borderRadius: 8, fontSize: 13.5, fontWeight: active ? 600 : 450,
                                cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left',
                                color: active ? '#4C1D95' : 'rgba(45,27,105,0.78)',
                                background: active ? 'rgba(124,58,237,0.09)' : 'transparent',
                              }}
                              className={`aure-nav-item ${active ? 'is-active' : ''}`}
                            >
                              <Icon className="aure-nav-icon" size={17} strokeWidth={active ? 2 : 1.75} style={{ color: active ? '#7C3AED' : 'rgba(109,40,217,0.55)', flexShrink: 0 }} />
                              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.label}
                              </span>
                              {item.shortcut && (
                                <span
                                  className="aure-nav-shortcut"
                                  style={{ fontSize: 10, fontWeight: 500, color: 'rgba(109,40,217,0.30)' }}
                                >
                                  {item.shortcut}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Section Divider */}
              <div style={{
                height: 1, margin: '4px 4px 6px', flexShrink: 0,
                background: 'rgba(124,58,237,0.07)',
              }} />

              {/* Recent History */}
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 4 }}>
                <div
                  role="button" tabIndex={0}
                  onClick={() => setRecentCollapsed(v => !v)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRecentCollapsed(v => !v); } }}
                  aria-expanded={!recentCollapsed}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '4px 6px',
                    borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer',
                    width: '100%', textAlign: 'left', marginBottom: 1,
                  }}
                  className="aure-soft-btn"
                >
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'capitalize', letterSpacing: '0.2px', color: 'rgba(45,27,105,0.45)', flex: 1 }}>Recent</span>
                  <button
                    id="sidebar-history-view-all"
                    onClick={e => { e.stopPropagation(); router.push('/dashboard/vault'); }}
                    style={{
                      fontSize: 10.5, fontWeight: 600, color: '#6D28D9', background: 'none', border: 'none',
                      cursor: 'pointer', padding: '1px 4px', borderRadius: 4, marginRight: 2,
                    }}
                    className="aure-soft-btn hover:!text-[#5B21B6]"
                  >View all</button>
                  {recentCollapsed
                    ? <ChevronRight size={11} style={{ color: 'rgba(109,40,217,0.30)', flexShrink: 0 }} />
                    : <ChevronDown size={11} style={{ color: 'rgba(109,40,217,0.30)', flexShrink: 0 }} />
                  }
                </div>

                {!recentCollapsed && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {recentItems.length === 0 ? (
                      <div
                        style={{
                          padding: '16px 8px',
                          textAlign: 'center',
                          fontSize: 12,
                          color: 'rgba(45,27,105,0.45)',
                        }}
                      >
                        No recent prompts.
                      </div>
                    ) : (
                      recentItems.map(item => {
                        const Icon = SIDEBAR_HISTORY_ICONS[item.category] || Clock;
                        const accent = SIDEBAR_HISTORY_ACCENTS[item.category] || '#7C3AED';
                        const active = pathname === `/dashboard/chat/${item.id}`;
                        return (
                          <div
                            key={item.id}
                            id={`sidebar-history-item-${item.id}`}
                            role="button"
                            tabIndex={0}
                            title={item.prompt}
                            onClick={() => router.push(`/dashboard/chat/${item.id}`)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                router.push(`/dashboard/chat/${item.id}`);
                              }
                            }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                              borderRadius: 8,
                              background: active ? 'rgba(124,58,237,0.09)' : 'transparent',
                              cursor: 'pointer', width: '100%', textAlign: 'left',
                              flexShrink: 0,
                            }}
                            className={`group/chatitem aure-recent-item ${active ? 'is-active' : ''}`}
                          >
                            <Icon size={14} color={accent} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, flex: 1 }}>
                              <p
                                style={{
                                  fontSize: 13, fontWeight: active ? 600 : 450,
                                  color: active ? '#4C1D95' : 'rgba(45,27,105,0.80)',
                                  margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3,
                                  flex: 1,
                                }}
                              >
                                {item.prompt}
                              </p>
                              {item.isFavorite && <Star size={9} fill="#F59E0B" color="#F59E0B" style={{ flexShrink: 0 }} />}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span
                                style={{
                                  fontSize: 10, fontWeight: 600, color: accent, opacity: 0.75,
                                  padding: '1px 3px', borderRadius: 4,
                                }}
                                className="group-hover/chatitem:hidden"
                              >
                                {item.score == null ? (
                                  <ScoreSpinner size={10} color={accent} />
                                ) : item.score}
                              </span>
                              <button
                                id={`sidebar-delete-btn-${item.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setChatToDelete({ id: item.id, prompt: item.prompt });
                                }}
                                title="Delete chat"
                                style={{
                                  display: 'none', alignItems: 'center', justifyContent: 'center',
                                  width: 18, height: 18, borderRadius: 4, border: 'none',
                                  cursor: 'pointer', background: 'rgba(239,68,68,0.10)', color: '#EF4444',
                                  transition: 'all 140ms ease', flexShrink: 0,
                                }}
                                className="group-hover/chatitem:!flex hover:!bg-[#EF4444] hover:!text-white"
                              >
                                <Trash2 size={11} strokeWidth={2} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer (Desktop & Tablet only — mobile profile is at the top) */}
        {!isMobile && (
          <div style={{ flexShrink: 0, padding: showCollapsed ? '0 6px 10px' : '0 8px 10px' }}>
            <div style={{ height: 1, background: 'rgba(124,58,237,0.06)', margin: '0 0 8px' }} />
            {showCollapsed ? (
              /* Collapsed Footer: Avatar circular button (Matching Image 2 SH avatar) */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <button
                  id="user-profile-collapsed-btn"
                  onClick={() => router.push('/dashboard/profile')}
                  onMouseEnter={(e) => handleMouseEnterIcon(e, user?.display_name || user?.email || 'Profile', user?.plan || 'Free')}
                  onMouseLeave={handleMouseLeaveIcon}
                  aria-label="Profile"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#2D1B69',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 260ms cubic-bezier(0.22, 1, 0.36, 1)',
                    overflow: 'hidden',
                  }}
                  className="hover:scale-105 hover:shadow-[0_6px_16px_rgba(45,27,105,0.28)]"
                >
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.display_name || user.email || 'User avatar'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.5px' }}>
                      {(user?.display_name || user?.email || 'A').slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </button>
              </div>
            ) : (
              /* Expanded Footer: User row + Logout (Matching Image 1) */
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 4px' }}>
                <button
                  id="user-profile-btn"
                  onClick={() => router.push('/dashboard/profile')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9, padding: '6px 8px',
                    borderRadius: 8, flex: 1, border: 'none',
                    background: 'transparent', textAlign: 'left',
                    minWidth: 0, cursor: 'pointer',
                  }}
                  className="aure-soft-btn"
                >
                  <div style={{
                    background: '#2D1B69', color: '#FFFFFF',
                    width: 28, height: 28, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, overflow: 'hidden',
                  }}>
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.display_name || user.email || 'User avatar'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: 10.5, fontWeight: 700 }}>
                        {(user?.display_name || user?.email || 'A').slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#2D1B69', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.display_name || user?.email || 'Dev Patel'}
                    </span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                      background: 'rgba(124,58,237,0.12)', color: '#7C3AED',
                      padding: '1px 6px', borderRadius: 4, flexShrink: 0,
                    }}>{user?.plan || 'Free'}</span>
                  </div>
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  title="Log out"
                  style={{
                    width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', background: 'transparent',
                    border: 'none', color: 'rgba(45,27,105,0.50)',
                    transition: 'all 200ms cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                  className="hover:!bg-[rgba(239,68,68,0.10)] hover:!text-[#DC2626]"
                >
                  <LogOut size={15} strokeWidth={1.8} />
                </button>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Mobile: floating hamburger to open the drawer (hidden while open) */}
      {isMobile && !isMobileOpen && (
        <button
          id="sidebar-mobile-toggle"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open navigation menu"
          style={{
            position: 'fixed',
            top: 12,
            left: 12,
            width: 40,
            height: 40,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(250, 248, 255, 0.92)',
            backdropFilter: 'blur(12px) saturate(160%)',
            WebkitBackdropFilter: 'blur(12px) saturate(160%)',
            border: '1px solid rgba(139, 92, 246, 0.18)',
            boxShadow: '0 4px 14px rgba(109,40,217,0.12)',
            color: '#4C1D95',
            cursor: 'pointer',
            zIndex: 998,
          }}
        >
          <Menu size={20} strokeWidth={1.9} />
        </button>
      )}

      {/* Mobile: backdrop behind the open drawer — tap to close */}
      {isMobile && isMobileOpen && (
        <div
          role="presentation"
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.40)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            zIndex: 999,
            animation: 'dropdownFadeIn 160ms ease-out',
          }}
        />
      )}

      {/* Floating Tooltip in Collapsed Mode */}
      {showCollapsed && activeTooltip && mounted && createPortal(
        <div
          style={{
            position: 'fixed',
            left: 74,
            top: activeTooltip.top,
            transform: 'translateY(-50%)',
            background: '#1A1033',
            color: '#F8F5FF',
            padding: '5px 9px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            pointerEvents: 'none',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(167, 139, 250, 0.20)',
            whiteSpace: 'nowrap',
            animation: 'dropdownFadeIn 120ms ease-out',
          }}
        >
          <span>{activeTooltip.text}</span>
          {activeTooltip.shortcut && (
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 600,
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#DDD6FE',
                padding: '1px 4px',
                borderRadius: 3,
              }}
            >
              {activeTooltip.shortcut}
            </span>
          )}
        </div>,
        document.body
      )}

      {/* Logout confirmation modal */}
      {showLogoutConfirm && mounted && createPortal(
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 99999,
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: 16, padding: '24px 28px',
            maxWidth: 340, width: '90%', border: '1px solid rgba(124,58,237,0.15)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.08)',
              color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto', border: '1px solid rgba(239, 68, 68, 0.15)'
            }}>
              <LogOut size={18} strokeWidth={2} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1E293B', margin: '0 0 6px' }}>Confirm Logout</h3>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0, lineHeight: 1.5 }}>Are you sure you want to log out of your account?</p>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid #E2E8F0',
                  background: '#FFFFFF', color: '#64748B', fontWeight: 600, fontSize: 13,
                  cursor: 'pointer', transition: 'all 160ms ease',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowLogoutConfirm(false); logout(); }}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', color: '#FFFFFF',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(124,58,237,0.25)',
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete chat confirmation modal */}
      {chatToDelete && mounted && createPortal(
        <div
          role="presentation"
          onClick={() => setChatToDelete(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={e => e.stopPropagation()}
            style={{
              width: 'min(100%, 440px)',
              borderRadius: 20,
              border: '1px solid rgba(124,58,237,0.12)',
              background: '#FFFFFF',
              boxShadow: '0 24px 80px rgba(15, 23, 42, 0.25)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              animation: 'dropdownFadeIn 180ms ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(124,58,237,0.10)',
                color: '#7C3AED',
              }}>
                <Trash2 size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary, #1A1033)' }}>
                  Delete prompt?
                </h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-secondary, #6B6B8A)' }}>
                  Do you want to permanently remove this prompt? This cannot be undone.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setChatToDelete(null)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: '1px solid rgba(124,58,237,0.14)',
                  background: '#FFFFFF',
                  color: 'var(--color-text-primary, #1A1033)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                className="hover:bg-[rgba(124,58,237,0.04)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const targetId = chatToDelete.id;
                  setChatToDelete(null);
                  await deleteHistoryItem(targetId);
                  if (pathname === `/dashboard/chat/${targetId}`) {
                    router.push('/dashboard/vault');
                  }
                }}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(239,68,68,0.28)',
                }}
                className="hover:brightness-105"
              >
                Delete prompt
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
