// src/pages/LandingPage.jsx
// Theme fixes applied:
//  • Hero:        bg-black → bg-white dark:bg-black  |  text-white → text-black dark:text-white
//  • HowItWorks:  bg-black → bg-gray-50 dark:bg-black  |  same text fix
//  • Dot pattern in Hero: only visible in dark mode (hidden by default)
//  • Outline CTA button: border/text adapt to both modes
//  • Stats cards: border + text adapt to both modes
//  • Scroll indicator: adapts to both modes


import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import Hero from "../components/LandingHero";
import Features from "../components/FeatureCards";
import HowItWorks from "../components/LandingHowItWorks";
import Faq from "../components/LandingFaq";

// ═══════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════
const LandingPage = () => {
  const { t } = useLanguage() || {};
  return (
    <>
      <Hero       t={t} />
      <Features   t={t} />
      <HowItWorks t={t} />
      <Faq        t={t} />
    </>
  );
};

export default LandingPage;