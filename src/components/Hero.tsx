"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import TrustLogos from "./TrustLogos";
import HeroParticleBurst from "./HeroParticleBurst";

export default function Hero() {
  return (
    <section
      className="relative flex min-h-[calc(100vh-80px)] items-center overflow-hidden"
      id="hero"
    >
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="glow-purple absolute right-[10%] top-[10%] h-[600px] w-[600px]" />
        <div className="glow-pink absolute right-[25%] top-[40%] h-[400px] w-[400px]" />
        <div className="glow-blue absolute right-[5%] top-[60%] h-[500px] w-[500px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center gap-16 px-6 py-16 lg:flex-row lg:items-center lg:gap-20 lg:px-12 xl:gap-24">
        {/* ── Left Column: Content ── */}
        <div className="flex max-w-xl flex-1 flex-col lg:max-w-[580px]">
          {/* Badge */}
          <motion.div
            className="mb-6 flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="h-[6px] w-[6px] rounded-full bg-brand-violet" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400">
              AI-Powered Prompt Intelligence
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.1] tracking-tight text-gray-900"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              From rough ideas
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.25,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              to <span className="gradient-text">remarkable</span> results.
            </motion.span>
          </motion.h1>

          {/* Paragraph */}
          <motion.p
            className="mt-8 max-w-md text-lg leading-relaxed text-gray-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.45,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            Prompt Enhancer helps you write better prompts so AI can give you
            better answers.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="mt-10 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.6,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {/* Primary */}
            <a
              href="#get-started"
              id="hero-cta-primary"
              className="group inline-flex items-center gap-2.5 rounded-full bg-gray-900 px-7 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-gray-900/10 transition-all duration-300 hover:bg-gray-800 hover:shadow-xl hover:shadow-gray-900/15 active:scale-[0.97]"
            >
              Enhance your prompt
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </a>

            {/* Secondary */}
            <a
              href="#how-it-works"
              id="hero-cta-secondary"
              className="group inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-[15px] font-semibold text-gray-600 transition-colors duration-200 hover:text-gray-900"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 transition-colors duration-200 group-hover:border-gray-300 group-hover:bg-gray-50">
                <Play size={12} className="ml-0.5 text-gray-500" />
              </span>
              See how it works
            </a>
          </motion.div>

          {/* Trust Logos */}
          <TrustLogos />
        </div>

        {/* ── Right Column: Particle Burst with AI Engine Card ── */}
        <motion.div
          className="relative flex flex-1 items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          <div className="relative h-[520px] w-[520px] lg:h-[580px] lg:w-[580px]">
            {/* The particle burst canvas (includes center icon) */}
            <HeroParticleBurst />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
