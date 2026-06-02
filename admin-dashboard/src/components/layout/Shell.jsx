import { useState } from "react";
import { Sidebar } from "./Sidebar.jsx";
import { Topbar } from "./Topbar.jsx";
import { cn } from "../../lib/cn.js";

export function Shell({ tab, onTabChange, user, onSignOut, topbar, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-bg-0 text-slate-200">
      {/* Desktop sidebar — always visible */}
      <div className="hidden lg:block shrink-0">
        <Sidebar tab={tab} onChange={onTabChange} user={user} onSignOut={onSignOut} />
      </div>

      {/* Mobile sidebar drawer */}
      <Sidebar
        tab={tab}
        onChange={(t) => { onTabChange(t); setSidebarOpen(false); }}
        user={user}
        onSignOut={onSignOut}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar {...topbar} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-5 sm:px-6 md:px-8 md:py-6 anim-fade-in pb-20 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
