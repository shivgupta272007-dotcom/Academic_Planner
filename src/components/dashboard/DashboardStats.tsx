import React from 'react';
import { ClipboardCheck, Clock, Flame, BookOpen, GraduationCap } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import {
  getCompletionPercentage,
  getStudyHoursThisWeek,
  calculateStreak,
  getOverdueAssignments,
} from '../../utils/analytics';

const getGPAPoints = (letterGrade?: string): number | null => {
  if (!letterGrade) return null;
  switch (letterGrade) {
    case 'A+': return 4.0;
    case 'A': return 4.0;
    case 'A-': return 3.7;
    case 'B+': return 3.3;
    case 'B': return 3.0;
    case 'B-': return 2.7;
    case 'C+': return 2.3;
    case 'C': return 2.0;
    case 'C-': return 1.7;
    case 'D': return 1.0;
    case 'F': return 0.0;
    default: return null;
  }
};

export default function DashboardStats() {
  const { assignments, pomodoroSessions, subjects } = useApp();

  const completion = getCompletionPercentage(assignments);
  const studyHours = getStudyHoursThisWeek(pomodoroSessions);
  const streak = calculateStreak(assignments);
  const overdue = getOverdueAssignments(assignments).length;

  // GPA calculation for college summary
  const gpaSummary = (() => {
    let totalPoints = 0;
    let gradedCredits = 0;
    let totalCredits = 0;

    subjects.forEach((s) => {
      const cred = s.credits || 0;
      totalCredits += cred;
      const pts = getGPAPoints(s.grade);
      if (pts !== null && cred > 0) {
        totalPoints += pts * cred;
        gradedCredits += cred;
      }
    });

    const gpaVal = gradedCredits > 0 ? (totalPoints / gradedCredits).toFixed(2) : null;
    return {
      gpa: gpaVal,
      totalCredits,
    };
  })();

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
      label: 'Overdue Tasks',
      value: `${overdue}`,
      icon: <BookOpen size={20} />,
      color: overdue > 0 ? '#f43f5e' : '#10b981',
      glowColor: overdue > 0 ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)',
      subtitle: overdue === 0 ? 'All caught up!' : 'Need attention',
    },
    {
      label: 'Estimated GPA',
      value: gpaSummary.gpa || 'N/A',
      icon: <GraduationCap size={20} />,
      color: '#8b5cf6',
      glowColor: 'rgba(139, 92, 246, 0.4)',
      subtitle: `${gpaSummary.totalCredits} credits logged`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
