import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Sparkles } from 'lucide-react';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] bg-grid-pattern relative overflow-hidden">
      {/* Dynamic Ambient Glowing Background Spots */}
      <div className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-indigo-500/[0.06] blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[5%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/[0.04] blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[35%] right-[15%] w-[35vw] h-[35vw] rounded-full bg-violet-500/[0.05] blur-[120px] pointer-events-none z-0" />

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main
        className={`
          transition-all duration-300 ease-out min-h-screen relative z-10
          ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}
        `}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
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
