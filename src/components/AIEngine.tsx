"use client";

import React from "react";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────
 * AIEngine — Central AURE Brand Logo Orb
 * Displays logo_1.svg with a glowing aura effect
 * at the center of the transformation pipeline.
 * ───────────────────────────────────────────── */

const AIEngine = React.memo(function AIEngine() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col items-center justify-center"
      style={{ willChange: "transform", transform: "translateZ(0)" }}
    >
      {/* Outer pulsing radial glow aura */}
      <motion.div
        className="absolute -inset-14 rounded-full opacity-70 pointer-events-none"
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.55, 0.85, 0.55],
        }}
        transition={{
          repeat: Infinity,
          duration: 3.5,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.30) 0%, rgba(168,85,247,0.15) 40%, rgba(236,72,153,0.05) 60%, transparent 75%)",
        }}
      />

      {/* Inner concentrated glow ring */}
      <motion.div
        className="absolute -inset-4 rounded-full opacity-60 pointer-events-none"
        animate={{
          scale: [0.95, 1.05, 0.95],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          repeat: Infinity,
          duration: 2.5,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.35) 0%, rgba(167,139,250,0.18) 50%, transparent 70%)",
        }}
      />

      {/* Central AURE Logo Badge Container */}
      <motion.div
        whileHover={{ scale: 1.06 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="relative z-10 flex h-[68px] w-[68px] items-center justify-center rounded-2xl bg-white/95 p-2 shadow-[0_8px_24px_rgba(124,58,237,0.20)] border border-purple-200/80 backdrop-blur-xl"
      >
        <img
          src="/logo_1.svg"
          alt="AURE Brand Logo"
          className="h-[38px] w-[38px] object-contain filter drop-shadow-[0_3px_8px_rgba(124,58,237,0.30)]"
        />
      </motion.div>
    </motion.div>
  );
});

export default AIEngine;
