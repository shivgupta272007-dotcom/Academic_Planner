import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Sparkles, Menu } from 'lucide-react';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] bg-grid-pattern relative overflow-hidden flex flex-col md:flex-row">
      {/* Dynamic Ambient Glowing Background Spots */}
      <div className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-indigo-500/[0.06] blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[5%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/[0.04] blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[35%] right-[15%] w-[35vw] h-[35vw] rounded-full bg-violet-500/[0.05] blur-[120px] pointer-events-none z-0" />

      {/* Mobile Top Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 glass-card rounded-none border-t-0 border-l-0 border-r-0 z-40 sticky top-0 w-full">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl hover:bg-[var(--glass-bg-light)] text-[var(--color-text-secondary)] transition-colors"
          title="Open Menu"
        >
          <Menu size={20} />
        </button>
        <span className="font-bold gradient-text text-sm">Academic Planner</span>
        <div className="w-9 h-9" /> {/* Spacer to balance header */}
      </div>

      {/* Sidebar Overlay backdrop for mobile drawer */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity"
        />
      )}

      {/* Sidebar (drawer on mobile, sidebar on desktop) */}
      <div
        className={`
          fixed md:sticky top-0 left-0 h-screen z-40 transition-transform duration-300 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onCloseMobile={() => setMobileOpen(false)}
        />
      </div>

      {/* Main Workspace content */}
      <main className="flex-1 min-h-screen relative z-10 transition-all duration-300 ease-out w-full">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <Outlet />
        </div>
      </main>

      {/* Floating AI Summon Button */}
      <button
        onClick={() => navigate('/assistant')}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/45 hover:scale-105 active:scale-95 transition-all duration-200 z-50 group border border-indigo-400/20"
        title="Ask Shiv (AI Study Assistant)"
      >
        <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
}
