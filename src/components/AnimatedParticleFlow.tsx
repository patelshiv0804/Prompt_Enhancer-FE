"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";

/* ─────────────────────────────────────────────
 * Animated particle flow — dotted/dashed flowing
 * lines with colored particles that travel from
 * the Raw Prompt card → AI Engine → Optimized For.
 *
 * Lines fan out from the card to the engine, and
 * fan out wider from the engine to the bottom card.
 * Matches the reference image's organic, spread-out
 * dotted-line aesthetic with colored particle dots.
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
  // ─── Top card → AI Engine (converging) ───
  {
    id: "t-far-left",
    d: "M 185 55 C 150 90, 100 140, 90 180 C 80 230, 180 270, 270 310",
    color: "#A855F7", duration: 5, delay: 0, particleCount: 3,
  },
  {
    id: "t-left",
    d: "M 200 55 C 180 100, 150 150, 170 210 C 185 250, 230 280, 270 310",
    color: "#8B5CF6", duration: 4.5, delay: 0.3, particleCount: 3,
  },
  {
    id: "t-center-left",
    d: "M 230 55 C 220 100, 210 170, 230 230 C 240 260, 255 285, 270 310",
    color: "#EC4899", duration: 4, delay: 0.5, particleCount: 3,
  },
  {
    id: "t-center",
    d: "M 270 55 C 270 120, 270 200, 270 310",
    color: "#F472B6", duration: 3.5, delay: 0.2, particleCount: 4,
  },
  {
    id: "t-center-right",
    d: "M 310 55 C 320 100, 330 170, 310 230 C 300 260, 285 285, 270 310",
    color: "#60A5FA", duration: 4, delay: 0.4, particleCount: 3,
  },
  {
    id: "t-right",
    d: "M 340 55 C 360 100, 390 150, 370 210 C 355 250, 310 280, 270 310",
    color: "#818CF8", duration: 4.5, delay: 0.1, particleCount: 3,
  },
  {
    id: "t-far-right",
    d: "M 355 55 C 390 90, 440 140, 450 180 C 460 230, 360 270, 270 310",
    color: "#A855F7", duration: 5, delay: 0.6, particleCount: 3,
  },

  // ─── AI Engine → Bottom card (fanning out) ───
  {
    id: "b-far-left",
    d: "M 270 340 C 250 370, 120 400, 50 440 C 10 460, 20 490, 40 510",
    color: "#A855F7", duration: 5, delay: 0, particleCount: 2,
  },
  {
    id: "b-left",
    d: "M 270 340 C 255 370, 160 400, 110 440 C 80 460, 90 490, 110 510",
    color: "#EC4899", duration: 4.5, delay: 0.2, particleCount: 3,
  },
  {
    id: "b-center-left-1",
    d: "M 270 340 C 260 370, 200 410, 170 450 C 150 480, 160 500, 175 510",
    color: "#60A5FA", duration: 4, delay: 0.5, particleCount: 2,
  },
  {
    id: "b-center-left-2",
    d: "M 270 340 C 265 370, 230 410, 220 450 C 215 480, 220 500, 230 510",
    color: "#8B5CF6", duration: 3.8, delay: 0.7, particleCount: 2,
  },
  {
    id: "b-center",
    d: "M 270 340 C 270 380, 270 430, 270 510",
    color: "#F472B6", duration: 3.5, delay: 0.3, particleCount: 3,
  },
  {
    id: "b-center-right-2",
    d: "M 270 340 C 275 370, 310 410, 320 450 C 325 480, 320 500, 310 510",
    color: "#818CF8", duration: 3.8, delay: 0.6, particleCount: 2,
  },
  {
    id: "b-center-right-1",
    d: "M 270 340 C 280 370, 340 410, 370 450 C 390 480, 380 500, 365 510",
    color: "#A855F7", duration: 4, delay: 0.4, particleCount: 2,
  },
  {
    id: "b-right",
    d: "M 270 340 C 285 370, 380 400, 430 440 C 460 460, 450 490, 430 510",
    color: "#EC4899", duration: 4.5, delay: 0.1, particleCount: 3,
  },
  {
    id: "b-far-right",
    d: "M 270 340 C 290 370, 420 400, 490 440 C 530 460, 520 490, 500 510",
    color: "#60A5FA", duration: 5, delay: 0.8, particleCount: 2,
  },
];

export default function AnimatedParticleFlow() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[600px] w-[540px]" />;

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <svg
        viewBox="0 0 540 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* ── SVG Filters for glow ── */}
        <defs>
          <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-pink" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="particle-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradient definitions */}
          <linearGradient id="grad-purple" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="grad-pink" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EC4899" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="grad-blue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.1" />
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

  const getFilter = () => {
    if (color.includes("A855F7") || color.includes("8B5CF6") || color.includes("818CF8")) return "url(#glow-purple)";
    if (color.includes("EC4899") || color.includes("F472B6")) return "url(#glow-pink)";
    return "url(#glow-blue)";
  };

  return (
    <g>
      {/* Base path — very faint static dotted line */}
      <path
        d={d}
        stroke={color}
        strokeWidth="0.8"
        strokeOpacity="0.08"
        strokeDasharray="2 4"
        fill="none"
      />

      {/* Animated dashed stroke — flowing energy dots */}
      <motion.path
        d={d}
        stroke={color}
        strokeWidth="1.2"
        strokeOpacity="0.3"
        fill="none"
        strokeDasharray="2 8"
        initial={{ strokeDashoffset: 0 }}
        animate={{ strokeDashoffset: -200 }}
        transition={{
          duration: duration,
          delay: delay,
          repeat: Infinity,
          ease: "linear",
        }}
        filter={getFilter()}
        strokeLinecap="round"
      />

      {/* Secondary flowing layer — offset timing */}
      <motion.path
        d={d}
        stroke={color}
        strokeWidth="0.6"
        strokeOpacity="0.15"
        fill="none"
        strokeDasharray="1 12"
        initial={{ strokeDashoffset: 0 }}
        animate={{ strokeDashoffset: -150 }}
        transition={{
          duration: duration * 0.7,
          delay: delay + 0.8,
          repeat: Infinity,
          ease: "linear",
        }}
        strokeLinecap="round"
      />

      {/* Glowing particles traveling along the path */}
      {Array.from({ length: particleCount }).map((_, i) => (
        <FlowingParticle
          key={`${config.id}-p-${i}`}
          pathD={d}
          color={color}
          duration={duration + i * 0.6}
          delay={delay + i * (duration / particleCount)}
          size={2.2 - i * 0.3}
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
        opacity={0.12}
      />
      {/* Core particle */}
      <circle cx={pos.x} cy={pos.y} r={size} fill={color} opacity={0.85} />
      {/* Bright center */}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={size * 0.35}
        fill="white"
        opacity={0.7}
      />
    </g>
  );
}