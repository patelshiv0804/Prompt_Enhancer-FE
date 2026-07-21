"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, HelpCircle, Sparkles, ArrowRight, ShieldCheck, Zap, Layers } from "lucide-react";
import Link from "next/link";

interface FAQItem {
  id: string;
  category: "general" | "extension" | "features" | "privacy";
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "faq-1",
    category: "general",
    question: "What is AURE and how does it transform my prompts?",
    answer:
      "AURE is an advanced prompt intelligence engine designed to transform rough, brief ideas into structured, high-performing prompts. It analyzes intent, adds domain-specific context, optimizes tone and parameters for models like ChatGPT, Claude, Gemini, Midjourney, and VEO—delivering significantly richer and more accurate AI responses.",
  },
  {
    id: "faq-2",
    category: "extension",
    question: "How does the AURE Extension work across AI tools?",
    answer:
      "The AURE extension lives inside the web apps you already use—including ChatGPT, Claude, Gemini, Perplexity, and Grok. An overlay button appears right inside your prompt input area, enabling one-click prompt enhancement and preset injection without switching tabs.",
  },
  {
    id: "faq-3",
    category: "features",
    question: "What is Style & Role Memory and how does it customize outputs?",
    answer:
      "Style Memory lets you save your professional personas (e.g., Senior Engineer, B2B Copywriter, Cinematic Director) and visual style presets (e.g., Film Noir, Cyberpunk, Watercolor). When Auto-inject is toggled ON, AURE automatically customizes every prompt to match your exact tone and guidelines.",
  },
  {
    id: "faq-4",
    category: "privacy",
    question: "Are my prompts and conversation data private and secure?",
    answer:
      "Yes, absolutely. AURE is built with a local-first privacy architecture. Your prompts and style profiles process locally in your browser. We never store, sell, or train public AI models on your private data or prompt history.",
  },
  {
    id: "faq-5",
    category: "general",
    question: "Which AI models and platforms are supported by AURE?",
    answer:
      "AURE supports all major AI text, coding, and creative models, including GPT-4o, Claude 3.5 Sonnet, Gemini Pro, Grok, Midjourney v6, VEO Video Model, DALL-E 3, Stable Diffusion, and Perplexity.",
  },
  {
    id: "faq-6",
    category: "features",
    question: "How does the live Prompt Quality Score work?",
    answer:
      "AURE evaluates your prompt across key dimensions—clarity, structural specificity, context depth, and model parameter alignment. It assigns a real-time score (0–100) before and after optimization so you can measure quality gains instantly.",
  },
  {
    id: "faq-7",
    category: "general",
    question: "Can I export or save my optimized prompts?",
    answer:
      "Yes! You can export your optimized prompts in Markdown, JSON, or plain text, copy directly to your clipboard, or save them into your personal AURE Vault for instant re-use anytime.",
  },
  {
    id: "faq-8",
    category: "general",
    question: "Is AURE free to use, and how do I get started?",
    answer:
      "Yes! AURE offers a free tier that gives you immediate access to the live prompt optimizer, core extension capabilities, and style memory profiles. You can get started right away by clicking 'Get started' or installing the Chrome extension.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Questions" },
  { id: "general", label: "General" },
  { id: "extension", label: "Extension" },
  { id: "features", label: "Features & Memory" },
  { id: "privacy", label: "Privacy & Security" },
];

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>("faq-1");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const filteredFAQs = FAQ_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section
      id="faq"
      className="relative w-full overflow-hidden bg-[#FAFBFC] py-24 px-6 md:px-12 lg:px-16 border-t border-gray-100"
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1000px]">
        {/* Header Badge & Title */}
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-purple-200/80 bg-purple-50/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-purple-700 backdrop-blur-sm"
          >
            <HelpCircle size={14} className="text-purple-600" />
            Frequently Asked Questions
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl lg:text-5xl"
          >
            Everything you need to know <br className="hidden sm:inline" />
            about <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">AURE</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 max-w-2xl text-base text-gray-600 md:text-lg"
          >
            Have questions about how AURE enhances your AI prompts, extension features, style memory, or data privacy? We’ve got answers.
          </motion.p>
        </div>

        {/* Search & Category Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col items-center justify-between gap-4 md:flex-row md:gap-6"
        >
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 shadow-sm transition-all placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-gray-200/80 bg-white p-1 shadow-sm">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                  activeCategory === cat.id
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Accordion FAQ List */}
        <div className="mt-8 flex flex-col gap-3.5">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((item, index) => {
              const isOpen = openId === item.id;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                    isOpen
                      ? "border-purple-200 bg-white shadow-md shadow-purple-500/5 ring-1 ring-purple-500/20"
                      : "border-gray-200/80 bg-white hover:border-purple-200 hover:shadow-sm"
                  }`}
                >
                  <button
                    onClick={() => toggleFAQ(item.id)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left md:p-6"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-bold text-gray-900 md:text-lg">
                      {item.question}
                    </span>
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-transform duration-200 ${
                        isOpen ? "rotate-180 bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <ChevronDown size={18} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="border-t border-purple-50/80 px-5 pb-6 pt-3 text-sm leading-relaxed text-gray-600 md:px-6 md:text-base">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
              <p className="text-sm font-medium text-gray-500">No questions found matching your search query.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-3 text-xs font-semibold text-purple-600 hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Bottom Call to Action Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 rounded-3xl border border-purple-100 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 p-8 text-white shadow-xl md:p-10 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex flex-col gap-2 text-center md:text-left">
            <h3 className="text-xl font-bold md:text-2xl">Still have questions?</h3>
            <p className="text-sm text-purple-200/90 max-w-md">
              Start optimizing your AI prompts today with AURE. Free to use, no credit card required.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-gray-900 shadow-md transition-all hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get started for free
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
