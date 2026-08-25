"use client";

import React from "react";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────
 * OptimizedForCard — Shows all target AI platforms
 * in a single horizontal row matching the reference
 * image layout. 10 icons across.
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
      className="animate-float-delayed"
    >
      <div className="w-full max-w-[1000px] rounded-[20px] border border-gray-200/60 bg-white/90 px-8 py-6 shadow-[0_2px_24px_rgba(0,0,0,0.06)] backdrop-blur-sm">
        {/* Header */}
        <div className="mb-4 flex items-center gap-2.5">
          <div className="h-[7px] w-[7px] rounded-full bg-red-400" />
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-red-400">
            Optimized For
          </span>
        </div>

        {/* Single row of icons */}
        <div className="te-opt-row flex items-center justify-between gap-2">
          {apps.map((app) => (
            <div
              key={app.name}
              className="group flex cursor-pointer flex-col items-center gap-2 rounded-xl p-3 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.08] hover:bg-gray-50"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow duration-200 group-hover:shadow-md overflow-hidden p-2.5">
                <img
                  src={app.icon}
                  alt={app.name}
                  className="h-full w-full object-contain select-none"
                  draggable="false"
                />
              </div>
              <span className="text-center text-[10px] font-medium leading-tight text-gray-400 transition-colors duration-200 group-hover:text-gray-600">
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
