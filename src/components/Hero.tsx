"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import TrustLogos from "./TrustLogos";

/* ─────────────────────────────────────────────
 * Hero — 2-column layout matching reference image.
 *
 * RIGHT SIDE: All center-axis elements share the same CSS center:
 *   left: "50%", transform: "translateX(-50%)"
 *
 * This is the only reliable way to guarantee all elements share
 * the same visual center-X regardless of container width.
 *
 * Platform rings: wrapper at left=50%,top=fixed, children at
 *   translate(-50%,-50%) so each ring's visual center = wrapper's anchor.
 *
 * Beam: SVG drawn in a 100%×100% coordinate space.
 *   Beam is a trapezoid symmetric about cx=50% = viewBox-width/2.
 * ───────────────────────────────────────────── */

/* Shared scene constants (in pixels, matched to actual rendered content) */
const SCENE_H   = 520;   // scene height px
const CARD_TOP  = 72;    // card top Y
const CARD_W    = 290;   // card width
const CARD_H    = 168;   // estimated card rendered height (padding 18+18 + content)
const CARD_BOT  = CARD_TOP + CARD_H;   // ≈ 240 — where beam starts
const CUBE_TOP  = 348;   // cube top Y
const CUBE_H    = 58;    // cube height
const RING_CY   = CUBE_TOP + CUBE_H + 22; // ring center Y ≈ 428

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const translateX = useSpring(x, springConfig);
  const translateY = useSpring(y, springConfig);

  const rotateX = useTransform(translateY, [-15, 15], [5, -5]);
  const rotateY = useTransform(translateX, [-15, 15], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    const maxDistance = 400;
    const targetX = (distanceX / maxDistance) * 15;
    const targetY = (distanceY / maxDistance) * 15;

    x.set(Math.max(-15, Math.min(15, targetX)));
    y.set(Math.max(-15, Math.min(15, targetY)));
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section
      className="relative overflow-hidden bg-white"
      id="hero"
      style={{ minHeight: "calc(100vh - 80px)" }}
    >
      {/* ── Soft ambient background glows ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute" style={{ right: "10%", top: "5%", width: 700, height: 700, background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 65%)" }} />
        <div className="absolute" style={{ right: "30%", top: "45%", width: 400, height: 400, background: "radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 65%)" }} />
        <div className="absolute" style={{ right: "5%", bottom: "5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)" }} />
        {[
          { top: "12%", left: "55%", color: "rgba(139,92,246,0.35)", size: 4 },
          { top: "18%", left: "75%", color: "rgba(236,72,153,0.40)", size: 3 },
          { top: "8%",  left: "85%", color: "rgba(139,92,246,0.25)", size: 5 },
          { top: "30%", left: "60%", color: "rgba(236,72,153,0.30)", size: 3 },
          { top: "55%", left: "90%", color: "rgba(139,92,246,0.30)", size: 4 },
          { top: "70%", left: "52%", color: "rgba(236,72,153,0.25)", size: 3 },
          { top: "22%", left: "95%", color: "rgba(99,102,241,0.35)", size: 4 },
        ].map((p, i) => (
          <div key={i} className="absolute rounded-full" style={{ top: p.top, left: p.left, width: p.size, height: p.size, background: p.color }} />
        ))}
      </div>

      {/* ── Main layout container ── */}
      <div
        className="relative z-10 mx-auto flex w-full max-w-[1400px] items-center px-8 py-10 lg:px-12"
        style={{ minHeight: "calc(100vh - 80px)" }}
      >

        {/* ── LEFT COLUMN (43%) ── */}
        <div style={{ flex: "0 0 43%", maxWidth: "43%" }} className="flex flex-col pr-6">
          {/* Badge */}
          <motion.div className="mb-6 flex items-center gap-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="rounded-full" style={{ width: 6, height: 6, background: "#8B5CF6" }} />
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8B5CF6" }}>
              AI-Powered Prompt Intelligence
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontSize: "clamp(40px, 4.2vw, 64px)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.02em", color: "#0A0A0A", margin: 0 }}
          >
            <span style={{ display: "block" }}>From rough ideas</span>
            <span style={{ display: "block" }}>
              to{" "}
              <span style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 40%, #EC4899 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                remarkable
              </span>
            </span>
            <span style={{ display: "block" }}>results.</span>
          </motion.h1>

          {/* Body text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
            style={{ marginTop: 28, fontSize: 18, lineHeight: 1.6, color: "#667085", maxWidth: 420 }}
          >
            Prompt Enhancer helps you write better prompts so AI can give you better answers.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-wrap items-center gap-4"
            style={{ marginTop: 36 }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
          >
            <a href="#get-started" id="hero-cta-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#0D0D1A", color: "#fff", borderRadius: 999, padding: "14px 28px", fontSize: 15, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", transition: "all 0.2s ease" }}
              className="group hover:bg-gray-800"
            >
              Enhance your prompt
              <ArrowRight size={16} style={{ transition: "transform 0.2s" }} className="group-hover:translate-x-0.5" />
            </a>
            <a href="#how-it-works" id="hero-cta-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "#374151", fontSize: 15, fontWeight: 500, textDecoration: "none" }}
            >
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", border: "1.5px solid #E5E7EB", background: "rgba(255,255,255,0.8)" }}>
                <Play size={12} style={{ marginLeft: 2, color: "#6B7280" }} />
              </span>
              See how it works
            </a>
          </motion.div>

          <TrustLogos />
        </div>

        {/* ── RIGHT COLUMN (57%) ── */}
        <motion.div
          style={{ flex: "0 0 57%", maxWidth: "57%", position: "relative" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
        >
          {/*
           * ════════════════════════════════════════════════════════
           * SCENE: position:relative container, height=520px
           *
           * CENTER AXIS: left="50%", transform="translateX(-50%)"
           *   applies to: card, cube, ring-wrapper
           *
           * This means every element's visual center-X = 50% of the
           * container width, regardless of screen size. ✓
           *
           * BEAM: SVG viewBox matches container (width=100%, height=520).
           * Beam trapezoid is drawn symmetric about svgX=50% = "50vw-of-container".
           * We use a polygon defined as fractions of viewBox width so it scales.
           * ════════════════════════════════════════════════════════
           */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ position: "relative", width: "100%", height: SCENE_H }}
          >

            {/* ── SVG: dotted arcs + taper beam ── */}
            <svg
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}
              viewBox="0 0 600 520"
              preserveAspectRatio="none"
              fill="none"
            >
              {/* Dotted arcs — all originating from / converging on (300, 240) = center of scene */}
              <path d="M300 240 Q400 100 550 80"  stroke="rgba(139,92,246,0.22)" strokeWidth="1.2" strokeDasharray="4 5" fill="none" />
              <path d="M300 240 Q185 100 55 138"  stroke="rgba(139,92,246,0.18)" strokeWidth="1.2" strokeDasharray="4 5" fill="none" />
              <path d="M300 360 Q430 408 550 308" stroke="rgba(236,72,153,0.18)" strokeWidth="1.2" strokeDasharray="4 5" fill="none" />
              <path d="M300 388 Q178 432 60 358"  stroke="rgba(139,92,246,0.15)" strokeWidth="1.2" strokeDasharray="4 5" fill="none" />
              {/* Node dots */}
              <circle cx="418" cy="88"  r="3"   fill="rgba(139,92,246,0.30)" />
              <circle cx="172" cy="106" r="2.5" fill="rgba(139,92,246,0.25)" />
              <circle cx="535" cy="175" r="2"   fill="rgba(236,72,153,0.30)" />
              <circle cx="535" cy="302" r="2.5" fill="rgba(236,72,153,0.25)" />
              <circle cx="68"  cy="353" r="2"   fill="rgba(139,92,246,0.20)" />
              <circle cx="446" cy="390" r="2"   fill="rgba(236,72,153,0.20)" />
              <circle cx="555" cy="82"  r="2"   fill="rgba(139,92,246,0.18)" />
              <circle cx="50"  cy="140" r="2"   fill="rgba(139,92,246,0.18)" />

              {/*
               * TAPER BEAM — symmetric about x=300 (= center of 600-wide viewBox)
               *
               * Card bottom  ≈ Y=240  (top=72, height≈168)
               * Cube top      = Y=348
               *
               * Trapezoid: top edge width=28 (300±14), bottom edge width=18 (300±9)
               * All four X values average to 300. ✓
               */}
              <defs>
                <linearGradient id="beamGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                  <stop offset="0%"   stopColor="rgba(139,92,246,0.40)" />
                  <stop offset="55%"  stopColor="rgba(139,92,246,0.18)" />
                  <stop offset="100%" stopColor="rgba(139,92,246,0.04)" />
                </linearGradient>
                <linearGradient id="coreGrad" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
                  <stop offset="0%"   stopColor="rgba(255,255,255,0.90)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
                </linearGradient>
              </defs>
              {/* Wide glow trapezoid */}
              <path d="M286 240 L291 348 L309 348 L314 240 Z" fill="url(#beamGrad)" />
              {/* 2px bright core highlight */}
              <path d="M299 240 L299.5 348 L300.5 348 L301 240 Z" fill="url(#coreGrad)" opacity="0.65" />
            </svg>

            {/*
             * PLATFORM RINGS
             * Anchor: left="50%", top=RING_CY
             * Each ring: position=absolute, top=0, left=0, transform="translate(-50%,-50%)"
             * → all rings share visual center = (50% of container, RING_CY). ✓
             */}
            <div style={{ position: "absolute", left: "50%", top: RING_CY, zIndex: 5, pointerEvents: "none" }}>
              {/* Outermost */}
              <div style={{ position: "absolute", width: 310, height: 78, borderRadius: "50%", border: "1.5px solid rgba(139,92,246,0.14)", background: "radial-gradient(ellipse, rgba(139,92,246,0.07) 0%, transparent 70%)", top: 0, left: 0, transform: "translate(-50%,-50%)", boxShadow: "0 0 32px rgba(139,92,246,0.09)" }} />
              {/* Middle */}
              <div style={{ position: "absolute", width: 218, height: 55, borderRadius: "50%", border: "1.5px solid rgba(139,92,246,0.22)", background: "radial-gradient(ellipse, rgba(139,92,246,0.10) 0%, transparent 70%)", top: 0, left: 0, transform: "translate(-50%,-50%)", boxShadow: "0 0 22px rgba(139,92,246,0.12)" }} />
              {/* Inner */}
              <div style={{ position: "absolute", width: 128, height: 33, borderRadius: "50%", border: "1.5px solid rgba(139,92,246,0.32)", background: "radial-gradient(ellipse, rgba(139,92,246,0.16) 0%, transparent 70%)", top: 0, left: 0, transform: "translate(-50%,-50%)", boxShadow: "0 0 14px rgba(139,92,246,0.22)" }} />
            </div>

            {/*
             * WHITE CUBE
             * Centering lives on the wrapper div — NOT on motion.div.
             * Framer Motion's y-animation would override translateX(-50%) if both
             * were on the same element, breaking horizontal centering.
             * Wrapper: position + left + translateX(-50%)  → sets center axis
             * motion.div: only owns the float animation (y)
             */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: CUBE_TOP,
                transform: "translateX(-50%)",
                zIndex: 20,
              }}
            >
              <motion.div
                style={{
                  width: CUBE_H,
                  height: CUBE_H,
                  borderRadius: 17,
                  background: "rgba(255,255,255,0.97)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(139,92,246,0.18)",
                  boxShadow: "0 8px 32px rgba(139,92,246,0.28), 0 2px 8px rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" fill="#5B4CF6" />
                </svg>
              </motion.div>
            </div>

            {/*
             * ENHANCED PROMPT CARD
             * Same fix as the cube: centering on the wrapper div, animation on motion.div.
             * Framer Motion's initial/animate y transform would have overridden
             * translateX(-50%) when both lived on the same element.
             */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: CARD_TOP,
                transform: "translateX(-50%)",
                zIndex: 10,
              }}
            >
              {/* Floating & Entrance Wrapper */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: [0, -8, 0] }}
                transition={{
                  opacity: { delay: 0.4, duration: 0.7 },
                  y: { delay: 1.1, duration: 6, repeat: Infinity, ease: "easeInOut" }
                }}
                style={{ position: "relative" }}
              >
                {/* Breathing Glow layer */}
                <motion.div
                  style={{
                    position: "absolute",
                    inset: -15,
                    borderRadius: 24,
                    background: "radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)",
                    filter: "blur(14px)",
                    zIndex: -1,
                    pointerEvents: "none",
                  }}
                  animate={{
                    opacity: [0.8, 1, 0.8],
                    scale: [1, 1.04, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Ambient Sparkles */}
                <motion.svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{
                    position: "absolute",
                    left: "10%",
                    top: "-5%",
                    pointerEvents: "none",
                    zIndex: 12,
                  }}
                  animate={{
                    opacity: [0, 1, 0, 0, 0.8, 0],
                    scale: [0.5, 1, 0.5, 0.5, 0.9, 0.5],
                    x: [0, 20, -15, 10, -5, 0],
                    y: [0, -15, 10, -20, 5, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" fill="#8B5CF6" />
                </motion.svg>

                <motion.svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{
                    position: "absolute",
                    right: "12%",
                    bottom: "-8%",
                    pointerEvents: "none",
                    zIndex: 12,
                  }}
                  animate={{
                    opacity: [0, 0.9, 0, 0, 1, 0],
                    scale: [0.5, 0.8, 0.5, 0.5, 1, 0.5],
                    x: [0, -10, 15, -20, 10, 0],
                    y: [0, 15, -10, 20, -5, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5,
                  }}
                >
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" fill="#D3BDFE" />
                </motion.svg>

                <motion.svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{
                    position: "absolute",
                    right: "-4%",
                    top: "35%",
                    pointerEvents: "none",
                    zIndex: 12,
                  }}
                  animate={{
                    opacity: [0, 0, 0.8, 0, 0.7, 0],
                    scale: [0.5, 0.5, 1, 0.5, 0.8, 0.5],
                    x: [0, 12, -8, 15, -10, 0],
                    y: [0, -8, 12, -5, 8, 0],
                  }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                >
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" fill="#8B5CF6" />
                </motion.svg>

                {/* Main Interactive Card */}
                <motion.div
                  style={{
                    position: "relative",
                    width: CARD_W,
                    background: "rgba(255,255,255,0.94)",
                    backdropFilter: "blur(20px)",
                    borderRadius: 20,
                    border: "1px solid rgba(139,92,246,0.12)",
                    boxShadow: "0 8px 40px rgba(99,102,241,0.12), 0 2px 8px rgba(0,0,0,0.04)",
                    padding: "18px 20px 18px",
                    x: translateX,
                    y: translateY,
                    rotateX: rotateX,
                    rotateY: rotateY,
                    transformStyle: "preserve-3d",
                    transformPerspective: 1000,
                    willChange: "transform",
                    transform: "translateZ(0)",
                  }}
                  animate={{
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {/* Inner AI Magic Sparkles */}
                  <motion.svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50px",
                      pointerEvents: "none",
                      zIndex: 5,
                    }}
                    animate={{
                      opacity: [0, 0.8, 0, 0],
                      scale: [0.6, 1.2, 0.6, 0.6],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2.5,
                      ease: "easeInOut",
                    }}
                  >
                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" fill="#A78BFA" />
                  </motion.svg>

                  <motion.svg
                    width="8"
                    height="8"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{
                      position: "absolute",
                      right: "24px",
                      bottom: "35px",
                      pointerEvents: "none",
                      zIndex: 5,
                    }}
                    animate={{
                      opacity: [0, 0, 0.7, 0],
                      scale: [0.5, 0.5, 1.1, 0.5],
                    }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      repeatDelay: 3.2,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                  >
                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" fill="#C084FC" />
                  </motion.svg>

                  {/* Card header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" fill="#8B5CF6" />
                      </svg>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E" }}>Enhanced Prompt</span>
                    </div>
                    <button style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(139,92,246,0.12)", border: "none", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 600, color: "#7C3AED", cursor: "pointer" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy
                    </button>
                  </div>
                  {/* Content lines */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {/* Line 1 */}
                    <motion.div
                      style={{
                        height: 8,
                        borderRadius: 4,
                        background: "linear-gradient(90deg, rgba(139,92,246,0.12) 0%, rgba(139,92,246,0.12) 30%, rgba(139,92,246,0.35) 50%, rgba(139,92,246,0.12) 70%, rgba(139,92,246,0.12) 100%)",
                        backgroundSize: "200% 100%",
                      }}
                      animate={{
                        backgroundPosition: ["200% 0%", "-200% 0%"],
                        opacity: [0.8, 1, 0.8],
                        width: ["72%", "78%", "72%"],
                      }}
                      transition={{
                        backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" },
                        opacity: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
                        width: { duration: 10, repeat: Infinity, ease: "easeInOut" },
                      }}
                    />
                    {/* Line 2 */}
                    <motion.div
                      style={{
                        height: 8,
                        borderRadius: 4,
                        background: "linear-gradient(90deg, rgba(139,92,246,0.12) 0%, rgba(139,92,246,0.12) 30%, rgba(139,92,246,0.35) 50%, rgba(139,92,246,0.12) 70%, rgba(139,92,246,0.12) 100%)",
                        backgroundSize: "200% 100%",
                      }}
                      animate={{
                        backgroundPosition: ["200% 0%", "-200% 0%"],
                        opacity: [0.8, 1, 0.8],
                        width: ["88%", "95%", "88%"],
                      }}
                      transition={{
                        backgroundPosition: { duration: 3.5, repeat: Infinity, ease: "linear" },
                        opacity: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
                        width: { duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
                      }}
                    />
                    {/* Line 3 */}
                    <motion.div
                      style={{
                        height: 10,
                        borderRadius: 5,
                        background: "linear-gradient(90deg, rgba(99,102,241,0.50) 0%, rgba(99,102,241,0.50) 30%, rgba(255,255,255,0.7) 50%, rgba(139,92,246,0.60) 70%, rgba(139,92,246,0.60) 100%)",
                        backgroundSize: "200% 100%",
                        width: "100%",
                      }}
                      animate={{
                        backgroundPosition: ["200% 0%", "-200% 0%"],
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{
                        backgroundPosition: { duration: 4, repeat: Infinity, ease: "linear" },
                        opacity: { duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
                      }}
                    />
                    {/* Line 4 */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <motion.div
                        style={{
                          flex: 1,
                          height: 10,
                          borderRadius: 5,
                          background: "linear-gradient(90deg, rgba(99,102,241,0.38) 0%, rgba(99,102,241,0.38) 30%, rgba(255,255,255,0.6) 50%, rgba(139,92,246,0.48) 70%, rgba(139,92,246,0.48) 100%)",
                          backgroundSize: "200% 100%",
                        }}
                        animate={{
                          backgroundPosition: ["200% 0%", "-200% 0%"],
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                          backgroundPosition: { duration: 3.2, repeat: Infinity, ease: "linear" },
                          opacity: { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 1.2 },
                        }}
                      />
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" fill="rgba(139,92,246,0.4)" />
                      </svg>
                    </div>
                    {/* Line 5 */}
                    <motion.div
                      style={{
                        height: 10,
                        borderRadius: 5,
                        background: "linear-gradient(90deg, rgba(99,102,241,0.32) 0%, rgba(99,102,241,0.32) 30%, rgba(255,255,255,0.55) 50%, rgba(139,92,246,0.42) 70%, rgba(139,92,246,0.42) 100%)",
                        backgroundSize: "200% 100%",
                      }}
                      animate={{
                        backgroundPosition: ["200% 0%", "-200% 0%"],
                        opacity: [0.8, 1, 0.8],
                        width: ["86%", "92%", "86%"],
                      }}
                      transition={{
                        backgroundPosition: { duration: 4.5, repeat: Infinity, ease: "linear" },
                        opacity: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.6 },
                        width: { duration: 14, repeat: Infinity, ease: "easeInOut", delay: 3 },
                      }}
                    />
                    {/* Line 6 */}
                    <motion.div
                      style={{
                        height: 8,
                        borderRadius: 4,
                        background: "linear-gradient(90deg, rgba(139,92,246,0.10) 0%, rgba(139,92,246,0.10) 30%, rgba(139,92,246,0.30) 50%, rgba(139,92,246,0.10) 70%, rgba(139,92,246,0.10) 100%)",
                        backgroundSize: "200% 100%",
                      }}
                      animate={{
                        backgroundPosition: ["200% 0%", "-200% 0%"],
                        opacity: [0.8, 1, 0.8],
                        width: ["58%", "68%", "58%"],
                      }}
                      transition={{
                        backgroundPosition: { duration: 3.8, repeat: Infinity, ease: "linear" },
                        opacity: { duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 2 },
                        width: { duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                      }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* ── LEFT Floating Cards ── */}

            {/* Clarity +98% */}
            <motion.div
              style={{ position: "absolute", left: "2%", top: 78, width: 128, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", borderRadius: 16, border: "1px solid rgba(139,92,246,0.10)", boxShadow: "0 4px 20px rgba(99,102,241,0.10), 0 1px 4px rgba(0,0,0,0.04)", padding: 14, zIndex: 15 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#8B5CF6" /></svg>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#6B7280" }}>Clarity</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#8B5CF6", lineHeight: 1, marginBottom: 8 }}>+98%</div>
              <svg width="100" height="28" viewBox="0 0 100 28" fill="none">
                <polyline points="2,24 18,18 34,20 50,12 66,8 82,10 100,4" stroke="#8B5CF6" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>

            {/* Relevance +93% */}
            <motion.div
              style={{ position: "absolute", left: "2%", top: 292, width: 128, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", borderRadius: 16, border: "1px solid rgba(96,165,250,0.10)", boxShadow: "0 4px 20px rgba(99,102,241,0.08), 0 1px 4px rgba(0,0,0,0.04)", padding: 14, zIndex: 15 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.75, duration: 0.6 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(96,165,250,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#6B7280" }}>Relevance</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#6366F1", lineHeight: 1, marginBottom: 8 }}>+93%</div>
              <svg width="100" height="28" viewBox="0 0 100 28" fill="none">
                <polyline points="2,22 18,20 34,16 50,18 66,10 82,8 100,6" stroke="#6366F1" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>

            {/* ── RIGHT Floating Cards ── */}

            {/* Impact +87% */}
            <motion.div
              style={{ position: "absolute", right: "2%", top: 72, width: 128, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", borderRadius: 16, border: "1px solid rgba(236,72,153,0.10)", boxShadow: "0 4px 20px rgba(236,72,153,0.08), 0 1px 4px rgba(0,0,0,0.04)", padding: 14, zIndex: 15 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.65, duration: 0.6 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(236,72,153,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="2.5"><polyline points="18 15 12 9 6 15" /></svg>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#6B7280" }}>Impact</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#EC4899", lineHeight: 1, marginBottom: 8 }}>+87%</div>
              <svg width="100" height="28" viewBox="0 0 100 28" fill="none">
                <polyline points="2,26 18,22 34,20 50,16 66,12 82,10 100,6" stroke="#EC4899" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>

            {/* Context Added */}
            <motion.div
              style={{ position: "absolute", right: "2%", top: 278, width: 140, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", borderRadius: 16, border: "1px solid rgba(99,102,241,0.10)", boxShadow: "0 4px 20px rgba(99,102,241,0.08), 0 1px 4px rgba(0,0,0,0.04)", padding: 14, zIndex: 15 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(99,102,241,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#1A1A2E" }}>Context Added</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#6366F1", display: "block", marginBottom: 10 }}>Better responses</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ height: 6, borderRadius: 3, background: "rgba(99,102,241,0.12)", width: "100%" }} />
                <div style={{ height: 6, borderRadius: 3, background: "rgba(99,102,241,0.12)", width: "75%" }} />
                <div style={{ height: 6, borderRadius: 3, background: "rgba(99,102,241,0.08)", width: "58%" }} />
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
