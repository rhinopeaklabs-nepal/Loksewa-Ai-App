import { useState, useEffect, useCallback } from "react";
import { GraduationCap, Plus, Pencil, Trash2, Search, BookOpen, ListChecks, Brain, AlertTriangle, X, Save, FolderTree, ArrowLeft, Clock, FileQuestion, BookMarked } from "lucide-react";
import { Card, CardHeader, CardBody } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Input, Select, Textarea, Field } from "../components/ui/Input.jsx";
import { Drawer } from "../components/ui/Drawer.jsx";
import { Tabs } from "../components/ui/Tabs.jsx";
import { Badge, StatusBadge } from "../components/ui/Badge.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { truncate } from "../lib/format.js";
import { cn } from "../lib/cn.js";

const emptyCourse = {
  subject_id: "",
  slug: "",
  short_name: "",
  title: "",
  badge: "",
  description: "",
  coach_line: "",
  plan_line: "",
  teacher: "",
  lesson_count: 0,
  duration: "",
  level: "",
  progress: 0,
  ai_score: 0,
  icon: "book",
  color: "#635BFF",
  background: "#EEEAFE",
  sort_order: 0,
  status: "published"
};

export function Courses({ api, toast, refreshKey }) {
  const [items, setItems] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCourse);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("modules");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [courses, subs] = await Promise.all([
        api("/v1/admin/courses"),
        api("/v1/admin/subjects")
      ]);
      setItems(courses);
      setSubjects(subs);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [api, toast]);

  useEffect(() => { load(); }, [load, refreshKey]);

  useEffect(() => {
    if (!selectedId && items.length) setSelectedId(String(items[0].id));
  }, [items, selectedId]);

  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    let cancelled = false;
    (async () => {
      setDetailLoading(true);
      try {
        const data = await api(`/v1/admin/courses/${selectedId}/detail`);
        if (!cancelled) setDetail(data);
      } catch (e) {
        toast.error(e.message);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedId, api, toast]);

  function startCreate() {
    setEditing(null);
    setForm(emptyCourse);
    setError("");
    setOpen(true);
  }
  function startEdit(item) {
    setEditing(item);
    setForm({ ...item, subject_id: item.subject_id });
    setError("");
    setOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.subject_id) { setError("Select a subject before saving a course"); return; }
    setBusy(true);
    setError("");
    try {
      const payload = {
        ...form,
        subject_id: Number(form.subject_id),
        lesson_count: Number(form.lesson_count || 0),
        progress: Number(form.progress || 0),
        ai_score: Number(form.ai_score || 0),
        sort_order: Number(form.sort_order || 0)
      };
      if (editing) {
        await api(`/v1/admin/courses/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
        toast.success("Course updated");
      } else {
        await api(`/v1/admin/courses`, { method: "POST", body: JSON.stringify(payload) });
        toast.success("Course created");
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
    if (!confirm("Archive this course? It will disappear from mobile discovery.")) return;
    try {
      await api(`/v1/admin/courses/${id}`, { method: "DELETE" });
      toast.success("Course archived");
      await load();
      if (String(id) === selectedId) setSelectedId(null);
    } catch (e) {
      toast.error(e.message);
    }
  }

  const filteredItems = items.filter((item) => {
    if (!search) return true;
    const text = `${item.title} ${item.subject_title || ""} ${item.slug}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-5 max-w-7xl">
      <PageHeader
        eyebrow="Curriculum"
        title="Courses"
        description="Courses group learning modules, AI tasks, practice questions, and weak-topic recommendations. Edit the course detail on the right after selecting a course."
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
            New course
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: Course list */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coursesâ€¦"
              className="pl-9"
            />
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16"><Spinner className="text-orange-400" /></div>
          ) : filteredItems.length === 0 ? (
            <EmptyState icon={GraduationCap} title="No courses yet" description="Create a course to start adding modules and tasks." />
          ) : (
            <div className="flex flex-col gap-2">
              {filteredItems.map((course) => (
                <CourseRow
                  key={course.id}
                  course={course}
                  active={String(course.id) === selectedId}
                  onClick={() => setSelectedId(String(course.id))}
                  onEdit={() => startEdit(course)}
                  onArchive={() => archive(course.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Course detail */}
        <div className="lg:col-span-3">
          {!selectedId ? (
            <EmptyState icon={GraduationCap} title="Select a course" description="Pick a course from the list to manage its modules, tasks, and questions." />
          ) : detailLoading ? (
            <div className="flex items-center justify-center py-24"><Spinner size={28} className="text-orange-400" /></div>
          ) : detail ? (
            <CourseDetail
              course={detail.course}
              modules={detail.modules || []}
              tasks={detail.tasks || []}
              questions={detail.questions || []}
              mistakes={detail.mistakes || []}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              api={api}
              toast={toast}
              reload={async () => {
                setDetail(await api(`/v1/admin/courses/${selectedId}/detail`));
                await load();
              }}
            />
          ) : null}
        </div>
      </div>

      {/* Course form drawer */}
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit course" : "New course"}
        description="Configure the course shell. Detail content lives in the modules, tasks, questions, and weak-topic tabs."
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
              {editing ? "Save changes" : "Create course"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Subject" required className="md:col-span-2">
            <Select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} required>
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.title} ({s.slug})</option>
              ))}
            </Select>
          </Field>
          <Field label="Slug" required>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          </Field>
          <Field label="Short name">
            <Input value={form.short_name || ""} onChange={(e) => setForm({ ...form, short_name: e.target.value })} />
          </Field>
          <Field label="Title" required className="md:col-span-2">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </Field>
          <Field label="Badge">
            <Input value={form.badge || ""} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="NEW" />
          </Field>
          <Field label="Teacher">
            <Input value={form.teacher || ""} onChange={(e) => setForm({ ...form, teacher: e.target.value })} />
          </Field>
          <Field label="Lessons" type="number">
            <Input type="number" value={form.lesson_count ?? 0} onChange={(e) => setForm({ ...form, lesson_count: e.target.value })} />
          </Field>
          <Field label="Duration">
            <Input value={form.duration || ""} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="6 weeks" />
          </Field>
          <Field label="Level">
            <Input value={form.level || ""} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="Beginner" />
          </Field>
          <Field label="Progress" type="number">
            <Input type="number" value={form.progress ?? 0} onChange={(e) => setForm({ ...form, progress: e.target.value })} />
          </Field>
          <Field label="AI score" type="number">
            <Input type="number" value={form.ai_score ?? 0} onChange={(e) => setForm({ ...form, ai_score: e.target.value })} />
          </Field>
          <Field label="Icon key">
            <Input value={form.icon || "book"} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          </Field>
          <Field label="Sort order" type="number">
            <Input type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
          </Field>
          <Field label="Accent" type="color">
            <Input type="color" value={form.color || "#635BFF"} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10 w-20" />
          </Field>
          <Field label="Soft bg" type="color">
            <Input type="color" value={form.background || "#EEEAFE"} onChange={(e) => setForm({ ...form, background: e.target.value })} className="h-10 w-20" />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>
          </Field>
          <Field label="Description" className="md:col-span-2">
            <Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Coach line" className="md:col-span-2">
            <Input value={form.coach_line || ""} onChange={(e) => setForm({ ...form, coach_line: e.target.value })} placeholder="A short line shown on the course card" />
          </Field>
          <Field label="AI plan line" className="md:col-span-2">
            <Input value={form.plan_line || ""} onChange={(e) => setForm({ ...form, plan_line: e.target.value })} placeholder="What the AI will plan for this learner" />
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

function CourseRow({ course, active, onClick, onEdit, onArchive }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group rounded-xl border p-3 cursor-pointer transition-all",
        active
          ? "border-orange-500/50 bg-orange-500/5 shadow-[0_0_0_1px_rgb(249,115,22,0.4),0_0_16px_rgba(249,115,22,0.15)]"
          : "border-orange-500/10 bg-surface-50/40 hover:border-orange-500/20 hover:bg-surface-100/40"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
          style={{ background: course.color || "#635BFF" }}
        >
          <GraduationCap className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-200 truncate">{course.title}</p>
            {course.badge && <Badge tone="brand">{course.badge}</Badge>}
          </div>
          <p className="text-xs text-slate-500 truncate">{course.subject_title} Â· {course.lesson_count} lessons</p>
          <div className="flex items-center gap-2 mt-1.5">
            <StatusBadge value={course.status} />
            <span className="text-[10px] text-slate-500">AI {course.ai_score}</span>
            <span className="text-[10px] text-slate-500">Â· {course.progress}%</span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onArchive(); }} className="text-rose-400 hover:bg-rose-500/10">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function CourseDetail({ course, modules, tasks, questions, mistakes, activeTab, setActiveTab, api, toast, reload }) {
  return (
    <Card>
      <CardHeader
        title={course.title}
        subtitle={`${course.subject_title || ""} Â· ${course.lesson_count || 0} lessons Â· AI score ${course.ai_score || 0}`}
        action={<StatusBadge value={course.status} />}
      />
      <Tabs
        items={[
          { value: "modules", label: "Modules", icon: FolderTree, count: modules.length },
          { value: "tasks", label: "AI tasks", icon: ListChecks, count: tasks.length },
          { value: "questions", label: "Flow questions", icon: Brain, count: questions.length },
          { value: "mistakes", label: "Weak topics", icon: AlertTriangle, count: mistakes.length }
        ]}
        value={activeTab}
        onChange={setActiveTab}
      />
      <CardBody>
        {activeTab === "modules" && <ModulesTab items={modules} courseId={course.id} api={api} toast={toast} reload={reload} />}
        {activeTab === "tasks" && <TasksTab items={tasks} courseId={course.id} api={api} toast={toast} reload={reload} />}
        {activeTab === "questions" && <FlowQuestionsTab items={questions} courseId={course.id} api={api} toast={toast} reload={reload} />}
        {activeTab === "mistakes" && <MistakesTab items={mistakes} courseId={course.id} api={api} toast={toast} reload={reload} />}
      </CardBody>
    </Card>
  );
}

function DetailSection({ items, emptyTitle, emptyDescription, columns, onAdd, addLabel, renderForm }) {
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">{items.length} {items.length === 1 ? "item" : "items"}</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); onAdd?.(); }} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          {addLabel}
        </Button>
      </div>
      {items.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="rounded-xl border border-orange-500/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-100/40 border-b border-orange-500/10">
                {columns.map((col) => (
                  <th key={col.key} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">{col.label}</th>
                ))}
                <th className="px-3 py-2 w-px"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-orange-500/8 last:border-0 hover:bg-surface-100/30">
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-2.5">{col.render ? col.render(item) : item[col.key]}</td>
                  ))}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(item); setFormOpen(true); }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {renderForm?.({ open: formOpen, onClose: () => setFormOpen(false), editing, setEditing })}
    </div>
  );
}

function ModulesTab({ items, courseId, api, toast, reload }) {
  const empty = { title: "", lessons: 0, duration: "", progress: 0, locked: false, sort_order: 0 };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function startNew() { setForm(empty); setEditingId(null); setError(""); setOpen(true); }
  function startEdit(item) { setForm({ ...item }); setEditingId(item.id); setError(""); setOpen(true); }
  async function save() {
    setBusy(true);
    setError("");
    try {
      const payload = {
        ...form,
        lessons: Number(form.lessons || 0),
        progress: Number(form.progress || 0),
        sort_order: Number(form.sort_order || 0),
        locked: Boolean(form.locked)
      };
      if (editingId) await api(`/v1/admin/course-modules/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
      else await api(`/v1/admin/courses/${courseId}/modules`, { method: "POST", body: JSON.stringify(payload) });
      toast.success(editingId ? "Module updated" : "Module added");
      setOpen(false);
      await reload();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function remove(id) {
    if (!confirm("Delete this module?")) return;
    await api(`/v1/admin/course-modules/${id}`, { method: "DELETE" });
    toast.success("Module deleted");
    await reload();
  }

  return (
    <DetailSection
      items={items}
      emptyTitle="No modules yet"
      emptyDescription="Modules are the high-level units of a course (e.g. Module 1, Module 2)."
      addLabel="Add module"
      onAdd={startNew}
      columns={[
        { key: "title", label: "Module", render: (m) => <span className="font-medium text-slate-200">{m.title}</span> },
        { key: "lessons", label: "Lessons", width: "100px" },
        { key: "duration", label: "Duration", width: "100px" },
        { key: "progress", label: "Progress", width: "120px", render: (m) => (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-surface-200 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-500 to-violet-500" style={{ width: `${m.progress || 0}%` }} />
            </div>
            <span className="text-[10px] text-slate-500 w-8">{m.progress || 0}%</span>
          </div>
        ) },
        { key: "locked", label: "Locked", width: "80px", render: (m) => m.locked ? <Badge tone="warning">Locked</Badge> : <Badge tone="success">Open</Badge> }
      ]}
      renderForm={({ open: isOpen, onClose, editing }) => (
        <Drawer
          open={isOpen}
          onClose={onClose}
          title={editingId ? "Edit module" : "Add module"}
          footer={<><Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button><Button onClick={save} loading={busy}>Save</Button></>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title" required className="md:col-span-2">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </Field>
            <Field label="Lessons" type="number"><Input type="number" value={form.lessons ?? 0} onChange={(e) => setForm({ ...form, lessons: e.target.value })} /></Field>
            <Field label="Duration"><Input value={form.duration || ""} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="2h 30m" /></Field>
            <Field label="Progress" type="number"><Input type="number" value={form.progress ?? 0} onChange={(e) => setForm({ ...form, progress: e.target.value })} /></Field>
            <Field label="Locked">
              <Select value={String(form.locked)} onChange={(e) => setForm({ ...form, locked: e.target.value === "true" })}>
                <option value="false">Open</option>
                <option value="true">Locked</option>
              </Select>
            </Field>
            <Field label="Order" type="number"><Input type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></Field>
            {error && <div className="md:col-span-2 text-xs text-rose-400">{error}</div>}
          </div>
        </Drawer>
      )}
    />
  );
}

function TasksTab({ items, courseId, api, toast, reload }) {
  const empty = { title: "", subtitle: "", duration: "", icon: "assignment", score_boost: 0, next_difficulty: "Adaptive", alert_title: "", alert_message: "", sort_order: 0 };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  function startNew() { setForm(empty); setEditingId(null); setOpen(true); }
  function startEdit(item) { setForm({ ...item }); setEditingId(item.id); setOpen(true); }
  async function save() {
    setBusy(true);
    try {
      const payload = { ...form, course_id: Number(courseId), score_boost: Number(form.score_boost || 0), sort_order: Number(form.sort_order || 0) };
      if (editingId) await api(`/v1/admin/course-tasks/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
      else await api(`/v1/admin/courses/${courseId}/tasks`, { method: "POST", body: JSON.stringify(payload) });
      toast.success(editingId ? "Task updated" : "Task added");
      setOpen(false);
      await reload();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  }
  async function remove(id) {
    if (!confirm("Delete this task?")) return;
    await api(`/v1/admin/course-tasks/${id}`, { method: "DELETE" });
    toast.success("Task deleted");
    await reload();
  }

  return (
    <DetailSection
      items={items}
      emptyTitle="No AI tasks yet"
      emptyDescription="Tasks are the AI-driven daily actions shown to the student (e.g. Review 10 questions, Take a quick scan)."
      addLabel="Add task"
      onAdd={startNew}
      columns={[
        { key: "title", label: "Task", render: (t) => <span className="font-medium text-slate-200">{t.title}</span> },
        { key: "duration", label: "Duration", width: "100px" },
        { key: "score_boost", label: "Boost", width: "80px", render: (t) => <span className="text-emerald-400">+{t.score_boost}</span> },
        { key: "next_difficulty", label: "Next difficulty", width: "140px" }
      ]}
      renderForm={({ open: isOpen, onClose }) => (
        <Drawer
          open={isOpen}
          onClose={onClose}
          title={editingId ? "Edit task" : "Add task"}
          footer={<><Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button><Button onClick={save} loading={busy}>Save</Button></>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title" required className="md:col-span-2"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
            <Field label="Subtitle" className="md:col-span-2"><Input value={form.subtitle || ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></Field>
            <Field label="Duration"><Input value={form.duration || ""} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="5 min" /></Field>
            <Field label="Icon key"><Input value={form.icon || ""} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></Field>
            <Field label="Score boost" type="number"><Input type="number" value={form.score_boost ?? 0} onChange={(e) => setForm({ ...form, score_boost: e.target.value })} /></Field>
            <Field label="Next difficulty"><Input value={form.next_difficulty || "Adaptive"} onChange={(e) => setForm({ ...form, next_difficulty: e.target.value })} /></Field>
            <Field label="Order" type="number"><Input type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></Field>
            <Field label="Alert title" className="md:col-span-2"><Input value={form.alert_title || ""} onChange={(e) => setForm({ ...form, alert_title: e.target.value })} /></Field>
            <Field label="Alert message" className="md:col-span-2"><Textarea value={form.alert_message || ""} onChange={(e) => setForm({ ...form, alert_message: e.target.value })} /></Field>
          </div>
        </Drawer>
      )}
    />
  );
}

function FlowQuestionsTab({ items, courseId, api, toast, reload }) {
  const empty = { mode: "Practice", prompt: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "A", explanation: "", hint: "", tags_text: "", sort_order: 0 };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  function startNew() { setForm(empty); setEditingId(null); setOpen(true); }
  function startEdit(item) { setForm({ ...item, tags_text: (item.tags || []).join(", ") }); setEditingId(item.id); setOpen(true); }
  async function save() {
    setBusy(true);
    try {
      const payload = {
        ...form,
        tags: (form.tags_text || "").split(",").map((t) => t.trim()).filter(Boolean),
        sort_order: Number(form.sort_order || 0)
      };
      delete payload.tags_text;
      if (editingId) await api(`/v1/admin/course-questions/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
      else await api(`/v1/admin/courses/${courseId}/questions`, { method: "POST", body: JSON.stringify(payload) });
      toast.success(editingId ? "Question updated" : "Question added");
      setOpen(false);
      await reload();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  }
  async function remove(id) {
    if (!confirm("Delete this question?")) return;
    await api(`/v1/admin/course-questions/${id}`, { method: "DELETE" });
    toast.success("Question deleted");
    await reload();
  }

  return (
    <DetailSection
      items={items}
      emptyTitle="No learning-flow questions yet"
      emptyDescription="These are the in-flow questions the AI uses to assess the student inside the course."
      addLabel="Add question"
      onAdd={startNew}
      columns={[
        { key: "mode", label: "Mode", width: "100px", render: (q) => <Badge tone="info">{q.mode}</Badge> },
        { key: "prompt", label: "Prompt", render: (q) => <span className="line-clamp-1 text-slate-200">{q.prompt}</span> },
        { key: "correct_option", label: "Correct", width: "80px", render: (q) => <Badge tone="success">{q.correct_option}</Badge> },
        { key: "tags", label: "Tags", render: (q) => <span className="text-xs text-slate-500">{(q.tags || []).join(", ")}</span> }
      ]}
      renderForm={({ open: isOpen, onClose }) => (
        <Drawer
          open={isOpen}
          onClose={onClose}
          title={editingId ? "Edit question" : "Add question"}
          width="max-w-2xl"
          footer={<><Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button><Button onClick={save} loading={busy}>Save</Button></>}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Mode"><Input value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} placeholder="Practice" /></Field>
            <Field label="Correct">
              <Select value={form.correct_option} onChange={(e) => setForm({ ...form, correct_option: e.target.value })}>
                {["A", "B", "C", "D"].map((l) => <option key={l} value={l}>{l}</option>)}
              </Select>
            </Field>
            <Field label="Prompt" required className="md:col-span-2"><Textarea value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} required rows={2} /></Field>
            {["A", "B", "C", "D"].map((l) => (
              <Field key={l} label={`Option ${l}`}>
                <Input value={form[`option_${l.toLowerCase()}`]} onChange={(e) => setForm({ ...form, [`option_${l.toLowerCase()}`]: e.target.value })} />
              </Field>
            ))}
            <Field label="Explanation" className="md:col-span-2"><Textarea value={form.explanation || ""} onChange={(e) => setForm({ ...form, explanation: e.target.value })} /></Field>
            <Field label="Hint" className="md:col-span-2"><Input value={form.hint || ""} onChange={(e) => setForm({ ...form, hint: e.target.value })} /></Field>
            <Field label="Tags (comma separated)" className="md:col-span-2"><Input value={form.tags_text || ""} onChange={(e) => setForm({ ...form, tags_text: e.target.value })} placeholder="gk, history, monarchy" /></Field>
            <Field label="Order" type="number"><Input type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></Field>
          </div>
        </Drawer>
      )}
    />
  );
}

function MistakesTab({ items, courseId, api, toast, reload }) {
  const empty = { title: "", reason: "", sort_order: 0 };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  function startNew() { setForm(empty); setEditingId(null); setOpen(true); }
  function startEdit(item) { setForm({ ...item }); setEditingId(item.id); setOpen(true); }
  async function save() {
    setBusy(true);
    try {
      const payload = { ...form, sort_order: Number(form.sort_order || 0) };
      if (editingId) await api(`/v1/admin/course-mistakes/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
      else await api(`/v1/admin/courses/${courseId}/mistakes`, { method: "POST", body: JSON.stringify(payload) });
      toast.success(editingId ? "Updated" : "Added");
      setOpen(false);
      await reload();
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  }
  async function remove(id) {
    if (!confirm("Delete this weak topic?")) return;
    await api(`/v1/admin/course-mistakes/${id}`, { method: "DELETE" });
    toast.success("Deleted");
    await reload();
  }

  return (
    <DetailSection
      items={items}
      emptyTitle="No weak topics"
      emptyDescription="Weak topics are surfaced to students where they need more practice."
      addLabel="Add topic"
      onAdd={startNew}
      columns={[
        { key: "title", label: "Title", render: (m) => <span className="font-medium text-slate-200">{m.title}</span> },
        { key: "reason", label: "Reason", render: (m) => <span className="text-slate-400 line-clamp-1">{m.reason}</span> }
      ]}
      renderForm={({ open: isOpen, onClose }) => (
        <Drawer
          open={isOpen}
          onClose={onClose}
          title={editingId ? "Edit weak topic" : "Add weak topic"}
          footer={<><Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button><Button onClick={save} loading={busy}>Save</Button></>}
        >
          <div className="grid grid-cols-1 gap-4">
            <Field label="Title" required><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
            <Field label="Reason"><Textarea value={form.reason || ""} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></Field>
            <Field label="Order" type="number"><Input type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></Field>
          </div>
        </Drawer>
      )}
    />
  );
}
