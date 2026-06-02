import { useState, useEffect, useCallback } from "react";
import { Plus, Library, FileText, Calendar, Search, BookOpen } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Drawer } from "../components/ui/Drawer.jsx";
import { Input, Field } from "../components/ui/Input.jsx";
import { CardGrid, ItemCard } from "../components/ui/CardGrid.jsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import { truncate } from "../lib/format.js";

export function Syllabus({ api, toast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api("/v1/admin/syllabus"));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [api, toast]);

  useEffect(() => { load(); }, [load]);

  function startCreate() {
    setEditing(null);
    setForm({ title: "", category: "", source_name: "", source_year: "", content: "" });
    setError("");
    setOpen(true);
  }
  function startEdit(item) {
    setEditing(item);
    setForm({ ...item, source_year: item.source_year ?? "" });
    setError("");
    setOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = { ...form, source_year: form.source_year ? Number(form.source_year) : null };
      if (editing) {
        await api(`/v1/admin/syllabus/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast.success("Syllabus updated");
      } else {
        await api("/v1/admin/syllabus", { method: "POST", body: JSON.stringify(payload) });
        toast.success("Syllabus created");
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
      await api(`/v1/admin/syllabus/${confirmDelete.id}`, { method: "DELETE" });
      toast.success("Syllabus deleted");
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
    return !q || s.title?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-5 max-w-7xl">
      <PageHeader
        eyebrow="References"
        title="Syllabus"
        description="Syllabus documents and reference material that back the question bank. Linked to the AI tutor for context."
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
            New Syllabus
          </Button>
        }
      />

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search syllabus…" className="pl-9" />
        </div>
        <span className="text-xs text-slate-500 ml-auto">{filtered.length} of {items.length}</span>
      </div>

      {loading && items.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-2xl bg-surface-100/40 animate-pulse" />)}
        </div>
      ) : (
        <CardGrid
          items={filtered}
          emptyTitle="No syllabus entries"
          emptyDescription="Add syllabus docs to anchor the AI tutor to official exam content."
          emptyIcon={Library}
          columnsClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          onEdit={startEdit}
          onDelete={setConfirmDelete}
          renderCard={(s) => (
            <ItemCard color="#60a5fa">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white line-clamp-1">{s.title}</p>
                  <p className="text-[11px] text-slate-500 capitalize">{s.category || "Uncategorized"}</p>
                </div>
              </div>
              {s.content && (
                <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">{truncate(s.content, 140)}</p>
              )}
              <div className="mt-3 pt-3 border-t border-orange-500/8 flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate flex-1">{s.source_name || "—"}</span>
                {s.source_year && (
                  <span className="ml-2 flex items-center gap-1 shrink-0">
                    <Calendar className="w-3 h-3" />
                    {s.source_year}
                  </span>
                )}
              </div>
            </ItemCard>
          )}
        />
      )}

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit syllabus" : "New syllabus entry"}
        description={editing ? "Update syllabus details and content." : "Add a new syllabus document to back the AI tutor."}
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
              {editing ? "Save changes" : "Create syllabus"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Field label="Title" required>
              <Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </Field>
          </div>
          <Field label="Category" hint="e.g. General Knowledge">
            <Input value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="General Knowledge" />
          </Field>
          <Field label="Source name" hint="e.g. Loksewa Ayog 2081">
            <Input value={form.source_name || ""} onChange={(e) => setForm({ ...form, source_name: e.target.value })} placeholder="Loksewa Ayog 2081" />
          </Field>
          <Field label="Source year">
            <Input type="number" value={form.source_year ?? ""} onChange={(e) => setForm({ ...form, source_year: e.target.value })} placeholder="2081" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Content" hint="Paste the full syllabus text. The AI tutor will use this for context.">
              <textarea
                value={form.content || ""}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={8}
                className="w-full rounded-xl bg-surface-100/80 border border-orange-500/12 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 transition-all hover:border-orange-500/30 focus:border-orange-500/60 focus:outline-none focus:ring-2 focus:ring-orange-500/15 resize-y min-h-32"
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
        title="Delete this syllabus entry?"
        message={`"${confirmDelete?.title}" will be removed permanently and won't be available as AI tutor context.`}
        confirmLabel="Delete"
        danger
        busy={busy}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
