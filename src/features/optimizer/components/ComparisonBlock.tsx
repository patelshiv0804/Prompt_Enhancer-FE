'use client';

import React, { useState, useEffect } from 'react';
import {
  Copy, RefreshCw, Bookmark, ArrowRightToLine,
  Sparkles, Code2, Search, Megaphone, GraduationCap, Briefcase,
  School, Rocket, PenTool, BarChart3, Palette, Video, Wand2,
  CheckCircle2, AlertTriangle, Minus, FileText, Layers, Monitor,
  Smartphone, Server, Database, ShieldCheck, Globe, Cpu, Terminal,
  Lightbulb, DollarSign, Scale, ShoppingCart, Users, Mail, Radio,
  Activity, PieChart, TrendingUp, BookOpen, Building2, Layout, Award, Zap, GitBranch, ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FormattedPromptViewer from './FormattedPromptViewer';

import { ROLES, ROLE_MODES, getModeIcon } from '@/constants/roles';

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
    return 'var(--color-text-secondary)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
      {/* Top row: ring + meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingBottom: 16, borderBottom: '1px solid rgba(124,58,237,0.08)' }}>
        <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
          <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="55" cy="55" r={radius} fill="none" stroke="rgba(124,58,237,0.10)" strokeWidth="8" />
            <circle
              cx="55" cy="55" r={radius} fill="none"
              stroke="var(--color-primary)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1.4s ease-out', filter: 'drop-shadow(0 0 6px rgba(124,58,237,0.32))' }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 30, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: -1.5 }}>{animScore}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary)', letterSpacing: -0.3 }}>
            {scoreLabel(score)}
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.4, margin: 0 }}>
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
                background: 'rgba(124,58,237,0.03)', border: '1px solid rgba(124,58,237,0.09)',
                borderRadius: 12, padding: '10px 12px', position: 'relative', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', gap: 4,
                transition: 'transform 250ms ease, box-shadow 250ms ease, background 250ms ease',
                animationDelay: active ? `${i * 60}ms` : '0ms',
              }}
              className="hover:translate-y-[-2px] hover:!bg-[rgba(124,58,237,0.06)] hover:shadow-[0_6px_20px_rgba(109,40,217,0.09)]"
            >
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, borderRadius: '3px 0 0 3px', background: edgeBg(dim.status) }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon size={14} style={{ color: iconCol(dim.status), flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', flex: 1 }}>{dim.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, flexShrink: 0, color: scoreColor(scoreVal) }}>{scoreVal}</span>
              </div>
              <div style={{ height: 3, background: 'rgba(124,58,237,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99, background: scoreColor(scoreVal),
                  width: active ? `${scoreVal}%` : '0%', transition: `width 0.8s ease-out ${i * 60}ms`,
                }} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', lineHeight: 1.4, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={dim.desc}>{dim.desc}</p>
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
  // History fields
  versions?: any[];
  activeVersionNumber?: number | null;
  onRestoreVersion?: (versionNumber: number) => void;
  initialOriginalPromptText?: string;
}

/* ── Main component ─────────────────────────────────────────────────────── */
export default function ComparisonBlock({
  isAnalyzing, isAnalyzed, isOptimizing, isOptimized, onAnalyze, onOptimize, onReenhance,
  analysisResult, optimizationResult, versions = [], activeVersionNumber = null, onRestoreVersion,
  initialOriginalPromptText = '',
}: ComparisonBlockProps) {
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

  return (
    <div style={{ display: 'flex', width: '100%', marginBottom: 32 }}>

      {/* ── Left Card: Original Prompt ── */}
      <motion.div
        style={{
          ...cardStyle,
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(124,58,237,0.2) transparent',
        }}
        layout
        transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
        className="hover:translate-y-[-3px] hover:shadow-[0_12px_48px_rgba(109,40,217,0.10),0_4px_12px_rgba(0,0,0,0.05)]"
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 8 }}>
          Your Prompt
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 24px', letterSpacing: -0.3 }}>
          Paste, drop, or write below
        </h2>

        {/* Textarea */}
        <div
          style={{
            flex: 1,
            border: originalText.length > 12000 ? '1px solid #EF4444' : '1px solid rgba(124,58,237,0.10)',
            borderRadius: 18,
            background: originalText.length > 12000 ? '#FFF5F5' : '#FDFCFF',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 200,
            boxShadow: originalText.length > 12000 ? '0 0 0 3px rgba(239,68,68,0.12)' : 'inset 0 1px 3px rgba(109,40,217,0.03)',
            transition: 'all 300ms ease-in-out',
          }}
          className="focus-within:!bg-[#FAFAFE] focus-within:!border-[rgba(124,58,237,0.35)] focus-within:shadow-[inset_0_1px_3px_rgba(0,0,0,0.02),0_0_0_3px_rgba(124,58,237,0.08),0_0_20px_rgba(124,58,237,0.05)]"
        >
          <textarea
            value={originalText}
            onChange={e => setOriginalText(e.target.value)}
            placeholder="Paste, drop, or write below..."
            style={{
              width: '100%', flex: 1, fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-primary)',
              background: 'transparent', border: 'none', resize: 'none', outline: 'none', letterSpacing: '0.01em',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
            {originalText.length > 12000 ? (
              <span style={{ fontSize: 12, fontWeight: 600, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertTriangle size={14} /> Maximum character limit reached (12,000 max)
              </span>
            ) : (
              <span />
            )}
            <span style={{ fontSize: 12, fontWeight: originalText.length > 12000 ? 700 : 400, color: originalText.length > 12000 ? '#DC2626' : 'var(--color-text-secondary)' }}>
              {originalText.split(' ').filter(Boolean).length} words &middot; {originalText.length.toLocaleString()} / 12,000 chars
            </span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Role</div>
          <div style={{ paddingBottom: 4 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {ROLES.map(role => {
                const Icon = role.icon;
                const active = activeRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => {
                      setActiveRole(role.id);
                      const modes = ROLE_MODES[role.id] || [];
                      if (modes.length > 0) setActiveMode(modes[0]);
                      else setActiveMode('');
                    }}
                    style={{
                      padding: '8px 16px', borderRadius: 9999, fontSize: 13, fontWeight: active ? 600 : 500,
                      cursor: 'pointer', transition: 'all 250ms ease', display: 'flex', alignItems: 'center', gap: 6,
                      color: active ? '#6D28D9' : '#6B6B8A',
                      background: active
                        ? 'linear-gradient(160deg, rgba(167,139,250,0.22) 0%, rgba(196,181,253,0.12) 100%)'
                        : 'linear-gradient(160deg, rgba(109,40,217,0.07) 0%, rgba(124,58,237,0.03) 100%)',
                      border: `1px solid ${active ? 'rgba(124,58,237,0.30)' : 'rgba(124,58,237,0.12)'}`,
                      boxShadow: active
                        ? 'inset 0 1px 0 rgba(255,255,255,0.70), 0 4px 14px rgba(124,58,237,0.18), 0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(124,58,237,0.18)'
                        : 'inset 0 2px 4px rgba(80,20,180,0.10), inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.80)',
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
                style={{ display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden', marginTop: 4 }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '1.2px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>Select Mode</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)', textTransform: 'none' }}>
                    for {ROLES.find(r => r.id === activeRole)?.label}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: 180, overflowY: 'auto', paddingRight: 4 }}>
                  {ROLE_MODES[activeRole].map(m => {
                    const active = activeMode === m;
                    const ModeIcon = getModeIcon(m);
                    return (
                      <button
                        key={m}
                        onClick={() => setActiveMode(m)}
                        style={{
                          padding: '6px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: active ? 600 : 500,
                          cursor: 'pointer', transition: 'all 180ms ease', display: 'flex', alignItems: 'center', gap: 6,
                          color: active ? '#FFFFFF' : 'var(--color-text-primary)',
                          background: active
                            ? 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)'
                            : 'rgba(124,58,237,0.05)',
                          border: active ? 'none' : '1px solid rgba(124,58,237,0.10)',
                          boxShadow: active ? '0 3px 10px rgba(124,58,237,0.25)' : 'none',
                        }}
                        className={!active ? 'hover:!bg-[rgba(124,58,237,0.10)]' : ''}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Enhancement Depth</div>
            <div style={{
              display: 'inline-flex', position: 'relative',
              background: 'linear-gradient(160deg, rgba(109,40,217,0.09) 0%, rgba(124,58,237,0.04) 100%)',
              border: '1px solid rgba(124,58,237,0.13)', borderRadius: 9999, padding: 4,
              boxShadow: 'inset 0 2px 5px rgba(80,20,180,0.13), inset 0 1px 2px rgba(0,0,0,0.07), 0 1px 0 rgba(255,255,255,0.80)',
              alignSelf: 'flex-start',
            }}>
              {(['auto', 'minimal', 'standard', 'deep'] as const).map((lvl) => (
                <button
                  key={lvl}
                  id={`enhancement-level-${lvl}`}
                  onClick={() => setEnhancementLevel(lvl)}
                  style={{
                    padding: '5px 14px', fontSize: 13,
                    fontWeight: lvl === enhancementLevel ? 600 : 500,
                    color: lvl === enhancementLevel ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    position: 'relative', zIndex: 2, transition: 'color 250ms ease',
                    background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 9999, whiteSpace: 'nowrap',
                    textTransform: 'capitalize',
                  }}
                >
                  {lvl === 'auto' ? '⚡ Auto' : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                </button>
              ))}
              {/* Sliding pill indicator */}
              <div style={{
                position: 'absolute', top: 4, bottom: 4,
                width: 'calc(25% - 4px)',
                left: `calc(${['auto','minimal','standard','deep'].indexOf(enhancementLevel)} * 25% + 4px)`,
                background: '#FFFFFF', borderRadius: 9999, zIndex: 1,
                transition: 'left 300ms cubic-bezier(0.4,0,0.2,1)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.95), 0 3px 8px rgba(80,20,180,0.12), 0 1px 3px rgba(0,0,0,0.10), 0 0 0 1px rgba(124,58,237,0.07)',
              }} />
            </div>
            {enhancementLevel === 'auto' && (
              <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                AI will detect the right depth automatically.
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button
              id="analyze-btn"
              onClick={() => {
                if (originalText.length > 12000) return;
                onAnalyze(originalText);
              }}
              disabled={isAnalyzing || isOptimizing || originalText.length > 12000}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 32px',
                borderRadius: 11, fontSize: 14, fontWeight: 600, border: 'none',
                cursor: (isAnalyzing || isOptimizing || originalText.length > 12000) ? 'not-allowed' : 'pointer',
                background: originalText.length > 12000 ? 'rgba(107,107,138,0.20)' : 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
                color: originalText.length > 12000 ? 'rgba(107,107,138,0.60)' : 'white',
                boxShadow: originalText.length > 12000 ? 'none' : '0 4px 16px rgba(124,58,237,0.30)',
                opacity: (isAnalyzing || isOptimizing || originalText.length > 12000) ? 0.75 : 1,
                transition: 'all 220ms ease',
              }}
              className={!(isAnalyzing || isOptimizing || originalText.length > 12000) ? 'hover:translate-y-[-1px] hover:shadow-[0_8px_24px_rgba(124,58,237,0.40)] hover:brightness-105' : ''}
            >
              <Sparkles size={13} style={{ animation: 'pulseGlow 2s infinite' }} />
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
                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 32px',
                borderRadius: 11, fontSize: 14, fontWeight: 600,
                cursor: (isOptimizing || isAnalyzing || originalText.length > 12000) ? 'not-allowed' : 'pointer',
                background: (!isOptimizing && !isAnalyzing && originalText.length <= 12000)
                  ? 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)'
                  : 'rgba(107,107,138,0.20)',
                color: (!isOptimizing && !isAnalyzing && originalText.length <= 12000) ? 'white' : 'rgba(107,107,138,0.60)',
                border: (!isOptimizing && !isAnalyzing && originalText.length <= 12000) ? 'none' : '1px solid rgba(124,58,237,0.10)',
                boxShadow: (!isOptimizing && !isAnalyzing && originalText.length <= 12000) ? '0 4px 16px rgba(109,40,217,0.30)' : 'none',
                opacity: (isOptimizing || originalText.length > 12000) ? 0.75 : 1,
                transition: 'all 220ms ease',
              }}
              className={(!isOptimizing && !isAnalyzing && originalText.length <= 12000) ? 'hover:translate-y-[-1px] hover:shadow-[0_8px_24px_rgba(109,40,217,0.42)] hover:brightness-105' : ''}
            >
              <Wand2 size={13} />
              <span>{isOptimizing ? 'Optimizing...' : 'Optimize'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Right Panel ── */}
      <AnimatePresence mode="wait">
        {showRightPanel && (
          <motion.div
            key={showScorePanel ? 'score' : 'optimized'}
            layout
            initial={{ opacity: 0, flex: 0, paddingLeft: 0, minWidth: 0, width: 0 }}
            animate={{ opacity: 1, flex: 0.818, paddingLeft: 24, minWidth: 0, width: 'auto' }}
            exit={{ opacity: 0, flex: 0, paddingLeft: 0, minWidth: 0, width: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
            style={{ overflow: 'hidden', display: 'flex', height: 780, maxHeight: 780 }}
          >
            {/* Score panel */}
            {showScorePanel && (
              <div style={{ ...cardStyle, width: '100%', flex: 'none', height: '100%', overflowY: 'auto' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 8 }}>
                  Analysis
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: '0 0 20px', letterSpacing: -0.3 }}>
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
              <div style={{ ...cardStyle, width: '100%', flex: 'none', height: '100%', padding: '36px 8px 36px 36px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 24, height: 36, paddingRight: 28 }}>
                  <h2 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: isOptimizing ? 0.6 : 1 }}>
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
                            background: 'linear-gradient(135deg, rgba(124,58,237,0.10) 0%, rgba(168,85,247,0.07) 100%)',
                            border: '1px solid rgba(124,58,237,0.18)',
                            color: 'var(--color-primary)', cursor: 'default', flexShrink: 0,
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
                              border: '1px solid rgba(124,58,237,0.20)',
                              fontSize: '13px',
                              fontWeight: 600,
                              background: 'linear-gradient(160deg, rgba(255,255,255,1) 0%, rgba(248,245,255,1) 100%)',
                              color: 'var(--color-primary)',
                              cursor: 'pointer',
                              outline: 'none',
                              boxShadow: '0 2px 6px rgba(124,58,237,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
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
                                  background: 'linear-gradient(160deg, #FFFFFF 0%, #F8F5FF 100%)',
                                  border: '1px solid rgba(124,58,237,0.18)',
                                  boxShadow: '0 12px 28px rgba(91,33,182,0.18), 0 2px 8px rgba(0,0,0,0.07)',
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
                                        color: isActive ? '#FFFFFF' : 'var(--color-primary)',
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
                        // Regenerate starts a new normal enhancement. Once this
                        // prompt has a re-enhanced version, retain only the
                        // version-aware Re-enhance action.
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
                            // Re-enhance must never fall back to /enhance: it needs
                            // the persisted prompt id supplied by the page handler.
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
                            background: primary ? 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)' : '#F3F4F6',
                            border: primary ? 'none' : '1px solid rgba(0,0,0,0.07)',
                            color: primary ? 'white' : '#6B7280',
                            boxShadow: primary ? '0 4px 16px rgba(124,58,237,0.35)' : 'none',
                            opacity: disabled ? 0.7 : 1,
                          }}
                          className={disabled ? '' : (primary
                            ? 'hover:brightness-110 hover:translate-y-[-2px] hover:scale-[1.08] hover:shadow-[0_8px_24px_rgba(124,58,237,0.45)]'
                            : 'hover:!bg-[rgba(255,255,255,0.70)] hover:!text-[var(--color-primary)] hover:translate-y-[-2px] hover:scale-[1.05] hover:shadow-[0_6px_16px_rgba(124,58,237,0.10)]')}
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
                  {isOptimizing ? (
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
                        paddingRight: 28,
                        color: 'var(--color-text-primary)',
                        letterSpacing: '0.01em',
                      }}
                    >
                      <FormattedPromptViewer content={optimizationResult?.enhanced_prompt || ''} />
                    </div>
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(17,24,39,0.18)' }}>
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
