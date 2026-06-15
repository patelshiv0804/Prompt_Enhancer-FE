"use client";

import { motion } from "framer-motion";

export default function AIEngine() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col items-center gap-3"
    >
      {/* Radial glow aura behind the card — purple-pink blend */}
      <div
        className="absolute -inset-14 opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.22) 0%, rgba(236,72,153,0.15) 35%, rgba(96,165,250,0.06) 60%, transparent 75%)",
        }}
      />

      {/* White rounded-square card */}
      <div className="relative z-10 flex h-[80px] w-[80px] items-center justify-center rounded-[20px] border border-gray-200/50 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)]">
        {/* 4-point sparkle — filled black, clean concave sides matching target ✦ */}
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="#1a1a1a"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
        </svg>
      </div>

      {/* Label */}
      <span className="relative z-10 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
        AI Engine
      </span>
    </motion.div>
  );
}
