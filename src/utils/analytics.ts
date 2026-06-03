import type { Assignment, PomodoroSession, StudySession, Subject } from '../types';
import { isOverdue, parseISO, isAfter, isBefore, addDays, format, startOfWeek } from './dates';

export function getCompletionPercentage(assignments: Assignment[]): number {
  if (assignments.length === 0) return 0;
  const completed = assignments.filter((a) => a.status === 'completed').length;
  return Math.round((completed / assignments.length) * 100);
}

export function getSubjectCompletionPercentage(
  assignments: Assignment[],
  subjectId: string
): number {
  const subjectAssignments = assignments.filter((a) => a.subjectId === subjectId);
  return getCompletionPercentage(subjectAssignments);
}

export function getOverdueAssignments(assignments: Assignment[]): Assignment[] {
  return assignments.filter(
    (a) => a.status !== 'completed' && isOverdue(a.dueDate)
  );
}

export function getUpcomingAssignments(
  assignments: Assignment[],
  days: number = 7
): Assignment[] {
  const now = new Date();
  const threshold = addDays(now, days);
  return assignments
    .filter((a) => {
      if (a.status === 'completed') return false;
      const dueDate = parseISO(a.dueDate);
      return (isAfter(dueDate, now) || format(dueDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) && isBefore(dueDate, threshold);
    })
    .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime());
}

export function sortAssignmentsByUrgency(assignments: Assignment[]): Assignment[] {
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

  return [...assignments].sort((a, b) => {
    // Completed items go to the bottom
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;

    // Overdue items go to the top
    const aOverdue = isOverdue(a.dueDate);
    const bOverdue = isOverdue(b.dueDate);
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    // Then sort by due date
    const dateDiff = parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime();
    if (dateDiff !== 0) return dateDiff;

    // Then by priority
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export function getTotalStudyHours(
  pomodoroSessions: PomodoroSession[],
  subjectId?: string
): number {
  let sessions = pomodoroSessions.filter(
    (s) => s.type === 'focus' && s.completed
  );
  if (subjectId) {
    sessions = sessions.filter((s) => s.subjectId === subjectId);
  }
  const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0);
  return Math.round((totalSeconds / 3600) * 10) / 10;
}

export function getStudyHoursThisWeek(
  pomodoroSessions: PomodoroSession[],
  subjectId?: string
): number {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  let sessions = pomodoroSessions.filter((s) => {
    if (s.type !== 'focus' || !s.completed) return false;
    const date = parseISO(s.startedAt);
    return isAfter(date, weekStart);
  });
  if (subjectId) {
    sessions = sessions.filter((s) => s.subjectId === subjectId);
  }
  const totalSeconds = sessions.reduce((sum, s) => sum + s.duration, 0);
  return Math.round((totalSeconds / 3600) * 10) / 10;
}

export function getStudyHoursBySubject(
  pomodoroSessions: PomodoroSession[],
  subjects: Subject[],
  days: number = 7
): { name: string; hours: number; color: string }[] {
  const cutoff = addDays(new Date(), -days);
  const recentSessions = pomodoroSessions.filter((s) => {
    if (s.type !== 'focus' || !s.completed) return false;
    return isAfter(parseISO(s.startedAt), cutoff);
  });

  return subjects.map((subject) => {
    const subjectSessions = recentSessions.filter(
      (s) => s.subjectId === subject.id
    );
    const totalSeconds = subjectSessions.reduce((sum, s) => sum + s.duration, 0);
    return {
      name: subject.name,
      hours: Math.round((totalSeconds / 3600) * 10) / 10,
      color: subject.color,
    };
  }).filter((s) => s.hours > 0);
}

export function getCompletionTrend(
  assignments: Assignment[],
  days: number = 14
): { date: string; completed: number; total: number }[] {
  const result: { date: string; completed: number; total: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(new Date(), -i);
    const dayLabel = format(date, 'MMM d');

    const assignmentsBeforeDate = assignments.filter((a) => {
      return isBefore(parseISO(a.createdAt), addDays(date, 1));
    });

    const completedByDate = assignmentsBeforeDate.filter((a) => {
      return a.status === 'completed' && a.completedAt && isBefore(parseISO(a.completedAt), addDays(date, 1));
    });

    result.push({
      date: dayLabel,
      completed: completedByDate.length,
      total: assignmentsBeforeDate.length,
    });
  }
  return result;
}

export function calculateStreak(assignments: Assignment[]): number {
  const completedDates = new Set<string>();
  assignments.forEach((a) => {
    if (a.status === 'completed' && a.completedAt) {
      completedDates.add(format(parseISO(a.completedAt), 'yyyy-MM-dd'));
    }
  });

  let streak = 0;
  let currentDate = new Date();

  // Check if today has activity
  const todayStr = format(currentDate, 'yyyy-MM-dd');
  if (!completedDates.has(todayStr)) {
    // Check yesterday (streak might still be active)
    currentDate = addDays(currentDate, -1);
    if (!completedDates.has(format(currentDate, 'yyyy-MM-dd'))) {
      return 0;
    }
  }

  while (completedDates.has(format(currentDate, 'yyyy-MM-dd'))) {
    streak++;
    currentDate = addDays(currentDate, -1);
  }

  return streak;
}

export function getStudySessionsForWeek(
  sessions: StudySession[],
  weekStart: Date
): StudySession[] {
  const weekEnd = addDays(weekStart, 7);
  return sessions.filter((s) => {
    const date = parseISO(s.date);
    return (isAfter(date, weekStart) || format(date, 'yyyy-MM-dd') === format(weekStart, 'yyyy-MM-dd')) && isBefore(date, weekEnd);
  });
}
