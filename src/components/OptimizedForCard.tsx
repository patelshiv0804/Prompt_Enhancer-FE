"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useIsDark, D } from "@/theme/theme";

/* ─────────────────────────────────────────────
 * OptimizedForCard — Shows all target AI platforms
 * in a single horizontal row matching the reference
 * image layout on desktop (10 across), and a clean
 * symmetrical 5x2 grid on mobile & tablet.
 * ───────────────────────────────────────────── */

const apps = [
  { name: "ChatGPT", icon: "/chatgpt-icon.svg", color: "#10A37F", glow: "rgba(16, 163, 127, 0.45)" },
  { name: "Claude", icon: "/claude-ai-icon.svg", color: "#D97706", glow: "rgba(217, 119, 6, 0.45)" },
  { name: "Gemini", icon: "/google-gemini-icon.svg", color: "#3B82F6", glow: "rgba(59, 130, 246, 0.45)" },
  { name: "Midjourney", icon: "/midjourney-color-icon.svg", color: "#8B5CF6", glow: "rgba(139, 92, 246, 0.45)" },
  { name: "VEO", icon: "/veo-icon.svg", color: "#EF4444", glow: "rgba(239, 68, 68, 0.45)" },
  { name: "Grok", icon: "/grok-icon.svg", color: "#9CA3AF", glow: "rgba(255, 255, 255, 0.35)" },
  { name: "Perplexity", icon: "/perplexity-ai-icon.svg", color: "#06B6D4", glow: "rgba(6, 182, 212, 0.45)" },
  { name: "DeepSeek", icon: "/deepseek-logo-icon.svg", color: "#4F46E5", glow: "rgba(79, 70, 229, 0.45)" },
  { name: "Higgsfield", icon: "/higgsfield-icon.svg", color: "#84CC16", glow: "rgba(132, 204, 22, 0.45)" },
  { name: "DALL·E", icon: "/dalle-icon.svg", color: "#10A37F", glow: "rgba(16, 163, 127, 0.45)" },
];

const OptimizedForCard = React.memo(function OptimizedForCard() {
  const isDark = useIsDark();
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="animate-float-delayed w-full flex justify-center"
    >
      <div className="w-full max-w-[480px] sm:max-w-[580px] lg:max-w-[1000px] rounded-[22px] sm:rounded-[24px] border border-gray-200/60 bg-white/95 p-4 sm:p-6 lg:px-8 lg:py-6 shadow-[0_4px_28px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] backdrop-blur-xl"
        style={{
          background: isDark ? D.surface : undefined,
          borderColor: isDark ? D.border : undefined,
          boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.5)" : undefined,
        }}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500" style={{ color: isDark ? D.textMuted : undefined }}>
              Optimized For
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/60 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600"
            style={{
              background: isDark ? "rgba(16,185,129,0.13)" : undefined,
              borderColor: isDark ? "rgba(16,185,129,0.28)" : undefined,
              color: isDark ? "#6EE7B7" : undefined,
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            All Models Ready
          </span>
        </div>

        {/* Responsive Layout: 5x2 symmetrical grid on Mobile & Tablet, 10-across flex row on Desktop */}
        <div className="te-opt-row grid grid-cols-5 gap-2 sm:gap-3 lg:flex lg:items-center lg:justify-between lg:gap-2">
          {apps.map((app) => {
            const isHovered = hoveredApp === app.name;
            return (
              <div
                key={app.name}
                className="group flex cursor-pointer flex-col items-center gap-1.5 sm:gap-2 rounded-[16px] sm:rounded-2xl p-1.5 sm:p-2.5 active:scale-95"
                onMouseEnter={() => setHoveredApp(app.name)}
                onMouseLeave={() => setHoveredApp(null)}
                style={{
                  background: isHovered
                    ? isDark
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.03)"
                    : "transparent",
                  border: `1px solid ${
                    isHovered
                      ? isDark
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.04)"
                      : "transparent"
                  }`,
                  boxShadow: isHovered && isDark
                    ? "0 4px 16px rgba(0, 0, 0, 0.25)"
                    : undefined,
                  transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                  transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <div
                  className="flex h-11 w-11 sm:h-13 sm:w-13 lg:h-14 lg:w-14 items-center justify-center rounded-[12px] sm:rounded-xl overflow-hidden p-2 sm:p-2.5"
                  style={{
                    background: "#FFFFFF",
                    transform: isHovered ? "translateY(-3px) scale(1.05)" : "translateY(0) scale(1)",
                    borderColor: isHovered
                      ? isDark ? app.color : "rgba(0, 0, 0, 0.14)"
                      : isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.06)",
                    borderWidth: 1,
                    borderStyle: "solid",
                    boxShadow: isHovered
                      ? isDark
                        ? `0 0 22px ${app.glow}, 0 8px 20px rgba(0, 0, 0, 0.5)`
                        : `0 8px 20px rgba(0, 0, 0, 0.08), 0 0 12px ${app.glow}`
                      : isDark
                        ? "0 2px 8px rgba(0, 0, 0, 0.35)"
                        : "0 1px 3px rgba(0, 0, 0, 0.04)",
                    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <img
                    src={app.icon}
                    alt={app.name}
                    className="h-full w-full object-contain select-none"
                    style={{
                      transform: isHovered ? "scale(1.12)" : "scale(1)",
                      transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                    draggable="false"
                  />
                </div>
                <span
                  className="text-center text-[9.5px] sm:text-[10px] lg:text-[10px] leading-tight truncate max-w-full"
                  style={{
                    color: isHovered
                      ? isDark ? "#FFFFFF" : "#111827"
                      : isDark ? D.textMuted : "#9CA3AF",
                    fontWeight: isHovered ? 600 : 500,
                    textShadow: isHovered && isDark ? `0 0 10px ${app.glow}` : undefined,
                    transition: "color 0.2s ease, text-shadow 0.2s ease",
                  }}
                >
                  {app.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
});

export default OptimizedForCard;
