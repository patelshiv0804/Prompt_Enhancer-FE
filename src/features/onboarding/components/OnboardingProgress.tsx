import React from 'react';
import { Check, Rocket, Flame, Zap, Star, Trophy, PartyPopper, Sparkles } from 'lucide-react';
import { OnboardingStepConfig } from '../types';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface OnboardingProgressProps {
  steps: OnboardingStepConfig[];
  currentStepIndex: number;
  isDark: boolean;
  onSelectStep?: (index: number) => void;
}

const STEP_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties; strokeWidth?: number }>> = {
  display_name: Rocket,
  role: Flame,
  mode: Zap,
  avatar: Star,
  theme: Trophy,
  complete: PartyPopper,
};

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  steps,
  currentStepIndex,
  isDark,
  onSelectStep,
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const totalSteps = steps.length;
  const progressPercentages = [17, 33, 50, 67, 83, 100];
  const progressPercent = progressPercentages[currentStepIndex] || Math.round(((currentStepIndex + 1) / totalSteps) * 100);
  const currentStep = steps[currentStepIndex];
  const StepIcon = STEP_ICONS[currentStep?.id || ''] || Flame;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? 9 : 12,
      width: '100%',
      boxSizing: 'border-box',
      padding: isMobile ? '10px 12px' : '12px 18px',
      borderRadius: 16,
      background: isDark ? 'rgba(99, 102, 241, 0.08)' : '#F8FAFC',
      border: `1px solid ${isDark ? 'rgba(124, 58, 237, 0.22)' : '#E2E8F0'}`,
      boxShadow: isDark
        ? '0 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.04)'
        : '0 2px 10px rgba(99, 102, 241, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
      transition: 'all 200ms ease',
    }}>
      {/* Top Bar: "Your Progress" & "XX% [Icon]" */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 8 }}>
          <span style={{ fontSize: isMobile ? 12.5 : 13.5, fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', letterSpacing: '-0.2px' }}>
            Your Progress
          </span>
          <span style={{
            fontSize: isMobile ? 10.5 : 11.5,
            fontWeight: 700,
            padding: isMobile ? '1.5px 6px' : '2px 8px',
            borderRadius: 99,
            background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#EEF2F6',
            color: isDark ? 'rgba(255, 255, 255, 0.70)' : '#64748B',
          }}>
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
        </div>

        {/* Motivational Percentage Badge with crisp Lucide Vector Icon & refined light/dark theme colors */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: isMobile ? '2.5px 8px' : '3.5px 10px',
          borderRadius: 99,
          background: isDark
            ? 'rgba(249, 115, 22, 0.16)'
            : 'rgba(249, 115, 22, 0.10)',
          border: `1px solid ${isDark ? 'rgba(249, 115, 22, 0.35)' : 'rgba(234, 88, 12, 0.28)'}`,
          boxShadow: isDark
            ? '0 2px 8px rgba(249, 115, 22, 0.18)'
            : '0 1px 3px rgba(234, 88, 12, 0.08)',
          transition: 'all 200ms ease',
        }}>
          <span style={{
            fontSize: isMobile ? 12 : 13,
            fontWeight: 800,
            color: isDark ? '#FB923C' : '#C2410C',
            letterSpacing: '-0.2px',
            lineHeight: 1,
          }}>
            {progressPercent}%
          </span>
          <StepIcon
            size={isMobile ? 12 : 13.5}
            strokeWidth={2.4}
            style={{
              color: isDark ? '#FB923C' : '#C2410C',
              flexShrink: 0,
            }}
          />
        </div>
      </div>

      {/* Progress Bar Line with Gradient Fill and subtle shine */}
      <div style={{
        height: isMobile ? 5 : 6,
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

      {/* Timeline Step Nodes with interactive jump-to-step support */}
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
          const circleSize = isMobile ? 18 : 22;

          return (
            <div
              key={step.id}
              onClick={() => {
                if (isClickable && onSelectStep) {
                  onSelectStep(idx);
                }
              }}
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
              {/* Step Icon/Badge Circle */}
              {isDone ? (
                <div style={{
                  width: circleSize, height: circleSize, borderRadius: '50%',
                  background: isDark ? 'rgba(16, 185, 129, 0.25)' : '#E6F4EA',
                  color: '#10B981', border: '1.5px solid #10B981',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isMobile ? 9 : 11, fontWeight: 800, flexShrink: 0,
                  transition: 'all 180ms ease',
                }}>
                  <Check size={isMobile ? 9 : 12} strokeWidth={3.5} />
                </div>
              ) : isCurrent ? (
                <div style={{
                  width: circleSize, height: circleSize, borderRadius: '50%',
                  background: '#6366F1', color: '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isMobile ? 9.5 : 11, fontWeight: 800, flexShrink: 0,
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
                  fontSize: isMobile ? 9.5 : 11, fontWeight: 700, flexShrink: 0,
                }}>
                  {idx + 1}
                </div>
              )}

              {/* Step Label */}
              {!isMobile ? (
                <span style={{
                  fontSize: isTablet ? 11 : 12,
                  fontWeight: isCurrent || isDone ? 700 : 500,
                  color: isCurrent || isDone
                    ? (isDark ? '#FFFFFF' : '#0F172A')
                    : (isDark ? 'rgba(255,255,255,0.45)' : '#94A3B8'),
                  transition: 'color 180ms ease',
                  whiteSpace: 'nowrap',
                }}>
                  {step.shortLabel}
                </span>
              ) : isCurrent ? (
                <span style={{
                  fontSize: 10.5, fontWeight: 700,
                  color: isDark ? '#FFFFFF' : '#0F172A',
                  whiteSpace: 'nowrap',
                }}>
                  {step.shortLabel}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Motivational Quote Micro-Cheer at bottom of progress card */}
      {currentStep?.quote && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: isMobile ? '4px 8px' : '5px 10px',
          borderRadius: 8,
          background: isDark ? 'rgba(124, 58, 237, 0.12)' : 'rgba(99, 102, 241, 0.05)',
          border: `1px solid ${isDark ? 'rgba(124, 58, 237, 0.20)' : 'rgba(99, 102, 241, 0.10)'}`,
          fontSize: isMobile ? 10.5 : 11.5,
          color: isDark ? '#C4B5FD' : '#4F46E5',
          fontStyle: 'italic',
          boxSizing: 'border-box',
          width: '100%',
        }}>
          <Sparkles
            size={isMobile ? 11 : 12.5}
            strokeWidth={2.2}
            style={{ color: isDark ? '#C4B5FD' : '#6366F1', flexShrink: 0 }}
          />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            &ldquo;{currentStep.quote}&rdquo;
          </span>
        </div>
      )}
    </div>
  );
};
