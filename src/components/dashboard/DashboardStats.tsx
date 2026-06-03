import React from 'react';
import { ClipboardCheck, Clock, Flame, BookOpen } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import {
  getCompletionPercentage,
  getStudyHoursThisWeek,
  calculateStreak,
  getOverdueAssignments,
} from '../../utils/analytics';

export default function DashboardStats() {
  const { assignments, pomodoroSessions } = useApp();

  const completion = getCompletionPercentage(assignments);
  const studyHours = getStudyHoursThisWeek(pomodoroSessions);
  const streak = calculateStreak(assignments);
  const overdue = getOverdueAssignments(assignments).length;

  const stats = [
    {
      label: 'Completion Rate',
      value: `${completion}%`,
      icon: <ClipboardCheck size={20} />,
      color: '#10b981',
      glowColor: 'rgba(16, 185, 129, 0.4)',
      subtitle: `${assignments.filter((a) => a.status === 'completed').length}/${assignments.length} done`,
    },
    {
      label: 'Study Hours',
      value: `${studyHours}h`,
      icon: <Clock size={20} />,
      color: '#6366f1',
      glowColor: 'rgba(99, 102, 241, 0.4)',
      subtitle: 'This week',
    },
    {
      label: 'Current Streak',
      value: `${streak}`,
      icon: <Flame size={20} />,
      color: '#f97316',
      glowColor: 'rgba(249, 115, 22, 0.4)',
      subtitle: streak === 1 ? 'day' : 'days',
    },
    {
      label: 'Overdue',
      value: `${overdue}`,
      icon: <BookOpen size={20} />,
      color: overdue > 0 ? '#f43f5e' : '#10b981',
      glowColor: overdue > 0 ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)',
      subtitle: overdue === 0 ? 'All caught up!' : 'Need attention',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="glass-card p-4 stat-glow animate-slide-up"
          style={
            { '--glow-color': stat.glowColor, animationDelay: `${index * 75}ms` } as React.CSSProperties
          }
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className="p-2 rounded-xl"
              style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
            >
              {stat.icon}
            </span>
          </div>
          <div className="text-2xl font-bold text-[var(--color-text-primary)]">{stat.value}</div>
          <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{stat.label}</div>
          <div className="text-xs mt-1" style={{ color: stat.color }}>
            {stat.subtitle}
          </div>
        </div>
      ))}
    </div>
  );
}
