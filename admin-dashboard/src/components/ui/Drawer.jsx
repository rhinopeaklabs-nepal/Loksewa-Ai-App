import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn.js";

export function Drawer({ open, onClose, title, description, children, footer, width = "max-w-xl" }) {
  useEffect(() => {
    if (!open) return;
    const handler = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />
      <aside
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-full glass-card border-l border-orange-500/15 shadow-pop",
          "flex flex-col transition-transform duration-200",
          width,
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-start justify-between gap-4 px-6 py-5 border-b border-orange-500/10 shrink-0">
          <div>
            {title && <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>}
            {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-1 -m-1 rounded-xl hover:bg-surface-200"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <footer className="px-6 py-4 border-t border-orange-500/10 bg-surface-100/60 flex items-center justify-end gap-2 shrink-0">
            {footer}
          </footer>
        )}
      </aside>
    </>
  );
}
