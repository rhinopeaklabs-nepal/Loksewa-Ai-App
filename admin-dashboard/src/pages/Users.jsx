import { useState, useEffect, useCallback } from "react";
import { Plus, Users as UsersIcon, Mail, UserCog, ShieldCheck, ShieldOff, Search, Calendar, UserCheck, UserX } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Drawer } from "../components/ui/Drawer.jsx";
import { Input, Select, Field } from "../components/ui/Input.jsx";
import { CardGrid, ItemCard } from "../components/ui/CardGrid.jsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import { StatusBadge, Badge } from "../components/ui/Badge.jsx";
import { Avatar } from "../components/ui/Avatar.jsx";
import { formatDateTime } from "../lib/format.js";

const ROLE_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "reviewer", label: "Reviewer" },
  { value: "admin", label: "Admin" }
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" }
];

const ROLE_COLORS = {
  admin: "#fb923c",
  reviewer: "#fbbf24",
  student: "#60a5fa"
};

const ROLE_ICONS = {
  admin: ShieldCheck,
  reviewer: UserCog,
  student: UsersIcon
};

export function Users({ api, toast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api("/v1/admin/users"));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [api, toast]);

  useEffect(() => { load(); }, [load]);

  function startCreate() {
    setEditing(null);
    setForm({ email: "", full_name: "", role: "student", status: "active", password: "" });
    setError("");
    setOpen(true);
  }
  function startEdit(item) {
    setEditing(item);
    setForm({ ...item, password: "" });
    setError("");
    setOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (editing) {
        const p = { ...form };
        if (!p.password) delete p.password;
        await api(`/v1/admin/users/${editing.id}`, { method: "PUT", body: JSON.stringify(p) });
        toast.success("User updated");
      } else {
        if (!form.password) throw new Error("Password is required for new users");
        await api("/v1/admin/users", { method: "POST", body: JSON.stringify(form) });
        toast.success("User created");
      }
      setOpen(false);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setBusy(true);
    try {
      await api(`/v1/admin/users/${confirmDelete.id}`, { method: "DELETE" });
      toast.success("User deleted");
      setConfirmDelete(null);
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  const filtered = items.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchStatus = !statusFilter || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="flex flex-col gap-5 max-w-7xl">
      <PageHeader
        eyebrow="Access"
        title="Users"
        description="Manage students, reviewers, and admins. Promote reviewers to help verify questions in the bank."
        actions={
          <Button
            onClick={startCreate}
            leftIcon={<Plus className="w-4 h-4" />}
            className="font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)",
              boxShadow: "0 0 16px rgba(249,115,22,0.35)"
            }}
          >
            New User
          </Button>
        }
      />

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…" className="pl-9" />
        </div>
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="max-w-40">
          <option value="">All roles</option>
          {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-40">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
        <span className="text-xs text-slate-500 ml-auto">{filtered.length} of {items.length}</span>
      </div>

      {loading && items.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-2xl bg-surface-100/40 animate-pulse" />)}
        </div>
      ) : (
        <CardGrid
          items={filtered}
          emptyTitle="No users yet"
          emptyDescription="Create your first student, reviewer, or admin account."
          emptyIcon={UsersIcon}
          columnsClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          onEdit={startEdit}
          onDelete={setConfirmDelete}
          renderCard={(u) => {
            const RoleIcon = ROLE_ICONS[u.role] || UsersIcon;
            const color = ROLE_COLORS[u.role] || "#60a5fa";
            return (
              <ItemCard color={color}>
                <div className="flex items-start gap-3">
                  <Avatar name={u.full_name || u.email} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate">{u.full_name || u.email}</p>
                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" />
                      {u.email}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <Badge tone={u.role === "admin" ? "brand" : u.role === "reviewer" ? "gold" : "info"} dot>
                    <span className="capitalize">{u.role}</span>
                  </Badge>
                  <StatusBadge value={u.status} />
                </div>
                <div className="mt-3 pt-3 border-t border-orange-500/8 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {u.last_login_at ? formatDateTime(u.last_login_at) : "Never logged in"}
                  </span>
                </div>
              </ItemCard>
            );
          }}
        />
      )}

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit user" : "New user"}
        description={editing ? "Update user details and permissions." : "Create a new user account."}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              loading={busy}
              className="font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)",
                boxShadow: "0 0 16px rgba(249,115,22,0.35)"
              }}
            >
              {editing ? "Save changes" : "Create user"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full name" required>
            <Input value={form.full_name || ""} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </Field>
          <Field label="Email" required>
            <Input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="user@loksewa.ai" />
          </Field>
          <Field label="Role" required>
            <Select value={form.role || "student"} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status || "active"} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </Field>
          <div className="md:col-span-2">
            <Field label={editing ? "New password (leave blank to keep existing)" : "Password"} required={!editing}>
              <Input type="password" value={form.password || ""} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required={!editing} />
            </Field>
          </div>
          {error && (
            <div className="md:col-span-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>
          )}
        </form>
      </Drawer>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete this user?"
        message={`"${confirmDelete?.email}" will be removed permanently. They won't be able to sign in anymore.`}
        confirmLabel="Delete"
        danger
        busy={busy}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
