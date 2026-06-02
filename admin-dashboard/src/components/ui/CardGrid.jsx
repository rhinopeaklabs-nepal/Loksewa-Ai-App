import { Pencil, Trash2 } from "lucide-react";
import { cn } from "../../lib/cn.js";
import { Button } from "./Button.jsx";

/**
 * Card grid layout — matches mobile app's "Subject", "Mock Test", "Study Material" card style.
 *
 * @param {React.ReactNode} renderCard  (item) => React node, single card
 * @param {Array}  items
 * @param {string} emptyTitle
 * @param {string} emptyDescription
 * @param {string} columnsClassName  tailwind grid-cols class
 * @param {string} className
 * @param {boolean} showActions
 * @param {function} onEdit
 * @param {function} onDelete
 */
export function CardGrid({
  renderCard,
  items,
  emptyTitle = "No items yet",
  emptyDescription,
  columnsClassName = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  className,
  showActions = true,
  onEdit,
  onDelete,
  emptyIcon,
  emptyAction
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-6 py-16 rounded-2xl border border-dashed border-orange-500/15 bg-surface-100/30">
        {emptyIcon && (
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
            <emptyIcon className="w-6 h-6" />
          </div>
        )}
        <h4 className="text-sm font-semibold text-slate-200">{emptyTitle}</h4>
        {emptyDescription && <p className="text-xs text-slate-500 mt-1.5 max-w-sm leading-relaxed">{emptyDescription}</p>}
        {emptyAction && <div className="mt-5">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-3", columnsClassName, className)}>
      {items.map((item, idx) => (
        <div
          key={item.id || idx}
          className="group relative"
        >
          {renderCard(item)}
          {showActions && (onEdit || onDelete) && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              {onEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                  className="w-7 h-7 rounded-lg bg-surface-200/90 backdrop-blur border border-orange-500/20 flex items-center justify-center text-slate-400 hover:text-orange-400 hover:bg-surface-300 transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                  className="w-7 h-7 rounded-lg bg-surface-200/90 backdrop-blur border border-rose-500/20 flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-surface-300 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Single generic card wrapper — used by all list pages.
 * Provides the consistent glass-card style with optional accent color stripe.
 */
export function ItemCard({ children, color, accent = "left", onClick, className }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-orange-500/8 bg-gradient-to-br from-surface-100/60 to-surface-50/40 backdrop-blur p-4",
        "hover:border-orange-500/20 hover:shadow-[0_0_20px_rgba(249,115,22,0.08)] transition-all",
        onClick && "cursor-pointer active:scale-[0.98]",
        className
      )}
    >
      {accent === "left" && color && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: `linear-gradient(180deg, ${color} 0%, ${color}80 100%)` }}
        />
      )}
      {children}
    </div>
  );
}
