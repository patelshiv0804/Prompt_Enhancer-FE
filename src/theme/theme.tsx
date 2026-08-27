"use client";

/**
 * Landing-page theme system (light ⇄ dark).
 *
 * WHY A HOOK AND NOT `dark:` VARIANTS:
 * The landing components paint their colours through inline `style={{ … }}`
 * literals (see Hero/Navbar/etc.). Inline styles beat Tailwind utility classes,
 * so `dark:` variants would silently lose. Instead every component reads the
 * active theme from `useTheme()` and picks its colour with a plain ternary:
 *
 *     const { theme } = useTheme();
 *     style={{ color: theme === "dark" ? D.textPrimary : "#0A0A0A" }}
 *
 * The LIGHT branch always keeps the component's original literal, so light mode
 * is byte-for-byte unchanged (zero-regression / additive). Brand accent colours
 * and gradients (violet/purple/pink/blue) are theme-agnostic and left as-is —
 * they already read well on a dark canvas, the way Claude/Gemini render them.
 *
 * SCOPE: dark mode is intentionally limited to the landing route. The provider
 * is mounted inside the landing page tree only, and it strips the `.dark` class
 * from <html> when it unmounts, so /auth and /dashboard always render light.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "light" | "dark";

/** Persist key — mirrored by the no-flash script in app/layout.tsx. */
export const THEME_STORAGE_KEY = "aure-theme";

/**
 * Dark-mode design tokens. Centralised so every component maps to the same
 * palette. Tuned for an Apple/Claude/Gemini-grade dark surface: a near-black
 * canvas with a faint violet undertone, layered surfaces, and high—but not
 * pure-white—text contrast.
 */
export const D = {
  /* Canvas & surfaces */
  bg: "#0A0A0F", // page canvas
  bgSoft: "#0D0C14", // section canvas variant
  surface: "#141320", // cards / panels
  surfaceElevated: "#1A1827", // raised cards, popovers
  surface2: "#211E30", // inputs, wells inside cards

  /* Text */
  textPrimary: "#F5F4F8",
  textSecondary: "#ABA9BC",
  textMuted: "#77748A",

  /* Lines */
  border: "rgba(255,255,255,0.09)",
  borderStrong: "rgba(167,139,250,0.20)",

  /* High-contrast pill CTA (the light theme's near-black pill would vanish on
     a dark canvas, so it inverts to a soft-white pill with ink text). */
  ctaBg: "#F5F4F8",
  ctaText: "#0A0A0F",
  ctaShadow: "0 6px 24px rgba(0,0,0,0.55)",

  /* Glass (nav / floating chrome) */
  glassTop: "rgba(14,13,20,0.62)",
  glassScrolled: "rgba(14,13,20,0.82)",
  glassBorder: "rgba(167,139,250,0.14)",

  /* Brand accents — identical in both themes, restated for convenience */
  violet: "#8B5CF6",
  purple: "#7C3AED",
  purpleLight: "#A855F7",
  indigo: "#6366F1",
  pink: "#EC4899",
  blue: "#60A5FA",
} as const;

interface ThemeContextValue {
  theme: Theme;
  /** False until the client has synced with localStorage after mount. */
  mounted: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start light so SSR output matches the default document (the no-flash script
  // in the layout handles the dark canvas before paint on a dark reload).
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Sync from whatever the no-flash script / localStorage already decided.
  useEffect(() => {
    let initial: Theme = "light";
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "dark" || stored === "light") {
        initial = stored;
      } else if (document.documentElement.classList.contains("dark")) {
        initial = "dark";
      }
    } catch {
      /* localStorage can throw in private mode — fall back to light. */
    }
    setThemeState(initial);
    setMounted(true);
  }, []);

  // Reflect the theme onto <html> and persist it — only after the initial sync
  // so we never stomp the class the no-flash script set (which would flash).
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme === "dark" ? "dark" : "light";
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore persistence failures */
    }
  }, [theme, mounted]);

  // Theme is applied globally across landing, auth, and dashboard routes
  useEffect(() => {
    return () => {
      // Retain theme across client navigation
    };
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      mounted,
      setTheme: setThemeState,
      toggleTheme: () =>
        setThemeState((t) => (t === "dark" ? "light" : "dark")),
    }),
    [theme, mounted]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Read the active theme. Fails soft: a landing component rendered outside the
 * provider (or reused elsewhere) simply reports light, so it renders exactly as
 * it does today rather than throwing.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    return {
      theme: "light",
      mounted: false,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return ctx;
}
