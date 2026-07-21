import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WorksEverywhere from "@/components/WorksEverywhere";
import PromptTransformationShowcase from "@/components/PromptTransformationShowcase";
import BentoFeatures from "@/components/BentoFeatures";
import FAQSection from "@/components/FAQSection";

const TransformationEngine = dynamic(() => import("@/components/TransformationEngine"), {
  loading: () => <div style={{ minHeight: "100vh" }} className="bg-[#FAFBFC]" />,
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <Hero />
      <WorksEverywhere />
      <TransformationEngine />
      <PromptTransformationShowcase />
      <BentoFeatures />
      <FAQSection />
    </main>
  );
}
