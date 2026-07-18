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
              className="w-7 h-7 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <X size={14} />
            </button>
          </div>

          {/* Icon + title — centered */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 flex items-center justify-center mb-4">
              <Languages size={24} className="text-green-500" />
            </div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
              {t.language.chooseLanguage}
            </h2>
            <p className="text-sm text-green-600 dark:text-green-400 font-semibold mt-0.5">
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
            <button
              onClick={() => choose("en")}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 transition-all duration-150 ${language === "en"
                  ? "bg-green-50 dark:bg-green-500/10 border-green-400 dark:border-green-600"
                  : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-800"
                }`}
            >
              <span className="text-2xl leading-none">🇬🇧</span>
              <div className="text-left flex-1">
                <p className={`text-sm font-black leading-tight ${language === "en" ? "text-green-700 dark:text-green-400" : "text-gray-800 dark:text-gray-100"}`}>
                  {t.common.english}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">{t.language.continueEnglish}</p>
              </div>
              {language === "en" && (
                <span className="text-[10px] font-bold text-green-600 bg-green-100 dark:bg-green-500/20 px-2.5 py-1 rounded-full flex-shrink-0">
                  {t.common.active}
                </span>
              )}
            </button>

            <button
              onClick={() => choose("so")}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 transition-all duration-150 ${language === "so"
                  ? "bg-green-50 dark:bg-green-500/10 border-green-400 dark:border-green-600"
                  : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-800"
                }`}
            >
              <span className="text-2xl leading-none">🇸🇴</span>
              <div className="text-left flex-1">
                <p className={`text-sm font-black leading-tight ${language === "so" ? "text-green-700 dark:text-green-400" : "text-gray-800 dark:text-gray-100"}`}>
                  {t.common.somali}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">{t.language.continueSomali}</p>
              </div>
              {language === "so" && (
                <span className="text-[10px] font-bold text-green-600 bg-green-100 dark:bg-green-500/20 px-2.5 py-1 rounded-full flex-shrink-0">
                  {t.common.active}
                </span>
              )}
            </button>
          </div>

          {/* Later */}
          <button
            onClick={dismiss}
            className="w-full mt-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
          >
            {t.language.remindLater} · {t.language.remindLaterAlt}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguagePrompt;
