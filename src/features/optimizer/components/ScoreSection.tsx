'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Minus, TrendingUp, Sparkles } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

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

interface ScoreSectionProps {
  isAnalyzed: boolean;
  isOptimized: boolean;
  originalAnalysis?: any;
  enhancedAnalysis?: any;
  toolRecommendations?: any;
}

export default function ScoreSection({ isAnalyzed, isOptimized, originalAnalysis, enhancedAnalysis, toolRecommendations }: ScoreSectionProps) {
  const [ready, setReady] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    if (isAnalyzed || isOptimized) {
      const t = setTimeout(() => setReady(true), 80);
      return () => clearTimeout(t);
    } else { setReady(false); }
  }, [isAnalyzed, isOptimized]);

  const origScore = originalAnalysis?.overall_score ?? originalAnalysis?.score ?? 35;
  const enhScore = enhancedAnalysis?.overall_score ?? enhancedAnalysis?.score ?? Math.min(96, origScore + 25);
  const displayScore = isOptimized ? (enhScore ?? 90) : (origScore ?? 55);
  const animatedScore = useCountUp(displayScore, ready);

  if (!isAnalyzed && !isOptimized) return null;

  if (isOptimized && !enhancedAnalysis) {
    return (
      <div style={{ width: '100%', marginTop: 32, animation: 'fadeInRise 400ms ease-out forwards' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
          padding: '28px 36px', background: '#FFFFFF', border: '1px solid rgba(124,58,237,0.14)',
          borderRadius: 24, boxShadow: '0 4px 24px rgba(109,40,217,0.06)',
        }}>
          <Sparkles size={20} style={{ color: 'var(--color-primary)', animation: 'spin 2s linear infinite' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-secondary)', fontFamily: "'Geist', sans-serif" }}>
            Calculating deep quality scores & multi-dimensional analysis...
          </span>
        </div>
      </div>
    );
  }

  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const origDims = originalAnalysis?.dimensions || {};
  const enhDims = enhancedAnalysis?.dimensions || {};

  const getScore = (dims: any, key: string, altKey?: string, fallback: number = 0) => {
    if (!dims) return fallback;
    const item = dims[key] ?? (altKey ? dims[altKey] : undefined);
    if (item && typeof item.score === 'number' && !isNaN(item.score)) return item.score;
    if (typeof item === 'number' && !isNaN(item)) return item;
    return fallback;
  };

  const getExp = (dims: any, key: string, altKey?: string, defaultExp: string = '') => {
    if (!dims) return defaultExp;
    const item = dims[key] ?? (altKey ? dims[altKey] : undefined);
    if (item && typeof item.explanation === 'string' && item.explanation) return item.explanation;
    return defaultExp;
  };

  const dimensions = [
    {
      id: 'clarity', label: 'Clarity',
      scoreBefore: getScore(origDims, 'clarity', 'clarity', Math.max(40, origScore - 5)),
      scoreAfter: getScore(enhDims, 'clarity', 'clarity', Math.min(96, origScore + 22)),
      desc: isOptimized ? getExp(enhDims, 'clarity', 'clarity', 'Task objectives and instructions are clear and direct.') : getExp(origDims, 'clarity', 'clarity', 'Clear action verbs and unambiguous intent.'),
      icon: CheckCircle2
    },
    {
      id: 'context', label: 'Context',
      scoreBefore: getScore(origDims, 'context', 'context', Math.max(35, origScore - 10)),
      scoreAfter: getScore(enhDims, 'context', 'context', Math.min(94, origScore + 25)),
      desc: isOptimized ? getExp(enhDims, 'context', 'context', 'Comprehensive background and domain details provided.') : getExp(origDims, 'context', 'context', 'Provides domain background information.'),
      icon: CheckCircle2
    },
    {
      id: 'role', label: 'Role',
      scoreBefore: getScore(origDims, 'role_definition', 'role', Math.max(30, origScore - 15)),
      scoreAfter: getScore(enhDims, 'role_definition', 'role', Math.min(98, origScore + 30)),
      desc: isOptimized ? getExp(enhDims, 'role_definition', 'role', 'Explicit persona and domain expertise assigned.') : getExp(origDims, 'role_definition', 'role', 'Defines specific AI role or expert persona.'),
      icon: Minus
    },
    {
      id: 'format', label: 'Format',
      scoreBefore: getScore(origDims, 'output_format', 'format', Math.max(40, origScore - 5)),
      scoreAfter: getScore(enhDims, 'output_format', 'format', Math.min(95, origScore + 20)),
      desc: isOptimized ? getExp(enhDims, 'output_format', 'format', 'Structured layout, sections, and output format defined.') : getExp(origDims, 'output_format', 'format', 'Output structure and format specified.'),
      icon: CheckCircle2
    },
    {
      id: 'constraints', label: 'Constraints',
      scoreBefore: getScore(origDims, 'constraints', 'constraints', Math.max(35, origScore - 10)),
      scoreAfter: getScore(enhDims, 'constraints', 'constraints', Math.min(92, origScore + 18)),
      desc: isOptimized ? getExp(enhDims, 'constraints', 'constraints', 'Strict tone, word count, and scope limits included.') : getExp(origDims, 'constraints', 'constraints', 'Negative constraints and style limits.'),
      icon: AlertTriangle
    },
    {
      id: 'examples', label: 'Examples',
      scoreBefore: getScore(origDims, 'examples', 'examples', Math.max(25, origScore - 20)),
      scoreAfter: getScore(enhDims, 'examples', 'examples', Math.min(90, origScore + 24)),
      desc: isOptimized ? getExp(enhDims, 'examples', 'examples', 'Few-shot patterns and reference standards provided.') : getExp(origDims, 'examples', 'examples', 'Sample references and zero-shot guidance.'),
      icon: Minus
    },
  ].map(dim => {
    const activeVal = isOptimized ? dim.scoreAfter : dim.scoreBefore;
    const status = activeVal >= 80 ? 'good' : activeVal >= 55 ? 'warning' : 'neutral';
    return { ...dim, status };
  });

  const edgeColor = (status: string) => {
    if (status === 'good') return 'linear-gradient(180deg, var(--color-success), rgba(16,185,129,0.3))';
    if (status === 'warning') return 'linear-gradient(180deg, var(--color-primary), rgba(124,58,237,0.3))';
    return 'transparent';
  };

  const iconColor = (status: string) => {
    if (status === 'good') return 'var(--color-success)';
    if (status === 'warning') return 'var(--color-primary)';
    return 'var(--color-text-secondary)';
  };

  // Compile actionable suggestions from all dimensions dynamically
  const activeDims = isOptimized ? enhDims : origDims;
  const allSuggestions = Object.entries(activeDims).flatMap(([key, dimVal]: any) =>
    (dimVal.suggestions || []).map((s: string) => ({
      dimension: key === 'role_definition' ? 'role' : key === 'output_format' ? 'format' : key,
      text: s,
    }))
  );

  return (
    <div style={{ width: '100%', marginTop: 32, animation: 'fadeInRise 500ms ease-out forwards' }}>
      <div
        style={{
          display: 'flex', flexDirection: 'column', background: '#FFFFFF', border: '1px solid rgba(124,58,237,0.10)',
          borderRadius: isMobile ? 20 : 28, boxShadow: '0 4px 24px rgba(109,40,217,0.07), 0 1px 4px rgba(0,0,0,0.04)',
          padding: isMobile ? 20 : 32, position: 'relative', overflow: 'hidden',
          transition: 'transform 300ms ease-in-out, box-shadow 300ms ease-in-out',
        }}
        className="hover:translate-y-[-3px] hover:shadow-[0_12px_48px_rgba(109,40,217,0.10),0_4px_12px_rgba(0,0,0,0.05)]"
      >
        {/* Top score ring and 6 dimension cards — rendered only during Optimize mode */}
        {isOptimized && (
          <div style={{ display: 'flex', gap: isMobile ? 24 : 40, flexWrap: 'wrap', width: '100%', marginBottom: 8 }}>
            {/* Left: Ring */}
            <div style={{
              flex: isMobile ? '1 1 100%' : '0 0 200px', display: 'flex', flexDirection: 'column', alignItems: 'center',
              borderRight: isMobile ? 'none' : '1px solid rgba(0,0,0,0.07)', paddingRight: isMobile ? 0 : 40,
              borderBottom: isMobile ? '1px solid rgba(0,0,0,0.07)' : 'none', paddingBottom: isMobile ? 24 : 0,
            }}>
              <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 16 }}>
                <svg style={{ transform: 'rotate(-90deg)' }} width="120" height="120">
                  <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(124,58,237,0.10)" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r={radius} fill="none"
                    stroke="var(--color-primary)" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 1.5s ease-out', filter: 'drop-shadow(0 0 6px rgba(124,58,237,0.3))' }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 36, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: -1 }}>{animatedScore}</span>
                </div>
              </div>

              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-primary)', marginBottom: 24 }}>
                {scoreLabel(animatedScore)}
              </div>

              {enhScore > origScore && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700,
                  color: 'var(--color-success)', background: 'rgba(16,185,129,0.10)',
                  border: '1px solid rgba(16,185,129,0.22)', padding: '3px 10px', borderRadius: 9999, marginBottom: 16,
                }}>
                  <TrendingUp size={12} />
                  <span>+{enhScore - origScore} pts</span>
                </div>
              )}

              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Before</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>{origScore}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>After</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>{enhScore}</span>
                </div>
              </div>
            </div>

            {/* Right: Dimensions grid */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 16, alignContent: 'start', minWidth: isMobile ? 0 : 280 }}>
              {dimensions.map(dim => {
                const Icon = dim.icon;
                const displayed = dim.scoreAfter;
                return (
                  <div
                    key={dim.id}
                    style={{
                      background: 'rgba(124,58,237,0.03)', border: '1px solid rgba(124,58,237,0.09)',
                      borderRadius: 12, padding: 16, position: 'relative', overflow: 'hidden',
                      display: 'flex', flexDirection: 'column', gap: 8,
                      transition: 'transform 250ms ease, box-shadow 250ms ease, background 250ms ease',
                    }}
                    className="hover:translate-y-[-3px] hover:!bg-[rgba(124,58,237,0.05)] hover:shadow-[0_8px_24px_rgba(109,40,217,0.09)]"
                  >
                    {/* Colored edge bar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, borderRadius: '3px 0 0 3px', background: edgeColor(dim.status) }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon size={15} style={{ color: iconColor(dim.status), flexShrink: 0 }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)', flex: 1 }}>{dim.label}</span>
                      <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}>
                          <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>{dim.scoreBefore}</span>
                          <span style={{ color: 'var(--color-text-secondary)', fontSize: 10 }}>→</span>
                          <span style={{ fontWeight: 700, color: scoreColor(dim.scoreAfter) }}>{dim.scoreAfter}</span>
                        </span>
                      </div>
                    </div>

                    <div style={{ height: 3, background: 'rgba(124,58,237,0.08)', borderRadius: 99, overflow: 'hidden', margin: '2px 0 4px' }}>
                      <div style={{ height: '100%', borderRadius: 99, width: `${displayed}%`, background: scoreColor(displayed), transition: 'width 0.8s ease-out' }} />
                    </div>

                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={dim.desc || 'No details provided.'}>{dim.desc || 'No details provided.'}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recommended AI Tools */}
        {toolRecommendations && toolRecommendations.tools && toolRecommendations.tools.length > 0 && (
          <div style={{ marginTop: isOptimized ? 28 : 0, paddingTop: isOptimized ? 20 : 0, borderTop: isOptimized ? '1px solid rgba(0,0,0,0.07)' : 'none', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} style={{ color: '#7C3AED' }} />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, fontFamily: "'Geist', sans-serif" }}>
                  Recommended AI Tools for Best Execution
                </h3>
                {toolRecommendations.matched_task && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#6D28D9', background: 'rgba(124,58,237,0.08)', padding: '2px 8px', borderRadius: 9999 }}>
                    Task: {toolRecommendations.matched_task}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {toolRecommendations.tools.map((t: any) => (
                <div
                  key={t.name}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px',
                    background: t.rank === 1 ? 'linear-gradient(135deg, rgba(124,58,237,0.09) 0%, rgba(167,139,250,0.04) 100%)' : 'rgba(124,58,237,0.03)',
                    border: t.rank === 1 ? '1px solid rgba(124,58,237,0.22)' : '1px solid rgba(124,58,237,0.08)',
                    borderRadius: 14, flex: '1 1 180px', minWidth: 160,
                    boxShadow: t.rank === 1 ? '0 4px 14px rgba(124,58,237,0.08)' : 'none',
                  }}
                >
                  <span
                    style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: t.rank === 1 ? '#7C3AED' : t.rank === 2 ? '#9333EA' : '#C084FC',
                      color: '#FFFFFF', fontSize: 11, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}
                  >
                    #{t.rank}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>{t.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>
                      {t.rank === 1 ? 'Primary Recommendation' : `Alternative #${t.rank}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Actionable Recommendations */}
        {allSuggestions.length > 0 && (
          <div style={{ marginTop: (isOptimized || (toolRecommendations && toolRecommendations.tools && toolRecommendations.tools.length > 0)) ? 28 : 0, paddingTop: (isOptimized || (toolRecommendations && toolRecommendations.tools && toolRecommendations.tools.length > 0)) ? 20 : 0, borderTop: (isOptimized || (toolRecommendations && toolRecommendations.tools && toolRecommendations.tools.length > 0)) ? '1px solid rgba(0,0,0,0.07)' : 'none', width: '100%' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 16, fontFamily: "'Geist', sans-serif" }}>
              Actionable Recommendations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {allSuggestions.map((s: any, idx: number) => (
                <div key={idx} style={{
                  display: 'flex', gap: 12, padding: '12px 16px',
                  background: 'rgba(124,58,237,0.02)', border: '1px solid rgba(124,58,237,0.07)',
                  borderRadius: 12, fontSize: 13, color: 'var(--color-text-secondary)',
                  lineHeight: 1.5, alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    color: 'var(--color-primary)', background: 'rgba(124,58,237,0.08)',
                    padding: '2px 8px', borderRadius: 9999, flexShrink: 0
                  }}>
                    {s.dimension}
                  </span>
                  <span>{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
