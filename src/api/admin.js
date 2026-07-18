// ⚠️ Adjust this import path to wherever you saved the axios instance you
// just shared (e.g. "@/lib/axios", "@/api/axios", "./axios" — whatever it
// actually is in your project). It's a default export named `api`, so we
// alias it to `adminApi` here since every function below already calls it
// that.
import api from "./client";

const ADMIN_BASE = "/admin";

const buildParams = ({ page = 1, limit = 10, search = "", ...filters } = {}) => ({
  page,
  limit,
  ...(search ? { search } : {}),
  ...Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== "" && v !== "all")
  ),
});

// ─── Users ───────────────────────────────────────────────────────────────────
export const fetchAdminUsers = (params) =>
  adminApi.get(`${ADMIN_BASE}/users`, { params: buildParams(params) });

export const fetchAdminUser = (id) =>
  adminApi.get(`${ADMIN_BASE}/users/${id}`);

export const createAdminUser = (data) =>
  adminApi.post(`${ADMIN_BASE}/users`, data);

export const updateAdminUser = (id, data) =>
  adminApi.put(`${ADMIN_BASE}/users/${id}`, data);

// Analytics
export const fetchAnalyticsOverview = () => adminApi.get(`${ADMIN_BASE}/analytics/overview`);
export const fetchAnalyticsReservations = (period = "30d") => adminApi.get(`${ADMIN_BASE}/analytics/reservations`, { params: { period } });
export const fetchAnalyticsStudents = () => adminApi.get(`${ADMIN_BASE}/analytics/students`);
export const fetchAnalyticsBooks = () => adminApi.get(`${ADMIN_BASE}/analytics/books`);
export const fetchAnalyticsBorrowing = () => adminApi.get(`${ADMIN_BASE}/analytics/borrowing`);
export const fetchAnalyticsLibraryUsage = () => adminApi.get(`${ADMIN_BASE}/analytics/library-usage`);

export const updateAdminUserRole = (id, role) =>
  adminApi.put(`${ADMIN_BASE}/users/${id}/role`, { role });

export const updateAdminUserStatus = (id, status) =>
  adminApi.patch(`${ADMIN_BASE}/users/${id}/status`, { status });

export const updateAdminUserUniversityVerification = (id, universityVerified) =>
  adminApi.patch(`${ADMIN_BASE}/users/${id}/university-verification`, { universityVerified });

export const bulkUpdateAdminUsers = ({ ids, action, value }) =>
  adminApi.post(`${ADMIN_BASE}/users/bulk`, { ids, action, value });

export const fetchAdminUserAuditLogs = (id) =>
  adminApi.get(`${ADMIN_BASE}/users/${id}/audit-logs`);

export const deleteAdminUser = (id) =>
  adminApi.delete(`${ADMIN_BASE}/users/${id}`);

// ─── Registry (formerly "university students") ──────────────────────────────
// NOTE: the backend model is now `Registry`, not `UniversityStudent` — these
// still point at /university-students for backwards compat with your existing
// frontend page, but you may prefer to just call the /registry endpoints
// directly instead (see further below) since they're the same data now.
export const fetchUniversityStudents = (params) =>
  adminApi.get(`${ADMIN_BASE}/university-students`, { params: buildParams(params) });

export const createUniversityStudent = (data) =>
  adminApi.post(`${ADMIN_BASE}/university-students`, data);

export const updateUniversityStudent = (id, data) =>
  adminApi.put(`${ADMIN_BASE}/university-students/${id}`, data);

export const deleteUniversityStudent = (id) =>
  adminApi.delete(`${ADMIN_BASE}/university-students/${id}`);

export const bulkUpdateUniversityStudents = ({ ids, action, value }) =>
  adminApi.post(`${ADMIN_BASE}/university-students/bulk`, { ids, action, value });

// ─── Seats ────────────────────────────────────────────────────────────────────
export const fetchAdminSeats = (params) =>
  adminApi.get(`${ADMIN_BASE}/seats`, { params: buildParams(params) });

export const fetchAdminSeat = (id) =>
  adminApi.get(`${ADMIN_BASE}/seats/${id}`);

export const createAdminSeat = (data) =>
  adminApi.post(`${ADMIN_BASE}/seats`, data);

export const updateAdminSeat = (id, data) =>
  adminApi.put(`${ADMIN_BASE}/seats/${id}`, data);

export const deleteAdminSeat = (id) =>
  adminApi.delete(`${ADMIN_BASE}/seats/${id}`);

export const updateAdminSeatStatus = (id, status) =>
  adminApi.patch(`${ADMIN_BASE}/seats/${id}/status`, { status });

export const bulkUpdateAdminSeats = ({ ids, action, value }) =>
  adminApi.post(`${ADMIN_BASE}/seats/bulk`, { ids, action, value });

export const bulkGenerateAdminSeats = (data) =>
  adminApi.post(`${ADMIN_BASE}/seats/bulk-generate`, data);

export const fetchSeatTimeline = (id, date) =>
  adminApi.get(`${ADMIN_BASE}/seats/${id}/timeline`, { params: { date } });

export const fetchSeatReservations = (params) =>
  adminApi.get(`${ADMIN_BASE}/seat-reservations`, { params: buildParams(params) });

export const fetchSeatReservationStats = () =>
  adminApi.get(`${ADMIN_BASE}/seat-reservations/stats`);

export const fetchSeatReservation = (id) =>
  adminApi.get(`${ADMIN_BASE}/seat-reservations/${id}`);

export const adminCancelSeatReservation = (id) =>
  adminApi.patch(`${ADMIN_BASE}/seat-reservations/${id}/cancel`);

export const adminForceCompleteSeatReservation = (id) =>
  adminApi.patch(`${ADMIN_BASE}/seat-reservations/${id}/force-complete`);

export const adminMarkNoShow = (id) =>
  adminApi.patch(`${ADMIN_BASE}/seat-reservations/${id}/no-show`);

export const bulkUpdateSeatReservations = ({ ids, action }) =>
  adminApi.post(`${ADMIN_BASE}/seat-reservations/bulk`, { ids, action });

// ─── Books ───────────────────────────────────────────────────────────────────
export const fetchAdminBooks = (params) =>
  adminApi.get(`${ADMIN_BASE}/books`, { params: buildParams(params) });

export const createAdminBook = (data) =>
  adminApi.post(`${ADMIN_BASE}/books`, data);

export const updateAdminBook = (id, data) =>
  adminApi.put(`${ADMIN_BASE}/books/${id}`, data);

export const deleteAdminBook = (id) =>
  adminApi.delete(`${ADMIN_BASE}/books/${id}`);

// ─── Book reservations ────────────────────────────────────────────────────────
export const fetchBookReservations = (params) =>
  adminApi.get(`${ADMIN_BASE}/book-reservations`, { params: buildParams(params) });

export const updateBookReservationStatus = (id, status) =>
  adminApi.patch(`${ADMIN_BASE}/book-reservations/${id}`, { status });

// ─── QR check-in (fixed: now using adminApi, not bare axios) ────────────────
export const fetchQrStats = () =>
  adminApi.get(`${ADMIN_BASE}/reservations/qr-stats`);

export const lookupReservationByQr = (qrCode) =>
  adminApi.get(`${ADMIN_BASE}/reservations/lookup/qr/${qrCode}`);

export const lookupReservationById = (reservationId) =>
  adminApi.get(`${ADMIN_BASE}/reservations/lookup/id/${reservationId}`);

export const adminCheckinReservation = (reservationId) =>
  adminApi.post(`${ADMIN_BASE}/reservations/checkin/${reservationId}`);

export const adminCheckoutReservation = (reservationId) =>
  adminApi.post(`${ADMIN_BASE}/reservations/checkout/${reservationId}`);

// ─── Dashboard / Analytics ────────────────────────────────────────────────────
export const fetchAdminDashboard = () => adminApi.get(`${ADMIN_BASE}/dashboard`);

export const fetchAdminAnalytics = () => adminApi.get(`${ADMIN_BASE}/analytics`);

// ─── Roles ───────────────────────────────────────────────────────────────────
export const fetchAdminRoles = () =>
  adminApi.get(`${ADMIN_BASE}/roles`);

export const fetchAdminRole = (id) =>
  adminApi.get(`${ADMIN_BASE}/roles/${id}`);

export const createAdminRole = (data) =>
  adminApi.post(`${ADMIN_BASE}/roles`, data);

export const updateAdminRole = (id, data) =>
  adminApi.put(`${ADMIN_BASE}/roles/${id}`, data);

export const updateAdminRolePermissions = (id, permissions) =>
  adminApi.patch(`${ADMIN_BASE}/roles/${id}/permissions`, { permissions });

export const deleteAdminRole = (id) =>
  adminApi.delete(`${ADMIN_BASE}/roles/${id}`);

export const fetchAdminRoleUsers = (id, params = {}) =>
  adminApi.get(`${ADMIN_BASE}/roles/${id}/users`, { params });

export const fetchAllPermissions = () =>
  adminApi.get(`${ADMIN_BASE}/roles/permissions`);

// ─── Registry (admin CRUD — same backing model as university-students above) ─
export const fetchAdminRegistry = (params) =>
  adminApi.get(`${ADMIN_BASE}/registry`, { params: buildParams(params) });

export const fetchAdminRegistryEntry = (id) =>
  adminApi.get(`${ADMIN_BASE}/registry/${id}`);

export const createAdminRegistryEntry = (data) =>
  adminApi.post(`${ADMIN_BASE}/registry`, data);

export const updateAdminRegistryEntry = (id, data) =>
  adminApi.put(`${ADMIN_BASE}/registry/${id}`, data);

export const deleteAdminRegistryEntry = (id) =>
  adminApi.delete(`${ADMIN_BASE}/registry/${id}`);

export const bulkUpdateAdminRegistry = ({ ids, action }) =>
  adminApi.post(`${ADMIN_BASE}/registry/bulk`, { ids, action });

export const resetAdminRegistryPassword = (id, password) =>
  adminApi.post(`${ADMIN_BASE}/registry/${id}/reset-password`, { password });

export const unlinkAdminRegistryEntry = (id) =>
  adminApi.post(`${ADMIN_BASE}/registry/${id}/unlink`);

export const fetchAdminRegistryStats = () =>
  adminApi.get(`${ADMIN_BASE}/registry/stats`);

// ─── Audit logs ───────────────────────────────────────────────────────────────
export const fetchAdminAuditLogs = (params = {}) =>
  adminApi.get(`${ADMIN_BASE}/audit-logs`, { params });