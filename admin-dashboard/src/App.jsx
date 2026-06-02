import { useEffect, useMemo, useState, useCallback } from "react";
import { Shell } from "./components/layout/Shell.jsx";
import { BottomNav } from "./components/layout/Sidebar.jsx";
import { ToastProvider, useToast } from "./components/ui/Toast.jsx";
import { Login } from "./pages/Login.jsx";
import { Overview } from "./pages/Overview.jsx";
import { Subjects } from "./pages/Subjects.jsx";
import { Courses } from "./pages/Courses.jsx";
import { Questions } from "./pages/Questions.jsx";
import { Syllabus } from "./pages/Syllabus.jsx";
import { Mocks } from "./pages/Mocks.jsx";
import { Users } from "./pages/Users.jsx";
import { Reports } from "./pages/Reports.jsx";
import { createApi, getToken } from "./lib/api.js";
import { fetchProfile, loginRequest, logout as doLogout } from "./lib/auth.js";
import { Spinner } from "./components/ui/Spinner.jsx";

const TITLES = {
  overview: { eyebrow: "Dashboard", title: "Overview" },
  subjects: { eyebrow: "Curriculum", title: "Subjects" },
  courses: { eyebrow: "Curriculum", title: "Courses" },
  questions: { eyebrow: "Content", title: "Question bank" },
  syllabus: { eyebrow: "References", title: "Syllabus" },
  mocks: { eyebrow: "Assessments", title: "Mock tests" },
  users: { eyebrow: "Access", title: "Users" },
  reports: { eyebrow: "Triage", title: "Reports" }
};

function AppShell() {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState({ subjects: [], courses: [], questions: [], syllabus: [], mocks: [], users: [], reports: [] });
  const [globalLoading, setGlobalLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const api = useMemo(
    () => createApi({ token: getToken(), onUnauthorized: () => { setUser(null); toast.warning("Session expired. Please sign in again."); } }),
    [toast]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getToken()) { setAuthLoading(false); return; }
      try {
        const profile = await fetchProfile(api);
        if (profile.role !== "admin") throw new Error("Admin account required");
        if (!cancelled) setUser(profile);
      } catch (e) {
        if (!cancelled) { doLogout(); setUser(null); }
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [api]);

  const loadAll = useCallback(async () => {
    setGlobalLoading(true);
    try {
      const [subjects, courses, questions, syllabus, mocks, users, reports] = await Promise.all([
        api("/v1/admin/subjects").catch(() => []),
        api("/v1/admin/courses").catch(() => []),
        api("/v1/admin/questions").catch(() => []),
        api("/v1/admin/syllabus").catch(() => []),
        api("/v1/admin/mock-tests").catch(() => []),
        api("/v1/admin/users").catch(() => []),
        api("/v1/admin/reports").catch(() => [])
      ]);
      setData({ subjects, courses, questions, syllabus, mocks, users, reports });
      setRefreshKey((k) => k + 1);
    } finally {
      setGlobalLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (user) loadAll();
  }, [user, loadAll]);

  async function handleLogin({ email, password }) {
    setLoginBusy(true);
    setLoginError("");
    try {
      const result = await loginRequest(email, password);
      if (result.user.role !== "admin") {
        setLoginError("Admin account required");
        doLogout();
        return;
      }
      setUser(result.user);
      toast.success("Welcome back");
    } catch (e) {
      setLoginError(e.message);
    } finally {
      setLoginBusy(false);
    }
  }

  function handleSignOut() {
    doLogout();
    setUser(null);
    toast.info("Signed out");
  }

  const metrics = useMemo(() => ({
    verified: data.questions.filter((q) => q.verification_status === "verified").length,
    review: data.questions.filter((q) => q.verification_status === "needs_review").length,
    mocks: data.mocks.filter((m) => m.status === "published").length,
    reports: data.reports.filter((r) => r.status === "open").length,
    users: data.users.length,
    subjects: data.subjects.filter((s) => s.status === "published").length,
    courses: data.courses.filter((c) => c.status === "published").length
  }), [data]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-0">
        <div className="flex flex-col items-center gap-3">
          <Spinner size={36} className="text-blue-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
          <span className="text-sm text-slate-500 font-medium">Loading…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onSubmit={handleLogin} error={loginError} busy={loginBusy} />;
  }

  const t = TITLES[tab] || TITLES.overview;

  return (
    <Shell
      tab={tab}
      onTabChange={setTab}
      user={user}
      onSignOut={handleSignOut}
      topbar={{
        title: t.title,
        onRefresh: loadAll,
        loading: globalLoading
      }}
    >
      {/* Mobile bottom nav */}
      <BottomNav tab={tab} onTabChange={setTab} />

      {tab === "overview" && (
        <Overview
          metrics={metrics}
          onJump={setTab}
          recentQuestions={data.questions}
          recentReports={data.reports}
        />
      )}
      {tab === "subjects" && <Subjects api={api} toast={toast} />}
      {tab === "courses" && <Courses api={api} toast={toast} refreshKey={refreshKey} />}
      {tab === "questions" && <Questions api={api} toast={toast} />}
      {tab === "syllabus" && <Syllabus api={api} toast={toast} />}
      {tab === "mocks" && <Mocks api={api} toast={toast} />}
      {tab === "users" && <Users api={api} toast={toast} />}
      {tab === "reports" && <Reports api={api} toast={toast} />}
    </Shell>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}
