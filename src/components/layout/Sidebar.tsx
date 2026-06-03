import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Calendar,
  BookOpen,
  Timer,
  Settings,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  FileText,
  Award,
  Bookmark,
  Sparkles,
  Link,
  X,
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/assignments', icon: ClipboardList, label: 'Assignments' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/subjects', icon: BookOpen, label: 'Subjects' },
  { path: '/notes', icon: FileText, label: 'Notes' },
  { path: '/exams', icon: Award, label: 'Exams' },
  { path: '/syllabus', icon: Bookmark, label: 'Syllabus' },
  { path: '/assistant', icon: Sparkles, label: 'AI Shiv' },
  { path: '/resources', icon: Link, label: 'Resources' },
  { path: '/pomodoro', icon: Timer, label: 'Pomodoro' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onCloseMobile?: () => void;
}

export default function Sidebar({ collapsed, onToggle, onCloseMobile }: SidebarProps) {
  const forceShowText = !collapsed || !!onCloseMobile;

  return (
    <aside
      className="h-full w-full glass-card rounded-none border-l-0 border-t-0 border-b-0 flex flex-col"
    >
      {/* Logo & Mobile Close button */}
      <div className="flex items-center justify-between p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
            <GraduationCap size={20} className="text-white" />
          </div>
          {forceShowText && (
            <div className="animate-fade-in">
              <h1 className="text-sm font-bold gradient-text">Academic</h1>
              <h1 className="text-sm font-bold gradient-text -mt-0.5">Planner</h1>
            </div>
          )}
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg hover:bg-[var(--glass-bg-light)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            title="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            onClick={() => onCloseMobile?.()}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200 group
              ${collapsed ? 'justify-center' : ''}
              ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-indigo-400 shadow-sm'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--glass-bg-light)]'
              }
            `}
          >
            <Icon size={18} className="flex-shrink-0" />
            {forceShowText && <span className="animate-fade-in">{label}</span>}
            {collapsed && !onCloseMobile && (
              <div className="absolute left-full ml-2 px-2 py-1 rounded-lg glass-card text-xs text-[var(--color-text-primary)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-glass-sm">
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle (only visible on desktop) */}
      {!onCloseMobile && (
        <div className="p-3 border-t border-[var(--glass-border)]">
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--glass-bg-light)] transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      )}
    </aside>
  );
}
