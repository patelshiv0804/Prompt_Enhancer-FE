'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Copy, RefreshCw, Bookmark, ArrowRightToLine,
  Sparkles, Code2, Search, Megaphone, GraduationCap, Briefcase,
  School, Rocket, PenTool, BarChart3, Palette, Video, Wand2,
  CheckCircle2, AlertTriangle, Minus, FileText, Layers, Monitor,
  Smartphone, Server, Database, ShieldCheck, Globe, Cpu, Terminal,
  Lightbulb, DollarSign, Scale, ShoppingCart, Users, Mail, Radio,
  Activity, PieChart, TrendingUp, BookOpen, Building2, Layout, LayoutTemplate, Award, Zap, GitBranch, ChevronDown, ChevronRight, ArrowLeft, Feather, X, Lock, Check,
  Plus, RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FormattedPromptViewer from './FormattedPromptViewer';

import { ROLES, ROLE_MODES, getModeIcon } from '@/constants/roles';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTheme, D } from '@/theme/theme';

const DEPTH_OPTIONS = [
  { id: 'auto' as const, label: 'Auto', icon: Zap, desc: 'Smart detection based on prompt complexity' },
  { id: 'minimal' as const, label: 'Minimal', icon: Feather, desc: 'Light polish preserving voice and tone' },
  { id: 'standard' as const, label: 'Standard', icon: Sparkles, desc: 'Balanced structure, clarity, and detail' },
  { id: 'deep' as const, label: 'Deep', icon: Layers, desc: 'Comprehensive reformulation with context' },
];

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
            {analysisResult?.summary || 'Run Enhance to improve your score'}
          </p>
        </div>
      </div>

      {/* Dimension grid (2 cols) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, flex: 1 }}>
        {mappedDimensions.map((dim, i) => {
          const Icon = dim.icon;
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
                <Icon size={14} style={{ color: dim.status === 'good' ? 'var(--color-success)' : dim.status === 'warning' ? 'var(--color-primary)' : (isDark ? D.textMuted : 'var(--color-text-secondary)') }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? D.textPrimary : 'var(--color-text-primary)' }}>{dim.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, marginLeft: 'auto', color: dim.status === 'good' ? 'var(--color-success)' : dim.status === 'warning' ? 'var(--color-primary)' : (isDark ? D.textMuted : 'var(--color-text-secondary)') }}>{dim.score}</span>
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
  onReset?: () => void;
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
  isAnalyzing, isAnalyzed, isOptimizing, isOptimized, onAnalyze, onOptimize, onReenhance, onReset,
  analysisResult, optimizationResult, streamingText = '', versions = [], activeVersionNumber = null, onRestoreVersion,
  initialOriginalPromptText = '', templateName = null, onClearTemplate,
}: ComparisonBlockProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [originalText, setOriginalText] = useState(initialOriginalPromptText || '');
  const [activeRole, setActiveRole] = useState('general');
  const [activeMode, setActiveMode] = useState('');
  const [enhancementLevel, setEnhancementLevel] = useState<'auto' | 'minimal' | 'standard' | 'deep'>('auto');
  const [scoreReady, setScoreReady] = useState(false);
  const [isReenhancing, setIsReenhancing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isVersionMenuOpen, setIsVersionMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'role' | 'depth' | null>(null);
  const [hoveredRoleId, setHoveredRoleId] = useState<string>('general');
  const [mobileModeView, setMobileModeView] = useState(false);
  const [roleSearchQuery, setRoleSearchQuery] = useState('');
  const [openPlusMenu, setOpenPlusMenu] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<'analyze' | 'enhance' | null>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);

  // Search filter across roles & modes
  const searchMatches = React.useMemo(() => {
    const query = roleSearchQuery.trim().toLowerCase();
    if (!query) return [];

    const matches: Array<{
      roleId: string;
      roleLabel: string;
      roleIcon: React.ElementType;
      modeName: string;
    }> = [];

    ROLES.forEach(role => {
      const roleMatches = role.label.toLowerCase().includes(query);
      const modes = ROLE_MODES[role.id] || [];

      // If the role name itself matches, provide default persona option
      if (roleMatches) {
        matches.push({
          roleId: role.id,
          roleLabel: role.label,
          roleIcon: role.icon,
          modeName: '',
        });
      }

      // Check each sub-mode under this role
      modes.forEach(mode => {
        const modeMatches = mode.toLowerCase().includes(query);
        if (modeMatches || (roleMatches && query.length >= 2)) {
          matches.push({
            roleId: role.id,
            roleLabel: role.label,
            roleIcon: role.icon,
            modeName: mode,
          });
        }
      });
    });

    return matches;
  }, [roleSearchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (controlsRef.current && !controlsRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setRoleSearchQuery('');
      }
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
        setOpenPlusMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Scroll container for the live streaming view — kept pinned to the bottom
  // as tokens arrive so the user follows the newest text.
  const streamScrollRef = useRef<HTMLDivElement>(null);

  const isTemplateActive = Boolean(templateName);
  const isRoleModeDisabled = isOptimizing || isAnalyzing || isTemplateActive;

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
      // If the current mode doesn't belong to the new role, clear it (stay role-only)
      if (activeMode && !modes.includes(activeMode)) {
        setActiveMode('');
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
  const isNarrow = useMediaQuery('(max-width: 640px)');
  const isSmallPhone = useMediaQuery('(max-width: 480px)');
  const isLandscape = useMediaQuery('(max-height: 540px) and (orientation: landscape)');

  // The two comparison cards are locked to 780px tall side-by-side on desktop.
  // When they stack (≤1024px) they must go fluid-height; on phones (≤768px)
  // they also shrink their padding/radius. Spread over `cardStyle` per use-site.
  const responsiveCard: React.CSSProperties = {
    flex: stackCards ? 'none' : 1,
    padding: isSmallPhone ? '14px 12px' : isMobile ? '18px 16px' : '26px 30px',
    borderRadius: isSmallPhone ? 16 : isMobile ? 20 : 24,
    height: stackCards ? 'auto' : 640,
    maxHeight: stackCards ? 'none' : 640,
    minHeight: stackCards ? (isMobile ? 380 : 440) : undefined,
    background: isDark ? 'rgba(20, 19, 32, 0.85)' : '#FFFFFF',
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.09)' : '#E2E8F0'}`,
    boxShadow: isDark
      ? '0 4px 28px rgba(0,0,0,0.5), 0 0 20px rgba(139,92,246,0.04)'
      : 'none',
  };

  // ── 1. Plus Button ──
  const renderPlusButton = () => (
    <div style={{ position: 'relative' }} ref={plusMenuRef}>
      <button
        type="button"
        id="capsule-plus-btn"
        aria-label="Prompt options"
        onClick={() => setOpenPlusMenu(prev => !prev)}
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: openPlusMenu
            ? (isDark ? 'rgba(124, 58, 237, 0.25)' : 'rgba(124, 58, 237, 0.15)')
            : (isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'),
          border: `1px solid ${openPlusMenu ? 'rgba(168, 85, 247, 0.45)' : (isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)')}`,
          color: isDark ? '#E2E8F0' : '#475569',
          cursor: 'pointer',
          transition: 'all 160ms ease',
        }}
        className="hover:scale-105 hover:!border-[rgba(168,85,247,0.5)]"
      >
        <Plus size={16} />
        {enhancementLevel !== 'auto' && (
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#C084FC',
              boxShadow: '0 0 6px #A855F7',
            }}
          />
        )}
      </button>

      <AnimatePresence>
        {openPlusMenu && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: 0,
              zIndex: 90,
              minWidth: 235,
              transformOrigin: 'bottom left',
              borderRadius: 14,
              padding: 6,
              background: isDark ? '#181628' : '#FFFFFF',
              border: `1px solid ${isDark ? 'rgba(168, 85, 247, 0.28)' : 'rgba(124, 58, 237, 0.2)'}`,
              boxShadow: isDark
                ? '0 16px 40px rgba(0,0,0,0.7), 0 0 20px rgba(124,58,237,0.14)'
                : '0 12px 32px rgba(124,58,237,0.16), 0 1px 4px rgba(0,0,0,0.06)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setOriginalText('write a cinematic short about an astronaut who discovers a garden on mars. make it emotional.');
                setOpenPlusMenu(false);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '8px 10px',
                borderRadius: 8, border: 'none', background: 'transparent',
                color: isDark ? '#E2E8F0' : '#334155', fontSize: 12.5, fontWeight: 500,
                cursor: 'pointer', textAlign: 'left',
              }}
              className={isDark ? 'hover:bg-[rgba(255,255,255,0.06)]' : 'hover:bg-[rgba(124,58,237,0.05)]'}
            >
              <Sparkles size={14} style={{ color: '#A855F7' }} />
              <span>Load Sample Prompt</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOpenPlusMenu(false);
                router.push('/dashboard/templates');
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '8px 10px',
                borderRadius: 8, border: 'none', background: 'transparent',
                color: isDark ? '#E2E8F0' : '#334155', fontSize: 12.5, fontWeight: 500,
                cursor: 'pointer', textAlign: 'left',
              }}
              className={isDark ? 'hover:bg-[rgba(255,255,255,0.06)]' : 'hover:bg-[rgba(124,58,237,0.05)]'}
            >
              <LayoutTemplate size={14} style={{ color: '#A855F7' }} />
              <span>Browse Templates</span>
            </button>

            {originalText && (
              <button
                type="button"
                onClick={() => {
                  setOriginalText('');
                  setOpenPlusMenu(false);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '8px 10px',
                  borderRadius: 8, border: 'none', background: 'transparent',
                  color: '#EF4444', fontSize: 12.5, fontWeight: 500,
                  cursor: 'pointer', textAlign: 'left',
                }}
                className={isDark ? 'hover:bg-[rgba(239,68,68,0.1)]' : 'hover:bg-[rgba(239,68,68,0.06)]'}
              >
                <X size={14} />
                <span>Clear Input</span>
              </button>
            )}

            {/* Enhancement Depth Selector inside the + menu (All Devices) */}
            <div style={{ height: 1, background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)', margin: '5px 0' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 8px 3px' }}>
              <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: isDark ? 'rgba(255,255,255,0.4)' : '#64748B' }}>
                Enhancement Depth
              </span>
              <span style={{ fontSize: 9.5, fontWeight: 600, color: isDark ? '#C084FC' : '#7C3AED' }}>
                {DEPTH_OPTIONS.find(d => d.id === enhancementLevel)?.label}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, padding: '2px 2px 3px' }}>
              {DEPTH_OPTIONS.map(opt => {
                const isSelected = enhancementLevel === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    title={`${opt.label}: ${opt.desc}`}
                    onClick={() => {
                      setEnhancementLevel(opt.id);
                      setOpenPlusMenu(false);
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 3,
                      padding: '6px 2px',
                      borderRadius: 7,
                      border: `1px solid ${isSelected ? (isDark ? 'rgba(168, 85, 247, 0.55)' : 'rgba(124, 58, 237, 0.45)') : 'transparent'}`,
                      background: isSelected ? (isDark ? 'rgba(124, 58, 237, 0.22)' : 'rgba(124, 58, 237, 0.10)') : 'transparent',
                      color: isSelected ? (isDark ? '#FFFFFF' : '#6D28D9') : (isDark ? 'rgba(255, 255, 255, 0.7)' : '#475569'),
                      cursor: 'pointer',
                      transition: 'all 120ms ease',
                    }}
                    className={!isSelected ? (isDark ? 'hover:bg-[rgba(255,255,255,0.06)]' : 'hover:bg-[rgba(124,58,237,0.05)]') : ''}
                  >
                    <Icon size={13} style={{ color: isSelected ? (isDark ? '#C084FC' : '#7C3AED') : (isDark ? 'rgba(255,255,255,0.5)' : '#64748B') }} />
                    <span style={{ fontSize: 9.5, fontWeight: isSelected ? 600 : 500 }}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ── 2. Role + Mode Cascading Dropdown ──
  const renderRolePill = () => {
    const activeRoleObj = ROLES.find(r => r.id === activeRole) || ROLES[0];
    const ActiveRoleIcon = activeRoleObj.icon;
    const currentHoveredRole = ROLES.find(r => r.id === hoveredRoleId) || activeRoleObj;
    const hoveredModes = ROLE_MODES[hoveredRoleId] || [];
    const roleHasModes = hoveredModes.length > 0;

    return (
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          id="role-dropdown-btn"
          disabled={isRoleModeDisabled}
          title={isTemplateActive ? 'Role selection is disabled while a template is in use' : undefined}
          onClick={() => {
            if (isRoleModeDisabled) return;
            setOpenDropdown(prev => {
              const next = prev === 'role' ? null : 'role';
              if (next === 'role') {
                setHoveredRoleId(activeRole || 'general');
                setMobileModeView(false);
                setRoleSearchQuery('');
              }
              return next;
            });
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: isNarrow ? 5 : 7,
            padding: isNarrow ? '5px 10px' : isMobile ? '6px 12px' : '7px 14px',
            borderRadius: 9999,
            fontSize: isSmallPhone ? 11.5 : 12.5,
            fontWeight: 550,
            cursor: isRoleModeDisabled ? 'not-allowed' : 'pointer',
            opacity: isTemplateActive ? 0.5 : 1,
            minWidth: 0,
            maxWidth: isNarrow ? 185 : (isMobile ? 200 : undefined),
            background: openDropdown === 'role'
              ? (isDark ? 'rgba(124, 58, 237, 0.22)' : 'rgba(124, 58, 237, 0.12)')
              : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'),
            border: `1px solid ${openDropdown === 'role'
              ? (isDark ? 'rgba(168, 85, 247, 0.55)' : 'rgba(124, 58, 237, 0.45)')
              : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.09)')}`,
            color: isDark ? '#FFFFFF' : '#1E293B',
            boxShadow: openDropdown === 'role'
              ? (isDark ? '0 0 14px rgba(124, 58, 237, 0.3)' : '0 2px 8px rgba(124, 58, 237, 0.15)')
              : 'none',
            transition: 'all 180ms ease',
          }}
          className="hover:border-[rgba(168,85,247,0.4)] active:scale-[0.98]"
        >
          <ActiveRoleIcon size={14} style={{ color: isDark ? '#C084FC' : '#7C3AED', flexShrink: 0 }} />
          {!isSmallPhone && (
            <span style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#64748B', fontWeight: 600, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>Role</span>
          )}
          <span style={{
            fontWeight: 600,
            maxWidth: isNarrow ? 125 : (isMobile ? 140 : 180),
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {activeRoleObj.label}{activeMode ? ` · ${activeMode}` : ''}
          </span>
          <ChevronDown size={13} style={{ transform: openDropdown === 'role' ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease', opacity: 0.65, flexShrink: 0 }} />
        </button>

        <AnimatePresence>
          {openDropdown === 'role' && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                right: 'auto',
                left: 0,
                zIndex: 90,
                borderRadius: 16,
                padding: '8px 6px 6px',
                background: isDark ? '#161426' : '#FFFFFF',
                border: `1px solid ${isDark ? 'rgba(168, 85, 247, 0.28)' : 'rgba(124, 58, 237, 0.2)'}`,
                boxShadow: isDark
                  ? '0 16px 40px rgba(0,0,0,0.75), 0 0 24px rgba(124,58,237,0.18)'
                  : '0 12px 32px rgba(124,58,237,0.16), 0 2px 6px rgba(0,0,0,0.06)',
                backdropFilter: 'blur(24px)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                maxWidth: 'calc(100vw - 28px)',
                transformOrigin: 'bottom left',
              }}
            >
              {/* Scoped Scrollbar Style - Sleek 4px, no arrows, transparent track */}
              <style>{`
                .custom-dropdown-scroll {
                  overflow-y: auto !important;
                  scrollbar-width: thin !important;
                  scrollbar-color: ${isDark ? 'rgba(168, 85, 247, 0.45) transparent' : 'rgba(124, 58, 237, 0.35) transparent'} !important;
                }
                .custom-dropdown-scroll::-webkit-scrollbar {
                  width: 4px !important;
                  height: 4px !important;
                }
                .custom-dropdown-scroll::-webkit-scrollbar-button {
                  display: none !important;
                  width: 0 !important;
                  height: 0 !important;
                }
                .custom-dropdown-scroll::-webkit-scrollbar-track {
                  background: transparent !important;
                }
                .custom-dropdown-scroll::-webkit-scrollbar-thumb {
                  background: ${isDark ? 'rgba(168, 85, 247, 0.45)' : 'rgba(124, 58, 237, 0.35)'} !important;
                  border-radius: 9999px !important;
                  border: none !important;
                }
                .custom-dropdown-scroll::-webkit-scrollbar-thumb:hover {
                  background: ${isDark ? 'rgba(168, 85, 247, 0.75)' : 'rgba(124, 58, 237, 0.65)'} !important;
                }
              `}</style>
              {/* Search Bar for Roles and Modes */}
              <div style={{
                padding: '2px 4px 7px',
                borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(124, 58, 237, 0.10)'}`,
                marginBottom: 6,
              }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(124, 58, 237, 0.04)',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(124, 58, 237, 0.14)'}`,
                    borderRadius: 8,
                    padding: '4.5px 9px',
                    transition: 'all 150ms ease',
                  }}
                  className="focus-within:!border-[var(--color-primary)] focus-within:!shadow-[0_0_10px_rgba(124,58,237,0.25)]"
                >
                  <Search size={13} style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#64748B', flexShrink: 0 }} />
                  <input
                    type="text"
                    id="role-mode-search-input"
                    placeholder="Search persona or mode..."
                    value={roleSearchQuery}
                    onChange={e => setRoleSearchQuery(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Escape') {
                        if (roleSearchQuery) {
                          setRoleSearchQuery('');
                        } else {
                          setOpenDropdown(null);
                        }
                      } else if (e.key === 'Enter' && searchMatches.length > 0) {
                        e.preventDefault();
                        const first = searchMatches[0];
                        setActiveRole(first.roleId);
                        setActiveMode(first.modeName);
                        setOpenDropdown(null);
                        setRoleSearchQuery('');
                      }
                    }}
                    autoFocus
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: 11.5,
                      fontWeight: 500,
                      color: isDark ? '#FFFFFF' : '#1E293B',
                      padding: 0,
                    }}
                  />
                  {roleSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setRoleSearchQuery('')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        color: isDark ? 'rgba(255,255,255,0.5)' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* View 1: Filtered Search Results */}
              {roleSearchQuery.trim() ? (
                <div
                  className="custom-dropdown-scroll"
                  style={{
                    width: isMobile ? 260 : 380,
                    maxHeight: 195,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    paddingRight: 4,
                    scrollbarWidth: 'thin',
                    scrollbarColor: isDark ? 'rgba(168, 85, 247, 0.45) transparent' : 'rgba(124, 58, 237, 0.35) transparent',
                  }}
                >
                  <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: isDark ? 'rgba(255,255,255,0.4)' : '#64748B', padding: '2px 8px 4px' }}>
                    Matching Personas &amp; Modes ({searchMatches.length})
                  </div>
                  {searchMatches.length === 0 ? (
                    <div style={{ padding: '20px 12px', textAlign: 'center', color: isDark ? 'rgba(255,255,255,0.45)' : '#64748B', fontSize: 11.5 }}>
                      No personas or modes matching &ldquo;{roleSearchQuery}&rdquo;
                    </div>
                  ) : (
                    searchMatches.map((item) => {
                      const isSelected = activeRole === item.roleId && (activeMode === item.modeName || (!activeMode && !item.modeName));
                      const Icon = item.roleIcon;
                      const ModeIcon = item.modeName ? getModeIcon(item.modeName) : null;

                      return (
                        <button
                          key={`${item.roleId}-${item.modeName || 'default'}`}
                          type="button"
                          onClick={() => {
                            setActiveRole(item.roleId);
                            setActiveMode(item.modeName);
                            setOpenDropdown(null);
                            setRoleSearchQuery('');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '5.5px 8px',
                            borderRadius: 7,
                            border: 'none',
                            background: isSelected
                              ? (isDark ? 'rgba(124, 58, 237, 0.22)' : 'rgba(124, 58, 237, 0.10)')
                              : 'transparent',
                            color: isSelected
                              ? (isDark ? '#FFFFFF' : '#6D28D9')
                              : (isDark ? 'rgba(255, 255, 255, 0.82)' : '#334155'),
                            fontSize: 12,
                            fontWeight: isSelected ? 600 : 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                          }}
                          className={!isSelected ? (isDark ? 'hover:bg-[rgba(255,255,255,0.06)]' : 'hover:bg-[rgba(124,58,237,0.05)]') : ''}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                            <Icon size={13} style={{ color: isDark ? '#C084FC' : '#7C3AED', flexShrink: 0 }} />
                            <span style={{ fontWeight: 600, color: isDark ? '#FFFFFF' : '#1E293B', whiteSpace: 'nowrap' }}>
                              {item.roleLabel}
                            </span>
                            {item.modeName ? (
                              <>
                                <span style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#94A3B8', fontSize: 10 }}>&rarr;</span>
                                <span style={{ color: isDark ? '#DDD6FE' : '#6D28D9', display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {ModeIcon && <ModeIcon size={11} style={{ opacity: 0.75, flexShrink: 0 }} />}
                                  <span>{item.modeName}</span>
                                </span>
                              </>
                            ) : (
                              <span style={{ fontSize: 10, fontStyle: 'italic', color: isDark ? 'rgba(255,255,255,0.45)' : '#64748B' }}>
                                (All Modes)
                              </span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            <span style={{
                              fontSize: 9.5,
                              padding: '1px 5px',
                              borderRadius: 4,
                              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                              color: isDark ? 'rgba(255,255,255,0.5)' : '#64748B',
                              fontWeight: 500,
                            }}>
                              {item.modeName ? 'Mode' : 'Persona'}
                            </span>
                            {isSelected && <Check size={12.5} style={{ color: isDark ? '#C084FC' : '#7C3AED' }} />}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              ) : isMobile ? (
                /* Mobile Drilldown View when a role is clicked on small screens */
                mobileModeView ? (
                  <div style={{ width: isSmallPhone ? 230 : 255, display: 'flex', flexDirection: 'column' }}>
                    <button
                      type="button"
                      onClick={() => setMobileModeView(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5, padding: '6px 8px',
                        borderRadius: 7, border: 'none', background: 'transparent',
                        color: isDark ? '#C084FC' : '#7C3AED', fontSize: 11.5, fontWeight: 600,
                        cursor: 'pointer', textAlign: 'left', marginBottom: 2,
                      }}
                    >
                      <ArrowLeft size={12} />
                      <span>Back to Personas</span>
                    </button>
                    <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: isDark ? 'rgba(255,255,255,0.4)' : '#64748B', padding: '3px 8px 5px' }}>
                      Modes &middot; {currentHoveredRole.label}
                    </div>
                    <div
                      className="custom-dropdown-scroll"
                      style={{
                        maxHeight: 195,
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        paddingRight: 4,
                        scrollbarWidth: 'thin',
                        scrollbarColor: isDark ? 'rgba(168, 85, 247, 0.45) transparent' : 'rgba(124, 58, 237, 0.35) transparent',
                      }}
                    >
                      {/* All Modes / Auto selection for mobile drilldown */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRole(currentHoveredRole.id);
                          setActiveMode('');
                          setOpenDropdown(null);
                          setMobileModeView(false);
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          width: '100%', padding: '5.5px 8px', borderRadius: 7, border: 'none',
                          background: (activeRole === currentHoveredRole.id && !activeMode)
                            ? (isDark ? 'rgba(124, 58, 237, 0.22)' : 'rgba(124, 58, 237, 0.10)')
                            : 'transparent',
                          color: (activeRole === currentHoveredRole.id && !activeMode)
                            ? (isDark ? '#FFFFFF' : '#6D28D9')
                            : (isDark ? 'rgba(255, 255, 255, 0.78)' : '#334155'),
                          fontSize: 12, fontWeight: (activeRole === currentHoveredRole.id && !activeMode) ? 600 : 500,
                          cursor: 'pointer', textAlign: 'left',
                          marginBottom: 2,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Sparkles size={12.5} style={{ color: (activeRole === currentHoveredRole.id && !activeMode) ? (isDark ? '#C084FC' : '#7C3AED') : (isDark ? 'rgba(255,255,255,0.45)' : '#64748B') }} />
                          <span>All Modes (Auto)</span>
                        </div>
                        {activeRole === currentHoveredRole.id && !activeMode && (
                          <Check size={13} style={{ color: isDark ? '#C084FC' : '#7C3AED' }} />
                        )}
                      </button>
                      {hoveredModes.map(m => {
                        const ModeIcon = getModeIcon(m);
                        const isSelected = activeRole === currentHoveredRole.id && activeMode === m;
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              setActiveRole(currentHoveredRole.id);
                              setActiveMode(m);
                              setOpenDropdown(null);
                              setMobileModeView(false);
                            }}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              width: '100%', padding: '5.5px 8px', borderRadius: 7, border: 'none',
                              background: isSelected
                                ? (isDark ? 'rgba(124, 58, 237, 0.22)' : 'rgba(124, 58, 237, 0.10)')
                                : 'transparent',
                              color: isSelected
                                ? (isDark ? '#FFFFFF' : '#6D28D9')
                                : (isDark ? 'rgba(255, 255, 255, 0.78)' : '#334155'),
                              fontSize: 12, fontWeight: isSelected ? 600 : 500,
                              cursor: 'pointer', textAlign: 'left',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <ModeIcon size={12.5} style={{ color: isSelected ? (isDark ? '#C084FC' : '#7C3AED') : (isDark ? 'rgba(255,255,255,0.45)' : '#64748B') }} />
                              <span>{m}</span>
                            </div>
                            {isSelected && <Check size={13} style={{ color: isDark ? '#C084FC' : '#7C3AED' }} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Mobile Single-Column Persona List */
                  <div
                    className="custom-dropdown-scroll"
                    style={{
                      width: isSmallPhone ? 230 : 255,
                      maxHeight: 195,
                      overflowY: 'auto',
                      paddingRight: 4,
                      scrollbarWidth: 'thin',
                      scrollbarColor: isDark ? 'rgba(168, 85, 247, 0.45) transparent' : 'rgba(124, 58, 237, 0.35) transparent',
                    }}
                  >
                    <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: isDark ? 'rgba(255,255,255,0.4)' : '#64748B', padding: '4px 8px 3px' }}>
                      Select Persona
                    </div>
                    {ROLES.map(role => {
                      const Icon = role.icon;
                      const isCurrentActive = activeRole === role.id;
                      const hasSubModes = (ROLE_MODES[role.id]?.length || 0) > 0;

                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => {
                            setHoveredRoleId(role.id);
                            if (hasSubModes) {
                              setMobileModeView(true);
                              return;
                            }
                            setActiveRole(role.id);
                            setActiveMode('');
                            setOpenDropdown(null);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: 7,
                            border: 'none',
                            background: isCurrentActive
                              ? (isDark ? 'rgba(124, 58, 237, 0.22)' : 'rgba(124, 58, 237, 0.10)')
                              : 'transparent',
                            color: isCurrentActive
                              ? (isDark ? '#FFFFFF' : '#6D28D9')
                              : (isDark ? 'rgba(255, 255, 255, 0.82)' : '#334155'),
                            fontSize: 12,
                            fontWeight: isCurrentActive ? 600 : 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 120ms ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <Icon size={13.5} style={{ color: isCurrentActive ? (isDark ? '#C084FC' : '#7C3AED') : (isDark ? 'rgba(255,255,255,0.5)' : '#64748B') }} />
                            <span>{role.label}</span>
                          </div>
                          {isCurrentActive ? (
                            <Check size={12.5} style={{ color: isDark ? '#C084FC' : '#7C3AED' }} />
                          ) : hasSubModes ? (
                            <ChevronRight size={12} style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#94A3B8' }} />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                )
              ) : (
                /* Desktop / Standard Side-by-Side View */
                <div style={{ display: 'flex' }}>
                  {/* Left Column: Roles / Personas with visible sleek scrollbar */}
                  <div
                    className="custom-dropdown-scroll"
                    style={{
                      width: 172,
                      maxHeight: 195,
                      overflowY: 'auto',
                      paddingRight: 4,
                      scrollbarWidth: 'thin',
                      scrollbarColor: isDark ? 'rgba(168, 85, 247, 0.45) transparent' : 'rgba(124, 58, 237, 0.35) transparent',
                    }}
                  >
                    <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: isDark ? 'rgba(255,255,255,0.4)' : '#64748B', padding: '4px 8px 3px' }}>
                      Select Persona
                    </div>
                    {ROLES.map(role => {
                      const Icon = role.icon;
                      const isCurrentActive = activeRole === role.id;
                      const isHovered = hoveredRoleId === role.id;
                      const hasSubModes = (ROLE_MODES[role.id]?.length || 0) > 0;

                      return (
                        <button
                          key={role.id}
                          type="button"
                          onMouseEnter={() => !isMobile && setHoveredRoleId(role.id)}
                          onClick={() => {
                            setHoveredRoleId(role.id);
                            if (isMobile && hasSubModes) {
                              setMobileModeView(true);
                              return;
                            }
                            // Clicking persona directly selects role without mode
                            setActiveRole(role.id);
                            setActiveMode('');
                            setOpenDropdown(null);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '5.5px 7px',
                            borderRadius: 7,
                            border: 'none',
                            background: (isHovered && !isMobile) || isCurrentActive
                              ? (isDark ? 'rgba(124, 58, 237, 0.22)' : 'rgba(124, 58, 237, 0.10)')
                              : 'transparent',
                            color: isCurrentActive
                              ? (isDark ? '#FFFFFF' : '#6D28D9')
                              : (isDark ? 'rgba(255, 255, 255, 0.82)' : '#334155'),
                            fontSize: 12,
                            fontWeight: isCurrentActive ? 600 : 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 120ms ease',
                          }}
                          className={!isCurrentActive ? (isDark ? 'hover:bg-[rgba(255,255,255,0.06)]' : 'hover:bg-[rgba(124,58,237,0.05)]') : ''}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <Icon size={13.5} style={{ color: isCurrentActive ? (isDark ? '#C084FC' : '#7C3AED') : (isDark ? 'rgba(255,255,255,0.5)' : '#64748B') }} />
                            <span>{role.label}</span>
                          </div>
                          {isCurrentActive ? (
                            <Check size={12.5} style={{ color: isDark ? '#C084FC' : '#7C3AED' }} />
                          ) : hasSubModes ? (
                            <ChevronRight size={12} style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#94A3B8' }} />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>

                  {/* Right Column: Sub-modes for the Hovered Persona */}
                  <div
                    style={{
                      width: 200,
                      maxHeight: 195,
                      borderLeft: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124, 58, 237, 0.10)'}`,
                      paddingLeft: 5,
                      marginLeft: 2,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: isDark ? 'rgba(255,255,255,0.4)' : '#64748B', padding: '4px 8px 3px' }}>
                      {roleHasModes ? `Modes · ${currentHoveredRole.label}` : 'Persona Details'}
                    </div>

                    <div
                      className="custom-dropdown-scroll"
                      style={{
                        flex: 1,
                        minHeight: 0,
                        maxHeight: 165,
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        paddingRight: 4,
                        scrollbarWidth: 'thin',
                        scrollbarColor: isDark ? 'rgba(168, 85, 247, 0.45) transparent' : 'rgba(124, 58, 237, 0.35) transparent',
                      }}
                    >
                      {roleHasModes ? (
                        <>
                          {/* All Modes / Auto selection button */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRole(currentHoveredRole.id);
                              setActiveMode('');
                              setOpenDropdown(null);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              width: '100%',
                              padding: '5px 7px',
                              borderRadius: 7,
                              border: 'none',
                              background: activeRole === currentHoveredRole.id && !activeMode
                                ? (isDark ? 'rgba(124, 58, 237, 0.22)' : 'rgba(124, 58, 237, 0.10)')
                                : 'transparent',
                              color: activeRole === currentHoveredRole.id && !activeMode
                                ? (isDark ? '#FFFFFF' : '#6D28D9')
                                : (isDark ? 'rgba(255, 255, 255, 0.78)' : '#334155'),
                              fontSize: 11.5,
                              fontWeight: activeRole === currentHoveredRole.id && !activeMode ? 600 : 500,
                              cursor: 'pointer',
                              textAlign: 'left',
                              marginBottom: 2,
                            }}
                            className={!(activeRole === currentHoveredRole.id && !activeMode) ? (isDark ? 'hover:bg-[rgba(255,255,255,0.06)]' : 'hover:bg-[rgba(124,58,237,0.05)]') : ''}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Sparkles size={12.5} style={{ color: (activeRole === currentHoveredRole.id && !activeMode) ? (isDark ? '#C084FC' : '#7C3AED') : (isDark ? 'rgba(255,255,255,0.45)' : '#64748B') }} />
                              <span>All Modes (Auto)</span>
                            </div>
                            {activeRole === currentHoveredRole.id && !activeMode && (
                              <Check size={12} style={{ color: isDark ? '#C084FC' : '#7C3AED' }} />
                            )}
                          </button>
                          {hoveredModes.map(m => {
                            const ModeIcon = getModeIcon(m);
                            const isSelected = activeRole === currentHoveredRole.id && activeMode === m;
                            return (
                              <button
                                key={m}
                                type="button"
                                onClick={() => {
                                  setActiveRole(currentHoveredRole.id);
                                  setActiveMode(m);
                                  setOpenDropdown(null);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  padding: '5px 7px',
                                  borderRadius: 7,
                                  border: 'none',
                                  background: isSelected
                                    ? (isDark ? 'rgba(124, 58, 237, 0.22)' : 'rgba(124, 58, 237, 0.10)')
                                    : 'transparent',
                                  color: isSelected
                                    ? (isDark ? '#FFFFFF' : '#6D28D9')
                                    : (isDark ? 'rgba(255, 255, 255, 0.78)' : '#334155'),
                                  fontSize: 11.5,
                                  fontWeight: isSelected ? 600 : 500,
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  transition: 'all 120ms ease',
                                }}
                                className={!isSelected ? (isDark ? 'hover:bg-[rgba(255,255,255,0.06)]' : 'hover:bg-[rgba(124,58,237,0.05)]') : ''}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <ModeIcon size={12.5} style={{ color: isSelected ? (isDark ? '#C084FC' : '#7C3AED') : (isDark ? 'rgba(255,255,255,0.45)' : '#64748B') }} />
                                  <span>{m}</span>
                                </div>
                                {isSelected && <Check size={12} style={{ color: isDark ? '#C084FC' : '#7C3AED' }} />}
                              </button>
                            );
                          })}
                        </>
                      ) : (
                        <div style={{ padding: '8px 6px', fontSize: 11.5, color: isDark ? 'rgba(255,255,255,0.6)' : '#64748B', lineHeight: 1.4 }}>
                          <p style={{ margin: '0 0 8px' }}>
                            <strong>General persona</strong> applies balanced enhancement suitable for all tasks without specialized role framing.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRole('general');
                              setActiveMode('');
                              setOpenDropdown(null);
                            }}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 7,
                              border: `1px solid ${isDark ? 'rgba(168, 85, 247, 0.35)' : 'rgba(124, 58, 237, 0.25)'}`,
                              background: isDark ? 'rgba(124, 58, 237, 0.16)' : 'rgba(124, 58, 237, 0.08)',
                              color: isDark ? '#E9D5FF' : '#6D28D9',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              width: '100%',
                            }}
                          >
                            Apply General
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // ── 3. Depth Dropdown (Integrated into + menu for all screen sizes) ──
  const renderDepthPill = () => null;

  // ── 4. Action Buttons (Icon-only with hover purpose tooltip) ──
  const renderActionButtons = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      {/* Subtle Vertical Divider separating parameter pills from action triggers */}
      <div
        style={{
          width: 1,
          height: 22,
          background: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.12)',
          margin: '0 2px',
          flexShrink: 0,
        }}
      />

      {/* 1. Analyze Action Button (Icon-only with hover purpose tooltip) */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          id="analyze-btn"
          aria-label={isAnalyzing ? 'Analyzing...' : 'Analyze'}
          title="Analyze Prompt"
          onMouseEnter={() => setHoveredAction('analyze')}
          onMouseLeave={() => setHoveredAction(null)}
          onClick={() => {
            if (originalText.length > 12000) return;
            onAnalyze(originalText);
          }}
          disabled={isAnalyzing || isOptimizing || originalText.length > 12000}
          style={{
            width: 35,
            height: 35,
            borderRadius: 11,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: (isAnalyzing || isOptimizing || originalText.length > 12000) ? 'not-allowed' : 'pointer',
            background: originalText.length > 12000
              ? (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)')
              : (isDark ? 'rgba(124, 58, 237, 0.14)' : 'rgba(124, 58, 237, 0.08)'),
            border: `1px solid ${isDark ? 'rgba(168, 85, 247, 0.32)' : 'rgba(124, 58, 237, 0.24)'}`,
            color: originalText.length > 12000
              ? (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)')
              : (isDark ? '#E9D5FF' : '#5B21B6'),
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 1px 3px rgba(124,58,237,0.08)',
            opacity: (isAnalyzing || isOptimizing || originalText.length > 12000) ? 0.55 : 1,
            transition: 'all 180ms ease',
          }}
          className={!(isAnalyzing || isOptimizing || originalText.length > 12000)
            ? 'hover:bg-[rgba(124,58,237,0.24)] hover:border-[rgba(168,85,247,0.55)] hover:shadow-[0_0_12px_rgba(168,85,247,0.25)] hover:scale-105 active:scale-95'
            : ''}
        >
          <Sparkles size={16} style={{ color: isDark ? '#C084FC' : '#7C3AED' }} />
          <span className="sr-only">{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
        </button>

        {/* Floating Tooltip */}
        <AnimatePresence>
          {hoveredAction === 'analyze' && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95, x: '-50%' }}
              animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
              exit={{ opacity: 0, y: 4, scale: 0.95, x: '-50%' }}
              transition={{ duration: 0.12 }}
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: '50%',
                pointerEvents: 'none',
                zIndex: 100,
                background: isDark ? '#1C1A2E' : '#FFFFFF',
                border: `1px solid ${isDark ? 'rgba(168, 85, 247, 0.35)' : 'rgba(124, 58, 237, 0.22)'}`,
                borderRadius: 8,
                padding: '5px 10px',
                boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.65), 0 0 14px rgba(124,58,237,0.2)' : '0 8px 20px rgba(124,58,237,0.15)',
                whiteSpace: 'nowrap',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <span style={{ fontSize: 11.5, fontWeight: 700, color: isDark ? '#F1F5F9' : '#1E293B' }}>Analyze</span>
              <span style={{ fontSize: 10, color: isDark ? 'rgba(255,255,255,0.5)' : '#64748B' }}>Score clarity & structure</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Hero Primary Enhance Action Button (Icon-only with hover purpose tooltip) */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          id="optimize-btn"
          aria-label={isOptimizing ? 'Optimizing...' : 'Enhance'}
          title="Enhance Prompt (Ctrl+Enter)"
          onMouseEnter={() => setHoveredAction('enhance')}
          onMouseLeave={() => setHoveredAction(null)}
          onClick={() => {
            if (originalText.length > 12000) return;
            onOptimize(originalText, activeRole, activeMode, enhancementLevel);
          }}
          disabled={isOptimizing || isAnalyzing || originalText.length > 12000}
          style={{
            width: 37,
            height: 35,
            borderRadius: 11,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: (isOptimizing || isAnalyzing || originalText.length > 12000) ? 'not-allowed' : 'pointer',
            background: (!isOptimizing && !isAnalyzing && originalText.length <= 12000)
              ? 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #9333EA 100%)'
              : (isDark ? 'rgba(107,107,138,0.20)' : 'rgba(0,0,0,0.08)'),
            color: (!isOptimizing && !isAnalyzing && originalText.length <= 12000) ? '#FFFFFF' : 'rgba(107,107,138,0.60)',
            border: (!isOptimizing && !isAnalyzing && originalText.length <= 12000)
              ? '1px solid rgba(255, 255, 255, 0.22)'
              : 'none',
            boxShadow: (!isOptimizing && !isAnalyzing && originalText.length <= 12000)
              ? '0 4px 18px rgba(124, 58, 237, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
              : 'none',
            opacity: (isOptimizing || originalText.length > 12000) ? 0.65 : 1,
            transition: 'all 180ms ease',
          }}
          className={(!isOptimizing && !isAnalyzing && originalText.length <= 12000)
            ? 'hover:brightness-110 hover:shadow-[0_6px_22px_rgba(124,58,237,0.60)] hover:scale-105 active:scale-95'
            : ''}
        >
          <Wand2 size={16} className={isOptimizing ? 'animate-spin' : ''} />
          <span className="sr-only">{isOptimizing ? 'Optimizing...' : 'Enhance'}</span>
        </button>

        {/* Floating Tooltip */}
        <AnimatePresence>
          {hoveredAction === 'enhance' && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95, x: '-50%' }}
              animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
              exit={{ opacity: 0, y: 4, scale: 0.95, x: '-50%' }}
              transition={{ duration: 0.12 }}
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: '50%',
                pointerEvents: 'none',
                zIndex: 100,
                background: isDark ? '#1C1A2E' : '#FFFFFF',
                border: `1px solid ${isDark ? 'rgba(168, 85, 247, 0.35)' : 'rgba(124, 58, 237, 0.22)'}`,
                borderRadius: 8,
                padding: '5px 10px',
                boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.65), 0 0 14px rgba(124,58,237,0.2)' : '0 8px 20px rgba(124,58,237,0.15)',
                whiteSpace: 'nowrap',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: isDark ? '#F1F5F9' : '#1E293B' }}>Enhance</span>
                <span style={{ fontSize: 9.5, fontWeight: 600, padding: '1px 5px', borderRadius: 4, background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(124,58,237,0.1)', color: isDark ? '#C084FC' : '#7C3AED' }}>Ctrl+Enter</span>
              </div>
              <span style={{ fontSize: 10, color: isDark ? 'rgba(255,255,255,0.5)' : '#64748B' }}>Elevate tone & quality</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  // ── Gemini Centered Hero Layout when !showRightPanel ──
  if (!showRightPanel) {
    return (
      <div
        style={{
          width: '100%',
          flex: 1,
          minHeight: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: isLandscape
            ? '10px 12px'
            : isSmallPhone
            ? '16px 10px'
            : isMobile
            ? '20px 14px'
            : '24px 24px',
          boxSizing: 'border-box',
          overflow: 'visible',
          background: isDark
            ? 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(124, 58, 237, 0.16) 0%, rgba(99, 102, 241, 0.05) 45%, transparent 75%)'
            : 'none',
        }}
      >
        {/* Top-Right New/Clear icon if text is entered */}
        {originalText && (
          <button
            type="button"
            onClick={() => setOriginalText('')}
            title="Clear prompt"
            style={{
              position: 'absolute',
              top: isMobile ? 8 : 16,
              right: isMobile ? 8 : 16,
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
              color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748B',
              cursor: 'pointer',
              transition: 'all 180ms ease',
            }}
            className="hover:!text-[var(--color-primary)] hover:!border-[var(--color-primary)] hover:scale-105"
          >
            <RotateCcw size={15} />
          </button>
        )}

        {/* ── Centered Hero Title (Exact Gemini typography) ── */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            fontSize: isLandscape ? 22 : isSmallPhone ? 22 : isMobile ? 26 : 34,
            fontWeight: 500,
            letterSpacing: '-0.025em',
            color: isDark ? '#F1F5F9' : '#1E293B',
            textAlign: 'center',
            marginBottom: isLandscape ? 10 : isSmallPhone ? 14 : isMobile ? 18 : 22,
            lineHeight: 1.2,
          }}
        >
          Optimize your prompt
        </motion.h1>

        {/* ── Floating Pill/Capsule Input Container ── */}
        <motion.div
          ref={controlsRef}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{
            width: '100%',
            maxWidth: 860,
            borderRadius: 28,
            background: isDark ? 'rgba(24, 22, 38, 0.88)' : '#FFFFFF',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.10)' : '#E2E8F0'}`,
            boxShadow: isDark
              ? '0 16px 48px -12px rgba(0, 0, 0, 0.65), 0 0 24px rgba(124, 58, 237, 0.10)'
              : 'none',
            padding: isSmallPhone ? '12px 14px 10px' : isMobile ? '12px 16px 12px' : '14px 18px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: templateName ? 8 : 10,
            position: 'relative',
            transition: 'border-color 200ms ease, box-shadow 200ms ease',
          }}
          className={
            isDark
              ? 'focus-within:!border-[rgba(168,85,247,0.55)] focus-within:!shadow-[0_20px_56px_-10px_rgba(0,0,0,0.75),0_0_30px_rgba(124,58,237,0.22)]'
              : 'focus-within:!border-[#A855F7] focus-within:!shadow-none'
          }
        >
          {/* ── Rotating Border Glow Line (Circular Orbital Beam) ── */}
          <div
            className="pointer-events-none absolute -inset-[1.5px] rounded-[29.5px] overflow-hidden"
            style={{
              padding: 1.5,
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              zIndex: 2,
            }}
            aria-hidden="true"
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 2200,
                height: 2200,
                transform: 'translate(-50%, -50%)',
                animation: 'spinBeam 6s linear infinite',
                background: isDark
                  ? 'conic-gradient(from 0deg, transparent 0deg, transparent 260deg, rgba(168,85,247,0.3) 295deg, #C084FC 330deg, #EC4899 350deg, #8B5CF6 360deg)'
                  : 'conic-gradient(from 0deg, transparent 0deg, transparent 260deg, rgba(168,85,247,0.35) 295deg, #7C3AED 330deg, #EC4899 350deg, #9333EA 360deg)',
              }}
            />
          </div>

          {/* ── Soft Beam Glow Accent (Travels with the beam head) ── */}
          <div
            className="pointer-events-none absolute -inset-[1px] rounded-[29px] overflow-hidden"
            style={{
              filter: isDark ? 'blur(6px)' : 'blur(4px)',
              opacity: isDark ? 0.7 : 0.45,
              padding: 2,
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              zIndex: 1,
            }}
            aria-hidden="true"
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 2200,
                height: 2200,
                transform: 'translate(-50%, -50%)',
                animation: 'spinBeam 6s linear infinite',
                background: isDark
                  ? 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(168,85,247,0.5) 320deg, #C084FC 345deg, #8B5CF6 360deg)'
                  : 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(168,85,247,0.4) 320deg, #7C3AED 345deg, #9333EA 360deg)',
              }}
            />
          </div>

          {/* Applied-template chip (if any) */}
          {templateName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 10, background: isDark ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.08)', border: `1px solid ${isDark ? 'rgba(168,85,247,0.3)' : 'rgba(124,58,237,0.2)'}`, alignSelf: 'flex-start', marginBottom: 2 }}>
              <LayoutTemplate size={13} style={{ color: '#A855F7' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: isDark ? '#E2E8F0' : '#1E293B' }}>{templateName}</span>
              {onClearTemplate && (
                <button type="button" onClick={onClearTemplate} style={{ background: 'transparent', border: 'none', color: isDark ? 'rgba(255,255,255,0.5)' : '#64748B', cursor: 'pointer', padding: 0 }}>
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {/* Prompt Bar: Unified 2-Row Layout across Mobile, Tablet, and Desktop */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
            {/* Row 1: Textarea with full width and comfortable multi-line typing */}
            <textarea
              value={originalText}
              onChange={e => setOriginalText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
                  e.preventDefault();
                  if (originalText.trim() && !isOptimizing && !isAnalyzing && originalText.length <= 12000) {
                    onOptimize(originalText, activeRole, activeMode, enhancementLevel);
                  }
                } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  if (originalText.trim() && !isOptimizing && !isAnalyzing && originalText.length <= 12000) {
                    onOptimize(originalText, activeRole, activeMode, enhancementLevel);
                  }
                }
              }}
              disabled={isOptimizing || isAnalyzing}
              placeholder="Paste or write below..."
              rows={originalText.split('\n').length > 1 ? Math.min(originalText.split('\n').length, 8) : (isMobile ? 2 : 3)}
              style={{
                width: '100%',
                fontSize: isMobile ? 14.5 : 15,
                lineHeight: 1.55,
                color: isDark ? '#F8FAFC' : '#0F172A',
                background: 'transparent',
                border: 'none',
                resize: 'none',
                outline: 'none',
                letterSpacing: '0.01em',
                minHeight: isMobile ? 46 : 56,
                maxHeight: 220,
                padding: '2px 4px',
                cursor: (isOptimizing || isAnalyzing) ? 'not-allowed' : 'text',
              }}
            />

            {/* Row 2: Clean Toolbar with all controls on ONE line */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%', minWidth: 0 }}>
              {/* Left: Plus button, Role pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0, flex: 1 }}>
                {renderPlusButton()}
                {renderRolePill()}
              </div>

              {/* Right: Word count + Action buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                {originalText && (
                  <span style={{ fontSize: 11, color: originalText.length > 12000 ? '#EF4444' : (isDark ? 'rgba(255,255,255,0.45)' : '#64748B'), fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {originalText.split(' ').filter(Boolean).length}w
                  </span>
                )}
                {renderActionButtons()}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

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
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: isMobile ? 12 : 16 }}>
          {/* Left: Title */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.48)' : '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: isMobile ? 2 : 4 }}>
              Your Prompt
            </div>
            <h2 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: isDark ? D.textPrimary : 'var(--color-text-primary)', margin: 0, letterSpacing: -0.3 }}>
              Paste or write below
            </h2>
          </div>

          {/* Right: Template chip + New Prompt button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Applied-template chip */}
            {templateName && (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 8px', maxWidth: 220, borderRadius: 14,
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

            {/* New Prompt button — always on the right */}
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                title="Start a new prompt"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 11px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  color: isDark ? '#C084FC' : '#7C3AED',
                  background: isDark ? 'rgba(124, 58, 237, 0.12)' : 'rgba(124, 58, 237, 0.06)',
                  border: `1px solid ${isDark ? 'rgba(168, 85, 247, 0.25)' : 'rgba(124, 58, 237, 0.18)'}`,
                  cursor: 'pointer',
                  transition: 'all 160ms ease',
                  flexShrink: 0,
                }}
                className="hover:scale-105 active:scale-95"
              >
                <RotateCcw size={12} />
                New Prompt
              </button>
            )}
          </div>
        </div>

        {/* Textarea & Integrated Toolbar */}
        <div
          ref={controlsRef}
          style={{
            flex: 1,
            border: originalText.length > 12000
              ? '1px solid #EF4444'
              : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(124,58,237,0.12)'}`,
            borderRadius: isMobile ? 14 : 16,
            background: originalText.length > 12000
              ? (isDark ? 'rgba(239, 68, 68, 0.15)' : '#FFF5F5')
              : (isDark ? 'rgba(14, 13, 20, 0.65)' : '#FDFCFF'),
            padding: isMobile ? '14px 14px 12px' : '18px 20px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: isMobile ? 220 : 200,
            boxShadow: originalText.length > 12000
              ? '0 0 0 3px rgba(239,68,68,0.12)'
              : (isDark ? 'inset 0 1px 3px rgba(0,0,0,0.3)' : 'inset 0 1px 3px rgba(109,40,217,0.03)'),
            transition: 'all 250ms ease',
            opacity: (isOptimizing || isAnalyzing) ? 0.7 : 1,
            position: 'relative',
          }}
        >
          {/* Textarea */}
          <textarea
            value={originalText}
            onChange={e => setOriginalText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                if (originalText.trim() && !isOptimizing && !isAnalyzing && originalText.length <= 12000) {
                  onOptimize(originalText, activeRole, activeMode, enhancementLevel);
                }
              }
            }}
            disabled={isOptimizing || isAnalyzing}
            placeholder="Paste or write below..."
            style={{
              width: '100%',
              flex: 1,
              minHeight: 100,
              fontSize: 14,
              lineHeight: 1.6,
              color: isDark ? D.textPrimary : 'var(--color-text-primary)',
              background: 'transparent',
              border: 'none',
              resize: 'none',
              outline: 'none',
              letterSpacing: '0.01em',
              cursor: (isOptimizing || isAnalyzing) ? 'not-allowed' : 'text',
              padding: 0,
            }}
          />

          {/* Unified Bottom Toolbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              marginTop: 12,
              paddingTop: 10,
              borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'}`,
              flexWrap: 'wrap',
              opacity: (isOptimizing || isAnalyzing) ? 0.6 : 1,
              pointerEvents: (isOptimizing || isAnalyzing) ? 'none' : 'auto',
            }}
          >
            {/* Left: Plus Button & Role Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flexWrap: 'wrap' }}>
              {renderPlusButton()}
              {renderRolePill()}
            </div>

            {/* Right: Char/Word Count & Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {originalText.length > 12000 ? (
                <span style={{ fontSize: 11, fontWeight: 600, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertTriangle size={13} /> Limit reached (12k max)
                </span>
              ) : (
                <span
                  style={{
                    fontSize: 11,
                    color: isDark ? 'rgba(255,255,255,0.45)' : '#64748B',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isSmallPhone
                    ? `${originalText.split(' ').filter(Boolean).length}w`
                    : `${originalText.split(' ').filter(Boolean).length} words · ${originalText.length.toLocaleString()} / 12,000 chars`}
                </span>
              )}
              {renderActionButtons()}
            </div>
          </div>
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
              height: stackCards ? 'auto' : 640,
              maxHeight: stackCards ? 'none' : 640,
            }}
          >
            {/* Score panel */}
            {showScorePanel && (
              <div style={{
                ...cardStyle,
                ...responsiveCard,
                width: '100%',
                flex: 'none',
                height: stackCards ? 'auto' : '100%',
                maxHeight: stackCards ? 'none' : 640,
                minHeight: stackCards ? (isMobile ? 380 : 440) : undefined,
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: isDark ? 'rgba(139,92,246,0.25) transparent' : 'rgba(124,58,237,0.2) transparent',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.48)' : 'var(--color-text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Analysis
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: isDark ? D.textPrimary : 'var(--color-text-primary)', margin: '0 0 16px', letterSpacing: -0.3 }}>
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
                height: stackCards ? 'auto' : '100%',
                maxHeight: stackCards ? 'none' : 640,
                minHeight: stackCards ? (isMobile ? 380 : 440) : undefined,
                padding: isSmallPhone ? '14px 12px' : isMobile ? '18px 16px' : '26px 8px 26px 30px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: isMobile ? 12 : 16, minHeight: 34, height: 'auto', flexWrap: 'wrap', paddingRight: isMobile ? 0 : 28 }}>
                  <h2 style={{ fontSize: 11.5, fontWeight: 600, color: isDark ? D.textMuted : 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: isOptimizing ? 0.6 : 1, margin: 0 }}>
                    Optimized Prompt
                  </h2>

                  {(isOptimized || isOptimizing) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: isOptimizing ? 0.6 : 1, pointerEvents: isOptimizing ? 'none' : 'auto', flexShrink: 0, flexWrap: 'wrap' }}>
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
                                initial={{ opacity: 0, y: 5, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.97 }}
                                transition={{ duration: 0.16 }}
                                role="menu"
                                style={{
                                  position: 'absolute', bottom: 'calc(100% + 8px)', right: 0, minWidth: '100%',
                                  transformOrigin: 'bottom right',
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
                                        if (!isActive) {
                                          onRestoreVersion?.(version.version_number);
                                        }
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
                    /* Live formatted token stream */
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
                        animation: 'fadeInRise 300ms ease-out forwards',
                        scrollbarWidth: 'thin',
                        scrollbarColor: isDark ? 'rgba(139,92,246,0.3) transparent' : 'rgba(124,58,237,0.25) transparent',
                        WebkitOverflowScrolling: 'touch',
                      }}
                    >
                      <FormattedPromptViewer content={formatPromptText(streamingText)} isStreaming={true} />
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
