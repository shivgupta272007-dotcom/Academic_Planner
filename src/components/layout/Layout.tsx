import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    </div>
  );
}
