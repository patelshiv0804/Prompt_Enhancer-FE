"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { Play } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
 *  WorksEverywhere — "One Extension. Every AI Tool."
 *
 *  Premium dark section with a radial constellation of floating
 *  AI platform cards connected to a central glowing AURE orb.
 *  Cinematic depth layers, orbital rings, dotted connection lines,
 *  and glass-effect floating brand logos.
 * ═══════════════════════════════════════════════════════════════════ */

/* ── Animation Variants ── */
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ── Platform card data ── */
const platformCards = [
  {
    name: "ChatGPT",
    prompt: "Write a blog about AI productivity",
    icon: <img src="/chatgpt-icon.svg" alt="ChatGPT" width="18" height="18" className="select-none" draggable="false" />,
    brandIcon: <img src="/chatgpt-icon.svg" alt="ChatGPT" width="22" height="22" className="select-none animate-pulse" draggable="false" />
  },
  {
    name: "Claude",
    prompt: "Help me analyze this report",
    icon: <img src="/claude-ai-icon.svg" alt="Claude" width="18" height="18" className="select-none" draggable="false" />,
    brandIcon: <img src="/claude-ai-icon.svg" alt="Claude" width="22" height="22" className="select-none" draggable="false" />
  },
  {
    name: "Gemini",
    prompt: "Explain quantum computing",
    icon: <img src="/google-gemini-icon.svg" alt="Gemini" width="18" height="18" className="select-none" draggable="false" />,
    brandIcon: <img src="/google-gemini-icon.svg" alt="Gemini" width="22" height="22" className="select-none" draggable="false" />
  },
  {
    name: "Perplexity",
    prompt: "What are the top AI trends?",
    icon: <img src="/perplexity-ai-icon.svg" alt="Perplexity" width="18" height="18" className="select-none" draggable="false" />,
    brandIcon: <img src="/perplexity-ai-icon.svg" alt="Perplexity" width="22" height="22" className="select-none" draggable="false" />
  },
  {
    name: "Grok",
    prompt: "Give me ideas for a startup",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#110e30">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    brandIcon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#000">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  },
];

/* ── Spacing and positioning constants ── */
const ORBIT_RADIUS = 280; // Spacing mathematically balanced
const cardAngles = [-90, -158, -22, 142, 38]; // Angles for Top, UL, UR, BL, BR
const cardRotations = [0, -6, 6, 3, -3]; // Subtle tilt
const brandOffsets = [
  { x: 0, y: -50 },   // ChatGPT: directly above card (adjusted for clearance)
  { x: -130, y: -30 }, // Claude: far left
  { x: 130, y: -30 },  // Gemini: far right
  { x: -110, y: 80 },  // Perplexity: far bottom-left
  { x: 110, y: 80 },   // Grok: far bottom-right
];
const floatDurations = [5.5, 6.2, 5.8, 6.5, 5.2];
const floatDelays = [0, 0.8, 0.4, 1.2, 0.6];

/* ── Feature bullet data ── */
const features = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: "Instant Prompt Enhancement",
    desc: "One click. Smarter prompts.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Works Everywhere",
    desc: "ChatGPT, Claude, Gemini, Perplexity & more.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
      </svg>
    ),
    title: "Save & Reuse",
    desc: "Build your personal prompt library.",
  },
];

function degToRad(deg: number) { return (deg * Math.PI) / 180; }

/* ── Connection Line: Animates flowing dots towards the center AURE core ── */
function ConnectionLine({ cx, cy }: { cx: number; cy: number }) {
  const x1 = 380 + cx;
  const y1 = 380 + cy;
  const x2 = 380;
  const y2 = 380;
  return (
    <g>
      {/* Background glow line */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="rgba(139, 92, 246, 0.08)"
        strokeWidth="1.5"
      />
      {/* Animated dotted line (flowing forward to center: dashoffset 24 to 0) */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="rgba(167, 139, 250, 0.35)"
        strokeWidth="1.5"
        strokeDasharray="4 8"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="24;0"
          dur="2s"
          repeatCount="indefinite"
        />
      </line>
    </g>
  );
}

export default function WorksEverywhere() {
  return (
    <section
      className="relative w-full overflow-hidden"
      id="works-everywhere"
      style={{
        background: "linear-gradient(180deg, #070710 0%, #0A0A18 40%, #0C0B1D 70%, #0D0D1A 100%)",
      }}
    >
      {/* ── Keyframe Animations for Orbit and Logo ── */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes rotateOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-rotate-orbit {
          animation: rotateOrbit 40s linear infinite;
        }
      `}} />

      {/* ═══ LAYER 1: Dark Radial Gradient Backgrounds ═══ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Center spotlight behind visual block */}
        <div
          className="absolute"
          style={{
            width: 1000,
            height: 1000,
            top: "50%",
            right: "10%",
            transform: "translate(20%, -50%)",
            background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 40%, transparent 70%)",
          }}
        />
        {/* Secondary soft blue spotlight */}
        <div
          className="absolute"
          style={{
            width: 700,
            height: 700,
            top: "30%",
            right: "22%",
            transform: "translate(0, -30%)",
            background: "radial-gradient(circle, rgba(96,165,250,0.05) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Noise Texture Layer */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.016] mix-blend-overlay">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="weNoiseOverlay">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#weNoiseOverlay)" />
        </svg>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
        className="relative z-10 mx-auto max-w-[1360px] px-6 md:px-12 lg:px-16 py-20 md:py-28 lg:py-36"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[40fr_60fr] gap-12 lg:gap-6 items-center">

          {/* ═══ LEFT COLUMN — Copy & CTA ═══ */}
          <motion.div variants={fadeUp} className="flex flex-col items-start">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
              style={{
                background: "rgba(139, 92, 246, 0.1)",
                border: "1px solid rgba(139, 92, 246, 0.2)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              </svg>
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#A78BFA" }}>
                AURE Extension
              </span>
            </div>

            {/* Headline */}
            <h2
              className="mb-6"
              style={{
                fontSize: "clamp(36px, 5vw, 58px)",
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "#fff",
              }}
            >
              One Extension.
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 40%, #EC4899 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Every AI Tool.
              </span>
            </h2>

            {/* Subtext */}
            <p className="mb-10 max-w-[420px]" style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.45)" }}>
              AURE lives inside the AI tools you already use. Enhance prompts, get better answers, and save
              time—without switching tabs.
            </p>

            {/* Feature bullets */}
            <div className="flex flex-col gap-5 mb-10">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-3.5">
                  <div
                    className="flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: "rgba(139, 92, 246, 0.1)",
                      border: "1px solid rgba(139, 92, 246, 0.15)",
                    }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 650, color: "#fff", marginBottom: 2 }}>{f.title}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-5">
              <a
                href="#get-started"
                id="works-everywhere-cta"
                className="group inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]"
                style={{
                  background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #3B82F6 100%)",
                  color: "#fff",
                  borderRadius: 999,
                  padding: "14px 28px",
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: "none",
                  boxShadow: "0 4px 20px rgba(99, 102, 241, 0.35)",
                  transition: "all 0.2s ease",
                }}
              >
                {/* <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="4" fill="white" />
                  <path d="M12 8 L21.5 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M7.5 16 L3 8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M16 16.5 L12 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg> */}
                <img src="/google-chrome-icon.svg" alt="chrome" width="18" height="18" />
                Add to Chrome – It's Free
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2.5"
                style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
              >
                <span
                  className="flex items-center justify-center"
                  style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.04)" }}
                >
                  <Play size={11} style={{ marginLeft: 1.5, color: "rgba(255,255,255,0.5)" }} />
                </span>
                Watch Demo
              </a>
            </div>
          </motion.div>


          {/* ═══ RIGHT COLUMN — Premium Radial Product Constellation ═══ */}
          <div className="relative w-full hidden lg:flex items-center justify-center min-h-[720px] pt-10">
            {/* 
              Responsive Scaler Box: Scales down the entire 760x760 pixel space dynamically
              on smaller desktop viewports, avoiding any card clumping or edge clipping!
            */}
            <div className="relative w-[760px] h-[760px] flex items-center justify-center scale-[0.7] md:scale-[0.75] lg:scale-[0.72] xl:scale-[0.82] 2xl:scale-95 origin-center transition-transform duration-300 lg:translate-x-12">

              {/* ── LAYER 2: Very large glowing orbital ring ── */}
              <div
                className="absolute rounded-full animate-rotate-orbit pointer-events-none"
                style={{
                  width: ORBIT_RADIUS * 2,
                  height: ORBIT_RADIUS * 2,
                  border: "1.5px solid rgba(139, 92, 246, 0.15)",
                  boxShadow: `
                    0 0 60px rgba(139,92,246,0.05),
                    inset 0 0 40px rgba(139,92,246,0.03)
                  `,
                }}
              />

              {/* ── LAYER 3: Secondary blurred orbit ── */}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: ORBIT_RADIUS * 2 + 100,
                  height: ORBIT_RADIUS * 2 + 100,
                  border: "1px dashed rgba(96, 165, 250, 0.08)",
                  filter: "blur(0.5px)",
                }}
              />

              {/* Inner accent ring */}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 160,
                  height: 160,
                  border: "1px solid rgba(139, 92, 246, 0.1)",
                }}
              />

              {/* ── LAYER 5: Animated dotted connection lines ── */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 760 760">
                {cardAngles.map((angle, i) => {
                  const rad = degToRad(angle);
                  const cx = Math.cos(rad) * ORBIT_RADIUS;
                  const cy = Math.sin(rad) * ORBIT_RADIUS;
                  return <ConnectionLine key={i} cx={cx} cy={cy} />;
                })}
              </svg>

              {/* ── LAYER 4: Center Core Logo & Glowing Spotlight ── */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                {/* Spotlight background */}
                <div
                  className="absolute"
                  style={{
                    width: 300,
                    height: 300,
                    background: "radial-gradient(circle, rgba(139,92,246,0.22) 0%, rgba(99,102,241,0.08) 40%, transparent 70%)",
                    filter: "blur(6px)",
                  }}
                />
              </div>

              {/* Center AURE orb with scale breathing animation */}
              <motion.div
                className="absolute z-30 pointer-events-auto"
                animate={{ scale: [1.0, 1.03, 1.0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div
                  className="relative flex items-center justify-center"
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #161245 0%, #292178 50%, #110E36 100%)",
                    boxShadow: `
                      0 0 0 1.5px rgba(139, 92, 246, 0.35),
                      0 0 35px 5px rgba(139, 92, 246, 0.3),
                      0 12px 36px rgba(0, 0, 0, 0.4)
                    `,
                  }}
                >
                  <img
                    src="/logo_1.svg"
                    alt="AURE Logo"
                    width={48}
                    height={48}
                    className="relative z-10 select-none"
                    style={{ filter: "drop-shadow(0 2px 6px rgba(139,92,246,0.3))" }}
                    draggable="false"
                  />
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)",
                    }}
                  />
                </div>
              </motion.div>

              {/* ── LAYERS 6 & 7: Platforms, Windows & Floating Logos ── */}
              {platformCards.map((card, i) => {
                const angle = cardAngles[i];
                const rad = degToRad(angle);
                const cx = Math.cos(rad) * ORBIT_RADIUS;
                const cy = Math.sin(rad) * ORBIT_RADIUS;
                const rotation = cardRotations[i];

                return (
                  <div
                    key={card.name}
                    className="absolute z-20"
                    style={{
                      left: "50%",
                      top: "50%",
                      transform: `translate(calc(-50% + ${cx}px), calc(-50% + ${cy}px)) rotate(${rotation}deg)`,
                      width: 220,
                    }}
                  >
                    {/* Independent browser card float animation */}
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: floatDurations[i],
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: floatDelays[i],
                      }}
                    >

                      {/* ── LAYER 7: Floating AI Brand Logo Outside the card ── */}
                      <div
                        className="absolute z-40 pointer-events-auto"
                        style={{
                          left: `calc(50% + ${brandOffsets[i].x}px)`,
                          top: brandOffsets[i].y,
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        {/* Independent logo float animation */}
                        <motion.div
                          animate={{ y: [0, -4, 0] }}
                          transition={{
                            duration: floatDurations[i] + 0.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: floatDelays[i] + 0.3,
                          }}
                          className="flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer"
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: "rgba(255, 255, 255, 0.95)",
                            backdropFilter: "blur(6px)",
                            boxShadow: `
                              0 10px 25px rgba(0, 0, 0, 0.15),
                              0 2px 6px rgba(0, 0, 0, 0.08),
                              0 0 0 1px rgba(255, 255, 255, 0.4),
                              0 0 15px rgba(139, 92, 246, 0.1)
                            `,
                          }}
                        >
                          {card.brandIcon}
                        </motion.div>
                      </div>

                      {/* ── LAYER 6: Premium Browser Card ── */}
                      <div
                        className="relative overflow-hidden pointer-events-auto"
                        style={{
                          background: "rgba(255, 255, 255, 0.98)",
                          borderRadius: 22,
                          padding: "14px 16px 24px 16px",
                          boxShadow: `
                            0 20px 50px rgba(0, 0, 0, 0.25),
                            0 8px 24px rgba(0, 0, 0, 0.12),
                            0 0 0 1px rgba(255, 255, 255, 0.2),
                            0 0 35px rgba(139, 92, 246, 0.04)
                          `,
                          border: "1px solid rgba(255, 255, 255, 0.35)",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        {/* Top macOS chrome traffic lights bar */}
                        <div className="flex items-center gap-1.5 mb-3 opacity-40">
                          <div className="w-2 h-2 rounded-full bg-[#FF5F56]" />
                          <div className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
                          <div className="w-2 h-2 rounded-full bg-[#27C93F]" />
                        </div>

                        {/* Card platform header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2.5">
                            {/* Round square brand logo container */}
                            <div
                              className="flex items-center justify-center rounded-lg shadow-sm"
                              style={{
                                width: 30,
                                height: 30,
                                background: card.name === "Grok" ? "#000000" : "#ffffff",
                                border: card.name === "Grok" ? "none" : "1px solid rgba(0,0,0,0.06)",
                                padding: 4
                              }}
                            >
                              {/* Make small Grok logo white if inside black box */}
                              {card.name === "Grok" ? (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="#ffffff">
                                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                              ) : card.icon}
                            </div>
                            <span style={{ fontSize: 13.5, fontWeight: 700, color: "#110e30", letterSpacing: "-0.015em" }}>
                              {card.name}
                            </span>
                          </div>

                          {/* Faux horizontal layout menu lines/dots */}
                          <div className="flex items-center gap-0.5 opacity-20">
                            <div className="w-0.5 h-2.5 bg-[#110e30] rounded-full" />
                            <div className="w-0.5 h-2.5 bg-[#110e30] rounded-full" />
                            <div className="w-0.5 h-2.5 bg-[#110e30] rounded-full" />
                          </div>
                        </div>

                        {/* Card prompt composer card with absolute AURE Popover inside */}
                        <div
                          style={{
                            background: "rgba(249, 250, 251, 0.65)",
                            borderRadius: 12,
                            padding: "14px 14px 48px 14px", // Extra bottom padding for overlap space
                            fontSize: 12.5,
                            color: "#4B5563",
                            lineHeight: 1.5,
                            border: "1px solid #E5E7EB",
                            position: "relative",
                          }}
                        >
                          {card.prompt}

                          {/* ── Floating AURE popover overlay ── */}
                          <div
                            style={{
                              position: "absolute",
                              bottom: -18,
                              right: 10,
                              left: 10,
                              background: "#ffffff",
                              borderRadius: 14,
                              padding: "10px 12px 8px 12px",
                              boxShadow: `
                                0 10px 25px rgba(99,102,241,0.08),
                                0 3px 10px rgba(0,0,0,0.04),
                                0 0 0 1px rgba(0,0,0,0.04)
                              `,
                              border: "1px solid rgba(255,255,255,0.8)",
                              zIndex: 10,
                            }}
                          >
                            {/* Logo + name + sparkle */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5">
                                <svg width="14" height="14" viewBox="0 0 40 40" fill="none">
                                  <defs>
                                    <linearGradient id="aure-a-micro" x1="0" y1="40" x2="40" y2="0">
                                      <stop offset="0%" stopColor="#8B5CF6" />
                                      <stop offset="50%" stopColor="#6366F1" />
                                      <stop offset="100%" stopColor="#EC4899" />
                                    </linearGradient>
                                  </defs>
                                  <path d="M20 4 L36 34 H28 L24.5 26 H15.5 L12 34 H4 L20 4Z M18 21 H22 L20 14 L18 21Z" fill="url(#aure-a-micro)" />
                                </svg>
                                <span style={{ fontSize: 11.5, fontWeight: 800, color: "#110e30" }}>AURE</span>
                              </div>
                              {/* Purple Star Icon */}
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            </div>

                            {/* Enhance Prompt Button */}
                            <div
                              className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-white"
                              style={{
                                background: "#6366F1",
                                fontSize: 10.5,
                                fontWeight: 700,
                                boxShadow: "0 2px 8px rgba(99,102,241,0.2)",
                              }}
                            >
                              {/* Sparkle icon */}
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15 9 22 9 17 14 18.5 21 12 17 5.5 21 7 14 2 9 9 9 12 2" fill="currentColor" />
                              </svg>
                              <span>Enhance Prompt</span>
                            </div>
                          </div>

                        </div>
                      </div>

                    </motion.div>
                  </div>
                );
              })}

              {/* ── LAYER 8: Tiny ambient glowing particles ── */}
              {[
                { x: -140, y: -220, size: 2.5, delay: 0.2, dur: 7 },
                { x: 190, y: -190, size: 2, delay: 1.4, dur: 8 },
                { x: -210, y: 140, size: 3, delay: 0.7, dur: 6.5 },
                { x: 230, y: 160, size: 2.5, delay: 1.9, dur: 7.5 },
                { x: 20, y: 220, size: 2, delay: 0.9, dur: 8 },
              ].map((p, i) => (
                <motion.div
                  key={i}
                  className="absolute pointer-events-none rounded-full"
                  style={{
                    left: "50%",
                    top: "50%",
                    marginLeft: p.x,
                    marginTop: p.y,
                    width: p.size,
                    height: p.size,
                    background: "rgba(167, 139, 250, 0.45)",
                    boxShadow: "0 0 10px rgba(167, 139, 250, 0.4)",
                  }}
                  animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: p.delay }}
                />
              ))}

            </div>
          </div>


          {/* ── Mobile fallback: simple card grid ── */}
          <motion.div
            variants={fadeUp}
            className="lg:hidden grid grid-cols-2 gap-3 w-full"
          >
            {platformCards.slice(0, 4).map((card) => (
              <div
                key={card.name}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 16,
                  padding: "16px",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div style={{ width: 20, height: 20 }}>{card.icon}</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{card.name}</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
                  {card.prompt}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
