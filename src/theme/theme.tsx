"use client";

/**
 * App-wide theme system (light ⇄ dark ⇄ system).
 *
 * MODEL (how YouTube / GitHub / next-themes do it):
 * We persist a *preference* — "light" | "dark" | "system" — and derive the
 * *resolved* theme ("light" | "dark") that actually paints:
 *
 *     resolved = preference === "system" ? <OS setting> : preference
 *
 * A brand-new visitor (no stored preference) defaults to "system", so the site
 * matches their operating system on first load, just like YouTube. The moment
 * they pick light or dark from a toggle, that explicit choice is stored and
 * wins forever after. While on "system" we keep listening to the OS and flip
 * the site live if the OS switches (e.g. a phone entering night mode).
 *
 * WHY A HOOK AND NOT `dark:` VARIANTS:
 * The landing/auth/dashboard components paint their colours through inline
 * `style={{ … }}` literals. Inline styles beat Tailwind utility classes, so
 * `dark:` variants would silently lose. Instead every component reads the
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
 * SCOPE: a single provider is mounted once at the app root (src/app/layout.tsx),
 * so the theme is shared *live* across every route — toggling on any page
 * updates all of them in the same session. `theme` keeps its original
 * "light" | "dark" meaning, so existing components need zero changes; the
 * three-way preference (incl. "system") is exposed separately as `preference`.
 *
 * NO-FLASH: the inline bootstrap script in src/app/layout.tsx resolves the same
 * preference (including system → OS) and sets `.dark` on <html> before the first
 * paint. It reads the same localStorage key + matchMedia this provider does, so
 * the DOM the script produces always matches the provider's first client render
 * (no hydration flash). <html> carries suppressHydrationWarning for that reason.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/** The resolved theme that actually paints. */
export type Theme = "light" | "dark";
/** The user's stored preference; "system" follows the OS live. */
export type ThemePreference = "light" | "dark" | "system";

/**
 * Persist key — mirrored by the no-flash script in app/layout.tsx.
 *
 * NOTE: this is deliberately a fresh key (not the old "aure-theme"). An earlier
 * version of this provider auto-persisted the *default* ("light") to storage
 * even when the visitor never chose it, which then looked like an explicit
 * light preference and defeated "follow the system on first visit". Using a new
 * key makes every one of those stale values a clean miss → we correctly fall
 * back to "system". The new provider only ever stores a real preference.
 */
export const THEME_STORAGE_KEY = "aure-theme-preference";

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

/** Read the OS colour-scheme preference. SSR-safe (returns "light"). */
function getSystemTheme(): Theme {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Read the stored preference. Missing or invalid → "system" (the YouTube
 * default: follow the OS until the visitor makes an explicit choice).
 */
function getStoredPreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    /* localStorage can throw in private mode — fall back to system. */
  }
  return "system";
}

/** Collapse a preference to the theme that should paint right now. */
function resolvePreference(pref: ThemePreference): Theme {
  return pref === "system" ? getSystemTheme() : pref;
}

/**
 * In-memory (per page-load) flag: has the user EXPLICITLY chosen a theme since
 * this document loaded? Flipped only by the public mutators (setPreference /
 * toggleTheme), never by the automatic mount-sync or OS-follow.
 *
 * Account-level loaders (e.g. the Settings page, which fetches the saved theme
 * from the backend) read this to avoid clobbering a fresh choice the user just
 * made on another page with a possibly-older server value: while it is true the
 * live provider preference wins. It resets on reload — by then the choice lives
 * in localStorage and has been synced to the account, so the server copy is
 * safe to adopt again (that path seeds a fresh device with the account theme).
 */
let userSelectedThemeThisSession = false;

/** True once the user has explicitly picked a theme since this page loaded. */
export function hasUserSelectedThemeThisSession(): boolean {
  return userSelectedThemeThisSession;
}

interface ThemeContextValue {
  /** Resolved theme that paints — "light" | "dark". Original meaning kept. */
  theme: Theme;
  /** Alias of `theme`, named for clarity where it matters. */
  resolvedTheme: Theme;
  /** The stored preference — "light" | "dark" | "system". */
  preference: ThemePreference;
  /** False until the client has synced with localStorage after mount. */
  mounted: boolean;
  /** Set an explicit preference. Pass "system" to follow the OS live. */
  setPreference: (preference: ThemePreference) => void;
  /**
   * Back-compat setter. Existing callers pass "light" / "dark"; it also accepts
   * "system". Alias of setPreference so old call sites keep working unchanged.
   */
  setTheme: (theme: ThemePreference) => void;
  /** Flip the *resolved* theme to the opposite explicit value (light ⇄ dark). */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start with SSR-safe defaults that match the server-rendered document (no
  // .dark class, "system" preference). The mount effect below syncs to the
  // real stored value — which is exactly what the no-flash script already
  // applied to <html> — so there is no visible change on hydration.
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Sync from whatever the no-flash script / localStorage already decided.
  useEffect(() => {
    const pref = getStoredPreference();
    setPreferenceState(pref);
    setResolvedTheme(resolvePreference(pref));
    setMounted(true);
  }, []);

  // Resolve the preference, and — while on "system" — follow the OS live. The
  // media-query listener is only attached in system mode, so an explicit
  // light/dark choice is never overridden by the OS.
  useEffect(() => {
    if (!mounted) return;
    if (preference !== "system") {
      setResolvedTheme(preference);
      return;
    }
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => setResolvedTheme(mql.matches ? "dark" : "light");
    apply();
    // addEventListener is the modern API; older Safari only has addListener.
    if (mql.addEventListener) {
      mql.addEventListener("change", apply);
      return () => mql.removeEventListener("change", apply);
    }
    mql.addListener(apply);
    return () => mql.removeListener(apply);
  }, [preference, mounted]);

  // Reflect the resolved theme onto <html> — only after the initial sync, so we
  // never stomp the class the no-flash script set (which would cause a flash).
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme === "dark" ? "dark" : "light";
  }, [resolvedTheme, mounted]);

  // Persist the *preference* (not the resolved value), so "system" is remembered
  // as "system" across reloads and keeps following the OS.
  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      /* ignore persistence failures (private mode, quota) */
    }
  }, [preference, mounted]);

  const setPreference = useCallback((pref: ThemePreference) => {
    // An explicit choice on any page — remember it beat the server for this
    // session so an account-settings load can't revert it.
    userSelectedThemeThisSession = true;
    setPreferenceState(pref);
  }, []);

  const toggleTheme = useCallback(() => {
    // The quick toggle always lands on an explicit light/dark (leaving "system"
    // to the Settings menu), flipping whatever is currently showing.
    userSelectedThemeThisSession = true;
    setPreferenceState(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: resolvedTheme,
      resolvedTheme,
      preference,
      mounted,
      setPreference,
      setTheme: setPreference,
      toggleTheme,
    }),
    [resolvedTheme, preference, mounted, setPreference, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Read the active theme. Fails soft: a component rendered outside the provider
 * (or reused elsewhere) simply reports light/system, so it renders exactly as
 * it does today rather than throwing.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === undefined) {
    return {
      theme: "light",
      resolvedTheme: "light",
      preference: "system",
      mounted: false,
      setPreference: () => {},
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return ctx;
}
