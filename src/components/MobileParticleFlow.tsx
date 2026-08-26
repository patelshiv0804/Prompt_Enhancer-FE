"use client";

import React from "react";

/* ─────────────────────────────────────────────
 * MobileParticleFlow — Responsive Bezier Particle Flows
 * for Mobile and Tablet viewports (< 1024px).
 *
 * Renders the same elegant converging & fanning dashed
 * curves and glowing traveling particle beads as seen on
 * the desktop visualization.
 * ───────────────────────────────────────────── */

export function MobileTopFlow() {
  const topPaths = [
    { id: "mt1", d: "M 45 0 C 45 35, 155 45, 180 85", color: "#A855F7", dur: "3.6s", delay: "0s" },
    { id: "mt2", d: "M 110 0 C 110 35, 168 45, 180 85", color: "#EC4899", dur: "3.0s", delay: "0.4s" },
    { id: "mt3", d: "M 180 0 L 180 85", color: "#C026D3", dur: "2.6s", delay: "0.2s" },
    { id: "mt4", d: "M 250 0 C 250 35, 192 45, 180 85", color: "#60A5FA", dur: "3.0s", delay: "0.6s" },
    { id: "mt5", d: "M 315 0 C 315 35, 205 45, 180 85", color: "#A855F7", dur: "3.6s", delay: "0.8s" },
  ];

  return (
    <div className="relative w-full max-w-[440px] sm:max-w-[500px] h-[75px] sm:h-[90px] mx-auto pointer-events-none select-none my-[-6px]">
      <svg
        viewBox="0 0 360 85"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="topGlowGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A855F7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {topPaths.map((p) => (
          <g key={p.id}>
            {/* Soft guide line */}
            <path
              d={p.d}
              stroke={p.color}
              strokeWidth="1"
              strokeDasharray="3 4"
              strokeOpacity="0.30"
            />
            {/* Animated glowing particle cluster traveling top -> engine */}
            <g>
              {/* Outer halo */}
              <circle r="6" fill={p.color} opacity="0.25">
                <animateMotion
                  path={p.d}
                  dur={p.dur}
                  begin={p.delay}
                  repeatCount="indefinite"
                  keyPoints="0;1"
                  keyTimes="0;1"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1"
                />
              </circle>
              {/* Core particle */}
              <circle r="2.5" fill={p.color} opacity="0.95">
                <animateMotion
                  path={p.d}
                  dur={p.dur}
                  begin={p.delay}
                  repeatCount="indefinite"
                  keyPoints="0;1"
                  keyTimes="0;1"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1"
                />
              </circle>
              {/* Bright center */}
              <circle r="1" fill="#FFFFFF" opacity="0.9">
                <animateMotion
                  path={p.d}
                  dur={p.dur}
                  begin={p.delay}
                  repeatCount="indefinite"
                  keyPoints="0;1"
                  keyTimes="0;1"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1"
                />
              </circle>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function MobileBottomFlow() {
  const bottomPaths = [
    { id: "mb1", d: "M 180 0 C 150 35, 36 45, 36 90", color: "#A855F7", dur: "3.8s", delay: "0s" },
    { id: "mb2", d: "M 180 0 C 160 35, 84 45, 84 90", color: "#EC4899", dur: "3.4s", delay: "0.3s" },
    { id: "mb3", d: "M 180 0 C 170 35, 132 45, 132 90", color: "#60A5FA", dur: "3.0s", delay: "0.5s" },
    { id: "mb4", d: "M 180 0 C 175 35, 160 45, 160 90", color: "#A855F7", dur: "2.8s", delay: "0.2s" },
    { id: "mb5", d: "M 180 0 C 185 35, 200 45, 200 90", color: "#60A5FA", dur: "2.8s", delay: "0.4s" },
    { id: "mb6", d: "M 180 0 C 190 35, 228 45, 228 90", color: "#EC4899", dur: "3.0s", delay: "0.6s" },
    { id: "mb7", d: "M 180 0 C 200 35, 276 45, 276 90", color: "#A855F7", dur: "3.4s", delay: "0.8s" },
    { id: "mb8", d: "M 180 0 C 210 35, 324 45, 324 90", color: "#60A5FA", dur: "3.8s", delay: "1.0s" },
  ];

  return (
    <div className="relative w-full max-w-[480px] sm:max-w-[580px] h-[80px] sm:h-[95px] mx-auto pointer-events-none select-none my-[-6px]">
      <svg
        viewBox="0 0 360 90"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {bottomPaths.map((p) => (
          <g key={p.id}>
            {/* Soft guide line */}
            <path
              d={p.d}
              stroke={p.color}
              strokeWidth="1"
              strokeDasharray="3 4"
              strokeOpacity="0.30"
            />
            {/* Animated glowing particle cluster traveling engine -> models */}
            <g>
              {/* Outer halo */}
              <circle r="6" fill={p.color} opacity="0.25">
                <animateMotion
                  path={p.d}
                  dur={p.dur}
                  begin={p.delay}
                  repeatCount="indefinite"
                  keyPoints="0;1"
                  keyTimes="0;1"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1"
                />
              </circle>
              {/* Core particle */}
              <circle r="2.5" fill={p.color} opacity="0.95">
                <animateMotion
                  path={p.d}
                  dur={p.dur}
                  begin={p.delay}
                  repeatCount="indefinite"
                  keyPoints="0;1"
                  keyTimes="0;1"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1"
                />
              </circle>
              {/* Bright center */}
              <circle r="1" fill="#FFFFFF" opacity="0.9">
                <animateMotion
                  path={p.d}
                  dur={p.dur}
                  begin={p.delay}
                  repeatCount="indefinite"
                  keyPoints="0;1"
                  keyTimes="0;1"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1"
                />
              </circle>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
