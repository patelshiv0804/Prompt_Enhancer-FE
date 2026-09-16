'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  X, Copy, Check, Download, Sparkles, FileText,
  Search, Layers, Bot, Eye, HelpCircle, Loader2
} from 'lucide-react';
import { useIsDark, D } from '@/theme/theme';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { apiClient } from '@/utils/apiClient';
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

export default function MultiChatExportModal({
  isOpen,
  onClose,
  availableChats,
  initialSelectedIds,
}: MultiChatExportModalProps) {
  const isDark = useIsDark();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Selected chat IDs
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    if (initialSelectedIds && initialSelectedIds.length > 0) {
      return new Set(initialSelectedIds);
    }
    // Default to all available or first 3
    return new Set(availableChats.map(c => c.id));
  });

  // Export settings
  const [mode, setMode] = useState<ExportMode>('smart');
  const [format, setFormat] = useState<ExportFormat>('txt');
  const [searchFilter, setSearchFilter] = useState('');
  const [copied, setCopied] = useState(false);

  // Full versions fetched directly from DB for each prompt ID
  const [enrichedVersionsMap, setEnrichedVersionsMap] = useState<Record<string, ExportVersion[]>>({});
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Sync initialSelectedIds when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialSelectedIds && initialSelectedIds.length > 0) {
        setSelectedIds(new Set(initialSelectedIds));
      } else if (availableChats.length > 0) {
        setSelectedIds(new Set(availableChats.map(c => c.id)));
      }
      setCopied(false);
    }
  }, [isOpen, initialSelectedIds, availableChats]);

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
    if (!searchFilter.trim()) return availableChats;
    const q = searchFilter.toLowerCase();
    return availableChats.filter(c =>
      (c.title || '').toLowerCase().includes(q) ||
      (c.originalPrompt || '').toLowerCase().includes(q) ||
      (c.mode || '').toLowerCase().includes(q)
    );
  }, [availableChats, searchFilter]);

  // Selected items to export
  const selectedItems = useMemo(() => {
    return availableChats.filter(c => selectedIds.has(c.id));
  }, [availableChats, selectedIds]);

  // Fetch full version history directly from DB for all chats in modal
  useEffect(() => {
    if (!isOpen) return;

    const idsToFetch = availableChats
      .map(i => i.id)
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

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id); // Keep at least one
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(availableChats.map(c => c.id)));
  };

  const clearExceptFirst = () => {
    if (availableChats.length > 0) {
      setSelectedIds(new Set([availableChats[0].id]));
    }
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

  const handleDownload = () => {
    if (!exportedText) return;
    const count = enrichedSelectedItems.length;
    const ext = format === 'md' ? 'md' : 'txt';
    const mime = format === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8';
    const filename = `aure_multi_context_${count}_projects.${ext}`;
    downloadTextFile(filename, exportedText, mime);
  };

  if (!isOpen) return null;

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
        background: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(8px)',
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
          maxWidth: 960,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          background: isDark ? '#11101D' : '#FFFFFF',
          borderRadius: 20,
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(124, 58, 237, 0.18)'}`,
          boxShadow: isDark
            ? '0 24px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(139, 92, 246, 0.15)'
            : '0 24px 60px rgba(109, 40, 217, 0.18), 0 4px 16px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
          animation: 'fadeInRise 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '16px 20px' : '20px 28px',
            borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)'}`,
            background: isDark ? 'rgba(255, 255, 255, 0.02)' : '#FAFAFD',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDark ? 'rgba(139, 92, 246, 0.20)' : 'rgba(124, 58, 237, 0.10)',
                color: isDark ? '#C084FC' : '#7C3AED',
                border: `1px solid ${isDark ? 'rgba(167, 139, 250, 0.30)' : 'rgba(124, 58, 237, 0.20)'}`,
              }}
            >
              <Layers size={18} strokeWidth={2} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: 700,
                  color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                  margin: 0,
                  letterSpacing: '-0.01em',
                }}
              >
                Export Multi-Chat Context
              </h2>
              <p
                style={{
                  fontSize: 12.5,
                  color: isDark ? D.textSecondary : 'var(--color-text-secondary)',
                  margin: 0,
                }}
              >
                Bundle multiple chats so another AI (ChatGPT, Claude, Cursor) has complete background memory.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close export dialog"
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
              color: isDark ? D.textSecondary : 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all 160ms ease',
            }}
            className="hover:!text-[var(--color-text-primary)] hover:!bg-[rgba(124,58,237,0.12)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Area */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {/* Left Panel: Chat Selector & Controls */}
          <div
            style={{
              width: isMobile ? '100%' : 340,
              flexShrink: 0,
              borderRight: isMobile ? 'none' : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)'}`,
              borderBottom: isMobile ? `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)'}` : 'none',
              display: 'flex',
              flexDirection: 'column',
              padding: isMobile ? 16 : 22,
              gap: 16,
              background: isDark ? '#0D0C17' : '#FCFCFE',
              overflowY: 'auto',
            }}
          >
            {/* Mode selection */}
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: isDark ? D.textMuted : 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>
                Export Mode
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                  onClick={() => setMode('smart')}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: mode === 'smart'
                      ? `1.5px solid ${isDark ? '#A855F7' : '#7C3AED'}`
                      : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.12)'}`,
                    background: mode === 'smart'
                      ? (isDark ? 'rgba(139, 92, 246, 0.16)' : 'rgba(124, 58, 237, 0.06)')
                      : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 160ms ease',
                  }}
                >
                  <Sparkles size={16} style={{ color: isDark ? '#C084FC' : '#7C3AED', marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? D.textPrimary : 'var(--color-text-primary)' }}>
                      Smart AI Continuation Pack
                    </div>
                    <div style={{ fontSize: 11, color: isDark ? D.textSecondary : 'var(--color-text-secondary)', marginTop: 2 }}>
                      Optimized for ChatGPT, Claude, & Gemini. Includes active prompts, rules & continuation instructions.
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setMode('transcript')}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: mode === 'transcript'
                      ? `1.5px solid ${isDark ? '#A855F7' : '#7C3AED'}`
                      : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.12)'}`,
                    background: mode === 'transcript'
                      ? (isDark ? 'rgba(139, 92, 246, 0.16)' : 'rgba(124, 58, 237, 0.06)')
                      : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 160ms ease',
                  }}
                >
                  <FileText size={16} style={{ color: isDark ? '#C084FC' : '#7C3AED', marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isDark ? D.textPrimary : 'var(--color-text-primary)' }}>
                      Full Transcripts & History
                    </div>
                    <div style={{ fontSize: 11, color: isDark ? D.textSecondary : 'var(--color-text-secondary)', marginTop: 2 }}>
                      Verbatim archive containing every iterative version, score, and tweak note.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Format toggle: TXT vs MD */}
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: isDark ? D.textMuted : 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>
                Output Format
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['txt', 'md'] as const).map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setFormat(fmt)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: format === fmt
                        ? `1.5px solid ${isDark ? '#A855F7' : '#7C3AED'}`
                        : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.12)'}`,
                      background: format === fmt
                        ? (isDark ? 'rgba(139,92,246,0.22)' : 'rgba(124,58,237,0.08)')
                        : 'transparent',
                      color: format === fmt
                        ? (isDark ? '#C084FC' : '#7C3AED')
                        : (isDark ? D.textSecondary : 'var(--color-text-secondary)'),
                      transition: 'all 160ms ease',
                      textTransform: 'uppercase',
                    }}
                  >
                    .{fmt} {fmt === 'txt' ? '(Plain text)' : '(Markdown)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected chats selector */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: isDark ? D.textMuted : 'var(--color-text-secondary)' }}>
                  Selected Chats ({selectedIds.size}/{availableChats.length})
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={selectAll}
                    style={{ fontSize: 11, fontWeight: 600, color: isDark ? '#C084FC' : '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Select All
                  </button>
                  <span style={{ opacity: 0.3 }}>|</span>
                  <button
                    onClick={clearExceptFirst}
                    style={{ fontSize: 11, fontWeight: 600, color: isDark ? D.textMuted : 'var(--color-text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Filter search */}
              {availableChats.length > 4 && (
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: isDark ? D.textMuted : 'var(--color-text-secondary)' }} />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    placeholder="Search chats to include..."
                    style={{
                      width: '100%',
                      padding: '6px 10px 6px 28px',
                      fontSize: 12,
                      borderRadius: 7,
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(124,58,237,0.14)'}`,
                      background: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
                      color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              {/* Chat list */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 5,
                  overflowY: 'auto',
                  maxHeight: 220,
                  paddingRight: 4,
                }}
              >
                {filteredChats.map(c => {
                  const isChecked = selectedIds.has(c.id);
                  const title = c.title || c.originalPrompt.slice(0, 45) || 'Untitled Prompt';
                  return (
                    <label
                      key={c.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 8px',
                        borderRadius: 7,
                        fontSize: 12,
                        cursor: 'pointer',
                        background: isChecked
                          ? (isDark ? 'rgba(139, 92, 246, 0.12)' : 'rgba(124, 58, 237, 0.05)')
                          : 'transparent',
                        border: `1px solid ${isChecked ? (isDark ? 'rgba(167,139,250,0.3)' : 'rgba(124,58,237,0.18)') : 'transparent'}`,
                        transition: 'all 120ms ease',
                      }}
                      className="hover:!bg-[rgba(124,58,237,0.08)]"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(c.id)}
                        style={{ accentColor: '#8B5CF6', cursor: 'pointer' }}
                      />
                      <span
                        style={{
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: isChecked ? (isDark ? '#FFFFFF' : '#1E1B4B') : (isDark ? D.textSecondary : 'var(--color-text-secondary)'),
                          fontWeight: isChecked ? 600 : 400,
                        }}
                      >
                        {title}
                      </span>
                      {(() => {
                        const vers = enrichedVersionsMap[c.id] || c.versions || [];
                        const count = vers.length > 0 ? vers.length : 1;
                        return (
                          <span
                            style={{
                              fontSize: 10,
                              padding: '1px 5px',
                              borderRadius: 4,
                              background: isDark ? 'rgba(139,92,246,0.18)' : 'rgba(124,58,237,0.10)',
                              color: isDark ? '#C084FC' : '#7C3AED',
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {count} {count === 1 ? 'ver' : 'vers'}
                          </span>
                        );
                      })()}
                      {c.mode && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: '1px 5px',
                            borderRadius: 4,
                            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                            color: isDark ? D.textMuted : 'var(--color-text-secondary)',
                            flexShrink: 0,
                          }}
                        >
                          {c.mode}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel: Live Preview */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              background: isDark ? '#11101D' : '#FFFFFF',
            }}
          >
            {/* Preview Toolbar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'}`,
                background: isDark ? 'rgba(255, 255, 255, 0.01)' : '#FAF9FD',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: isDark ? D.textSecondary : 'var(--color-text-secondary)' }}>
                <Eye size={14} />
                <span style={{ fontWeight: 600 }}>Live Export Preview</span>
                <span style={{ opacity: 0.4 }}>•</span>
                <span>{selectedItems.length} {selectedItems.length === 1 ? 'project' : 'projects'}</span>
                <span style={{ opacity: 0.4 }}>•</span>
                <span>~{stats.words.toLocaleString()} words (~{stats.tokens.toLocaleString()} tokens)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {loadingVersions ? (
                  <span style={{ fontSize: 11, color: isDark ? '#C084FC' : '#7C3AED', display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                    <Loader2 size={12} className="animate-spin" /> Fetching version history...
                  </span>
                ) : (
                  <span style={{ fontSize: 11, color: isDark ? '#10B981' : '#059669', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                    <Bot size={12} /> Ready for ChatGPT / Claude
                  </span>
                )}
              </div>
            </div>

            {/* Code / Text Preview */}
            <div
              style={{
                flex: 1,
                padding: '16px 20px',
                overflowY: 'auto',
                minHeight: 280,
                maxHeight: isMobile ? 320 : 440,
                fontFamily: "'Geist Mono', 'Fira Code', Menlo, Consolas, monospace",
                fontSize: 12,
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                background: isDark ? '#0A0914' : '#F8FAFC',
                color: isDark ? '#E2E8F0' : '#1E293B',
                borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)'}`,
              }}
            >
              {exportedText || '// No projects selected.'}
            </div>

            {/* Bottom Action Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                background: isDark ? '#0E0D1A' : '#FFFFFF',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: isDark ? D.textMuted : 'var(--color-text-secondary)' }}>
                <HelpCircle size={13} />
                <span>Paste directly into any new AI conversation to continue seamlessly.</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
                <button
                  id="multi-chat-copy-btn"
                  onClick={handleCopy}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 9,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 180ms ease',
                    border: `1px solid ${copied ? '#10B981' : (isDark ? 'rgba(167,139,250,0.35)' : 'rgba(124,58,237,0.22)')}`,
                    background: copied
                      ? 'rgba(16, 185, 129, 0.15)'
                      : (isDark ? 'rgba(139, 92, 246, 0.18)' : 'rgba(124, 58, 237, 0.08)'),
                    color: copied
                      ? '#10B981'
                      : (isDark ? '#C084FC' : '#6D28D9'),
                  }}
                  className="hover:scale-105"
                >
                  {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
                </button>

                <button
                  id="multi-chat-download-btn"
                  onClick={handleDownload}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 18px',
                    borderRadius: 9,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    color: '#FFFFFF',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                    transition: 'all 180ms ease',
                  }}
                  className="hover:brightness-110 hover:scale-105"
                >
                  <Download size={14} />
                  <span>Download .{format}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
