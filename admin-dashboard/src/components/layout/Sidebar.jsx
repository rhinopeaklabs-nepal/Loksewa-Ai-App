import { useState } from "react";
import {
  LayoutDashboard, BookOpen, GraduationCap, FileQuestion,
  Library, ClipboardList, Users, Flag, LogOut, Sparkles,
  PanelLeftClose, PanelLeftOpen, Home, BarChart2, User, X
} from "lucide-react";
import { cn } from "../../lib/cn.js";
import { BrandLogo } from "../BrandLogo.jsx";

const NAV = [
  { value: "overview",  label: "Overview",   icon: LayoutDashboard },
  { value: "subjects",  label: "Subjects",   icon: BookOpen },
  { value: "courses",   label: "Courses",    icon: GraduationCap },
  { value: "questions", label: "Questions",  icon: FileQuestion },
  { value: "syllabus",  label: "Syllabus",   icon: Library },
  { value: "mocks",     label: "Mock Tests", icon: ClipboardList },
  { value: "users",     label: "Users",      icon: Users },
  { value: "reports",   label: "Reports",    icon: Flag }
];

// Mobile bottom nav — matches mobile app's 5-icon layout
const BOTTOM_NAV = [
  { value: "overview",  icon: Home,           label: "Home" },
  { value: "questions",icon: FileQuestion,    label: "Tests" },
  { value: "mocks",    icon: ClipboardList,   label: "Mocks" },
  { value: "users",    icon: User,            label: "Users" },
  { value: "reports",  icon: Flag,            label: "Reports" }
];

function NavItem({ item, active, onClick, collapsed }) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 w-full",
        active
          ? "bg-orange-500/15 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.2)]"
          : "text-slate-400 hover:bg-surface-200/60 hover:text-slate-200"
      )}
      title={collapsed ? item.label : undefined}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-orange-400 to-amber-400" />
      )}
      <Icon className={cn("w-[18px] h-[18px] shrink-0", active ? "text-orange-400" : "text-slate-500 group-hover:text-slate-300")} />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {active && !collapsed && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
      )}
    </button>
  );
}

// Desktop sidebar
export function Sidebar({ tab, onChange, user, onSignOut, collapsed, onToggle, mobileOpen, onMobileClose }) {
  const [localCollapsed, setLocalCollapsed] = useState(collapsed ?? false);
  const isCollapsed = collapsed !== undefined ? collapsed : localCollapsed;
  const isMobile = mobileOpen !== undefined;

  const content = (
    <div
      className={cn(
        "flex flex-col h-full",
        isMobile ? "w-72" : cn("sticky top-0 h-screen shrink-0 transition-[width] duration-200", isCollapsed ? "w-[72px]" : "w-64")
      )}
    >
      {/* Brand */}
      <div className="h-16 flex items-center px-4 border-b border-orange-500/10 shrink-0">
        {isCollapsed ? (
          <div className="mx-auto">
            <BrandLogo size={36} showText={false} />
          </div>
        ) : (
          <BrandLogo size={36} textSize="text-sm" />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map((item) => (
          <NavItem
            key={item.value}
            item={item}
            active={tab === item.value}
            onClick={() => onChange(item.value)}
            collapsed={isCollapsed}
          />
        ))}
      </nav>

      {/* User + sign out */}
      <div className="border-t border-orange-500/10 p-3 flex flex-col gap-2 shrink-0">
        {!isCollapsed && user && (
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-surface-200/40">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {(user.full_name || user.email || "?").slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-200 truncate">{user.full_name || user.email}</p>
              <p className="text-[10px] text-orange-400 capitalize font-semibold">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={onSignOut}
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            "text-slate-400 hover:bg-surface-200/60 hover:text-slate-200"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Sign out</span>}
        </button>
        {!isMobile && (
          <button
            onClick={onToggle ?? (() => setLocalCollapsed((c) => !c))}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-surface-200/60 hover:text-slate-200 transition-colors"
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            {!isCollapsed && <span>Collapse</span>}
          </button>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <aside className="fixed inset-y-0 left-0 z-40 flex w-72 flex-col glass border-r border-orange-500/15 lg:hidden anim-slide-in">
        <button
          onClick={onMobileClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-surface-200/80 flex items-center justify-center text-slate-400 hover:text-white hover:bg-surface-300 z-10"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
        {content}
      </aside>
    );
  }

  return content;
}

// Mobile bottom navigation — matches mobile app
export function BottomNav({ tab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 lg:hidden glass border-t border-orange-500/15 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-around px-1 py-1.5 max-w-md mx-auto">
        {BOTTOM_NAV.map((item) => {
          const active = tab === item.value;
          const Icon = item.icon;
          return (
            <button
              key={item.value}
              onClick={() => onTabChange(item.value)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all min-w-[60px] flex-1",
                active ? "text-orange-400" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {active && (
                <div className="absolute inset-0 rounded-2xl bg-orange-500/10 border border-orange-500/20" />
              )}
              <div className="relative z-10">
                <Icon
                  className={cn("w-5 h-5 transition-all", active && "text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.7)]")}
                  strokeWidth={active ? 2.5 : 2}
                />
              </div>
              <span className={cn("relative z-10 text-[10px] font-semibold", active ? "text-orange-300" : "text-slate-500")}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
