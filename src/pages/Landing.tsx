import React, { useEffect } from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { TwoWorldsSection } from '../components/landing/TwoWorldsSection';
import { GamesShowcaseSection } from '../components/landing/GamesShowcaseSection';
import { DuelShowcaseSection } from '../components/landing/DuelShowcaseSection';
import { LearnRoadmapSection } from '../components/landing/LearnRoadmapSection';
import { SocialLoopSection } from '../components/landing/SocialLoopSection';
import { ProgressionSection } from '../components/landing/ProgressionSection';
import { FinalCtaSection } from '../components/landing/FinalCtaSection';
import { LandingFooter } from '../components/landing/LandingFooter';

export const Landing: React.FC = () => {
  useEffect(() => {
    // Reset window scroll on mount
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-[#141719] text-[#F2F0E9] selection:bg-arena-amber selection:text-[#141719] overflow-x-hidden font-sans">
      {/* 1. Sticky Glassmorphic Navbar */}
      <LandingNavbar />

      {/* 2. Hero Section with 3D Centerpiece */}
      <main>
        <HeroSection />

        {/* 3. Section: Two Worlds. One Arena. */}
        <TwoWorldsSection />

        {/* 4. Section: Games for Every Mind */}
        <GamesShowcaseSection />

        {/* 5. Section: Live 1v1 Coding Battles */}
        <DuelShowcaseSection />

        {/* 6. Section: Structured DSA Roadmap */}
        <LearnRoadmapSection />

        {/* 7. Section: The Social Viral Loop */}
        <SocialLoopSection />

        {/* 8. Section: Progression & Verified Rating */}
        <ProgressionSection />

        {/* 9. Final Call to Action */}
        <FinalCtaSection />
      </main>

      {/* 10. Minimal Elegant Footer */}
      <LandingFooter />
    </div>
  );
};
