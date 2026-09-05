"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import TrustLogos from "./TrustLogos";
import PromptIQUniverse from "./PromptIQUniverse";
import { useTheme, D } from "@/theme/theme";

export default function Hero() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      id="hero"
      className="hero-shell relative overflow-hidden bg-white"
      style={{ background: isDark ? D.bg : undefined }}
    >
      {/* ── Full-screen 3D canvas (absolute, fills whole hero) ── */}
      <PromptIQUniverse />

      {/* ── Centered text overlay ──
           Absolute on md+ (overlays the canvas, unchanged). On phones it sits
           in normal flow so the section grows with the copy and the CTAs can
           never be pushed under the browser chrome. */}
      <div
        className="relative z-10 flex flex-col items-center justify-start pointer-events-none pb-14 md:absolute md:inset-0 md:pb-0"
        style={{ paddingTop: "clamp(64px, 8vh, 90px)" }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-center gap-2"
        >
          <div className="rounded-full" style={{ width: 6, height: 6, background: "#8B5CF6" }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8B5CF6" }}>
            AI-Powered Prompt Intelligence
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{
            fontSize: "clamp(30px, 5vw, 60px)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            color: isDark ? D.textPrimary : "#0A0A0A",
            margin: 0,
            textAlign: "center",
            maxWidth: 820,
            padding: "0 24px",
          }}
        >
          From rough ideas
          <br />
          to{" "}
          <span className="animated-remarkable-gradient">
            remarkable
          </span>{" "}results.
        </motion.h1>

        {/* CTAs — stacked full-width on phones, inline row from sm up */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex w-full max-w-[360px] flex-col items-center gap-3 px-6 pointer-events-auto sm:w-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4 sm:px-0"
          style={{ marginTop: 34 }}
        >
          <a
            href="#get-started"
            id="hero-cta-primary"
            className="group w-full sm:w-auto"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
              background: isDark ? D.ctaBg : "#0D0D1A", color: isDark ? D.ctaText : "#fff",
              borderRadius: 999, padding: "14px 28px",
              fontSize: 15, fontWeight: 600,
              textDecoration: "none",
              boxShadow: isDark ? D.ctaShadow : "0 4px 20px rgba(0,0,0,0.15)",
              transition: "all 0.2s ease",
            }}
          >
            Enhance your prompt
            <ArrowRight size={16} />
          </a>
          <a
            href="#how-it-works"
            id="hero-cta-secondary"
            className="w-full py-2 sm:w-auto sm:py-0"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
              color: isDark ? D.textSecondary : "#374151", fontSize: 15, fontWeight: 500,
              textDecoration: "none",
            }}
          >
            <span style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 36, height: 36, borderRadius: "50%",
              border: `1.5px solid ${isDark ? D.border : "#E5E7EB"}`,
              background: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.85)",
            }}>
              <Play size={12} style={{ marginLeft: 2, color: isDark ? D.textSecondary : "#6B7280" }} />
            </span>
            See how it works
          </a>
        </motion.div>

        {/* Trust logos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="pointer-events-auto"
        >
          {/* <TrustLogos /> */}
        </motion.div>
      </div>
    </section>
  );
}
