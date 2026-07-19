// src/features/auth/signup/SignupPage.jsx
import axios from "axios";
import {
  Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import UnicoreLogo from "@/FrontDoorSystem/components/Logo";
import VerifyEmailStep from "./VerifyEmailStep";
import api from "@/api/client";

// ─── Password strength engine ─────────────────────────────────────────────────
const PW_CHECKS = [
  { id: "len", test: (p) => p.length >= 8 },
  { id: "upper", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", test: (p) => /[a-z]/.test(p) },
  { id: "digit", test: (p) => /[0-9]/.test(p) },
  { id: "special", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function calcStrength(score, t) {
  if (score === 0) return null;
  if (score <= 2) return { label: t("auth.passwordStrengthWeak"), bars: 1, bar: "bg-red-500", text: "text-red-500" };
  if (score === 3) return { label: t("auth.passwordStrengthFair"), bars: 2, bar: "bg-orange-400", text: "text-orange-400" };
  if (score === 4) return { label: t("auth.passwordStrengthGood"), bars: 3, bar: "bg-yellow-500", text: "text-yellow-500" };
  return { label: t("auth.passwordStrengthStrong"), bars: 4, bar: "bg-green-500", text: "text-green-500" };
}

// ─── PasswordStrengthMeter ────────────────────────────────────────────────────
const PasswordStrengthMeter = ({ password, t }) => {
  if (!password) return null;

  const checks = PW_CHECKS.map((c) => ({ ...c, met: c.test(password) }));
  const score = checks.filter((c) => c.met).length;
  const strength = calcStrength(score, t);

  return (
    <div className="mt-2.5">
      {/* 4-segment bar + label */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex gap-1 flex-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength && i < strength.bars
                ? strength.bar
                : "bg-gray-200 dark:bg-gray-700"
                }`}
            />
          ))}
        </div>
        {strength && (
          <span className={`text-[11px] font-bold shrink-0 ${strength.text}`}>
            {strength.label}
          </span>
        )}
      </div>

      {/* 2-column requirements checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {checks.map((c) => (
          <div
            key={c.id}
            className={`flex items-center gap-1.5 text-[11px] transition-colors duration-200 ${c.met
              ? "text-green-600 dark:text-green-400"
              : "text-gray-400 dark:text-gray-500"
              }`}
          >
            {c.met ? (
              <CheckCircle2 size={10} className="shrink-0" />
            ) : (
              <div className="w-2.5 h-2.5 rounded-full border border-current shrink-0 opacity-40" />
            )}
            <span>{t(`auth.passwordRule${c.id}`)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── SignupPage ───────────────────────────────────────────────────────────────
const SignupPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // step: "register" | "sending" | "verify"
  const [step, setStep] = useState("register");
  const [loadingPhase, setLoadingPhase] = useState(0);

  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [savedEmail, setSavedEmail] = useState("");

  // Clear form on mount / back-nav
  useEffect(() => {
    const clear = () => setRegisterData({ name: "", email: "", password: "" });
    clear();
    window.addEventListener("pageshow", clear);
    return () => window.removeEventListener("pageshow", clear);
  }, []);

  // Cycle loading text
  useEffect(() => {
    if (step !== "sending") return;
    const iv = setInterval(() => setLoadingPhase((p) => (p + 1) % 3), 850);
    return () => clearInterval(iv);
  }, [step]);

  const handleRegisterChange = (e) => {
    setRegisterData((p) => ({ ...p, [e.target.name]: e.target.value }));
    setRegisterError("");
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (!registerData.name || !registerData.email || !registerData.password) {
      setRegisterError(t("auth.fillAllFields"));
      return;
    }

    const pw = registerData.password;
    if (pw.length < 8) {
      setRegisterError(t("auth.passwordShort")); return;
    }
    if (!/[A-Z]/.test(pw)) {
      setRegisterError(t("auth.passwordUppercaseRequired"));
      return;
    }
    if (!/[a-z]/.test(pw)) {
      setRegisterError(t("auth.passwordLowercaseRequired"));
      return;
    }
    if (!/[0-9]/.test(pw)) {
      setRegisterError(t("auth.passwordNumberRequired"));
      return;
    }
    if (!/[^A-Za-z0-9]/.test(pw)) {
      setRegisterError(t("auth.passwordSpecialRequired"));
      return;
    }

    await submitRegister();
  };

  const submitRegister = async () => {
    setRegisterError("");
    setStep("sending");
    setLoadingPhase(0);

    try {
      await new Promise((r) => setTimeout(r, 2200));
      await axios.post(
        "/api/v1/auth/register",
        { ...registerData },
        { withCredentials: true }
      );
      setSavedEmail(registerData.email);
      setStep("verify");
    } catch (err) {
      if (err.response?.status === 400) {
        setRegisterError(t("auth.accountExists"));
      } else {
        setRegisterError(err.response?.data?.message || t("auth.genericError"));
      }
      setStep("register");
    }
  };

  const loadingTexts = [
    t("auth.sendingCode1"),
    t("auth.sendingCode2"),
    t("auth.sendingCode3"),
  ];

  // ── Hand off to verify step ──────────────────────────────────────────────
  if (step === "verify") {
    return (
      <VerifyEmailStep
        savedEmail={savedEmail}
        onBack={() => setStep("register")}
      />
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-white dark:bg-black">

      {/* ── LEFT: Form ─────────────────────────────────────────────────────── */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-8 md:px-16 py-16 min-h-screen">
        <Link to="/" className="flex items-center gap-2.5 mb-10 group">
          <UnicoreLogo />
        </Link>

        <div className="w-full max-w-sm">

          {/* ── SENDING ─────────────────────────────────────────────────────── */}
          {step === "sending" && (
            <div className="flex flex-col items-center text-center py-12 anim-fadeup">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-green-100 dark:border-green-900" />
                <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  className="absolute inset-0 m-auto text-green-500">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-base font-bold text-gray-900 dark:text-white min-h-6 anim-textswap">
                {loadingTexts[loadingPhase]}
              </p>
              <div className="flex gap-1 mt-5">
                {[0, 1, 2].map((i) => (
                  <span key={i}
                    className="w-2 h-2 rounded-full bg-green-500 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── REGISTER FORM ────────────────────────────────────────────────── */}
          {step === "register" && (
            <div className="anim-fadeup">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                {t("auth.createAccountTitle")}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {t("auth.signupSubtitle")}
              </p>

              {/* Google SSO */}
              <button
                onClick={() => {
                  const apiBase = import.meta.env.VITE_API_BASE_URL ?? "https://unicorebackend-zrpk.onrender.com";
                  window.location.href = `${apiBase}/api/v1/auth/google`;
                }}
                className="mt-6 w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-all"
              >
                <FcGoogle size={20} />
                {t("auth.continueGoogle")}
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
                <span className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">
                  {t("auth.divider")}
                </span>
                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
              </div>

              {/* Error banner */}
              {registerError && (
                <div className="mb-4 flex items-start gap-2.5 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl px-4 py-3 anim-fadeup">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 dark:text-red-400 font-semibold">{registerError}</p>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} autoComplete="off" className="flex flex-col gap-4">

                {/* Full name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {t("common.fullName")}
                  </label>
                  <input
                    type="text" name="name"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    placeholder={t("auth.namePlaceholder")}
                    autoComplete="off"
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 transition-all"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {t("common.email")}
                  </label>
                  <input
                    type="email" name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    placeholder={t("auth.emailPlaceholder")}
                    autoComplete="off" autoCapitalize="none" spellCheck={false}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 transition-all"
                  />
                </div>

                {/* Password + strength meter */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {t("common.password")}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      placeholder={t("auth.passwordMinPlaceholder")}
                      autoComplete="new-password"
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pr-11 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/30 focus:border-green-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* ── Strength meter ── */}
                  <PasswordStrengthMeter password={registerData.password} t={t} />
                </div>



                <button
                  type="submit"
                  disabled={step === "sending"}
                  className="w-full flex items-center justify-center gap-2 bg-[#58CC02] text-white text-sm font-bold shadow-[0_4px_0_#46A302] hover:translate-y-0.5 hover:shadow-[0_2px_0_#46A302] active:translate-y-1 active:shadow-none transition-all duration-150 py-3 rounded-xl mt-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {step === "sending"
                    ? <><Loader2 className="w-5 h-5 animate-spin" />{t("auth.creatingAccount")}</>
                    : <>{t("auth.createAccountButton")}<ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" /></>
                  }
                </button>
              </form>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
                {t("auth.haveAccount")}{" "}
                <Link to="/login" className="text-green-600 dark:text-green-400 font-semibold hover:underline">
                  {t("auth.signInLink")}
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Brand panel ─────────────────────────────────────────────── */}
      <div className="hidden md:flex w-1/2 bg-black dark:bg-gray-950 flex-col justify-center items-center px-14 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle, #22c55e 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        />
        <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />

        <div className="relative z-10 max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
            <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="7" rx="1" fill="white" opacity="0.9" />
              <rect x="9" y="2" width="5" height="4" rx="1" fill="white" opacity="0.6" />
              <rect x="9" y="8" width="5" height="6" rx="1" fill="white" opacity="0.9" />
              <rect x="2" y="11" width="5" height="3" rx="1" fill="white" opacity="0.6" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white leading-tight">{t("auth.signupSideTitle")}</h2>
          <p className="text-gray-400 mt-4 text-sm leading-relaxed">{t("auth.signupSideDescription")}</p>
          <div className="mt-8 flex flex-col gap-3 text-left">
            {[
              { n: "01", label: t("auth.signupSteps")[0] },
              { n: "02", label: t("auth.signupSteps")[1] },
              { n: "03", label: t("auth.signupSteps")[2] },
            ].map((s) => (
              <div key={s.n} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-green-500 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                  {s.n}
                </span>
                <span className="text-sm text-gray-300 font-medium">{s.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-10 text-gray-500 italic text-sm">{t("auth.signupQuote")}</p>
          <p className="mt-1 text-gray-600 text-xs">{t("auth.signupQuoteAuthor")}</p>
        </div>
      </div>

      <style>{`
        @keyframes fadeup {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes textswap {
          0%   { opacity: 0; transform: translateY(6px); }
          15%  { opacity: 1; transform: translateY(0); }
          85%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-6px); }
        }
        .anim-fadeup   { animation: fadeup   0.4s cubic-bezier(0.22,1,0.36,1) forwards; }
        .anim-textswap { animation: textswap 0.85s ease infinite; }
      `}</style>
    </div>
  );
};

export default SignupPage;
