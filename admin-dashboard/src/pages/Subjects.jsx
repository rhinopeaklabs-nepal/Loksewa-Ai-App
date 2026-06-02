import { useState, useEffect, useCallback } from "react";
import { Plus, BookOpen, Layers, Search, FileText, Hash, Palette } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Card, CardBody } from "../components/ui/Card.jsx";
import { Drawer } from "../components/ui/Drawer.jsx";
import { Input, Select, Field } from "../components/ui/Input.jsx";
import { CardGrid, ItemCard } from "../components/ui/CardGrid.jsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import { StatusBadge } from "../components/ui/Badge.jsx";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" }
];

export function Subjects({ api, toast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
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
      setItems(await api("/v1/admin/subjects"));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [api, toast]);

  useEffect(() => { load(); }, [load]);

  function startCreate() {
    setEditing(null);
    setForm({ slug: "", title: "", icon: "school", color: "#f97316", sort_order: 0, status: "published", description: "" });
    setError("");
    setOpen(true);
  }
  function startEdit(item) {
    setEditing(item);
    setForm({ ...item });
    setError("");
    setOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = { ...form, sort_order: Number(form.sort_order || 0) };
      if (editing) {
        await api(`/v1/admin/subjects/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast.success("Subject updated");
      } else {
        await api("/v1/admin/subjects", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Subject created");
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
      await api(`/v1/admin/subjects/${confirmDelete.id}`, { method: "DELETE" });
      toast.success("Subject archived");
      setConfirmDelete(null);
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  const filtered = items.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.title?.toLowerCase().includes(q) || s.slug?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col gap-5 max-w-7xl">
      <PageHeader
        eyebrow="Curriculum"
        title="Subjects"
        description="Top-level learning areas. Group courses and surface them in mobile discovery."
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
            New Subject
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subjects…"
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="max-w-44"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
        <span className="text-xs text-slate-500 ml-auto">{filtered.length} of {items.length}</span>
      </div>

      {/* Card grid */}
      {loading && items.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-surface-100/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <CardGrid
          items={filtered}
          emptyTitle="No subjects yet"
          emptyDescription="Create your first subject to start organising courses."
          emptyIcon={Layers}
          onEdit={startEdit}
          onDelete={setConfirmDelete}
          renderCard={(s) => (
            <ItemCard color={s.color || "#f97316"}>
              <div className="flex items-start gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-base shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${s.color || "#f97316"} 0%, ${s.color || "#fb923c"}cc 100%)`,
                    boxShadow: `0 0 12px ${s.color || "#f97316"}40`
                  }}
                >
                  {(s.title || "?").slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{s.title}</p>
                  <p className="text-[11px] text-slate-500 truncate font-mono">{s.slug}</p>
                </div>
              </div>
              {s.description && (
                <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">{s.description}</p>
              )}
              <div className="mt-3 flex items-center justify-between gap-2">
                <StatusBadge value={s.status} />
                <span className="text-[10px] text-slate-500 font-medium">#{s.sort_order || 0}</span>
              </div>
            </ItemCard>
          )}
        />
      )}

      {/* Drawer */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit subject" : "New subject"}
        description={editing ? "Update the subject details and save." : "Create a new subject to organize courses."}
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
              {editing ? "Save changes" : "Create subject"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Title" required>
            <Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </Field>
          <Field label="Slug" required>
            <Input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} required placeholder="loksewa-general-knowledge" />
          </Field>
          <Field label="Icon key">
            <Input value={form.icon || ""} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="school" />
          </Field>
          <Field label="Accent color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.color || "#f97316"}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-10 h-10 rounded-xl border border-orange-500/15 bg-surface-100 cursor-pointer"
              />
              <Input value={form.color || ""} onChange={(e) => setForm({ ...form, color: e.target.value })} className="flex-1" />
            </div>
          </Field>
          <Field label="Sort order">
            <Input type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
          </Field>
          <Field label="Status">
            <Select value={form.status || "published"} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Description">
              <textarea
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded-xl bg-surface-100/80 border border-orange-500/12 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 transition-all hover:border-orange-500/30 focus:border-orange-500/60 focus:outline-none focus:ring-2 focus:ring-orange-500/15 resize-y min-h-24"
              />
            </Field>
          </div>
          {error && (
            <div className="md:col-span-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>
          )}
        </form>
      </Drawer>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Archive this subject?"
        message={`"${confirmDelete?.title}" will be archived. Existing courses stay available but won't appear in published mobile lists.`}
        confirmLabel="Archive"
        danger
        busy={busy}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
