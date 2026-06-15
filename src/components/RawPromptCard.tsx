"use client";

import { motion } from "framer-motion";

export default function RawPromptCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="animate-float"
    >
      <div className="w-[280px] rounded-[16px] border border-gray-200/60 bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)] lg:w-[300px]">
        {/* Header */}
        <div className="mb-3 flex items-center gap-2">
          <div className="h-[6px] w-[6px] rounded-full bg-brand-violet" />
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
            Raw Prompt
          </span>
        </div>

        {/* Prompt text — monospace, two clear lines */}
        <p className="mb-4 font-mono text-[12.5px] leading-[1.7] text-gray-700">
          Create a product launch campaign
          <br />
          for our new AI writing assistant.
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-gray-300">54/500</span>
          <button
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-600 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md active:scale-[0.97]"
            id="improve-btn"
          >
            Improve
            <span className="text-xs">✨</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
