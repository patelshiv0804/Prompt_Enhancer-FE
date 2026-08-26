"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════
 *  BentoFeatures — Handcrafted editorial Bento Grid
 *
 *  ARCHITECTURE (the key to no gaps):
 *  ─────────────────────────────────
 *  Uses CSS grid-template-areas + explicit pixel row heights.
 *  The "vault" area name appears in rows 3 AND 4, so CSS Grid
 *  automatically spans it across both rows — a true puzzle piece.
 *  All cards have height:100% + box-sizing:border-box so they fill
 *  their grid cell completely with zero empty space.
 *
 *  Grid template areas:
 *  ┌─────────────────┬─────────────────────────────┐ row 1: 460px
 *  │    role (5/12)  │       chain (7/12)          │
 *  ├─────────────────┼─────────────────────────────┤ row 2: 520px
 *  │   model (5/12)  │       anlyt (7/12)          │
 *  ├───────┬─────────┬───────┬───────┐             │ row 3: 240px
 *  │ srch  │  vault  │ smart │ xport │             │
 *  ├───────┤ (3/12,  ├───────┴───────┘             │ row 4: 400px
 *  │ histy │ spans   │    batch (6/12)             │
 *  └───────┴─────────┴─────────────────────────────┘
 *  └──────────────── cta (12/12) ───────────────────┘ row 5: auto
 * ═══════════════════════════════════════════════════════════════════ */

/* ── Design Tokens ── */
const P = {
  purple: "#8B5CF6",
  lav: "#A78BFA",
  violet: "#7C3AED",
  pink: "#EC4899",
  ink: "#09090B",
  g800: "#1F2937",
  g700: "#374151",
  g600: "#4B5563",
  g500: "#6B7280",
  g400: "#9CA3AF",
  g300: "#D1D5DB",
  g200: "#E5E7EB",
  g100: "#F4F4F5",
  bg: "#FAFAFC",
};

const GRAD = "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 55%, #EC4899 100%)";

/* ── Card shell — MUST have height:100% to fill grid cell ── */
const CARD: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 32,
  border: "1px solid rgba(9,9,11,0.055)",
  boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 20px rgba(0,0,0,0.04), 0 0 0 0.5px rgba(139,92,246,0.025)",
  padding: "32px",
  height: "100%",
  boxSizing: "border-box" as const,
  display: "flex",
  flexDirection: "column" as const,
  position: "relative" as const,
  overflow: "hidden" as const,
};

/* Compact variant for 240px-row cards */
const CARD_SM: React.CSSProperties = { ...CARD, padding: "22px 24px" };

/* ── Fade-up entrance ── */
const FU = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

/* ── Label ── */
const LBL: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 700,
  letterSpacing: "0.2em", textTransform: "uppercase" as const,
  color: P.purple, marginBottom: 14,
};

/* ── Sparkle SVG ── */
function Sp({ size = 14, c = P.purple }: { size?: number; c?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={c}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  CARD 1 — Style & Role Memory
 *  Grid area: "role" — 5/12 cols, row 1 (460px)
 * ═══════════════════════════════════════════════════════════════════ */
const ROLES = ["Doctor", "Developer", "Farmer", "Businessman", "Teacher", "Designer", "Student", "Marketer", "Writer"];

function CardStyleRole() {
  const [active, setActive] = useState("Doctor");
  const [on, setOn] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-cycle roles every 2.5s, pause on hover
  useEffect(() => {
    if (isHovered) return;
    const id = setInterval(() => {
      setActive(prev => ROLES[(ROLES.indexOf(prev) + 1) % ROLES.length]);
    }, 2500);
    return () => clearInterval(id);
  }, [isHovered]);

  return (
    <div style={CARD} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: -70, right: -70, width: 240, height: 240,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.14) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <span style={LBL}>Role Memory</span>
      <h2 style={{ fontSize: 26, fontWeight: 760, color: P.ink, letterSpacing: "-0.025em", lineHeight: 1.18, margin: "0 0 10px" }}>
        Style &amp;&nbsp;Role<br />Memory
      </h2>
      <p style={{ fontSize: 13.5, color: P.g500, lineHeight: 1.65, margin: "0 0 20px" }}>
        Set your role once. AURE adapts every output to match your professional context.
      </p>

      <p style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: P.g400, marginBottom: 10 }}>
        Choose your role
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 20 }}>
        {ROLES.map(r => (
          <button key={r} onClick={() => setActive(r)} style={{
            padding: "5px 13px", borderRadius: 999,
            border: active === r ? "1.5px solid rgba(139,92,246,0.30)" : "1.5px solid rgba(0,0,0,0.07)",
            background: active === r ? "rgba(167,139,250,0.10)" : "transparent",
            color: active === r ? P.violet : P.g600,
            fontSize: 12.5, fontWeight: active === r ? 620 : 450,
            letterSpacing: "-0.01em", cursor: "pointer", transition: "all 0.15s ease",
          }}>{r}</button>
        ))}
      </div>

      {/* Active profile chip */}
      <div style={{
        background: "#FAFAFD", borderRadius: 18, border: "1px solid rgba(139,92,246,0.08)",
        padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", background: "rgba(167,139,250,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={P.purple} strokeWidth="1.8">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
            <span style={{ fontSize: 13.5, fontWeight: 660, color: P.ink, letterSpacing: "-0.01em" }}>{active}</span>
            <motion.span animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: "rgba(167,139,250,0.12)", color: P.purple }}>Active</motion.span>
          </div>
          <p style={{ fontSize: 11.5, color: P.g400, margin: 0 }}>Professional · Precise · Empathetic</p>
        </div>
      </div>

      {/* Toggle — pushes to bottom via marginTop:auto */}
      <div onClick={() => setOn(p => !p)} style={{
        marginTop: "auto", display: "flex", alignItems: "center", gap: 10,
        padding: "11px 14px", background: "rgba(139,92,246,0.04)", borderRadius: 14, cursor: "pointer",
      }}>
        <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} style={{ display: "flex" }}><Sp size={11} c={P.lav} /></motion.div>
        <span style={{ flex: 1, fontSize: 12.5, fontWeight: 500, color: P.g600, letterSpacing: "-0.01em" }}>Auto-apply to all prompts</span>
        <div style={{ width: 38, height: 22, borderRadius: 999, background: on ? P.purple : P.g300, position: "relative", transition: "background 0.2s ease", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: 3, left: on ? 18 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.20)", transition: "left 0.2s ease" }} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  CARD 2 — Prompt Chaining (organic SVG node graph)
 *  Grid area: "chain" — 7/12 cols, row 1 (460px)
 * ═══════════════════════════════════════════════════════════════════ */
const CHAIN_NODES = [
  { id: "A", label: "Story Concept", x: 58, y: 36, pink: false },
  { id: "B", label: "Scene Breakdown", x: 200, y: 21, pink: false },
  { id: "C", label: "Image Prompts", x: 338, y: 40, pink: false },
  { id: "D", label: "VEO Prompts", x: 467, y: 25, pink: false },
  { id: "E", label: "Thumbnail", x: 107, y: 148, pink: true },
  { id: "F", label: "Title & Hook", x: 255, y: 165, pink: true },
  { id: "G", label: "Description", x: 402, y: 142, pink: true },
];
const CHAIN_EDGES = [
  { a: "A", b: "B", cpx: 129, cpy: 21 },
  { a: "B", b: "C", cpx: 269, cpy: 22 },
  { a: "C", b: "D", cpx: 403, cpy: 22 },
  { a: "B", b: "E", cpx: 154, cpy: 92 },
  { a: "C", b: "F", cpx: 297, cpy: 106 },
  { a: "D", b: "G", cpx: 435, cpy: 85 },
  { a: "E", b: "F", cpx: 181, cpy: 163 },
  { a: "F", b: "G", cpx: 329, cpy: 168 },
];

function chipW(label: string) { return Math.max(label.length * 6.0 + 24, 76); }

/* ═══════════════════════════════════════════════════════════════════
 *  CARD 2 — Prompt Chaining (Disabled/Commented Out per user request)
 * ═══════════════════════════════════════════════════════════════════
function CardChaining() { ... }
*/

/* ═══════════════════════════════════════════════════════════════════
 *  CARD 3 — Multi-Model Optimization (360° Radial Ecosystem Hub)
 *  Grid area: "model" — 5/12 cols, row 2 (520px)
 * ═══════════════════════════════════════════════════════════════════ */
/* Exact 12-node dual-ring constellation layout matching reference architecture */
const RADIAL_MODELS = [
  // 1. Top center
  { name: "ChatGPT", icon: "/chatgpt-icon.svg", x: 230, y: 32, size: 35, isSatellite: false },
  // 2. Top-left outer
  { name: "Claude", icon: "/claude-ai-icon.svg", x: 130, y: 38, size: 35, isSatellite: false },
  // 3. Top-left inner satellite
  { name: "Perplexity", icon: "/perplexity-ai-icon.svg", x: 188, y: 88, size: 27, isSatellite: true },
  // 4. Top-right middle
  { name: "Gemini", icon: "/google-gemini-icon.svg", x: 312, y: 56, size: 35, isSatellite: false },
  // 5. Top-right outer
  { name: "Grok", icon: "/grok-icon.svg", x: 392, y: 68, size: 35, isSatellite: false },
  // 6. Left outer
  { name: "DALL·E", icon: "/dalle-icon.svg", x: 92, y: 116, size: 35, isSatellite: false },
  // 7. Left inner satellite
  { name: "Higgsfield", icon: "/higgsfield-icon.svg", x: 142, y: 168, size: 27, isSatellite: true },
  // 8. Right inner satellite
  { name: "DeepSeek", icon: "/deepseek-logo-icon.svg", x: 338, y: 160, size: 27, isSatellite: true },
  // 9. Far bottom-right outer
  { name: "Midjourney", icon: "/midjourney-color-icon.svg", x: 378, y: 232, size: 35, isSatellite: false },
  // 10. Bottom-left outer
  { name: "VEO", icon: "/veo-icon.svg", x: 112, y: 228, size: 35, isSatellite: false },
  // 11. Bottom center-left
  { name: "Chrome", icon: "/google-chrome-icon.svg", x: 184, y: 255, size: 35, isSatellite: false },
  // 12. Bottom center-right inner satellite
  { name: "ChatGPT 4o", icon: "/chatgpt-icon.svg", x: 272, y: 242, size: 28, isSatellite: true },
];

const HUB_CENTER = { x: 230, y: 145 };

function CardMultiModel() {
  return (
    <div style={CARD}>
      {/* Deep ambient glow — bottom-left */}
      <div style={{
        position: "absolute", bottom: -80, left: -80, width: 320, height: 320,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.14) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
      {/* Secondary glow — top-right */}
      <div style={{
        position: "absolute", top: -40, right: -40, width: 220, height: 220,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* ── Header ── */}
      <span style={LBL}>Multi-Model</span>
      <h2 style={{ fontSize: 22, fontWeight: 760, color: P.ink, letterSpacing: "-0.025em", lineHeight: 1.18, margin: "0 0 6px" }}>
        Multi-Model<br />Optimization
      </h2>
      <p style={{ fontSize: 12.5, color: P.g500, lineHeight: 1.6, margin: "0 0 14px" }}>
        Every model has its own language. We craft your prompt to speak fluently to each one.
      </p>

      {/* ── Hero Visual: 360° Radial Model Constellation Hub ── */}
      <div className="bento-svg-model" style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <svg
          viewBox="0 0 460 290"
          width="100%" height="100%"
          fill="none"
          style={{ overflow: "visible", display: "block" }}
        >
          <defs>
            {/* Theme Violet / Purple Hub Radial Glow */}
            <radialGradient id="hubVioletGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.35)" />
              <stop offset="50%" stopColor="rgba(167, 139, 250, 0.14)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
            </radialGradient>
            {/* Theme Pink / Purple Secondary Glow */}
            <radialGradient id="hubPinkGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(236, 72, 153, 0.22)" />
              <stop offset="60%" stopColor="rgba(139, 92, 246, 0.06)" />
              <stop offset="100%" stopColor="rgba(236, 72, 153, 0)" />
            </radialGradient>
            {/* Theme Ring Gradient */}
            <linearGradient id="hubThemeRing" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
            {/* Tile Drop Shadow */}
            <filter id="tileShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#09090B" floodOpacity="0.06" />
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#09090B" floodOpacity="0.04" />
            </filter>
          </defs>

          {/* 1. Large Ambient Aura behind Hub */}
          <circle cx={HUB_CENTER.x} cy={HUB_CENTER.y} r={95} fill="url(#hubVioletGlow)" />
          <circle cx={HUB_CENTER.x} cy={HUB_CENTER.y} r={65} fill="url(#hubPinkGlow)" />

          {/* 2. Solid Radial Connecting Rays to all Models */}
          {RADIAL_MODELS.map((m, i) => (
            <g key={`ray-${m.name}-${i}`}>
              {/* Clean solid connecting line */}
              <line
                x1={HUB_CENTER.x}
                y1={HUB_CENTER.y}
                x2={m.x}
                y2={m.y}
                stroke="rgba(139, 92, 246, 0.35)"
                strokeWidth={1.3}
              />
              {/* Smooth energy bead traveling along solid line */}
              <motion.circle
                r={1.8}
                fill={i % 2 === 0 ? "#8B5CF6" : "#EC4899"}
                opacity={0.9}
                animate={{
                  cx: [HUB_CENTER.x, m.x],
                  cy: [HUB_CENTER.y, m.y],
                  opacity: [0, 0.95, 0],
                }}
                transition={{
                  duration: 2.2 + (i % 4) * 0.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.18,
                }}
              />
            </g>
          ))}

          {/* 3. Orbiting Model Squircle Badges */}
          {RADIAL_MODELS.map((m, i) => {
            const size = m.size;
            const iconSize = m.isSatellite ? 15 : 19;
            const rx = m.isSatellite ? 8 : 10;
            return (
              <motion.g
                key={`${m.name}-${i}`}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: [0, -2.5 - (i % 3) * 1.2, 0],
                }}
                transition={{
                  opacity: { delay: 0.08 + i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                  scale: { delay: 0.08 + i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                  y: { duration: 3.2 + (i % 3) * 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 },
                }}
                style={{ cursor: "pointer" }}
              >
                {/* Tile Background Body with Apple Squircle */}
                <rect
                  x={m.x - size / 2}
                  y={m.y - size / 2}
                  width={size}
                  height={size}
                  rx={rx}
                  fill="#FFFFFF"
                  stroke="rgba(139, 92, 246, 0.12)"
                  strokeWidth={1}
                  filter="url(#tileShadow)"
                />
                {/* Brand Logo Icon */}
                <image
                  href={m.icon}
                  x={m.x - iconSize / 2}
                  y={m.y - iconSize / 2}
                  width={iconSize}
                  height={iconSize}
                  preserveAspectRatio="xMidYMid meet"
                />
              </motion.g>
            );
          })}

          {/* 4. Central Circular Hub (AURE Website Logo Core + Glowing Theme Ring) */}
          <motion.g
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: [1, 1.04, 1] }}
            transition={{
              opacity: { delay: 0.05, duration: 0.6 },
              scale: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            {/* Outer Glowing Theme Ring */}
            <circle
              cx={HUB_CENTER.x}
              cy={HUB_CENTER.y}
              r={32}
              fill="none"
              stroke="url(#hubThemeRing)"
              strokeWidth={2}
              style={{ filter: "drop-shadow(0 0 10px rgba(139, 92, 246, 0.40))" }}
            />
            {/* Outer subtle halo ring */}
            <circle
              cx={HUB_CENTER.x}
              cy={HUB_CENTER.y}
              r={38}
              fill="none"
              stroke="rgba(139, 92, 246, 0.18)"
              strokeWidth={1}
              strokeDasharray="2 3"
            />
            {/* Inner White Glass Node Core */}
            <circle
              cx={HUB_CENTER.x}
              cy={HUB_CENTER.y}
              r={29}
              fill="#FFFFFF"
              stroke="rgba(139, 92, 246, 0.12)"
              strokeWidth={1}
            />

            {/* Central Website Logo (AURE) */}
            <image
              href="/logo_1.svg"
              x={HUB_CENTER.x - 17}
              y={HUB_CENTER.y - 17}
              width={34}
              height={34}
              preserveAspectRatio="xMidYMid meet"
            />
          </motion.g>
        </svg>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  CARD 4 — Analytics Dashboard (HERO — cinematic redesign)
 *  Grid area: "anlyt" — 7/12 cols, row 2 (520px) — DOMINANT CARD
 *
 *  Layout: large chart occupies ~70% of card height.
 *  Metric cards float as absolute-positioned chips above the chart,
 *  at different Y positions — creating overlap and depth hierarchy.
 * ═══════════════════════════════════════════════════════════════════ */
function AnimNum({ target, displaySuffix = "", delay = 0 }: { target: number; displaySuffix?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let startTimestamp: number | null = null;
    const duration = 1500;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayVal(Math.floor(easedProgress * target));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayVal(target);
      }
    };

    const timer = setTimeout(() => {
      window.requestAnimationFrame(step);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [inView, target, delay]);

  const formatted =
    target >= 10000
      ? (displayVal / 1000).toFixed(1) + "K"
      : displayVal.toLocaleString();

  return (
    <motion.span ref={ref}>
      {formatted}{displaySuffix}
    </motion.span>
  );
}

// Smooth cubic Bezier spline helper
function generateSpline(points: { x: number; y: number }[], height = 150): { path: string; area: string } {
  if (!points || points.length === 0) return { path: "", area: "" };
  if (points.length === 1) return { path: `M ${points[0].x} ${points[0].y}`, area: "" };

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 5.5;
    const cp1y = p1.y + (p2.y - p0.y) / 5.5;
    const cp2x = p2.x - (p3.x - p1.x) / 5.5;
    const cp2y = p2.y - (p3.y - p1.y) / 5.5;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  const last = points[points.length - 1];
  const first = points[0];
  const area = `${d} L ${last.x.toFixed(1)} ${height} L ${first.x.toFixed(1)} ${height} Z`;

  return { path: d, area };
}

function MiniSpark({ values, color }: { values: number[]; color: string }) {
  const W = 62;
  const H = 22;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * W,
    y: H - 3 - ((v - min) / range) * (H - 6),
  }));
  const { path, area } = generateSpline(pts, H);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sparkGrad-${color.replace(/[^a-zA-Z0-9]/g, "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sparkGrad-${color.replace(/[^a-zA-Z0-9]/g, "")})`} />
      <motion.path
        d={path}
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      {pts.length > 0 && (
        <circle
          cx={pts[pts.length - 1].x}
          cy={pts[pts.length - 1].y}
          r={2.2}
          fill="#FFFFFF"
          stroke={color}
          strokeWidth="1.5"
        />
      )}
    </svg>
  );
}

const METRICS = [
  {
    label: "Prompts Analyzed",
    target: 1248,
    suffix: "",
    growth: "+28.4%",
    c: "#8B5CF6",
    bgTint: "rgba(139,92,246,0.03)",
    sparkData: [10, 18, 14, 24, 20, 32, 38],
  },
  {
    label: "Avg. PromptScore",
    target: 78,
    suffix: "/100",
    growth: "+14.2%",
    c: "#6366F1",
    bgTint: "rgba(99,102,241,0.03)",
    sparkData: [45, 52, 60, 58, 68, 72, 78],
  },
  {
    label: "Tokens Saved",
    target: 56700,
    suffix: "",
    growth: "+92.6%",
    c: "#EC4899",
    bgTint: "rgba(236,72,153,0.03)",
    sparkData: [12, 22, 18, 35, 42, 48, 56.7],
  },
  {
    label: "Times Optimized",
    target: 2341,
    suffix: "",
    growth: "+38.1%",
    c: "#7C3AED",
    bgTint: "rgba(124,58,237,0.03)",
    sparkData: [15, 19, 28, 24, 38, 42, 54],
  },
];

const TIMEFRAME_DATA: Record<string, { label: string; summary: string; values: { label: string; value: number }[] }> = {
  "7D": {
    label: "Past 7 Days",
    summary: "+24.3% this week",
    values: [
      { label: "Mon", value: 24 },
      { label: "Tue", value: 36 },
      { label: "Wed", value: 30 },
      { label: "Thu", value: 48 },
      { label: "Fri", value: 56 },
      { label: "Sat", value: 50 },
      { label: "Sun", value: 68 },
    ],
  },
  "30D": {
    label: "This Month",
    summary: "+48.2% vs last month",
    values: [
      { label: "Day 1", value: 12 },
      { label: "Day 4", value: 18 },
      { label: "Day 7", value: 16 },
      { label: "Day 10", value: 26 },
      { label: "Day 13", value: 34 },
      { label: "Day 16", value: 29 },
      { label: "Day 19", value: 44 },
      { label: "Day 22", value: 41 },
      { label: "Day 25", value: 58 },
      { label: "Day 28", value: 66 },
      { label: "Day 30", value: 82 },
    ],
  },
  "90D": {
    label: "Past Quarter",
    summary: "+114% velocity",
    values: [
      { label: "Month 1", value: 18 },
      { label: "Month 2", value: 32 },
      { label: "Month 3", value: 48 },
      { label: "Month 4", value: 64 },
      { label: "Month 5", value: 78 },
      { label: "Month 6", value: 94 },
    ],
  },
  "All": {
    label: "All Time",
    summary: "3.8x total gain",
    values: [
      { label: "Q1", value: 14 },
      { label: "Q2", value: 36 },
      { label: "Q3", value: 62 },
      { label: "Q4", value: 89 },
      { label: "Current", value: 98 },
    ],
  },
};

function HeroBigChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true });
  const [timeframe, setTimeframe] = useState<"7D" | "30D" | "90D" | "All">("30D");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const currentDataset = TIMEFRAME_DATA[timeframe];
  const rawData = currentDataset.values;

  const W = 620;
  const H = 160;
  const maxY = 100;

  const points = rawData.map((d, i) => ({
    x: (i / (rawData.length - 1)) * (W - 36) + 16,
    y: H - 14 - (d.value / maxY) * (H - 32),
  }));

  const { path: curvePath, area: curveArea } = generateSpline(points, H);

  // Active hover point data
  const activePt = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : points[points.length - 1];
  const activeData = hoverIndex !== null && rawData[hoverIndex] ? rawData[hoverIndex] : rawData[rawData.length - 1];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const normX = Math.max(0, Math.min(1, mouseX / rect.width));
    const closestIdx = Math.round(normX * (rawData.length - 1));
    setHoverIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const isRightSide = activePt ? (activePt.x / W) > 0.65 : false;
  const isLeftSide = activePt ? (activePt.x / W) < 0.22 : false;
  const isTopSide = activePt ? activePt.y < 58 : false;

  const tooltipTransform = isRightSide
    ? `translate(calc(-100% - 12px), ${isTopSide ? "10px" : "calc(-100% - 12px)"})`
    : isLeftSide
    ? `translate(12px, ${isTopSide ? "10px" : "calc(-100% - 12px)"})`
    : `translate(-50%, ${isTopSide ? "12px" : "calc(-100% - 12px)"})`;

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {/* Chart Top Control Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: P.ink, letterSpacing: "-0.02em" }}>
            Optimization Velocity
          </span>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#059669",
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.18)",
            padding: "2px 8px",
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="18 15 12 9 6 15" />
            </svg>
            {currentDataset.summary}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Live indicator */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 8px",
            borderRadius: 999,
            background: "rgba(16,185,129,0.06)",
            border: "1px solid rgba(16,185,129,0.18)",
            fontSize: 9.5,
            fontWeight: 700,
            color: "#059669",
            letterSpacing: "0.04em",
          }}>
            <span style={{ position: "relative", display: "flex", width: 6, height: 6 }}>
              <motion.span
                animate={{ scale: [1, 2.2, 1], opacity: [0.75, 0, 0.75] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#10B981" }}
              />
              <span style={{ position: "relative", width: 6, height: 6, borderRadius: "50%", background: "#059669" }} />
            </span>
            LIVE UPDATES
          </div>

          {/* Apple/Notion Segmented Timeframe Switcher */}
          <div style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(0,0,0,0.04)",
            padding: "2px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.04)",
          }}>
            {(["7D", "30D", "90D", "All"] as const).map((t) => {
              const isSelected = timeframe === t;
              return (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  style={{
                    position: "relative",
                    padding: "3px 9px",
                    fontSize: 10.5,
                    fontWeight: isSelected ? 650 : 500,
                    color: isSelected ? P.ink : P.g500,
                    borderRadius: 8,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    transition: "color 0.15s ease",
                    zIndex: 1,
                  }}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="chartTimeframePill"
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "#FFFFFF",
                        borderRadius: 8,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08), 0 0.5px 1px rgba(0,0,0,0.06)",
                        zIndex: -1,
                      }}
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SVG Canvas with Interactive Hover */}
      <div style={{ position: "relative", width: "100%", height: H, overflow: "visible" }}>
        {/* Floating Tooltip Follower with Collision-Proof Offset */}
        <AnimatePresence>
          {activePt && (
            <div
              key={`${timeframe}-${hoverIndex ?? 'def'}`}
              style={{
                position: "absolute",
                left: `${(activePt.x / W) * 100}%`,
                top: `${(activePt.y / H) * 100}%`,
                transform: tooltipTransform,
                pointerEvents: "none",
                zIndex: 50,
                transition: "transform 0.15s ease-out, left 0.12s ease-out, top 0.12s ease-out",
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.15 }}
                style={{
                  background: "rgba(15, 15, 22, 0.95)",
                  backdropFilter: "blur(14px)",
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.40), 0 2px 8px rgba(0,0,0,0.20)",
                  padding: "6px 12px",
                  borderRadius: 10,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1.5,
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>
                  {activeData.label}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 4.5 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>
                    {activeData.value}%
                  </span>
                  <span style={{ fontSize: 9.5, color: "#A78BFA", fontWeight: 600 }}>
                    efficiency
                  </span>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <svg
          width="100%"
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          fill="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ overflow: "visible", cursor: "crosshair", display: "block" }}
        >
          <defs>
            {/* Subtle multi-stop smooth area gradient */}
            <linearGradient id="appleChartArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.28" />
              <stop offset="45%" stopColor="#A78BFA" stopOpacity="0.10" />
              <stop offset="90%" stopColor="#EC4899" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing Line Stroke Gradient */}
            <linearGradient id="appleLineStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="40%" stopColor="#A78BFA" />
              <stop offset="75%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>

            {/* Ambient drop shadow for the spline curve */}
            <filter id="splineShadow" x="-10%" y="-20%" width="120%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#8B5CF6" floodOpacity="0.32" />
            </filter>
          </defs>

          {/* Dotted horizontal guideline grids with sleek micro labels */}
          {[30, 75, 120].map((y, idx) => {
            const labelVal = idx === 0 ? "90%" : idx === 1 ? "60%" : "30%";
            return (
              <g key={y}>
                <line
                  x1="0"
                  y1={y}
                  x2={W}
                  y2={y}
                  stroke="rgba(139,92,246,0.07)"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
                <text
                  x={W - 4}
                  y={y - 3}
                  textAnchor="end"
                  fontSize="8.5"
                  fill="rgba(100,116,139,0.4)"
                  fontWeight="600"
                  fontFamily="sans-serif"
                >
                  {labelVal}
                </text>
              </g>
            );
          })}

          {inView && (
            <>
              {/* Smooth Spline Area Fill */}
              <motion.path
                key={`area-${timeframe}`}
                d={curveArea}
                fill="url(#appleChartArea)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />

              {/* Smooth Spline Stroke */}
              <motion.path
                key={`path-${timeframe}`}
                d={curvePath}
                stroke="url(#appleLineStroke)"
                strokeWidth="2.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#splineShadow)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Vertical Guide Line to Hover Point */}
              {activePt && (
                <line
                  x1={activePt.x}
                  y1={activePt.y}
                  x2={activePt.x}
                  y2={H - 6}
                  stroke="rgba(139,92,246,0.30)"
                  strokeWidth="1.2"
                  strokeDasharray="2 3"
                />
              )}

              {/* Active Beacon Node */}
              {activePt && (
                <g>
                  {/* Outer pulsating ring */}
                  <motion.circle
                    cx={activePt.x}
                    cy={activePt.y}
                    r={9}
                    fill="rgba(139,92,246,0.18)"
                    animate={{ scale: [1, 1.45, 1], opacity: [0.8, 0.3, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {/* Inner halo ring */}
                  <circle
                    cx={activePt.x}
                    cy={activePt.y}
                    r={5.5}
                    fill="#8B5CF6"
                    opacity={0.35}
                  />
                  {/* Solid central dot */}
                  <circle
                    cx={activePt.x}
                    cy={activePt.y}
                    r={3.5}
                    fill="#FFFFFF"
                    stroke="#8B5CF6"
                    strokeWidth="2.2"
                  />
                </g>
              )}
            </>
          )}
        </svg>
      </div>
    </div>
  );
}

function CardAnalytics() {
  return (
    <div style={CARD}>
      {/* Refined ambient Apple-style glow layers */}
      <div style={{
        position: "absolute", top: -80, right: -80, width: 340, height: 340,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 68%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -60, left: -60, width: 260, height: 260,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Header with Kicker Badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
            <span style={LBL}>Analytics</span>
            <span style={{
              fontSize: 9.5,
              fontWeight: 650,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "2px 7px",
              borderRadius: 6,
              background: "rgba(139,92,246,0.08)",
              color: P.purple,
              border: "1px solid rgba(139,92,246,0.15)",
            }}>
              Intelligence Hub
            </span>
          </div>

          <h2 style={{ fontSize: 25, fontWeight: 780, color: P.ink, letterSpacing: "-0.03em", lineHeight: 1.12, margin: "0 0 5px" }}>
            Analytics Dashboard
          </h2>
          <p style={{ fontSize: 13, color: P.g500, lineHeight: 1.5, margin: 0 }}>
            Track prompt performance, quality score, and productivity in real-time.
          </p>
        </div>
      </div>

      {/* 4-column Apple/Notion Glass KPI Cards */}
      <div className="bento-metrics" style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 10,
        marginBottom: 18,
      }}>
        {METRICS.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.45 }}
            whileHover={{ y: -3, transition: { duration: 0.18 } }}
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(249,248,255,0.92) 100%)",
              borderRadius: 16,
              border: `1px solid ${m.c}22`,
              boxShadow: "0 2px 10px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.9)",
              padding: "11px 13px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top row: Label + Growth Pill */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <p style={{ fontSize: 10.5, color: P.g600, margin: 0, fontWeight: 620, letterSpacing: "-0.01em", lineHeight: 1.25 }}>
                {m.label}
              </p>
              <span style={{
                fontSize: 9,
                fontWeight: 700,
                color: m.c,
                background: `${m.c}12`,
                padding: "1.5px 5px",
                borderRadius: 5,
                lineHeight: 1.2,
                flexShrink: 0,
                marginLeft: 4,
              }}>
                {m.growth}
              </span>
            </div>

            {/* Middle row: Big metric number */}
            <div style={{ fontSize: 20, fontWeight: 800, color: P.ink, lineHeight: 1.1, marginBottom: 8, letterSpacing: "-0.035em" }}>
              <AnimNum target={m.target} displaySuffix={m.suffix} delay={i * 0.08} />
            </div>

            {/* Bottom row: Smooth curved Bezier mini sparkline */}
            <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-start" }}>
              <MiniSpark values={m.sparkData} color={m.c} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live Big Chart */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <HeroBigChart />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  CARD 5 — Search Everything (cinematic redesign)
 *  Grid area: "srch" — 3/12 cols, row 3 (240px, compact)
 *
 *  Visual-first: glowing dominant search bar + organic scattered tags.
 *  Subtle radial glow + soft particles reinforce AI search feeling.
 * ═══════════════════════════════════════════════════════════════════ */

/* Tags: different sizes + colors for organic scatter feel */
const STAGS = [
  { label: "YouTube Shorts", sz: 11.5, bg: "rgba(167,139,250,0.12)", c: P.violet, fw: 580 },
  { label: "Midjourney", sz: 10.5, bg: "rgba(236,72,153,0.09)", c: "#be185d", fw: 540 },
  { label: "VEO", sz: 13, bg: "rgba(139,92,246,0.13)", c: P.purple, fw: 640 },
  { label: "Marketing", sz: 10, bg: "rgba(167,139,250,0.09)", c: P.lav, fw: 520 },
  { label: "Coding", sz: 12, bg: "rgba(124,58,237,0.09)", c: P.violet, fw: 600 },
  { label: "Product Launch", sz: 10.5, bg: "rgba(236,72,153,0.08)", c: "#be185d", fw: 540 },
];

function CardSearch() {
  const fullText = "Search prompts, templates\u2026";
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCharIdx(prev => (prev + 1) % (fullText.length + 12));
    }, 100);
    return () => clearInterval(id);
  }, []);

  const displayText = fullText.slice(0, Math.min(charIdx, fullText.length));

  return (
    <div style={{ ...CARD_SM, overflow: "hidden" }}>
      {/* Radial glow behind search icon */}
      <div style={{
        position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)",
        width: 180, height: 100,
        background: "radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Compact label + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        {/* Glowing search icon */}
        <div style={{
          width: 30, height: 30, borderRadius: 10,
          background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(167,139,250,0.08) 100%)",
          border: "1px solid rgba(139,92,246,0.18)",
          boxShadow: "0 0 12px rgba(139,92,246,0.20), 0 2px 8px rgba(139,92,246,0.10)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P.purple} strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: P.ink, letterSpacing: "-0.02em" }}>Search Everything</span>
      </div>
      <p style={{ fontSize: 11.5, color: P.g500, margin: "0 0 10px", lineHeight: 1.5 }}>Find any prompt in seconds.</p>

      <motion.div
        animate={{ boxShadow: ["0 0 0 4px rgba(139,92,246,0.04), 0 2px 12px rgba(139,92,246,0.06)", "0 0 0 6px rgba(139,92,246,0.12), 0 2px 18px rgba(139,92,246,0.16)", "0 0 0 4px rgba(139,92,246,0.04), 0 2px 12px rgba(139,92,246,0.06)"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(167,139,250,0.04) 100%)",
          borderRadius: 13,
          border: "1.5px solid rgba(139,92,246,0.18)",
          boxShadow: "0 0 0 4px rgba(139,92,246,0.06), 0 2px 12px rgba(139,92,246,0.08)",
          padding: "10px 14px",
          marginBottom: 12,
        }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={P.purple} strokeWidth="2.2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <span style={{ fontSize: 12, color: P.g400, letterSpacing: "-0.01em", flex: 1 }}>{displayText}<motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} style={{ display: "inline-block", width: 1, height: 13, background: P.purple, marginLeft: 1, verticalAlign: "middle" }} /></span>
        {/* Keyboard shortcut hint */}
        <span style={{
          fontSize: 9.5, color: P.lav, background: "rgba(167,139,250,0.10)",
          padding: "2px 6px", borderRadius: 5, fontWeight: 600, letterSpacing: "0.02em",
        }}>⌘K</span>
      </motion.div>

      {/* Organically scattered tags — different sizes, slight offsets */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
        {STAGS.map((s, i) => (
          <motion.span
            key={s.label}
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 + i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            whileHover={{ scale: 1.05, y: -1 }}
            style={{
              padding: "4px 11px", borderRadius: 999,
              background: s.bg, color: s.c,
              fontSize: s.sz, fontWeight: s.fw,
              cursor: "pointer", letterSpacing: "-0.01em",
              // Subtle Y offset for organic look
              transform: `translateY(${[0, 2, -2, 1, -1, 2][i]}px)`,
              display: "inline-block",
            }}
          >{s.label}</motion.span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  CARD 6 — Vault & Favorites  ← THE PUZZLE PIECE
 *  Grid area: "vault" — appears in rows 3 AND 4 (same 3 cols).
 *  CSS Grid auto-spans it → 3/12 cols × (240+16+400) = 656px tall.
 * ═══════════════════════════════════════════════════════════════════ */
const VCARDS = [
  { title: "Product Launch Campaign", tags: ["Marketing", "ChatGPT"], time: "2 days ago", star: true },
  { title: "VEO Cinematic Scene", tags: ["VEO", "Midjourney"], time: "Yesterday", star: false },
  { title: "SEO Blog Framework", tags: ["Coding", "Content"], time: "3 days ago", star: false },
];

function CardVault() {
  return (
    <div style={CARD}>
      <div style={{
        position: "absolute", top: -50, right: -50, width: 160, height: 160,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 9, background: "rgba(236,72,153,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={P.pink} strokeWidth="1.9">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: P.ink, letterSpacing: "-0.02em" }}>Vault &amp; Favorites</span>
      </div>
      <p style={{ fontSize: 12, color: P.g500, lineHeight: 1.55, margin: "0 0 18px" }}>
        Save and organize your best prompts. Access them anytime.
      </p>

      {/* Stacked prompt cards with depth */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        {VCARDS.map((c, i) => (
          <motion.div key={c.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: [0, -3 - i, 0] }}
            transition={{
              opacity: { delay: 0.08 + i * 0.1, duration: 0.5 },
              y: { duration: 3.5 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 + i * 0.3 },
            }}
            style={{
              background: "#fff", borderRadius: 20,
              border: "1px solid rgba(139,92,246,0.07)",
              boxShadow: `0 ${2 + i * 2}px ${6 + i * 5}px rgba(0,0,0,${0.03 + i * 0.01})`,
              padding: "14px 16px",
              // Scale creates depth / stacked-paper illusion
              transform: `scale(${1 - i * 0.012})`, transformOrigin: "top center",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
              <span style={{ fontSize: 12.5, fontWeight: 650, color: P.ink, letterSpacing: "-0.01em", lineHeight: 1.4, flex: 1 }}>{c.title}</span>
              <motion.svg width="12" height="12" viewBox="0 0 24 24"
                fill={c.star ? P.pink : "none"} stroke={c.star ? P.pink : P.g300} strokeWidth="1.6"
                animate={c.star ? { scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] } : {}}
                transition={c.star ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : {}}
                style={{ flexShrink: 0, marginLeft: 8 }}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </motion.svg>
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
              {c.tags.map(t => (
                <span key={t} style={{ padding: "2px 8px", borderRadius: 999, background: "rgba(139,92,246,0.08)", color: P.violet, fontSize: 9.5, fontWeight: 600 }}>{t}</span>
              ))}
            </div>
            <p style={{ fontSize: 10, color: P.g400, margin: 0 }}>{c.time}</p>
          </motion.div>
        ))}

        {/* View all — anchored to bottom */}
        <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid rgba(139,92,246,0.06)" }}>
          <button style={{
            background: "none", border: "none", padding: 0, cursor: "pointer",
            fontSize: 12, fontWeight: 580, color: P.purple, letterSpacing: "-0.01em",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            View all prompts
            <motion.svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={P.purple} strokeWidth="2"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </motion.svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  CARD 7 — Smart Tags
 *  Grid area: "smart" — 3/12 cols, row 3 (240px, compact)
 * ═══════════════════════════════════════════════════════════════════ */
const VTAGS = [
  { label: "YouTube", bg: "rgba(236,72,153,0.09)", c: "#be185d" },
  { label: "VEO", bg: "rgba(167,139,250,0.10)", c: P.violet },
  { label: "Midjourney", bg: "rgba(139,92,246,0.09)", c: P.purple },
  { label: "Marketing", bg: "rgba(167,139,250,0.08)", c: P.lav },
  { label: "Coding", bg: "rgba(139,92,246,0.07)", c: P.violet },
];

function CardSmartTags() {
  return (
    <div style={CARD_SM}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 9, background: "rgba(167,139,250,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={P.lav} strokeWidth="1.9">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: P.ink, letterSpacing: "-0.02em" }}>Smart Tags</span>
      </div>
      <p style={{ fontSize: 12, color: P.g500, lineHeight: 1.55, margin: "0 0 14px" }}>
        Organize and never lose a prompt.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {VTAGS.map((t, i) => (
          <motion.span key={t.label}
            animate={{ scale: [1, 1.08, 1], y: [0, -2, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
            whileHover={{ scale: 1.12 }}
            style={{
              padding: "5px 12px", borderRadius: 999,
              background: t.bg, color: t.c, fontSize: 11.5, fontWeight: 550, cursor: "pointer", letterSpacing: "-0.01em",
            }}>{t.label}</motion.span>
        ))}
        <motion.span
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            padding: "5px 12px", borderRadius: 999, background: "transparent",
            border: "1.5px dashed rgba(139,92,246,0.22)", color: P.lav,
            fontSize: 11.5, fontWeight: 550, cursor: "pointer",
          }}>+ Add Tag</motion.span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  CARD 8 — Export Anywhere (Prompt Dispatcher & Live Format Studio)
 *  Grid area: "xport" — 3/12 cols, row 3 (240px, compact)
 * ═══════════════════════════════════════════════════════════════════ */

const FORMAT_OPTIONS = [
  {
    id: "md",
    name: "Markdown",
    ext: ".md",
    color: "#8B5CF6",
    code: "# Role: Senior Architect\n> Context: Production ready\nProvide system constraints...",
    badge: "Doc Ready",
  },
  {
    id: "json",
    name: "JSON",
    ext: ".json",
    color: "#6366F1",
    code: '{\n  "role": "system",\n  "prompt": "Optimized...",\n  "temperature": 0.7\n}',
    badge: "API Schema",
  },
  {
    id: "txt",
    name: "Raw",
    ext: ".txt",
    color: "#EC4899",
    code: "Act as Senior Architect. Provide production constraints with benchmarks.",
    badge: "Plain text",
  },
];

function CardExport() {
  const [activeFmt, setActiveFmt] = useState(FORMAT_OPTIONS[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ ...CARD_SM, overflow: "hidden", display: "flex", flexDirection: "column", padding: "18px 20px" }}>
      {/* Background Soft Glow */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 180,
          height: 180,
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: "linear-gradient(135deg, rgba(139,92,246,0.16) 0%, rgba(236,72,153,0.10) 100%)",
              border: "1px solid rgba(139,92,246,0.20)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={P.purple} strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: P.ink, letterSpacing: "-0.02em" }}>
              Export Anywhere
            </span>
          </div>
        </div>

        {/* Live Status Pill */}
        <span
          style={{
            fontSize: 9.5,
            fontWeight: 600,
            color: "#8B5CF6",
            background: "rgba(139,92,246,0.08)",
            border: "1px solid rgba(139,92,246,0.18)",
            padding: "2px 7px",
            borderRadius: 999,
          }}
        >
          {activeFmt.badge}
        </span>
      </div>

      {/* Segmented Format Switcher Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          background: "rgba(0,0,0,0.03)",
          padding: 3,
          borderRadius: 10,
          border: "1px solid rgba(0,0,0,0.04)",
          marginBottom: 10,
        }}
      >
        {FORMAT_OPTIONS.map((f) => {
          const isActive = activeFmt.id === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFmt(f)}
              style={{
                flex: 1,
                padding: "4px 0",
                fontSize: 11,
                fontWeight: isActive ? 650 : 500,
                color: isActive ? P.ink : P.g500,
                background: isActive ? "#FFFFFF" : "transparent",
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
                boxShadow: isActive ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                transition: "all 0.18s ease",
              }}
            >
              <span>{f.name}</span>
              <span
                style={{
                  fontSize: 8.5,
                  fontFamily: "monospace",
                  color: isActive ? f.color : P.g400,
                  opacity: isActive ? 1 : 0.7,
                }}
              >
                {f.ext}
              </span>
            </button>
          );
        })}
      </div>

      {/* Live Format Code / Document Preview Box (Theme-matching light glass) */}
      <div
        style={{
          flex: 1,
          background: "linear-gradient(135deg, rgba(245,243,255,0.75) 0%, rgba(253,244,255,0.85) 100%)",
          border: "1px solid rgba(139,92,246,0.14)",
          borderRadius: 12,
          padding: "9px 11px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
          boxShadow: "inset 0 1px 2px rgba(139,92,246,0.04), 0 2px 8px rgba(139,92,246,0.04)",
        }}
      >
        {/* Top window dots */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ display: "flex", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FB7185" }} />
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FBBF24" }} />
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399" }} />
          </div>
          <span style={{ fontSize: 9, fontFamily: "monospace", color: P.purple, opacity: 0.75, fontWeight: 600 }}>
            prompt{activeFmt.ext}
          </span>
        </div>

        {/* Code / Content */}
        <AnimatePresence mode="wait">
          <motion.pre
            key={activeFmt.id}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.15 }}
            style={{
              margin: 0,
              fontSize: 10.5,
              fontFamily: "ui-monospace, monospace",
              color: "#1E1B4B",
              fontWeight: 500,
              lineHeight: 1.45,
              whiteSpace: "pre-wrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {activeFmt.code}
          </motion.pre>
        </AnimatePresence>

        {/* Bottom Copy / Dispatch Button */}
        <div style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
          <motion.button
            onClick={handleCopy}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              background: copied
                ? "rgba(16,185,129,0.12)"
                : "#8B5CF6",
              border: copied
                ? "1px solid rgba(16,185,129,0.3)"
                : "none",
              color: copied ? "#059669" : "#FFFFFF",
              padding: "4px 10px",
              borderRadius: 8,
              fontSize: 9.5,
              fontWeight: 650,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              boxShadow: copied ? "none" : "0 2px 10px rgba(139,92,246,0.3)",
              transition: "all 0.2s ease",
            }}
          >
            {copied ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Export {activeFmt.ext}</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  CARD 9 — History & Versions  (Premium Redesign)
 *  Grid area: "histy" — 6/12 cols, row 4 (420px)
 *  Design: Apple-tier timeline with diff preview, animated glows,
 *  and a polished restore CTA.
 * ═══════════════════════════════════════════════════════════════════ */
const HIST = [
  { v: "v3", label: "Optimized for VEO", time: "Today, 10:24 AM", active: true, changes: "+2 −1", score: 96 },
  { v: "v2", label: "Improved context", time: "Yesterday, 4:15 PM", active: false, changes: "+5 −3", score: 82 },
  { v: "v1", label: "Initial prompt", time: "May 10, 9:30 AM", active: false, changes: "—", score: 64 },
];

function CardHistory() {
  return (
    <div style={{ ...CARD, padding: "28px" }}>
      {/* Ambient corner glows */}
      <motion.div
        animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.15, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: -60, right: -60, width: 220, height: 220,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <div style={{
        position: "absolute", bottom: -40, left: -40, width: 180, height: 180,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(236,72,153,0.06) 100%)",
          border: "1px solid rgba(139,92,246,0.14)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 12px rgba(139,92,246,0.10)",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P.purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
        </div>
        <div>
          <span style={LBL}>Version Control</span>
          <h3 style={{ fontSize: 20, fontWeight: 780, color: P.ink, margin: 0, letterSpacing: "-0.025em", lineHeight: 1.1 }}>
            History &amp; Versions
          </h3>
        </div>
      </div>

      <p style={{ fontSize: 13.5, color: P.g500, lineHeight: 1.55, margin: "0 0 20px" }}>
        Every change saved. Go back, compare, and improve with one click.
      </p>

      {/* Timeline */}
      <div style={{ position: "relative", paddingLeft: 24, flex: 1 }}>
        {/* Gradient vertical timeline line */}
        <div style={{
          position: "absolute", left: 8, top: 8, bottom: 8, width: 2,
          background: "linear-gradient(to bottom, rgba(139,92,246,0.35) 0%, rgba(139,92,246,0.08) 100%)",
          borderRadius: 999,
        }} />

        {HIST.map((h, i) => (
          <motion.div key={h.v}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "relative", marginBottom: i < HIST.length - 1 ? 16 : 0 }}
          >
            {/* Dot + ping */}
            <div style={{
              position: "absolute", left: -19, top: 14,
              width: 10, height: 10, borderRadius: "50%",
              background: h.active ? P.purple : "rgba(139,92,246,0.18)",
              border: `2.5px solid ${h.active ? P.lav : "rgba(196,181,253,0.28)"}`,
              boxShadow: h.active ? "0 0 12px rgba(139,92,246,0.50)" : "none",
              zIndex: 2,
            }} />
            {h.active && (
              <motion.div
                animate={{ scale: [1, 3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                style={{
                  position: "absolute", left: -19, top: 14,
                  width: 10, height: 10, borderRadius: "50%",
                  background: "rgba(139,92,246,0.20)",
                  pointerEvents: "none", zIndex: 1,
                }}
              />
            )}

            {/* Version card */}
            <motion.div
              whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(139,92,246,0.12)", borderColor: "rgba(139,92,246,0.18)" }}
              style={{
                background: h.active ? "rgba(139,92,246,0.03)" : "#fff",
                border: `1px solid ${h.active ? "rgba(139,92,246,0.12)" : "rgba(9,9,11,0.06)"}`,
                borderRadius: 14, padding: "12px 14px",
                cursor: "pointer", transition: "all 200ms ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 750, padding: "2px 8px", borderRadius: 999,
                    background: h.active ? "rgba(139,92,246,0.12)" : "rgba(0,0,0,0.04)",
                    color: h.active ? P.purple : P.g400,
                  }}>{h.v}</span>
                  <span style={{ fontSize: 13, fontWeight: 620, color: h.active ? P.ink : P.g600, letterSpacing: "-0.01em" }}>{h.label}</span>
                  {h.active && (
                    <motion.span
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        fontSize: 9, fontWeight: 650, padding: "2px 7px", borderRadius: 999,
                        background: "rgba(16,185,129,0.10)", color: "#10B981",
                      }}
                    >Current</motion.span>
                  )}
                </div>
                <span style={{ fontSize: 10.5, color: P.g400, whiteSpace: "nowrap" }}>{h.time}</span>
              </div>

              {/* Inline diff + score */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  fontSize: 10, fontWeight: 600, color: P.g400,
                  fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
                }}>{h.changes}</span>
                <div style={{ flex: 1, height: 3, borderRadius: 999, background: "rgba(139,92,246,0.06)", overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${h.score}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      height: "100%", borderRadius: 999,
                      background: h.score >= 90 ? "linear-gradient(90deg, #8B5CF6, #10B981)" : h.score >= 75 ? "linear-gradient(90deg, #8B5CF6, #A78BFA)" : "rgba(139,92,246,0.25)",
                    }}
                  />
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  color: h.score >= 90 ? "#10B981" : h.score >= 75 ? P.purple : P.g400,
                }}>{h.score}</span>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(139,92,246,0.06)" }}>
        <motion.button
          whileHover={{ scale: 1.01, boxShadow: "0 6px 24px rgba(139,92,246,0.18)" }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: "100%", padding: "11px 0", borderRadius: 12,
            background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.10)",
            color: P.purple, fontSize: 12.5, fontWeight: 650, cursor: "pointer",
            letterSpacing: "-0.01em", transition: "all 160ms ease",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={P.purple} strokeWidth="2" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 4.5 4.5 0 0 0-4.5 4.5" /><path d="M3 3v4.5h4.5" /></svg>
          Restore previous version
        </motion.button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  CARD 10 — Batch Processing  ← HERO CARD
 *  Grid area: "batch" — 6/12 cols, row 4 (400px)
 *  Wide (6 cols = ~608px) × tall (400px) = visually dominant
 * ═══════════════════════════════════════════════════════════════════ */
const STAGES = [
  { label: "Queue", desc: "12 prompts" },
  { label: "Optimize", desc: "Processing" },
  { label: "Export", desc: "Ready" },
];

function CardBatch() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [prog, setProg] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => {
      const id = setInterval(() => setProg(p => {
        if (p >= 100) return 0;
        return p + 0.8;
      }), 22);
      return () => clearInterval(id);
    }, 500);
    return () => clearTimeout(t);
  }, [inView]);

  return (
    <div ref={ref} style={CARD}>
      <div style={{
        position: "absolute", bottom: -60, right: -60, width: 220, height: 220,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <span style={LBL}>Batch</span>
      <h2 style={{ fontSize: 26, fontWeight: 760, color: P.ink, letterSpacing: "-0.025em", lineHeight: 1.18, margin: "0 0 10px" }}>
        Batch Processing
      </h2>
      <p style={{ fontSize: 13.5, color: P.g500, lineHeight: 1.65, margin: "0 0 26px", maxWidth: 480 }}>
        Optimize dozens of prompts at once. What takes hours now takes seconds.
      </p>

      {/* Three stages connected by thin gradient line */}
      <div style={{ position: "relative", display: "flex", gap: 56, marginBottom: 26, paddingLeft: 4 }}>
        {/* connector line */}
        <div style={{
          position: "absolute", top: 16, left: "2%", width: "52%", height: 1,
          background: "linear-gradient(90deg, rgba(139,92,246,0.22) 0%, rgba(236,72,153,0.22) 100%)",
        }} />
        {STAGES.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.15, duration: 0.45 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(139,92,246,0.08)", border: "1.5px solid rgba(139,92,246,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", zIndex: 1,
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={P.purple} strokeWidth="2.2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 12, fontWeight: 660, color: P.g700, margin: "0 0 2px", letterSpacing: "-0.01em" }}>{s.label}</p>
              <p style={{ fontSize: 11, color: P.g400, margin: 0 }}>{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Animated progress bar */}
      <div style={{ marginBottom: 22, maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: P.g500 }}>Processing batch…</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: P.purple }}>{Math.round(prog)}%</span>
        </div>
        <div style={{ height: 4, borderRadius: 999, background: "rgba(139,92,246,0.08)", overflow: "hidden" }}>
          <motion.div style={{ height: "100%", borderRadius: 999, background: GRAD, width: `${prog}%` }} />
        </div>
      </div>

      {/* Gradient CTA button */}
      <motion.button
        whileHover={{ scale: 1.015, boxShadow: "0 8px 32px rgba(139,92,246,0.32)" }}
        whileTap={{ scale: 0.985 }}
        animate={{ backgroundPosition: ["0% 50%", "200% 50%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{
          alignSelf: "flex-start", padding: "14px 32px", borderRadius: 16,
          background: "linear-gradient(90deg, #A78BFA 0%, #8B5CF6 25%, #EC4899 50%, #8B5CF6 75%, #A78BFA 100%)",
          backgroundSize: "200% 100%",
          border: "none", color: "#fff",
          fontSize: 15, fontWeight: 680, cursor: "pointer",
          boxShadow: "0 6px 24px rgba(139,92,246,0.26)", letterSpacing: "-0.01em",
        }}
      >
        Optimize All ✦
      </motion.button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  CARD 11 — Prompt Templates  (Premium Redesign)
 *  Grid area: "tmpl" — 6/12 cols, row 4 (420px)
 *
 *  Design: Apple/Notion-tier template gallery with usage stats,
 *  glassmorphic cards, animated category filters, and a premium CTA.
 * ═══════════════════════════════════════════════════════════════════ */

const TEMPLATES = [
  {
    title: "SEO Blog Writer",
    desc: "Rank-optimized article outlines with keyword density targets",
    category: "Marketing",
    catColor: "#EC4899",
    catBg: "rgba(236,72,153,0.08)",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    uses: "2.4k",
    gradient: "linear-gradient(135deg, rgba(236,72,153,0.06) 0%, rgba(139,92,246,0.03) 100%)",
  },
  {
    title: "Code Reviewer",
    desc: "Deep analysis with security, performance & style feedback",
    category: "Engineering",
    catColor: P.violet,
    catBg: "rgba(124,58,237,0.08)",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={P.violet} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    uses: "1.8k",
    gradient: "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(139,92,246,0.03) 100%)",
  },
  {
    title: "Product Launch",
    desc: "Go-to-market copy, taglines & feature announcements",
    category: "Business",
    catColor: "#F59E0B",
    catBg: "rgba(245,158,11,0.08)",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.71.13-1.65-.63-2.42-.77-.76-1.71-1.34-2.37-.58z" />
        <path d="M12 15l-3-3m0 0l3-3m-3 3h12" />
      </svg>
    ),
    uses: "3.1k",
    gradient: "linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(139,92,246,0.03) 100%)",
  },
  {
    title: "Image Prompt",
    desc: "Cinematic scene descriptions for Midjourney & DALL·E",
    category: "Creative",
    catColor: P.purple,
    catBg: "rgba(139,92,246,0.08)",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={P.purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    uses: "4.7k",
    gradient: "linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(236,72,153,0.03) 100%)",
  },
];

const TCAT_PILLS = [
  { label: "All", active: true, dot: P.purple },
  { label: "Marketing", dot: "#EC4899" },
  { label: "Engineering", dot: P.violet },
  { label: "Creative", dot: P.purple },
  { label: "Business", dot: "#F59E0B" },
];

function CardTemplates() {
  return (
    <div style={{ ...CARD, padding: "28px" }}>
      {/* Ambient background glows */}
      <motion.div
        animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.12, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute", top: -40, right: -40, width: 200, height: 200,
          borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <div style={{
        position: "absolute", bottom: -30, left: "25%", width: 180, height: 180,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: "linear-gradient(135deg, rgba(139,92,246,0.14) 0%, rgba(236,72,153,0.08) 100%)",
          border: "1px solid rgba(139,92,246,0.16)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 12px rgba(139,92,246,0.12)",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={P.purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <div>
          <span style={LBL}>Template Library</span>
          <h3 style={{ fontSize: 20, fontWeight: 780, color: P.ink, margin: 0, letterSpacing: "-0.025em", lineHeight: 1.1 }}>
            Prompt Templates
          </h3>
        </div>
      </div>

      <p style={{ fontSize: 13.5, color: P.g500, lineHeight: 1.55, margin: "0 0 14px" }}>
        Pre-built, expert-crafted templates for every use case. Start fast, customize freely.
      </p>

      {/* Category filter pills with dot indicators */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {TCAT_PILLS.map((cat) => (
          <motion.span
            key={cat.label}
            whileHover={{ scale: 1.06, y: -1 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600,
              cursor: "pointer", letterSpacing: "-0.01em", transition: "all 160ms ease",
              background: cat.active ? P.purple : "rgba(139,92,246,0.04)",
              color: cat.active ? "#fff" : P.g500,
              border: cat.active ? "1px solid transparent" : "1px solid rgba(139,92,246,0.08)",
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            {!cat.active && (
              <span style={{
                width: 5, height: 5, borderRadius: "50%",
                background: cat.dot, flexShrink: 0,
              }} />
            )}
            {cat.label}
          </motion.span>
        ))}
      </div>

      {/* Template cards grid */}
      <div className="bento-tmpl-grid" style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flex: 1,
      }}>
        {TEMPLATES.map((t, i) => (
          <motion.div
            key={t.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{
              y: -4,
              boxShadow: "0 12px 32px rgba(139,92,246,0.14), 0 2px 8px rgba(0,0,0,0.04)",
              borderColor: "rgba(139,92,246,0.22)",
            }}
            style={{
              background: t.gradient,
              border: "1px solid rgba(9,9,11,0.06)",
              borderRadius: 16,
              padding: "16px",
              cursor: "pointer",
              transition: "border-color 200ms ease, box-shadow 200ms ease",
              display: "flex", flexDirection: "column", gap: 6,
              position: "relative", overflow: "hidden",
            }}
          >
            {/* Ambient corner glow */}
            <div style={{
              position: "absolute", top: -12, left: -12, width: 60, height: 60,
              background: `radial-gradient(circle, ${t.catBg} 0%, transparent 70%)`,
              pointerEvents: "none", opacity: 1.2,
            }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: t.catBg, display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0
                }}>
                  {t.icon}
                </div>
                <span style={{
                  padding: "2px 8px", borderRadius: 999,
                  background: t.catBg, color: t.catColor,
                  fontSize: 9.5, fontWeight: 650,
                }}>{t.category}</span>
              </div>
              {/* Usage count */}
              <span style={{
                fontSize: 9.5, fontWeight: 600, color: P.g400,
                display: "flex", alignItems: "center", gap: 3,
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={P.g400} strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                {t.uses}
              </span>
            </div>
            <h4 style={{ fontSize: 13.5, fontWeight: 700, color: P.ink, margin: 0, letterSpacing: "-0.02em" }}>{t.title}</h4>
            <p style={{ fontSize: 11, color: P.g400, margin: 0, lineHeight: 1.45 }}>{t.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(139,92,246,0.06)" }}>
        <motion.button
          whileHover={{ scale: 1.01, boxShadow: "0 6px 24px rgba(139,92,246,0.18)" }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: "100%", padding: "11px 0", borderRadius: 12,
            background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.10)",
            color: P.purple, fontSize: 12.5, fontWeight: 650, cursor: "pointer",
            letterSpacing: "-0.01em", transition: "all 160ms ease",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          Browse all templates
          <motion.svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={P.purple} strokeWidth="2"
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </motion.svg>
        </motion.button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
 *  MAIN SECTION EXPORT
 * ═══════════════════════════════════════════════════════════════════ */
export default function BentoFeatures() {
  return (
    <section id="features" className="bento-section" style={{ background: P.bg, padding: "100px 0 90px", position: "relative", overflow: "hidden" }}>

      <style>{`
        /* ─── Responsive Bento Grid ───────────────────────────────────
           - Desktop (>= 1024px): 12-column precision editorial Bento Grid
           - Tablet (640px - 1023px): 2-column modular Bento Grid
           - Mobile (< 640px): 1-column vertical flow
        ──────────────────────────────────────────────────────────────── */

        /* Tablet Bento Grid (640px - 1023px) */
        @media (min-width: 640px) and (max-width: 1023px) {
          .bento-section { padding: 80px 0 70px !important; }
          .bento-inner   { padding: 0 24px !important; max-width: 100% !important; }
          .bento-head    { margin-bottom: 48px !important; }

          .bento-grid {
            display: grid !important;
            grid-template-areas:
              "role   model"
              "anlyt  anlyt"
              "vault  vault"
              "smart  xport"
              "srch   histy"
              "tmpl   tmpl"
              "cta    cta" !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            grid-template-rows: auto !important;
            gap: 16px !important;
          }

          .bento-grid > * { height: 100% !important; }

          .bento-svg-model  { flex: none !important; width: 100%; aspect-ratio: 460 / 280; }
          .bento-svg-export { flex: none !important; width: 100%; aspect-ratio: 220 / 180; }
          .bento-metrics    { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
        }

        /* Mobile Single-Column Flow (< 640px) */
        @media (max-width: 639px) {
          .bento-section { padding: 60px 0 50px !important; }
          .bento-inner   { padding: 0 16px !important; }
          .bento-head    { margin-bottom: 36px !important; }

          .bento-grid {
            display: grid !important;
            grid-template-areas: none !important;
            grid-template-columns: minmax(0, 1fr) !important;
            grid-template-rows: auto !important;
            gap: 14px !important;
          }
          /* Clear named grid areas for vertical mobile stacking */
          .bento-grid > * { grid-area: auto !important; height: auto !important; }

          .bento-metrics   { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .bento-tmpl-grid { grid-template-columns: minmax(0, 1fr) !important; }

          .bento-svg-model  { flex: none !important; width: 100%; aspect-ratio: 460 / 280; }
          .bento-svg-export { flex: none !important; width: 100%; aspect-ratio: 220 / 190; }
        }
      `}</style>

      {/* Section ambient glows */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "3%", left: "2%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: "5%", right: "3%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.04) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", top: "44%", right: "20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.03) 0%, transparent 65%)" }} />
      </div>

      <div className="bento-inner" style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="bento-head"
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 22 }}>
            <div style={{ width: 22, height: 22, borderRadius: 7, background: GRAD, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sp size={10} c="#fff" />
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: P.purple }}>
              Powerful Features
            </span>
          </div>

          <h2 style={{
            fontSize: "clamp(36px, 4.5vw, 54px)", fontWeight: 800, color: P.ink,
            letterSpacing: "-0.03em", lineHeight: 1.12, margin: "0 0 18px",
          }}>
            Everything you need to prompt{" "}
            <span style={{ background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              like&nbsp;a&nbsp;pro
            </span>
          </h2>

          <p style={{ fontSize: 18, color: P.g500, margin: 0, lineHeight: 1.6, letterSpacing: "-0.01em" }}>
            Built for creators, engineered for results.
          </p>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════
            THE BENTO GRID (RE-DESIGNED & BALANCED)
            ─────────────────────────────────────────
            CardChaining & CardBatch removed.
            Row 1: Style & Role Memory (6 cols) | Multi-Model (6 cols)
            Row 2: Analytics & Score (7 cols)  | Prompt Vault (5 cols)
            Row 3: Smart Tags (4) | Export (4) | Search (4)
            Row 4: History (6 cols) | Templates (6 cols)
            Row 5: CTA Bar (12 cols)
            ══════════════════════════════════════════════════════════ */}
        <div className="bento-grid" style={{
          display: "grid",
          gridTemplateAreas: `
            "role  role  role  role  role  role  model model model model model model"
            "anlyt anlyt anlyt anlyt anlyt anlyt anlyt vault vault vault vault vault"
            "smart smart smart smart xport xport xport xport srch  srch  srch  srch"
            "histy histy histy histy histy histy tmpl  tmpl  tmpl  tmpl  tmpl  tmpl"
            "cta   cta   cta   cta   cta   cta   cta   cta   cta   cta   cta   cta"
          `,
          gridTemplateColumns: "repeat(12, 1fr)",
          gridTemplateRows: "460px 480px 260px 510px auto",
          gap: 16,
        }}>

          {/* ── Row 1: Hero Cards ── */}
          <motion.div custom={0} variants={FU} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} style={{ gridArea: "role" }}>
            <CardStyleRole />
          </motion.div>
          <motion.div custom={1} variants={FU} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} style={{ gridArea: "model" }}>
            <CardMultiModel />
          </motion.div>

          {/* ── Row 2: Analytics & Vault ── */}
          <motion.div custom={2} variants={FU} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} style={{ gridArea: "anlyt" }}>
            <CardAnalytics />
          </motion.div>
          <motion.div custom={3} variants={FU} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} style={{ gridArea: "vault" }}>
            <CardVault />
          </motion.div>

          {/* ── Row 3: Workflow Utilities (3 Cards × 4 Cols) ── */}
          <motion.div custom={4} variants={FU} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} style={{ gridArea: "smart" }}>
            <CardSmartTags />
          </motion.div>
          <motion.div custom={5} variants={FU} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} style={{ gridArea: "xport" }}>
            <CardExport />
          </motion.div>
          <motion.div custom={6} variants={FU} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} style={{ gridArea: "srch" }}>
            <CardSearch />
          </motion.div>

          {/* ── Row 4: History & Templates (2 Cards × 6 Cols) ── */}
          <motion.div custom={7} variants={FU} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} style={{ gridArea: "histy" }}>
            <CardHistory />
          </motion.div>
          <motion.div custom={8} variants={FU} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} style={{ gridArea: "tmpl" }}>
            <CardTemplates />
          </motion.div>

          {/* ── CTA ── */}
          <motion.div custom={10} variants={FU} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} style={{ gridArea: "cta" }}>
            <div style={{
              ...CARD,
              flexDirection: "row", alignItems: "center",
              justifyContent: "space-between", padding: "26px 36px",
              flexWrap: "wrap", gap: 20,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(139,92,246,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Sp size={16} c={P.purple} />
                </div>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 720, color: P.ink, margin: "0 0 4px", letterSpacing: "-0.02em" }}>Start Free. No Credit Card.</p>
                  <p style={{ fontSize: 13, color: P.g500, margin: 0 }}>Analyze 5 prompts per day for free.</p>
                </div>
              </div>

              {/* Button with soft glow behind */}
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", inset: -8,
                  background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
                  borderRadius: 999, filter: "blur(8px)", pointerEvents: "none",
                }} />
                <motion.a href="#get-started"
                  whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.975 }}
                  style={{
                    position: "relative", display: "inline-flex", alignItems: "center", gap: 10,
                    background: P.ink, color: "#fff", borderRadius: 999, padding: "15px 30px",
                    fontSize: 15, fontWeight: 640, textDecoration: "none",
                    boxShadow: "0 4px 20px rgba(13,13,26,0.18)", letterSpacing: "-0.01em", whiteSpace: "nowrap",
                  }}>
                  Enhance your first prompt
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </motion.a>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
