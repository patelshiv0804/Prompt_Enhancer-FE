'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Layers,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';

interface VersionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  versions: {
    versionNumber: number;
    overallScore: number;
    timestamp: string;
    isStarred?: boolean;
    tweakNote?: string;
  }[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onToggleStar: (index: number) => void;
  onHoverVersion?: (index: number | null) => void;
}

function getScoreBadge(score: number) {
  if (score >= 85) return { color: '#059669', bg: 'rgba(16, 185, 129, 0.10)', border: 'rgba(16, 185, 129, 0.22)' };
  if (score >= 70) return { color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.10)', border: 'rgba(124, 58, 237, 0.22)' };
  return { color: '#D97706', bg: 'rgba(245, 158, 11, 0.10)', border: 'rgba(245, 158, 11, 0.22)' };
}

export default function VersionHistoryDrawer({
  isOpen,
  onClose,
  versions,
  activeIndex,
  onSelect,
  onToggleStar,
  onHoverVersion,
}: VersionHistoryDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'starred' | 'improved'>('all');

  const enrichedVersions = useMemo(() => {
    return versions
      .map((v, i) => {
        const prevScore = i > 0 ? versions[i - 1].overallScore : v.overallScore;
        return { ...v, originalIndex: i, delta: v.overallScore - prevScore };
      })
      .reverse();
  }, [versions]);

  const highestScore = useMemo(() => {
    if (!versions.length) return 0;
    return Math.max(...versions.map(v => v.overallScore));
  }, [versions]);

  const peakDelta = useMemo(() => {
    if (!versions.length) return 0;
    const baseScore = versions[0].overallScore;
    return Math.max(0, ...versions.map(v => v.overallScore - baseScore));
  }, [versions]);

  const filteredVersions = useMemo(() => {
    return enrichedVersions.filter(v => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchVersion = v.versionNumber.toString().includes(q) || `v${v.versionNumber}`.includes(q);
        const matchNote = v.tweakNote?.toLowerCase().includes(q);
        if (!matchVersion && !matchNote) return false;
      }
      if (filter === 'starred' && !v.isStarred) return false;
      if (filter === 'improved' && v.delta <= 0) return false;
      return true;
    });
  }, [enrichedVersions, searchQuery, filter]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 7, 32, 0.45)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          {/* Centered Apple/Notion/Stripe Modal Card */}
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 14 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 14 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 680,
              maxHeight: '85vh',
              zIndex: 1001,
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 248, 255, 0.96) 100%)',
              backdropFilter: 'blur(28px) saturate(180%)',
              WebkitBackdropFilter: 'blur(28px) saturate(180%)',
              borderRadius: 24,
              border: '1px solid rgba(124, 58, 237, 0.16)',
              boxShadow: '0 24px 80px rgba(109, 40, 217, 0.22), 0 4px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '24px 28px 18px',
                borderBottom: '1px solid rgba(124, 58, 237, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(168,85,247,0.15))',
                    border: '1px solid rgba(124,58,237,0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7C3AED',
                  }}
                >
                  <Layers size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: '#1E1B4B',
                      margin: 0,
                      letterSpacing: '-0.01em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    All Prompt Drafts & Versions
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                        color: 'white',
                        padding: '2px 9px',
                        borderRadius: 9999,
                        boxShadow: '0 2px 6px rgba(124,58,237,0.25)',
                      }}
                    >
                      {versions.length}
                    </span>
                  </h2>
                  <p style={{ fontSize: 12.5, color: '#64748B', margin: '2px 0 0', fontWeight: 500 }}>
                    Select any iteration to load its prompt state and breakdown metrics
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  border: 'none',
                  background: 'rgba(124,58,237,0.06)',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 180ms ease',
                }}
                className="hover:!bg-[rgba(124,58,237,0.12)] hover:!text-[#4C1D95]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Apple / Notion Stat Highlights Bar */}
            <div
              style={{
                padding: '14px 28px',
                background: 'rgba(124, 58, 237, 0.03)',
                borderBottom: '1px solid rgba(124, 58, 237, 0.06)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
              }}
            >
              <div
                style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: '10px 14px',
                  border: '1px solid rgba(124, 58, 237, 0.08)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <span style={{ fontSize: 10.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total Iterations
                </span>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#1E1B4B', marginTop: 2 }}>{versions.length}</div>
              </div>
              <div
                style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: '10px 14px',
                  border: '1px solid rgba(124, 58, 237, 0.08)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <span style={{ fontSize: 10.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Highest Score
                </span>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#10B981', marginTop: 2 }}>{highestScore}</div>
              </div>
              <div
                style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: '10px 14px',
                  border: '1px solid rgba(124, 58, 237, 0.08)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <span style={{ fontSize: 10.5, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Max Improvement
                </span>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#7C3AED', marginTop: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ArrowUpRight size={15} />+{peakDelta}
                </div>
              </div>
            </div>

            {/* Controls: Search + Filter Pills */}
            <div style={{ padding: '16px 28px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Search Bar */}
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  background: '#FFFFFF',
                  borderRadius: 12,
                  border: '1px solid rgba(124, 58, 237, 0.14)',
                  boxShadow: '0 2px 8px rgba(109, 40, 217, 0.04)',
                  transition: 'all 200ms ease',
                }}
                className="focus-within:!border-[rgba(124,58,237,0.35)] focus-within:!shadow-[0_0_0_3px_rgba(124,58,237,0.10)]"
              >
                <Search size={14} style={{ position: 'absolute', left: 14, color: '#94A3B8', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Filter versions by prompt or v2..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9.5px 14px 9.5px 36px',
                    fontSize: 13,
                    fontWeight: 500,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: '#1E1B4B',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: 12,
                      background: 'rgba(148, 163, 184, 0.2)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 18,
                      height: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#475569',
                      padding: 0,
                    }}
                  >
                    <X size={11} />
                  </button>
                )}
              </div>

              {/* Segmented Filter Pills */}
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  background: 'rgba(124, 58, 237, 0.06)',
                  padding: 4,
                  borderRadius: 12,
                  border: '1px solid rgba(124, 58, 237, 0.08)',
                }}
              >
                {[
                  { id: 'all', label: 'All Versions' },
                  { id: 'starred', label: 'Starred ★' },
                  { id: 'improved', label: 'Improved ↗' },
                ].map(tab => {
                  const isActive = filter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setFilter(tab.id as 'all' | 'starred' | 'improved')}
                      style={{
                        flex: 1,
                        padding: '7px 12px',
                        borderRadius: 9,
                        fontSize: 12.5,
                        fontWeight: isActive ? 700 : 500,
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 200ms ease',
                        background: isActive ? '#FFFFFF' : 'transparent',
                        color: isActive ? '#6D28D9' : '#64748B',
                        boxShadow: isActive ? '0 2px 6px rgba(109,40,217,0.10)' : 'none',
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* List Body */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '8px 28px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {filteredVersions.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#94A3B8',
                    fontSize: 13.5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <Sparkles size={26} style={{ color: '#C4B5FD' }} />
                  <span>No matching versions found</span>
                </div>
              ) : (
                filteredVersions.map(v => {
                  const isCurrent = v.originalIndex === activeIndex;
                  const badge = getScoreBadge(v.overallScore);
                  const deltaIcon =
                    v.delta > 0 ? (
                      <TrendingUp size={13} style={{ color: '#10B981' }} />
                    ) : v.delta < 0 ? (
                      <TrendingDown size={13} style={{ color: '#EF4444' }} />
                    ) : (
                      <Minus size={13} style={{ color: '#94A3B8' }} />
                    );

                  return (
                    <motion.div
                      key={v.versionNumber}
                      whileHover={{ scale: 1.008, y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        onSelect(v.originalIndex);
                        onClose();
                      }}
                      onMouseEnter={() => onHoverVersion?.(v.originalIndex)}
                      onMouseLeave={() => onHoverVersion?.(null)}
                      style={{
                        padding: '14px 18px',
                        borderRadius: 16,
                        cursor: 'pointer',
                        background: isCurrent
                          ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.09) 0%, rgba(168, 85, 247, 0.05) 100%)'
                          : '#FFFFFF',
                        border: isCurrent
                          ? '1px solid rgba(124, 58, 237, 0.32)'
                          : '1px solid rgba(124, 58, 237, 0.09)',
                        boxShadow: isCurrent
                          ? '0 4px 20px rgba(124, 58, 237, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)'
                          : '0 2px 8px rgba(0, 0, 0, 0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        transition: 'all 200ms ease',
                        position: 'relative',
                      }}
                    >
                      {/* Star button */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onToggleStar(v.originalIndex);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 4,
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: v.isStarred ? '#F59E0B' : '#CBD5E1',
                          transition: 'all 150ms ease',
                        }}
                        className="hover:scale-110"
                      >
                        <Star
                          size={17}
                          fill={v.isStarred ? '#F59E0B' : 'transparent'}
                        />
                      </button>

                      {/* Main details */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: isCurrent ? '#6D28D9' : '#1E1B4B',
                            }}
                          >
                            v{v.versionNumber}
                          </span>
                          <span style={{ fontSize: 11.5, color: '#94A3B8', fontWeight: 500 }}>
                            {v.timestamp}
                          </span>

                          {isCurrent && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 10.5,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.4px',
                                background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                                color: 'white',
                                padding: '2px 8.5px',
                                borderRadius: 9999,
                                boxShadow: '0 2px 6px rgba(124,58,237,0.22)',
                              }}
                            >
                              <CheckCircle2 size={11} /> Active
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            fontSize: 12.5,
                            color: '#64748B',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {v.tweakNote || 'Enhanced prompt iteration'}
                        </div>
                      </div>

                      {/* Score Badge Pill */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: 3,
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '4px 12px',
                            borderRadius: 9999,
                            background: badge.bg,
                            border: `1px solid ${badge.border}`,
                            color: badge.color,
                            fontWeight: 800,
                            fontSize: 13.5,
                          }}
                        >
                          <span>{v.overallScore}</span>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            fontSize: 11.5,
                            fontWeight: 700,
                            color: v.delta > 0 ? '#10B981' : v.delta < 0 ? '#EF4444' : '#94A3B8',
                          }}
                        >
                          {deltaIcon}
                          <span>{v.delta > 0 ? `+${v.delta}` : v.delta}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
