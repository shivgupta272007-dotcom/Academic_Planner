export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface Note {
  id: string;
  content: string;
  isChecklist: boolean;
  checked: boolean;
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'completed';
  notes: Note[];
  createdAt: string;
  completedAt?: string;
  attachment?: {
    name: string;
    data: string;
    size: number;
  };
}

export interface StudySession {
  id: string;
  subjectId: string;
  title: string;
  date: string;
  startTime: string;
  duration: number;
  actualDuration?: number;
  status: 'planned' | 'completed' | 'skipped';
  dayOfWeek: number;
}

export interface PomodoroSession {
  id: string;
  subjectId: string;
  assignmentId?: string;
  startedAt: string;
  duration: number;
  type: 'focus' | 'short_break' | 'long_break';
  completed: boolean;
}

export interface Reminder {
  id: string;
  assignmentId: string;
  leadTimeDays: number;
  notifiedAt?: string;
  dismissed: boolean;
}

export interface PomodoroSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  leadTimes: number[];
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  pomodoro: PomodoroSettings;
  notifications: NotificationSettings;
  userName?: string;
}

export interface StudyNote {
  id: string;
  subjectId: string;
  title: string;
  content: string;
  createdAt: string;
  attachment?: {
    name: string;
    data: string;
    size: number;
  };
}

export interface Exam {
  id: string;
  subjectId: string;
  title: string;
  date: string;
  time: string;
  room?: string;
  notes?: string;
  createdAt: string;
  datesheet?: {
    name: string;
    data: string;
    size: number;
  };
}

export interface Syllabus {
  id: string;
  subjectId: string;
  createdAt: string;
  notes?: string;
  attachment?: {
    name: string;
    data: string;
    size: number;
  };
}

export interface StudyResource {
  id: string;
  subjectId: string;
  title: string;
  url: string;
  description?: string;
  category: 'website' | 'video' | 'book' | 'article' | 'other';
  createdAt: string;
}

export type Priority = Assignment['priority'];
export type Status = Assignment['status'];
export type SessionStatus = StudySession['status'];

