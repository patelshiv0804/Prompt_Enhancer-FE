'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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

const CATEGORY_COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  developer: { bg: 'rgba(59, 130, 246, 0.08)', text: '#2563EB', border: 'rgba(59, 130, 246, 0.20)' },
  marketer: { bg: 'rgba(236, 72, 153, 0.08)', text: '#DB2777', border: 'rgba(236, 72, 153, 0.20)' },
  researcher: { bg: 'rgba(139, 92, 246, 0.08)', text: '#7C3AED', border: 'rgba(139, 92, 246, 0.20)' },
  consultant: { bg: 'rgba(16, 185, 129, 0.08)', text: '#059669', border: 'rgba(16, 185, 129, 0.20)' },
  entrepreneur: { bg: 'rgba(245, 158, 11, 0.08)', text: '#D97706', border: 'rgba(245, 158, 11, 0.20)' },
  educator: { bg: 'rgba(14, 165, 233, 0.08)', text: '#0284C7', border: 'rgba(14, 165, 233, 0.20)' },
  writer: { bg: 'rgba(168, 85, 247, 0.08)', text: '#9333EA', border: 'rgba(168, 85, 247, 0.20)' },
  student: { bg: 'rgba(20, 184, 166, 0.08)', text: '#0D9488', border: 'rgba(20, 184, 166, 0.20)' },
  general: { bg: 'rgba(124, 58, 237, 0.08)', text: '#7C3AED', border: 'rgba(124, 58, 237, 0.20)' },
};

function getCategoryColor(category: string) {
  return CATEGORY_COLOR_MAP[category.toLowerCase()] || CATEGORY_COLOR_MAP.general;
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
  isMobile,
  isTablet,
}: {
  templates: Template[];
  onUse: (t: Template) => void;
  onQuickLook: (t: Template) => void;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
  isMobile: boolean;
  isTablet: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (templates.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % templates.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [templates.length]);

  if (templates.length === 0) return null;
  const current = templates[currentIndex] || templates[0];
  const Icon = CATEGORY_ICON_MAP[current.category] || Sparkles;
  const isBookmarked = bookmarkedIds.has(current.id);

  return (
    <div
      id="spotlight-carousel-banner"
      style={{
        borderRadius: 28,
        overflow: 'hidden',
        marginBottom: isMobile ? 24 : 36,
        position: 'relative',
        background: 'linear-gradient(135deg, #09090D 0%, #150D2A 50%, #200E3E 100%)',
        boxShadow: '0 20px 48px rgba(109,40,217,0.25), 0 4px 14px rgba(0,0,0,0.14)',
        border: '1px solid rgba(139,92,246,0.28)',
        color: '#FFFFFF',
        minHeight: isMobile ? 'auto' : 320,
      }}
    >
      {/* Ambient background glow & radial highlights */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 15% 25%, rgba(139,92,246,0.36) 0%, transparent 60%), radial-gradient(ellipse at 85% 70%, rgba(236,72,153,0.25) 0%, transparent 55%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: isTablet ? '1fr' : '1.15fr 0.85fr',
          alignItems: 'center',
          padding: isMobile ? '28px 20px' : '40px 44px',
          gap: isMobile ? 24 : 36,
        }}
      >
        {/* LEFT COLUMN: Metadata, Title, Description, Tags, Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center' }}>
          {/* Top Pill Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                borderRadius: 9999,
                padding: '5px 13px',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                boxShadow: '0 2px 10px rgba(139,92,246,0.45)',
              }}
            >
              <Sparkles size={12} /> Spotlight
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 9999,
                padding: '5px 13px',
                fontSize: 12,
                fontWeight: 600,
                color: '#EDE9FE',
              }}
            >
              <Icon size={13} strokeWidth={2} />
              {categoryLabel(current.category)}
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 9999,
                padding: '5px 11px',
                fontSize: 11.5,
                color: 'rgba(255,255,255,0.85)',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: current.modelColor }} />
              {current.model}
            </span>
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: isMobile ? 22 : 27,
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.025em',
              margin: 0,
              lineHeight: 1.25,
            }}
          >
            {current.title}
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: 14,
              color: 'rgba(237,233,254,0.82)',
              margin: 0,
              lineHeight: 1.65,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {current.description}
          </p>

          {/* Tags */}
          {current.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {current.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: '4px 11px',
                    borderRadius: 9999,
                    background: 'rgba(255,255,255,0.10)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    color: '#F3E8FF',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, flexWrap: 'wrap', marginTop: 4 }}>
            <button
              id="spotlight-use-btn"
              onClick={() => onUse(current)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '11px 22px',
                borderRadius: 12,
                fontSize: 13.5,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                color: 'white',
                boxShadow: '0 4px 20px rgba(139,92,246,0.45)',
                transition: 'all 200ms ease',
              }}
              className="hover:brightness-110 hover:translate-y-[-1px]"
            >
              <Zap size={15} strokeWidth={2.2} />
              <span>Use in Optimizer</span>
              <ArrowUpRight size={14} />
            </button>

            <button
              id="spotlight-quicklook-btn"
              onClick={() => onQuickLook(current)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '11px 18px',
                borderRadius: 12,
                fontSize: 13.5,
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.22)',
                background: 'rgba(255,255,255,0.10)',
                color: '#FFFFFF',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
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
                width: 42,
                height: 42,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.20)',
                background: isBookmarked ? 'rgba(139,92,246,0.40)' : 'rgba(255,255,255,0.08)',
                color: isBookmarked ? '#F472B6' : '#EDE9FE',
                transition: 'all 200ms ease',
              }}
              className="hover:!bg-[rgba(255,255,255,0.18)]"
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark template'}
            >
              {isBookmarked ? <BookmarkCheck size={18} strokeWidth={2.2} /> : <Bookmark size={18} strokeWidth={2} />}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Visual Recipe Glass Preview Card + Carousel Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Frosted Glass Recipe Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: 20,
              padding: '22px 24px',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.30)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top window dots & status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#EF4444' }} />
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#F59E0B' }} />
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#10B981' }} />
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase' }}>
                Prompt Architecture v2.4
              </span>
            </div>

            {/* Prompt Recipe Content Blueprint */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div style={{ background: 'rgba(0,0,0,0.28)', borderRadius: 12, padding: '11px 14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Role Context</span>
                  <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)' }}>98 PromptScore</span>
                </div>
                <p style={{ fontSize: 12.5, color: '#F3E8FF', margin: 0, lineHeight: 1.45, fontFamily: 'monospace' }}>
                  &ldquo;Act as a specialist in {current.category}. Structure findings with high clarity and depth.&rdquo;
                </p>
              </div>

              <div style={{ background: 'rgba(139,92,246,0.14)', borderRadius: 12, padding: '11px 14px', border: '1px solid rgba(139,92,246,0.30)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: '#F472B6', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Engine Specs</span>
                  <span style={{ fontSize: 10.5, color: '#34D399', fontWeight: 600 }}>● Active</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#FFFFFF' }}>
                  <Cpu size={14} style={{ color: '#A78BFA' }} />
                  <span>Engine: {current.model}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
                  <Award size={14} style={{ color: '#F59E0B' }} />
                  <span>{current.useCount ?? 0} uses</span>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Navigation Toolbar */}
          {templates.length > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '2px 4px 0',
              }}
            >
              {/* Indicator Dots */}
              <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                {templates.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    style={{
                      width: idx === currentIndex ? 24 : 7,
                      height: 7,
                      borderRadius: 999,
                      background: idx === currentIndex ? '#C084FC' : 'rgba(255,255,255,0.25)',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'all 250ms ease',
                    }}
                  />
                ))}
              </div>

              {/* Prev / Next Arrows */}
              <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                <button
                  onClick={() => setCurrentIndex((prev) => (prev - 1 + templates.length) % templates.length)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.18)',
                    background: 'rgba(255,255,255,0.10)',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 180ms ease',
                  }}
                  className="hover:!bg-[rgba(255,255,255,0.22)]"
                  title="Previous template"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % templates.length)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.18)',
                    background: 'rgba(255,255,255,0.10)',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 180ms ease',
                  }}
                  className="hover:!bg-[rgba(255,255,255,0.22)]"
                  title="Next template"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
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
}: {
  template: Template;
  onUse: (t: Template) => void;
  onQuickLook: (t: Template) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onSelectTag: (tag: string) => void;
}) {
  const Icon = CATEGORY_ICON_MAP[template.category] || Sparkles;
  const categoryStyle = getCategoryColor(template.category);

  return (
    <div
      id={`template-card-${template.id}`}
      onClick={() => onQuickLook(template)}
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(124,58,237,0.10)',
        borderRadius: 20,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'relative',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(109,40,217,0.03)',
        transition: 'all 220ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className="group hover:translate-y-[-3px] hover:shadow-[0_12px_32px_rgba(109,40,217,0.12)] hover:!border-[rgba(124,58,237,0.28)]"
    >
      {/* Top row: Icon, Category Pill, AI Model badge, Bookmark */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              background: 'rgba(124,58,237,0.05)',
              padding: '2px 8px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: template.modelColor }} />
            {template.model}
          </span>

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
              background: isBookmarked ? 'rgba(124,58,237,0.12)' : 'transparent',
              color: isBookmarked ? 'var(--color-primary)' : 'rgba(107,107,138,0.45)',
            }}
            className={!isBookmarked ? 'hover:!bg-[rgba(124,58,237,0.08)] hover:!text-[var(--color-primary)]' : ''}
            title={isBookmarked ? 'Saved in bookmarks' : 'Bookmark'}
          >
            {isBookmarked ? <BookmarkCheck size={14} strokeWidth={2.2} /> : <Bookmark size={14} strokeWidth={2} />}
          </button>
        </div>
      </div>

      {/* Title & Description */}
      <div>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: '0 0 6px',
            letterSpacing: -0.2,
            lineHeight: 1.35,
          }}
          className="group-hover:text-[var(--color-primary)] transition-colors"
        >
          {template.title}
        </h3>
        <p
          style={{
            fontSize: 13,
            color: 'var(--color-text-secondary)',
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
        {template.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            onClick={(e) => {
              e.stopPropagation();
              onSelectTag(tag);
            }}
            style={{
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 6,
              background: 'rgba(124,58,237,0.06)',
              color: 'var(--color-primary)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            className="hover:!bg-[rgba(124,58,237,0.14)]"
          >
            #{tag}
          </span>
        ))}
        {template.isNew && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 6,
              background: 'rgba(16,185,129,0.10)',
              color: '#059669',
              border: '1px solid rgba(16,185,129,0.20)',
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
          borderTop: '1px solid rgba(124,58,237,0.07)',
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
          }}
        >
          <Star size={11} strokeWidth={2} style={{ color: '#F59E0B' }} />
          {template.useCount?.toLocaleString() ?? '0'} uses
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
              padding: '5px 10px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              border: '1px solid rgba(124,58,237,0.14)',
              background: '#FFFFFF',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            className="hover:!text-[var(--color-primary)] hover:!border-[rgba(124,58,237,0.30)] hover:!bg-[rgba(124,58,237,0.04)]"
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
              gap: 5,
              padding: '5px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
              color: 'white',
              boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
              transition: 'all 180ms ease',
            }}
            className="hover:translate-y-[-1px] hover:brightness-105"
          >
            <Zap size={12} strokeWidth={2} />
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
  isMobile,
}: {
  template: Template;
  onUse: (t: Template) => void;
  onQuickLook: (t: Template) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  isMobile: boolean;
}) {
  const Icon = CATEGORY_ICON_MAP[template.category] || Sparkles;
  const categoryStyle = getCategoryColor(template.category);

  return (
    <div
      onClick={() => onQuickLook(template)}
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(124,58,237,0.08)',
        borderRadius: 14,
        padding: isMobile ? '12px 14px' : '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        cursor: 'pointer',
        transition: 'all 160ms ease',
      }}
      className="hover:!border-[rgba(124,58,237,0.22)] hover:!bg-[rgba(124,58,237,0.02)] hover:shadow-sm"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: categoryStyle.bg,
            color: categoryStyle.text,
            flexShrink: 0,
          }}
        >
          <Icon size={16} strokeWidth={1.8} />
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h4
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
                letterSpacing: -0.1,
              }}
            >
              {template.title}
            </h4>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 5,
                background: categoryStyle.bg,
                color: categoryStyle.text,
                textTransform: 'uppercase',
              }}
            >
              {categoryLabel(template.category)}
            </span>
          </div>

          {!isMobile && (
            <p
              style={{
                fontSize: 12,
                color: 'var(--color-text-secondary)',
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

      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14, flexShrink: 0 }}>
        {!isMobile && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              background: 'rgba(124,58,237,0.04)',
              padding: '3px 8px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: template.modelColor }} />
            {template.model}
          </span>
        )}

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
            background: isBookmarked ? 'rgba(124,58,237,0.12)' : 'transparent',
            color: isBookmarked ? 'var(--color-primary)' : 'rgba(107,107,138,0.45)',
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
            gap: 5,
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
            color: 'white',
            boxShadow: '0 2px 6px rgba(124,58,237,0.2)',
          }}
        >
          <Zap size={12} strokeWidth={2} />
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
}: {
  template: Template | null;
  onClose: () => void;
  onUse: (t: Template) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!template) return null;
  const Icon = CATEGORY_ICON_MAP[template.category] || Sparkles;
  const categoryStyle = getCategoryColor(template.category);

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
        background: 'rgba(9, 9, 11, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: 24,
          maxWidth: 580,
          width: '100%',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(124, 58, 237, 0.15)',
          overflow: 'hidden',
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

        <div style={{ padding: '28px 32px' }}>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: categoryStyle.bg,
                  color: categoryStyle.text,
                  border: `1px solid ${categoryStyle.border}`,
                }}
              >
                <Icon size={22} strokeWidth={1.8} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: categoryStyle.bg,
                      color: categoryStyle.text,
                      textTransform: 'uppercase',
                    }}
                  >
                    {categoryLabel(template.category)}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--color-text-secondary)',
                      background: 'rgba(124,58,237,0.06)',
                      padding: '2px 8px',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: template.modelColor }} />
                    {template.model}
                  </span>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, letterSpacing: -0.3 }}>
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
                background: 'rgba(0,0,0,0.05)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-secondary)',
              }}
              className="hover:!bg-[rgba(0,0,0,0.10)]"
            >
              <X size={16} />
            </button>
          </div>

          {/* Description Block */}
          <div
            style={{
              padding: '16px 18px',
              borderRadius: 14,
              background: 'rgba(124, 58, 237, 0.03)',
              border: '1px solid rgba(124, 58, 237, 0.08)',
              marginBottom: 20,
            }}
          >
            <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.05em', margin: '0 0 6px' }}>
              About this Template
            </h4>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-primary)', margin: 0 }}>
              {template.description}
            </p>
          </div>

          {/* Highlights / Best For */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.05em', margin: '0 0 10px' }}>
              Included Capabilities
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={15} style={{ color: '#10B981', flexShrink: 0 }} />
                <span>Multi-turn prompt guidance</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={15} style={{ color: '#10B981', flexShrink: 0 }} />
                <span>Zero-shot precision tuning</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={15} style={{ color: '#10B981', flexShrink: 0 }} />
                <span>Role-specialized context</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                <CheckCircle2 size={15} style={{ color: '#10B981', flexShrink: 0 }} />
                <span>High token efficiency</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {template.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
              {template.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 8,
                    background: 'rgba(124, 58, 237, 0.07)',
                    color: 'var(--color-primary)',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: 20 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleCopyTitle}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  border: '1px solid rgba(0,0,0,0.12)',
                  background: '#FFFFFF',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                }}
                className="hover:!bg-gray-50"
              >
                {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={() => onToggleBookmark(template.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  border: '1px solid rgba(124,58,237,0.20)',
                  background: isBookmarked ? 'rgba(124,58,237,0.10)' : 'transparent',
                  color: isBookmarked ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
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
                gap: 7,
                padding: '10px 22px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                color: 'white',
                boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
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

  // Responsive hooks & padding aligned with Vault / Optimizer
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const pagePadX = isMobile ? 16 : isTablet ? 32 : 48;

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
    return templates.filter((t) => t.isTrending).slice(0, 4);
  }, [templates]);

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
          flexDirection: isTablet ? 'column' : 'row',
          alignItems: isTablet ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '20px 0 16px' : '28px 0 24px',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h1
              style={{
                fontSize: isMobile ? 22 : 24,
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                letterSpacing: -0.4,
                margin: 0,
              }}
            >
              Templates Hub
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: 'rgba(124,58,237,0.08)',
                color: 'var(--color-primary)',
                padding: '3px 9px',
                borderRadius: 9999,
                border: '1px solid rgba(124,58,237,0.18)',
              }}
            >
              {templates.length} Curated
            </span>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--color-text-secondary)', margin: 0 }}>
            Masterfully engineered prompt recipes for industry-leading AI models
          </p>
        </div>

        {/* Search & View Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: isTablet ? '100%' : 'auto' }}>
          <div style={{ position: 'relative', flex: isTablet ? 1 : '0 0 280px' }}>
            <Search
              size={15}
              strokeWidth={1.8}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-secondary)',
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
                background: '#FFFFFF',
                border: '1px solid rgba(124,58,237,0.14)',
                borderRadius: 10,
                outline: 'none',
                color: 'var(--color-text-primary)',
                transition: 'all 200ms ease',
              }}
              className="focus:!border-[rgba(124,58,237,0.4)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.08)]"
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
                  color: 'var(--color-text-secondary)',
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
              background: 'rgba(124,58,237,0.06)',
              padding: 3,
              borderRadius: 10,
              border: '1px solid rgba(124,58,237,0.10)',
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 9px',
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                boxShadow: viewMode === 'grid' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
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
                background: viewMode === 'list' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'list' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                boxShadow: viewMode === 'list' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
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
          borderBottom: '1px solid rgba(124,58,237,0.10)',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
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
                  padding: '9px 14px',
                  borderRadius: '10px 10px 0 0',
                  border: 'none',
                  borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
                  background: 'transparent',
                  color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontWeight: active ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 160ms ease',
                  whiteSpace: 'nowrap',
                }}
                className={!active ? 'hover:!text-[var(--color-text-primary)]' : ''}
              >
                <Icon size={14} strokeWidth={active ? 2.2 : 1.8} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Category Pills & Sort Dropdown */}
        {(navTab === 'categories' || navTab === 'curated' || searchQuery) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 6, overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
              {categories.map((cat) => {
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: active ? 700 : 500,
                      border: active ? '1px solid var(--color-primary)' : '1px solid rgba(124,58,237,0.10)',
                      background: active ? 'var(--color-primary)' : '#FFFFFF',
                      color: active ? '#FFFFFF' : 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      whiteSpace: 'nowrap',
                    }}
                    className={!active ? 'hover:!border-[rgba(124,58,237,0.25)] hover:!text-[var(--color-text-primary)]' : ''}
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
            color: 'var(--color-text-secondary)',
          }}
        >
          <Loader2 size={32} strokeWidth={2} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
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
              background: 'rgba(239,68,68,0.08)',
              color: '#dc2626',
            }}
          >
            <AlertCircle size={30} strokeWidth={1.5} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
            Unable to load templates
          </h3>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0, maxWidth: 420 }}>{error}</p>
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
              border: '1px solid rgba(124,58,237,0.20)',
              cursor: 'pointer',
              background: '#FFFFFF',
              color: 'var(--color-primary)',
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
                isMobile={isMobile}
                isTablet={isTablet}
              />

              {/* Trending Now Shelf */}
              {trendingTemplates.length > 0 && (
                <section style={{ marginBottom: 36 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <TrendingUp size={18} strokeWidth={2.2} style={{ color: '#F59E0B' }} />
                      <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                        Trending Prompt Recipes
                      </h2>
                    </div>
                    <button
                      onClick={() => setNavTab('popular')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--color-primary)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                      className="hover:underline"
                    >
                      <span>Explore all popular</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
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
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Browse by Domain / Roles Shelves */}
              <section style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={18} strokeWidth={2.2} style={{ color: 'var(--color-primary)' }} />
                    <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                      Role & Workflow Collections
                    </h2>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  {Array.from(groupedByCategory.entries()).map(([cat, list]) => {
                    const Icon = CATEGORY_ICON_MAP[cat] || Sparkles;
                    const style = getCategoryColor(cat);
                    return (
                      <div key={cat} style={{ background: 'rgba(250,250,252,0.6)', borderRadius: 20, padding: isMobile ? 16 : 24, border: '1px solid rgba(124,58,237,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: style.bg, color: style.text }}>
                              <Icon size={16} strokeWidth={2} />
                            </div>
                            <div>
                              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                                {categoryLabel(cat)} Specialists
                              </h3>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', background: '#FFFFFF', padding: '2px 8px', borderRadius: 99, border: '1px solid rgba(0,0,0,0.06)' }}>
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
                              color: 'var(--color-primary)',
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

                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                            gap: 14,
                          }}
                        >
                          {list.slice(0, 3).map((t) => (
                            <NotionTemplateCard
                              key={t.id}
                              template={t}
                              onUse={handleUse}
                              onQuickLook={setQuickLookTemplate}
                              isBookmarked={bookmarkedIds.has(t.id)}
                              onToggleBookmark={handleToggleBookmark}
                              onSelectTag={setSearchQuery}
                            />
                          ))}
                        </div>
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
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
                      background: 'rgba(124,58,237,0.08)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    <Search size={28} strokeWidth={1.5} />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                    {navTab === 'saved' ? 'No saved templates yet' : 'No templates match your filter'}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', margin: 0 }}>
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
                      border: '1px solid rgba(124,58,237,0.20)',
                      cursor: 'pointer',
                      background: '#FFFFFF',
                      color: 'var(--color-primary)',
                    }}
                  >
                    Reset filters
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
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
                      isMobile={isMobile}
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
      />
    </div>
  );
}
