import React from 'react';
import { Check, Rocket, Flame, Zap, PartyPopper, Sparkles } from 'lucide-react';
import { OnboardingStepConfig } from '../types';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface OnboardingProgressProps {
  steps: OnboardingStepConfig[];
  currentStepIndex: number;
  isDark: boolean;
  onSelectStep?: (index: number) => void;
  /** 'vertical' renders the desktop left-rail timeline; 'horizontal' the compact mobile bar. */
  orientation?: 'horizontal' | 'vertical';
}

const STEP_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties; strokeWidth?: number }>> = {
  profile: Rocket,
  role: Flame,
  focus: Zap,
  finish: PartyPopper,
};

const PROGRESS_PERCENTAGES = [25, 50, 75, 100];

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  steps,
  currentStepIndex,
  isDark,
  onSelectStep,
  orientation = 'horizontal',
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const totalSteps = steps.length;
  const progressPercent =
    PROGRESS_PERCENTAGES[currentStepIndex] ?? Math.round(((currentStepIndex + 1) / totalSteps) * 100);
  const currentStep = steps[currentStepIndex];
  const StepIcon = STEP_ICONS[currentStep?.id || ''] || Flame;

  // Shared header: "Your Progress" + step counter + orange percentage badge
  const header = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 8 }}>
        <span style={{ fontSize: isMobile ? 13.5 : 13.5, fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', letterSpacing: '-0.2px' }}>
          Your Progress
        </span>
        <span style={{
          fontSize: isMobile ? 11.5 : 11,
          fontWeight: 700,
          padding: isMobile ? '2px 7px' : '2px 8px',
          borderRadius: 99,
          background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#EEF2F6',
          color: isDark ? 'rgba(255, 255, 255, 0.70)' : '#64748B',
          whiteSpace: 'nowrap',
        }}>
          Step {currentStepIndex + 1} of {totalSteps}
        </span>
      </div>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: isMobile ? '2.5px 8px' : '3.5px 10px',
        borderRadius: 99,
        background: isDark ? 'rgba(249, 115, 22, 0.16)' : 'rgba(249, 115, 22, 0.10)',
        border: `1px solid ${isDark ? 'rgba(249, 115, 22, 0.35)' : 'rgba(234, 88, 12, 0.28)'}`,
        boxShadow: isDark ? '0 2px 8px rgba(249, 115, 22, 0.18)' : '0 1px 3px rgba(234, 88, 12, 0.08)',
        transition: 'all 200ms ease',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: isMobile ? 13 : 13, fontWeight: 800, color: isDark ? '#FB923C' : '#C2410C', letterSpacing: '-0.2px', lineHeight: 1 }}>
          {progressPercent}%
        </span>
        <StepIcon size={isMobile ? 13.5 : 13.5} strokeWidth={2.4} style={{ color: isDark ? '#FB923C' : '#C2410C', flexShrink: 0 }} />
      </div>
    </div>
  );

  // Motivational quote micro-cheer (shared)
  const quote = currentStep?.quote ? (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: isMobile ? '4px 8px' : '7px 11px',
      borderRadius: 10,
      background: isDark ? 'rgba(124, 58, 237, 0.12)' : 'rgba(99, 102, 241, 0.05)',
      border: `1px solid ${isDark ? 'rgba(124, 58, 237, 0.20)' : 'rgba(99, 102, 241, 0.10)'}`,
      fontSize: isMobile ? 10.5 : 11.5,
      color: isDark ? '#C4B5FD' : '#4F46E5',
      fontStyle: 'italic',
      boxSizing: 'border-box',
      width: '100%',
      lineHeight: 1.4,
    }}>
      <Sparkles size={isMobile ? 11 : 12.5} strokeWidth={2.2} style={{ color: isDark ? '#C4B5FD' : '#6366F1', flexShrink: 0 }} />
      <span style={orientation === 'vertical'
        ? undefined
        : { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        &ldquo;{currentStep.quote}&rdquo;
      </span>
    </div>
  ) : null;

  // ── Vertical timeline (desktop left rail) ───────────────────────────────
  if (orientation === 'vertical') {
    const circleSize = 30;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%', boxSizing: 'border-box' }}>
        {header}

        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {steps.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isLast = idx === totalSteps - 1;
            const isClickable = isDone && Boolean(onSelectStep);
            const RowIcon = STEP_ICONS[step.id] || Flame;

            return (
              <div
                key={step.id}
                onClick={() => { if (isClickable && onSelectStep) onSelectStep(idx); }}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (isClickable && onSelectStep && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onSelectStep(idx);
                  }
                }}
                title={isClickable ? `Jump to ${step.shortLabel}` : undefined}
                style={{
                  display: 'flex',
                  gap: 14,
                  cursor: isClickable ? 'pointer' : 'default',
                  boxSizing: 'border-box',
                }}
              >
                {/* Node + connector column */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  {isDone ? (
                    <div style={{
                      width: circleSize, height: circleSize, borderRadius: '50%',
                      background: isDark ? 'rgba(16, 185, 129, 0.22)' : '#E6F4EA',
                      color: '#10B981', border: '1.5px solid #10B981',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      transition: 'all 200ms ease',
                    }}>
                      <Check size={15} strokeWidth={3.5} />
                    </div>
                  ) : isCurrent ? (
                    <div style={{
                      width: circleSize, height: circleSize, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                      color: '#FFFFFF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.16), 0 4px 12px rgba(99, 102, 241, 0.4)',
                    }}>
                      <RowIcon size={15} strokeWidth={2.4} />
                    </div>
                  ) : (
                    <div style={{
                      width: circleSize, height: circleSize, borderRadius: '50%',
                      background: 'transparent',
                      color: isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8',
                      border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.18)' : '#CBD5E1'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>
                      {idx + 1}
                    </div>
                  )}

                  {/* Vertical connector */}
                  {!isLast && (
                    <div style={{
                      width: 2,
                      flex: 1,
                      minHeight: 26,
                      marginTop: 4,
                      marginBottom: 4,
                      borderRadius: 2,
                      background: isDone
                        ? 'linear-gradient(180deg, #10B981 0%, #6366F1 100%)'
                        : isDark ? 'rgba(255,255,255,0.12)' : '#E2E8F0',
                      transition: 'background 300ms ease',
                    }} />
                  )}
                </div>

                {/* Label column */}
                <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: isLast ? 0 : 16, paddingTop: 4, minWidth: 0 }}>
                  <span style={{
                    fontSize: 14,
                    fontWeight: isCurrent ? 800 : 700,
                    color: isCurrent
                      ? (isDark ? '#FFFFFF' : '#0F172A')
                      : isDone
                        ? (isDark ? 'rgba(255,255,255,0.85)' : '#334155')
                        : (isDark ? 'rgba(255,255,255,0.45)' : '#94A3B8'),
                    letterSpacing: '-0.2px',
                    transition: 'color 200ms ease',
                  }}>
                    {step.shortLabel}
                  </span>
                  <span style={{
                    fontSize: 11.5,
                    fontWeight: 500,
                    color: isCurrent
                      ? (isDark ? 'rgba(255,255,255,0.6)' : '#64748B')
                      : (isDark ? 'rgba(255,255,255,0.35)' : '#A8B2C1'),
                    marginTop: 2,
                    lineHeight: 1.35,
                    transition: 'color 200ms ease',
                  }}>
                    {step.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {quote}
      </div>
    );
  }

  // ── Horizontal compact bar (mobile / tablet top) ────────────────────────
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? 9 : 12,
      width: '100%',
      boxSizing: 'border-box',
      padding: isMobile ? '11px 13px' : '12px 18px',
      borderRadius: isMobile ? 14 : 16,
      background: isDark ? 'rgba(99, 102, 241, 0.08)' : '#F8FAFC',
      border: `1px solid ${isDark ? 'rgba(124, 58, 237, 0.22)' : '#E2E8F0'}`,
      boxShadow: isDark
        ? '0 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.04)'
        : '0 2px 10px rgba(99, 102, 241, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
      transition: 'all 200ms ease',
    }}>
      {header}

      {/* Progress bar */}
      <div style={{
        height: isMobile ? 7 : 6,
        width: '100%',
        borderRadius: 99,
        background: isDark ? 'rgba(255, 255, 255, 0.10)' : '#E2E8F0',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
      }}>
        <div style={{
          height: '100%',
          width: `${progressPercent}%`,
          background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 55%, #A855F7 100%)',
          borderRadius: 99,
          boxShadow: '0 0 10px rgba(99, 102, 241, 0.45)',
          transition: 'width 350ms cubic-bezier(0.16, 1, 0.3, 1)',
        }} />
      </div>

      {/* Step nodes */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        gap: isMobile ? 2 : isTablet ? 4 : 6,
        boxSizing: 'border-box',
      }}>
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isClickable = isDone && Boolean(onSelectStep);
          const circleSize = isMobile ? 22 : 22;

          return (
            <div
              key={step.id}
              onClick={() => { if (isClickable && onSelectStep) onSelectStep(idx); }}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              title={isClickable ? `Jump to ${step.shortLabel}` : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 3 : isTablet ? 4 : 6,
                boxSizing: 'border-box',
                flexShrink: 0,
                cursor: isClickable ? 'pointer' : 'default',
                transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className={isClickable ? 'hover:scale-[1.05] active:scale-[0.96]' : undefined}
            >
              {isDone ? (
                <div style={{
                  width: circleSize, height: circleSize, borderRadius: '50%',
                  background: isDark ? 'rgba(16, 185, 129, 0.25)' : '#E6F4EA',
                  color: '#10B981', border: '1.5px solid #10B981',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isMobile ? 11 : 11, fontWeight: 800, flexShrink: 0,
                  transition: 'all 180ms ease',
                }}>
                  <Check size={isMobile ? 11 : 12} strokeWidth={3.5} />
                </div>
              ) : isCurrent ? (
                <div style={{
                  width: circleSize, height: circleSize, borderRadius: '50%',
                  background: '#6366F1', color: '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isMobile ? 11 : 11, fontWeight: 800, flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
                }}>
                  {idx + 1}
                </div>
              ) : (
                <div style={{
                  width: circleSize, height: circleSize, borderRadius: '50%',
                  background: 'transparent',
                  color: isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8',
                  border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isMobile ? 11 : 11, fontWeight: 700, flexShrink: 0,
                }}>
                  {idx + 1}
                </div>
              )}

              {!isMobile ? (
                <span style={{
                  fontSize: isTablet ? 11 : 12,
                  fontWeight: isCurrent || isDone ? 700 : 500,
                  color: isCurrent || isDone ? (isDark ? '#FFFFFF' : '#0F172A') : (isDark ? 'rgba(255,255,255,0.45)' : '#94A3B8'),
                  transition: 'color 180ms ease',
                  whiteSpace: 'nowrap',
                }}>
                  {step.shortLabel}
                </span>
              ) : isCurrent ? (
                <span style={{ fontSize: 12, fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A', whiteSpace: 'nowrap' }}>
                  {step.shortLabel}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {quote}
    </div>
  );
};
