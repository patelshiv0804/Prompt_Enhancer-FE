"use client";

import { motion } from "framer-motion";
import RawPromptCard from "./RawPromptCard";
import AIEngine from "./AIEngine";
import AnimatedParticleFlow from "./AnimatedParticleFlow";
import OptimizedForCard from "./OptimizedForCard";

/* ─────────────────────────────────────────────
 * TransformationEngine — The second "page" section.
 *
 * Layout matches the reference image:
 *   - Left column: section badge + heading
 *   - Right column: full pipeline visualization
 *     Raw Prompt Card → AI Engine → Optimized For Card
 *     with particle flow lines + "AI Enhancement Engine" label
 * ───────────────────────────────────────────── */

export default function TransformationEngine() {
  return (
    <section
      className="relative overflow-hidden bg-[#FAFBFC]"
      id="transformation-engine"
      style={{ minHeight: "100vh" }}
    >
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

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-6 py-16 lg:flex-row lg:items-start lg:gap-8 lg:px-12 lg:py-20">
        {/* ── Left Column: Section Label + Heading ── */}
        <motion.div
          className="flex flex-shrink-0 flex-col pt-8 lg:w-[280px] lg:pt-16"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Section badge */}
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-gradient-to-br from-violet-500 to-purple-600">
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
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
              The Transformation Engine
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-[clamp(26px,3vw,40px)] font-extrabold leading-[1.15] tracking-tight text-gray-900">
            One prompt.
            <br />
            Optimized{" "}
            <span className="gradient-text italic">everywhere.</span>
          </h2>
        </motion.div>

        {/* ── Right Column: Full AI Visualization Pipeline ── */}
        <motion.div
          className="relative flex flex-1 items-center justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ delay: 0.2, duration: 1 }}
        >
          <div className="relative flex h-[600px] w-[540px] flex-col items-center justify-between py-2">
            {/* Particle flow (SVG overlay) */}
            <AnimatedParticleFlow />

            {/* Top: Raw Prompt Card */}
            <div className="relative z-10">
              <RawPromptCard />
            </div>

            {/* Center: AI Engine with label */}
            <div className="relative z-10 flex items-center gap-6">
              <AIEngine />
              {/* "AI Enhancement Engine" label with curved arrow */}
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <svg
                  width="55"
                  height="35"
                  viewBox="0 0 55 35"
                  fill="none"
                  className="text-gray-300"
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
                  className="whitespace-nowrap text-[13px] italic text-gray-400"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  AI Enhancement
                  <br />
                  Engine
                </span>
              </motion.div>
            </div>

            {/* Bottom: Optimized For Card */}
            <div className="relative z-10">
              <OptimizedForCard />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
