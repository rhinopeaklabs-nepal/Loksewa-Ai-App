import { cn } from "../../lib/cn.js";

export function DataTable({
  columns,
  rows,
  loading,
  empty,
  onRowClick,
  className
}) {
  return (
    <div className={cn("rounded-2xl border border-orange-500/10 bg-gradient-to-br from-surface-100/60 to-surface-50/40 overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-100/40 border-b border-orange-500/10">
              {columns.map((col, i) => (
                <th
                  key={col.key || i}
                  className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap"
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-sm text-slate-500">
                  {empty || "No records found."}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  className={cn(
                    "border-b border-orange-500/8 last:border-0 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-orange-500/5"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col, colIndex) => (
                    <td key={col.key || colIndex} className="px-4 py-3 align-middle text-slate-300">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
