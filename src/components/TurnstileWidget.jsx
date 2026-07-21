/**
 * Cloudflare Turnstile widget — Duolingo-styled.
 * Calls onVerify(token) on success, onExpire() when the challenge expires.
 * Falls back to a dev-bypass when VITE_TURNSTILE_SITE_KEY is not set.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

// ─── Dev-mode bypass (no real site key) ──────────────────────────────────────
function TurnstileDevBypass({ onVerify, className }) {
  useEffect(() => {
    if (onVerify) onVerify("dev-bypass");
  }, [onVerify]);

  return (
    <div className={`text-[11px] text-gray-400 dark:text-gray-600 text-center py-1 ${className}`}>
      Turnstile: dev mode (no SITE_KEY)
    </div>
  );
}

// ─── Real widget (lazy-loads @marsidev/react-turnstile) ──────────────────────
function TurnstileReal({ onVerify, onExpire, className }) {
  const [TurnstileComp, setTurnstileComp] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | verifying | success | error

  useEffect(() => {
    import("@marsidev/react-turnstile").then((mod) => {
      setTurnstileComp(() => mod.Turnstile);
    });
  }, []);

  const handleSuccess = useCallback((token) => {
    setStatus("success");
    if (onVerify) onVerify(token);
  }, [onVerify]);

  const handleExpire = useCallback(() => {
    setStatus("idle");
    if (onExpire) onExpire();
  }, [onExpire]);

  const handleError = useCallback(() => setStatus("error"), []);

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <div
        className="relative overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800
          bg-gray-50 dark:bg-gray-900 p-1 transition-all duration-300 shadow-sm w-full flex justify-center min-h-[68px] items-center"
      >
        {TurnstileComp ? (
          <TurnstileComp
            siteKey={SITE_KEY}
            onSuccess={handleSuccess}
            onExpire={handleExpire}
            onError={handleError}
            options={{ theme: "auto", size: "normal" }}
          />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 border-t-green-500 animate-spin" />
        )}

        {status === "success" && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-50/80 dark:bg-green-900/30 rounded-xl pointer-events-none">
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-bold text-xs">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
              Verified ✓
            </div>
          </div>
        )}
      </div>

      {status === "error" && (
        <p className="text-[11px] text-red-500 text-center font-semibold">
          Verification failed. Please try again.
        </p>
      )}
    </div>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
export default function TurnstileWidget({ onVerify, onExpire, className = "" }) {
  if (!SITE_KEY) {
    return <TurnstileDevBypass onVerify={onVerify} className={className} />;
  }
  return <TurnstileReal onVerify={onVerify} onExpire={onExpire} className={className} />;
}
