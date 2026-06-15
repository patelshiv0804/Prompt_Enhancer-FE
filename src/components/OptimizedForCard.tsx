"use client";

import { motion } from "framer-motion";

const apps = [
  { name: "ChatGPT", color: "#10A37F", icon: <ChatGPTIcon /> },
  { name: "Claude", color: "#D4A574", icon: <ClaudeIcon /> },
  { name: "Gemini", color: "#4285F4", icon: <GeminiIcon /> },
  { name: "Midjourney", color: "#000000", icon: <MidjourneyIcon /> },
  { name: "Cursor", color: "#000000", icon: <CursorIcon /> },
  { name: "Perplexity", color: "#1DA1F2", icon: <PerplexityIcon /> },
];

export default function OptimizedForCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="animate-float-delayed"
    >
      <div className="card-shadow-lg w-[380px] rounded-[20px] border border-gray-100/60 bg-white p-5 lg:w-[420px]">
        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-brand-blue" />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
            Optimized For
          </span>
        </div>

        {/* Grid — 6 columns in a single row like the screenshot */}
        <div className="grid grid-cols-6 gap-2">
          {apps.map((app) => (
            <motion.div
              key={app.name}
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="group flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-gray-100/80 bg-white p-2.5 shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${app.color}14` }}
              >
                {app.icon}
              </div>
              <span className="text-[8px] font-semibold text-gray-500 group-hover:text-gray-700">
                {app.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Minimal App Icons ── */

function ChatGPTIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.998 5.998 0 0 0-3.998 2.9 6.042 6.042 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.05 6.05 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"
        fill="#10A37F"
      />
    </svg>
  );
}

function ClaudeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M16.98 3.39l-6.2 17.21h-2.2L14.77 3.39h2.21zm-6.47 0L4.29 20.6H2.09L8.3 3.39h2.21z"
        fill="#D4A574"
      />
    </svg>
  );
}

function GeminiIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20z"
        fill="url(#gemini-grad)"
      />
      <defs>
        <linearGradient id="gemini-grad" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="50%" stopColor="#9B72CB" />
          <stop offset="100%" stopColor="#D96570" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function MidjourneyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 4l8 4 8-4M4 12l8 4 8-4M4 20l8-4 8 4"
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CursorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 3l14 9-6 2-4 7-4-18z"
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function PerplexityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L2 7v10l10 5 10-5V7L12 2zM12 22V12M22 7L12 12 2 7"
        stroke="#1DA1F2"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
