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
  loading: () => <div style={{ minHeight: "100vh" }} className="bg-[#FAFBFC]" />,
});

export default function Home() {
  const [prompt, setPrompt] = useState("Create a product launch campaign for our new AI writing assistant.");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedData, setEnhancedData] = useState<any>(null);

  const handleEnhance = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const devEmail = process.env.NEXT_PUBLIC_DEV_USER_EMAIL || "kartikjaju0@gmail.com";

      const response = await fetch(`${apiUrl}/api/v1/enhance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Current-User": devEmail,
        },
        body: JSON.stringify({
          prompt: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to enhance prompt: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setEnhancedData(result.data);
        
        // Smoothly scroll down to the showcase section
        const showcase = document.getElementById("transformation-showcase");
        if (showcase) {
          setTimeout(() => {
            showcase.scrollIntoView({ behavior: "smooth" });
          }, 150);
        }
      }
    } catch (error) {
      console.error("Enhancement error:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-white">
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
