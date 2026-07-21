"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features", active: true },
  { label: "How it works", href: "#how-it-works", active: false },
  { label: "Examples", href: "#examples", active: false },
  { label: "Pricing", href: "#pricing", active: false },
  { label: "Blog", href: "#blog", active: false },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-[1000] h-20 border-b border-gray-100/80 bg-white/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <a href="/" className="flex items-center gap-1.5" id="navbar-logo">
          <img src="/logo_1.svg" alt="AURE Logo" className="h-7 w-7 rounded-md object-contain" />
          <span className="text-[17px] font-bold tracking-tight text-gray-900">AURE</span>
        </a>

        {/* Center Links — Desktop */}
        <div className="hidden items-center gap-1 md:flex" id="navbar-links">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${link.active
                  ? "text-gray-900 underline decoration-[1.5px] underline-offset-[20px]"
                  : "text-gray-500 hover:text-gray-900"
                }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right side — Desktop */}
        <div className="hidden items-center gap-4 md:flex">
          <a href="#login" className="text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-gray-900">
            Log in
          </a>
          <a
            href="#get-started"
            id="navbar-cta"
            className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-gray-800 hover:shadow-md active:scale-[0.98]"
          >
            Get started
          </a>
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
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${link.active ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#get-started"
                className="mt-2 inline-flex items-center justify-center rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white"
                onClick={() => setMobileOpen(false)}
              >
                Get started
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
