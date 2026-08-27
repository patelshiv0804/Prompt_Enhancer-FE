"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WorksEverywhere from "@/components/WorksEverywhere";
import PromptTransformationShowcase from "@/components/PromptTransformationShowcase";
import BentoFeatures from "@/components/BentoFeatures";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

const TransformationEngine = dynamic(() => import("@/components/TransformationEngine"), {
  loading: () => <div style={{ minHeight: "100vh" }} className="landing-engine-fallback" />,
});

export default function Home() {
  const [prompt, setPrompt] = useState("Create a product launch campaign for our new AI writing assistant.");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedData, setEnhancedData] = useState<any>(null);

  const handleEnhance = () => {
    // Static UI button - no redirects, API calls, or scrolling
  };

  return (
    <main className="landing-root flex min-h-screen flex-col">
      <Navbar />
      <Hero />
      <WorksEverywhere />
      <TransformationEngine
        prompt={prompt}
        setPrompt={setPrompt}
        onSubmit={handleEnhance}
        isEnhancing={isEnhancing}
      />
      <PromptTransformationShowcase
        originalText={enhancedData?.original_prompt || prompt}
        enhancedText={enhancedData?.enhanced_prompt}
        originalAnalysis={enhancedData?.original_analysis}
        enhancedAnalysis={enhancedData?.enhanced_analysis}
      />
      <BentoFeatures />
      <FAQSection />
      <Footer />
    </main>
  );
}
