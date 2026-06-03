import type { AppSettings, Subject } from '../types';

export const SUBJECT_COLORS = [
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Cyan', hex: '#06b6d4' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Lime', hex: '#84cc16' },
  { name: 'Sky', hex: '#0ea5e9' },
];

export const SUBJECT_ICONS = [
  '📚', '🧮', '🔬', '🎨', '🌍', '💻', '📐', '🎵',
  '⚗️', '📖', '🏛️', '🧬', '✍️', '🔢', '🌐', '🎭',
];

export const PRIORITY_CONFIG = {
  low: { label: 'Low', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
  medium: { label: 'Medium', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.15)' },
  high: { label: 'High', color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.15)' },
  critical: { label: 'Critical', color: '#f43f5e', bgColor: 'rgba(244, 63, 94, 0.15)' },
};

export const STATUS_CONFIG = {
  not_started: { label: 'Not Started', color: '#94a3b8', bgColor: 'rgba(148, 163, 184, 0.15)' },
  in_progress: { label: 'In Progress', color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.15)' },
  completed: { label: 'Completed', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)' },
};

export const SESSION_STATUS_CONFIG = {
  planned: { label: 'Planned', color: '#6366f1' },
  completed: { label: 'Completed', color: '#10b981' },
  skipped: { label: 'Skipped', color: '#94a3b8' },
};

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'sub-1', name: 'Mathematics', color: '#6366f1', icon: '🧮', createdAt: new Date().toISOString() },
  { id: 'sub-2', name: 'Physics', color: '#06b6d4', icon: '🔬', createdAt: new Date().toISOString() },
  { id: 'sub-3', name: 'Computer Science', color: '#10b981', icon: '💻', createdAt: new Date().toISOString() },
  { id: 'sub-4', name: 'English', color: '#f59e0b', icon: '📖', createdAt: new Date().toISOString() },
];

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  pomodoro: {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreaks: false,
    autoStartFocus: false,
    soundEnabled: true,
  },
  notifications: {
    enabled: true,
    leadTimes: [1, 3],
  },
};

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAYS_OF_WEEK_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const HOURS_OF_DAY = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

export const STORAGE_KEYS = {
  subjects: 'academic-planner-subjects',
  assignments: 'academic-planner-assignments',
  studySessions: 'academic-planner-study-sessions',
  pomodoroSessions: 'academic-planner-pomodoro-sessions',
  reminders: 'academic-planner-reminders',
  settings: 'academic-planner-settings',
  studyNotes: 'academic-planner-study-notes',
  exams: 'academic-planner-exams',
  syllabi: 'academic-planner-syllabi',
};
