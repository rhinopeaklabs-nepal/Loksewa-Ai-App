import { forwardRef } from "react";
import { cn } from "../../lib/cn.js";

const variants = {
  primary:
    "bg-orange-500 hover:bg-orange-400 text-white shadow-[0_0_16px_rgba(249,115,22,0.35)] active:scale-[0.98] disabled:opacity-50",
  "primary-blue":
    "bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-400 hover:to-blue-300 text-white shadow-[0_0_16px_rgba(59,130,246,0.4)] active:scale-[0.98] disabled:opacity-50",
  "primary-orange":
    "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] active:scale-[0.98] disabled:opacity-50",
  "primary-glow":
    "bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-white shadow-[0_0_24px_rgba(249,115,22,0.5)] active:scale-[0.98] disabled:opacity-50 font-bold",
  secondary:
    "bg-surface-200 hover:bg-surface-300 text-slate-200 border border-orange-500/20 active:scale-[0.98] disabled:opacity-50",
  ghost:
    "text-slate-400 hover:bg-surface-200 hover:text-white active:scale-[0.98] disabled:opacity-50",
  danger:
    "bg-rose-500/90 hover:bg-rose-500 text-white shadow-[0_0_16px_rgba(244,63,94,0.35)] active:scale-[0.98] disabled:opacity-50",
  success:
    "bg-emerald-500/90 hover:bg-emerald-500 text-white shadow-[0_0_16px_rgba(16,185,129,0.35)] active:scale-[0.98] disabled:opacity-50",
  outline:
    "border border-orange-500/25 hover:border-orange-500/50 hover:bg-orange-500/5 text-slate-300 hover:text-white active:scale-[0.98] disabled:opacity-50"
};

const sizes = {
  xs: "h-7 px-2.5 text-[11px] gap-1.5 rounded-lg",
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
  lg: "h-12 px-5 text-base gap-2 rounded-xl"
};

export const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    leftIcon,
    rightIcon,
    loading,
    className,
    children,
    type = "button",
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-0",
        variants[variant] || variants.primary,
        sizes[size],
        loading && "opacity-70 cursor-wait",
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
          <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});
