import axios from "axios";

const client = axios.create({ withCredentials: true });

// ── Profile (bio + skills only — academic fields are read-only, verified data) ──
export const getMySettings = () =>
  client.get("/api/v1/communityusers/settings").then((r) => r.data);

export const updateProfile = ({ bio, skills, photoFile }) => {
  const fd = new FormData();
  if (bio !== undefined) fd.append("bio", bio);
  if (skills !== undefined) fd.append("skills", JSON.stringify(skills));
  if (photoFile) fd.append("photo", photoFile);
  return client
    .put("/api/v1/communityusers/settings/profile", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

// ── Notifications ──
export const updateNotificationPrefs = (prefs) =>
  client.put("/api/v1/communityusers/settings/notifications", prefs).then((r) => r.data);

// ── Privacy ──
export const updatePrivacyPrefs = (prefs) =>
  client.put("/api/v1/communityusers/settings/privacy", prefs).then((r) => r.data);

// ── Security ──
export const changePassword = ({ currentPassword, newPassword }) =>
  client
    .put("/api/v1/auth/update-password", { currentPassword, newPassword })
    .then((r) => r.data);

export const getActiveSessions = () =>
  client.get("/api/v1/auth/sessions").then((r) => r.data);

export const logoutOtherDevices = () =>
  client.post("/api/v1/auth/logout-others").then((r) => r.data);