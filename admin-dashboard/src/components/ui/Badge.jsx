import { cn } from "../../lib/cn.js";

const tones = {
  neutral: "bg-surface-300/60 text-slate-300 border-surface-400/50",
  success: "bg-emerald-500/12 text-emerald-300 border-emerald-500/25",
  warning: "bg-amber-500/12 text-amber-300 border-amber-500/25",
  danger: "bg-rose-500/12 text-rose-300 border-rose-500/25",
  info: "bg-blue-500/12 text-blue-300 border-blue-500/25",
  brand: "bg-orange-500/12 text-orange-300 border-orange-500/25",
  orange: "bg-orange-500/12 text-orange-300 border-orange-500/25",
  gold: "bg-amber-500/12 text-amber-300 border-amber-500/25"
};

export function Badge({ tone = "neutral", dot = false, className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-none",
        tones[tone],
        className
      )}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {children}
    </span>
  );
}

const STATUS_TONE = {
  verified: "success", active: "success", published: "success", resolved: "success",
  needs_review: "warning", draft: "warning", open: "warning", triaged: "warning", pending: "warning",
  rejected: "danger", disabled: "danger", archived: "danger",
  student: "info", reviewer: "brand", admin: "brand"
};

export function StatusBadge({ value, className }) {
  if (!value) return <span className="text-slate-600">—</span>;
  const tone = STATUS_TONE[value] || "neutral";
  const label = value.replace(/_/g, " ");
  return <Badge tone={tone} dot className={className}>{label}</Badge>;
}
