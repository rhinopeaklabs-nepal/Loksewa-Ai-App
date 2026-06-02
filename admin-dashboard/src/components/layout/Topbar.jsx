import { useEffect, useState } from "react";
import { Bell, RefreshCw, Search, Menu } from "lucide-react";
import { Button } from "../ui/Button.jsx";
import { BrandLogo } from "../BrandLogo.jsx";

export function Topbar({ title, onSearch, onRefresh, loading, action, onMenuClick }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => onSearch?.(query), 250);
    return () => clearTimeout(handler);
  }, [query, onSearch]);

  return (
    <header className="sticky top-0 z-20 h-14 bg-bg-50/80 backdrop-blur-md border-b border-orange-500/10 flex items-center gap-3 px-4 sm:px-6">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 -ml-1.5 rounded-xl text-slate-400 hover:bg-surface-200 hover:text-white transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile brand (only visible on small screens) */}
      <div className="lg:hidden">
        <BrandLogo size={28} textSize="text-xs" />
      </div>

      <div className="min-w-0 flex-1">
        {title && <h1 className="text-sm font-semibold text-slate-300 truncate hidden sm:block">{title}</h1>}
      </div>

      <div className="relative max-w-xs flex-1 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="w-full h-8.5 rounded-xl bg-surface-100/80 border border-orange-500/15 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/15 transition-all"
        />
      </div>

      {onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          loading={loading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="text-slate-400 hover:text-white"
        >
          <span className="hidden lg:inline">Refresh</span>
        </Button>
      )}
      <button
        className="relative p-2 rounded-xl text-slate-400 hover:bg-surface-200 hover:text-white transition-colors"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
      </button>
      {action}
    </header>
  );
}
