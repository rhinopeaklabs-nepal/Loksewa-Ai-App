import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileQuestion,
  Brain,
  BarChart3,
  LogOut,
} from "lucide-react";

export function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500" />
            <div>
              <h1 className="font-bold text-lg">Loksewa AI</h1>
              <p className="text-xs text-slate-400">Admin Console</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <SidebarLink to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <SidebarLink to="/questions" icon={<FileQuestion size={18} />} label="Questions" />
          <SidebarLink to="/knowledge" icon={<BookOpen size={18} />} label="Knowledge" />
          <SidebarLink to="/exams" icon={<Brain size={18} />} label="Mock Exams" />
          <SidebarLink to="/users" icon={<Users size={18} />} label="Users" />
          <SidebarLink to="/analytics" icon={<BarChart3 size={18} />} label="Analytics" />
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              localStorage.removeItem("admin_token");
              window.location.href = "/login";
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}

function SidebarLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
          isActive
            ? "bg-primary-600 text-white"
            : "text-slate-300 hover:bg-slate-800"
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
