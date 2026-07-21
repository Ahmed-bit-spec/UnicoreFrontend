// HeroBanner.jsx — e-library hero, UniLibrary green/white/black system
//
// Exactly three jobs, nothing else:
//   1. Identity — a short line that says what this place is
//   2. Search   — one unmistakable search field (glowing glass, "smart" look)
//   3. Lumi the owl — pure branding, lights the way, does nothing functional
//
// Palette: white background, black text/ink (#14171A), green-500 (#58CC02)
// as the single accent. No indigo, no gold — matches the rest of the design system.

import { useState, useRef, useEffect } from "react";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { OwlMascot, OwlMascotStyles } from "./owlmoscot";


// Same chunky "Duolingo" button used elsewhere in the system.
const PRIMARY_BTN =
  "bg-[#58CC02] text-white shadow-[0_4px_0_#46A302] hover:translate-y-0.5 hover:shadow-[0_2px_0_#46A302] active:translate-y-1 active:shadow-none transition-all duration-150";

const QUOTES = [
  { text: "A room without books is like a body without a soul.", author: "Cicero" },
  { text: "Knowledge is the key to every future.", author: "UniCoreLibrary" },
  { text: "Not all those who wander the stacks are lost.", author: "after J.R.R. Tolkien" },
];

const HeroBanner = ({ onSearch, searchValue, onSearchChange, placeholder }) => {
  const [internalValue, setInternalValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quoteVisible, setQuoteVisible] = useState(true);
  const inputRef = useRef(null);

  // Controlled or uncontrolled — works standalone or wired to a parent.
  const value = searchValue !== undefined ? searchValue : internalValue;
  const setValue = onSearchChange ?? setInternalValue;

  useEffect(() => {
    const iv = setInterval(() => {
      setQuoteVisible(false);
      setTimeout(() => {
        setQuoteIndex((i) => (i + 1) % QUOTES.length);
        setQuoteVisible(true);
      }, 260);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  const submit = () => {
    if (onSearch) onSearch(value);
  };

  const quote = QUOTES[quoteIndex];

  return (
    <div className="hero-root bg-white border border-stone-200">
      <HeroStyles />

      {/* drifting green motes — the one "signature" flourish, everything else stays quiet */}
      <div className="hero-motes" aria-hidden>
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className={`mote mote-${i % 7}`} />
        ))}
      </div>

      <div className="hero-inner">
        {/* ── LEFT: identity, search, hint ── */}
        <div className="hero-left">
          <div className="hero-eyebrow">
            <Sparkles size={13} />
            <span>UniCoreLibrary</span>
          </div>

          <p className={`hero-quote ${quoteVisible ? "is-visible" : ""}`}>
            "{quote.text}"<span className="hero-quote-author"> — {quote.author}</span>
          </p>

          <h1 className="hero-title">Welcome to your digital library</h1>

          {/* THE search field — glass panel, animated green ring, "smart" feel */}
          <div className={`hero-search-shell ${focused ? "is-focused" : ""}`}>
            <div className="hero-search-ring" aria-hidden />
            <Search size={19} className="hero-search-icon" />
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder={placeholder ?? "Search books, authors, ISBN..."}
              className="hero-search-input"
            />
            <button
              className={`hero-search-btn rounded-[13px] ${PRIMARY_BTN}`}
              onClick={submit}
              aria-label="Search"
            >
              <span className="hero-search-btn-label">Search</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <p className="hero-hint">Find books instantly in your library</p>
        </div>

        {/* ── RIGHT: Lumi, decorative only ── */}
        <div className="owl-mascot-wrap hero-right">
          <div className="hero-owl-frame">
            <OwlMascot size={220} />
          </div>

        </div>
      </div>
    </div>
  );
};

const HeroStyles = () => (
  <style>{`
    .hero-root {
      position: relative;
      width: 100%;
      overflow: hidden;
      border-radius: 20px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04);
    }
    .hero-root::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      background: radial-gradient(ellipse at 15% 0%, rgba(88,204,2,0.08) 0%, transparent 55%);
    }
.hero-inner {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding: 64px 44px;      /* was 48px 44px */
  max-width: 1280px;
  margin: 0 auto;
  box-sizing: border-box;
}

.hero-owl-frame {
  width: 260px;            /* was 220px */
}

.hero-title {
  margin: 0 0 4px;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  font-size: clamp(30px, 3.8vw, 44px);   /* was clamp(26px, 3.4vw, 38px) */
  line-height: 1.15;
  font-weight: 700;
  color: #14171A;
}

    .hero-left {
      flex: 1 1 480px;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .hero-right {
      flex: 0 0 auto;
      display: flex;
      justify-content: center;
    }

   
    .hero-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      width: fit-content;
      padding: 5px 12px;
      border-radius: 999px;
      background: rgba(88,204,2,0.08);
      border: 1px solid rgba(88,204,2,0.25);
      color: #3F9100;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .hero-quote {
      min-height: 20px;
      margin: 0;
      font-size: 13px;
      font-style: italic;
      color: #6B7280;
      opacity: 0;
      transform: translateY(-4px);
      transition: opacity 0.26s ease, transform 0.26s ease;
    }
    .hero-quote.is-visible {
      opacity: 1;
      transform: translateY(0);
    }
    .hero-quote-author {
      font-style: normal;
      font-weight: 700;
      color: #3F9100;
    }

    

    /* ── the "AI-style" search field ── */
    .hero-search-shell {
      position: relative;
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      max-width: 560px;
      padding: 6px 6px 6px 18px;
      border-radius: 18px;
      background: #ffffff;
      border: 1.5px solid #e5e7eb;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .hero-search-shell.is-focused {
      border-color: rgba(88,204,2,0.55);
      box-shadow: 0 0 0 4px rgba(88,204,2,0.14), 0 10px 28px rgba(0,0,0,0.08);
    }
    .hero-search-ring {
      position: absolute;
      inset: -1.5px;
      border-radius: 19px;
      padding: 1.5px;
      background: conic-gradient(from var(--ang, 0deg), rgba(88,204,2,0) 0%, rgba(88,204,2,0.85) 12%, rgba(88,204,2,0) 28%);
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      animation: heroRingSpin 3.2s linear infinite;
      opacity: 0.7;
      pointer-events: none;
    }
    @keyframes heroRingSpin {
      to { --ang: 360deg; }
    }
    @property --ang {
      syntax: '<angle>';
      inherits: false;
      initial-value: 0deg;
    }

    .hero-search-icon {
      flex-shrink: 0;
      color: #58CC02;
    }
    .hero-search-input {
      flex: 1;
      min-width: 0;
      background: transparent;
      border: none;
      outline: none;
      color: #14171A;
      font-size: 15px;
      font-weight: 500;
      padding: 12px 0;
    }
    .hero-search-input::placeholder {
      color: #9ca3af;
    }
    .hero-search-btn {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 6px;
      border: none;
      cursor: pointer;
      padding: 11px 18px;
      font-size: 13.5px;
      font-weight: 700;
    }

    .hero-hint {
      margin: 2px 0 0;
      font-size: 12.5px;
      color: #6b7280;
      font-weight: 500;
    }

    /* ── drifting green motes (quiet ambient motion behind everything) ── */
    .hero-motes {
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
    }
    .mote {
      position: absolute;
      bottom: -10px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #58CC02;
      opacity: 0;
      animation: moteRise 9s linear infinite;
    }
    .mote-0 { left: 6%;  animation-delay: 0s;   }
    .mote-1 { left: 18%; animation-delay: 1.3s; }
    .mote-2 { left: 32%; animation-delay: 2.6s; }
    .mote-3 { left: 48%; animation-delay: 0.7s; }
    .mote-4 { left: 63%; animation-delay: 3.4s; }
    .mote-5 { left: 78%; animation-delay: 1.9s; }
    .mote-6 { left: 90%; animation-delay: 4.2s; }
    @keyframes moteRise {
      0%   { opacity: 0; transform: translateY(0) scale(0.6); }
      10%  { opacity: 0.55; }
      90%  { opacity: 0.25; }
      100% { opacity: 0; transform: translateY(-220px) scale(1.1); }
    }

    .hero-search-btn-label {
      white-space: nowrap;
    }

    @media (prefers-reduced-motion: reduce) {
      .hero-search-ring { animation: none; opacity: 0.35; }
      .mote { animation: none; opacity: 0.2; }
      .hero-quote { transition: none; }
    }

    /* ── Laptop / small desktop ── */
    @media (max-width: 1100px) {
      .hero-inner { padding: 42px 36px; gap: 24px; }
      .hero-owl-frame { width: 190px; }
    }

    /* ── Tablet ── */
    @media (max-width: 860px) {
      .hero-inner { padding: 36px 30px; gap: 20px; }
      .hero-owl-frame { width: 160px; }
      .hero-title { font-size: clamp(22px, 4vw, 30px); }
      .hero-search-shell { max-width: 460px; }
    }

    /* ── Mobile: stack, owl above content, center everything ── */
    @media (max-width: 680px) {
      .hero-inner {
        flex-direction: column-reverse;
        padding: 28px 20px;
        gap: 14px;
        text-align: center;
      }
      .hero-left { align-items: center; gap: 12px; }
      .hero-eyebrow { margin: 0 auto; }
      .hero-quote { font-size: 12.5px; max-width: 380px; }
      .hero-title { font-size: clamp(21px, 6vw, 28px); }
      .hero-search-shell { max-width: 100%; padding: 5px 5px 5px 14px; }
      .hero-search-input { font-size: 14px; padding: 10px 0; }
      .hero-search-btn { padding: 10px 14px; font-size: 13px; }
      .hero-owl-frame { width: 130px; }
      .hero-hint { font-size: 12px; }
    }

    /* ── Small phones ── */
    @media (max-width: 400px) {
      .hero-inner { padding: 24px 16px; }
      .hero-owl-frame { width: 108px; }
      .hero-search-shell { border-radius: 15px; }
      .hero-search-btn { padding: 9px 12px; gap: 4px; }
      .hero-search-btn-label { display: none; }
      .hero-title { font-size: clamp(19px, 6.5vw, 24px); }
      .hero-quote { display: none; }
    }

    /* ── Landscape phones: owl doesn't need to dominate vertical space ── */
    @media (max-width: 900px) and (orientation: landscape) and (max-height: 480px) {
      .hero-inner { flex-direction: row; text-align: left; padding: 20px 28px; }
      .hero-left { align-items: flex-start; }
      .hero-eyebrow { margin: 0; }
      .hero-owl-frame { width: 110px; }
    }
  `}</style>
);

export default HeroBanner;