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
      className="animate-float"
    >
      <div className="w-[420px] rounded-[18px] border border-gray-200/60 bg-white p-7 shadow-[0_2px_20px_rgba(0,0,0,0.06)] lg:w-[520px]">
        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-[7px] w-[7px] rounded-full bg-[#8B5CF6]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">
            Raw Prompt
          </span>
        </div>

        {/* Prompt Input textarea */}
        <textarea
          className="mb-3 w-full border-0 focus:ring-0 focus:outline-none p-0 resize-none font-mono text-[14px] leading-[1.75] text-gray-700 placeholder-gray-400 bg-transparent min-h-[80px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your prompt here..."
          disabled={isEnhancing}
          maxLength={1000}
        />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[12px] text-gray-300">
            {value.length}/1000
          </span>
          <button
            onClick={onSubmit}
            disabled={isEnhancing || !value.trim()}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-[12px] font-medium text-gray-600 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            id="improve-btn"
          >
            {isEnhancing ? (
              <>
                Enhancing...
                <svg className="animate-spin h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </>
            ) : (
              <>
                Improve
                <span className="text-sm">✨</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export default RawPromptCard;

