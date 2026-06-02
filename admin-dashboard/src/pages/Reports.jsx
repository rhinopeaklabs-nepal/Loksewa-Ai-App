import { useState, useEffect, useCallback } from "react";
import { Flag, Inbox, Clock, CheckCircle2, XCircle, MessageSquare, ScanLine, Search, Filter } from "lucide-react";
import { Button } from "../components/ui/Button.jsx";
import { Input, Select } from "../components/ui/Input.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { StatusBadge } from "../components/ui/Badge.jsx";
import { Tabs } from "../components/ui/Tabs.jsx";
import { formatDateTime } from "../lib/format.js";
import { cn } from "../lib/cn.js";

const STATUSES = [
  { value: "open", label: "Open", icon: Inbox, color: "#fb7185" },
  { value: "triaged", label: "Triaged", icon: Clock, color: "#fbbf24" },
  { value: "resolved", label: "Resolved", icon: CheckCircle2, color: "#34d399" },
  { value: "rejected", label: "Rejected", icon: XCircle, color: "#94a3b8" }
];

export function Reports({ api, toast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set("report_status", filter);
      const query = params.toString();
      setItems(await api(`/v1/admin/reports${query ? "?" + query : ""}`));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [api, toast, filter]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id, status) {
    setBusy(id);
    try {
      await api(`/v1/admin/reports/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
      toast.success("Report updated");
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this report?")) return;
    setBusy(id);
    try {
      await api(`/v1/admin/reports/${id}`, { method: "DELETE" });
      toast.success("Report deleted");
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  }

  const filtered = items.filter((item) => {
    if (!search) return true;
    const text = (item.message || item.scanned_text || "").toLowerCase();
    return text.includes(search.toLowerCase());
  });

  // Count reports by status for the tab badges
  const tabItems = [
    { value: "", label: "All", count: items.length },
    ...STATUSES.map((s) => ({
      value: s.value,
      label: s.label,
      icon: s.icon,
      count: items.filter((r) => r.status === s.value).length
    }))
  ];

  return (
    <div className="flex flex-col gap-5 max-w-7xl">
      <PageHeader
        eyebrow="Triage"
        title="Student reports"
        description="Reports from mobile users about questions, scans, or content. Triage quickly to keep the experience healthy."
      />

      {/* Status tabs — mobile app style */}
      <Tabs items={tabItems} value={filter} onChange={setFilter} />

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports…"
            className="pl-9"
          />
        </div>
        <span className="text-xs text-slate-500 ml-auto">
          {filtered.length} {filtered.length === 1 ? "report" : "reports"}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Spinner size={28} className="text-orange-400" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="No reports to show"
          description="When students report content, you'll see it here for triage."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item) => (
            <ReportCard
              key={item.id}
              report={item}
              busy={busy === item.id}
              onUpdate={updateStatus}
              onRemove={remove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportCard({ report, busy, onUpdate, onRemove }) {
  const isScan = !!report.scanned_text;
  const accent = isScan ? "#a78bfa" : "#60a5fa";
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-orange-500/8 bg-gradient-to-br from-surface-100/60 to-surface-50/40 backdrop-blur p-4 hover:border-orange-500/20 transition-all"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {isScan ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/25">
              <ScanLine className="w-3 h-3" /> Scan
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/25">
              <MessageSquare className="w-3 h-3" /> Feedback
            </span>
          )}
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">#{report.id}</span>
        </div>
        <StatusBadge value={report.status} />
      </div>
      <p className="text-sm text-slate-200 line-clamp-3 mb-3 leading-relaxed">
        {report.message || report.scanned_text || "No message"}
      </p>
      <p className="text-[11px] text-slate-500 mb-4">{formatDateTime(report.created_at)}</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        {report.status !== "triaged" && (
          <Button
            variant="secondary" size="sm"
            onClick={() => onUpdate(report.id, "triaged")} disabled={busy}
            className="border-amber-500/25 text-amber-300 hover:bg-amber-500/10"
          >
            Triaged
          </Button>
        )}
        {report.status !== "resolved" && (
          <Button
            variant="secondary" size="sm"
            onClick={() => onUpdate(report.id, "resolved")} disabled={busy}
            className="border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/10"
          >
            Resolved
          </Button>
        )}
        {report.status !== "rejected" && (
          <Button
            variant="ghost" size="sm"
            onClick={() => onUpdate(report.id, "rejected")} disabled={busy}
            className="text-slate-500 hover:text-slate-200"
          >
            Reject
          </Button>
        )}
        <Button
          variant="ghost" size="sm"
          onClick={() => onRemove(report.id)} disabled={busy}
          className="text-rose-400 hover:bg-rose-500/10 ml-auto"
        >
          <XCircle className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
