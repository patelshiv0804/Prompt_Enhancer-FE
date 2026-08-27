"use client";

/**
 * The single light ⇄ dark switch for the landing page.
 *
 * A round icon button that cross-fades a sun into a moon (rotate + fade via
 * framer-motion). Styling is theme-aware inline so it reads well on both the
 * light glass nav and the dark glass nav. Uses framer variants rather than CSS
 * :hover because inline styles win over hover classes in this project.
 */

import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/theme/theme";

export default function ThemeToggle({
  className = "",
}: {
  className?: string;
}) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${className}`}
      style={{
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(9,9,11,0.04)",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(9,9,11,0.08)"}`,
        color: isDark ? "#FCD34D" : "#4B5563",
        transition:
          "background 0.35s ease, border-color 0.35s ease, color 0.35s ease",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ y: -10, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 10, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute flex items-center justify-center"
          >
            <Moon size={17} strokeWidth={2} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ y: -10, opacity: 0, rotate: 90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 10, opacity: 0, rotate: -90 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute flex items-center justify-center"
          >
            <Sun size={17} strokeWidth={2} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
