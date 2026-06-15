import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TransformationEngine from "@/components/TransformationEngine";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <Hero />
      <TransformationEngine />
    </main>
  );
}
