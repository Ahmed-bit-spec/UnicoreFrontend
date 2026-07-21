/**
 * Cloudflare Turnstile widget — Duolingo-styled.
 * Calls onVerify(token) on success, onExpire() when the challenge expires.
 * Falls back to a dev-bypass when VITE_TURNSTILE_SITE_KEY is not set.
 */
import React, { useCallback, useEffect, useState } from "react";

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
  const [status, setStatus] = useState("idle"); // idle | error

  useEffect(() => {
    import("@marsidev/react-turnstile").then((mod) => {
      setTurnstileComp(() => mod.Turnstile);
    });
  }, []);

  const handleSuccess = useCallback((token) => {
    setStatus("idle");
    if (onVerify) onVerify(token);
  }, [onVerify]);

  const handleExpire = useCallback(() => {
    setStatus("idle");
    if (onExpire) onExpire();
  }, [onExpire]);

  const handleError = useCallback(() => setStatus("error"), []);

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <div className="flex justify-center w-full min-h-[68px] items-center">
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