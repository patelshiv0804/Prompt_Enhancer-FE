import React from 'react';

interface ScoreSpinnerProps {
  size?: number;
  color?: string;
}

/**
 * Circular loading spinner shown on a prompt's score while its quality analysis
 * is still being computed in the background (score not yet persisted to the DB).
 *
 * Rotation is driven by native SVG SMIL (<animateTransform>) rather than a CSS
 * keyframe. This keeps it independent of the global stylesheet / Tailwind
 * animation pipeline, so it spins reliably wherever it's rendered.
 */
export default function ScoreSpinner({ size = 16, color = '#7C3AED' }: ScoreSpinnerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      role="status"
      aria-label="Calculating score"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Faint full-circle track */}
      <circle cx="25" cy="25" r="20" fill="none" stroke={color} strokeOpacity="0.2" strokeWidth="5" />
      {/* Rotating arc */}
      <path fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" d="M25 5 a20 20 0 0 1 0 40">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
