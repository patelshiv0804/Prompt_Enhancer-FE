'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Star, MoreHorizontal, FileText, Code2, PlaySquare, Mail, Film,
  Image as ImageIcon, ChevronLeft, ChevronRight, Megaphone, BookOpen,
  Sparkles, TrendingUp, SlidersHorizontal, ChevronDown, Zap, Clock,
  Trash2, ExternalLink, Copy, Library, CheckSquare,
} from 'lucide-react';
import { fetchHistory, fetchHistoryStats, toggleFavorite, deleteHistoryItems } from '@/features/history/services/historyService';
import type { HistoryItem, HistoryStats, SortBy } from '@/features/history/types/history.types';
import ScoreSpinner from '@/components/ScoreSpinner';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const PAGE_SIZE = 10;

const FILTER_CATEGORIES = [
  { id: 'all', label: 'All' }, { id: 'favorites', label: '★ Favorites' }, { id: 'general', label: 'General' },
  { id: 'coding', label: 'Coding' }, { id: 'research', label: 'Research' }, { id: 'marketing', label: 'Marketing' },
  { id: 'cinematic', label: 'Cinematic' }, { id: 'youtube', label: 'YouTube' }, { id: 'image-gen', label: 'Image Gen' },
];

const SORT_OPTIONS: { id: SortBy; label: string }[] = [
  { id: 'most-recent', label: 'Most Recent' }, { id: 'highest-score', label: 'Highest Score' },
  { id: 'lowest-score', label: 'Lowest Score' }, { id: 'oldest', label: 'Oldest' },
];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  coding: Code2, research: Search, marketing: Megaphone, storytelling: BookOpen,
  'image-gen': ImageIcon, cinematic: Film, youtube: PlaySquare, seo: TrendingUp, general: Sparkles, email: Mail,
};
const CATEGORY_ACCENTS: Record<string, string> = {
  coding: '#0EA5E9', research: '#8B5CF6', marketing: '#10B981', storytelling: '#F59E0B',
  'image-gen': '#EC4899', cinematic: '#8B5CF6', youtube: '#EF4444', seo: '#10B981', general: '#7C3AED', email: '#0EA5E9',
};

function timeAgo(isoString: string): string {
  const diff  = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7)   return `${days} days ago`;
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function scoreColor(score: number): string {
  if (score >= 90) return '#10B981';
  if (score >= 80) return '#7C3AED';
  if (score >= 65) return '#F59E0B';
  return '#EF4444';
}

type DeleteDialogState =
  | { open: false }
  | {
      open: true;
      mode: 'confirm' | 'error';
      ids?: string[];
      title: string;
      message: string;
      confirmLabel?: string;
    };

function useCountUp(target: number, active: boolean, duration = 1200): number {
  const [value, setValue] = useState(0);
  const prevTargetRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setValue(target);
      return;
    }
    const start = prevTargetRef.current;
    prevTargetRef.current = target;

    if (start === target) {
      setValue(target);
      return;
    }

    let current = start;
    const diff = target - start;
    const steps = duration / 16;
    const step = diff / steps;

    const timer = setInterval(() => {
      current += step;
      if ((diff > 0 && current >= target) || (diff < 0 && current <= target)) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.round(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, active, duration]);

  return value;
}

/* ── StatCard ── */
interface StatCardProps {
  label: string; value: number; suffix?: string; prefix?: string;
  icon: React.ElementType; accent: string; sub?: React.ReactNode; sparkline?: boolean; animate: boolean;
}

function StatCard({ label, value, suffix = '', prefix = '', icon: Icon, accent, sub, sparkline, animate }: StatCardProps) {
  const count = useCountUp(value, animate);
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid rgba(124,58,237,0.10)', borderRadius: 16, padding: '20px 24px',
      flex: '1 1 0', minWidth: 0, boxShadow: '0 4px 12px rgba(109,40,217,0.06), 0 1px 3px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column', gap: 8, transition: 'transform 250ms ease, box-shadow 250ms ease',
    }}
    className="hover:translate-y-[-2px] hover:shadow-[0_8px_24px_rgba(109,40,217,0.09),0_2px_6px_rgba(0,0,0,0.05)]"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.9px', color: 'var(--color-text-secondary)' }}>{label}</span>
        <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, background: `${accent}18` }}>
          <Icon size={14} strokeWidth={2} />
        </div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: accent, letterSpacing: -1, lineHeight: 1 }}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      {sub && <div style={{ marginTop: 4 }}>{sub}</div>}
      {sparkline && (
        <svg viewBox="0 0 90 28" preserveAspectRatio="none" style={{ width: '100%', height: 28, marginTop: 8 }}>
          <polyline points="0,24 12,20 22,22 34,12 46,16 58,8 70,10 80,5 90,3" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

/* ── VaultRow ── */
function VaultRow({ item, isSelectionMode, selected, onSelect, onToggleFavorite, onDelete, onOpenInOptimizer }: { item: HistoryItem; isSelectionMode: boolean; selected: boolean; onSelect: (id: string) => void; onToggleFavorite: (id: string, current: boolean) => void; onDelete: (id: string) => void; onOpenInOptimizer: (id: string) => void; }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const Icon    = CATEGORY_ICONS[item.category] || FileText;
  const accent  = CATEGORY_ACCENTS[item.category] || '#7C3AED';

  useEffect(() => {
    function close(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div id={`vault-row-${item.id}`} style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
      background: menuOpen ? 'rgba(124,58,237,0.04)' : selected ? 'rgba(124,58,237,0.03)' : '#FFFFFF',
      border: selected ? '1px solid rgba(124,58,237,0.25)' : '1px solid rgba(124,58,237,0.09)', borderRadius: 14,
      transition: 'background 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
      position: 'relative', cursor: 'pointer',
    }}
    className="hover:!bg-[rgba(124,58,237,0.03)] hover:shadow-[0_4px_16px_rgba(109,40,217,0.07)] hover:!border-[rgba(124,58,237,0.15)]"
    onClick={() => {
      if (isSelectionMode) {
        onSelect(item.id);
      } else {
        onOpenInOptimizer(item.id);
      }
    }}
    >
      {isSelectionMode && (
        <input
          id={`vault-select-${item.id}`}
          type="checkbox"
          checked={selected}
          aria-label={`Select ${item.prompt}`}
          onClick={event => event.stopPropagation()}
          onChange={() => onSelect(item.id)}
          style={{ width: 16, height: 16, accentColor: '#7C3AED', cursor: 'pointer', flexShrink: 0 }}
        />
      )}
      <div style={{ width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, background: `${accent}14`, border: `1px solid ${accent}22`, flexShrink: 0 }}>
        <Icon size={16} strokeWidth={1.6} />
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.prompt}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-secondary)' }}>
          <Clock size={11} strokeWidth={1.5} />
          <span>{timeAgo(item.createdAt)}</span>
          <span style={{ opacity: 0.3 }}>·</span>
          <span style={{ fontWeight: 500 }}>{item.targetModel}</span>
          <span style={{ opacity: 0.3 }}>·</span>
          <span style={{ fontWeight: 500 }}>{item.mode}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--color-text-secondary)', opacity: 0.6 }}>Score</span>
        {item.score == null ? (
          // Quality analysis still processing in the background — show a spinner
          // until the real score is persisted to and fetched from the DB.
          <ScoreSpinner size={18} />
        ) : (
          <span style={{ fontSize: 18, fontWeight: 800, lineHeight: 1, color: scoreColor(item.score) }}>{item.score}</span>
        )}
      </div>

      <button id={`star-btn-${item.id}`} onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id, item.isFavorite); }} title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'transparent', color: item.isFavorite ? '#F59E0B' : 'rgba(107,107,138,0.40)', transition: 'all 200ms ease', flexShrink: 0 }}
        className="hover:!bg-[rgba(245,158,11,0.10)] hover:!text-[#F59E0B] hover:scale-110"
      >
        <Star size={15} strokeWidth={item.isFavorite ? 0 : 1.5} fill={item.isFavorite ? 'currentColor' : 'none'} />
      </button>

      <button id={`delete-btn-${item.id}`} onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} title="Delete prompt"
        style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'transparent', color: 'rgba(239,68,68,0.60)', transition: 'all 200ms ease', flexShrink: 0 }}
        className="hover:!bg-[rgba(239,68,68,0.10)] hover:!text-[#EF4444] hover:scale-110"
      >
        <Trash2 size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}

/* ── Pagination ── */
function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (p: number) => void; }) {
  const pages: (number | '…')[] = [];
  if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i); }
  else {
    pages.push(1);
    if (currentPage > 3) pages.push('…');
    const start = Math.max(2, currentPage - 1);
    const end   = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      if (pages[pages.length - 1] !== i - 1 && pages[pages.length - 1] !== '…') pages.push('…');
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('…');
    if (pages[pages.length - 1] !== totalPages) pages.push(totalPages);
  }

  return (
    <div id="vault-pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 32 }}>
      <button id="pagination-prev-btn" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} title="Previous page"
        style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid rgba(124,58,237,0.12)', background: '#FFFFFF', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#CBD5E1' : '#7C3AED', opacity: currentPage === 1 ? 0.6 : 1 }}
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) => p === '…' ? (
        <span key={`dots-${i}`} style={{ padding: '0 8px', color: '#94A3B8' }}>…</span>
      ) : (
        <button key={p} id={`pagination-page-${p}`} onClick={() => onPageChange(p)}
          style={{
            width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: p === currentPage ? 700 : 500,
            background: p === currentPage ? 'linear-gradient(135deg, #7C3AED, #A855F7)' : 'transparent',
            color: p === currentPage ? 'white' : 'var(--color-text-secondary)',
          }}
          className={p !== currentPage ? 'hover:bg-[rgba(124,58,237,0.06)] hover:!text-[var(--color-primary)]' : ''}
        >{p}</button>
      ))}
      <button id="pagination-next-btn" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} title="Next page"
        style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid rgba(124,58,237,0.12)', background: '#FFFFFF', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', color: currentPage === totalPages ? '#CBD5E1' : '#7C3AED', opacity: currentPage === totalPages ? 0.6 : 1 }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default function VaultPage() {
  const router = useRouter();

  const [items,          setItems]          = useState<HistoryItem[]>([]);
  const [total,          setTotal]          = useState(0);
  const [currentPage,    setCurrentPage]    = useState(1);
  const [totalPages,     setTotalPages]     = useState(1);
  const [search,         setSearch]         = useState('');
  const [debSearch,      setDebSearch]      = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy,         setSortBy]         = useState<SortBy>('most-recent');
  const [showSort,       setShowSort]       = useState(false);
  const [loading,        setLoading]        = useState(true);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds,    setSelectedIds]    = useState<Set<string>>(new Set());
  const [deleting,       setDeleting]       = useState(false);
  const [deleteDialog,   setDeleteDialog]   = useState<DeleteDialogState>({ open: false });

  const [stats,          setStats]          = useState<HistoryStats | null>(null);
  const [statsAnimate,   setStatsAnimate]   = useState(false);
  const [statsLoading,   setStatsLoading]   = useState(true);

  const sortRef = useRef<HTMLDivElement>(null);

  /* Debounce search */
  useEffect(() => {
    const t = setTimeout(() => setDebSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  /* Reset page to 1 when search or filters change */
  useEffect(() => {
    setCurrentPage(1);
  }, [debSearch, activeCategory, sortBy]);

  /* If every prompt on the current page was deleted, the page index can end up
     past the last page that still has prompts — which renders a misleading
     "empty vault" even though earlier pages are full. Snap back to the last
     valid page so the user is never stranded on a page that no longer exists.
     Changing currentPage re-runs the loader below and fetches that page. */
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const load = useCallback(async (silent = false) => {
    // Silent refreshes (the pending-score poll) must not toggle the full-list
    // skeleton or clear the user's selection — they update rows in place.
    if (!silent) setLoading(true);
    try {
      const res = await fetchHistory(currentPage, PAGE_SIZE, { search: debSearch, category: activeCategory, sortBy });
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      if (!silent) setSelectedIds(new Set());
    } catch (e) {
      console.error(e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [currentPage, debSearch, activeCategory, sortBy]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handleHistoryUpdate = () => load();
    window.addEventListener('promptiq:history-updated', handleHistoryUpdate);
    return () => window.removeEventListener('promptiq:history-updated', handleHistoryUpdate);
  }, [load]);

  // Rows whose background analysis is still running arrive with score === null.
  // Poll until every score has been persisted so the loader resolves on its own
  // even when the user lands here directly (no optimizer poll driving refresh).
  const vaultPollAttemptsRef = useRef(0);
  const hasPendingScores = items.some(i => i.score == null);
  useEffect(() => {
    if (!hasPendingScores) {
      vaultPollAttemptsRef.current = 0;
      return;
    }
    const timer = setInterval(() => {
      vaultPollAttemptsRef.current += 1;
      load(true);
      if (vaultPollAttemptsRef.current >= 12) clearInterval(timer);
    }, 3000);
    return () => clearInterval(timer);
  }, [hasPendingScores, load]);

  useEffect(() => {
    fetchHistoryStats()
      .then(res => {
        setStats(res);
        setStatsAnimate(true);
      })
      .catch(e => console.error(e))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    function close(e: MouseEvent) { if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSort(false); }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleToggleFavorite = useCallback((id: string, current: boolean) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, isFavorite: !current } : i));
    toggleFavorite(id, !current);
    setStats(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        favoritesCount: Math.max(0, prev.favoritesCount + (current ? -1 : 1))
      };
    });
  }, []);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds(previous => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const executeDelete = useCallback(async (ids: string[]) => {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0 || deleting) return;

    setDeleting(true);
    try {
      const { deletedIds, failedIds } = await deleteHistoryItems(uniqueIds);
      const deleted = new Set(deletedIds);
      const deletedItems = items.filter(item => deleted.has(item.id));
      const deletedFavorites = deletedItems.filter(item => item.isFavorite).length;

      if (deletedIds.length > 0) {
        setItems(previous => previous.filter(item => !deleted.has(item.id)));
        setSelectedIds(previous => new Set([...previous].filter(id => !deleted.has(id))));
        setTotal(previous => Math.max(0, previous - deletedIds.length));
        setStats(previous => previous ? {
          ...previous,
          totalPrompts: Math.max(0, previous.totalPrompts - deletedIds.length),
          favoritesCount: Math.max(0, previous.favoritesCount - deletedFavorites),
        } : previous);
      }

      if (failedIds.length > 0) {
        setDeleteDialog({
          open: true,
          mode: 'error',
          title: 'Delete incomplete',
          message: `${failedIds.length} prompt${failedIds.length === 1 ? '' : 's'} could not be deleted. Please try again.`,
        });
      }
    } finally {
      setDeleting(false);
    }
  }, [deleting, items]);

  const requestDelete = useCallback((ids: string[]) => {
    const uniqueIds = [...new Set(ids)];
    if (uniqueIds.length === 0 || deleting) return;

    setDeleteDialog({
      open: true,
      mode: 'confirm',
      ids: uniqueIds,
      title: uniqueIds.length === 1 ? 'Delete prompt?' : `Delete ${uniqueIds.length} prompts?`,
      message: uniqueIds.length === 1
        ? 'Do you want to permanently remove this prompt? This cannot be undone.'
        : `Do you want to permanently remove these ${uniqueIds.length} prompts? This cannot be undone.`,
      confirmLabel: uniqueIds.length === 1 ? 'Delete prompt' : `Delete ${uniqueIds.length} prompts`,
    });
  }, [deleting]);

  const closeDeleteDialog = useCallback(() => {
    if (deleting) return;
    setDeleteDialog({ open: false });
  }, [deleting]);

  const confirmDeleteDialog = useCallback(async () => {
    if (!deleteDialog.open || deleteDialog.mode !== 'confirm' || !deleteDialog.ids?.length) return;
    const ids = deleteDialog.ids;
    setDeleteDialog({ open: false });
    await executeDelete(ids);
  }, [deleteDialog, executeDelete]);

  const activeSortLabel = SORT_OPTIONS.find(s => s.id === sortBy)?.label ?? 'Sort';
  const initialLoading  = statsLoading && stats === null;

  if (initialLoading) {
    return (
      <div id="vault-page-loading" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px', paddingTop: 8, width: '100%', display: 'flex', flexDirection: 'column', paddingBottom: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '32px 0 28px' }}>
          <div>
            <div className="skeleton" style={{ height: 24, width: 240, borderRadius: 8, marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 14, width: 360, borderRadius: 8 }} />
          </div>
          <div className="skeleton" style={{ height: 40, width: 130, borderRadius: 10 }} />
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ flex: '1 1 0', height: 116, borderRadius: 16 }} />
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div className="skeleton" style={{ height: 40, width: 260, borderRadius: 10 }} />
          <div className="skeleton" style={{ height: 34, width: 560, borderRadius: 9999 }} />
          <div className="skeleton" style={{ height: 38, width: 90, borderRadius: 10 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 72, borderRadius: 14 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id="vault-page" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 48px', paddingTop: 8, width: '100%', display: 'flex', flexDirection: 'column', paddingBottom: 64 }}>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Prompts" value={stats?.totalPrompts ?? 0} icon={Sparkles} accent="#7C3AED" animate={statsAnimate} />
        <StatCard label="Avg Score" value={stats?.averageScore ?? 0} suffix="%" icon={TrendingUp} accent="#10B981" animate={statsAnimate}
          sub={<div style={{ height: 4, background: 'rgba(16,185,129,0.12)', borderRadius: 99, overflow: 'hidden' }}><div style={{ height: '100%', background: '#10B981', borderRadius: 99, width: statsAnimate ? `${stats?.averageScore ?? 0}%` : '0%', transition: 'width 1.2s ease-out' }} /></div>}
        />
        <StatCard label="This Week" value={stats?.thisWeekDelta ?? 0} prefix="+" icon={Zap} accent="#0EA5E9" animate={statsAnimate} sparkline />
        <StatCard label="Favorites" value={stats?.favoritesCount ?? 0} icon={Star} accent="#F59E0B" animate={statsAnimate}
          sub={<button id="view-all-favorites-btn" onClick={() => setActiveCategory('favorites')} style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} className="hover:underline">View all →</button>}
        />
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '0 0 260px' }}>
          <Search size={14} strokeWidth={1.8} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', pointerEvents: 'none' }} />
          <input id="vault-search-input" type="text" placeholder="Search prompts..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '9px 36px 9px 36px', fontSize: 13, background: '#FFFFFF', border: '1px solid rgba(124,58,237,0.12)', borderRadius: 10, outline: 'none', color: 'var(--color-text-primary)', transition: 'border-color 200ms ease, box-shadow 200ms ease' }}
            className="focus:!border-[rgba(124,58,237,0.35)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.08)]"
          />
          {search && <button onClick={() => setSearch('')} title="Clear" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--color-text-secondary)', lineHeight: 1 }}>×</button>}
        </div>

        {/* Category chips */}
        <div id="vault-filter-chips" style={{ display: 'flex', gap: 6, overflowX: 'auto', flexWrap: 'nowrap', flex: 1, scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="no-scrollbar">
          {FILTER_CATEGORIES.map(cat => (
            <button key={cat.id} id={`filter-${cat.id}`} onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '6px 14px', borderRadius: 9999, fontSize: 12.5, fontWeight: 500, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap', transition: 'all 180ms ease',
                flexShrink: 0,
                background: activeCategory === cat.id ? 'linear-gradient(135deg, #7C3AED, #A855F7)' : 'rgba(124,58,237,0.06)',
                color: activeCategory === cat.id ? 'white' : 'var(--color-text-secondary)',
                boxShadow: activeCategory === cat.id ? '0 3px 10px rgba(124,58,237,0.25)' : 'none',
              }}
              className={activeCategory !== cat.id ? 'hover:!bg-[rgba(124,58,237,0.12)] hover:!text-[var(--color-text-primary)]' : ''}
            >{cat.label}</button>
          ))}
        </div>

        {/* Sort */}
        <div style={{ position: 'relative', flexShrink: 0 }} ref={sortRef}>
          <button id="sort-btn" onClick={() => setShowSort(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500, border: '1px solid rgba(124,58,237,0.12)', cursor: 'pointer', background: '#FFFFFF', color: 'var(--color-text-secondary)', transition: 'all 200ms ease' }}
            className="hover:!border-[rgba(124,58,237,0.22)] hover:!text-[var(--color-text-primary)]"
          >
            <SlidersHorizontal size={13} strokeWidth={2} />{activeSortLabel}
            <ChevronDown size={12} strokeWidth={2} style={{ transition: 'transform 200ms', transform: showSort ? 'rotate(180deg)' : 'none' }} />
          </button>
          {showSort && (
            <div id="sort-menu" style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#FFFFFF', border: '1px solid rgba(124,58,237,0.10)', borderRadius: 10, minWidth: 180, zIndex: 50, padding: 4, boxShadow: '0 8px 24px rgba(109,40,217,0.10)', animation: 'dropdownFadeIn 150ms ease' }}>
              {SORT_OPTIONS.map(opt => (
                <button key={opt.id} id={`sort-${opt.id}`} onClick={() => { setSortBy(opt.id); setShowSort(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', fontSize: 13, fontWeight: sortBy === opt.id ? 600 : 500, color: sortBy === opt.id ? 'var(--color-primary)' : 'var(--color-text-primary)', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', textAlign: 'left' }}
                  className="hover:bg-[rgba(124,58,237,0.05)]"
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', opacity: sortBy === opt.id ? 1 : 0, flexShrink: 0 }} />
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Select / Multiple Delete Mode Toggle Button */}
        <button id="vault-toggle-select-btn" onClick={() => { setIsSelectionMode(v => !v); setSelectedIds(new Set()); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
            border: isSelectionMode ? '1px solid rgba(124,58,237,0.30)' : '1px solid rgba(124,58,237,0.12)', cursor: 'pointer',
            background: isSelectionMode ? 'rgba(124,58,237,0.08)' : '#FFFFFF',
            color: isSelectionMode ? 'var(--color-primary)' : 'var(--color-text-secondary)', transition: 'all 200ms ease', flexShrink: 0,
          }}
          className="hover:!border-[rgba(124,58,237,0.22)] hover:!text-[var(--color-text-primary)]"
        >
          <CheckSquare size={13} strokeWidth={2} />{isSelectionMode ? 'Cancel Select' : 'Select'}
        </button>
      </div>

      {/* Selection action bar (rendered ONLY in selection mode) */}
      {isSelectionMode && items.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '10px 16px', background: 'rgba(124,58,237,0.04)', borderRadius: 12, border: '1px solid rgba(124,58,237,0.10)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--color-text-primary)', fontWeight: 600, cursor: 'pointer' }}>
            <input
              id="vault-select-all"
              type="checkbox"
              checked={items.length > 0 && items.every(item => selectedIds.has(item.id))}
              onChange={() => setSelectedIds(previous => items.every(item => previous.has(item.id)) ? new Set() : new Set(items.map(item => item.id)))}
              style={{ width: 16, height: 16, accentColor: '#7C3AED', cursor: 'pointer' }}
            />
            Select all on this page
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {selectedIds.size > 0 && (
              <button id="vault-delete-selected" onClick={() => requestDelete([...selectedIds])} disabled={deleting}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', background: '#EF4444', color: '#FFFFFF', cursor: deleting ? 'not-allowed' : 'pointer', fontSize: 12.5, fontWeight: 600, opacity: deleting ? 0.65 : 1, transition: 'all 180ms ease' }}
              >
                <Trash2 size={13} />Delete selected ({selectedIds.size})
              </button>
            )}
            <button
              onClick={() => { setIsSelectionMode(false); setSelectedIds(new Set()); }}
              style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(124,58,237,0.15)', background: '#FFFFFF', color: 'var(--color-text-secondary)', fontSize: 12.5, fontWeight: 500, cursor: 'pointer' }}
              className="hover:!text-[var(--color-text-primary)]"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div id="vault-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* An empty page while total > 0 means the current page fell out of range
            after a delete; the effect above is already snapping back to a valid
            page, so keep showing skeletons instead of flashing the empty state. */}
        {loading || (items.length === 0 && total > 0) ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', borderRadius: 14, border: '1px solid rgba(124,58,237,0.09)' }}>
              <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 10 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton" style={{ height: 16, width: '60%' }} />
                <div className="skeleton" style={{ height: 12, width: '40%' }} />
              </div>
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 8 }} />
            </div>
          ))
        ) : items.length === 0 ? (
          <div id="vault-empty-state" style={{ textAlign: 'center', padding: '64px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(124,58,237,0.08)', color: 'var(--color-primary)' }}><Library size={26} strokeWidth={1.2} /></div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Your Vault is empty</h3>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>Save optimized prompts to build your personal library.</p>
          </div>
        ) : items.map(item => (
          <VaultRow key={item.id} item={item} isSelectionMode={isSelectionMode} selected={selectedIds.has(item.id)} onSelect={toggleSelected} onToggleFavorite={handleToggleFavorite} onDelete={(id) => requestDelete([id])} onOpenInOptimizer={(id) => router.push(`/dashboard/chat/${id}`)} />
        ))}
      </div>

      {!loading && totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}

      {deleteDialog.open && (
        <div
          role="presentation"
          onClick={closeDeleteDialog}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
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
            aria-labelledby="vault-delete-dialog-title"
            aria-describedby="vault-delete-dialog-message"
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
                background: deleteDialog.mode === 'error' ? 'rgba(239,68,68,0.10)' : 'rgba(124,58,237,0.10)',
                color: deleteDialog.mode === 'error' ? '#EF4444' : '#7C3AED',
              }}>
                <Trash2 size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 id="vault-delete-dialog-title" style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {deleteDialog.title}
                </h3>
                <p id="vault-delete-dialog-message" style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                  {deleteDialog.message}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
              {deleteDialog.mode === 'confirm' ? (
                <>
                  <button
                    type="button"
                    onClick={closeDeleteDialog}
                    disabled={deleting}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 10,
                      border: '1px solid rgba(124,58,237,0.14)',
                      background: '#FFFFFF',
                      color: 'var(--color-text-primary)',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: deleting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteDialog}
                    disabled={deleting}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 10,
                      border: 'none',
                      background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: deleting ? 'not-allowed' : 'pointer',
                      opacity: deleting ? 0.7 : 1,
                    }}
                  >
                    {deleting ? 'Deleting...' : (deleteDialog.confirmLabel || 'Delete')}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={closeDeleteDialog}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
