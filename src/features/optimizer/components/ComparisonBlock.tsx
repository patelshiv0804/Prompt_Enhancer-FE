'use client';

import React, { useState, useEffect } from 'react';
import {
  Copy, RefreshCw, Bookmark, ArrowRightToLine,
  Sparkles, Code, Search, Megaphone, BookOpen, Image as ImageIcon,
  Film, PlaySquare, TrendingUp, Wand2,
  CheckCircle2, AlertTriangle, Minus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FormattedPromptViewer from './FormattedPromptViewer';

const MODES = [
  { name: 'General', icon: Sparkles },
  { name: 'Coding', icon: Code },
  { name: 'Research', icon: Search },
  { name: 'Marketing', icon: Megaphone },
  { name: 'Storytelling', icon: BookOpen },
  { name: 'Image Gen', icon: ImageIcon },
  { name: 'Cinematic Video', icon: Film },
  { name: 'YouTube Shorts', icon: PlaySquare },
  { name: 'SEO', icon: TrendingUp },
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
  border: '1px solid rgba(124,58,237,0.10)', borderRadius: 28, padding: 40,
  boxShadow: '0 4px 24px rgba(109,40,217,0.07), 0 1px 4px rgba(0,0,0,0.04)',
  minHeight: 400, transition: 'transform 300ms ease-in-out, box-shadow 300ms ease-in-out',
};

interface ComparisonBlockProps {
  isAnalyzing: boolean;
  isAnalyzed: boolean;
  isOptimizing: boolean;
  isOptimized: boolean;
  onAnalyze: (promptText: string) => void;
  onOptimize: (promptText: string, activeMode: string) => void;
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
  isAnalyzing, isAnalyzed, isOptimizing, isOptimized, onAnalyze, onOptimize,
  analysisResult, optimizationResult, versions = [], activeVersionNumber = null, onRestoreVersion,
  initialOriginalPromptText = '',
}: ComparisonBlockProps) {
  const [originalText, setOriginalText] = useState(
    'write a cinematic short about an astronaut who discovers a garden on mars. make it emotional.'
  );
  const [activeTab, setActiveTab] = useState('Optimized');
  const [activeMode, setActiveMode] = useState('General');
  const [scoreReady, setScoreReady] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (initialOriginalPromptText) {
      setOriginalText(initialOriginalPromptText);
    }
  }, [initialOriginalPromptText]);

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
        style={cardStyle} layout
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
            flex: 1, border: '1px solid rgba(124,58,237,0.10)', borderRadius: 18,
            background: '#FDFCFF', padding: 24, display: 'flex', flexDirection: 'column',
            minHeight: 200, boxShadow: 'inset 0 1px 3px rgba(109,40,217,0.03)', transition: 'all 300ms ease-in-out',
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              {originalText.split(' ').filter(Boolean).length} words &middot; {originalText.length} chars
            </span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Mode</div>
          <div style={{ paddingBottom: 4 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {MODES.map(mode => {
                const Icon = mode.icon;
                const active = activeMode === mode.name;
                return (
                  <button
                    key={mode.name}
                    onClick={() => setActiveMode(mode.name)}
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
                    {mode.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button
              id="analyze-btn"
              onClick={() => onAnalyze(originalText)}
              disabled={isAnalyzing || isOptimizing}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 32px',
                borderRadius: 11, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)', color: 'white',
                boxShadow: '0 4px 16px rgba(124,58,237,0.30)',
                opacity: (isAnalyzing || isOptimizing) ? 0.75 : 1,
                transition: 'all 220ms ease',
              }}
              className={!(isAnalyzing || isOptimizing) ? 'hover:translate-y-[-1px] hover:shadow-[0_8px_24px_rgba(124,58,237,0.40)] hover:brightness-105' : ''}
            >
              <Sparkles size={13} style={{ animation: 'pulseGlow 2s infinite' }} />
              <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
            </button>
            <button
              id="optimize-btn"
              onClick={() => onOptimize(originalText, activeMode)}
              disabled={isOptimizing || isAnalyzing}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 32px',
                borderRadius: 11, fontSize: 14, fontWeight: 600,
                cursor: (isOptimizing || isAnalyzing) ? 'not-allowed' : 'pointer',
                background: (!isOptimizing && !isAnalyzing)
                  ? 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)'
                  : 'rgba(124,58,237,0.06)',
                color: (!isOptimizing && !isAnalyzing) ? 'white' : 'rgba(107,107,138,0.50)',
                border: (!isOptimizing && !isAnalyzing) ? 'none' : '1px solid rgba(124,58,237,0.10)',
                boxShadow: (!isOptimizing && !isAnalyzing) ? '0 4px 16px rgba(109,40,217,0.30)' : 'none',
                opacity: isOptimizing ? 0.75 : 1,
                transition: 'all 220ms ease',
              }}
              className={(!isOptimizing && !isAnalyzing) ? 'hover:translate-y-[-1px] hover:shadow-[0_8px_24px_rgba(109,40,217,0.42)] hover:brightness-105' : ''}
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
            style={{ overflow: 'hidden', display: 'flex' }}
          >
            {/* Score panel */}
            {showScorePanel && (
              <div style={{ ...cardStyle, width: '100%', flex: 'none', overflowY: 'auto' }}>
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
              <div style={{ ...cardStyle, width: '100%', flex: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, height: 36 }}>
                  {(isOptimized || isOptimizing) ? (
                    <div style={{
                      display: 'flex', position: 'relative',
                      background: 'linear-gradient(160deg, rgba(109,40,217,0.09) 0%, rgba(124,58,237,0.04) 100%)',
                      border: '1px solid rgba(124,58,237,0.13)', borderRadius: 9999, padding: 4,
                      boxShadow: 'inset 0 2px 5px rgba(80,20,180,0.13), inset 0 1px 2px rgba(0,0,0,0.07), 0 1px 0 rgba(255,255,255,0.80)',
                      opacity: isOptimizing ? 0.6 : 1, pointerEvents: isOptimizing ? 'none' : 'auto',
                    }}>
                      {['Optimized', 'Diff View'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{
                          padding: '4px 16px', fontSize: 13, fontWeight: tab === activeTab ? 600 : 500,
                          color: tab === activeTab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                          position: 'relative', zIndex: 2, transition: 'color 250ms ease',
                          background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 9999,
                        }}>{tab}</button>
                      ))}
                      <div style={{
                        position: 'absolute', top: 4, left: 4, bottom: 4, width: 'calc(50% - 4px)',
                        background: '#FFFFFF', borderRadius: 9999, zIndex: 1,
                        transform: activeTab === 'Optimized' ? 'translateX(0)' : 'translateX(100%)',
                        transition: 'transform 300ms cubic-bezier(0.4,0,0.2,1)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.95), 0 3px 8px rgba(80,20,180,0.12), 0 1px 3px rgba(0,0,0,0.10), 0 0 0 1px rgba(124,58,237,0.07)',
                      }} />
                    </div>
                  ) : (
                    <h2 style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Optimized Prompt
                    </h2>
                  )}

                  {(isOptimized || isOptimizing) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: isOptimizing ? 0.6 : 1, pointerEvents: isOptimizing ? 'none' : 'auto' }}>
                      {/* Version selector dropdown */}
                      {versions && versions.length > 1 && (
                        <div style={{ position: 'relative', marginRight: 4 }}>
                          <select
                            value={activeVersionNumber || undefined}
                            onChange={(e) => onRestoreVersion?.(Number(e.target.value))}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1px solid rgba(124,58,237,0.15)',
                              fontSize: '13px',
                              fontWeight: 600,
                              background: '#FFFFFF',
                              color: 'var(--color-primary)',
                              cursor: 'pointer',
                              outline: 'none',
                              boxShadow: '0 2px 5px rgba(124,58,237,0.08)',
                            }}
                          >
                            {versions.map((v: any) => (
                              <option key={v.id} value={v.version_number}>
                                v{v.version_number} - {v.version_type || 'Enhanced'}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {[
                        { icon: Copy, title: 'Copy', primary: false, onClick: handleCopy },
                        { icon: RefreshCw, title: 'Regenerate', primary: false, onClick: () => onOptimize(originalText, activeMode) },
                        { icon: Bookmark, title: 'Save to Vault', primary: true, onClick: () => {} },
                      ].map(({ icon: Icon, title, primary, onClick }) => (
                        <button key={title} title={copySuccess && title === 'Copy' ? 'Copied!' : title} onClick={onClick} style={{
                          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: '50%', cursor: 'pointer', transition: 'all 250ms ease',
                          background: primary ? 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)' : '#F3F4F6',
                          border: primary ? 'none' : '1px solid rgba(0,0,0,0.07)',
                          color: primary ? 'white' : '#6B7280',
                          boxShadow: primary ? '0 4px 16px rgba(124,58,237,0.35)' : 'none',
                        }}
                          className={primary
                            ? 'hover:brightness-110 hover:translate-y-[-2px] hover:scale-[1.08] hover:shadow-[0_8px_24px_rgba(124,58,237,0.45)]'
                            : 'hover:!bg-[rgba(255,255,255,0.70)] hover:!text-[var(--color-primary)] hover:translate-y-[-2px] hover:scale-[1.05] hover:shadow-[0_6px_16px_rgba(124,58,237,0.10)]'}
                        >
                          {copySuccess && title === 'Copy' ? (
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-success)' }}>✓</span>
                          ) : (
                            <Icon size={16} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
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
                    <div style={{ fontSize: 14, lineHeight: 1.6, animation: 'fadeInRise 400ms ease-out forwards', overflowY: 'auto', paddingRight: 16, color: 'var(--color-text-primary)', letterSpacing: '0.01em' }}>
                      {activeTab === 'Optimized' ? (
                        <FormattedPromptViewer content={optimizationResult?.enhanced_prompt || ''} />
                      ) : (
                        <div>
                          <div style={{ background: 'var(--color-diff-remove)', color: 'var(--color-diff-remove-text)', textDecoration: 'line-through', padding: '10px 14px', borderRadius: 10, marginBottom: 16 }}>
                            {optimizationResult?.original_prompt}
                          </div>
                          <div style={{ background: 'var(--color-diff-add)', padding: '10px 14px', borderRadius: 10 }}>
                            <FormattedPromptViewer content={optimizationResult?.enhanced_prompt || ''} />
                          </div>
                        </div>
                      )}
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
