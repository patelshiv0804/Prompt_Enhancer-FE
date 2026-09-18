'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X, Copy, Check, Download,
  Search, Layers, Eye, HelpCircle, Loader2
} from 'lucide-react';
import { useIsDark, D } from '@/theme/theme';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { apiClient } from '@/utils/apiClient';
import { fetchHistory } from '@/features/history/services/historyService';
import {
  MultiChatExportItem,
  ExportVersion,
  ExportMode,
  ExportFormat,
  buildMultiChatHandoff,
  buildMultiChatTranscript,
  stripVariablesSection,
  downloadTextFile,
  copyTextToClipboard,
} from '../services/multiChatExportService';

interface MultiChatExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableChats: MultiChatExportItem[];
  initialSelectedIds?: string[];
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_EXPORT_CHATS = 10;

export default function MultiChatExportModal({
  isOpen,
  onClose,
  availableChats,
  initialSelectedIds,
}: MultiChatExportModalProps) {
  const isDark = useIsDark();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSmall = useMediaQuery('(max-width: 480px)');

  // Full fetched chats directly from DB so user can choose from ALL their chats
  const [allFetchedChats, setAllFetchedChats] = useState<MultiChatExportItem[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);

  // Fetch all user history prompts whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;
    setLoadingChats(true);
    fetchHistory(1, 500, { search: '', category: 'all', sortBy: 'most-recent' })
      .then(res => {
        if (res?.items && res.items.length > 0) {
          const mapped: MultiChatExportItem[] = res.items.map(item => ({
            id: String(item.id),
            title: item.title || (item.prompt || '').slice(0, 50),
            originalPrompt: item.prompt || '',
            mode: item.mode,
            category: item.category,
            targetModel: item.targetModel,
            score: item.score ?? undefined,
            createdAt: item.createdAt,
            optimizedPrompt: item.optimizedPrompt,
            versions: item.optimizedPrompt ? [
              {
                versionNumber: 1,
                optimizedPrompt: item.optimizedPrompt,
                overallScore: item.score ?? undefined,
              }
            ] : undefined,
          }));
          setAllFetchedChats(mapped);
        }
      })
      .catch(err => {
        console.warn('Could not fetch all chats for export modal:', err);
      })
      .finally(() => {
        setLoadingChats(false);
      });
  }, [isOpen]);

  // Combined chats: combines availableChats prop with all fetched chats from DB
  const allChats = useMemo(() => {
    const map = new Map<string, MultiChatExportItem>();
    (availableChats || []).forEach(c => {
      if (c && c.id) map.set(String(c.id), c);
    });
    allFetchedChats.forEach(c => {
      if (c && c.id && !map.has(String(c.id))) {
        map.set(String(c.id), c);
      }
    });
    return Array.from(map.values());
  }, [availableChats, allFetchedChats]);

  // Selected chat IDs (capped at MAX_EXPORT_CHATS = 10)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    if (initialSelectedIds && initialSelectedIds.length > 0) {
      return new Set(initialSelectedIds.slice(0, MAX_EXPORT_CHATS));
    }
    return new Set(availableChats.slice(0, MAX_EXPORT_CHATS).map(c => String(c.id)));
  });

  // Export settings
  const [mode, setMode] = useState<ExportMode>('smart');
  const [format, setFormat] = useState<ExportFormat>('txt');
  const [searchFilter, setSearchFilter] = useState('');
  const [copied, setCopied] = useState(false);

  // Full versions fetched directly from DB for each prompt ID
  const [enrichedVersionsMap, setEnrichedVersionsMap] = useState<Record<string, ExportVersion[]>>({});
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Sync initialSelectedIds ONLY when modal transitions from closed to open
  const prevIsOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      if (initialSelectedIds && initialSelectedIds.length > 0) {
        setSelectedIds(new Set(initialSelectedIds.slice(0, MAX_EXPORT_CHATS)));
      } else if (allChats.length > 0) {
        setSelectedIds(new Set(allChats.slice(0, MAX_EXPORT_CHATS).map(c => String(c.id))));
      }
      setCopied(false);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialSelectedIds, allChats]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered available chats in manager
  const filteredChats = useMemo(() => {
    if (!searchFilter.trim()) return allChats;
    const q = searchFilter.toLowerCase();
    return allChats.filter(c =>
      (c.title || '').toLowerCase().includes(q) ||
      (c.originalPrompt || '').toLowerCase().includes(q) ||
      (c.mode || '').toLowerCase().includes(q) ||
      (c.category || '').toLowerCase().includes(q)
    );
  }, [allChats, searchFilter]);

  // Selected items to export
  const selectedItems = useMemo(() => {
    return allChats.filter(c => selectedIds.has(String(c.id)));
  }, [allChats, selectedIds]);

  // Fetch full version history directly from DB for all chats in modal
  useEffect(() => {
    if (!isOpen) return;

    const idsToFetch = allChats
      .map(i => String(i.id))
      .filter(id => id && id !== 'current-session' && !enrichedVersionsMap[id]);

    if (idsToFetch.length === 0) return;

    let isMounted = true;
    setLoadingVersions(true);

    Promise.allSettled(
      idsToFetch.map(async id => {
        try {
          const res = await apiClient.get<any>(`/api/v1/prompts/${id}/versions`);
          const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          if (rawList.length > 0) {
            const versions: ExportVersion[] = rawList.map((v: any, idx: number) => ({
              versionNumber: v.version_number ?? v.versionNumber ?? (idx + 1),
              optimizedPrompt: stripVariablesSection(v.content || v.enhanced_prompt || v.optimized_prompt || ''),
              tweakNote: v.change_summary || v.tweak_note || v.tweakNote || undefined,
              overallScore: v.new_analysis?.overall_score ?? v.overall_score ?? undefined,
              dimensions: v.new_analysis?.dimensions
                ? Object.entries(v.new_analysis.dimensions).map(([label, d]: [string, any]) => ({
                    label,
                    score: d?.score || 0,
                    desc: d?.description || d?.feedback || '',
                  }))
                : undefined,
              timestamp: v.created_at,
            }));
            return { id, versions };
          }
        } catch (err) {
          console.warn(`Could not fetch versions for prompt ${id}:`, err);
        }
        return null;
      })
    ).then(results => {
      if (!isMounted) return;
      const newEntries: Record<string, ExportVersion[]> = {};
      results.forEach(r => {
        if (r.status === 'fulfilled' && r.value) {
          newEntries[r.value.id] = r.value.versions;
        }
      });
      if (Object.keys(newEntries).length > 0) {
        setEnrichedVersionsMap(prev => ({ ...prev, ...newEntries }));
      }
    }).finally(() => {
      if (isMounted) setLoadingVersions(false);
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, availableChats, enrichedVersionsMap]);

  // Enrich selected items with full version history from database
  const enrichedSelectedItems = useMemo(() => {
    return selectedItems.map(item => {
      const fetched = enrichedVersionsMap[item.id];
      const versionsToUse = (fetched && fetched.length > 0)
        ? fetched
        : (item.versions && item.versions.length > 0)
          ? item.versions
          : item.optimizedPrompt
            ? [{ versionNumber: 1, optimizedPrompt: item.optimizedPrompt, overallScore: item.score }]
            : [];

      const sorted = [...versionsToUse].map(v => ({
        ...v,
        optimizedPrompt: stripVariablesSection(v.optimizedPrompt || ''),
      })).sort((a, b) => a.versionNumber - b.versionNumber);
      const latest = sorted[sorted.length - 1];
      return {
        ...item,
        optimizedPrompt: latest?.optimizedPrompt || stripVariablesSection(item.optimizedPrompt || ''),
        score: latest?.overallScore ?? item.score,
        versions: sorted,
      };
    });
  }, [selectedItems, enrichedVersionsMap]);

  // Generate exported text
  const exportedText = useMemo(() => {
    if (enrichedSelectedItems.length === 0) return '';
    return mode === 'smart'
      ? buildMultiChatHandoff(enrichedSelectedItems, format)
      : buildMultiChatTranscript(enrichedSelectedItems, format);
  }, [enrichedSelectedItems, mode, format]);

  // Word & token estimates
  const stats = useMemo(() => {
    if (!exportedText) return { words: 0, tokens: 0 };
    const words = exportedText.trim().split(/\s+/).filter(Boolean).length;
    const tokens = Math.round(words * 1.33);
    return { words, tokens };
  }, [exportedText]);

  // Toggle selection (capped at MAX_EXPORT_CHATS = 10)
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id); // Allow unchecking freely
      } else {
        if (next.size >= MAX_EXPORT_CHATS) return prev; // Capped at max 10 chats
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(allChats.slice(0, MAX_EXPORT_CHATS).map(c => String(c.id))));
  };

  const clearExceptFirst = () => {
    setSelectedIds(new Set());
  };

  // Actions
  const handleCopy = async () => {
    if (!exportedText) return;
    const ok = await copyTextToClipboard(exportedText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownloadFormat = (fmt: ExportFormat) => {
    setFormat(fmt);
    const text = buildMultiChatHandoff(enrichedSelectedItems, fmt);
    if (!text) return;
    const count = enrichedSelectedItems.length;
    const mime = fmt === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8';
    const filename = `aure_multi_context_${count}_projects.${fmt}`;
    downloadTextFile(filename, text, mime);
  };

  if (!isOpen) return null;

  const atLimit = selectedIds.size >= MAX_EXPORT_CHATS;
  const progressPct = (selectedIds.size / MAX_EXPORT_CHATS) * 100;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Export Multi-Chat Context"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? 12 : 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 900,
          height: isMobile ? '96vh' : '88vh',
          maxHeight: '96vh',
          display: 'flex',
          flexDirection: 'column',
          background: isDark ? '#13121F' : '#FFFFFF',
          borderRadius: isMobile ? 16 : 18,
          border: `1px solid ${isDark ? 'rgba(139,92,246,0.2)' : 'rgba(124,58,237,0.14)'}`,
          boxShadow: isDark
            ? '0 32px 72px rgba(0,0,0,0.7), 0 0 40px rgba(139,92,246,0.12)'
            : '0 24px 56px rgba(109,40,217,0.14)',
          overflow: 'hidden',
          animation: 'fadeInRise 200ms cubic-bezier(0.16,1,0.3,1) forwards',
        }}
      >
        {/* â”€â”€ Header â”€â”€ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '11px 14px' : '18px 24px',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg,rgba(124,58,237,0.22),rgba(167,139,250,0.12))',
                color: isDark ? '#C084FC' : '#7C3AED',
              }}
            >
              <Layers size={17} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: isMobile ? 14 : 17, fontWeight: 700, color: isDark ? '#F1F0FF' : '#1E1B4B', letterSpacing: '-0.02em' }}>
                Export Chat Context
              </div>
              {!isMobile && (
                <div style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.45)', marginTop: 1 }}>
                  Pick up to 10 chats — paste into any AI to continue seamlessly
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32, height: 32, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none',
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
              color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
              cursor: 'pointer',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* â”€â”€ Body: two-column â”€â”€ */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {/* â”€â”€ LEFT: Chat selector â”€â”€ */}
          <div
            style={{
              width: isMobile ? '100%' : 310,
              flexShrink: 0,
              alignSelf: isMobile ? 'auto' : 'stretch',
              minHeight: 0,
              maxHeight: isMobile ? '40vh' : 'none',
              display: 'flex',
              flexDirection: 'column',
              borderRight: isMobile ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
              borderBottom: isMobile ? `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` : 'none',
              background: isDark ? '#0F0E1C' : '#FAFAFD',
              overflow: 'hidden',
            }}
          >
            {/* Selection header */}
            <div style={{ padding: isMobile ? '12px 14px 8px' : '16px 16px 10px', flexShrink: 0 }}>
              {/* Count + actions row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.5)' }}>
                  <span style={{
                    fontWeight: 800,
                    fontSize: 15,
                    color: atLimit
                      ? '#F59E0B'
                      : (isDark ? '#E2DEFF' : '#4C1D95'),
                    transition: 'color 200ms ease',
                  }}>
                    {selectedIds.size}
                  </span>
                  <span style={{ margin: '0 2px' }}>/</span>
                  {MAX_EXPORT_CHATS} selected
                </span>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button
                    type="button" onClick={selectAll}
                    style={{
                      fontSize: 12, fontWeight: 600,
                      color: isDark ? '#A78BFA' : '#7C3AED',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    }}
                  >
                    {allChats.length > MAX_EXPORT_CHATS ? 'Select 10' : 'Select All'}
                  </button>
                  <span style={{ color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }}>|</span>
                  <button
                    type="button" onClick={clearExceptFirst}
                    style={{
                      fontSize: 12, fontWeight: 600,
                      color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ height: 4, borderRadius: 4, background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${progressPct}%`,
                    borderRadius: 4,
                    background: atLimit
                      ? 'linear-gradient(90deg,#F59E0B,#FBBF24)'
                      : 'linear-gradient(90deg,#7C3AED,#A855F7)',
                    transition: 'width 200ms ease',
                  }}
                />
              </div>

              {/* Search */}
              <div style={{ position: 'relative', marginTop: 10 }}>
                <Search size={12} style={{
                  position: 'absolute', left: 10, top: '50%',
                  transform: 'translateY(-50%)',
                  color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                }} />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  placeholder="Search chats..."
                  style={{
                    width: '100%',
                    padding: '7px 10px 7px 28px',
                    fontSize: 12.5,
                    borderRadius: 8,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(124,58,237,0.13)'}`,
                    background: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
                    color: isDark ? '#E2DEFF' : '#1E1B4B',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Chat list â€” scrollable */}
            <div
              className="custom-scrollbar"
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                padding: isMobile ? '0 14px 14px' : '0 16px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                scrollbarWidth: 'thin',
                scrollbarColor: isDark ? 'rgba(139,92,246,0.4) transparent' : 'rgba(124,58,237,0.25) transparent',
              }}
            >
              {loadingChats && allChats.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '32px 0', color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)', fontSize: 12.5 }}>
                  <Loader2 size={15} className="animate-spin" />
                  Loading your chatsâ€¦
                </div>
              ) : filteredChats.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 8px', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', fontSize: 12.5 }}>
                  {searchFilter ? `No results for "${searchFilter}"` : 'No chats found.'}
                </div>
              ) : (
                filteredChats.map(c => {
                  const chatId = String(c.id);
                  const isChecked = selectedIds.has(chatId);
                  const isDisabled = !isChecked && atLimit;
                  const title = c.title || c.originalPrompt.slice(0, 50) || 'Untitled';
                  const vers = (enrichedVersionsMap[c.id] || c.versions || []).length || 1;

                  return (
                    <label
                      key={chatId}
                      title={isDisabled ? 'Max 10 chats can be selected' : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 10px',
                        borderRadius: 9,
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled ? 0.4 : 1,
                        background: isChecked
                          ? (isDark ? 'rgba(124,58,237,0.14)' : 'rgba(124,58,237,0.07)')
                          : 'transparent',
                        border: `1px solid ${isChecked
                          ? (isDark ? 'rgba(167,139,250,0.28)' : 'rgba(124,58,237,0.2)')
                          : 'transparent'}`,
                        transition: 'all 120ms ease',
                      }}
                    >
                      {/* Custom checkbox look */}
                      <div
                        style={{
                          width: 17, height: 17, borderRadius: 5,
                          flexShrink: 0,
                          border: `2px solid ${isChecked ? '#8B5CF6' : (isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)')}`,
                          background: isChecked ? '#8B5CF6' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 120ms ease',
                        }}
                      >
                        {isChecked && <Check size={10} color="#fff" strokeWidth={3} />}
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={() => toggleSelect(chatId)}
                        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                      />

                      {/* Title */}
                      <span
                        style={{
                          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          fontSize: 12.5,
                          fontWeight: isChecked ? 600 : 400,
                          color: isChecked ? (isDark ? '#E2DEFF' : '#4C1D95') : (isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)'),
                        }}
                      >
                        {title}
                      </span>

                      {/* Meta badges */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                        {vers > 1 && (
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            padding: '1px 5px', borderRadius: 4,
                            background: isDark ? 'rgba(139,92,246,0.18)' : 'rgba(124,58,237,0.1)',
                            color: isDark ? '#C084FC' : '#7C3AED',
                          }}>
                            v{vers}
                          </span>
                        )}
                        {c.category && (
                          <span style={{
                            fontSize: 10, fontWeight: 500,
                            padding: '1px 6px', borderRadius: 4,
                            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                            color: isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)',
                            maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {c.category}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* â”€â”€ RIGHT: Preview â”€â”€ */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              minHeight: 0,
            }}
          >
            {/* Preview toolbar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: isMobile ? '10px 14px' : '12px 20px',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
                flexShrink: 0,
                background: isDark ? 'rgba(255,255,255,0.01)' : '#FAFAFD',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}>
                <Eye size={13} />
                <span style={{ fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.65)' }}>Preview</span>
                <span style={{ opacity: 0.35, margin: '0 2px' }}>|</span>
                <span>{selectedIds.size} {selectedIds.size === 1 ? 'chat' : 'chats'} selected</span>
              </div>
              {loadingVersions && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: isDark ? '#A78BFA' : '#7C3AED', fontWeight: 600 }}>
                  <Loader2 size={11} className="animate-spin" />
                  Loading versions...
                </span>
              )}
            </div>

            {/* Formatted Preview Cards */}
            <div
              className="custom-scrollbar"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: isMobile ? '10px 10px' : '14px 16px',
                background: isDark ? '#0C0B18' : '#F4F3FB',
                minHeight: 0,
                scrollbarWidth: 'thin',
                scrollbarColor: isDark ? 'rgba(139,92,246,0.4) transparent' : 'rgba(124,58,237,0.25) transparent',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {enrichedSelectedItems.length === 0 ? (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 10, flex: 1, padding: '40px 20px', textAlign: 'center',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(124,58,237,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isDark ? 'rgba(167,139,250,0.45)' : 'rgba(124,58,237,0.4)',
                  }}>
                    <Layers size={20} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>
                    No chats selected
                  </div>
                  <div style={{ fontSize: 12, color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)', maxWidth: 220 }}>
                    Check chats from the left panel to preview your bundled export here.
                  </div>
                </div>
              ) : (
                enrichedSelectedItems.map((item, idx) => {
                  const latestOptimized = item.optimizedPrompt || '';
                  const originalPrompt = item.originalPrompt || '';
                  const versionCount = item.versions?.length || 1;
                  const score = item.score;
                  return (
                    <div
                      key={item.id}
                      style={{
                        borderRadius: 11,
                        border: `1px solid ${isDark ? 'rgba(139,92,246,0.18)' : 'rgba(124,58,237,0.13)'}`,
                        background: isDark ? '#13121F' : '#FFFFFF',
                        overflow: 'hidden',
                        boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.28)' : '0 1px 5px rgba(0,0,0,0.05)',
                        flexShrink: 0,
                      }}
                    >
                      {/* Card header row */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '9px 12px',
                        background: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(124,58,237,0.06)',
                        borderBottom: `1px solid ${isDark ? 'rgba(139,92,246,0.14)' : 'rgba(124,58,237,0.1)'}`,
                        gap: 8,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 800,
                            padding: '2px 6px', borderRadius: 20,
                            background: isDark ? 'rgba(139,92,246,0.28)' : 'rgba(124,58,237,0.14)',
                            color: isDark ? '#C084FC' : '#7C3AED',
                            flexShrink: 0,
                          }}>
                            #{idx + 1}
                          </span>
                          <span style={{
                            fontSize: 12.5, fontWeight: 700,
                            color: isDark ? '#E2DEFF' : '#1E1B4B',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {item.title || originalPrompt.slice(0, 55) || 'Untitled'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 5, flexShrink: 0, alignItems: 'center' }}>
                          {item.category && (
                            <span style={{
                              fontSize: 10, fontWeight: 500, padding: '2px 6px', borderRadius: 4,
                              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                              color: isDark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.38)',
                            }}>
                              {item.category}
                            </span>
                          )}
                          {versionCount > 1 && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                              background: isDark ? 'rgba(139,92,246,0.18)' : 'rgba(124,58,237,0.1)',
                              color: isDark ? '#C084FC' : '#7C3AED',
                            }}>
                              {versionCount}v
                            </span>
                          )}
                          {score != null && (
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                              background: (score >= 80)
                                ? (isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)')
                                : (score >= 60)
                                  ? (isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.1)')
                                  : (isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)'),
                              color: score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444',
                            }}>
                              {score}/100
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card body */}
                      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {originalPrompt && (
                          <div>
                            <div style={{
                              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                              letterSpacing: '0.5px', marginBottom: 4,
                              color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.32)',
                            }}>
                              Your Request
                            </div>
                            <div style={{
                              fontSize: 11.5, lineHeight: 1.6,
                              color: isDark ? 'rgba(255,255,255,0.55)' : '#64748B',
                              background: isDark ? 'rgba(255,255,255,0.03)' : '#F8F7FF',
                              padding: '7px 10px', borderRadius: 7,
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
                              maxHeight: 72, overflowY: 'auto',
                            }}>
                              {originalPrompt.length > 280 ? originalPrompt.slice(0, 280) + '...' : originalPrompt}
                            </div>
                          </div>
                        )}

                        {latestOptimized && (
                          <div>
                            <div style={{
                              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                              letterSpacing: '0.5px', marginBottom: 4,
                              color: isDark ? '#A78BFA' : '#7C3AED',
                            }}>
                              Enhanced Prompt
                            </div>
                            <div style={{
                              fontSize: 11.5, lineHeight: 1.6,
                              color: isDark ? 'rgba(226,222,255,0.88)' : '#1E293B',
                              background: isDark ? 'rgba(139,92,246,0.07)' : 'rgba(124,58,237,0.04)',
                              padding: '7px 10px', borderRadius: 7,
                              border: `1px solid ${isDark ? 'rgba(139,92,246,0.18)' : 'rgba(124,58,237,0.12)'}`,
                              maxHeight: 90, overflowY: 'auto',
                            }}>
                              {latestOptimized.length > 360 ? latestOptimized.slice(0, 360) + '...' : latestOptimized}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: isMobile ? '12px 14px' : '13px 20px',
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
                background: isDark ? '#0F0E1C' : '#FAFAFD',
                flexShrink: 0,
                gap: 10,
                flexWrap: isMobile ? 'wrap' : 'nowrap',
              }}
            >
              {/* Helper text */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)', flex: 1, minWidth: 0 }}>
                <HelpCircle size={12} style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isMobile ? 'normal' : 'nowrap' }}>
                  Copy or download, then paste into ChatGPT, Claude, or Cursor.
                </span>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, flexWrap: 'nowrap', width: isMobile ? '100%' : 'auto' }}>
                {/* Copy */}
                <button
                  id="multi-chat-copy-btn"
                  type="button"
                  onClick={handleCopy}
                  disabled={selectedIds.size === 0}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                    cursor: selectedIds.size === 0 ? 'not-allowed' : 'pointer',
                    opacity: selectedIds.size === 0 ? 0.4 : 1,
                    whiteSpace: 'nowrap', flexShrink: 0,
                    flex: isMobile ? 1 : 'none',
                    transition: 'all 150ms ease',
                    border: `1.5px solid ${copied ? '#10B981' : (isDark ? 'rgba(167,139,250,0.35)' : 'rgba(124,58,237,0.25)')}`,
                    background: copied ? 'rgba(16,185,129,0.12)' : 'transparent',
                    color: copied ? '#10B981' : (isDark ? '#C084FC' : '#7C3AED'),
                  }}
                >
                  {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>

                {/* Download .txt */}
                <button
                  id="multi-chat-download-txt-btn"
                  type="button"
                  onClick={() => handleDownloadFormat('txt')}
                  disabled={selectedIds.size === 0}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                    cursor: selectedIds.size === 0 ? 'not-allowed' : 'pointer',
                    opacity: selectedIds.size === 0 ? 0.4 : 1,
                    whiteSpace: 'nowrap', flexShrink: 0,
                    flex: isMobile ? 1 : 'none',
                    transition: 'all 150ms ease',
                    border: 'none',
                    background: 'linear-gradient(135deg,#6D28D9,#8B5CF6)',
                    color: '#FFFFFF',
                    boxShadow: selectedIds.size === 0 ? 'none' : '0 3px 12px rgba(109,40,217,0.35)',
                  }}
                >
                  <Download size={13} />
                  .txt
                </button>

                {/* Download .md */}
                <button
                  id="multi-chat-download-md-btn"
                  type="button"
                  onClick={() => handleDownloadFormat('md')}
                  disabled={selectedIds.size === 0}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600,
                    cursor: selectedIds.size === 0 ? 'not-allowed' : 'pointer',
                    opacity: selectedIds.size === 0 ? 0.4 : 1,
                    whiteSpace: 'nowrap', flexShrink: 0,
                    flex: isMobile ? 1 : 'none',
                    transition: 'all 150ms ease',
                    border: 'none',
                    background: 'linear-gradient(135deg,#7C3AED,#A855F7)',
                    color: '#FFFFFF',
                    boxShadow: selectedIds.size === 0 ? 'none' : '0 3px 12px rgba(124,58,237,0.35)',
                  }}
                >
                  <Download size={13} />
                  .md
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
