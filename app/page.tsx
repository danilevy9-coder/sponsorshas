import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ShasGrid } from "@/components/ShasGrid";
import { HowItWorks } from "@/components/HowItWorks";
import { MeritsSection } from "@/components/MeritsSection";
import { AvreichimSection } from "@/components/AvreichimSection";
import { HaskamosSection } from "@/components/HaskamosSection";
import { AboutSection } from "@/components/AboutSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <HeroSection />
      <ShasGrid />
      <HowItWorks />
      <MeritsSection />
      <AvreichimSection />
      <HaskamosSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
