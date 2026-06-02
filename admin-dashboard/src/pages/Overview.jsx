import { BookOpen, GraduationCap, FileQuestion, ClipboardList, Flag, Users, ArrowRight, Sparkles, TrendingUp, CheckCircle2, Clock, Activity as ActivityIcon, BookText, Library } from "lucide-react";
import { StatCard } from "../components/ui/StatCard.jsx";
import { Card, CardHeader, CardBody } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { CircularProgress } from "../components/ui/CircularProgress.jsx";
import { formatDateTime } from "../lib/format.js";
import { cn } from "../lib/cn.js";

// Quick-access tile — matches mobile app's home grid
function QuickTile({ icon: Icon, label, value, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center gap-2 p-4 rounded-2xl glass-card hover:border-orange-500/30 hover:shadow-[0_0_20px_rgba(249,115,22,0.12)] transition-all active:scale-[0.97] overflow-hidden"
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-orange-500/15"
        style={{ background: `linear-gradient(135deg, ${color}25 0%, ${color}10 100%)` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="text-center min-w-0 w-full">
        <p className="text-[11px] font-semibold text-slate-300 truncate">{label}</p>
        {value !== undefined && (
          <p className="text-base font-bold text-white mt-0.5">{value}</p>
        )}
      </div>
    </button>
  );
}

export function Overview({ metrics, onJump, recentReports = [], recentQuestions = [] }) {
  const cards = [
    { label: "Subjects", value: metrics.subjects, icon: BookOpen, accent: "orange" },
    { label: "Courses", value: metrics.courses, icon: GraduationCap, accent: "blue" },
    { label: "Verified Qs", value: metrics.verified, icon: CheckCircle2, accent: "emerald" },
    { label: "Needs Review", value: metrics.review, icon: Clock, accent: "amber" },
    { label: "Mock Tests", value: metrics.mocks, icon: ClipboardList, accent: "violet" },
    { label: "Open Reports", value: metrics.reports, icon: Flag, accent: "rose" }
  ];

  const totalQs = metrics.verified + metrics.review || 1;
  const verifyPct = Math.round((metrics.verified / totalQs) * 100);
  const userCount = Math.min(metrics.users || 0, 100);

  // Quick-access grid (matches mobile app home)
  const quickAccess = [
    { value: "subjects",  icon: BookOpen,        label: "Subjects",  count: metrics.subjects, color: "#fb923c" },
    { value: "courses",   icon: GraduationCap,   label: "Courses",   count: metrics.courses,  color: "#60a5fa" },
    { value: "questions",icon: FileQuestion,    label: "Questions", count: metrics.verified + metrics.review, color: "#fbbf24" },
    { value: "mocks",     icon: ClipboardList,   label: "Mock Tests",count: metrics.mocks,    color: "#a78bfa" },
    { value: "syllabus",  icon: Library,         label: "Syllabus",  count: metrics.syllabus, color: "#34d399" },
    { value: "users",     icon: Users,           label: "Users",     count: metrics.users,    color: "#f472b6" }
  ];

  return (
    <div className="flex flex-col gap-5 max-w-7xl">
      {/* Greeting banner — mobile app "Namaste!" style */}
      <div className="relative overflow-hidden rounded-2xl border border-orange-500/15 bg-gradient-to-br from-orange-500/10 via-surface-100/60 to-blue-500/8 p-5 sm:p-7">
        <div className="orb-orange anim-float" style={{ width: 320, height: 320, top: "-90px", right: "-50px", opacity: 0.4 }} />
        <div className="orb-blue" style={{ width: 240, height: 240, bottom: "-60px", left: "30%", opacity: 0.3 }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <p className="text-base sm:text-lg font-semibold text-slate-300">
              Namaste! <span className="text-white">Admin</span>{" "}
              <span className="inline-block anim-float">👋</span>
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              <span className="text-gradient">Welcome</span> to your control room
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
              {metrics.review > 0
                ? `You have ${metrics.review} question${metrics.review === 1 ? "" : "s"} pending review${metrics.reports > 0 ? ` and ${metrics.reports} open report${metrics.reports === 1 ? "" : "s"}` : ""}.`
                : "All caught up. Platform is running smoothly."}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="secondary" size="sm" onClick={() => onJump?.("questions")} className="border-orange-500/30 text-slate-300">
              Review queue
            </Button>
            <Button
              size="sm"
              onClick={() => onJump?.("courses")}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="font-bold anim-shine text-white"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)",
                boxShadow: "0 0 16px rgba(249,115,22,0.4)",
                backgroundSize: "200% 100%"
              }}
            >
              Manage courses
            </Button>
          </div>
        </div>
      </div>

      {/* Your Progress — circular ring card (mobile app style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card glow="orange" className="p-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <CircularProgress value={verifyPct} size={100} stroke={8} color="#fb923c" />
              {/* Sparkle decoration */}
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-400 anim-pulse-glow" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Your Progress</p>
              <p className="text-xs text-slate-400 mt-0.5">Verified questions</p>
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs text-slate-400">{metrics.verified} verified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs text-slate-400">{metrics.review} pending</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-4">
            <CircularProgress value={userCount} size={100} stroke={8} color="#60a5fa" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Platform Users</p>
              <p className="text-xs text-slate-400 mt-0.5">Total registered</p>
              <div className="mt-3 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-semibold">+12% this month</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex flex-col gap-3 h-full justify-center">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-slate-300">System healthy</span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">All green</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-surface-100/60 border border-orange-500/10 px-3 py-2">
                <p className="text-lg font-bold text-white">{metrics.mocks}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Live mocks</p>
              </div>
              <div className="rounded-xl bg-surface-100/60 border border-orange-500/10 px-3 py-2">
                <p className="text-lg font-bold text-white">{metrics.courses}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Active courses</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Access grid — mobile app home style */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white tracking-tight">Quick Access</h2>
          <span className="text-xs text-slate-500">6 modules</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickAccess.map((q) => (
            <QuickTile
              key={q.value}
              icon={q.icon}
              label={q.label}
              value={q.count}
              color={q.color}
              onClick={() => onJump?.(q.value)}
            />
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Recent questions + reports (Recommended for You style) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent Questions"
            subtitle="Latest items added to the bank"
            action={
              <Button variant="ghost" size="sm" onClick={() => onJump?.("questions")} className="text-slate-400 hover:text-white" rightIcon={<ArrowRight className="w-3 h-3" />}>
                View all
              </Button>
            }
          />
          <CardBody className="p-0">
            {recentQuestions.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">No recent questions yet.</div>
            ) : (
              <ul className="divide-y divide-orange-500/8">
                {recentQuestions.slice(0, 5).map((q) => (
                  <li key={q.id} className="px-5 py-3.5 hover:bg-orange-500/5 transition-colors cursor-pointer" onClick={() => onJump?.("questions")}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                        <FileQuestion className="w-4 h-4 text-orange-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-200 line-clamp-1">{q.question_text}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-slate-500">{q.syllabus_category || "—"}</span>
                          <span className="text-[11px] text-slate-700">·</span>
                          <span className="text-[11px] text-slate-500">{q.exam_level || "any level"}</span>
                        </div>
                      </div>
                      <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        q.verification_status === "verified"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : q.verification_status === "needs_review"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                          : "bg-surface-200/50 text-slate-400 border-surface-300/30"
                      }`}>
                        {q.verification_status ? q.verification_status.replace(/_/g, " ") : "draft"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Activity"
            subtitle="Latest student reports"
            action={<ActivityIcon className="w-4 h-4 text-orange-400" />}
          />
          <CardBody className="p-0">
            {recentReports.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">No reports yet.</div>
            ) : (
              <ul className="divide-y divide-orange-500/8">
                {recentReports.slice(0, 5).map((r) => (
                  <li key={r.id} className="px-5 py-3.5 hover:bg-orange-500/5 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-slate-200 line-clamp-2">{r.message || r.scanned_text || "No message"}</p>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        r.status === "open"
                          ? "bg-rose-500/10 text-rose-300"
                          : r.status === "triaged"
                          ? "bg-amber-500/10 text-amber-300"
                          : r.status === "resolved"
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-surface-200/50 text-slate-400"
                      }`}>
                        {r.status}
                      </span>
                      <span className="text-[11px] text-slate-500">{formatDateTime(r.created_at)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
