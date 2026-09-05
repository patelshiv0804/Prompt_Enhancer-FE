"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { LogOut, Menu, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme, D } from "@/theme/theme";
import ThemeToggle from "@/components/ThemeToggle";

/* ── Brand tokens (mirrors the homepage / BentoFeatures) ── */
const INK = "#09090B";
const VIOLET = "#7C3AED";
const MUTED = "#6B7280";
const GRAD = "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 55%, #EC4899 100%)";

interface NavItem {
  id: string;
  label: string;
  href: string;
}

/* Each `id` matches a real section id on the homepage, so every link
   smooth-scrolls to a section that actually exists. */
const navLinks: NavItem[] = [
  { id: "extension", label: "Extension", href: "#extension" },
  { id: "transformation-engine", label: "Optimizer", href: "#transformation-engine" },
  { id: "transformation-showcase", label: "Examples", href: "#transformation-showcase" },
  { id: "features", label: "Features", href: "#features" },
  { id: "faq", label: "FAQ", href: "#faq" },
];

/* ═══════════════════════════════════════════════════════════════════
 *  Premium CTA — ink pill matching the Hero button, with an Apple-style
 *  lift + soft purple glow on hover. Driven by framer variants (NOT CSS
 *  :hover) because inline styles win over hover classes in this project.
 *  In dark mode the near-black pill inverts to a soft-white pill so it
 *  stays high-contrast against the dark canvas.
 * ═══════════════════════════════════════════════════════════════════ */
function PremiumCTA({
  href,
  label,
  id,
  onClick,
}: {
  href: string;
  label: string;
  id?: string;
  onClick?: () => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const glow: Variants = {
    rest: { opacity: 0, scale: 0.8 },
    hover: { opacity: 1, scale: 1 },
  };
  const lift: Variants = {
    rest: { y: 0, scale: 1 },
    hover: { y: -1.5, scale: 1.03 },
    tap: { scale: 0.97 },
  };

  return (
    <motion.div
      className="relative"
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileTap="tap"
    >
      {/* Soft purple glow that blooms behind the button on hover */}
      <motion.span
        aria-hidden
        variants={glow}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute -inset-3 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.42) 0%, transparent 70%)",
          filter: "blur(12px)",
        }}
      />
      <motion.div
        variants={lift}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
      >
        <Link
          href={href}
          id={id}
          onClick={onClick}
          className="relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
          style={{
            background: isDark ? D.ctaBg : INK,
            color: isDark ? D.ctaText : "#fff",
            boxShadow: isDark ? D.ctaShadow : "0 6px 22px rgba(13,13,26,0.22)",
            letterSpacing: "-0.01em",
            textDecoration: "none",
          }}
        >
          {label}
          <ArrowRight size={15} />
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("extension");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const isClickScrolling = useRef(false);
  const clickScrollTimer = useRef<NodeJS.Timeout | null>(null);
  const { isAuthenticated, loading, logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  /* Theme-aware text tones (brand VIOLET stays constant across themes). */
  const inkText = isDark ? D.textPrimary : INK;
  const mutedText = isDark ? D.textSecondary : MUTED;
  const skeletonBg = isDark ? "rgba(255,255,255,0.08)" : undefined;

  /* The pill rests on the active section, and glides to whatever the
     cursor is hovering — so it doubles as both hover + active indicator. */
  const highlightId = hoveredId ?? activeId;

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hashId = window.location.hash.replace("#", "");
      if (navLinks.some((n) => n.id === hashId)) {
        setActiveId(hashId);
      }
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
      if (isClickScrolling.current) return;

      const scrollPosition = window.scrollY + 120;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Near the bottom → activate the last section (FAQ)
      if (window.scrollY + windowHeight >= documentHeight - 60) {
        setActiveId(navLinks[navLinks.length - 1].id);
        return;
      }

      let currentSectionId = navLinks[0].id;
      for (const link of navLinks) {
        const el = document.getElementById(link.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            currentSectionId = link.id;
            break;
          }
        }
      }

      setActiveId(currentSectionId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (clickScrollTimer.current) clearTimeout(clickScrollTimer.current);
    };
  }, []);

  const smoothScrollTo = (id: string) => {
    const targetEl = document.getElementById(id);
    if (!targetEl) return;
    const navOffset = 88;
    const offsetPosition =
      targetEl.getBoundingClientRect().top + window.pageYOffset - navOffset;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    window.history.pushState(null, "", `#${id}`);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileOpen(false);
    setActiveId(id);
    isClickScrolling.current = true;
    if (clickScrollTimer.current) clearTimeout(clickScrollTimer.current);

    smoothScrollTo(id);

    clickScrollTimer.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 850);
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // On the landing page, glide to the top instead of a hard route change.
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      e.preventDefault();
      setMobileOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.history.pushState(null, "", "/");
    }
  };

  const renderDesktopAuth = () => {
    if (loading) {
      return (
        <>
          <div
            className="h-5 w-16 animate-pulse rounded-full bg-gray-200/80"
            style={skeletonBg ? { background: skeletonBg } : undefined}
            aria-hidden="true"
          />
          <div
            className="h-10 w-28 animate-pulse rounded-full bg-gray-200/80"
            style={skeletonBg ? { background: skeletonBg } : undefined}
            aria-hidden="true"
          />
        </>
      );
    }

    if (isAuthenticated) {
      return (
        <>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200"
            style={{ color: mutedText }}
          >
            <LogOut size={16} />
            Log out
          </button>
          <PremiumCTA href="/dashboard" id="navbar-cta" label="Open dashboard" />
        </>
      );
    }

    return (
      <>
        <Link
          href="/auth"
          className="text-sm font-medium transition-colors duration-200"
          style={{ color: mutedText }}
        >
          Log in
        </Link>
        <PremiumCTA href="/auth" id="navbar-cta" label="Get started" />
      </>
    );
  };

  const renderMobileAuth = () => {
    if (loading) {
      return (
        <>
          <div
            className="h-10 w-full animate-pulse rounded-lg bg-gray-100"
            style={skeletonBg ? { background: skeletonBg } : undefined}
            aria-hidden="true"
          />
          <div
            className="h-11 w-full animate-pulse rounded-full bg-gray-200/90"
            style={skeletonBg ? { background: skeletonBg } : undefined}
            aria-hidden="true"
          />
        </>
      );
    }

    if (isAuthenticated) {
      return (
        <>
          <button
            type="button"
            className="rounded-xl px-4 py-2.5 text-center text-sm font-medium transition-colors"
            style={{ color: isDark ? D.textSecondary : "#374151" }}
            onClick={() => {
              setMobileOpen(false);
              logout();
            }}
          >
            Log out
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
            style={{
              background: isDark ? D.ctaBg : INK,
              color: isDark ? D.ctaText : "#fff",
              boxShadow: isDark ? D.ctaShadow : "0 6px 22px rgba(13,13,26,0.22)",
            }}
            onClick={() => setMobileOpen(false)}
          >
            Open dashboard
            <ArrowRight size={15} />
          </Link>
        </>
      );
    }

    return (
      <>
        <Link
          href="/auth"
          className="rounded-xl px-4 py-2.5 text-center text-sm font-medium transition-colors"
          style={{ color: isDark ? D.textSecondary : "#374151" }}
          onClick={() => setMobileOpen(false)}
        >
          Log in
        </Link>
        <Link
          href="/auth"
          className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
          style={{
            background: isDark ? D.ctaBg : INK,
            color: isDark ? D.ctaText : "#fff",
            boxShadow: isDark ? D.ctaShadow : "0 6px 22px rgba(13,13,26,0.22)",
          }}
          onClick={() => setMobileOpen(false)}
        >
          Get started
          <ArrowRight size={15} />
        </Link>
      </>
    );
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-[1000] w-full"
      style={{
        backgroundColor: isDark
          ? scrolled
            ? D.glassScrolled
            : D.glassTop
          : scrolled
            ? "rgba(255,255,255,0.85)"
            : "rgba(255,255,255,0.65)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: `1px solid ${
          isDark
            ? scrolled
              ? "rgba(167,139,250,0.16)"
              : "rgba(255,255,255,0.07)"
            : scrolled
              ? "rgba(139,92,246,0.10)"
              : "rgba(9,9,11,0.05)"
        }`,
        boxShadow: scrolled
          ? isDark
            ? "0 10px 30px -12px rgba(0,0,0,0.6)"
            : "0 10px 30px -12px rgba(13,13,26,0.12)"
          : "0 0 0 0 rgba(0,0,0,0)",
        transition:
          "background-color 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease",
      }}
    >
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="shrink-0">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-1.5"
            id="navbar-logo"
          >
            <img src="/logo_1.svg" alt="AURE Logo" className="h-7 w-7 rounded-md object-contain" />
            <span className="text-[17px] font-bold tracking-tight" style={{ color: inkText }}>
              AURE
            </span>
          </Link>
        </motion.div>

        {/* Center Links — Desktop (magic sliding pill) */}
        <div
          className="absolute left-1/2 hidden -translate-x-1/2 items-center lg:flex"
          id="navbar-links"
          onMouseLeave={() => setHoveredId(null)}
        >
          {navLinks.map((link) => {
            const isActive = activeId === link.id;
            const isHot = highlightId === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.id)}
                onMouseEnter={() => setHoveredId(link.id)}
                aria-current={isActive ? "page" : undefined}
                className="relative px-3.5 py-1.5 xl:px-4 xl:py-2 text-sm font-medium"
                style={{
                  color: isActive ? VIOLET : isHot ? inkText : mutedText,
                  fontWeight: isActive ? 600 : 500,
                  letterSpacing: "-0.01em",
                  transition: "color 0.2s ease",
                }}
              >
                {/* The one sliding pill — framer animates it between items */}
                {isHot && (
                  <motion.span
                    layoutId="navMagicPill"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "rgba(139,92,246,0.10)",
                      boxShadow: "inset 0 0 0 1px rgba(139,92,246,0.12)",
                    }}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </a>
            );
          })}
        </div>

        {/* Right side — Desktop */}
        <div className="hidden shrink-0 items-center gap-3 xl:gap-4 lg:flex">
          <ThemeToggle />
          {renderDesktopAuth()}
        </div>

        {/* Mobile & Tablet controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
            style={{ color: isDark ? D.textSecondary : "#4B5563" }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            id="navbar-mobile-toggle"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Dropdown Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden backdrop-blur-xl lg:hidden"
            style={{
              borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#F3F4F6"}`,
              background: isDark ? "rgba(14,13,20,0.96)" : "rgba(255,255,255,0.95)",
            }}
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link) => {
                const isActive = activeId === link.id;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.id)}
                    aria-current={isActive ? "page" : undefined}
                    className="relative rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                    style={{
                      color: isActive ? VIOLET : isDark ? D.textSecondary : "#4B5563",
                      fontWeight: isActive ? 600 : 500,
                      background: isActive ? "rgba(139,92,246,0.08)" : "transparent",
                    }}
                  >
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute left-1 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full"
                        style={{ background: GRAD }}
                      />
                    )}
                    {link.label}
                  </a>
                );
              })}
              <div
                className="mt-2 flex flex-col gap-2 pt-3"
                style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#F3F4F6"}` }}
              >
                {renderMobileAuth()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
