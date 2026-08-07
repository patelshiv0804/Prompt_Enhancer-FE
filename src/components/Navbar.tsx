"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  id: string;
  label: string;
  href: string;
}

const navLinks: NavItem[] = [
  { id: "extension", label: "Extension", href: "#extension" },
  { id: "transformation-engine", label: "Optimizer", href: "#transformation-engine" },
  { id: "examples", label: "Examples", href: "#examples" },
  { id: "features", label: "Features", href: "#features" },
  { id: "faq", label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("extension");
  const isClickScrolling = useRef(false);
  const clickScrollTimer = useRef<NodeJS.Timeout | null>(null);
  const { isAuthenticated, loading, logout } = useAuth();

  useEffect(() => {
    // Check initial hash on load if present
    if (typeof window !== "undefined" && window.location.hash) {
      const hashId = window.location.hash.replace("#", "");
      if (navLinks.some((n) => n.id === hashId)) {
        setActiveId(hashId);
      }
    }

    const handleScroll = () => {
      if (isClickScrolling.current) return;

      const scrollPosition = window.scrollY + 120;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // If scrolled near bottom of page, activate last section (FAQ)
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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setMobileOpen(false);
    setActiveId(id);
    isClickScrolling.current = true;

    if (clickScrollTimer.current) clearTimeout(clickScrollTimer.current);

    const targetEl = document.getElementById(id);
    if (targetEl) {
      const navOffset = 80;
      const elementPosition = targetEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      window.history.pushState(null, "", `#${id}`);
    }

    clickScrollTimer.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 850);
  };

  const renderDesktopAuth = () => {
    if (loading) {
      return (
        <>
          <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200/80" aria-hidden="true" />
          <div className="h-10 w-28 animate-pulse rounded-full bg-gray-200/80" aria-hidden="true" />
        </>
      );
    }

    if (isAuthenticated) {
      return (
        <>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-gray-900"
          >
            <LogOut size={16} />
            Log out
          </button>
          <Link
            href="/dashboard"
            id="navbar-cta"
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-gray-800 hover:shadow-md active:scale-[0.98]"
          >
            Open dashboard
          </Link>
        </>
      );
    }

    return (
      <>
        <Link
          href="/auth"
          className="text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-gray-900"
        >
          Log in
        </Link>
        <Link
          href="/auth"
          id="navbar-cta"
          className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-gray-800 hover:shadow-md active:scale-[0.98]"
        >
          Get started
        </Link>
      </>
    );
  };

  const renderMobileAuth = () => {
    if (loading) {
      return (
        <>
          <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100" aria-hidden="true" />
          <div className="h-11 w-full animate-pulse rounded-full bg-gray-200/90" aria-hidden="true" />
        </>
      );
    }

    if (isAuthenticated) {
      return (
        <>
          <button
            type="button"
            className="rounded-lg px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => {
              setMobileOpen(false);
              logout();
            }}
          >
            Log out
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white"
            onClick={() => setMobileOpen(false)}
          >
            Open dashboard
          </Link>
        </>
      );
    }

    return (
      <>
        <Link
          href="/auth"
          className="rounded-lg px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={() => setMobileOpen(false)}
        >
          Log in
        </Link>
        <Link
          href="/auth"
          className="inline-flex items-center justify-center rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white"
          onClick={() => setMobileOpen(false)}
        >
          Get started
        </Link>
      </>
    );
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-[1000] h-20 border-b border-gray-100/80 bg-white/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5" id="navbar-logo">
          <img src="/logo_1.svg" alt="AURE Logo" className="h-7 w-7 rounded-md object-contain" />
          <span className="text-[17px] font-bold tracking-tight text-gray-900">AURE</span>
        </Link>

        {/* Center Links — Desktop */}
        <div className="hidden items-center gap-1 md:flex" id="navbar-links">
          {navLinks.map((link) => {
            const isActive = activeId === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.id)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive ? "text-gray-900 font-semibold" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-[-16px] left-3 right-3 h-[2px] bg-purple-600 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </div>

        {/* Right side — Desktop */}
        <div className="hidden items-center gap-4 md:flex">
          {renderDesktopAuth()}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          id="navbar-mobile-toggle"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-gray-100 bg-white/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link) => {
                const isActive = activeId === link.id;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.id)}
                    className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-purple-50 text-purple-700 font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
              <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-gray-100">
                {renderMobileAuth()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
