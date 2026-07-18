import axios from "axios";
import { getToken } from "firebase/messaging";
import { getMessagingSafe } from "./firebase";

const todayKey = () => {
  const d = new Date();
  return `push_prompt_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const shouldPromptToday = () => {
  try {
    return !localStorage.getItem(todayKey());
  } catch {
    return true;
  }
};

export const markPromptedToday = () => {
  try {
    localStorage.setItem(todayKey(), "1");
  } catch { /* ignore */ }
};

export const requestPushPermission = async () => {
  markPromptedToday();

  if (!("Notification" in window)) return { ok: false, reason: "unsupported" };
  if (!("serviceWorker" in navigator)) return { ok: false, reason: "no_sw" };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: permission };

  const messaging = await getMessagingSafe();
  if (!messaging) return { ok: false, reason: "messaging_unsupported" };

  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) return { ok: false, reason: "missing_vapid" };

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) return { ok: false, reason: "no_token" };

  await axios.post("/api/v1/auth/fcm-token", { token }, { withCredentials: true });

  return { ok: true, token };
};
