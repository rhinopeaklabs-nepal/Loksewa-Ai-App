import { cn } from "../../lib/cn.js";

export function Tabs({ items, value, onChange, className }) {
  return (
    <div className={cn("border-b border-orange-500/10 flex items-center gap-0.5 overflow-x-auto", className)}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            className={cn(
              "relative px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 rounded-t-xl",
              active
                ? "text-white bg-surface-100/40"
                : "text-slate-500 hover:text-slate-200 hover:bg-surface-100/20"
            )}
          >
            {item.icon && <item.icon className={cn("w-4 h-4", active ? "text-orange-400" : "text-slate-500")} />}
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-full text-[10px] font-bold px-1.5 py-0.5 leading-none",
                  active ? "bg-orange-500/20 text-orange-300" : "bg-surface-300 text-slate-500"
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
