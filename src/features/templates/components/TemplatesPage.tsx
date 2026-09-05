'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bookmark, BookmarkCheck, Sparkles, Code2, Megaphone, Palette,
  Video, BookOpen, Briefcase, TrendingUp, Star, ChevronRight, ChevronLeft,
  Zap, Film, Mail, Database, FileText, Loader2, AlertCircle, RefreshCw,
  Rocket, GraduationCap, Microscope, PenLine, LayoutGrid, List,
  X, Copy, Check, Eye, Compass, Flame, ArrowUpRight, CheckCircle2,
  Cpu, Award,
} from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { loadTemplates, type Template } from '../services/templatesService';
import TemplatesHubSkeleton from './TemplatesHubSkeleton';
import { useTheme, D } from '@/theme/theme';

/* ── Category & Role Icon Taxonomy ── */
const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  developer: Code2,
  marketer: Megaphone,
  researcher: Microscope,
  consultant: Briefcase,
  entrepreneur: Rocket,
  educator: GraduationCap,
  student: BookOpen,
  writer: PenLine,
  general: Sparkles,
  development: Code2,
  content: FileText,
  documentation: BookOpen,
  email: Mail,
  data: Database,
  coding: Code2,
  marketing: Megaphone,
  'ai-art': Palette,
  veo: Film,
  youtube: Video,
  storytelling: BookOpen,
  business: Briefcase,
};

const CATEGORY_COLOR_MAP: Record<string, { bg: string; darkBg: string; text: string; darkText: string; border: string; darkBorder: string }> = {
  developer: { bg: 'rgba(59, 130, 246, 0.08)', darkBg: 'rgba(59, 130, 246, 0.16)', text: '#2563EB', darkText: '#60A5FA', border: 'rgba(59, 130, 246, 0.20)', darkBorder: 'rgba(59, 130, 246, 0.35)' },
  marketer: { bg: 'rgba(236, 72, 153, 0.08)', darkBg: 'rgba(236, 72, 153, 0.16)', text: '#DB2777', darkText: '#F472B6', border: 'rgba(236, 72, 153, 0.20)', darkBorder: 'rgba(236, 72, 153, 0.35)' },
  researcher: { bg: 'rgba(139, 92, 246, 0.08)', darkBg: 'rgba(139, 92, 246, 0.16)', text: '#7C3AED', darkText: '#C084FC', border: 'rgba(139, 92, 246, 0.20)', darkBorder: 'rgba(139, 92, 246, 0.35)' },
  consultant: { bg: 'rgba(16, 185, 129, 0.08)', darkBg: 'rgba(16, 185, 129, 0.16)', text: '#059669', darkText: '#34D399', border: 'rgba(16, 185, 129, 0.20)', darkBorder: 'rgba(16, 185, 129, 0.35)' },
  entrepreneur: { bg: 'rgba(245, 158, 11, 0.08)', darkBg: 'rgba(245, 158, 11, 0.16)', text: '#D97706', darkText: '#FBBF24', border: 'rgba(245, 158, 11, 0.20)', darkBorder: 'rgba(245, 158, 11, 0.35)' },
  educator: { bg: 'rgba(14, 165, 233, 0.08)', darkBg: 'rgba(14, 165, 233, 0.16)', text: '#0284C7', darkText: '#38BDF8', border: 'rgba(14, 165, 233, 0.20)', darkBorder: 'rgba(14, 165, 233, 0.35)' },
  writer: { bg: 'rgba(168, 85, 247, 0.08)', darkBg: 'rgba(168, 85, 247, 0.16)', text: '#9333EA', darkText: '#E879F9', border: 'rgba(168, 85, 247, 0.20)', darkBorder: 'rgba(168, 85, 247, 0.35)' },
  student: { bg: 'rgba(20, 184, 166, 0.08)', darkBg: 'rgba(20, 184, 166, 0.16)', text: '#0D9488', darkText: '#2DD4BF', border: 'rgba(20, 184, 166, 0.20)', darkBorder: 'rgba(20, 184, 166, 0.35)' },
  general: { bg: 'rgba(124, 58, 237, 0.08)', darkBg: 'rgba(124, 58, 237, 0.16)', text: '#7C3AED', darkText: '#A78BFA', border: 'rgba(124, 58, 237, 0.20)', darkBorder: 'rgba(124, 58, 237, 0.35)' },
};

function getCategoryColor(category: string, isDark: boolean = false) {
  const meta = CATEGORY_COLOR_MAP[category.toLowerCase()] || CATEGORY_COLOR_MAP.general;
  return {
    bg: isDark ? meta.darkBg : meta.bg,
    text: isDark ? meta.darkText : meta.text,
    border: isDark ? meta.darkBorder : meta.border,
  };
}

function categoryLabel(id: string): string {
  if (id === 'all') return 'All';
  if (id === 'ai-art') return 'AI Art';
  if (id === 'veo') return 'VEO';
  return id.charAt(0).toUpperCase() + id.slice(1);
}

const BOOKMARKS_STORAGE_KEY = 'aure_template_bookmarks';

/* ── Apple-Grade Grand Showcase Poster Banner ── */
function SpotlightBanner({
  templates,
  onUse,
  onQuickLook,
  bookmarkedIds,
  onToggleBookmark,
  isPhone,
  isTablet,
  isSmall,
}: {
  templates: Template[];
  onUse: (t: Template) => void;
  onQuickLook: (t: Template) => void;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
  isPhone: boolean;
  isTablet: boolean;
  isSmall: boolean;
}) {
  const SLIDE_DURATION_MS = 3500;
  const SLIDE_DURATION_SEC = 3.5;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progressKey, setProgressKey] = useState(0);

  useEffect(() => {
    if (templates.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % templates.length);
      setProgressKey((k) => k + 1);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, [templates.length, currentIndex]);

  if (templates.length === 0) return null;
  const current = templates[currentIndex] || templates[0];
  const Icon = CATEGORY_ICON_MAP[current.category] || Sparkles;
  const isBookmarked = bookmarkedIds.has(current.id);

  return (
    <div
      id="spotlight-carousel-banner"
      style={{
        borderRadius: isSmall ? 18 : isPhone ? 22 : 28,
        overflow: 'hidden',
        marginBottom: isPhone ? 24 : 32,
        position: 'relative',
        background: 'linear-gradient(145deg, #0C0620 0%, #150D30 30%, #1A0E3A 55%, #0D0920 100%)',
        boxShadow: '0 8px 32px rgba(109, 40, 217, 0.14), 0 2px 8px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(167, 139, 250, 0.18)',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {isPhone ? (
        /* ── Compact Phone Layout (Only ~300px tall) ── */
        <div style={{ position: 'relative', padding: isSmall ? '16px 14px 14px' : '20px 18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Top row: Badges on left, Mini Slider Controls on right */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
                  borderRadius: 9999, padding: '3px 9px', fontSize: 10.5, fontWeight: 700,
                  letterSpacing: '0.04em', textTransform: 'uppercase', color: '#FFF',
                  boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
                }}
              >
                <Sparkles size={10} /> Spotlight
              </span>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 9999, padding: '3px 9px', fontSize: 11, fontWeight: 600, color: '#EDE9FE',
                }}
              >
                <Icon size={12} strokeWidth={2} />
                {categoryLabel(current.category)}
              </span>
            </div>

            {/* Slider Dots + Arrows */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              {templates.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { setCurrentIndex(idx); setProgressKey(k => k + 1); }}
                  style={{
                    width: idx === currentIndex ? 14 : 5,
                    height: 5,
                    borderRadius: 99,
                    background: idx === currentIndex ? '#A855F7' : 'rgba(255,255,255,0.25)',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }}
                />
              ))}
              <button
                onClick={() => { setCurrentIndex(prev => (prev - 1 + templates.length) % templates.length); setProgressKey(k => k + 1); }}
                style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
              >
                <ChevronLeft size={13} />
              </button>
              <button
                onClick={() => { setCurrentIndex(prev => (prev + 1) % templates.length); setProgressKey(k => k + 1); }}
                style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          {/* Title & Description */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.22 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              <h2 style={{ fontSize: isSmall ? 18 : 20, fontWeight: 800, color: '#FFF', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.25 }}>
                {current.title}
              </h2>
              <p style={{ fontSize: 12.5, color: 'rgba(237,233,254,0.85)', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {current.description}
              </p>

              {/* Mini Architecture Specs Capsule */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 10px', borderRadius: 9,
                background: 'rgba(0,0,0,0.32)', border: '1px solid rgba(255,255,255,0.10)',
                fontSize: 11, color: '#EDE9FE',
              }}>
                <span style={{ fontFamily: 'monospace', color: '#A78BFA', fontWeight: 600 }}>
                  Role: {categoryLabel(current.category)}
                </span>
                <span style={{ color: '#34D399', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  ★ 98 Score • {current.useCount ?? 0} uses
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Buttons Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <button
              id="spotlight-use-btn"
              onClick={() => onUse(current)}
              style={{
                flex: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                height: 38, borderRadius: 10, fontSize: 12.5, fontWeight: 700,
                border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #7C3AED, #A855F7)', color: 'white',
                boxShadow: '0 2px 10px rgba(124,58,237,0.30)',
              }}
              className="hover:brightness-110 active:scale-[0.98]"
            >
              <Zap size={14} strokeWidth={2.2} />
              <span>Use in Optimizer</span>
            </button>
            <button
              id="spotlight-quicklook-btn"
              onClick={() => onQuickLook(current)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                height: 38, padding: '0 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.10)',
                color: '#FFF', cursor: 'pointer',
              }}
              className="hover:!bg-[rgba(255,255,255,0.18)] active:scale-[0.98]"
            >
              <Eye size={13} />
              <span>Preview</span>
            </button>
            <button
              id="spotlight-bookmark-btn"
              onClick={() => onToggleBookmark(current.id)}
              style={{
                width: 38, height: 38, borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.20)',
                background: isBookmarked ? 'rgba(139,92,246,0.40)' : 'rgba(255,255,255,0.08)',
                color: isBookmarked ? '#F472B6' : '#EDE9FE',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
              }}
              className="hover:!bg-[rgba(255,255,255,0.18)] active:scale-[0.98]"
            >
              {isBookmarked ? <BookmarkCheck size={16} strokeWidth={2.2} /> : <Bookmark size={16} strokeWidth={2} />}
            </button>
          </div>
        </div>
      ) : (
        /* ── Tablet & Desktop 2-Column Showcase (~300px - 340px tall) ── */
        <div
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: isTablet ? '1.14fr 0.86fr' : '1.18fr 0.82fr',
            alignItems: 'stretch',
            padding: isTablet ? '26px 28px 22px' : '36px 44px 28px',
            gap: isTablet ? 24 : 36,
            minHeight: isTablet ? 280 : 320,
          }}
        >
          {/* Left info column */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: isTablet ? 240 : 270 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8, filter: 'blur(3px)' }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
                      borderRadius: 9999, padding: '4px 12px', fontSize: 11, fontWeight: 700,
                      letterSpacing: '0.05em', textTransform: 'uppercase',
                      boxShadow: '0 2px 10px rgba(124,58,237,0.35)',
                    }}
                  >
                    <Sparkles size={11} /> Spotlight
                  </span>
                  <span
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      borderRadius: 9999, padding: '4px 12px', fontSize: 11.5, fontWeight: 600, color: '#EDE9FE',
                    }}
                  >
                    <Icon size={13} strokeWidth={2} />
                    {categoryLabel(current.category)}
                  </span>
                </div>

                <h2
                  style={{
                    fontSize: isTablet ? 22 : 26,
                    fontWeight: 800,
                    color: '#FFFFFF',
                    letterSpacing: '-0.025em',
                    margin: 0,
                    lineHeight: 1.22,
                  }}
                >
                  {current.title}
                </h2>

                <p
                  style={{
                    fontSize: 13,
                    color: 'rgba(237,233,254,0.85)',
                    margin: 0,
                    lineHeight: 1.55,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {current.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, height: 24, overflow: 'hidden' }}>
                  {current.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        padding: '2px 9px',
                        borderRadius: 9999,
                        background: 'rgba(255,255,255,0.10)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        color: '#F3E8FF',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 14, paddingTop: 2 }}>
              <button
                id="spotlight-use-btn"
                onClick={() => onUse(current)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '0 20px', height: 40, borderRadius: 10, fontSize: 13, fontWeight: 700,
                  border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #7C3AED, #A855F7)', color: 'white',
                  boxShadow: '0 2px 10px rgba(124,58,237,0.30)',
                  transition: 'all 200ms ease',
                }}
                className="hover:brightness-110 hover:translate-y-[-1px]"
              >
                <Zap size={14} strokeWidth={2.2} />
                <span>Use in Optimizer</span>
                <ArrowUpRight size={13} />
              </button>

              <button
                id="spotlight-quicklook-btn"
                onClick={() => onQuickLook(current)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '0 16px', height: 40, borderRadius: 10, fontSize: 12.5, fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.10)',
                  color: '#FFFFFF', cursor: 'pointer', backdropFilter: 'blur(8px)',
                  transition: 'all 200ms ease',
                }}
                className="hover:!bg-[rgba(255,255,255,0.18)]"
              >
                <Eye size={14} />
                <span>Quick Look</span>
              </button>

              <button
                id="spotlight-bookmark-btn"
                onClick={() => onToggleBookmark(current.id)}
                style={{
                  width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 10, cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.20)',
                  background: isBookmarked ? 'rgba(139,92,246,0.40)' : 'rgba(255,255,255,0.08)',
                  color: isBookmarked ? '#F472B6' : '#EDE9FE',
                  transition: 'all 200ms ease', flexShrink: 0,
                }}
                className="hover:!bg-[rgba(255,255,255,0.18)]"
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark template'}
              >
                {isBookmarked ? <BookmarkCheck size={16} strokeWidth={2.2} /> : <Bookmark size={16} strokeWidth={2} />}
              </button>
            </div>
          </div>

          {/* Right preview column */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: 18,
                padding: isTablet ? '16px 18px' : '20px 22px',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.28)',
                position: 'relative',
                overflow: 'hidden',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.70)', textTransform: 'uppercase' }}>
                  Prompt Architecture v2.4
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  <div style={{ background: 'rgba(0,0,0,0.32)', borderRadius: 12, padding: '9px 12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Role Context</span>
                      <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>98 PromptScore</span>
                    </div>
                    <p style={{ fontSize: 11.5, color: '#F3E8FF', margin: 0, lineHeight: 1.45, fontFamily: 'monospace', wordBreak: 'break-word' }}>
                      &ldquo;Act as a specialist in {current.category}. Structure findings with high clarity and depth.&rdquo;
                    </p>
                  </div>

                  <div style={{ background: 'rgba(139,92,246,0.16)', borderRadius: 12, padding: '9px 12px', border: '1px solid rgba(139,92,246,0.32)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#F472B6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Engine Specs</span>
                      <span style={{ fontSize: 10.5, color: '#34D399', fontWeight: 600 }}>● Active</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: '#FFFFFF', flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Cpu size={12} style={{ color: '#A78BFA' }} />
                        Universal Engine
                      </span>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Award size={12} style={{ color: '#F59E0B' }} />
                        {current.useCount ?? 0} uses
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slider bar */}
            {templates.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {templates.map((_, idx) => {
                    const isActive = idx === currentIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => { setCurrentIndex(idx); setProgressKey(k => k + 1); }}
                        style={{
                          width: isActive ? 26 : 7,
                          height: 6,
                          borderRadius: 999,
                          background: isActive ? 'rgba(192, 132, 252, 0.3)' : 'rgba(255,255,255,0.20)',
                          border: 'none', padding: 0, cursor: 'pointer', position: 'relative', overflow: 'hidden',
                          transition: 'all 300ms ease',
                        }}
                      >
                        {isActive && (
                          <motion.div
                            key={`prog-${progressKey}-${idx}`}
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: SLIDE_DURATION_SEC, ease: 'linear' }}
                            style={{ height: '100%', background: 'linear-gradient(90deg, #A855F7, #EC4899)', borderRadius: 999 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button
                    onClick={() => { setCurrentIndex(prev => (prev - 1 + templates.length) % templates.length); setProgressKey(k => k + 1); }}
                    style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.10)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    className="hover:!bg-[rgba(255,255,255,0.22)]"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => { setCurrentIndex(prev => (prev + 1) % templates.length); setProgressKey(k => k + 1); }}
                    style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.10)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    className="hover:!bg-[rgba(255,255,255,0.22)]"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Notion / Apple Style Template Grid Card ── */
function NotionTemplateCard({
  template,
  onUse,
  onQuickLook,
  isBookmarked,
  onToggleBookmark,
  onSelectTag,
  isSmall,
}: {
  template: Template;
  onUse: (t: Template) => void;
  onQuickLook: (t: Template) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onSelectTag: (tag: string) => void;
  isSmall: boolean;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const Icon = CATEGORY_ICON_MAP[template.category] || Sparkles;
  const categoryStyle = getCategoryColor(template.category, isDark);

  return (
    <div
      id={`template-card-${template.id}`}
      onClick={() => onQuickLook(template)}
      style={{
        background: isDark ? 'rgba(20, 19, 32, 0.85)' : '#FFFFFF',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124,58,237,0.10)'}`,
        borderRadius: 20,
        padding: isSmall ? '16px 16px' : '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'relative',
        cursor: 'pointer',
        boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.35)' : '0 2px 8px rgba(109,40,217,0.03)',
        transition: 'all 220ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={isDark ? 'group hover:translate-y-[-3px] hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)] hover:!border-[rgba(167,139,250,0.35)]' : 'group hover:translate-y-[-3px] hover:shadow-[0_12px_32px_rgba(109,40,217,0.12)] hover:!border-[rgba(124,58,237,0.28)]'}
    >
      {/* Top row: Icon, Category Pill, Bookmark */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: categoryStyle.bg,
              color: categoryStyle.text,
              border: `1px solid ${categoryStyle.border}`,
              flexShrink: 0,
            }}
          >
            <Icon size={17} strokeWidth={1.8} />
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              background: categoryStyle.bg,
              color: categoryStyle.text,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            {categoryLabel(template.category)}
          </span>
        </div>

        <button
          id={`bookmark-${template.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(template.id);
          }}
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 7,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 180ms ease',
            background: isBookmarked ? (isDark ? 'rgba(139, 92, 246, 0.20)' : 'rgba(124,58,237,0.12)') : 'transparent',
            color: isBookmarked ? (isDark ? '#C084FC' : 'var(--color-primary)') : (isDark ? D.textMuted : 'rgba(107,107,138,0.45)'),
          }}
          className={!isBookmarked ? (isDark ? 'hover:!bg-[rgba(255,255,255,0.08)] hover:!text-[#C084FC]' : 'hover:!bg-[rgba(124,58,237,0.08)] hover:!text-[var(--color-primary)]') : ''}
          title={isBookmarked ? 'Saved in bookmarks' : 'Bookmark'}
        >
          {isBookmarked ? <BookmarkCheck size={14} strokeWidth={2.2} /> : <Bookmark size={14} strokeWidth={2} />}
        </button>
      </div>

      {/* Title & Description */}
      <div>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: isDark ? D.textPrimary : 'var(--color-text-primary)',
            margin: '0 0 6px',
            letterSpacing: -0.2,
            lineHeight: 1.35,
          }}
          className={isDark ? 'group-hover:text-[#C084FC] transition-colors' : 'group-hover:text-[var(--color-primary)] transition-colors'}
        >
          {template.title}
        </h3>
        <p
          style={{
            fontSize: 13,
            color: isDark ? D.textSecondary : 'var(--color-text-secondary)',
            lineHeight: 1.5,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {template.description}
        </p>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {template.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            onClick={(e) => {
              e.stopPropagation();
              onSelectTag(tag);
            }}
            style={{
              fontSize: 11.5,
              fontWeight: 500,
              padding: '3px 10px',
              borderRadius: 9999,
              background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(124,58,237,0.06)',
              color: isDark ? D.textSecondary : 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            className={isDark ? 'hover:!bg-[rgba(255,255,255,0.12)] hover:!text-[#FFFFFF]' : 'hover:!bg-[rgba(124,58,237,0.12)] hover:!text-[var(--color-primary)]'}
          >
            #{tag}
          </span>
        ))}
        {template.isNew && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 9999,
              background: isDark ? 'rgba(16,185,129,0.18)' : 'rgba(16,185,129,0.10)',
              color: isDark ? '#34D399' : '#059669',
              border: `1px solid ${isDark ? 'rgba(16,185,129,0.35)' : 'rgba(16,185,129,0.20)'}`,
              textTransform: 'uppercase',
            }}
          >
            New
          </span>
        )}
      </div>

      {/* Footer bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          paddingTop: 10,
          borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124,58,237,0.07)'}`,
          flexWrap: 'nowrap',
          gap: 6,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11.5,
            fontWeight: 500,
            color: isDark ? D.textMuted : 'var(--color-text-secondary)',
            whiteSpace: 'nowrap',
          }}
        >
          <Star size={11} strokeWidth={2} style={{ color: '#F59E0B' }} />
          {template.useCount?.toLocaleString() ?? '0'}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button
            id={`quicklook-btn-${template.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onQuickLook(template);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 9px',
              borderRadius: 8,
              fontSize: 11.5,
              fontWeight: 600,
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(124,58,237,0.14)'}`,
              background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#FFFFFF',
              color: isDark ? D.textSecondary : 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            className={isDark ? 'hover:!text-[#FFFFFF] hover:!border-[rgba(255,255,255,0.22)] hover:!bg-[rgba(255,255,255,0.10)]' : 'hover:!text-[var(--color-primary)] hover:!border-[rgba(124,58,237,0.30)] hover:!bg-[rgba(124,58,237,0.04)]'}
          >
            <Eye size={12} />
            <span>Preview</span>
          </button>

          <button
            id={`use-${template.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onUse(template);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 11px',
              borderRadius: 8,
              fontSize: 11.5,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
              color: 'white',
              boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
              transition: 'all 150ms ease',
            }}
            className="hover:brightness-110 active:scale-[0.98]"
          >
            <Zap size={12} strokeWidth={2.2} />
            <span>Use</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Notion / Linear Compact List Row ── */
function NotionListRow({
  template,
  onUse,
  onQuickLook,
  isBookmarked,
  onToggleBookmark,
  isPhone,
  isSmall,
}: {
  template: Template;
  onUse: (t: Template) => void;
  onQuickLook: (t: Template) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  isPhone: boolean;
  isSmall: boolean;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const Icon = CATEGORY_ICON_MAP[template.category] || Sparkles;
  const categoryStyle = getCategoryColor(template.category, isDark);

  return (
    <div
      onClick={() => onQuickLook(template)}
      style={{
        background: isDark ? 'rgba(20, 19, 32, 0.85)' : '#FFFFFF',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124,58,237,0.08)'}`,
        borderRadius: 14,
        padding: isSmall ? '10px 12px' : isPhone ? '12px 14px' : '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: isSmall ? 8 : 14,
        cursor: 'pointer',
        transition: 'all 160ms ease',
      }}
      className={isDark ? 'hover:!border-[rgba(167,139,250,0.3)] hover:!bg-[rgba(255,255,255,0.04)] hover:shadow-sm' : 'hover:!border-[rgba(124,58,237,0.22)] hover:!bg-[rgba(124,58,237,0.02)] hover:shadow-sm'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: isSmall ? 9 : 14, minWidth: 0, flex: 1 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: categoryStyle.bg,
            color: categoryStyle.text,
            border: `1px solid ${categoryStyle.border}`,
            flexShrink: 0,
          }}
        >
          <Icon size={15} strokeWidth={1.8} />
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <h4
              style={{
                fontSize: isSmall ? 13 : 14,
                fontWeight: 700,
                color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                margin: 0,
                letterSpacing: -0.1,
              }}
            >
              {template.title}
            </h4>
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                padding: '2px 5px',
                borderRadius: 4,
                background: categoryStyle.bg,
                color: categoryStyle.text,
                textTransform: 'uppercase',
              }}
            >
              {categoryLabel(template.category)}
            </span>
          </div>

          {!isPhone && (
            <p
              style={{
                fontSize: 12,
                color: isDark ? D.textSecondary : 'var(--color-text-secondary)',
                margin: '2px 0 0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {template.description}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: isSmall ? 6 : isPhone ? 8 : 14, flexShrink: 0 }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(template.id);
          }}
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 7,
            border: 'none',
            cursor: 'pointer',
            background: isBookmarked ? (isDark ? 'rgba(139, 92, 246, 0.20)' : 'rgba(124,58,237,0.12)') : 'transparent',
            color: isBookmarked ? (isDark ? '#C084FC' : 'var(--color-primary)') : (isDark ? D.textMuted : 'rgba(107,107,138,0.45)'),
          }}
        >
          {isBookmarked ? <BookmarkCheck size={14} strokeWidth={2.2} /> : <Bookmark size={14} strokeWidth={2} />}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onUse(template);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '5px 11px',
            borderRadius: 7,
            fontSize: 11.5,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
            color: 'white',
            boxShadow: '0 2px 6px rgba(124,58,237,0.2)',
          }}
        >
          <Zap size={11} strokeWidth={2} />
          <span>Use</span>
        </button>
      </div>
    </div>
  );
}

/* ── Apple-Grade "Quick Look" Modal Sheet ── */
function QuickLookModal({
  template,
  onClose,
  onUse,
  isBookmarked,
  onToggleBookmark,
  isSmall,
}: {
  template: Template | null;
  onClose: () => void;
  onUse: (t: Template) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  isSmall: boolean;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [copied, setCopied] = useState(false);

  if (!template) return null;
  const Icon = CATEGORY_ICON_MAP[template.category] || Sparkles;
  const categoryStyle = getCategoryColor(template.category, isDark);

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(`${template.title} — ${template.description}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(9, 9, 11, 0.70)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isSmall ? 12 : 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: isDark ? '#141320' : '#FFFFFF',
          borderRadius: isSmall ? 20 : 24,
          maxWidth: 580,
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: isDark ? '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.12)' : '0 25px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(124, 58, 237, 0.15)',
          position: 'relative',
        }}
      >
        {/* Top Gradient Header Accent */}
        <div
          style={{
            height: 8,
            width: '100%',
            background: 'linear-gradient(90deg, #6366F1, #8B5CF6, #EC4899)',
          }}
        />

        <div style={{ padding: isSmall ? '20px 16px' : '28px 32px' }}>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: isSmall ? 40 : 48,
                  height: isSmall ? 40 : 48,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: categoryStyle.bg,
                  color: categoryStyle.text,
                  border: `1px solid ${categoryStyle.border}`,
                  flexShrink: 0,
                }}
              >
                <Icon size={isSmall ? 18 : 22} strokeWidth={1.8} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 6,
                      background: categoryStyle.bg,
                      color: categoryStyle.text,
                      textTransform: 'uppercase',
                    }}
                  >
                    {categoryLabel(template.category)}
                  </span>
                </div>
                <h2 style={{ fontSize: isSmall ? 18 : 20, fontWeight: 800, color: isDark ? D.textPrimary : 'var(--color-text-primary)', margin: 0, letterSpacing: -0.3 }}>
                  {template.title}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: 'none',
                background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.05)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDark ? D.textSecondary : 'var(--color-text-secondary)',
                flexShrink: 0,
              }}
              className={isDark ? 'hover:!bg-[rgba(255,255,255,0.15)] hover:!text-[#FFFFFF]' : 'hover:!bg-[rgba(0,0,0,0.10)]'}
            >
              <X size={16} />
            </button>
          </div>

          {/* Description Block */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 14,
              background: isDark ? 'rgba(14, 13, 20, 0.75)' : 'rgba(124, 58, 237, 0.03)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124, 58, 237, 0.08)'}`,
              marginBottom: 18,
            }}
          >
            <h4 style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: isDark ? '#C084FC' : 'var(--color-primary)', letterSpacing: '0.05em', margin: '0 0 6px' }}>
              About this Template
            </h4>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: isDark ? D.textPrimary : 'var(--color-text-primary)', margin: 0 }}>
              {template.description}
            </p>
          </div>

          {/* Highlights / Best For */}
          <div style={{ marginBottom: 18 }}>
            <h4 style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: isDark ? D.textMuted : 'var(--color-text-secondary)', letterSpacing: '0.05em', margin: '0 0 10px' }}>
              Included Capabilities
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: isSmall ? '1fr' : '1fr 1fr', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: isDark ? D.textSecondary : 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={15} style={{ color: '#10B981', flexShrink: 0 }} />
                <span>Multi-turn prompt guidance</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: isDark ? D.textSecondary : 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={15} style={{ color: '#10B981', flexShrink: 0 }} />
                <span>Zero-shot precision tuning</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: isDark ? D.textSecondary : 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={15} style={{ color: '#10B981', flexShrink: 0 }} />
                <span>Role-specialized context</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: isDark ? D.textSecondary : 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={15} style={{ color: '#10B981', flexShrink: 0 }} />
                <span>High token efficiency</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {template.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 22 }}>
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 11.5,
                    fontWeight: 500,
                    padding: '3px 10px',
                    borderRadius: 9999,
                    background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(124,58,237,0.06)',
                    color: isDark ? D.textSecondary : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                  className={isDark ? 'hover:!bg-[rgba(255,255,255,0.12)] hover:!text-[#FFFFFF]' : 'hover:!bg-[rgba(124,58,237,0.12)] hover:!text-[var(--color-primary)]'}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.07)'}`, paddingTop: 18, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 7, flex: isSmall ? '1 1 100%' : '0 0 auto' }}>
              <button
                onClick={handleCopyTitle}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '9px 13px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0,0,0,0.12)'}`,
                  background: isDark ? 'rgba(255, 255, 255, 0.06)' : '#FFFFFF',
                  color: isDark ? D.textSecondary : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  flex: isSmall ? '1 1 auto' : undefined,
                }}
                className={isDark ? 'hover:!bg-[rgba(255,255,255,0.10)] hover:!text-[#FFFFFF]' : 'hover:!bg-gray-50'}
              >
                {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={() => onToggleBookmark(template.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '9px 13px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  border: `1px solid ${isDark ? 'rgba(167, 139, 250, 0.3)' : 'rgba(124,58,237,0.20)'}`,
                  background: isBookmarked ? (isDark ? 'rgba(139, 92, 246, 0.20)' : 'rgba(124,58,237,0.10)') : 'transparent',
                  color: isBookmarked ? (isDark ? '#C084FC' : 'var(--color-primary)') : (isDark ? D.textSecondary : 'var(--color-text-secondary)'),
                  cursor: 'pointer',
                  flex: isSmall ? '1 1 auto' : undefined,
                }}
              >
                {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                <span>{isBookmarked ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            <button
              onClick={() => {
                onClose();
                onUse(template);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                padding: '10px 20px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                color: 'white',
                boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
                flex: isSmall ? '1 1 100%' : '0 0 auto',
              }}
              className="hover:brightness-105 hover:translate-y-[-1px]"
            >
              <Zap size={14} strokeWidth={2.2} />
              <span>Launch in Optimizer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Templates Page Component ── */
export default function TemplatesPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Navigation & View state
  const [navTab, setNavTab] = useState<'curated' | 'categories' | 'popular' | 'saved'>('curated');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'name'>('popular');

  // Quick look modal state
  const [quickLookTemplate, setQuickLookTemplate] = useState<Template | null>(null);

  // Bookmarks persisted in localStorage
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Calibrated breakpoints across all devices
  const isDesktop = useMediaQuery('(min-width: 1081px)');
  const isTablet = useMediaQuery('(max-width: 1080px) and (min-width: 621px)');
  const isPhone = useMediaQuery('(max-width: 620px)');
  const isSmall = useMediaQuery('(max-width: 420px)');
  const isStackedSpotlight = useMediaQuery('(max-width: 920px)');

  // Calibrated page padding matching Vault & Optimizer workspace container
  const pagePadX = isSmall ? 16 : isPhone ? 20 : isTablet ? 32 : 48;

  // Adaptive Grid columns: Desktop (3-col), Tablet (2-col grid), Phone (1-col)
  const gridColumns = isPhone ? '1fr' : isDesktop ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)';

  // Load bookmarks on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (stored) {
        setBookmarkedIds(new Set(JSON.parse(stored)));
      }
    } catch (e) {
      console.warn('Could not read bookmarks from localStorage', e);
    }
  }, []);

  const handleToggleBookmark = useCallback((id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch (e) {
        console.warn('Could not save bookmarks to localStorage', e);
      }
      return next;
    });
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadTemplates();
      setTemplates(data);
    } catch (err: any) {
      console.error('Failed to load templates:', err);
      setError(err?.message || 'Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUse = useCallback(
    (template: Template) => {
      router.push(
        `/dashboard/optimizer?template_id=${encodeURIComponent(template.id)}&template=${encodeURIComponent(template.title)}`
      );
    },
    [router]
  );

  // Category facets
  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const t of templates) {
      if (t.category && !seen.includes(t.category)) seen.push(t.category);
    }
    seen.sort();
    return ['all', ...seen];
  }, [templates]);

  // Spotlight templates for the top carousel
  const spotlightTemplates = useMemo(() => {
    const featured = templates.filter((t) => t.isFeatured);
    if (featured.length > 0) return featured.slice(0, 5);
    return [...templates].sort((a, b) => (b.useCount ?? 0) - (a.useCount ?? 0)).slice(0, 4);
  }, [templates]);

  // Filtered & Sorted Templates
  const processedTemplates = useMemo(() => {
    let list = [...templates];

    // Filter by tab
    if (navTab === 'saved') {
      list = list.filter((t) => bookmarkedIds.has(t.id));
    } else if (navTab === 'popular') {
      list.sort((a, b) => (b.useCount ?? 0) - (a.useCount ?? 0));
    }

    // Filter by category
    if (activeCategory !== 'all') {
      list = list.filter((t) => t.category === activeCategory);
    }

    // Search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          t.model.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    // Sort order
    if (sortBy === 'popular') {
      list.sort((a, b) => (b.useCount ?? 0) - (a.useCount ?? 0));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [templates, navTab, activeCategory, searchQuery, sortBy, bookmarkedIds]);

  // Grouped by Category for Curated / Categories View
  const groupedByCategory = useMemo(() => {
    const map = new Map<string, Template[]>();
    for (const t of templates) {
      const cat = t.category || 'general';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(t);
    }
    return map;
  }, [templates]);

  const trendingTemplates = useMemo(() => {
    return templates.filter((t) => t.isTrending).slice(0, 6);
  }, [templates]);

  if (loading && templates.length === 0) {
    return <TemplatesHubSkeleton />;
  }

  return (
    <div
      id="templates-page"
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        paddingLeft: pagePadX,
        paddingRight: pagePadX,
        paddingTop: 8,
        paddingBottom: 64,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Top Header & Notion/Apple Style Search ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: isPhone ? 'column' : 'row',
          alignItems: isPhone ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          padding: isPhone ? '18px 0 14px' : '26px 0 22px',
          gap: 14,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h1
              style={{
                fontSize: isSmall ? 20 : isPhone ? 22 : 25,
                fontWeight: 800,
                color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                letterSpacing: -0.4,
                margin: 0,
              }}
            >
              Templates Hub
            </h1>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                background: isDark ? 'rgba(139, 92, 246, 0.18)' : 'rgba(124,58,237,0.08)',
                color: isDark ? '#C084FC' : 'var(--color-primary)',
                padding: '3px 8px',
                borderRadius: 9999,
                border: `1px solid ${isDark ? 'rgba(167, 139, 250, 0.3)' : 'rgba(124,58,237,0.18)'}`,
              }}
            >
              {templates.length} Curated
            </span>
          </div>
          <p style={{ fontSize: isSmall ? 12.5 : 13.5, color: isDark ? D.textSecondary : 'var(--color-text-secondary)', margin: 0 }}>
            Masterfully engineered prompt recipes for industry-leading AI models
          </p>
        </div>

        {/* Search & View Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: isPhone ? '100%' : 'auto' }}>
          <div style={{ position: 'relative', flex: isPhone ? 1 : '0 0 280px' }}>
            <Search
              size={15}
              strokeWidth={1.8}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: isDark ? D.textMuted : 'var(--color-text-secondary)',
                pointerEvents: 'none',
              }}
            />
            <input
              id="templates-search-input"
              type="text"
              placeholder="Search by role, task, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading || !!error}
              style={{
                width: '100%',
                padding: '9px 32px 9px 36px',
                fontSize: 13,
                background: isDark ? 'rgba(20, 19, 32, 0.85)' : '#FFFFFF',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(124,58,237,0.14)'}`,
                borderRadius: 10,
                outline: 'none',
                color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                transition: 'all 200ms ease',
              }}
              className={isDark ? 'focus:!border-[rgba(167,139,250,0.5)] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]' : 'focus:!border-[rgba(124,58,237,0.4)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.08)]'}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isDark ? D.textSecondary : 'var(--color-text-secondary)',
                  padding: 2,
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* View Switcher: Grid vs List */}
          <div
            style={{
              display: 'flex',
              background: isDark ? 'rgba(20, 19, 32, 0.85)' : 'rgba(124,58,237,0.06)',
              padding: 3,
              borderRadius: 10,
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124,58,237,0.10)'}`,
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 9px',
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'grid' ? (isDark ? 'rgba(255, 255, 255, 0.12)' : '#FFFFFF') : 'transparent',
                color: viewMode === 'grid' ? (isDark ? '#C084FC' : 'var(--color-primary)') : (isDark ? D.textMuted : 'var(--color-text-secondary)'),
                boxShadow: viewMode === 'grid' ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px 9px',
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'list' ? (isDark ? 'rgba(255, 255, 255, 0.12)' : '#FFFFFF') : 'transparent',
                color: viewMode === 'list' ? (isDark ? '#C084FC' : 'var(--color-primary)') : (isDark ? D.textMuted : 'var(--color-text-secondary)'),
                boxShadow: viewMode === 'list' ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Compact List View"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Notion / Apple Style Segmented Tab Navigation ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124,58,237,0.10)'}`,
          marginBottom: 22,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
          {[
            { id: 'curated', label: 'Curated Showcase', icon: Compass },
            { id: 'categories', label: 'All Categories', icon: LayoutGrid },
            { id: 'popular', label: 'Popular & Top Rated', icon: Flame },
            { id: 'saved', label: `Saved (${bookmarkedIds.size})`, icon: Bookmark },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = navTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setNavTab(tab.id as any);
                  if (tab.id === 'curated') setActiveCategory('all');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: isSmall ? '8px 10px' : '9px 14px',
                  borderRadius: '10px 10px 0 0',
                  border: 'none',
                  borderBottom: active ? `2px solid ${isDark ? '#8B5CF6' : 'var(--color-primary)'}` : '2px solid transparent',
                  background: 'transparent',
                  color: active ? (isDark ? '#C084FC' : 'var(--color-primary)') : (isDark ? D.textSecondary : 'var(--color-text-secondary)'),
                  fontWeight: active ? 700 : 500,
                  fontSize: isSmall ? 12 : 13,
                  cursor: 'pointer',
                  transition: 'all 160ms ease',
                  whiteSpace: 'nowrap',
                }}
                className={!active ? (isDark ? 'hover:!text-[#FFFFFF]' : 'hover:!text-[var(--color-text-primary)]') : ''}
              >
                <Icon size={14} strokeWidth={active ? 2.2 : 1.8} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Category Pills & Sort Dropdown */}
        {(navTab === 'categories' || navTab === 'curated' || searchQuery) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 6, overflowX: 'auto', width: isPhone ? '100%' : 'auto', scrollbarWidth: 'none' }}>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', flexWrap: isPhone ? 'nowrap' : 'wrap' }}>
              {categories.map((cat) => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: '4px 11px',
                      borderRadius: 999,
                      fontSize: 11.5,
                      fontWeight: active ? 700 : 500,
                      border: active ? `1px solid ${isDark ? '#8B5CF6' : 'var(--color-primary)'}` : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124,58,237,0.10)'}`,
                      background: active ? (isDark ? 'linear-gradient(135deg, #7C3AED, #A855F7)' : 'var(--color-primary)') : (isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF'),
                      color: active ? '#FFFFFF' : (isDark ? D.textSecondary : 'var(--color-text-secondary)'),
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                    className={!active ? (isDark ? 'hover:!border-[rgba(167,139,250,0.35)] hover:!text-[#FFFFFF]' : 'hover:!border-[rgba(124,58,237,0.25)] hover:!text-[var(--color-text-primary)]') : ''}
                  >
                    {categoryLabel(cat)}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Loading / Error / Empty States ── */}
      {loading ? (
        <div
          id="templates-loading-state"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            padding: '80px 0',
            color: isDark ? D.textSecondary : 'var(--color-text-secondary)',
          }}
        >
          <Loader2 size={32} strokeWidth={2} className="animate-spin" style={{ color: isDark ? '#C084FC' : 'var(--color-primary)' }} />
          <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>Loading curated template library…</p>
        </div>
      ) : error ? (
        <div
          id="templates-error-state"
          style={{
            textAlign: 'center',
            padding: '64px 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(239,68,68,0.12)',
              color: '#F87171',
            }}
          >
            <AlertCircle size={30} strokeWidth={1.5} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: isDark ? D.textPrimary : 'var(--color-text-primary)', margin: 0 }}>
            Unable to load templates
          </h3>
          <p style={{ fontSize: 14, color: isDark ? D.textSecondary : 'var(--color-text-secondary)', margin: 0, maxWidth: 420 }}>{error}</p>
          <button
            id="templates-retry-btn"
            onClick={fetchData}
            style={{
              marginTop: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 20px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(124,58,237,0.20)'}`,
              cursor: 'pointer',
              background: isDark ? 'rgba(20, 19, 32, 0.85)' : '#FFFFFF',
              color: isDark ? '#C084FC' : 'var(--color-primary)',
            }}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : (
        <>
          {/* ── TAB 1: CURATED SHOWCASE (Spotlight + Trending Shelf + Role Collections) ── */}
          {navTab === 'curated' && !searchQuery && activeCategory === 'all' && (
            <>
              {/* Spotlight Carousel */}
              <SpotlightBanner
                templates={spotlightTemplates}
                onUse={handleUse}
                onQuickLook={setQuickLookTemplate}
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={handleToggleBookmark}
                isPhone={isPhone}
                isTablet={isTablet}
                isSmall={isSmall}
              />

              {/* Trending Now Shelf */}
              {trendingTemplates.length > 0 && (
                <section style={{ marginBottom: isPhone ? 28 : 36 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <TrendingUp size={18} strokeWidth={2.2} style={{ color: '#F59E0B' }} />
                      <h2 style={{ fontSize: isSmall ? 15 : 17, fontWeight: 800, color: isDark ? D.textPrimary : 'var(--color-text-primary)', margin: 0 }}>
                        Trending Prompt Recipes
                      </h2>
                    </div>
                    <button
                      onClick={() => setNavTab('popular')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: isDark ? '#C084FC' : 'var(--color-primary)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      className="hover:underline"
                    >
                      <span>Explore all</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {viewMode === 'grid' ? (
                    isPhone ? (
                      <div
                        style={{
                          display: 'flex',
                          gap: 12,
                          overflowX: 'auto',
                          paddingBottom: 6,
                          scrollbarWidth: 'none',
                          scrollSnapType: 'x mandatory',
                          WebkitOverflowScrolling: 'touch',
                        }}
                      >
                        {trendingTemplates.slice(0, 6).map((t) => (
                          <div key={t.id} style={{ width: 'min(82vw, 290px)', flexShrink: 0, scrollSnapAlign: 'start' }}>
                            <NotionTemplateCard
                              template={t}
                              onUse={handleUse}
                              onQuickLook={setQuickLookTemplate}
                              isBookmarked={bookmarkedIds.has(t.id)}
                              onToggleBookmark={handleToggleBookmark}
                              onSelectTag={setSearchQuery}
                              isSmall={isSmall}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: isTablet ? 'repeat(2, 1fr)' : gridColumns,
                          gap: 16,
                        }}
                      >
                        {trendingTemplates.map((t) => (
                          <NotionTemplateCard
                            key={t.id}
                            template={t}
                            onUse={handleUse}
                            onQuickLook={setQuickLookTemplate}
                            isBookmarked={bookmarkedIds.has(t.id)}
                            onToggleBookmark={handleToggleBookmark}
                            onSelectTag={setSearchQuery}
                            isSmall={isSmall}
                          />
                        ))}
                      </div>
                    )
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {trendingTemplates.map((t) => (
                        <NotionListRow
                          key={t.id}
                          template={t}
                          onUse={handleUse}
                          onQuickLook={setQuickLookTemplate}
                          isBookmarked={bookmarkedIds.has(t.id)}
                          onToggleBookmark={handleToggleBookmark}
                          isPhone={isPhone}
                          isSmall={isSmall}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Browse by Domain / Roles Shelves */}
              <section style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={18} strokeWidth={2.2} style={{ color: isDark ? '#C084FC' : 'var(--color-primary)' }} />
                    <h2 style={{ fontSize: isSmall ? 15 : 17, fontWeight: 800, color: isDark ? D.textPrimary : 'var(--color-text-primary)', margin: 0 }}>
                      Role & Workflow Collections
                    </h2>
                  </div>
                  {isPhone && (
                    <span style={{ fontSize: 11, fontWeight: 600, color: isDark ? D.textSecondary : 'var(--color-text-secondary)' }}>
                      Swipe →
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: isSmall ? 18 : isPhone ? 22 : 30 }}>
                  {Array.from(groupedByCategory.entries()).map(([cat, list]) => {
                    const Icon = CATEGORY_ICON_MAP[cat] || Sparkles;
                    const style = getCategoryColor(cat, isDark);
                    const itemsToShow = isTablet ? 4 : isPhone ? 6 : 6;
                    return (
                      <div key={cat} style={{ background: isDark ? 'rgba(20, 19, 32, 0.65)' : 'rgba(250,250,252,0.6)', borderRadius: isSmall ? 16 : 20, padding: isSmall ? 12 : isPhone ? 16 : 22, border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124,58,237,0.06)'}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: style.bg, color: style.text, border: `1px solid ${style.border}`, flexShrink: 0 }}>
                              <Icon size={14} strokeWidth={2} />
                            </div>
                            <div>
                              <h3 style={{ fontSize: 14, fontWeight: 700, color: isDark ? D.textPrimary : 'var(--color-text-primary)', margin: 0 }}>
                                {categoryLabel(cat)} Specialists
                              </h3>
                            </div>
                            <span style={{ fontSize: 10.5, fontWeight: 700, color: isDark ? D.textSecondary : 'var(--color-text-secondary)', background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF', padding: '2px 7px', borderRadius: 99, border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.06)'}` }}>
                              {list.length}
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              setActiveCategory(cat);
                              setNavTab('categories');
                            }}
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: isDark ? '#C084FC' : 'var(--color-primary)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                            }}
                            className="hover:underline"
                          >
                            <span>View all</span>
                            <ChevronRight size={13} />
                          </button>
                        </div>

                        {viewMode === 'grid' ? (
                          isPhone ? (
                            <div
                              style={{
                                display: 'flex',
                                gap: 12,
                                overflowX: 'auto',
                                paddingBottom: 6,
                                scrollbarWidth: 'none',
                                scrollSnapType: 'x mandatory',
                                WebkitOverflowScrolling: 'touch',
                              }}
                            >
                              {list.slice(0, 6).map((t) => (
                                <div key={t.id} style={{ width: 'min(82vw, 290px)', flexShrink: 0, scrollSnapAlign: 'start' }}>
                                  <NotionTemplateCard
                                    template={t}
                                    onUse={handleUse}
                                    onQuickLook={setQuickLookTemplate}
                                    isBookmarked={bookmarkedIds.has(t.id)}
                                    onToggleBookmark={handleToggleBookmark}
                                    onSelectTag={setSearchQuery}
                                    isSmall={isSmall}
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: isTablet ? 'repeat(2, 1fr)' : gridColumns,
                                gap: 14,
                              }}
                            >
                              {list.slice(0, itemsToShow).map((t) => (
                                <NotionTemplateCard
                                  key={t.id}
                                  template={t}
                                  onUse={handleUse}
                                  onQuickLook={setQuickLookTemplate}
                                  isBookmarked={bookmarkedIds.has(t.id)}
                                  onToggleBookmark={handleToggleBookmark}
                                  onSelectTag={setSearchQuery}
                                  isSmall={isSmall}
                                />
                              ))}
                            </div>
                          )
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {list.slice(0, itemsToShow).map((t) => (
                              <NotionListRow
                                key={t.id}
                                template={t}
                                onUse={handleUse}
                                onQuickLook={setQuickLookTemplate}
                                isBookmarked={bookmarkedIds.has(t.id)}
                                onToggleBookmark={handleToggleBookmark}
                                isPhone={isPhone}
                                isSmall={isSmall}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {/* ── TAB 2 / FILTERED / SEARCH / LIST VIEW ── */}
          {(navTab !== 'curated' || searchQuery || activeCategory !== 'all') && (
            <div>
              {/* Header result counter */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: isDark ? D.textSecondary : 'var(--color-text-secondary)' }}>
                  Showing {processedTemplates.length} {processedTemplates.length === 1 ? 'template' : 'templates'}
                  {activeCategory !== 'all' && ` in ${categoryLabel(activeCategory)}`}
                  {searchQuery && ` matching "${searchQuery}"`}
                </span>

                {navTab === 'saved' && bookmarkedIds.size > 0 && (
                  <button
                    onClick={() => {
                      setBookmarkedIds(new Set());
                      localStorage.removeItem(BOOKMARKS_STORAGE_KEY);
                    }}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#EF4444',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    className="hover:underline"
                  >
                    Clear all saved
                  </button>
                )}
              </div>

              {/* Results Grid / List */}
              {processedTemplates.length === 0 ? (
                <div
                  id="templates-empty-state"
                  style={{
                    textAlign: 'center',
                    padding: '64px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isDark ? 'rgba(139, 92, 246, 0.18)' : 'rgba(124,58,237,0.08)',
                      color: isDark ? '#C084FC' : 'var(--color-primary)',
                    }}
                  >
                    <Search size={28} strokeWidth={1.5} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: isDark ? D.textPrimary : 'var(--color-text-primary)', margin: 0 }}>
                    {navTab === 'saved' ? 'No saved templates yet' : 'No templates match your filter'}
                  </h3>
                  <p style={{ fontSize: 14, color: isDark ? D.textSecondary : 'var(--color-text-secondary)', margin: 0 }}>
                    {navTab === 'saved'
                      ? 'Click the bookmark icon on any template card to save it for quick access.'
                      : 'Try resetting your search or choosing a different category.'}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory('all');
                      if (navTab === 'saved') setNavTab('curated');
                    }}
                    style={{
                      marginTop: 8,
                      padding: '8px 18px',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(124,58,237,0.20)'}`,
                      cursor: 'pointer',
                      background: isDark ? 'rgba(20, 19, 32, 0.85)' : '#FFFFFF',
                      color: isDark ? '#C084FC' : 'var(--color-primary)',
                    }}
                  >
                    Reset filters
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: gridColumns,
                    gap: 16,
                  }}
                >
                  {processedTemplates.map((t) => (
                    <NotionTemplateCard
                      key={t.id}
                      template={t}
                      onUse={handleUse}
                      onQuickLook={setQuickLookTemplate}
                      isBookmarked={bookmarkedIds.has(t.id)}
                      onToggleBookmark={handleToggleBookmark}
                      onSelectTag={setSearchQuery}
                      isSmall={isSmall}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {processedTemplates.map((t) => (
                    <NotionListRow
                      key={t.id}
                      template={t}
                      onUse={handleUse}
                      onQuickLook={setQuickLookTemplate}
                      isBookmarked={bookmarkedIds.has(t.id)}
                      onToggleBookmark={handleToggleBookmark}
                      isPhone={isPhone}
                      isSmall={isSmall}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Apple Quick Look Modal ── */}
      <QuickLookModal
        template={quickLookTemplate}
        onClose={() => setQuickLookTemplate(null)}
        onUse={handleUse}
        isBookmarked={quickLookTemplate ? bookmarkedIds.has(quickLookTemplate.id) : false}
        onToggleBookmark={handleToggleBookmark}
        isSmall={isSmall}
      />
    </div>
  );
}
