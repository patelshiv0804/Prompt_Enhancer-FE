"use client";

import React from "react";
import { motion } from "framer-motion";

export default function PrivacySection() {
  return (
    <section className="w-full bg-[#FAFBFC] pb-24 pt-6 px-6 md:px-12 lg:px-16" id="privacy-section">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden bg-white border border-gray-200/60 rounded-[28px] p-8 md:p-10 lg:py-8 lg:px-12 shadow-[0_4px_30px_rgba(99,102,241,0.04)] flex flex-col md:flex-row items-center justify-between gap-8 md:gap-6"
        >
          {/* Subtle soft purple background glow on the left */}
          <div
            className="absolute left-0 top-0 bottom-0 pointer-events-none w-1/3 opacity-40"
            style={{
              background:
                "radial-gradient(circle at 10% 50%, rgba(167, 139, 250, 0.15) 0%, transparent 70%)",
            }}
          />

          {/* Left Column: 3D Shield Graphic */}
          <div className="relative z-10 flex items-center justify-center w-[120px] md:w-[140px] h-[120px] md:h-[140px] flex-shrink-0">
            <img
              src="/privacy_shield.png"
              alt="Privacy shield"
              className="w-full h-full object-contain mix-blend-multiply select-none"
              draggable="false"
            />
          </div>

          {/* Middle Column: Copy */}
          <div className="relative z-10 flex-1 text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight mb-2">
              Your privacy is our priority
            </h3>
            <p className="text-[14px] md:text-[15px] leading-relaxed text-gray-500 max-w-[580px]">
              AURE runs locally in your browser. Your prompts and conversations never leave your device.
            </p>
          </div>

          {/* Right Column: Secure Badge */}
          <div className="relative z-10 flex-shrink-0">
            <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-violet-500/5 border border-violet-500/10 shadow-[0_2px_12px_rgba(124,58,237,0.02)]">
              {/* Lock SVG */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7C3AED"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="text-[13px] font-bold tracking-tight text-[#7C3AED]">
                100% Private & Secure
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
