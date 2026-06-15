"use client";

import { motion } from "framer-motion";

/* ─────────────────────────────────────────────
 * AIEngine — The orange hexagonal icon at the center
 * of the transformation pipeline. Has a 3D cube icon
 * inside, surrounded by concentric dashed orbit rings
 * with orbiting dots.
 * ───────────────────────────────────────────── */

export default function AIEngine() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col items-center"
    >
      {/* Concentric orbit rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Outer orbit ring */}
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          fill="none"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <circle
            cx="90"
            cy="90"
            r="85"
            stroke="#E5E7EB"
            strokeWidth="0.8"
            strokeDasharray="4 6"
            opacity="0.5"
          />
          {/* Orbiting dots on outer ring */}
          <motion.circle
            cx="90"
            cy="5"
            r="2.5"
            fill="#A855F7"
            opacity="0.6"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "90px 90px" }}
          />
          <motion.circle
            cx="175"
            cy="90"
            r="2"
            fill="#EC4899"
            opacity="0.5"
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "90px 90px" }}
          />
          <motion.circle
            cx="90"
            cy="175"
            r="2.5"
            fill="#60A5FA"
            opacity="0.6"
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "90px 90px" }}
          />
        </svg>

        {/* Middle orbit ring */}
        <svg
          width="130"
          height="130"
          viewBox="0 0 130 130"
          fill="none"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <circle
            cx="65"
            cy="65"
            r="60"
            stroke="#E5E7EB"
            strokeWidth="0.6"
            strokeDasharray="3 5"
            opacity="0.4"
          />
          <motion.circle
            cx="125"
            cy="65"
            r="2"
            fill="#A855F7"
            opacity="0.5"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "65px 65px" }}
          />
          <motion.circle
            cx="5"
            cy="65"
            r="1.5"
            fill="#EC4899"
            opacity="0.4"
            animate={{ rotate: 360 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "65px 65px" }}
          />
        </svg>

        {/* Inner orbit ring */}
        <svg
          width="90"
          height="90"
          viewBox="0 0 90 90"
          fill="none"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <circle
            cx="45"
            cy="45"
            r="40"
            stroke="#E5E7EB"
            strokeWidth="0.5"
            strokeDasharray="2 4"
            opacity="0.3"
          />
          <motion.circle
            cx="45"
            cy="5"
            r="1.5"
            fill="#60A5FA"
            opacity="0.5"
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "45px 45px" }}
          />
        </svg>
      </div>

      {/* Radial glow aura */}
      <div
        className="absolute -inset-16 opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(234,88,12,0.12) 0%, rgba(249,115,22,0.08) 30%, rgba(168,85,247,0.04) 60%, transparent 75%)",
        }}
      />

      {/* Hexagonal orange icon */}
      <div className="relative z-10 flex h-[72px] w-[72px] items-center justify-center">
        {/* Hexagon background */}
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          fill="none"
          className="absolute inset-0"
        >
          <defs>
            <linearGradient id="hex-gradient" x1="0" y1="0" x2="72" y2="72">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="50%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
            <filter id="hex-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#F97316" floodOpacity="0.3" />
            </filter>
          </defs>
          <path
            d="M36 4 L62 18 L62 54 L36 68 L10 54 L10 18 Z"
            fill="url(#hex-gradient)"
            filter="url(#hex-shadow)"
          />
          {/* Inner highlight border */}
          <path
            d="M36 8 L58 20 L58 52 L36 64 L14 52 L14 20 Z"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="0.8"
          />
        </svg>

        {/* 3D Cube icon */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative z-10"
        >
          {/* Front face */}
          <path d="M12 2 L22 7 L22 17 L12 22 L2 17 L2 7 Z" />
          {/* Middle horizontal line */}
          <path d="M2 7 L12 12 L22 7" />
          {/* Vertical line */}
          <path d="M12 12 L12 22" />
        </svg>
      </div>
    </motion.div>
  );
}
