import { useState, useEffect, useCallback } from "react";
import { ClipboardList, Plus, Pencil, Trash2, Clock, Award, FileQuestion, Hash, Search, X } from "lucide-react";
import { Card, CardHeader, CardBody } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input, Select, Textarea, Field } from "../components/ui/Input.jsx";
import { Drawer } from "../components/ui/Drawer.jsx";
import { StatusBadge } from "../components/ui/Badge.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { cn } from "../lib/cn.js";

const emptyForm = {
  title: "",
  description: "",
  exam_level: "",
  exam_type: "",
  syllabus_category: "",
  duration_minutes: 45,
  marks_per_correct: 1,
  negative_marking_enabled: true,
  negative_marks_per_wrong: 0.2,
  status: "draft",
  question_ids_text: ""
};

export function Mocks({ api, toast }) {
  const [items, setItems] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mocks, qs] = await Promise.all([
        api("/v1/admin/mock-tests"),
        api("/v1/admin/questions")
      ]);
      setItems(mocks);
      setQuestions(qs);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [api, toast]);

  useEffect(() => { load(); }, [load]);

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setOpen(true);
  }
  function startEdit(item) {
    setEditing(item);
    setForm({ ...item, question_ids_text: (item.question_ids || []).join(", ") });
    setError("");
    setOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const ids = (form.question_ids_text || "")
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isInteger(n) && n > 0);
      const payload = {
        ...form,
        duration_minutes: Number(form.duration_minutes),
        marks_per_correct: Number(form.marks_per_correct),
        negative_marks_per_wrong: Number(form.negative_marks_per_wrong),
        question_ids: ids
      };
      delete payload.question_ids_text;
      if (editing) {
        await api(`/v1/admin/mock-tests/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast.success("Mock test updated");
      } else {
        await api(`/v1/admin/mock-tests`, { method: "POST", body: JSON.stringify(payload) });
        toast.success("Mock test created");
      }
      setOpen(false);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function archive(id) {
    if (!confirm("Archive this mock test?")) return;
    try {
      await api(`/v1/admin/mock-tests/${id}`, { method: "DELETE" });
      toast.success("Mock test archived");
      await load();
    } catch (e) { toast.error(e.message); }
  }

  function toggleQuestionInForm(id) {
    const current = (form.question_ids_text || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (current.includes(String(id))) {
      setForm({ ...form, question_ids_text: current.filter((q) => q !== String(id)).join(", ") });
    } else {
      setForm({ ...form, question_ids_text: [...current, String(id)].join(", ") });
    }
  }

  const selectedIds = (form.question_ids_text || "").split(",").map((s) => s.trim()).filter(Boolean);
  const filteredQs = questions.filter((q) => {
    if (!pickerQuery) return true;
    return (q.question_text || "").toLowerCase().includes(pickerQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-5 max-w-7xl">
      <PageHeader
        eyebrow="Assessments"
        title="Mock tests"
        description="Real-exam style tests. Pick questions from the bank, set duration and marking, and publish when ready."
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
            New mock test
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-24"><Spinner size={28} className="text-orange-400" /></div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No mock tests yet"
          description="Create your first mock test to make it available in the mobile app."
          action={<Button onClick={startCreate} leftIcon={<Plus className="w-4 h-4" />}>Create first</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {items.map((m) => (
            <MockCard key={m.id} mock={m} onEdit={() => startEdit(m)} onArchive={() => archive(m.id)} />
          ))}
        </div>
      )}

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit mock test" : "New mock test"}
        width="max-w-2xl"
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
              {editing ? "Save changes" : "Create mock test"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Title" required className="md:col-span-2">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </Field>
          <Field label="Exam level">
            <Input value={form.exam_level || ""} onChange={(e) => setForm({ ...form, exam_level: e.target.value })} />
          </Field>
          <Field label="Exam type">
            <Input value={form.exam_type || ""} onChange={(e) => setForm({ ...form, exam_type: e.target.value })} />
          </Field>
          <Field label="Syllabus category" className="md:col-span-2">
            <Input value={form.syllabus_category || ""} onChange={(e) => setForm({ ...form, syllabus_category: e.target.value })} />
          </Field>
          <Field label="Duration (minutes)" type="number" required>
            <Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} required />
          </Field>
          <Field label="Marks per correct" type="number" required>
            <Input type="number" step="0.01" value={form.marks_per_correct} onChange={(e) => setForm({ ...form, marks_per_correct: e.target.value })} required />
          </Field>
          <Field label="Negative marking">
            <Select value={String(form.negative_marking_enabled)} onChange={(e) => setForm({ ...form, negative_marking_enabled: e.target.value === "true" })}>
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </Select>
          </Field>
          <Field label="Penalty per wrong" type="number">
            <Input type="number" step="0.01" value={form.negative_marks_per_wrong} onChange={(e) => setForm({ ...form, negative_marks_per_wrong: e.target.value })} />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>
          </Field>
          <Field label="Description" className="md:col-span-2">
            <Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </Field>
          <Field label="Question IDs" hint="Comma separated question IDs from the bank" className="md:col-span-2">
            <div className="flex gap-2">
              <Input
                value={form.question_ids_text || ""}
                onChange={(e) => setForm({ ...form, question_ids_text: e.target.value })}
                placeholder="1, 2, 3"
              />
              <Button type="button" variant="secondary" onClick={() => setPickerOpen(true)} leftIcon={<FileQuestion className="w-4 h-4" />}>
                Pick
              </Button>
            </div>
            {selectedIds.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedIds.map((id) => (
                  <Badge key={id} tone="brand">
                    <Hash className="w-3 h-3" />
                    {id}
                  </Badge>
                ))}
              </div>
            )}
          </Field>
          {error && (
            <div className="md:col-span-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
              {error}
            </div>
          )}
        </form>
      </Drawer>

      <Drawer
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Pick questions"
        description="Select the questions that will appear in this mock test."
        width="max-w-3xl"
      >
        <div className="flex flex-col gap-3">
          <Input
            value={pickerQuery}
            onChange={(e) => setPickerQuery(e.target.value)}
            placeholder="Search questions…"
          />
          <div className="text-xs text-slate-500">
            {selectedIds.length} selected
          </div>
          <div className="max-h-[60vh] overflow-y-auto -mx-2 px-2 space-y-1.5">
            {filteredQs.map((q) => {
              const id = String(q.id);
              const selected = selectedIds.includes(id);
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => toggleQuestionInForm(q.id)}
                  className={cn(
                    "w-full text-left rounded-xl border px-3 py-2.5 transition-colors",
                    selected
                      ? "border-orange-500/50 bg-orange-500/10"
                      : "border-orange-500/10 bg-surface-50/40 hover:bg-orange-500/5 hover:border-orange-500/25"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5",
                      selected ? "bg-orange-500 text-white" : "bg-surface-200 text-slate-500"
                    )}>
                      {q.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 line-clamp-2">{q.question_text}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {q.syllabus_category && <Badge tone="info">{q.syllabus_category}</Badge>}
                        <StatusBadge value={q.verification_status} />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Drawer>
    </div>
  );
}

function MockCard({ mock, onEdit, onArchive }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-orange-500/8 bg-gradient-to-br from-surface-100/60 to-surface-50/40 backdrop-blur p-5 hover:border-orange-500/20 transition-all flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge value={mock.status} />
            {mock.exam_level && <Badge tone="info">{mock.exam_level}</Badge>}
          </div>
          <h3 className="text-sm font-bold text-white leading-snug">{mock.title}</h3>
          {mock.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{mock.description}</p>}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onArchive} className="text-rose-400 hover:bg-rose-500/10">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-auto">
        <div className="rounded-xl bg-surface-100/60 border border-orange-500/10 p-2.5">
          <div className="flex items-center gap-1 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
            <Clock className="w-3 h-3" /> Time
          </div>
          <p className="text-sm font-bold text-white mt-1">{mock.duration_minutes}m</p>
        </div>
        <div className="rounded-xl bg-surface-100/60 border border-orange-500/10 p-2.5">
          <div className="flex items-center gap-1 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
            <Award className="w-3 h-3" /> Marking
          </div>
          <p className="text-sm font-bold text-white mt-1">
            +{mock.marks_per_correct}
            {mock.negative_marking_enabled && <span className="text-rose-400 text-xs font-medium"> / -{mock.negative_marks_per_wrong}</span>}
          </p>
        </div>
        <div className="rounded-xl bg-surface-100/60 border border-orange-500/10 p-2.5">
          <div className="flex items-center gap-1 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
            <FileQuestion className="w-3 h-3" /> Questions
          </div>
          <p className="text-sm font-bold text-white mt-1">{mock.total_questions || 0}</p>
        </div>
      </div>
    </div>
  );
}
