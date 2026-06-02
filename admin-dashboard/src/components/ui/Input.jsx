import { forwardRef } from "react";
import { cn } from "../../lib/cn.js";

const baseField =
  "w-full rounded-xl bg-surface-100/80 border border-orange-500/12 px-4 text-sm text-slate-200 placeholder:text-slate-600 " +
  "transition-all hover:border-orange-500/30 focus:border-orange-500/60 focus:outline-none focus:ring-2 focus:ring-orange-500/15 " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

export const Input = forwardRef(function Input({ className, error, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(baseField, "h-10", error && "border-rose-500/50 focus:border-rose-500/70 focus:ring-rose-500/15", className)}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea({ className, error, rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(baseField, "py-2.5 min-h-24 resize-y", error && "border-rose-500/50 focus:border-rose-500/70 focus:ring-rose-500/15", className)}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select({ className, error, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          baseField,
          "h-10 pr-9 appearance-none cursor-pointer",
          error && "border-rose-500/50 focus:border-rose-500/70 focus:ring-rose-500/15",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
});

export function Field({ label, hint, error, children, required, className }) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}{required && <span className="text-orange-400 ml-0.5">*</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="text-xs text-slate-500">{hint}</span>}
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </label>
  );
}
