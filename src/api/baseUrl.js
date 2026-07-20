export const resolveApiBaseUrl = (provided = "", host = "") => {
  const isSameOriginHost =
    typeof window !== "undefined" &&
    /localhost|127\.0\.0\.1|\.vercel\.app|\.vercel\.dev/i.test(
      host || window.location.hostname
    );

  const fallbackBaseUrl = isSameOriginHost ? "/api/v1" : "";
  const raw = String(provided ?? "").trim();
  const cleaned = raw.replace(/\/+$/u, "");

  if (!cleaned) {
    return fallbackBaseUrl || "/api/v1";
  }

  if (/^https?:\/\//u.test(cleaned)) {
    return cleaned.endsWith("/api/v1") || cleaned.endsWith("/api")
      ? cleaned
      : `${cleaned}/api/v1`;
  }

  if (cleaned.startsWith("/")) {
    return cleaned.includes("/api/v1") || cleaned.includes("/api")
      ? cleaned
      : `${cleaned}/api/v1`;
  }

  return `/${cleaned}`;
};

export const buildGoogleAuthUrl = (provided = "", host = "") => {
  const baseUrl = resolveApiBaseUrl(provided, host);
  return `${baseUrl}/auth/google`;
};
