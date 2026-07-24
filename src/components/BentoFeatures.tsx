"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

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
 *  CARD 3 — Multi-Model Optimization
 *  Grid area: "model" — 5/12 cols, row 2 (520px)
 * ═══════════════════════════════════════════════════════════════════ */
/* Model data — palette strictly purple/lavender/pink per brand rules */
const MODELS = [
  { ab: "GP", name: "ChatGPT", c: P.purple, bg: "rgba(139,92,246,0.10)", pos: { x: 52, y: 68 }, size: 58 },
  { ab: "Cl", name: "Claude", c: P.lav, bg: "rgba(167,139,250,0.10)", pos: { x: 168, y: 32 }, size: 52 },
  { ab: "Ge", name: "Gemini", c: P.violet, bg: "rgba(124,58,237,0.10)", pos: { x: 295, y: 48 }, size: 60 },
  { ab: "Mj", name: "Midjourney", c: P.pink, bg: "rgba(236,72,153,0.10)", pos: { x: 390, y: 22 }, size: 50 },
  { ab: "Ve", name: "VEO", c: "#C084FC", bg: "rgba(192,132,252,0.10)", pos: { x: 80, y: 178 }, size: 46 },
];
/* Central prompt node in SVG coordinates */
const MODEL_CENTER = { x: 230, y: 230 };

function CardMultiModel() {
  return (
    <div style={CARD}>
      {/* Deep ambient glow — bottom-left */}
      <div style={{
        position: "absolute", bottom: -80, left: -80, width: 320, height: 320,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
      {/* Secondary glow — top-right */}
      <div style={{
        position: "absolute", top: -40, right: -40, width: 200, height: 200,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* ── Header (compact — visual takes 70%+) ── */}
      <span style={LBL}>Multi-Model</span>
      <h2 style={{ fontSize: 22, fontWeight: 760, color: P.ink, letterSpacing: "-0.025em", lineHeight: 1.18, margin: "0 0 6px" }}>
        Multi-Model<br />Optimization
      </h2>
      <p style={{ fontSize: 12.5, color: P.g500, lineHeight: 1.6, margin: "0 0 16px" }}>
        Every model has its own language. We craft your prompt to speak fluently to each one.
      </p>

      {/* ── Hero Visual: floating model cards connected to central node ── */}
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        <svg
          viewBox="0 0 460 280"
          width="100%" height="100%"
          fill="none"
          style={{ overflow: "visible", display: "block" }}
        >
          <defs>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(139,92,246,0.28)" />
              <stop offset="100%" stopColor="rgba(139,92,246,0)" />
            </radialGradient>
            <filter id="mBlur">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Central prompt node glow */}
          <circle cx={MODEL_CENTER.x} cy={MODEL_CENTER.y} r={52} fill="url(#centerGlow)" />

          {/* Curved connection lines from each model to center */}
          {MODELS.map((m, i) => {
            const cpx = (m.pos.x + MODEL_CENTER.x) / 2 + (i % 2 === 0 ? 20 : -20);
            const cpy = (m.pos.y + MODEL_CENTER.y) / 2 + (i % 3 === 0 ? -30 : 15);
            return (
              <motion.path
                key={`line-${m.name}`}
                d={`M${m.pos.x},${m.pos.y} Q${cpx},${cpy} ${MODEL_CENTER.x},${MODEL_CENTER.y}`}
                stroke={`${m.c}40`}
                strokeWidth={1.6}
                strokeDasharray="5 6"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1, strokeDashoffset: [0, -22] }}
                transition={{
                  pathLength: { duration: 1.2, delay: 0.15 + i * 0.12, ease: "easeOut" },
                  opacity: { duration: 1.2, delay: 0.15 + i * 0.12, ease: "easeOut" },
                  strokeDashoffset: { duration: 2 + i * 0.3, repeat: Infinity, ease: "linear", delay: 1.5 },
                }}
              />
            );
          })}

          {/* Floating model cards */}
          {MODELS.map((m, i) => {
            const cardW = m.size + 36;
            const cardH = 36;
            return (
              <motion.g
                key={m.name}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1, y: [0, -5 - i * 1.5, 0] }}
                transition={{
                  opacity: { delay: 0.1 + i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
                  scale: { delay: 0.1 + i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
                  y: { duration: 3 + i * 0.6, repeat: Infinity, ease: "easeInOut", delay: 1 + i * 0.3 },
                }}
              >
                {/* card shadow / glow */}
                <rect
                  x={m.pos.x - cardW / 2 - 3} y={m.pos.y - cardH / 2 - 3}
                  width={cardW + 6} height={cardH + 6} rx={16}
                  fill={`${m.c}10`}
                />
                {/* card body */}
                <rect
                  x={m.pos.x - cardW / 2} y={m.pos.y - cardH / 2}
                  width={cardW} height={cardH} rx={12}
                  fill="white"
                  stroke={`${m.c}25`}
                  strokeWidth={1.2}
                />
                {/* avatar circle */}
                <circle
                  cx={m.pos.x - cardW / 2 + 18} cy={m.pos.y}
                  r={9} fill={m.bg}
                />
                {/* abbrev */}
                <text
                  x={m.pos.x - cardW / 2 + 18} y={m.pos.y + 1}
                  fontSize={8} fontWeight="700" fill={m.c}
                  textAnchor="middle" dominantBaseline="middle"
                  fontFamily="system-ui,-apple-system,sans-serif"
                >{m.ab}</text>
                {/* name */}
                <text
                  x={m.pos.x - cardW / 2 + 32} y={m.pos.y + 1}
                  fontSize={9.5} fontWeight="580" fill="#374151"
                  dominantBaseline="middle"
                  fontFamily="system-ui,-apple-system,sans-serif"
                  letterSpacing="-0.2"
                >{m.name}</text>
                {/* live dot */}
                <circle cx={m.pos.x + cardW / 2 - 10} cy={m.pos.y} r={3} fill={m.c} />
              </motion.g>
            );
          })}

          {/* Central "Prompt" node */}
          <motion.g
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: [1, 1.06, 1] }}
            transition={{
              opacity: { delay: 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.7 },
            }}
          >
            <circle cx={MODEL_CENTER.x} cy={MODEL_CENTER.y} r={30} fill="white" stroke="rgba(139,92,246,0.18)" strokeWidth={1.5} />
            <circle cx={MODEL_CENTER.x} cy={MODEL_CENTER.y} r={22} fill="rgba(139,92,246,0.07)" />
            <text
              x={MODEL_CENTER.x} y={MODEL_CENTER.y - 5}
              fontSize={8.5} fontWeight="700" fill={P.purple}
              textAnchor="middle" dominantBaseline="middle"
              fontFamily="system-ui,-apple-system,sans-serif"
              letterSpacing="0.05em"
            >YOUR</text>
            <text
              x={MODEL_CENTER.x} y={MODEL_CENTER.y + 7}
              fontSize={8.5} fontWeight="700" fill={P.purple}
              textAnchor="middle" dominantBaseline="middle"
              fontFamily="system-ui,-apple-system,sans-serif"
              letterSpacing="0.05em"
            >PROMPT</text>
          </motion.g>

          {/* Orbiting particles around center */}
          {[0, 72, 144, 216, 288].map((deg, i) => (
            <motion.circle
              key={`orb${i}`}
              cx={MODEL_CENTER.x + Math.cos((deg * Math.PI) / 180) * 42}
              cy={MODEL_CENTER.y + Math.sin((deg * Math.PI) / 180) * 42}
              r={2}
              fill={i % 2 === 0 ? P.lav : P.pink}
              animate={{ opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 1.8 + i * 0.3, repeat: Infinity, delay: i * 0.25 }}
            />
          ))}

          {/* Floating free particles */}
          {[{ x: 310, y: 145 }, { x: 140, y: 220 }, { x: 380, y: 200 }].map((pt, i) => (
            <motion.circle key={`fp${i}`} cx={pt.x} cy={pt.y} r={2.2}
              fill={i % 2 === 0 ? P.lav : "#C084FC"}
              animate={{ y: [0, -8, 0], opacity: [0.25, 0.55, 0.25] }}
              transition={{ duration: 2.6 + i * 0.6, repeat: Infinity, delay: i * 0.7 }}
            />
          ))}
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
    const duration = 1600;

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

function MiniSpark({ pts, c }: { pts: string; c: string }) {
  return (
    <svg width="60" height="20" viewBox="0 0 60 20" fill="none" style={{ overflow: "visible" }}>
      <motion.polyline
        points={pts}
        stroke={c}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
    </svg>
  );
}

const METRICS = [
  { label: "Prompts Analyzed", target: 1248, suffix: "", c: P.purple, pts: "2,16 12,11 24,13 36,7 48,4 58,2" },
  { label: "Avg. PromptScore", target: 78, suffix: "/100", c: P.lav, pts: "2,14 12,9 24,12 36,5 48,8 58,3" },
  { label: "Tokens Saved", target: 56700, suffix: "", c: P.pink, pts: "2,16 12,13 24,9 36,11 48,5 58,2" },
  { label: "Times Optimized", target: 2341, suffix: "", c: P.violet, pts: "2,17 12,14 24,12 36,10 48,7 58,4" },
];

function HeroBigChart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const data = [8, 12, 10, 16, 22, 18, 28, 26, 36, 42, 38, 54];
  const W = 620, H = 170;
  const mx = 60;
  const px = (i: number) => (i / (data.length - 1)) * W;
  const py = (v: number) => H - (v / mx) * H;
  const linePts = data.map((v, i) => `${px(i)},${py(v)}`).join(" ");
  const areaD = `M${px(0)},${py(data[0])} ${data.map((v, i) => `L${px(i)},${py(v)}`).join(" ")} L${W},${H} L0,${H} Z`;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Chart header with Live Status Indicator */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: P.g700, letterSpacing: "-0.01em" }}>
          Your Optimization Growth
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 999,
            background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.20)",
            fontSize: 10, fontWeight: 700, color: "#059669", letterSpacing: "0.02em"
          }}>
            <span style={{ position: "relative", display: "flex", width: 6, height: 6 }}>
              <motion.span
                animate={{ scale: [1, 2, 1], opacity: [0.75, 0, 0.75] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#10B981" }}
              />
              <span style={{ position: "relative", width: 6, height: 6, borderRadius: "50%", background: "#059669" }} />
            </span>
            LIVE UPDATES
          </div>
          <span style={{ fontSize: 10.5, color: P.g500, background: P.g100, padding: "4px 10px", borderRadius: 999, fontWeight: 500 }}>
            This Month
          </span>
        </div>
      </div>

      {/* The live chart */}
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" fill="none" style={{ overflow: "visible" }}>
        {[40, 80, 120].map(y => (
          <line key={y} x1="0" y1={y} x2={W} y2={y} stroke="rgba(139,92,246,0.06)" strokeWidth={1} strokeDasharray="4 6" />
        ))}
        <defs>
          <linearGradient id="heroAreaG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(139,92,246,0.25)" />
            <stop offset="60%" stopColor="rgba(167,139,250,0.06)" />
            <stop offset="100%" stopColor="rgba(139,92,246,0.00)" />
          </linearGradient>
        </defs>
        {inView && (
          <>
            <motion.path
              d={areaD}
              fill="url(#heroAreaG)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.8 }}
            />
            <motion.polyline
              points={linePts}
              stroke={P.purple}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 1.6, ease: "easeInOut" }}
            />
            {/* Glowing data points along curve */}
            {[4, 7, 9, 11].map(i => (
              <g key={i}>
                <motion.circle
                  cx={px(i)}
                  cy={py(data[i])}
                  r="7"
                  fill="rgba(139,92,246,0.20)"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                />
                <motion.circle
                  cx={px(i)}
                  cy={py(data[i])}
                  r="4"
                  fill="white"
                  stroke={P.purple}
                  strokeWidth="2.5"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.08, duration: 0.35 }}
                />
              </g>
            ))}
          </>
        )}
      </svg>
    </div>
  );
}

function CardAnalytics() {
  return (
    <div style={CARD}>
      {/* Hero ambient glow */}
      <div style={{
        position: "absolute", top: -60, right: -60, width: 300, height: 300,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -40, left: -40, width: 200, height: 200,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <span style={LBL}>Analytics</span>
          <h2 style={{ fontSize: 26, fontWeight: 760, color: P.ink, letterSpacing: "-0.025em", lineHeight: 1.1, margin: "0 0 4px" }}>
            Analytics Dashboard
          </h2>
          <p style={{ fontSize: 13, color: P.g500, lineHeight: 1.5, margin: 0 }}>
            Track prompt performance, quality score, and productivity in real-time.
          </p>
        </div>
      </div>

      {/* 4-column metric cards grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        marginBottom: 20,
      }}>
        {METRICS.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.45 }}
            whileHover={{ y: -3, scale: 1.02 }}
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(250,248,255,0.92) 100%)",
              borderRadius: 18,
              border: `1px solid ${m.c}25`,
              boxShadow: `0 4px 16px rgba(0,0,0,0.03), 0 0 0 1px ${m.c}12`,
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <p style={{ fontSize: 10, color: P.g500, margin: 0, fontWeight: 620, letterSpacing: "0.01em" }}>
                {m.label}
              </p>
              <motion.span animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }} style={{ width: 6, height: 6, borderRadius: "50%", background: m.c, boxShadow: `0 0 6px ${m.c}`, display: "block" }} />
            </div>

            <div style={{ fontSize: 21, fontWeight: 800, color: m.c, lineHeight: 1, marginBottom: 8, letterSpacing: "-0.03em" }}>
              <AnimNum target={m.target} displaySuffix={m.suffix} delay={i * 0.1} />
            </div>

            <div style={{ marginTop: "auto" }}>
              <MiniSpark pts={m.pts} c={m.c} />
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
 *  CARD 8 — Export Anywhere (cinematic redesign)
 *  Grid area: "xport" — 3/12 cols, row 3 (240px, compact)
 *
 *  Visual: radial node network. Center "AURE" node glows.
 *  4 format cards orbit at different depths + angles.
 *  Curved lines connect center → each format.
 *  Particles orbit slowly to imply live data flow.
 * ═══════════════════════════════════════════════════════════════════ */

/* Format nodes: angle (deg from center) + distance + color */
const EXPS = [
  { label: "TXT", sub: "Plain text", c: P.purple, angle: 210, r: 74 },
  { label: "MD", sub: "Markdown", c: P.lav, angle: 320, r: 70 },
  { label: "JSON", sub: "Structured", c: P.violet, angle: 50, r: 78 },
  { label: "Copy", sub: "Clipboard", c: P.pink, angle: 145, r: 68 },
];

function CardExport() {
  /* Convert polar → Cartesian in a 220×200 SVG */
  const CX = 110, CY = 108;
  const toXY = (angle: number, r: number) => ({
    x: CX + r * Math.cos((angle * Math.PI) / 180),
    y: CY + r * Math.sin((angle * Math.PI) / 180),
  });

  return (
    <div style={{ ...CARD_SM, overflow: "hidden" }}>
      {/* Deep radial glow behind the whole card */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 60%, rgba(139,92,246,0.07) 0%, transparent 68%)",
        pointerEvents: "none",
      }} />

      {/* Compact header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 9,
          background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(167,139,250,0.08) 100%)",
          border: "1px solid rgba(139,92,246,0.18)",
          boxShadow: "0 0 10px rgba(139,92,246,0.18)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={P.purple} strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: P.ink, letterSpacing: "-0.02em" }}>Export Anywhere</span>
      </div>
      <p style={{ fontSize: 11.5, color: P.g500, margin: "0 0 6px", lineHeight: 1.5 }}>Your format, always.</p>

      {/* ── Hero SVG: orbital node network ── */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <svg viewBox="0 0 220 190" width="100%" height="100%" fill="none" style={{ overflow: "visible", display: "block" }}>
          <defs>
            <radialGradient id="aureGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(139,92,246,0.25)" />
              <stop offset="100%" stopColor="rgba(139,92,246,0)" />
            </radialGradient>
          </defs>

          {/* Center glow */}
          <circle cx={CX} cy={CY} r={42} fill="url(#aureGlow)" />

          {/* Curved connection lines: center → each format node */}
          {EXPS.map((f, i) => {
            const { x: fx, y: fy } = toXY(f.angle, f.r);
            const cpx = CX + (fx - CX) * 0.5 + (i % 2 === 0 ? 12 : -12);
            const cpy = CY + (fy - CY) * 0.5 + (i % 2 === 0 ? -10 : 10);
            return (
              <motion.path
                key={`ln-${f.label}`}
                d={`M${CX},${CY} Q${cpx},${cpy} ${fx},${fy}`}
                stroke={`${f.c}45`}
                strokeWidth={1.4}
                strokeDasharray="4 5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1, strokeDashoffset: [0, -18] }}
                transition={{
                  pathLength: { duration: 0.9, delay: 0.1 + i * 0.12, ease: "easeOut" },
                  opacity: { duration: 0.9, delay: 0.1 + i * 0.12, ease: "easeOut" },
                  strokeDashoffset: { duration: 1.8 + i * 0.3, repeat: Infinity, ease: "linear", delay: 1.2 },
                }}
              />
            );
          })}

          {/* Format node chips */}
          {EXPS.map((f, i) => {
            const { x: fx, y: fy } = toXY(f.angle, f.r);
            const chipW = 44, chipH = 28;
            return (
              <motion.g
                key={f.label}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1, y: [0, -3 - i * 1.5, 0] }}
                transition={{
                  opacity: { delay: 0.15 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
                  scale: { delay: 0.15 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
                  y: { duration: 3 + i * 0.7, repeat: Infinity, ease: "easeInOut", delay: 1 + i * 0.25 },
                }}
              >
                {/* glow behind chip */}
                <rect x={fx - chipW / 2 - 3} y={fy - chipH / 2 - 3} width={chipW + 6} height={chipH + 6} rx={12} fill={`${f.c}10`} />
                {/* chip body */}
                <rect x={fx - chipW / 2} y={fy - chipH / 2} width={chipW} height={chipH} rx={9}
                  fill="white" stroke={`${f.c}28`} strokeWidth={1.2} />
                {/* format label */}
                <text x={fx} y={fy} fontSize={9.5} fontWeight="700" fill={f.c}
                  textAnchor="middle" dominantBaseline="middle"
                  fontFamily="system-ui,-apple-system,sans-serif" letterSpacing="0.02em">
                  {f.label}
                </text>
              </motion.g>
            );
          })}

          {/* Center AURE node */}
          <motion.g
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: [1, 1.08, 1] }}
            transition={{
              opacity: { delay: 0.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
            }}
          >
            <circle cx={CX} cy={CY} r={24} fill="white" stroke="rgba(139,92,246,0.20)" strokeWidth={1.5} />
            <circle cx={CX} cy={CY} r={17} fill="rgba(139,92,246,0.07)" />
            <text x={CX} y={CY + 1} fontSize={9} fontWeight="800" fill={P.purple}
              textAnchor="middle" dominantBaseline="middle"
              fontFamily="system-ui,-apple-system,sans-serif" letterSpacing="0.03em">AURE</text>
          </motion.g>

          {/* Slowly orbiting particles */}
          {[45, 135, 225, 315].map((deg, i) => (
            <motion.circle
              key={`op${i}`}
              cx={CX + Math.cos((deg * Math.PI) / 180) * 30}
              cy={CY + Math.sin((deg * Math.PI) / 180) * 30}
              r={2}
              fill={i % 2 === 0 ? P.lav : P.pink}
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 1.6 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </svg>
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
      <div style={{
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
    <section id="features" style={{ background: P.bg, padding: "120px 0 100px", position: "relative", overflow: "hidden" }}>

      {/* Section ambient glows */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "3%", left: "2%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: "5%", right: "3%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.04) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", top: "44%", right: "20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.03) 0%, transparent 65%)" }} />
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          style={{ textAlign: "center", marginBottom: 80 }}
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
        <div style={{
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
