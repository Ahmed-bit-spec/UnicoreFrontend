// src/components/LanguagePrompt.jsx
//
// Shows once — after 5 seconds on first visit.
// If the user has already picked a language (localStorage has "uniso_lang"),
// it never shows again.
// Clicking a language switches immediately via context.
// Clicking "Later" dismisses and won't show again this session.

import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { LANGUAGE_PROMPT_KEY } from "@/context/LanguageContext";
import { Languages, X } from "lucide-react";

const LanguagePrompt = () => {
  const { language, setLanguage, t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false); // for exit animation

  useEffect(() => {
    // If user already explicitly chose a language before, don't show
    const saved = localStorage.getItem(LANGUAGE_PROMPT_KEY);
    if (saved) return;

    // Show after 3 seconds
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setLeaving(true);
    // Mark as dismissed so it doesn't show again this session
    localStorage.setItem(LANGUAGE_PROMPT_KEY, "true");
    setTimeout(() => setVisible(false), 350);
  };

  const choose = (chosen) => {
    setLanguage(chosen);
    localStorage.setItem(LANGUAGE_PROMPT_KEY, "true");
    setLeaving(true);
    setTimeout(() => setVisible(false), 350);
  };

  if (!visible) return null;

  return (
    // Full-screen backdrop with centered card
    <div
      className={`
        fixed inset-0 z-50
        flex items-center justify-center
        px-4
        transition-all duration-350 ease-out
        ${leaving ? "opacity-0 pointer-events-none" : "opacity-100"}
      `}
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
    >
      <div
        className={`
          w-full max-w-sm
          bg-white dark:bg-gray-950
          border border-gray-100 dark:border-gray-800
          rounded-3xl shadow-2xl
          transition-all duration-350 ease-out
          ${leaving ? "scale-95 opacity-0" : "scale-100 opacity-100"}
        `}
      >
        {/* Top green accent */}
        <div className="h-1 w-full  rounded-t-3xl" />

        {/* Content */}
        <div className="px-6 pt-6 pb-6">

          {/* Close button — top right */}
          <div className="flex justify-end mb-2">
            <button
              onClick={dismiss}
              className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
            >
              <X size={14} />
            </button>
          </div>

          {/* Icon + title — centered */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#2C2DE0]/5 dark:bg-[#4F51FF]/10 dark:bg-[#2C2DE0] dark:bg-[#1E1FAA]/10 border border-[#2C2DE0] dark:border-[#2C2DE0] dark:border-[#4F51FF]/20 flex items-center justify-center mb-4">
              <Languages size={24} className="text-[#2C2DE0] dark:text-[#4F51FF]" />
            </div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
              {t.language.chooseLanguage}
            </h2>
            <p className="text-sm text-[#1E1FAA] dark:text-[#4F51FF] dark:text-[#4F51FF] font-semibold mt-0.5">
              {t.language.chooseLanguageSub}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 leading-relaxed max-w-xs">
              {t.language.promptDescription}{" "}
              <span className="text-gray-400">
                {t.language.promptDescriptionAlt}
              </span>
            </p>
          </div>

          {/* Language buttons */}
          <div className="flex flex-col gap-3">
            <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
              onClick={() => choose("en")}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 transition-all duration-150 ${language === "en"
                  ? "bg-[#2C2DE0]/5 dark:bg-[#4F51FF]/10 dark:bg-[#2C2DE0] dark:bg-[#1E1FAA]/10 border-[#4F51FF] dark:border-[#2C2DE0]"
                  : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-[#4F51FF] dark:border-blue-400 dark:hover:border-[#2C2DE0]"
                }`}
            >
              <span className="text-2xl leading-none">🇬🇧</span>
              <div className="text-left flex-1">
                <p className={`text-sm font-black leading-tight ${language === "en" ? "text-[#0F0F55] dark:text-blue-300 dark:text-[#4F51FF]" : "text-gray-800 dark:text-gray-100"}`}>
                  {t.common.english}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">{t.language.continueEnglish}</p>
              </div>
              {language === "en" && (
                <span className="text-[10px] font-bold text-[#1E1FAA] dark:text-[#4F51FF] bg-[#2C2DE0] dark:bg-[#2C2DE0] dark:bg-[#1E1FAA]/20 px-2.5 py-1 rounded-full flex-shrink-0">
                  {t.common.active}
                </span>
              )}
            </button>

            <button className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
              onClick={() => choose("so")}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 transition-all duration-150 ${language === "so"
                  ? "bg-[#2C2DE0]/5 dark:bg-[#4F51FF]/10 dark:bg-[#2C2DE0] dark:bg-[#1E1FAA]/10 border-[#4F51FF] dark:border-[#2C2DE0]"
                  : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-[#4F51FF] dark:border-blue-400 dark:hover:border-[#2C2DE0]"
                }`}
            >
              <span className="text-2xl leading-none">🇸🇴</span>
              <div className="text-left flex-1">
                <p className={`text-sm font-black leading-tight ${language === "so" ? "text-[#0F0F55] dark:text-blue-300 dark:text-[#4F51FF]" : "text-gray-800 dark:text-gray-100"}`}>
                  {t.common.somali}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">{t.language.continueSomali}</p>
              </div>
              {language === "so" && (
                <span className="text-[10px] font-bold text-[#1E1FAA] dark:text-[#4F51FF] bg-[#2C2DE0] dark:bg-[#2C2DE0] dark:bg-[#1E1FAA]/20 px-2.5 py-1 rounded-full flex-shrink-0">
                  {t.common.active}
                </span>
              )}
            </button>
          </div>

          {/* Later */}
          <button
            onClick={dismiss}
            className="bg-[#2C2DE0] text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
          >
            {t.language.remindLater} · {t.language.remindLaterAlt}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguagePrompt;
