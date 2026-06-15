"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";

/* ─────────────────────────────────────────────
 * Animated particle flow — the visual centerpiece.
 *
 * Architecture:
 *   • SVG paths define flow routes (top→engine, engine→bottom)
 *   • Each path has animated dashed strokes via strokeDashoffset
 *   • Multiple glowing particles (circles) travel along each path
 *   • SVG filters create blur/glow effects
 *   • Uses a single hidden <path> ref per route for getPointAtLength
 * ───────────────────────────────────────────── */

interface ParticlePathConfig {
  id: string;
  d: string;
  color: string;
  duration: number;
  delay: number;
  particleCount: number;
}

const PATHS: ParticlePathConfig[] = [
  // ─── Top card → AI Engine ───
  // Left curve
  {
    id: "path-top-left",
    d: "M 210 60 C 200 110, 140 130, 145 185 C 148 220, 195 260, 230 285",
    color: "#A855F7",
    duration: 4,
    delay: 0,
    particleCount: 3,
  },
  // Center
  {
    id: "path-top-center",
    d: "M 230 60 C 230 120, 228 200, 230 285",
    color: "#EC4899",
    duration: 3.5,
    delay: 0.5,
    particleCount: 3,
  },
  // Right curve
  {
    id: "path-top-right",
    d: "M 250 60 C 260 110, 320 130, 315 185 C 312 220, 265 260, 230 285",
    color: "#60A5FA",
    duration: 4.5,
    delay: 0.3,
    particleCount: 3,
  },

  // ─── AI Engine → Bottom card (fan out wider) ───
  // Far left
  {
    id: "path-bottom-far-left",
    d: "M 230 330 C 220 360, 100 380, 70 430 C 50 470, 65 500, 85 520",
    color: "#A855F7",
    duration: 4.5,
    delay: 0,
    particleCount: 2,
  },
  // Left
  {
    id: "path-bottom-left",
    d: "M 230 330 C 220 360, 140 390, 130 430 C 122 465, 135 495, 150 520",
    color: "#60A5FA",
    duration: 4,
    delay: 0.3,
    particleCount: 3,
  },
  // Center-left
  {
    id: "path-bottom-center-left",
    d: "M 230 330 C 225 370, 195 420, 195 520",
    color: "#EC4899",
    duration: 3.5,
    delay: 0.6,
    particleCount: 2,
  },
  // Center-right
  {
    id: "path-bottom-center-right",
    d: "M 230 330 C 235 370, 265 420, 265 520",
    color: "#A855F7",
    duration: 3.5,
    delay: 0.8,
    particleCount: 2,
  },
  // Right
  {
    id: "path-bottom-right",
    d: "M 230 330 C 240 360, 320 390, 330 430 C 338 465, 325 495, 310 520",
    color: "#EC4899",
    duration: 4.2,
    delay: 0.4,
    particleCount: 3,
  },
  // Far right
  {
    id: "path-bottom-far-right",
    d: "M 230 330 C 240 360, 360 380, 390 430 C 410 470, 395 500, 375 520",
    color: "#60A5FA",
    duration: 4.5,
    delay: 0.2,
    particleCount: 2,
  },
];

export default function AnimatedParticleFlow() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[600px] w-[460px]" />;

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <svg
        viewBox="0 0 460 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* ── SVG Filters for glow ── */}
        <defs>
          <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-pink" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="particle-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient definitions for paths */}
          <linearGradient id="grad-purple" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="grad-pink" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EC4899" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="grad-blue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* ── Render each animated path + particles ── */}
        {PATHS.map((path) => (
          <AnimatedPath key={path.id} config={path} />
        ))}
      </svg>
    </div>
  );
}

/* ── Single animated path with flowing particles ── */

function AnimatedPath({ config }: { config: ParticlePathConfig }) {
  const { d, color, duration, delay, particleCount } = config;

  const glowFilter =
    color === "#A855F7"
      ? "url(#glow-purple)"
      : color === "#EC4899"
      ? "url(#glow-pink)"
      : "url(#glow-blue)";

  const gradId =
    color === "#A855F7"
      ? "url(#grad-purple)"
      : color === "#EC4899"
      ? "url(#grad-pink)"
      : "url(#grad-blue)";

  return (
    <g>
      {/* Base path — faint static line */}
      <path
        d={d}
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.06"
        fill="none"
      />

      {/* Animated dashed stroke — flowing energy */}
      <motion.path
        d={d}
        stroke={gradId}
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="8 16"
        initial={{ strokeDashoffset: 0 }}
        animate={{ strokeDashoffset: -200 }}
        transition={{
          duration: duration,
          delay: delay,
          repeat: Infinity,
          ease: "linear",
        }}
        filter={glowFilter}
        strokeLinecap="round"
      />

      {/* Secondary animated layer */}
      <motion.path
        d={d}
        stroke={color}
        strokeWidth="0.8"
        strokeOpacity="0.25"
        fill="none"
        strokeDasharray="4 24"
        initial={{ strokeDashoffset: 0 }}
        animate={{ strokeDashoffset: -150 }}
        transition={{
          duration: duration * 0.8,
          delay: delay + 0.5,
          repeat: Infinity,
          ease: "linear",
        }}
        strokeLinecap="round"
      />

      {/* Glowing particles traveling along the path */}
      {Array.from({ length: particleCount }).map((_, i) => (
        <FlowingParticle
          key={`${config.id}-particle-${i}`}
          pathD={d}
          color={color}
          duration={duration + i * 0.8}
          delay={delay + i * (duration / particleCount)}
          size={2.5 - i * 0.4}
        />
      ))}
    </g>
  );
}

/* ── Individual flowing particle ── */

function FlowingParticle({
  pathD,
  color,
  duration,
  delay,
  size,
}: {
  pathD: string;
  color: string;
  duration: number;
  delay: number;
  size: number;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const animRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  const animate = useCallback(
    (now: number) => {
      if (!pathRef.current) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      if (startRef.current === 0) {
        startRef.current = now + delay * 1000;
      }

      const elapsed = now - startRef.current;
      if (elapsed < 0) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      const totalLength = pathRef.current.getTotalLength();
      const progress = (elapsed / (duration * 1000)) % 1;

      // EaseInOut for organic movement
      const eased =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const point = pathRef.current.getPointAtLength(eased * totalLength);
      setPos({ x: point.x, y: point.y });

      animRef.current = requestAnimationFrame(animate);
    },
    [delay, duration]
  );

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  return (
    <g filter="url(#particle-glow)">
      {/* Hidden path for measurement */}
      <path ref={pathRef} d={pathD} fill="none" stroke="none" />

      {/* Outer glow */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={size * 2.5}
        fill={color}
        opacity={0.15}
      />
      {/* Core particle */}
      <circle cx={pos.x} cy={pos.y} r={size} fill={color} opacity={0.9} />
      {/* Bright center */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={size * 0.4}
        fill="white"
        opacity={0.8}
      />
    </g>
  );
}
