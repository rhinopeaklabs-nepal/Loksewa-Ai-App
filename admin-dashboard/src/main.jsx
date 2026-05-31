import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_BASE = import.meta.env.VITE_API_BASE || "";
const TOKEN_KEY = "loksewa_admin_token";

const emptyQuestion = {
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

const emptySyllabus = {
  title: "",
  content: "",
  category: "",
  source_name: "",
  source_year: ""
};

const emptyMock = {
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

const emptyUser = {
  email: "",
  full_name: "",
  role: "student",
  status: "active",
  password: ""
};

function toQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

function parseError(payload, fallback) {
  if (!payload?.detail) return fallback;
  if (Array.isArray(payload.detail)) return payload.detail.map((item) => item.msg).join(", ");
  return payload.detail;
}

function useApi(token, onUnauthorized) {
  return async function api(path, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (response.status === 204) return null;
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;
    if (!response.ok) {
      if (response.status === 401) onUnauthorized?.();
      throw new Error(parseError(payload, response.statusText));
    }
    return payload;
  };
}

function App() {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("overview");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ questionStatus: "", questionQuery: "", reportStatus: "" });
  const [data, setData] = useState({ questions: [], syllabus: [], mocks: [], users: [], reports: [] });

  const [questionForm, setQuestionForm] = useState(emptyQuestion);
  const [questionId, setQuestionId] = useState("");
  const [syllabusForm, setSyllabusForm] = useState(emptySyllabus);
  const [syllabusId, setSyllabusId] = useState("");
  const [mockForm, setMockForm] = useState(emptyMock);
  const [mockId, setMockId] = useState("");
  const [userForm, setUserForm] = useState(emptyUser);
  const [userId, setUserId] = useState("");

  const api = useApi(token, logout);

  useEffect(() => {
    if (!toast) return;
    const handle = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(handle);
  }, [toast]);

  useEffect(() => {
    async function boot() {
      if (!token) return;
      try {
        const profile = await api("/v1/auth/me");
        if (profile.role !== "admin") throw new Error("Admin account required");
        setUser(profile);
        await loadAll();
      } catch (_) {
        logout();
      }
    }
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metrics = useMemo(() => ({
    verified: data.questions.filter((item) => item.verification_status === "verified").length,
    review: data.questions.filter((item) => item.verification_status === "needs_review").length,
    mocks: data.mocks.filter((item) => item.status === "published").length,
    reports: data.reports.filter((item) => item.status === "open").length,
    users: data.users.length
  }), [data]);

  function flash(message) {
    setToast(message);
  }

  function logout() {
    setToken("");
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
  }

  async function loadAll() {
    setLoading(true);
    try {
      const [questions, syllabus, mocks, users, reports] = await Promise.all([
        api(`/v1/admin/questions${toQuery({ verification_status: filters.questionStatus, query: filters.questionQuery })}`),
        api("/v1/admin/syllabus"),
        api("/v1/admin/mock-tests"),
        api("/v1/admin/users"),
        api(`/v1/admin/reports${toQuery({ report_status: filters.reportStatus })}`)
      ]);
      setData({ questions, syllabus, mocks, users, reports });
    } finally {
      setLoading(false);
    }
  }

  async function login(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${API_BASE}/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
          client_type: "admin"
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(parseError(payload, "Login failed"));
      localStorage.setItem(TOKEN_KEY, payload.token);
      setToken(payload.token);
      setUser(payload.user);
      flash("Signed in");
      window.setTimeout(loadAll, 0);
    } catch (error) {
      flash(error.message);
    }
  }

  async function saveQuestion(event) {
    event.preventDefault();
    const payload = { ...questionForm };
    try {
      await api(questionId ? `/v1/admin/questions/${questionId}` : "/v1/admin/questions", {
        method: questionId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      });
      setQuestionId("");
      setQuestionForm(emptyQuestion);
      await loadAll();
      flash("Question saved");
    } catch (error) {
      flash(error.message);
    }
  }

  async function rejectQuestion(id) {
    if (!window.confirm("Reject this question?")) return;
    await api(`/v1/admin/questions/${id}`, { method: "DELETE" });
    await loadAll();
    flash("Question rejected");
  }

  async function saveSyllabus(event) {
    event.preventDefault();
    const payload = {
      ...syllabusForm,
      source_year: syllabusForm.source_year ? Number(syllabusForm.source_year) : null
    };
    await api(syllabusId ? `/v1/admin/syllabus/${syllabusId}` : "/v1/admin/syllabus", {
      method: syllabusId ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    setSyllabusId("");
    setSyllabusForm(emptySyllabus);
    await loadAll();
    flash("Syllabus saved");
  }

  async function deleteSyllabus(id) {
    if (!window.confirm("Delete this syllabus entry?")) return;
    await api(`/v1/admin/syllabus/${id}`, { method: "DELETE" });
    await loadAll();
    flash("Syllabus deleted");
  }

  async function saveMock(event) {
    event.preventDefault();
    const payload = {
      ...mockForm,
      duration_minutes: Number(mockForm.duration_minutes),
      marks_per_correct: Number(mockForm.marks_per_correct),
      negative_marks_per_wrong: Number(mockForm.negative_marks_per_wrong),
      question_ids: mockForm.question_ids_text
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isInteger(item) && item > 0)
    };
    delete payload.question_ids_text;
    await api(mockId ? `/v1/admin/mock-tests/${mockId}` : "/v1/admin/mock-tests", {
      method: mockId ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    setMockId("");
    setMockForm(emptyMock);
    await loadAll();
    flash("Mock test saved");
  }

  async function archiveMock(id) {
    if (!window.confirm("Archive this mock test?")) return;
    await api(`/v1/admin/mock-tests/${id}`, { method: "DELETE" });
    await loadAll();
    flash("Mock test archived");
  }

  async function saveUser(event) {
    event.preventDefault();
    const payload = { ...userForm };
    if (!payload.password) delete payload.password;
    if (!userId && !userForm.password) {
      flash("Password is required for new users");
      return;
    }
    await api(userId ? `/v1/admin/users/${userId}` : "/v1/admin/users", {
      method: userId ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    setUserId("");
    setUserForm(emptyUser);
    await loadAll();
    flash("User saved");
  }

  async function deleteUser(id) {
    if (!window.confirm("Delete this user?")) return;
    await api(`/v1/admin/users/${id}`, { method: "DELETE" });
    await loadAll();
    flash("User deleted");
  }

  async function updateReport(id, status) {
    await api(`/v1/admin/reports/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status })
    });
    await loadAll();
    flash("Report updated");
  }

  async function deleteReport(id) {
    if (!window.confirm("Delete this report?")) return;
    await api(`/v1/admin/reports/${id}`, { method: "DELETE" });
    await loadAll();
    flash("Report deleted");
  }

  if (!user) {
    return <Login onSubmit={login} toast={toast} />;
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Loksewa AI</p>
          <h1>Admin</h1>
        </div>
        <nav>
          {[
            ["overview", "Overview"],
            ["questions", "Questions"],
            ["syllabus", "Syllabus"],
            ["mocks", "Mock Tests"],
            ["users", "Users"],
            ["reports", "Reports"]
          ].map(([key, label]) => (
            <button key={key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </nav>
        <button className="outline light" onClick={logout}>Sign out</button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">{tab}</p>
            <h2>{sectionTitle(tab)}</h2>
          </div>
          <div className="top-actions">
            <span>{user.full_name || user.email}</span>
            <button className="outline" onClick={loadAll}>{loading ? "Loading" : "Refresh"}</button>
          </div>
        </header>

        {tab === "overview" && <Overview metrics={metrics} />}

        {tab === "questions" && (
          <Questions
            filters={filters}
            setFilters={setFilters}
            reload={loadAll}
            items={data.questions}
            form={questionForm}
            setForm={setQuestionForm}
            formId={questionId}
            setFormId={setQuestionId}
            save={saveQuestion}
            reject={rejectQuestion}
          />
        )}

        {tab === "syllabus" && (
          <Syllabus
            items={data.syllabus}
            form={syllabusForm}
            setForm={setSyllabusForm}
            formId={syllabusId}
            setFormId={setSyllabusId}
            save={saveSyllabus}
            remove={deleteSyllabus}
          />
        )}

        {tab === "mocks" && (
          <Mocks
            items={data.mocks}
            form={mockForm}
            setForm={setMockForm}
            formId={mockId}
            setFormId={setMockId}
            save={saveMock}
            archive={archiveMock}
          />
        )}

        {tab === "users" && (
          <Users
            items={data.users}
            form={userForm}
            setForm={setUserForm}
            formId={userId}
            setFormId={setUserId}
            save={saveUser}
            remove={deleteUser}
          />
        )}

        {tab === "reports" && (
          <Reports
            filters={filters}
            setFilters={setFilters}
            reload={loadAll}
            items={data.reports}
            update={updateReport}
            remove={deleteReport}
          />
        )}
      </section>

      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </main>
  );
}

function Login({ onSubmit, toast }) {
  return (
    <main className="login">
      <form className="login-panel" onSubmit={onSubmit}>
        <p className="eyebrow">Loksewa AI</p>
        <h1>Admin Dashboard</h1>
        <label>Email<input name="email" type="email" defaultValue="admin@loksewa.local" required /></label>
        <label>Password<input name="password" type="password" defaultValue="LoksewaAdmin@123" required /></label>
        <button className="primary">Sign in</button>
        <p className="helper">Development admin: admin@loksewa.local / LoksewaAdmin@123</p>
        <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
      </form>
    </main>
  );
}

function sectionTitle(tab) {
  return {
    overview: "Operations overview",
    questions: "Question bank CRUD",
    syllabus: "Syllabus and references",
    mocks: "Real-exam mock tests",
    users: "Mobile and admin users",
    reports: "Student reports"
  }[tab];
}

function Overview({ metrics }) {
  return (
    <section className="content">
      <div className="metrics">
        <Metric label="Verified questions" value={metrics.verified} />
        <Metric label="Needs review" value={metrics.review} />
        <Metric label="Published mocks" value={metrics.mocks} />
        <Metric label="Open reports" value={metrics.reports} />
        <Metric label="Users" value={metrics.users} />
      </div>
      <div className="notice">
        <h3>Mock test marking</h3>
        <p>Each mock test can use Loksewa-style configurable marking: positive marks for correct answers, optional negative marks for wrong answers, zero for unanswered questions, and a backend-enforced time limit.</p>
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}

function Questions({ filters, setFilters, reload, items, form, setForm, formId, setFormId, save, reject }) {
  return (
    <section className="content">
      <div className="toolbar">
        <input value={filters.questionQuery} onChange={(event) => setFilters({ ...filters, questionQuery: event.target.value })} placeholder="Search questions" />
        <select value={filters.questionStatus} onChange={(event) => setFilters({ ...filters, questionStatus: event.target.value })}>
          <option value="">All statuses</option>
          <option value="verified">Verified</option>
          <option value="needs_review">Needs review</option>
          <option value="draft">Draft</option>
          <option value="rejected">Rejected</option>
        </select>
        <button className="outline" onClick={reload}>Apply</button>
      </div>
      <form className="editor" onSubmit={save}>
        <Field wide label="Question" value={form.question_text} onChange={(value) => setForm({ ...form, question_text: value })} textarea />
        <Field label="A" value={form.option_a} onChange={(value) => setForm({ ...form, option_a: value })} />
        <Field label="B" value={form.option_b} onChange={(value) => setForm({ ...form, option_b: value })} />
        <Field label="C" value={form.option_c} onChange={(value) => setForm({ ...form, option_c: value })} />
        <Field label="D" value={form.option_d} onChange={(value) => setForm({ ...form, option_d: value })} />
        <Select label="Correct" value={form.correct_option} options={["A", "B", "C", "D"]} onChange={(value) => setForm({ ...form, correct_option: value })} />
        <Field label="Category" value={form.syllabus_category} onChange={(value) => setForm({ ...form, syllabus_category: value })} />
        <Field label="Level" value={form.exam_level} onChange={(value) => setForm({ ...form, exam_level: value })} />
        <Field label="Type" value={form.exam_type} onChange={(value) => setForm({ ...form, exam_type: value })} />
        <Field label="Source" value={form.source_name} onChange={(value) => setForm({ ...form, source_name: value })} />
        <Field label="License" value={form.source_license} onChange={(value) => setForm({ ...form, source_license: value })} />
        <Field label="Verifier" value={form.verifier} onChange={(value) => setForm({ ...form, verifier: value })} />
        <Select label="Status" value={form.verification_status} options={["needs_review", "verified", "draft", "rejected"]} onChange={(value) => setForm({ ...form, verification_status: value })} />
        <Field wide label="Explanation" value={form.explanation} onChange={(value) => setForm({ ...form, explanation: value })} textarea />
        <div className="actions wide">
          <button className="primary">{formId ? "Update question" : "Create question"}</button>
          <button type="button" className="outline" onClick={() => { setFormId(""); setForm(emptyQuestion); }}>Clear</button>
        </div>
      </form>
      <DataTable
        columns={["ID", "Question", "Category", "Status", "Source", "Actions"]}
        rows={items.map((item) => [
          item.id,
          <strong>{item.question_text.slice(0, 130)}</strong>,
          item.syllabus_category,
          <Badge value={item.verification_status} />,
          item.source_name,
          <RowActions edit={() => { setFormId(item.id); setForm(item); }} remove={() => reject(item.id)} removeLabel="Reject" />
        ])}
      />
    </section>
  );
}

function Syllabus({ items, form, setForm, formId, setFormId, save, remove }) {
  return (
    <section className="content">
      <form className="editor" onSubmit={save}>
        <Field label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
        <Field label="Category" value={form.category} onChange={(value) => setForm({ ...form, category: value })} />
        <Field label="Source" value={form.source_name} onChange={(value) => setForm({ ...form, source_name: value })} />
        <Field label="Source year" type="number" value={form.source_year || ""} onChange={(value) => setForm({ ...form, source_year: value })} />
        <Field wide label="Content" value={form.content} onChange={(value) => setForm({ ...form, content: value })} textarea />
        <div className="actions wide">
          <button className="primary">{formId ? "Update syllabus" : "Create syllabus"}</button>
          <button type="button" className="outline" onClick={() => { setFormId(""); setForm(emptySyllabus); }}>Clear</button>
        </div>
      </form>
      <DataTable
        columns={["ID", "Title", "Category", "Source", "Actions"]}
        rows={items.map((item) => [
          item.id,
          <strong>{item.title}</strong>,
          item.category,
          item.source_name,
          <RowActions edit={() => { setFormId(item.id); setForm({ ...item, source_year: item.source_year || "" }); }} remove={() => remove(item.id)} />
        ])}
      />
    </section>
  );
}

function Mocks({ items, form, setForm, formId, setFormId, save, archive }) {
  return (
    <section className="content">
      <form className="editor" onSubmit={save}>
        <Field label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
        <Select label="Status" value={form.status} options={["draft", "published", "archived"]} onChange={(value) => setForm({ ...form, status: value })} />
        <Field label="Duration" type="number" value={form.duration_minutes} onChange={(value) => setForm({ ...form, duration_minutes: value })} />
        <Field label="Correct marks" type="number" step="0.01" value={form.marks_per_correct} onChange={(value) => setForm({ ...form, marks_per_correct: value })} />
        <Field label="Wrong penalty" type="number" step="0.01" value={form.negative_marks_per_wrong} onChange={(value) => setForm({ ...form, negative_marks_per_wrong: value })} />
        <Select label="Negative marking" value={String(form.negative_marking_enabled)} options={["true", "false"]} onChange={(value) => setForm({ ...form, negative_marking_enabled: value === "true" })} />
        <Field label="Level" value={form.exam_level} onChange={(value) => setForm({ ...form, exam_level: value })} />
        <Field label="Type" value={form.exam_type} onChange={(value) => setForm({ ...form, exam_type: value })} />
        <Field wide label="Question IDs" value={form.question_ids_text} onChange={(value) => setForm({ ...form, question_ids_text: value })} />
        <Field wide label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} textarea />
        <div className="actions wide">
          <button className="primary">{formId ? "Update mock" : "Create mock"}</button>
          <button type="button" className="outline" onClick={() => { setFormId(""); setForm(emptyMock); }}>Clear</button>
        </div>
      </form>
      <DataTable
        columns={["ID", "Mock", "Timer", "Marking", "Questions", "Status", "Actions"]}
        rows={items.map((item) => [
          item.id,
          <strong>{item.title}</strong>,
          `${item.duration_minutes} min`,
          `+${item.marks_per_correct} / ${item.negative_marking_enabled ? `-${item.negative_marks_per_wrong}` : "0"}`,
          item.total_questions,
          <Badge value={item.status} />,
          <RowActions edit={() => { setFormId(item.id); setForm({ ...item, question_ids_text: item.question_ids.join(", ") }); }} remove={() => archive(item.id)} removeLabel="Archive" />
        ])}
      />
    </section>
  );
}

function Users({ items, form, setForm, formId, setFormId, save, remove }) {
  return (
    <section className="content">
      <form className="editor" onSubmit={save}>
        <Field label="Email" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
        <Field label="Full name" value={form.full_name} onChange={(value) => setForm({ ...form, full_name: value })} />
        <Select label="Role" value={form.role} options={["student", "reviewer", "admin"]} onChange={(value) => setForm({ ...form, role: value })} />
        <Select label="Status" value={form.status} options={["active", "disabled"]} onChange={(value) => setForm({ ...form, status: value })} />
        <Field wide label="Password" type="password" value={form.password} onChange={(value) => setForm({ ...form, password: value })} />
        <div className="actions wide">
          <button className="primary">{formId ? "Update user" : "Create user"}</button>
          <button type="button" className="outline" onClick={() => { setFormId(""); setForm(emptyUser); }}>Clear</button>
        </div>
      </form>
      <DataTable
        columns={["ID", "Email", "Name", "Role", "Status", "Last login", "Actions"]}
        rows={items.map((item) => [
          item.id,
          item.email,
          item.full_name,
          item.role,
          <Badge value={item.status} />,
          item.last_login_at || "",
          <RowActions edit={() => { setFormId(item.id); setForm({ ...item, password: "" }); }} remove={() => remove(item.id)} />
        ])}
      />
    </section>
  );
}

function Reports({ filters, setFilters, reload, items, update, remove }) {
  return (
    <section className="content">
      <div className="toolbar">
        <select value={filters.reportStatus} onChange={(event) => setFilters({ ...filters, reportStatus: event.target.value })}>
          <option value="">All reports</option>
          <option value="open">Open</option>
          <option value="triaged">Triaged</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button className="outline" onClick={reload}>Apply</button>
      </div>
      <DataTable
        columns={["ID", "Type", "Message", "Status", "Created", "Actions"]}
        rows={items.map((item) => [
          item.id,
          item.report_type,
          item.message || item.scanned_text || "No message",
          <Badge value={item.status} />,
          item.created_at,
          <div className="row-actions">
            <button onClick={() => update(item.id, "triaged")}>Triaged</button>
            <button onClick={() => update(item.id, "resolved")}>Resolved</button>
            <button className="danger" onClick={() => update(item.id, "rejected")}>Reject</button>
            <button className="danger" onClick={() => remove(item.id)}>Delete</button>
          </div>
        ])}
      />
    </section>
  );
}

function Field({ label, value, onChange, textarea, wide, type = "text", step }) {
  const Input = textarea ? "textarea" : "input";
  return (
    <label className={wide ? "wide" : ""}>
      {label}
      <Input type={textarea ? undefined : type} step={step} value={value ?? ""} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function DataTable({ columns, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
        <tbody>
          {rows.length ? rows.map((row, index) => (
            <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
          )) : <tr><td colSpan={columns.length}>No records found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function RowActions({ edit, remove, removeLabel = "Delete" }) {
  return (
    <div className="row-actions">
      <button onClick={edit}>Edit</button>
      <button className="danger" onClick={remove}>{removeLabel}</button>
    </div>
  );
}

function Badge({ value }) {
  const danger = ["rejected", "disabled", "archived"].includes(value);
  const warn = ["needs_review", "draft", "open", "triaged"].includes(value);
  return <span className={`badge ${danger ? "danger" : warn ? "warn" : ""}`}>{value}</span>;
}

createRoot(document.getElementById("root")).render(<App />);
