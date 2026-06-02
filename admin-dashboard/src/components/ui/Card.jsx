import { cn } from "../../lib/cn.js";

export function Card({ className, glow, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-orange-500/8 bg-gradient-to-br from-surface-100/60 to-surface-50/40 shadow-card backdrop-blur",
        glow === "orange" && "border-orange-500/25 shadow-[0_0_0_1px_rgba(249,115,22,0.15),0_2px_16px_-4px_rgba(0,0,0,0.5),0_0_20px_rgba(249,115,22,0.1)]",
        glow === "blue" && "border-blue-500/25 shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_2px_16px_-4px_rgba(0,0,0,0.5),0_0_20px_rgba(59,130,246,0.1)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, title, subtitle, action, children }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-5 py-4 border-b border-orange-500/10", className)}>
      <div className="min-w-0">
        {title && <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>}
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        {children}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function CardFooter({ className, children }) {
  return (
    <div className={cn("px-5 py-3 border-t border-orange-500/10 flex items-center justify-end gap-2", className)}>
      {children}
    </div>
  );
}
