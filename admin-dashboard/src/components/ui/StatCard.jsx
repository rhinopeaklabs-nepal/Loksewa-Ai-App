import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "../../lib/cn.js";

export function StatCard({
  label,
  value,
  hint,
  trend,
  trendLabel,
  icon: Icon,
  accent = "orange"
}) {
  const trendUp = trend >= 0;
  const accents = {
    orange:  { bg: "from-orange-500/20 to-transparent", icon: "text-orange-400",  glow: "shadow-[0_0_16px_rgba(249,115,22,0.2)]", border: "border-orange-500/15" },
    blue:    { bg: "from-blue-500/20 to-transparent",   icon: "text-blue-400",    glow: "shadow-[0_0_16px_rgba(59,130,246,0.25)]" },
    emerald: { bg: "from-emerald-500/20 to-transparent",icon: "text-emerald-400", glow: "shadow-[0_0_16px_rgba(16,185,129,0.2)]" },
    amber:   { bg: "from-amber-500/20 to-transparent",  icon: "text-amber-400",   glow: "shadow-[0_0_16px_rgba(245,158,11,0.2)]" },
    rose:    { bg: "from-rose-500/20 to-transparent",   icon: "text-rose-400",    glow: "shadow-[0_0_16px_rgba(244,63,94,0.2)]" },
    gold:    { bg: "from-yellow-500/15 to-transparent", icon: "text-yellow-400",  glow: "shadow-[0_0_16px_rgba(234,179,8,0.2)]" },
    violet:  { bg: "from-violet-500/15 to-transparent", icon: "text-violet-400",  glow: "shadow-[0_0_16px_rgba(139,92,246,0.2)]" }
  };
  const a = accents[accent] || accents.orange;

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-orange-500/10 bg-surface-100/60 p-4 transition-all hover:border-orange-500/20 hover:shadow-[0_0_20px_rgba(249,115,22,0.08)]", a.glow)}>
      <div className={cn("absolute inset-0 bg-gradient-to-br pointer-events-none opacity-50", a.bg)} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-1.5 tracking-tight">{value}</p>
          {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
          {trend !== undefined && (
            <div className={cn(
              "inline-flex items-center gap-1 mt-2 text-xs font-semibold",
              trendUp ? "text-emerald-400" : "text-rose-400"
            )}>
              {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trendUp ? "+" : ""}{trend}%{trendLabel && <span className="text-slate-500 font-normal ml-1">{trendLabel}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-orange-500/15", a.bg)}>
            <Icon className={cn("w-[18px] h-[18px]", a.icon)} />
          </div>
        )}
      </div>
    </div>
  );
}
