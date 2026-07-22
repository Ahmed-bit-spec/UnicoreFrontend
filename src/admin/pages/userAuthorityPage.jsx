import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  Shield,
  Key,
  ClipboardList,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Pencil,
  RefreshCw,
  X,
  Check,
  ChevronRight,
  UserCheck,
  Loader2,
  Plus,
} from "lucide-react";

import { useLanguage } from "@/hooks/useLanguage";

import {
  fetchAdminUsers,
  fetchAdminRoles,
  fetchAdminAuditLogs,
  fetchAllPermissions,
  updateAdminRole,
  updateAdminRolePermissions,
  updateAdminUserRole,
  updateAdminUserStatus,
  createAdminRole,
  deleteAdminRole,
} from "@/api/admin";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ROLE_COLORS = {
  admin: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
  librarian: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
  teacher: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  student: { bg: "bg-[#2C2DE0] dark:bg-[#2C2DE0]/30", text: "text-[#2C2DE0] dark:text-[#2C2DE0]", dot: "bg-[#2C2DE0]" },
  guest: { bg: "bg-slate-100 dark:bg-slate-700", text: "text-slate-600 dark:text-slate-300", dot: "bg-slate-400" },
};
const FALLBACK_ROLE_COLOR = { bg: "bg-slate-100 dark:bg-slate-700", text: "text-slate-700 dark:text-slate-300", dot: "bg-slate-400" };
const roleColor = (name) => ROLE_COLORS[name] || FALLBACK_ROLE_COLOR;

const STATUS_CONFIG = {
  active: { icon: CheckCircle2, color: "text-[#2C2DE0] dark:text-[#2C2DE0]", bg: "bg-[#2C2DE0] dark:bg-[#2C2DE0]/20", label: "Active" },
  suspended: { icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", label: "Suspended" },
  banned: { icon: XCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20", label: "Banned" },
  pending: { icon: AlertCircle, color: "text-slate-500 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-900/20", label: "Pending" },
};

const formatRelativeTime = (date) => {
  if (!date) return "Never";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

const getPermissionCategory = (perm) => perm.split(".")[0];

const groupPermissions = (permissions) =>
  permissions.reduce((acc, p) => {
    const cat = getPermissionCategory(p);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

const getErrorMessage = (err, fallback) =>
  err?.response?.data?.message || err?.message || fallback;

// ─── Avatar ───────────────────────────────────────────────────────────────────
const UserAvatar = ({ user, size = "md" }) => {
  const sizeMap = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-11 h-11 text-base" };
  const initials = (user.name || user.fullName || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["bg-[#2C2DE0]", "bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500"];
  const color = colors[initials.charCodeAt(0) % colors.length];

  if (user.avatar || user.photo) {
    return <img src={user.avatar || user.photo} alt={user.name} className={`${sizeMap[size]} rounded-full object-cover`} />;
  }
  return <div className={`${sizeMap[size]} ${color} rounded-full flex items-center justify-center text-white font-semibold`}>{initials}</div>;
};

const RoleBadge = ({ role, t }) => {
  const cfg = roleColor(role);
  const label = t.userAuthority.roleLabels[role] || role;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {label}
    </span>
  );
};

const StatusBadge = ({ status, t }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {t.userAuthority.statuses[status] || status}
    </span>
  );
};

const InlineError = ({ message }) => {
  if (!message) return null;
  return (
    <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-red-700 dark:text-red-300">{message}</p>
    </div>
  );
};

const Modal = ({ open, onClose, title, children, width = "max-w-lg" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${width} bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

// ─── Role Change Modal (assigns a role to a user) ───────────────────────────
const RoleChangeModal = ({ user, roles, onClose, onSave, t }) => {
  const [selectedRole, setSelectedRole] = useState(user?.role || "student");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (selectedRole === user.role) return onClose();
    setSaving(true);
    setError(null);
    try {
      await onSave(user._id, selectedRole);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Could not update this user's role. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const ua = t.userAuthority;
  return (
    <Modal open={!!user} onClose={onClose} title={ua.roleModal.title}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
          <UserAvatar user={user} size="md" />
          <div>
            <p className="font-medium text-slate-900 dark:text-white text-sm">{user.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
          <div className="ml-auto"><RoleBadge role={user.role} t={t} /></div>
        </div>

        <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300">{ua.roleModal.warningMessage}</p>
        </div>

        <InlineError message={error} />

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{ua.roleModal.newRole}</label>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((role) => {
              const cfg = roleColor(role.name);
              const isSelected = selectedRole === role.name;
              return (
                <button
                  key={role._id}
                  onClick={() => setSelectedRole(role.name)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? `border-[#2C2DE0] ${cfg.bg}`
                      : "border-slate-200 dark:border-slate-600 hover:border-[#2C2DE0] dark:hover:border-[#2C2DE0]"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${isSelected ? cfg.text : "text-slate-700 dark:text-slate-300"}`}>
                      {role.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{role.permissions?.length} perms</p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#2C2DE0] dark:text-[#2C2DE0] ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            {ua.roleModal.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || selectedRole === user.role}
            className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#2C2DE0] hover:bg-[#2C2DE0] disabled:opacity-50 text-white rounded-xl transition-colors flex items-center justify-center gap-2 text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />{ua.roleModal.saving}</> : ua.roleModal.confirm}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Status Change Modal ──────────────────────────────────────────────────────
const StatusChangeModal = ({ user, onClose, onSave, t }) => {
  const [selectedStatus, setSelectedStatus] = useState(user?.accountStatus || "active");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const ua = t.userAuthority;
  const statuses = ["active", "suspended", "banned", "pending"];

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(user._id, selectedStatus, reason);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Could not update this user's status. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={!!user} onClose={onClose} title={ua.statusModal.title}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
          <UserAvatar user={user} />
          <div>
            <p className="font-medium text-slate-900 dark:text-white text-sm">{user.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
          <div className="ml-auto"><StatusBadge status={user.accountStatus} t={t} /></div>
        </div>

        <InlineError message={error} />

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{ua.statusModal.newStatus}</label>
          <div className="grid grid-cols-2 gap-2">
            {statuses.map((s) => {
              const cfg = STATUS_CONFIG[s];
              const Icon = cfg.icon;
              const isSelected = selectedStatus === s;
              return (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? `border-[#2C2DE0] ${cfg.bg}`
                      : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? cfg.color : "text-slate-400"}`} />
                  <span className={`text-sm font-medium ${isSelected ? cfg.color : "text-slate-700 dark:text-slate-300"}`}>
                    {ua.statuses[s]}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-[#2C2DE0] dark:text-[#2C2DE0] ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{ua.statusModal.reason}</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={ua.statusModal.reasonPlaceholder}
            rows={2}
            className="w-full text-sm px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2C2DE0] resize-none"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            {ua.statusModal.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#2C2DE0] hover:bg-[#2C2DE0] disabled:opacity-50 text-white rounded-xl transition-colors flex items-center justify-center gap-2 text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />{ua.statusModal.saving}</> : ua.statusModal.confirm}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Role Edit Modal (label/description/color/permissions on an EXISTING role) ─
const RoleEditModal = ({ role, allPermissions, onClose, onSave, t }) => {
  const ua = t.userAuthority;
  const [form, setForm] = useState({
    label: role?.label || "",
    description: role?.description || "",
    color: role?.color || "#2C2DE0",
    permissions: role?.permissions || [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const grouped = useMemo(() => groupPermissions(allPermissions), [allPermissions]);

  const togglePerm = (perm) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(perm)
        ? f.permissions.filter((p) => p !== perm)
        : [...f.permissions, perm],
    }));
  };

  const toggleCategory = (cat, perms) => {
    const allSelected = perms.every((p) => form.permissions.includes(p));
    setForm((f) => ({
      ...f,
      permissions: allSelected
        ? f.permissions.filter((p) => !perms.includes(p))
        : [...new Set([...f.permissions, ...perms])],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(role._id, form);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Could not save this role. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={!!role} onClose={onClose} title={`${ua.roles.editRole}: ${role?.label || role?.name}`} width="max-w-2xl">
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        <InlineError message={error} />

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{ua.roleForm.description}</label>
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full text-sm px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{ua.roleForm.color}</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{form.color}</span>
            </div>
          </div>
        </div>

        {/* Permissions — what this role CAN DO */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{ua.roleForm.permissions}</label>
            <span className="text-xs text-[#2C2DE0] dark:text-[#2C2DE0] font-medium">{form.permissions.length} / {allPermissions.length} selected</span>
          </div>
          <div className="space-y-3">
            {Object.entries(grouped).map(([cat, perms]) => {
              const allSelected = perms.every((p) => form.permissions.includes(p));
              const someSelected = perms.some((p) => form.permissions.includes(p));
              return (
                <div key={cat} className="border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleCategory(cat, perms)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left ${allSelected ? "bg-[#2C2DE0] dark:bg-[#2C2DE0]/20" : someSelected ? "bg-slate-50 dark:bg-slate-700/50" : "bg-white dark:bg-slate-800"} transition-colors`}
                  >
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {ua.permissions.categories[cat] || cat}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{perms.filter((p) => form.permissions.includes(p)).length}/{perms.length}</span>
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${allSelected ? "bg-[#2C2DE0] border-[#2C2DE0]" : someSelected ? "border-[#2C2DE0]" : "border-slate-300 dark:border-slate-500"}`}>
                        {allSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        {someSelected && !allSelected && <div className="w-2 h-0.5 bg-[#2C2DE0]" />}
                      </div>
                    </div>
                  </button>
                  <div className="grid grid-cols-2 gap-1 p-3 bg-white dark:bg-slate-800/50">
                    {perms.map((perm) => {
                      const isOn = form.permissions.includes(perm);
                      return (
                        <button
                          key={perm}
                          onClick={() => togglePerm(perm)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-colors ${isOn ? "bg-[#2C2DE0] dark:bg-[#2C2DE0]/20 text-[#2C2DE0] dark:text-[#2C2DE0]" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${isOn ? "bg-[#2C2DE0] border-[#2C2DE0]" : "border-slate-300 dark:border-slate-500"}`}>
                            {isOn && <Check className="w-2 h-2 text-white" />}
                          </div>
                          <span className="text-xs font-mono">{perm}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          {ua.roleForm.cancel}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#2C2DE0] hover:bg-[#2C2DE0] disabled:opacity-50 text-white rounded-xl transition-colors flex items-center justify-center gap-2 text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />{ua.roleForm.saving}</> : ua.roleForm.save}
        </button>
      </div>
    </Modal>
  );
};

// ─── Role Create Modal (brand-new custom role, e.g. "guest") ────────────────
const RoleCreateModal = ({ open, allPermissions, onClose, onSave, t }) => {
  const ua = t.userAuthority;
  const emptyForm = { name: "", label: "", description: "", color: "#2C2DE0", permissions: [] };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const grouped = useMemo(() => groupPermissions(allPermissions), [allPermissions]);

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const togglePerm = (perm) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(perm) ? f.permissions.filter((p) => p !== perm) : [...f.permissions, perm],
    }));
  };

  const toggleCategory = (cat, perms) => {
    const allSelected = perms.every((p) => form.permissions.includes(p));
    setForm((f) => ({
      ...f,
      permissions: allSelected
        ? f.permissions.filter((p) => !perms.includes(p))
        : [...new Set([...f.permissions, ...perms])],
    }));
  };

  const handleSave = async () => {
    const cleanName = form.name.trim().toLowerCase().replace(/\s+/g, "_");
    if (!cleanName) {
      setError(ua.roleForm.nameRequired || "Role name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({ ...form, name: cleanName, label: form.label || cleanName });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Could not create this role. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={ua.roles.createRole} width="max-w-2xl">
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        <InlineError message={error} />

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{ua.roleForm.internalName}</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. guest"
              className="w-full text-sm px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{ua.roleForm.displayLabel}</label>
            <input
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="e.g. Guest"
              className="w-full text-sm px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{ua.roleForm.color}</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">{ua.roleForm.description}</label>
          <input
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full text-sm px-3 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{ua.roleForm.permissions}</label>
            <span className="text-xs text-[#2C2DE0] dark:text-[#2C2DE0] font-medium">{form.permissions.length} / {allPermissions.length} selected</span>
          </div>
          <div className="space-y-3">
            {Object.entries(grouped).map(([cat, perms]) => {
              const allSelected = perms.every((p) => form.permissions.includes(p));
              const someSelected = perms.some((p) => form.permissions.includes(p));
              return (
                <div key={cat} className="border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleCategory(cat, perms)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left ${allSelected ? "bg-[#2C2DE0] dark:bg-[#2C2DE0]/20" : someSelected ? "bg-slate-50 dark:bg-slate-700/50" : "bg-white dark:bg-slate-800"} transition-colors`}
                  >
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {ua.permissions.categories[cat] || cat}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{perms.filter((p) => form.permissions.includes(p)).length}/{perms.length}</span>
                  </button>
                  <div className="grid grid-cols-2 gap-1 p-3 bg-white dark:bg-slate-800/50">
                    {perms.map((perm) => {
                      const isOn = form.permissions.includes(perm);
                      return (
                        <button
                          key={perm}
                          onClick={() => togglePerm(perm)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-colors ${isOn ? "bg-[#2C2DE0] dark:bg-[#2C2DE0]/20 text-[#2C2DE0] dark:text-[#2C2DE0]" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${isOn ? "bg-[#2C2DE0] border-[#2C2DE0]" : "border-slate-300 dark:border-slate-500"}`}>
                            {isOn && <Check className="w-2 h-2 text-white" />}
                          </div>
                          <span className="text-xs font-mono">{perm}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
        <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          {ua.roleForm.cancel}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#2C2DE0] hover:bg-[#2C2DE0] disabled:opacity-50 text-white rounded-xl transition-colors flex items-center justify-center gap-2 text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group"
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />{ua.roleForm.saving}</> : ua.roles.createRole}
        </button>
      </div>
    </Modal>
  );
};

// ─── Role Delete Confirm Modal ───────────────────────────────────────────────
// Deleting a role only reassigns THAT role's users to Student. Every other
// role's users are completely unaffected — enforced server-side in
// deleteRole (RoleController.js), which scopes the User.updateMany() to
// { role: role.name }.
const RoleDeleteModal = ({ role, onClose, onConfirm, t }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const ua = t.userAuthority;

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await onConfirm(role._id);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete this role. Please try again."));
    } finally {
      setDeleting(false);
    }
  };

  const count = role?.userCount ?? 0;
  const warning = (ua.roles.deleteWarning || "This role has {count} user(s). They will be moved to the Student role. Users in every other role are not affected.").replace(
    "{count}",
    count
  );

  return (
    <Modal open={!!role} onClose={onClose} title={ua.roles.deleteRole}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
          <div className={`w-9 h-9 ${roleColor(role?.name).bg} ${roleColor(role?.name).text} rounded-xl flex items-center justify-center font-bold text-sm`}>
            {(role?.label || role?.name || "?")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white text-sm">{role?.label || role?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{count} user(s) currently in this role</p>
          </div>
        </div>

        <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 dark:text-red-300">{warning}</p>
        </div>

        <InlineError message={error} />

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            {ua.roleForm.cancel}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {deleting ? <><Loader2 className="w-4 h-4 animate-spin" />{ua.roles.deleting}</> : ua.roles.confirmDelete}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ─── USERS TAB ────────────────────────────────────────────────────────────────
const UsersTab = ({ t, users, roles, loading, onRoleChange, onStatusChange }) => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [statusModalUser, setStatusModalUser] = useState(null);
  const ua = t.userAuthority;

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      const matchStatus = statusFilter === "all" || (u.accountStatus || u.status) === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => (u.accountStatus || u.status) === "active").length,
  }), [users]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: ua.users.totalUsers, value: stats.total, color: "text-slate-900 dark:text-white", icon: Users },
          { label: ua.users.activeUsers, value: stats.active, color: "text-[#2C2DE0] dark:text-[#2C2DE0]", icon: UserCheck },
          { label: ua.roleLabels.teacher, value: users.filter((u) => u.role === "teacher").length, color: "text-amber-600 dark:text-amber-400", icon: Shield },
          { label: ua.roleLabels.librarian, value: users.filter((u) => u.role === "librarian").length, color: "text-blue-600 dark:text-blue-400", icon: Key },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={ua.users.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]"
        >
          <option value="all">{ua.users.allRoles}</option>
          {roles.map((r) => <option key={r._id} value={r.name}>{r.label}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]"
        >
          <option value="all">{ua.users.allStatuses}</option>
          {["active", "suspended", "banned", "pending"].map((s) => (
            <option key={s} value={s}>{ua.statuses[s]}</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-500 dark:text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />{ua.users.loading}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500">
            <Users className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">{ua.users.empty}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                  {Object.values(ua.users.tableHeaders).map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name || user.fullName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><RoleBadge role={user.role} t={t} /></td>
                    <td className="px-4 py-3"><StatusBadge status={user.accountStatus || user.status || "active"} t={t} /></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs flex items-center gap-1 ${user.emailVerified || user.isVerified ? "text-[#2C2DE0] dark:text-[#2C2DE0]" : "text-slate-400"}`}>
                          {user.emailVerified || user.isVerified ? <CheckCircle2 className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          Email
                        </span>
                        <span className={`text-xs flex items-center gap-1 ${user.isUniversityVerified ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}>
                          {user.isUniversityVerified ? <CheckCircle2 className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          Uni
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{formatRelativeTime(user.lastLogin)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setRoleModalUser(user)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-[#2C2DE0] dark:bg-[#2C2DE0]/20 text-[#2C2DE0] dark:text-[#2C2DE0] hover:bg-[#2C2DE0] dark:hover:bg-[#2C2DE0]/40 rounded-lg transition-colors"
                        >
                          <Shield className="w-3 h-3" />
                          {ua.users.actions.editRole}
                        </button>
                        <button
                          onClick={() => setStatusModalUser(user)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                        >
                          <UserCheck className="w-3 h-3" />
                          {ua.users.actions.editStatus}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {roleModalUser && (
        <RoleChangeModal user={roleModalUser} roles={roles} onClose={() => setRoleModalUser(null)} onSave={onRoleChange} t={t} />
      )}
      {statusModalUser && (
        <StatusChangeModal user={statusModalUser} onClose={() => setStatusModalUser(null)} onSave={onStatusChange} t={t} />
      )}
    </div>
  );
};

// ─── ROLES TAB ────────────────────────────────────────────────────────────────
// Roles are no longer limited to a fixed set of 4. Admins can now:
//  - CREATE a brand-new custom role (e.g. "guest") with its own permissions
//  - EDIT any role's label/description/color/permissions
//  - DELETE any non-system role — this only reassigns THAT role's users to
//    Student and never touches users belonging to any other role.
// "admin" and "student" are marked isSystem and cannot be deleted, since the
// app depends on both of them existing.
const RolesTab = ({ t, roles, allPermissions, loading, onUpdateRole, onCreateRole, onDeleteRole }) => {
  const [editingRole, setEditingRole] = useState(null);
  const [deletingRole, setDeletingRole] = useState(null);
  const [creating, setCreating] = useState(false);
  const ua = t.userAuthority;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{ua.roles.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {roles.length} {roles.length === 1 ? "role" : "roles"}
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-[#2C2DE0] hover:bg-[#2C2DE0] text-white rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          {ua.roles.createRole}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-slate-500 dark:text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />{ua.loading}
        </div>
      ) : roles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500">
          <Shield className="w-10 h-10 mb-2 opacity-30" />
          <p className="text-sm">{ua.roles.noRoles}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roles.map((role) => {
            const cfg = roleColor(role.name);
            return (
              <div key={role._id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:border-[#2C2DE0] dark:hover:border-[#2C2DE0] transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${cfg.bg} ${cfg.text} rounded-xl flex items-center justify-center font-bold text-sm`}>
                      {(role.label || role.name)[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{role.label || role.name}</p>
                        {role.isSystem && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded font-medium uppercase tracking-wide">
                            {ua.roles.systemBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{role.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingRole(role)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title={ua.roles.editRole}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {!role.isSystem && (
                      <button
                        onClick={() => setDeletingRole(role)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title={ua.roles.deleteRole}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{role.userCount ?? 0}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{ua.roles.usersCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{role.permissions?.length ?? 0}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{ua.roles.permissions}</span>
                  </div>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: role.color || "#2C2DE0" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editingRole && (
        <RoleEditModal
          role={editingRole}
          allPermissions={allPermissions}
          onClose={() => setEditingRole(null)}
          onSave={onUpdateRole}
          t={t}
        />
      )}

      {deletingRole && (
        <RoleDeleteModal
          role={deletingRole}
          onClose={() => setDeletingRole(null)}
          onConfirm={onDeleteRole}
          t={t}
        />
      )}

      <RoleCreateModal
        open={creating}
        allPermissions={allPermissions}
        onClose={() => setCreating(false)}
        onSave={onCreateRole}
        t={t}
      />
    </div>
  );
};

// ─── PERMISSIONS TAB ──────────────────────────────────────────────────────────
const PermissionsTab = ({ t, roles, allPermissions, onSavePermissions }) => {
  const ua = t.userAuthority;
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const selectedRole = roles.find((r) => r._id === selectedRoleId);
  const grouped = useMemo(() => groupPermissions(allPermissions), [allPermissions]);

  useEffect(() => {
    if (!selectedRoleId && roles.length > 0) {
      setSelectedRoleId(roles[0]._id);
    }
  }, [roles, selectedRoleId]);

  useEffect(() => {
    if (selectedRole) setPermissions([...selectedRole.permissions]);
  }, [selectedRoleId, selectedRole]);

  const togglePerm = (perm) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
    setSaved(false);
  };

  const toggleCat = (cat, perms) => {
    const allOn = perms.every((p) => permissions.includes(p));
    setPermissions((prev) =>
      allOn ? prev.filter((p) => !perms.includes(p)) : [...new Set([...prev, ...perms])]
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSavePermissions(selectedRoleId, permissions);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(getErrorMessage(err, "Could not save these permissions. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  if (!selectedRole) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500">
        <Key className="w-10 h-10 mb-2 opacity-30" />
        <p className="text-sm">{ua.permissions.selectRole}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{ua.permissions.title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{ua.permissions.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]"
          >
            {roles.map((r) => (
              <option key={r._id} value={r._id}>{r.label || r.name}</option>
            ))}
          </select>
          <button
            onClick={handleSave}
            disabled={saving || !selectedRoleId}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
              saved
                ? "bg-[#2C2DE0] dark:bg-[#2C2DE0]/30 text-[#2C2DE0] dark:text-[#2C2DE0]"
                : "bg-[#2C2DE0] hover:bg-[#2C2DE0] text-white"
            } disabled:opacity-50 text-white text-sm font-bold shadow-[0_4px_0_#1E1FAA] hover:translate-y-0.5 hover:shadow-[0_2px_0_#1E1FAA] active:translate-y-1 active:shadow-none transition-all duration-150 group`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
            {saving ? ua.permissions.saving : saved ? ua.permissions.successMessage : ua.permissions.saveChanges}
          </button>
        </div>
      </div>

      <InlineError message={error} />

      <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
        <div className={`w-8 h-8 ${roleColor(selectedRole.name).bg} ${roleColor(selectedRole.name).text} rounded-lg flex items-center justify-center font-bold text-sm`}>
          {(selectedRole.label || selectedRole.name)[0].toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-slate-900 dark:text-white text-sm">{selectedRole.label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{permissions.length} / {allPermissions.length} permissions active</p>
        </div>
        <div className="ml-auto">
          <div className="w-32 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-[#2C2DE0] rounded-full transition-all" style={{ width: `${allPermissions.length ? (permissions.length / allPermissions.length) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(grouped).map(([cat, perms]) => {
          const activeCount = perms.filter((p) => permissions.includes(p)).length;
          const allActive = activeCount === perms.length;
          return (
            <div key={cat} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {ua.permissions.categories[cat] || cat}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${activeCount > 0 ? "bg-[#2C2DE0] dark:bg-[#2C2DE0]/30 text-[#2C2DE0] dark:text-[#2C2DE0]" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>
                    {activeCount}/{perms.length}
                  </span>
                </div>
                <button
                  onClick={() => toggleCat(cat, perms)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${allActive ? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600" : "bg-[#2C2DE0] dark:bg-[#2C2DE0]/20 text-[#2C2DE0] dark:text-[#2C2DE0] hover:bg-[#2C2DE0] dark:hover:bg-[#2C2DE0]/40"}`}
                >
                  {allActive ? ua.deselectAll : ua.selectAll}
                </button>
              </div>
              <div className="p-3 space-y-1">
                {perms.map((perm) => {
                  const isOn = permissions.includes(perm);
                  const action = perm.split(".")[1];
                  return (
                    <label
                      key={perm}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-colors ${isOn ? "bg-[#2C2DE0] dark:bg-[#2C2DE0]/20" : "hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
                    >
                      <div
                        onClick={() => togglePerm(perm)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-all ${isOn ? "bg-[#2C2DE0] border-[#2C2DE0]" : "border-slate-300 dark:border-slate-500"}`}
                      >
                        {isOn && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize">{action}</span>
                        <span className="ml-1.5 text-xs text-slate-400 font-mono opacity-60">{perm}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── AUDIT LOG TAB ────────────────────────────────────────────────────────────
const AuditLogTab = ({ t, logs, loading }) => {
  const ua = t.userAuthority;
  const [actionFilter, setActionFilter] = useState("all");

  const filtered = useMemo(() =>
    logs.filter((l) => actionFilter === "all" || l.action === actionFilter),
    [logs, actionFilter]
  );

  const actionColors = {
    role_created: "bg-[#2C2DE0] dark:bg-[#2C2DE0]/30 text-[#2C2DE0] dark:text-[#2C2DE0]",
    role_updated: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    role_deleted: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    role_permissions_updated: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
    university_verification_completed: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
    user_logged_in: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{ua.auditLog.title}</h2>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#2C2DE0]"
        >
          <option value="all">{ua.auditLog.allActions}</option>
          {Object.entries(ua.auditLog.actions).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-500 dark:text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />{ua.auditLog.loading}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500">
            <ClipboardList className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">{ua.auditLog.empty}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filtered.map((log) => (
              <div key={log._id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className={`flex-shrink-0 mt-0.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${actionColors[log.action] || "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"}`}>
                  {ua.auditLog.actions[log.action] || log.action}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 dark:text-slate-200">
                    <span className="font-medium">{log.userId?.name || "System"}</span>
                    {" — "}
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">
                      {JSON.stringify(log.details).slice(0, 80)}
                    </span>
                  </p>
                  {log.performedBy && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      by {log.performedBy?.name}
                    </p>
                  )}
                </div>
                <p className="flex-shrink-0 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  {formatRelativeTime(log.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function UserAuthorityPage() {
  const { t } = useLanguage();
  const ua = t.userAuthority;

  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(true);
  const [pageError, setPageError] = useState(null);

  // ── Data fetching ──────────────────────────────────────────────────────────
  // IMPORTANT: sendPaginated() on the backend returns the array directly under
  // `data` (i.e. res.data.data IS the array of users/logs) — there is no
  // nested `.users` / `.auditLogs` key. sendSuccess() (used for roles and
  // permissions) DOES nest under a named key. These two response shapes are
  // different on purpose, so don't "fix" them to match each other — just
  // unwrap each one correctly, as below.
  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetchAdminUsers({ limit: 200 });
      setUsers(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Failed to load users:", err);
      setPageError(getErrorMessage(err, "Could not load users from the server."));
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const loadRoles = useCallback(async () => {
    setLoadingRoles(true);
    try {
      const res = await fetchAdminRoles();
      setRoles(res?.data?.data?.roles ?? []);
    } catch (err) {
      console.error("Failed to load roles:", err);
      setPageError(getErrorMessage(err, "Could not load roles from the server."));
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  const loadAuditLogs = useCallback(async () => {
    setLoadingAuditLogs(true);
    try {
      const res = await fetchAdminAuditLogs();
      setAuditLogs(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoadingAuditLogs(false);
    }
  }, []);

  const loadPermissionRegistry = useCallback(async () => {
    try {
      const res = await fetchAllPermissions();
      setAllPermissions(res?.data?.data?.permissions ?? []);
    } catch (err) {
      console.error("Failed to load permission registry:", err);
    }
  }, []);

  const loadData = useCallback(() => {
    setPageError(null);
    loadUsers();
    loadRoles();
    loadAuditLogs();
    loadPermissionRegistry();
  }, [loadUsers, loadRoles, loadAuditLogs, loadPermissionRegistry]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleRoleChange = async (userId, newRole) => {
    await updateAdminUserRole(userId, newRole);
    await loadUsers();
  };

  const handleStatusChange = async (userId, newStatus, reason) => {
    await updateAdminUserStatus(userId, newStatus, reason);
    await loadUsers();
  };

  // Edits label/description/color/permissions on an EXISTING role.
  const handleUpdateRole = async (id, data) => {
    await updateAdminRole(id, data);
    await loadRoles();
  };

  const handleSavePermissions = async (roleId, permissions) => {
    await updateAdminRolePermissions(roleId, permissions);
    await loadRoles();
  };

  // Creates a brand-new custom role (e.g. "guest"). Not limited to the
  // original 4 fixed roles.
  const handleCreateRole = async (data) => {
    await createAdminRole(data);
    await loadRoles();
  };

  // Deletes a non-system role. The backend scopes the reassignment query to
  // only users currently holding THIS role — every other role's users are
  // untouched. "admin" and "student" are isSystem and cannot be deleted
  // (button is hidden for them, and the server rejects it anyway).
  const handleDeleteRole = async (id) => {
    await deleteAdminRole(id);
    await loadRoles();
    await loadUsers(); // some users may have been reassigned to student
  };

  const tabs = [
    { id: "users", label: ua.tabs.users, icon: Users, count: users.length },
    { id: "roles", label: ua.tabs.roles, icon: Shield, count: roles.length },
    { id: "permissions", label: ua.tabs.permissions, icon: Key },
    { id: "auditLog", label: ua.tabs.auditLog, icon: ClipboardList, count: auditLogs.length },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-2">
              <span>Admin</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-800 dark:text-slate-200 font-medium">{ua.breadcrumb || ua.title}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-9 h-9 bg-[#2C2DE0] rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              {ua.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{ua.subtitle}</p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loadingUsers || loadingRoles ? "animate-spin" : ""}`} />
            {ua.retry}
          </button>
        </div>

        {pageError && (
          <div className="flex gap-2 p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{pageError}</p>
          </div>
        )}

        <div className="flex gap-1 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl mb-6 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-1 justify-center ${
                activeTab === id
                  ? "bg-[#2C2DE0] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  activeTab === id ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "users" && (
          <UsersTab
            t={t}
            users={users}
            roles={roles}
            loading={loadingUsers}
            onRoleChange={handleRoleChange}
            onStatusChange={handleStatusChange}
          />
        )}
        {activeTab === "roles" && (
          <RolesTab
            t={t}
            roles={roles}
            allPermissions={allPermissions}
            loading={loadingRoles}
            onUpdateRole={handleUpdateRole}
            onCreateRole={handleCreateRole}
            onDeleteRole={handleDeleteRole}
          />
        )}
        {activeTab === "permissions" && (
          <PermissionsTab
            t={t}
            roles={roles}
            allPermissions={allPermissions}
            onSavePermissions={handleSavePermissions}
          />
        )}
        {activeTab === "auditLog" && (
          <AuditLogTab t={t} logs={auditLogs} loading={loadingAuditLogs} />
        )}
      </div>
    </div>
  );
}