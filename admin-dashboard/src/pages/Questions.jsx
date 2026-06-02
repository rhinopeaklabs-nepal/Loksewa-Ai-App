import { useState, useEffect, useCallback } from "react";
import { FileQuestion, CheckCircle2, AlertCircle, Filter, X, Check } from "lucide-react";
import { Card, CardBody } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input, Select, Textarea, Field } from "../components/ui/Input.jsx";
import { Drawer } from "../components/ui/Drawer.jsx";
import { Tabs } from "../components/ui/Tabs.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { Badge, StatusBadge } from "../components/ui/Badge.jsx";
import { truncate } from "../lib/format.js";
import { cn } from "../lib/cn.js";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "needs_review", label: "Needs review" },
  { value: "verified", label: "Verified" },
  { value: "draft", label: "Draft" },
  { value: "rejected", label: "Rejected" }
];

const emptyForm = {
  question_text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: "A",
  explanation: "",
  syllabus_category: "",
  source_name: "",
  source_license: "",
  verifier: "",
  exam_level: "",
  exam_type: "",
  language: "ne",
  verification_status: "needs_review"
};

export function Questions({ api, toast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab) params.set("verification_status", activeTab);
      if (search) params.set("query", search);
      const query = params.toString();
      setItems(await api(`/v1/admin/questions${query ? "?" + query : ""}`));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [api, toast, activeTab, search]);

  useEffect(() => { load(); }, [load]);

  const tabs = STATUS_TABS.map((t) => ({
    ...t,
    count: t.value === activeTab ? items.length : undefined
  }));

  function startEdit(item) {
    setEditing(item);
    setForm({ ...item });
    setOpen(true);
    setError("");
  }

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (editing) {
        await api(`/v1/admin/questions/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
        toast.success("Question updated");
      } else {
        await api(`/v1/admin/questions`, { method: "POST", body: JSON.stringify(form) });
        toast.success("Question created");
      }
      setOpen(false);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function verify(id) {
    try {
      await api(`/v1/admin/questions/${id}`, { method: "PUT", body: JSON.stringify({ verification_status: "verified" }) });
      toast.success("Question verified");
      await load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function reject(id) {
    if (!confirm("Reject this question?")) return;
    try {
      await api(`/v1/admin/questions/${id}`, { method: "DELETE" });
      toast.success("Question rejected");
      await load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  const counts = items.reduce((acc, item) => {
    acc[item.verification_status] = (acc[item.verification_status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-5 max-w-7xl">
      <PageHeader
        eyebrow="Content"
        title="Question bank"
        description="The questions students see in the app. Verify answers, manage sources, and curate the best set."
        actions={
            <Button
              onClick={handleSubmit}
              loading={busy}
              className="font-bold text-white"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)",
                boxShadow: "0 0 16px rgba(249,115,22,0.35)"
              }}
            >
              {editing ? "Save changes" : "Create question"}
            </Button>
        }
      />

      <Tabs
        items={[
          { value: "", label: "All", count: items.length },
          { value: "needs_review", label: "Needs review", icon: AlertCircle, count: counts.needs_review || 0 },
          { value: "verified", label: "Verified", icon: CheckCircle2, count: counts.verified || 0 },
          { value: "draft", label: "Draft", count: counts.draft || 0 },
          { value: "rejected", label: "Rejected", count: counts.rejected || 0 }
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />

      <div className="flex items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search question text, category, sourceâ€¦"
          className="max-w-md"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Spinner size={28} className="text-orange-400" /></div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={FileQuestion}
          title="No questions in this view"
          description="Try a different filter or create a new question."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {items.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              onEdit={() => startEdit(q)}
              onVerify={() => verify(q.id)}
              onReject={() => reject(q.id)}
            />
          ))}
        </div>
      )}

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit question" : "New question"}
        description={editing ? "Update the question, options, and metadata." : "Add a new question to the bank."}
        width="max-w-2xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
            <Button onClick={handleSubmit} loading={busy}>
              {editing ? "Save changes" : "Create question"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Question" required className="md:col-span-2">
            <Textarea
              value={form.question_text}
              onChange={(e) => setForm({ ...form, question_text: e.target.value })}
              rows={3}
              required
            />
          </Field>
          {["A", "B", "C", "D"].map((letter) => (
            <Field key={letter} label={`Option ${letter}`} required>
              <Input
                value={form[`option_${letter.toLowerCase()}`]}
                onChange={(e) => setForm({ ...form, [`option_${letter.toLowerCase()}`]: e.target.value })}
                required
              />
            </Field>
          ))}
          <Field label="Correct answer" required>
            <Select value={form.correct_option} onChange={(e) => setForm({ ...form, correct_option: e.target.value })}>
              {["A", "B", "C", "D"].map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
          </Field>
          <Field label="Status" required>
            <Select value={form.verification_status} onChange={(e) => setForm({ ...form, verification_status: e.target.value })}>
              <option value="needs_review">Needs review</option>
              <option value="verified">Verified</option>
              <option value="draft">Draft</option>
              <option value="rejected">Rejected</option>
            </Select>
          </Field>
          <Field label="Category" className="md:col-span-2">
            <Input value={form.syllabus_category || ""} onChange={(e) => setForm({ ...form, syllabus_category: e.target.value })} />
          </Field>
          <Field label="Exam level">
            <Input value={form.exam_level || ""} onChange={(e) => setForm({ ...form, exam_level: e.target.value })} placeholder="e.g. loksewa-administrative" />
          </Field>
          <Field label="Exam type">
            <Input value={form.exam_type || ""} onChange={(e) => setForm({ ...form, exam_type: e.target.value })} placeholder="e.g. written" />
          </Field>
          <Field label="Source name">
            <Input value={form.source_name || ""} onChange={(e) => setForm({ ...form, source_name: e.target.value })} />
          </Field>
          <Field label="License">
            <Input value={form.source_license || ""} onChange={(e) => setForm({ ...form, source_license: e.target.value })} />
          </Field>
          <Field label="Verifier">
            <Input value={form.verifier || ""} onChange={(e) => setForm({ ...form, verifier: e.target.value })} />
          </Field>
          <Field label="Language" required>
            <Select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
              <option value="ne">Nepali</option>
              <option value="en">English</option>
            </Select>
          </Field>
          <Field label="Explanation" className="md:col-span-2">
            <Textarea
              value={form.explanation || ""}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              rows={3}
            />
          </Field>
          {error && (
            <div className="md:col-span-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
              {error}
            </div>
          )}
        </form>
      </Drawer>
    </div>
  );
}

function QuestionCard({ question, onEdit, onVerify, onReject }) {
  const correctLetter = question.correct_option;
  return (
      <div
      className="group relative overflow-hidden rounded-2xl border border-orange-500/8 bg-gradient-to-br from-surface-100/60 to-surface-50/40 backdrop-blur p-4 hover:border-orange-500/20 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">#{question.id}</span>
          <StatusBadge value={question.verification_status} />
          {question.exam_level && (
            <Badge tone="info">{question.exam_level}</Badge>
          )}
          {question.syllabus_category && (
            <Badge tone="brand">{question.syllabus_category}</Badge>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {question.verification_status !== "verified" && (
            <Button variant="ghost" size="sm" onClick={onVerify} className="text-emerald-400 hover:bg-emerald-500/10">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </Button>
          )}
          {question.verification_status !== "rejected" && (
            <Button variant="ghost" size="sm" onClick={onReject} className="text-rose-400 hover:bg-rose-500/10">
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
        </div>
      </div>
      <p className="text-sm text-slate-200 mb-3 leading-relaxed">{question.question_text}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {["a", "b", "c", "d"].map((letter) => {
          const isCorrect = correctLetter?.toLowerCase() === letter;
          return (
            <div
              key={letter}
              className={cn(
                "rounded-lg border px-3 py-2 text-xs",
                isCorrect
                  ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-100"
                  : "border-surface-300 bg-surface-100/40 text-slate-400"
              )}
            >
              <span className={cn("font-semibold uppercase mr-2", isCorrect ? "text-emerald-400" : "text-slate-500")}>
                {letter}
              </span>
              {question[`option_${letter}`]}
              {isCorrect && <Check className="w-3 h-3 inline-block ml-2 text-emerald-400" />}
            </div>
          );
        })}
      </div>
      {question.explanation && (
        <p className="text-[11px] text-slate-500 mt-3 line-clamp-2">
          <span className="font-semibold text-slate-400">Explanation:</span> {truncate(question.explanation, 200)}
        </p>
      )}
    </div>
  );
}
