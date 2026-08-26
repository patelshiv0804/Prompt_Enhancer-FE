"use client";

import React from "react";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────
 * OptimizedForCard — Shows all target AI platforms
 * in a single horizontal row matching the reference
 * image layout on desktop (10 across), and a clean
 * symmetrical 5x2 grid on mobile & tablet.
 * ───────────────────────────────────────────── */

const apps = [
  { name: "ChatGPT", icon: "/chatgpt-icon.svg" },
  { name: "Claude", icon: "/claude-ai-icon.svg" },
  { name: "Gemini", icon: "/google-gemini-icon.svg" },
  { name: "Midjourney", icon: "/midjourney-color-icon.svg" },
  { name: "VEO", icon: "/veo-icon.svg" },
  { name: "Grok", icon: "/grok-icon.svg" },
  { name: "Perplexity", icon: "/perplexity-ai-icon.svg" },
  { name: "DeepSeek", icon: "/deepseek-logo-icon.svg" },
  { name: "Higgsfield", icon: "/higgsfield-icon.svg" },
  { name: "DALL·E", icon: "/dalle-icon.svg" },
];

const OptimizedForCard = React.memo(function OptimizedForCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="animate-float-delayed w-full flex justify-center"
    >
      <div className="w-full max-w-[480px] sm:max-w-[580px] lg:max-w-[1000px] rounded-[22px] sm:rounded-[24px] border border-gray-200/60 bg-white/95 p-4 sm:p-6 lg:px-8 lg:py-6 shadow-[0_4px_28px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] backdrop-blur-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">
              Optimized For
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/60 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            All Models Ready
          </span>
        </div>

        {/* Responsive Layout: 5x2 symmetrical grid on Mobile & Tablet, 10-across flex row on Desktop */}
        <div className="te-opt-row grid grid-cols-5 gap-2 sm:gap-3 lg:flex lg:items-center lg:justify-between lg:gap-2">
          {apps.map((app) => (
            <div
              key={app.name}
              className="group flex cursor-pointer flex-col items-center gap-1.5 sm:gap-2 rounded-[14px] sm:rounded-xl p-1.5 sm:p-2.5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-gray-50/80 active:scale-95"
            >
              <div className="flex h-11 w-11 sm:h-13 sm:w-13 lg:h-14 lg:w-14 items-center justify-center rounded-[12px] sm:rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 group-hover:border-gray-200 group-hover:shadow-md overflow-hidden p-2 sm:p-2.5">
                <img
                  src={app.icon}
                  alt={app.name}
                  className="h-full w-full object-contain select-none transition-transform duration-200 group-hover:scale-110"
                  draggable="false"
                />
              </div>
              <span className="text-center text-[9.5px] sm:text-[10px] lg:text-[10px] font-medium leading-tight text-gray-400 transition-colors duration-200 group-hover:text-gray-600 truncate max-w-full">
                {app.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
});

export default OptimizedForCard;
