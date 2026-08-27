"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import RawPromptCard from "./RawPromptCard";
import AIEngine from "./AIEngine";
import AnimatedParticleFlow, {
  ENGINE_CENTER,
  FLOW_WIDTH,
  FLOW_HEIGHT,
} from "./AnimatedParticleFlow";
import { MobileTopFlow, MobileBottomFlow } from "./MobileParticleFlow";
import OptimizedForCard from "./OptimizedForCard";
import { useTheme, D } from "@/theme/theme";

/* ─────────────────────────────────────────────
 * TransformationEngine — The second "page" section.
 *
 * Layout:
 *   - Desktop (>= 1024px): Full-width pipeline visualization
 *     with canvas particle paths converging at exact coordinates.
 *   - Mobile & Tablet (< 1024px): Apple/Notion-grade vertical
 *     energy pipeline with converging and fanning bezier particle
 *     curves, frosted glass cards, and symmetrical model grid.
 * ───────────────────────────────────────────── */

/* Convert SVG-space coordinates to CSS % within the container */
const engineLeftPct = `${(ENGINE_CENTER.x / FLOW_WIDTH) * 100}%`;
const engineTopPct = `${(ENGINE_CENTER.y / FLOW_HEIGHT) * 100}%`;

interface TransformationEngineProps {
  prompt: string;
  setPrompt: (val: string) => void;
  onSubmit: () => void;
  isEnhancing: boolean;
}

export default function TransformationEngine({
  prompt,
  setPrompt,
  onSubmit,
  isEnhancing,
}: TransformationEngineProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: "200px 0px" } // trigger load slightly before it scrolls into view
    );
    const section = sectionRef.current;
    if (section) {
      observer.observe(section);
    }
    return () => {
      if (section) {
        observer.unobserve(section);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#FAFBFC]"
      id="transformation-engine"
      style={{ minHeight: "100vh", background: isDark ? D.bg : undefined }}
    >
      <style>{`
        /* ─── Responsive ───────────────────────────────────────────────
           Every rule lives inside a media query, so the lg-and-up layout
           is untouched. !important is needed where the markup positions
           an element with inline style={{}}, which outranks a class. ──── */

        @media (max-width: 1023px) {
          .te-flow {
            width: 100% !important;
            height: auto !important;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0px;
          }
          .te-card-raw,
          .te-engine,
          .te-card-opt {
            position: static !important;
            transform: none !important;
            translate: none !important;
            width: 100% !important;
            display: flex;
            justify-content: center;
          }
          .te-card-raw > *,
          .te-card-raw > * > * { width: 100% !important; }

          .te-particles { display: none !important; }
          .te-engine-label { display: none !important; }
        }
      `}</style>

      {/* Subtle background gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-[5%] top-[20%] h-[600px] w-[600px] opacity-25"
          style={{
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute right-[15%] bottom-[10%] h-[500px] w-[500px] opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(236, 72, 153, 0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute right-[5%] top-[30%] h-[400px] w-[400px] opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(249, 115, 22, 0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 sm:px-6 py-12 lg:px-12 lg:py-16 flex flex-col items-center">
        {/* ── Centered Header: Section Label + Heading ── */}
        <motion.div
          className="relative z-20 flex flex-col items-center text-center mb-8 sm:mb-12 max-w-2xl px-2"
          initial={{ opacity: 0, y: -25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Section badge */}
          <div className="mb-3 sm:mb-4 flex items-center gap-2 sm:gap-2.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-gradient-to-br from-violet-500 to-purple-600 shadow-[0_2px_8px_rgba(124,58,237,0.3)]">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              </svg>
            </div>
            <span className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400" style={{ color: isDark ? D.textMuted : undefined }}>
              The Transformation Engine
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-[28px] sm:text-[36px] lg:text-[clamp(32px,3.8vw,46px)] font-extrabold leading-[1.2] tracking-tight text-gray-900" style={{ color: isDark ? D.textPrimary : undefined }}>
            One prompt.{" "}
            <span className="gradient-text italic">Optimized everywhere.</span>
          </h2>
        </motion.div>

        {/* ── Full-width AI Visualization Pipeline ── */}
        <motion.div
          className="relative flex w-full items-center justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ delay: 0.2, duration: 1 }}
        >
          {/*
           * The container dimensions match the SVG viewBox exactly (1060×780).
           * All child elements are absolutely positioned on desktop so the engine
           * sits at the convergence point of particle paths.
           */}
          <div
            className="te-flow relative"
            style={{ width: FLOW_WIDTH, height: FLOW_HEIGHT }}
          >
            {/* Particle flow (SVG overlay — covers full container on desktop). */}
            <div className="te-particles">
              {isVisible && <AnimatedParticleFlow />}
            </div>

            {/* Top: Raw Prompt Card — centered horizontally at top */}
            <div className="te-card-raw absolute left-1/2 top-2 z-10 -translate-x-1/2">
              <RawPromptCard
                value={prompt}
                onChange={setPrompt}
                onSubmit={onSubmit}
                isEnhancing={isEnhancing}
              />
            </div>

            {/* ── Mobile & Tablet: Converging Bezier Particle Flow (Input -> Engine) ── */}
            <div className="te-connector-top lg:hidden w-full flex justify-center z-0">
              <MobileTopFlow />
            </div>

            {/* Center: AI Engine — placed at the exact convergence node.
             *  transform: translate(-50%, -50%) centers the hexagon on the point. */}
            <div
              className="te-engine absolute z-10"
              style={{
                left: engineLeftPct,
                top: engineTopPct,
                transform: "translate(-50%, -50%)",
              }}
            >
              <AIEngine />
            </div>

            {/* ── Mobile & Tablet: Fanning Bezier Particle Flow (Engine -> Models) ── */}
            <div className="te-connector-bottom lg:hidden w-full flex justify-center z-0">
              <MobileBottomFlow />
            </div>

            {/* "AI Enhancement Engine" label — positioned to the right of the engine on desktop */}
            <motion.div
              className="te-engine-label absolute z-10 flex items-center gap-2"
              style={{
                left: `calc(${engineLeftPct} + 80px)`,
                top: engineTopPct,
                transform: "translateY(-50%)",
              }}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <svg
                width="60"
                height="38"
                viewBox="0 0 55 35"
                fill="none"
                className="text-gray-300"
                style={{ color: isDark ? D.textMuted : undefined }}
              >
                <path
                  d="M2 32 C 12 32, 25 5, 50 5"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  fill="none"
                />
                <path
                  d="M47 2 L51 5 L47 8"
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                className="whitespace-nowrap text-[14px] italic text-gray-400"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: isDark ? D.textMuted : undefined }}
              >
                AI Enhancement
                <br />
                Engine
              </span>
            </motion.div>

            {/* Bottom: Optimized For Card — centered horizontally at bottom */}
            <div className="te-card-opt absolute bottom-2 left-1/2 z-10 -translate-x-1/2">
              <OptimizedForCard />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
