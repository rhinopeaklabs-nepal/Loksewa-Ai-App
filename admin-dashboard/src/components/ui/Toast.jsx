import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "../../lib/cn.js";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, type = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((current) => [...current, { id, message, type }]);
  }, []);

  const toast = {
    success: (m) => push(m, "success"),
    error: (m) => push(m, "error"),
    warning: (m) => push(m, "warning"),
    info: (m) => push(m, "info")
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-80 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const handle = setTimeout(onDismiss, 3500);
    return () => clearTimeout(handle);
  }, [onDismiss]);

  const palette = {
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
    error: "border-rose-500/30 bg-rose-500/10 text-rose-100",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-100",
    info: "border-sky-500/30 bg-sky-500/10 text-sky-100"
  };
  const Icon = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  }[toast.type];

  return (
    <div
      className={cn(
        "pointer-events-auto anim-slide-in flex items-start gap-3 rounded-xl border px-3.5 py-3 shadow-pop backdrop-blur",
        palette[toast.type]
      )}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <p className="text-sm flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="text-current/60 hover:text-current transition-colors -m-1 p-1"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
