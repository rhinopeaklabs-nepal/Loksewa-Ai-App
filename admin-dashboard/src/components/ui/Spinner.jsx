import { cn } from "../../lib/cn.js";

export function Spinner({ className, size = 16 }) {
  return (
    <svg
      className={cn("animate-spin text-current", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function PageLoader({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-zinc-500">
      <Spinner size={28} className="text-brand-500" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function SkeletonRow({ cols = 5 }) {
  return (
    <div className="flex items-center gap-4 px-5 py-3 border-b border-surface-300/40 last:border-0">
      {Array.from({ length: cols }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded bg-surface-300/60 animate-pulse"
          style={{ width: `${30 + ((i * 17) % 60)}%` }}
        />
      ))}
    </div>
  );
}
