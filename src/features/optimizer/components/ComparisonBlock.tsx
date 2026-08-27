'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Copy, RefreshCw, Bookmark, ArrowRightToLine,
  Sparkles, Code2, Search, Megaphone, GraduationCap, Briefcase,
  School, Rocket, PenTool, BarChart3, Palette, Video, Wand2,
  CheckCircle2, AlertTriangle, Minus, FileText, Layers, Monitor,
  Smartphone, Server, Database, ShieldCheck, Globe, Cpu, Terminal,
  Lightbulb, DollarSign, Scale, ShoppingCart, Users, Mail, Radio,
  Activity, PieChart, TrendingUp, BookOpen, Building2, Layout, LayoutTemplate, Award, Zap, GitBranch, ChevronDown, Feather, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FormattedPromptViewer from './FormattedPromptViewer';

import { ROLES, ROLE_MODES, getModeIcon } from '@/constants/roles';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTheme, D } from '@/theme/theme';

function scoreColor(s: number) {
  if (s >= 80) return 'var(--color-success)';
  if (s >= 55) return 'var(--color-primary)';
  return '#F59E0B';
}

function scoreLabel(s: number) {
  if (s >= 90) return 'Excellent';
  if (s >= 75) return 'Good';
  if (s >= 55) return 'Fair';
  return 'Needs Work';
}

function useCountUp(target: number, active: boolean, duration = 1200): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) { setValue(0); return; }
    let current = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [target, active, duration]);
  return value;
}

function formatPromptText(text?: string): string {
  if (!text) return '';
  let cleaned = text.trim();

  const markers = ['ENHANCED PROMPT:', 'ENHANCED PROMPT', 'Enhanced Prompt:'];
  for (const m of markers) {
    const idx = cleaned.indexOf(m);
    if (idx !== -1) {
      cleaned = cleaned.substring(idx + m.length).trim();
      break;
    }
  }

  // If there's still a DIAGNOSED MODE header before the main content, strip it out
  if (cleaned.includes('DIAGNOSED MODE:') || cleaned.includes('DIAGNOSIS NOTES:')) {
    const actIdx = cleaned.search(/(Act as|You are|Your task|System Prompt|# )/i);
    if (actIdx !== -1) {
      cleaned = cleaned.substring(actIdx).trim();
    }
  }

  return cleaned;
}

/* ── Inline Score Panel ─────────────────────────────────────────────────── */
function InlineScorePanel({ active, analysisResult }: { active: boolean; analysisResult: any }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const score = analysisResult?.overall_score || 0;
  const animScore = useCountUp(score, active);
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (animScore / 100) * circ;

  const dims = analysisResult?.dimensions || {};
  const mappedDimensions = [
    { id: 'clarity', label: 'Clarity', status: dims.clarity?.score >= 80 ? 'good' : dims.clarity?.score >= 55 ? 'warning' : 'neutral', icon: CheckCircle2, desc: dims.clarity?.explanation || 'Instructions are direct and unambiguous.', score: dims.clarity?.score || 0 },
    { id: 'context', label: 'Context', status: dims.context?.score >= 80 ? 'good' : dims.context?.score >= 55 ? 'warning' : 'neutral', icon: CheckCircle2, desc: dims.context?.explanation || 'Sufficient background information provided.', score: dims.context?.score || 0 },
    { id: 'role', label: 'Role', status: dims.role_definition?.score >= 80 ? 'good' : dims.role_definition?.score >= 55 ? 'warning' : 'neutral', icon: Minus, desc: dims.role_definition?.explanation || 'Define AI persona or domain context.', score: dims.role_definition?.score || 0 },
    { id: 'format', label: 'Format', status: dims.output_format?.score >= 80 ? 'good' : dims.output_format?.score >= 55 ? 'warning' : 'neutral', icon: CheckCircle2, desc: dims.output_format?.explanation || 'Output structure defined.', score: dims.output_format?.score || 0 },
    { id: 'constraints', label: 'Constraints', status: dims.constraints?.score >= 80 ? 'good' : dims.constraints?.score >= 55 ? 'warning' : 'neutral', icon: AlertTriangle, desc: dims.constraints?.explanation || 'Negative constraints specified.', score: dims.constraints?.score || 0 },
    { id: 'examples', label: 'Examples', status: dims.examples?.score >= 80 ? 'good' : dims.examples?.score >= 55 ? 'warning' : 'neutral', icon: Minus, desc: dims.examples?.explanation || 'Zero-shot approach used.', score: dims.examples?.score || 0 },
  ];

  const edgeBg = (status: string) => {
    if (status === 'good') return 'linear-gradient(180deg, var(--color-success), rgba(16,185,129,0.3))';
    if (status === 'warning') return 'linear-gradient(180deg, var(--color-primary), rgba(124,58,237,0.3))';
    return 'transparent';
  };
  const iconCol = (status: string) => {
    if (status === 'good') return 'var(--color-success)';
    if (status === 'warning') return 'var(--color-primary)';
    return isDark ? D.textMuted : 'var(--color-text-secondary)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
      {/* Top row: ring + meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingBottom: 16, borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.08)'}` }}>
        <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
          <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="55" cy="55" r={radius} fill="none" stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.10)'} strokeWidth="8" />
            <circle
              cx="55" cy="55" r={radius} fill="none"
              stroke="var(--color-primary)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1.4s ease-out', filter: 'drop-shadow(0 0 6px rgba(124,58,237,0.32))' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 30, fontWeight: 700, color: isDark ? D.textPrimary : 'var(--color-text-primary)', letterSpacing: -1.5 }}>{animScore}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary)', letterSpacing: -0.3 }}>
            {scoreLabel(score)}
          </div>
          <p style={{ fontSize: 12, color: isDark ? D.textSecondary : 'var(--color-text-secondary)', lineHeight: 1.4, margin: 0 }}>
            {analysisResult?.summary || 'Run Optimize to improve your score'}
          </p>
        </div>
      </div>

      {/* Dimension grid (2 cols) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, flex: 1 }}>
        {mappedDimensions.map((dim, i) => {
          const Icon = dim.icon;
          const scoreVal = dim.score;
          return (
            <div
              key={dim.id}
              style={{
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(124,58,237,0.03)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.09)'}`,
                borderRadius: 12, padding: '10px 12px', position: 'relative', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', gap: 4,
                transition: 'transform 250ms ease, box-shadow 250ms ease, background 250ms ease',
                animationDelay: active ? `${i * 60}ms` : '0ms',
              }}
              className="hover:translate-y-[-2px]"
            >
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, borderRadius: '3px 0 0 3px', background: edgeBg(dim.status) }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon size={14} style={{ color: iconCol(dim.status), flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: isDark ? D.textPrimary : 'var(--color-text-primary)', flex: 1 }}>{dim.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, flexShrink: 0, color: scoreColor(scoreVal) }}>{scoreVal}</span>
              </div>
              <div style={{ height: 3, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99, background: scoreColor(scoreVal),
                  width: active ? `${scoreVal}%` : '0%', transition: `width 0.8s ease-out ${i * 60}ms`,
                }} />
              </div>
              <p style={{ fontSize: 11, color: isDark ? D.textMuted : 'var(--color-text-secondary)', lineHeight: 1.4, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={dim.desc}>{dim.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Shared card style ── */
const cardStyle: React.CSSProperties = {
  flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF',
  border: '1px solid rgba(124,58,237,0.10)', borderRadius: 28, padding: 36,
  boxShadow: '0 4px 24px rgba(109,40,217,0.07), 0 1px 4px rgba(0,0,0,0.04)',
  height: 780, maxHeight: 780, boxSizing: 'border-box',
  transition: 'transform 300ms ease-in-out, box-shadow 300ms ease-in-out',
};

interface ComparisonBlockProps {
  isAnalyzing: boolean;
  isAnalyzed: boolean;
  isOptimizing: boolean;
  isOptimized: boolean;
  onAnalyze: (promptText: string) => void;
  onOptimize: (promptText: string, activeRole: string, activeMode?: string, enhancementLevel?: string) => void;
  onReenhance?: () => Promise<void>;
  analysisResult?: any;
  optimizationResult?: any;
  // Live raw token buffer while an SSE enhancement is streaming. When set and
  // isOptimizing is true, the optimized panel renders these tokens (with a
  // typing caret) in place of the loading skeleton.
  streamingText?: string;
  // History fields
  versions?: any[];
  activeVersionNumber?: number | null;
  onRestoreVersion?: (versionNumber: number) => void;
  initialOriginalPromptText?: string;
  templateName?: string | null;
  onClearTemplate?: () => void;
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function ComparisonBlock({
  isAnalyzing, isAnalyzed, isOptimizing, isOptimized, onAnalyze, onOptimize, onReenhance,
  analysisResult, optimizationResult, streamingText = '', versions = [], activeVersionNumber = null, onRestoreVersion,
  initialOriginalPromptText = '', templateName = null, onClearTemplate,
}: ComparisonBlockProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [originalText, setOriginalText] = useState(
    'write a cinematic short about an astronaut who discovers a garden on mars. make it emotional.'
  );
  const [activeRole, setActiveRole] = useState('general');
  const [activeMode, setActiveMode] = useState('');
  const [enhancementLevel, setEnhancementLevel] = useState<'auto' | 'minimal' | 'standard' | 'deep'>('auto');
  const [scoreReady, setScoreReady] = useState(false);
  const [isReenhancing, setIsReenhancing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isVersionMenuOpen, setIsVersionMenuOpen] = useState(false);
  // Scroll container for the live streaming view — kept pinned to the bottom
  // as tokens arrive so the user follows the newest text.
  const streamScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOptimizing && streamingText && streamScrollRef.current) {
      streamScrollRef.current.scrollTop = streamScrollRef.current.scrollHeight;
    }
  }, [streamingText, isOptimizing]);

  useEffect(() => {
    if (initialOriginalPromptText) {
      setOriginalText(initialOriginalPromptText);
    }
  }, [initialOriginalPromptText]);

  useEffect(() => {
    if (activeRole && activeRole !== 'general') {
      const modes = ROLE_MODES[activeRole] || [];
      if (modes.length > 0 && !modes.includes(activeMode)) {
        setActiveMode(modes[0]);
      }
    } else {
      setActiveMode('');
    }
  }, [activeRole]);

  useEffect(() => {
    if (isAnalyzed) {
      const t = setTimeout(() => setScoreReady(true), 120);
      return () => clearTimeout(t);
    } else { setScoreReady(false); }
  }, [isAnalyzed]);

  const handleCopy = async () => {
    if (optimizationResult?.enhanced_prompt) {
      await navigator.clipboard.writeText(optimizationResult.enhanced_prompt);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const showScorePanel = isAnalyzing || (isAnalyzed && !isOptimizing && !isOptimized);
  const showOptimizedPanel = isOptimizing || isOptimized;
  const showRightPanel = showScorePanel || showOptimizedPanel;

  const currentAnalysis = optimizationResult?.original_analysis || analysisResult;

  const stackCards = useMediaQuery('(max-width: 1024px)');
  const isMobile = useMediaQuery('(max-width: 768px)');
  // Below ~560px a single row of 4 depth pills no longer fits, so the segmented
  // control becomes a tidy 2×2 grid instead of wrapping one pill onto its own line.
  const narrowControls = useMediaQuery('(max-width: 560px)');

  // The two comparison cards are locked to 780px tall side-by-side on desktop.
  // When they stack (≤1024px) they must go fluid-height; on phones (≤768px)
  // they also shrink their padding/radius. Spread over `cardStyle` per use-site.
  const responsiveCard: React.CSSProperties = {
    flex: stackCards ? 'none' : 1,
    padding: isMobile ? '20px 16px' : 36,
    borderRadius: isMobile ? 22 : 28,
    height: stackCards ? 'auto' : 780,
    maxHeight: stackCards ? 'none' : 780,
    minHeight: stackCards ? (isMobile ? 540 : 460) : undefined,
    background: isDark ? 'rgba(20, 19, 32, 0.85)' : '#FFFFFF',
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(124,58,237,0.10)'}`,
    boxShadow: isDark
      ? '0 4px 28px rgba(0,0,0,0.5), 0 0 20px rgba(139,92,246,0.04)'
      : '0 4px 24px rgba(109,40,217,0.07), 0 1px 4px rgba(0,0,0,0.04)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: stackCards ? 'column' : 'row', gap: stackCards ? 20 : 0, width: '100%', marginBottom: 32 }}>

      {/* ── Left Card: Original Prompt ── */}
      <motion.div
        style={{
          ...cardStyle,
          ...responsiveCard,
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: isDark ? 'rgba(139,92,246,0.25) transparent' : 'rgba(124,58,237,0.2) transparent',
        }}
        layout
        transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: isMobile ? 16 : 24 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: isDark ? D.textMuted : 'var(--color-text-secondary)', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: isMobile ? 4 : 8 }}>
              Your Prompt
            </div>
            <h2 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: isDark ? D.textPrimary : 'var(--color-text-primary)', margin: 0, letterSpacing: -0.3 }}>
              Paste or write below
            </h2>
          </div>

          {/* Applied-template chip */}
          {templateName && (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 8px', maxWidth: 240, borderRadius: 14,
                background: isDark
                  ? 'linear-gradient(160deg, rgba(139,92,246,0.20) 0%, rgba(168,85,247,0.10) 100%)'
                  : 'linear-gradient(160deg, rgba(167,139,250,0.20) 0%, rgba(196,181,253,0.10) 100%)',
                border: `1px solid ${isDark ? 'rgba(167,139,250,0.35)' : 'rgba(124,58,237,0.28)'}`,
                boxShadow: isDark
                  ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 3px 12px rgba(0,0,0,0.4)'
                  : 'inset 0 1px 0 rgba(255,255,255,0.6), 0 3px 12px rgba(124,58,237,0.12)',
                flexShrink: 0,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', color: '#fff', flexShrink: 0, boxShadow: '0 2px 8px rgba(124,58,237,0.35)' }}>
                <LayoutTemplate size={15} strokeWidth={2.2} />
              </span>
              <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--color-primary)', lineHeight: 1 }}>Template in use</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: isDark ? D.textPrimary : 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.25 }} title={templateName}>{templateName}</span>
              </div>
              {onClearTemplate && (
                <button
                  onClick={onClearTemplate}
                  aria-label="Stop using template"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 7, border: 'none', background: 'transparent', color: isDark ? D.textMuted : 'var(--color-text-secondary)', cursor: 'pointer', flexShrink: 0, transition: 'all 180ms ease' }}
                  className="hover:!bg-[rgba(124,58,237,0.14)] hover:!text-[var(--color-primary)]"
                >
                  <X size={13} strokeWidth={2.4} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Textarea */}
        <div
          style={{
            flex: 1,
            border: originalText.length > 12000
              ? '1px solid #EF4444'
              : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124,58,237,0.10)'}`,
            borderRadius: isMobile ? 16 : 18,
            background: originalText.length > 12000
              ? (isDark ? 'rgba(239, 68, 68, 0.15)' : '#FFF5F5')
              : (isDark ? 'rgba(14, 13, 20, 0.65)' : '#FDFCFF'),
            padding: isMobile ? '16px 14px' : 24,
            display: 'flex',
            flexDirection: 'column',
            minHeight: isMobile ? 260 : 200,
            boxShadow: originalText.length > 12000 ? '0 0 0 3px rgba(239,68,68,0.12)' : (isDark ? 'inset 0 1px 3px rgba(0,0,0,0.3)' : 'inset 0 1px 3px rgba(109,40,217,0.03)'),
            transition: 'all 300ms ease-in-out',
            opacity: (isOptimizing || isAnalyzing) ? 0.7 : 1,
          }}
        >
          <textarea
            value={originalText}
            onChange={e => setOriginalText(e.target.value)}
            disabled={isOptimizing || isAnalyzing}
            placeholder="Paste or write below..."
            style={{
              width: '100%', flex: 1, fontSize: 14, lineHeight: 1.6, color: isDark ? D.textPrimary : 'var(--color-text-primary)',
              background: 'transparent', border: 'none', resize: 'none', outline: 'none', letterSpacing: '0.01em',
              cursor: (isOptimizing || isAnalyzing) ? 'not-allowed' : 'text',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: isMobile ? 10 : 16 }}>
            {originalText.length > 12000 ? (
              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertTriangle size={14} /> Limit reached (12k max)
              </span>
            ) : (
              <span />
            )}
            <span style={{ fontSize: isMobile ? 11 : 12, fontWeight: originalText.length > 12000 ? 700 : 400, color: originalText.length > 12000 ? '#DC2626' : (isDark ? D.textMuted : 'var(--color-text-secondary)') }}>
              {originalText.split(' ').filter(Boolean).length} words &middot; {originalText.length.toLocaleString()} / 12,000 chars
            </span>
          </div>
        </div>

        {/* Controls */}
        <div style={{
          marginTop: isMobile ? 18 : 32, display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 16,
          opacity: (isOptimizing || isAnalyzing) ? 0.6 : 1,
          pointerEvents: (isOptimizing || isAnalyzing) ? 'none' : 'auto',
          transition: 'opacity 200ms ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: isDark ? D.textMuted : 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Role</div>
            {isMobile && (
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '0.02em' }}>Swipe &rarr;</span>
            )}
          </div>
          <div style={{ paddingBottom: isMobile ? 0 : 4 }}>
            <div style={{
              display: 'flex',
              flexWrap: isMobile ? 'nowrap' : 'wrap',
              overflowX: isMobile ? 'auto' : 'visible',
              gap: isMobile ? 8 : 10,
              padding: isMobile ? '2px 2px 8px 2px' : '4px 6px 8px 4px',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
            }}>
              {ROLES.map(role => {
                const Icon = role.icon;
                const active = activeRole === role.id;
                return (
                  <button
                    key={role.id}
                    disabled={isOptimizing || isAnalyzing}
                    onClick={() => {
                      if (isOptimizing || isAnalyzing) return;
                      setActiveRole(role.id);
                      const modes = ROLE_MODES[role.id] || [];
                      if (modes.length > 0) setActiveMode(modes[0]);
                      else setActiveMode('');
                    }}
                    style={{
                      padding: isMobile ? '6.5px 13px' : '8px 16px', borderRadius: 9999, fontSize: isMobile ? 12.5 : 13, fontWeight: active ? 600 : 500,
                      cursor: (isOptimizing || isAnalyzing) ? 'not-allowed' : 'pointer', transition: 'all 250ms ease', display: 'flex', alignItems: 'center', gap: 6,
                      flexShrink: isMobile ? 0 : undefined,
                      whiteSpace: 'nowrap',
                      color: active ? (isDark ? '#F5F4F8' : '#6D28D9') : (isDark ? D.textSecondary : '#6B6B8A'),
                      background: active
                        ? (isDark
                            ? 'linear-gradient(160deg, rgba(139,92,246,0.28) 0%, rgba(168,85,247,0.14) 100%)'
                            : 'linear-gradient(160deg, rgba(167,139,250,0.22) 0%, rgba(196,181,253,0.12) 100%)')
                        : (isDark
                            ? 'rgba(255,255,255,0.04)'
                            : 'linear-gradient(160deg, rgba(109,40,217,0.07) 0%, rgba(124,58,237,0.03) 100%)'),
                      border: `1px solid ${active ? (isDark ? 'rgba(167,139,250,0.40)' : 'rgba(124,58,237,0.30)') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.12)')}`,
                      boxShadow: active
                        ? (isDark
                            ? 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 14px rgba(0,0,0,0.4), 0 0 0 1px rgba(167,139,250,0.25)'
                            : 'inset 0 1px 0 rgba(255,255,255,0.70), 0 4px 14px rgba(124,58,237,0.18), 0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(124,58,237,0.18)')
                        : (isDark
                            ? 'none'
                            : 'inset 0 2px 4px rgba(80,20,180,0.10), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.80)'),
                      transform: active ? 'translateY(-1px)' : 'none',
                    }}
                  >
                    <Icon size={14} style={{ opacity: active ? 1 : 0.75 }} />
                    {role.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Selector for non-general roles */}
          <AnimatePresence>
            {activeRole !== 'general' && ROLE_MODES[activeRole] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 2 }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: isDark ? D.textMuted : 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1.2px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>Mode</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: isDark ? D.textMuted : 'var(--color-text-secondary)', textTransform: 'none' }}>
                    for {ROLES.find(r => r.id === activeRole)?.label}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: isMobile ? 'nowrap' : 'wrap',
                  overflowX: isMobile ? 'auto' : 'visible',
                  gap: isMobile ? 6 : 8,
                  maxHeight: isMobile ? undefined : 190,
                  overflowY: isMobile ? 'hidden' : 'auto',
                  padding: isMobile ? '2px 2px 8px 2px' : '6px 8px 12px 6px',
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch',
                }}>
                  {ROLE_MODES[activeRole].map(m => {
                    const active = activeMode === m;
                    const ModeIcon = getModeIcon(m);
                    return (
                      <button
                        key={m}
                        disabled={isOptimizing || isAnalyzing}
                        onClick={() => {
                          if (isOptimizing || isAnalyzing) return;
                          setActiveMode(m);
                        }}
                        style={{
                          padding: isMobile ? '6px 12px' : '7px 15px', borderRadius: 9999, fontSize: isMobile ? 12 : 12.5, fontWeight: active ? 600 : 500,
                          cursor: (isOptimizing || isAnalyzing) ? 'not-allowed' : 'pointer', transition: 'all 250ms ease', display: 'flex', alignItems: 'center', gap: 6,
                          flexShrink: isMobile ? 0 : undefined,
                          whiteSpace: 'nowrap',
                          color: active ? (isDark ? '#F5F4F8' : '#6D28D9') : (isDark ? D.textSecondary : '#6B6B8A'),
                          background: active
                            ? (isDark
                                ? 'linear-gradient(160deg, rgba(139,92,246,0.28) 0%, rgba(168,85,247,0.14) 100%)'
                                : 'linear-gradient(160deg, rgba(167,139,250,0.22) 0%, rgba(196,181,253,0.12) 100%)')
                            : (isDark
                                ? 'rgba(255,255,255,0.04)'
                                : 'linear-gradient(160deg, rgba(109,40,217,0.07) 0%, rgba(124,58,237,0.03) 100%)'),
                          border: `1px solid ${active ? (isDark ? 'rgba(167,139,250,0.40)' : 'rgba(124,58,237,0.30)') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.12)')}`,
                          boxShadow: active
                            ? (isDark
                                ? 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 14px rgba(0,0,0,0.4), 0 0 0 1px rgba(167,139,250,0.25)'
                                : 'inset 0 1px 0 rgba(255,255,255,0.70), 0 4px 14px rgba(124,58,237,0.18), 0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(124,58,237,0.18)')
                            : (isDark
                                ? 'none'
                                : 'inset 0 2px 4px rgba(80,20,180,0.10), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.80)'),
                          transform: active ? 'translateY(-1px)' : 'none',
                        }}
                      >
                        <ModeIcon size={13} style={{ opacity: active ? 1 : 0.75 }} />
                        {m}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhancement Level Segmented Control */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: isDark ? D.textMuted : 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
                Enhancement Depth
              </div>
              {enhancementLevel === 'auto' && (
                <span
                  style={{
                    fontSize: isMobile ? 10 : 11,
                    fontWeight: 600,
                    color: '#8B5CF6',
                    background: isDark ? 'rgba(139, 92, 246, 0.16)' : 'rgba(124, 58, 237, 0.08)',
                    border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(124, 58, 237, 0.16)'}`,
                    padding: '2px 8px',
                    borderRadius: 9999,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    lineHeight: 1.3,
                  }}
                >
                  <Sparkles size={10} />
                  Auto detection active
                </span>
              )}
            </div>
            <div style={{
              display: isMobile ? 'grid' : (narrowControls ? 'grid' : 'inline-flex'),
              gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : (narrowControls ? '1fr 1fr' : undefined),
              position: 'relative',
              background: isDark
                ? 'rgba(14, 13, 20, 0.7)'
                : 'linear-gradient(160deg, rgba(109,40,217,0.09) 0%, rgba(124,58,237,0.04) 100%)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(124,58,237,0.13)'}`, borderRadius: 9999, padding: 3,
              boxShadow: isDark
                ? 'inset 0 2px 5px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06)'
                : 'inset 0 2px 5px rgba(80,20,180,0.13), inset 0 1px 2px rgba(0,0,0,0.07), 0 1px 0 rgba(255,255,255,0.80)',
              alignSelf: (isMobile || narrowControls) ? 'stretch' : 'flex-start',
              width: (isMobile || narrowControls) ? '100%' : undefined,
              gap: 2,
            }}>
              {[
                { id: 'auto' as const, label: 'Auto', icon: Zap },
                { id: 'minimal' as const, label: 'Minimal', icon: Feather },
                { id: 'standard' as const, label: 'Standard', icon: Sparkles },
                { id: 'deep' as const, label: 'Deep', icon: Layers },
              ].map(({ id, label, icon: Icon }) => {
                const active = id === enhancementLevel;
                return (
                  <button
                    key={id}
                    id={`enhancement-level-${id}`}
                    disabled={isOptimizing || isAnalyzing}
                    onClick={() => {
                      if (isOptimizing || isAnalyzing) return;
                      setEnhancementLevel(id);
                    }}
                    style={{
                      height: 32,
                      padding: isMobile ? '0 4px' : '0 15px',
                      fontSize: isMobile ? 11.5 : 13,
                      fontWeight: active ? 650 : 500,
                      color: active ? (isDark ? D.textPrimary : 'var(--color-primary)') : (isDark ? D.textMuted : 'var(--color-text-secondary)'),
                      position: 'relative',
                      background: 'transparent',
                      border: 'none',
                      cursor: (isOptimizing || isAnalyzing) ? 'not-allowed' : 'pointer',
                      borderRadius: 9999,
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 200ms ease',
                    }}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeDepthPill"
                        transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: isDark ? '#1E1A2E' : '#FFFFFF',
                          borderRadius: 9999,
                          zIndex: 1,
                          boxShadow: isDark
                            ? '0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)'
                            : 'inset 0 1px 0 rgba(255,255,255,0.95), 0 3px 8px rgba(80,20,180,0.12), 0 1px 3px rgba(0,0,0,0.10), 0 0 0 1px rgba(124,58,237,0.07)',
                        }}
                      />
                    )}
                    <span style={{ position: 'relative', zIndex: 2, display: 'inline-flex', alignItems: 'center', gap: isMobile ? 4 : 6 }}>
                      <Icon size={isMobile ? 11.5 : 13} strokeWidth={2.2} style={{ opacity: active ? 1 : 0.75 }} />
                      <span>{label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

          {/* Action buttons */}
          <div style={{
            display: isMobile ? 'grid' : 'flex',
            gridTemplateColumns: isMobile ? '1fr 1fr' : undefined,
            flexWrap: isMobile ? undefined : 'wrap',
            gap: isMobile ? 10 : 8,
            marginTop: isMobile ? 14 : 16,
          }}>
            <button
              id="analyze-btn"
              onClick={() => {
                if (originalText.length > 12000) return;
                onAnalyze(originalText);
              }}
              disabled={isAnalyzing || isOptimizing || originalText.length > 12000}
              style={{
                display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 7,
                padding: isMobile ? '0 12px' : '8px 32px',
                height: isMobile ? 42 : undefined,
                flex: (narrowControls && !isMobile) ? 1 : undefined,
                borderRadius: 12, fontSize: 13.5, fontWeight: 600,
                border: isDark ? '1px solid rgba(255,255,255,0.14)' : 'none',
                cursor: (isAnalyzing || isOptimizing || originalText.length > 12000) ? 'not-allowed' : 'pointer',
                background: originalText.length > 12000
                  ? 'rgba(107,107,138,0.20)'
                  : (isDark ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)'),
                color: originalText.length > 12000 ? 'rgba(107,107,138,0.60)' : 'white',
                boxShadow: originalText.length > 12000 ? 'none' : (isDark ? '0 4px 16px rgba(0,0,0,0.4)' : '0 4px 16px rgba(124,58,237,0.30)'),
                opacity: (isAnalyzing || isOptimizing || originalText.length > 12000) ? 0.75 : 1,
                transition: 'all 220ms ease',
              }}
              className={!(isAnalyzing || isOptimizing || originalText.length > 12000) ? 'hover:translate-y-[-1px] hover:brightness-105 active:scale-[0.98]' : ''}
            >
              <Sparkles size={14} style={{ animation: 'pulseGlow 2s infinite' }} />
              <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
            </button>
            <button
              id="optimize-btn"
              onClick={() => {
                if (originalText.length > 12000) return;
                onOptimize(originalText, activeRole, activeMode, enhancementLevel);
              }}
              disabled={isOptimizing || isAnalyzing || originalText.length > 12000}
              style={{
                display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: 7,
                padding: isMobile ? '0 12px' : '8px 32px',
                height: isMobile ? 42 : undefined,
                flex: (narrowControls && !isMobile) ? 1 : undefined,
                borderRadius: 12, fontSize: 13.5, fontWeight: 600,
                cursor: (isOptimizing || isAnalyzing || originalText.length > 12000) ? 'not-allowed' : 'pointer',
                background: (!isOptimizing && !isAnalyzing && originalText.length <= 12000)
                  ? 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)'
                  : 'rgba(107,107,138,0.20)',
                color: (!isOptimizing && !isAnalyzing && originalText.length <= 12000) ? 'white' : 'rgba(107,107,138,0.60)',
                border: (!isOptimizing && !isAnalyzing && originalText.length <= 12000) ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(124,58,237,0.10)'}`,
                boxShadow: (!isOptimizing && !isAnalyzing && originalText.length <= 12000) ? '0 4px 16px rgba(109,40,217,0.30)' : 'none',
                opacity: (isOptimizing || originalText.length > 12000) ? 0.75 : 1,
                transition: 'all 220ms ease',
              }}
              className={(!isOptimizing && !isAnalyzing && originalText.length <= 12000) ? 'hover:translate-y-[-1px] hover:shadow-[0_8px_24px_rgba(109,40,217,0.42)] hover:brightness-105 active:scale-[0.98]' : ''}
            >
              <Wand2 size={13} />
              <span>{isOptimizing ? 'Optimizing...' : 'Optimize'}</span>
            </button>
          </div>
      </motion.div>

      {/* ── Right Panel ── */}
      <AnimatePresence mode="wait">
        {showRightPanel && (
          <motion.div
            key={showScorePanel ? 'score' : 'optimized'}
            layout
            initial={stackCards ? { opacity: 0, y: 12 } : { opacity: 0, flex: 0, paddingLeft: 0, minWidth: 0, width: 0 }}
            animate={stackCards ? { opacity: 1, y: 0 } : { opacity: 1, flex: 0.818, paddingLeft: 24, minWidth: 0, width: 'auto' }}
            exit={stackCards ? { opacity: 0, y: 8 } : { opacity: 0, flex: 0, paddingLeft: 0, minWidth: 0, width: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
            style={{
              overflow: 'hidden',
              display: 'flex',
              width: stackCards ? '100%' : undefined,
              flex: stackCards ? 'none' : undefined,
              height: stackCards ? (isMobile ? 520 : 600) : 780,
              maxHeight: stackCards ? (isMobile ? 520 : 600) : 780,
            }}
          >
            {/* Score panel */}
            {showScorePanel && (
              <div style={{
                ...cardStyle,
                ...responsiveCard,
                width: '100%',
                flex: 'none',
                height: stackCards ? (isMobile ? 520 : 600) : '100%',
                maxHeight: stackCards ? (isMobile ? 520 : 600) : 780,
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: isDark ? 'rgba(139,92,246,0.25) transparent' : 'rgba(124,58,237,0.2) transparent',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: isDark ? D.textMuted : 'var(--color-text-secondary)', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 8 }}>
                  Analysis
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: isDark ? D.textPrimary : 'var(--color-text-primary)', margin: '0 0 20px', letterSpacing: -0.3 }}>
                  Your Prompt Score
                </h2>
                {isAnalyzing ? (
                  /* Skeleton shimmer */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8, opacity: 0.7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <div className="skeleton" style={{ width: 110, height: 110, borderRadius: '50%' }} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div className="skeleton" style={{ height: 24, width: '60%' }} />
                        <div className="skeleton" style={{ height: 16, width: '80%' }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: 72, borderRadius: 12 }} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <InlineScorePanel active={scoreReady} analysisResult={currentAnalysis} />
                )}
              </div>
            )}

            {/* Optimized panel */}
            {showOptimizedPanel && (
              <div style={{
                ...cardStyle,
                ...responsiveCard,
                width: '100%',
                flex: 'none',
                height: stackCards ? (isMobile ? 520 : 600) : '100%',
                maxHeight: stackCards ? (isMobile ? 520 : 600) : 780,
                padding: isMobile ? '20px 14px' : '36px 8px 36px 36px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: isMobile ? 16 : 24, height: 36, paddingRight: isMobile ? 0 : 28 }}>
                  <h2 style={{ fontSize: 12, fontWeight: 600, color: isDark ? D.textMuted : 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: isOptimizing ? 0.6 : 1 }}>
                    Optimized Prompt
                  </h2>

                  {(isOptimized || isOptimizing) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: isOptimizing ? 0.6 : 1, pointerEvents: isOptimizing ? 'none' : 'auto', flexShrink: 0 }}>
                      {/* Detected enhancement level badge */}
                      {isOptimized && optimizationResult?.detected_level && (
                        <div
                          title={optimizationResult.level_reason || ''}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '3px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600,
                            background: isDark
                              ? 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(168,85,247,0.1) 100%)'
                              : 'linear-gradient(135deg, rgba(124,58,237,0.10) 0%, rgba(168,85,247,0.07) 100%)',
                            border: `1px solid ${isDark ? 'rgba(167,139,250,0.3)' : 'rgba(124,58,237,0.18)'}`,
                            color: isDark ? '#C084FC' : 'var(--color-primary)', cursor: 'default', flexShrink: 0,
                          }}
                        >
                          <Zap size={10} />
                          <span style={{ textTransform: 'capitalize' }}>{optimizationResult.detected_level}</span>
                        </div>
                      )}
                      {/* Version selector dropdown */}
                      {versions && versions.length > 1 && (
                        <div style={{ position: 'relative', marginRight: 4 }}>
                          <button
                            type="button"
                            aria-haspopup="menu"
                            aria-expanded={isVersionMenuOpen}
                            onClick={() => setIsVersionMenuOpen((open) => !open)}
                            style={{
                              minWidth: 68,
                              height: 36,
                              padding: '6px 10px',
                              borderRadius: 9999,
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(124,58,237,0.20)'}`,
                              fontSize: '13px',
                              fontWeight: 600,
                              background: isDark
                                ? 'rgba(14, 13, 20, 0.85)'
                                : 'linear-gradient(160deg, rgba(255,255,255,1) 0%, rgba(248,245,255,1) 100%)',
                              color: isDark ? D.textPrimary : 'var(--color-primary)',
                              cursor: 'pointer',
                              outline: 'none',
                              boxShadow: isDark
                                ? '0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)'
                                : '0 2px 6px rgba(124,58,237,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 5,
                            }}
                          >
                            <span>v{activeVersionNumber ?? versions[versions.length - 1]?.version_number}</span>
                            <ChevronDown size={15} strokeWidth={2.5} style={{ transform: isVersionMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 180ms ease' }} />
                          </button>
                          <AnimatePresence>
                            {isVersionMenuOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -5, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -5, scale: 0.97 }}
                                transition={{ duration: 0.16 }}
                                role="menu"
                                style={{
                                  position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: '100%',
                                  padding: 5, borderRadius: 14, zIndex: 20, overflow: 'hidden',
                                  background: isDark ? 'rgba(20, 19, 32, 0.96)' : 'linear-gradient(160deg, #FFFFFF 0%, #F8F5FF 100%)',
                                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(124,58,237,0.18)'}`,
                                  boxShadow: isDark
                                    ? '0 12px 28px rgba(0,0,0,0.6)'
                                    : '0 12px 28px rgba(91,33,182,0.18), 0 2px 8px rgba(0,0,0,0.07)',
                                }}
                              >
                                {versions.map((version: any) => {
                                  const isActive = version.version_number === activeVersionNumber;
                                  return (
                                    <button
                                      key={version.id}
                                      type="button"
                                      role="menuitem"
                                      onClick={() => {
                                        setIsVersionMenuOpen(false);
                                        onRestoreVersion?.(version.version_number);
                                      }}
                                      style={{
                                        width: '100%', padding: '7px 12px', border: 'none', borderRadius: 9,
                                        background: isActive ? 'linear-gradient(135deg, #7C3AED, #A855F7)' : 'transparent',
                                        color: isActive ? '#FFFFFF' : (isDark ? D.textPrimary : 'var(--color-primary)'),
                                        fontSize: 13, fontWeight: isActive ? 700 : 600, textAlign: 'left', cursor: 'pointer',
                                      }}
                                    >
                                      v{version.version_number}
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {[
                        {
                          id: 'copy',
                          icon: Copy,
                          title: copySuccess ? 'Copied!' : 'Copy',
                          primary: false,
                          onClick: handleCopy,
                          disabled: false,
                          spinning: false,
                        },
                        // Regenerate starts a new normal enhancement
                        ...(versions.some((version: any) =>
                          version.version_type?.toLowerCase() === 'reenhancement'
                        ) ? [] : [{
                          id: 'regenerate',
                          icon: RefreshCw,
                          title: 'Regenerate',
                          primary: false,
                          onClick: () => onOptimize(originalText, activeRole, activeMode, enhancementLevel),
                          disabled: isOptimizing || isReenhancing,
                          spinning: false,
                        }]),
                        {
                          id: 'reenhance',
                          icon: Wand2,
                          title: isReenhancing
                            ? 'Re-enhancing...'
                            : onReenhance
                              ? activeVersionNumber
                                ? `Re-enhance v${activeVersionNumber}`
                                : 'Re-enhance'
                              : 'Re-enhance is available after the prompt is saved',
                          primary: true,
                          onClick: async () => {
                            if (!onReenhance || isReenhancing || isOptimizing) return;
                            setIsReenhancing(true);
                            try {
                              await onReenhance();
                            } finally {
                              setIsReenhancing(false);
                            }
                          },
                          disabled: !onReenhance || isReenhancing || isOptimizing,
                          spinning: isReenhancing,
                        },
                      ].map(({ id, icon: Icon, title, primary, onClick, disabled, spinning }) => (
                        <button
                          key={id}
                          id={`${id}-btn`}
                          title={title}
                          disabled={disabled}
                          onClick={onClick}
                          style={{
                            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '50%', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 250ms ease',
                            background: primary
                              ? 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)'
                              : (isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'),
                            border: primary ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)'}`,
                            color: primary ? 'white' : (isDark ? D.textSecondary : '#6B7280'),
                            boxShadow: primary ? '0 4px 16px rgba(124,58,237,0.35)' : 'none',
                            opacity: disabled ? 0.7 : 1,
                          }}
                          className={disabled ? '' : (primary
                            ? 'hover:brightness-110 hover:translate-y-[-2px] hover:scale-[1.08] hover:shadow-[0_8px_24px_rgba(124,58,237,0.45)]'
                            : 'hover:translate-y-[-2px] hover:scale-[1.05]')}
                        >
                          {copySuccess && id === 'copy' ? (
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-success)' }}>✓</span>
                          ) : (
                            <Icon size={16} style={{ animation: spinning ? 'spin 1s linear infinite' : 'none' }} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', minHeight: 0 }}>
                  {isOptimizing && streamingText ? (
                    /* Live token stream */
                    <div
                      ref={streamScrollRef}
                      className="custom-scrollbar"
                      style={{
                        flex: 1,
                        minHeight: 0,
                        fontSize: 14,
                        lineHeight: 1.6,
                        overflowY: 'auto',
                        paddingRight: isMobile ? 4 : 16,
                        color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                        letterSpacing: '0.01em',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        animation: 'fadeInRise 300ms ease-out forwards',
                        scrollbarWidth: 'thin',
                        scrollbarColor: isDark ? 'rgba(139,92,246,0.3) transparent' : 'rgba(124,58,237,0.25) transparent',
                        WebkitOverflowScrolling: 'touch',
                      }}
                    >
                      {formatPromptText(streamingText)}
                      <span
                        aria-hidden="true"
                        style={{
                          display: 'inline-block',
                          width: 7,
                          height: 15,
                          marginLeft: 2,
                          borderRadius: 1,
                          background: 'var(--color-primary)',
                          verticalAlign: 'text-bottom',
                          animation: 'streamCaretBlink 1s step-end infinite',
                        }}
                      />
                    </div>
                  ) : isOptimizing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 8 }}>
                      {[['30%', '60%'], ['40%', '50%'], ['35%', '55%']].map(([w1, w2], gi) => (
                        <div key={gi} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <div className="skeleton" style={{ width: w1, height: 18, background: 'linear-gradient(90deg,rgba(124,58,237,0.15) 0%,rgba(124,58,237,0.25) 50%,rgba(124,58,237,0.15) 100%)', backgroundSize: '200% 100%' }} />
                            <div className="skeleton" style={{ width: w2, height: 18 }} />
                          </div>
                          <div className="skeleton" style={{ width: '100%', height: 18 }} />
                          <div className="skeleton" style={{ width: '90%', height: 18 }} />
                        </div>
                      ))}
                    </div>
                  ) : isOptimized ? (
                    <div
                      className="custom-scrollbar"
                      style={{
                        flex: 1,
                        minHeight: 0,
                        fontSize: 14,
                        lineHeight: 1.6,
                        animation: 'fadeInRise 400ms ease-out forwards',
                        overflowY: 'auto',
                        paddingRight: isMobile ? 4 : 16,
                        color: isDark ? D.textPrimary : 'var(--color-text-primary)',
                        letterSpacing: '0.01em',
                        scrollbarWidth: 'thin',
                        scrollbarColor: isDark ? 'rgba(139,92,246,0.3) transparent' : 'rgba(124,58,237,0.25) transparent',
                        WebkitOverflowScrolling: 'touch',
                      }}
                    >
                      <FormattedPromptViewer content={optimizationResult?.enhanced_prompt || ''} />
                    </div>
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(17,24,39,0.18)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                        <ArrowRightToLine size={32} strokeWidth={1} />
                        <p style={{ fontSize: 15, fontWeight: 500 }}>Your optimized prompt will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
