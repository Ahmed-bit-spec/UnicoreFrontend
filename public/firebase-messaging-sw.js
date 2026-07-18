/* global importScripts, firebase */

// FCM service worker for background notifications.
// This file lives in /public so it is served at "/firebase-messaging-sw.js".

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

const init = async () => {
  try {
    const res = await fetch("/api/v1/auth/firebase-config", { credentials: "include" });
    const data = await res.json();
    const cfg = data?.config;

    if (!cfg?.apiKey || !cfg?.projectId || !cfg?.messagingSenderId || !cfg?.appId) {
      // Misconfigured — skip initialization.
      return;
    }

    firebase.initializeApp(cfg);
    const messaging = firebase.messaging();

    // Show notifications when app is in the background.
    messaging.onBackgroundMessage((payload) => {
      const title = payload?.notification?.title || payload?.data?.title || "UNISO";
      const body = payload?.notification?.body || payload?.data?.body || "";
      const url = payload?.data?.url || "/";

      self.registration.showNotification(title, {
        body,
        icon: "/favicon.ico",
        data: { url },
      });
    });
  } catch {
    // ignore
  }
};

init();

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/";
  event.waitUntil(self.clients.openWindow(url));
});

