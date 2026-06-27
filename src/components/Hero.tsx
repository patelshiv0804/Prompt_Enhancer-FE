"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import TrustLogos from "./TrustLogos";
import PromptIQUniverse from "./PromptIQUniverse";

export default function Hero() {
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
          { top: "8%", left: "85%", color: "rgba(139,92,246,0.25)", size: 5 },
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
          <PromptIQUniverse />
        </motion.div>
      </div>
    </section>
  );
}
