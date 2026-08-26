"use client";

import React from "react";
import { motion } from "framer-motion";

interface RawPromptCardProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  isEnhancing: boolean;
}

const RawPromptCard = React.memo(function RawPromptCard({
  value,
  onChange,
  onSubmit,
  isEnhancing,
}: RawPromptCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="animate-float w-full flex justify-center"
    >
      <div className="w-full max-w-[340px] sm:max-w-[440px] lg:w-[520px] rounded-[18px] sm:rounded-[22px] border border-gray-200/60 bg-white/95 p-3.5 sm:p-5 lg:p-7 shadow-[0_4px_28px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.02)] backdrop-blur-xl transition-all duration-300 hover:border-purple-200/80 hover:shadow-[0_8px_32px_rgba(124,58,237,0.08)]">
        {/* Header */}
        <div className="mb-2 sm:mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-[#8B5CF6]"></span>
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
              Raw Prompt
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50/80 border border-purple-100/70 px-2 py-0.5 sm:px-2.5 sm:py-0.5 text-[9px] sm:text-[10px] font-semibold text-purple-600">
            Source Input
          </span>
        </div>

        {/* Prompt Input textarea — borderless and clean */}
        <textarea
          className="mb-1.5 sm:mb-3 w-full border-0 focus:ring-0 focus:outline-none p-0 resize-none font-mono text-[13px] sm:text-[14px] lg:text-[14px] leading-[1.6] text-gray-700 placeholder-gray-400 bg-transparent min-h-[48px] sm:min-h-[64px] lg:min-h-[80px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your prompt here..."
          disabled={isEnhancing}
          maxLength={12000}
        />

        {/* Footer */}
        <div className="flex items-center justify-between pt-0.5 sm:pt-1">
          <span className="font-mono text-[10px] sm:text-[11px] lg:text-[12px] text-gray-300 font-medium">
            {value.length.toLocaleString()}
            <span className="text-gray-300">/12,000</span>
          </span>
          <button
            onClick={onSubmit}
            disabled={isEnhancing || !value.trim()}
            className="group relative inline-flex items-center gap-1.5 rounded-full border border-gray-900/10 bg-gradient-to-b from-gray-900 via-gray-900 to-black px-3.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-[12px] font-semibold text-white shadow-[0_2px_8px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(124,58,237,0.25)] hover:border-purple-400/40 active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed"
            id="improve-btn"
          >
            {isEnhancing ? (
              <>
                <span className="text-gray-200">Enhancing</span>
                <svg className="animate-spin h-3 w-3 text-purple-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </>
            ) : (
              <>
                <span>Improve</span>
                <span className="text-xs sm:text-sm transition-transform duration-200 group-hover:scale-125 group-hover:rotate-12">✨</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export default RawPromptCard;

