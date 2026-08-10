import React from 'react';
import { Check } from 'lucide-react';
import { OnboardingStepConfig } from '../types';

interface OnboardingProgressProps {
  steps: OnboardingStepConfig[];
  currentStepIndex: number;
  isDark: boolean;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  steps,
  currentStepIndex,
  isDark,
}) => {
  const totalSteps = steps.length;
  const progressPercentages = [17, 33, 50, 67, 83, 100];
  const progressPercent = progressPercentages[currentStepIndex] || Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', boxSizing: 'border-box' }}>
      {/* Top Bar: Step X of 6 & XX% Complete */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxSizing: 'border-box' }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A' }}>
          Step {currentStepIndex + 1} of {totalSteps}
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#6366F1' }}>
          {progressPercent}% Complete
        </span>
      </div>

      {/* Progress Bar Line */}
      <div style={{
        height: 5, width: '100%', borderRadius: 99,
        background: isDark ? 'rgba(255,255,255,0.10)' : '#E2E8F0',
        overflow: 'hidden', position: 'relative', boxSizing: 'border-box',
      }}>
        <div style={{
          height: '100%', width: `${progressPercent}%`,
          background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
          borderRadius: 99, transition: 'width 300ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }} />
      </div>

      {/* Timeline Steps */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', gap: 4, paddingTop: 2, flexWrap: 'wrap', boxSizing: 'border-box',
      }}>
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 6, boxSizing: 'border-box' }}>
              {/* Step Icon/Badge Circle */}
              {isDone ? (
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: isDark ? 'rgba(16, 185, 129, 0.25)' : '#E6F4EA',
                  color: '#10B981', border: '1.5px solid #10B981',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, flexShrink: 0,
                }}>
                  <Check size={12} strokeWidth={3.5} />
                </div>
              ) : isCurrent ? (
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: '#6366F1', color: '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
                }}>
                  {idx + 1}
                </div>
              ) : (
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'transparent',
                  color: isDark ? 'rgba(255,255,255,0.4)' : '#94A3B8',
                  border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>
                  {idx + 1}
                </div>
              )}

              {/* Label */}
              <span style={{
                fontSize: 12.5, fontWeight: isCurrent || isDone ? 700 : 500,
                color: isCurrent || isDone
                  ? (isDark ? '#FFFFFF' : '#0F172A')
                  : (isDark ? 'rgba(255,255,255,0.45)' : '#94A3B8'),
                transition: 'color 180ms ease',
              }}>
                {step.shortLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
