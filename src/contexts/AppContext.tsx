import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  Subject,
  Assignment,
  StudySession,
  PomodoroSession,
  Reminder,
  AppSettings,
  Note,
  StudyNote,
  Exam,
  Syllabus,
} from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { DEFAULT_SUBJECTS, DEFAULT_SETTINGS, STORAGE_KEYS } from '../utils/constants';

interface AppState {
  subjects: Subject[];
  assignments: Assignment[];
  studySessions: StudySession[];
  pomodoroSessions: PomodoroSession[];
  reminders: Reminder[];
  settings: AppSettings;
  studyNotes: StudyNote[];
  exams: Exam[];
  syllabi: Syllabus[];
}

type AppAction =
  | { type: 'SET_SUBJECTS'; payload: Subject[] }
  | { type: 'ADD_SUBJECT'; payload: Subject }
  | { type: 'UPDATE_SUBJECT'; payload: Subject }
  | { type: 'DELETE_SUBJECT'; payload: string }
  | { type: 'SET_ASSIGNMENTS'; payload: Assignment[] }
  | { type: 'ADD_ASSIGNMENT'; payload: Assignment }
  | { type: 'UPDATE_ASSIGNMENT'; payload: Assignment }
  | { type: 'DELETE_ASSIGNMENT'; payload: string }
  | { type: 'TOGGLE_NOTE_CHECK'; payload: { assignmentId: string; noteId: string } }
  | { type: 'ADD_NOTE'; payload: { assignmentId: string; note: Note } }
  | { type: 'DELETE_NOTE'; payload: { assignmentId: string; noteId: string } }
  | { type: 'SET_STUDY_SESSIONS'; payload: StudySession[] }
  | { type: 'ADD_STUDY_SESSION'; payload: StudySession }
  | { type: 'UPDATE_STUDY_SESSION'; payload: StudySession }
  | { type: 'DELETE_STUDY_SESSION'; payload: string }
  | { type: 'ADD_POMODORO_SESSION'; payload: PomodoroSession }
  | { type: 'SET_REMINDERS'; payload: Reminder[] }
  | { type: 'ADD_REMINDER'; payload: Reminder }
  | { type: 'DISMISS_REMINDER'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'RESET_ALL' }
  | { type: 'ADD_STUDY_NOTE'; payload: StudyNote }
  | { type: 'DELETE_STUDY_NOTE'; payload: string }
  | { type: 'ADD_EXAM'; payload: Exam }
  | { type: 'DELETE_EXAM'; payload: string }
  | { type: 'ADD_SYLLABUS'; payload: Syllabus }
  | { type: 'DELETE_SYLLABUS'; payload: string };

const initialState: AppState = {
  subjects: loadFromStorage(STORAGE_KEYS.subjects, DEFAULT_SUBJECTS),
  assignments: loadFromStorage(STORAGE_KEYS.assignments, []),
  studySessions: loadFromStorage(STORAGE_KEYS.studySessions, []),
  pomodoroSessions: loadFromStorage(STORAGE_KEYS.pomodoroSessions, []),
  reminders: loadFromStorage(STORAGE_KEYS.reminders, []),
  settings: loadFromStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS),
  studyNotes: loadFromStorage(STORAGE_KEYS.studyNotes, []),
  exams: loadFromStorage(STORAGE_KEYS.exams, []),
  syllabi: loadFromStorage(STORAGE_KEYS.syllabi, []),
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SUBJECTS':
      return { ...state, subjects: action.payload };
    case 'ADD_SUBJECT':
      return { ...state, subjects: [...state.subjects, action.payload] };
    case 'UPDATE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
    case 'DELETE_SUBJECT':
      return {
        ...state,
        subjects: state.subjects.filter((s) => s.id !== action.payload),
        assignments: state.assignments.filter((a) => a.subjectId !== action.payload),
        studySessions: state.studySessions.filter((s) => s.subjectId !== action.payload),
        studyNotes: state.studyNotes.filter((n) => n.subjectId !== action.payload),
        exams: state.exams.filter((e) => e.subjectId !== action.payload),
        syllabi: state.syllabi.filter((s) => s.subjectId !== action.payload),
      };
    case 'SET_ASSIGNMENTS':
      return { ...state, assignments: action.payload };
    case 'ADD_ASSIGNMENT':
      return { ...state, assignments: [...state.assignments, action.payload] };
    case 'UPDATE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.map((a) =>
          a.id === action.payload.id ? action.payload : a
        ),
      };
    case 'DELETE_ASSIGNMENT':
      return {
        ...state,
        assignments: state.assignments.filter((a) => a.id !== action.payload),
        reminders: state.reminders.filter((r) => r.assignmentId !== action.payload),
      };
    case 'TOGGLE_NOTE_CHECK':
      return {
        ...state,
        assignments: state.assignments.map((a) => {
          if (a.id !== action.payload.assignmentId) return a;
          return {
            ...a,
            notes: a.notes.map((n) =>
              n.id === action.payload.noteId ? { ...n, checked: !n.checked } : n
            ),
          };
        }),
      };
    case 'ADD_NOTE':
      return {
        ...state,
        assignments: state.assignments.map((a) => {
          if (a.id !== action.payload.assignmentId) return a;
          return { ...a, notes: [...a.notes, action.payload.note] };
        }),
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        assignments: state.assignments.map((a) => {
          if (a.id !== action.payload.assignmentId) return a;
          return {
            ...a,
            notes: a.notes.filter((n) => n.id !== action.payload.noteId),
          };
        }),
      };
    case 'SET_STUDY_SESSIONS':
      return { ...state, studySessions: action.payload };
    case 'ADD_STUDY_SESSION':
      return { ...state, studySessions: [...state.studySessions, action.payload] };
    case 'UPDATE_STUDY_SESSION':
      return {
        ...state,
        studySessions: state.studySessions.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
    case 'DELETE_STUDY_SESSION':
      return {
        ...state,
        studySessions: state.studySessions.filter((s) => s.id !== action.payload),
      };
    case 'ADD_POMODORO_SESSION':
      return {
        ...state,
        pomodoroSessions: [...state.pomodoroSessions, action.payload],
      };
    case 'SET_REMINDERS':
      return { ...state, reminders: action.payload };
    case 'ADD_REMINDER':
      return { ...state, reminders: [...state.reminders, action.payload] };
    case 'DISMISS_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map((r) =>
          r.id === action.payload ? { ...r, dismissed: true } : r
        ),
      };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'ADD_STUDY_NOTE':
      return { ...state, studyNotes: [...state.studyNotes, action.payload] };
    case 'DELETE_STUDY_NOTE':
      return { ...state, studyNotes: state.studyNotes.filter((n) => n.id !== action.payload) };
    case 'ADD_EXAM':
      return { ...state, exams: [...state.exams, action.payload] };
    case 'DELETE_EXAM':
      return { ...state, exams: state.exams.filter((e) => e.id !== action.payload) };
    case 'ADD_SYLLABUS': {
      const exists = state.syllabi.some((s) => s.subjectId === action.payload.subjectId);
      if (exists) {
        return {
          ...state,
          syllabi: state.syllabi.map((s) =>
            s.subjectId === action.payload.subjectId ? action.payload : s
          ),
        };
      }
      return { ...state, syllabi: [...state.syllabi, action.payload] };
    }
    case 'DELETE_SYLLABUS':
      return { ...state, syllabi: state.syllabi.filter((s) => s.id !== action.payload) };
    case 'RESET_ALL':
      return {
        subjects: DEFAULT_SUBJECTS,
        assignments: [],
        studySessions: [],
        pomodoroSessions: [],
        reminders: [],
        settings: DEFAULT_SETTINGS,
        studyNotes: [],
        exams: [],
        syllabi: [],
      };
    default:
      return state;
  }
}

interface AppContextType extends AppState {
  dispatch: React.Dispatch<AppAction>;
  addSubject: (name: string, color: string, icon: string) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;
  addAssignment: (assignment: Omit<Assignment, 'id' | 'notes' | 'createdAt'>) => void;
  updateAssignment: (assignment: Assignment) => void;
  deleteAssignment: (id: string) => void;
  toggleAssignmentStatus: (id: string) => void;
  addNote: (assignmentId: string, content: string, isChecklist: boolean) => void;
  deleteNote: (assignmentId: string, noteId: string) => void;
  toggleNoteCheck: (assignmentId: string, noteId: string) => void;
  addStudySession: (session: Omit<StudySession, 'id'>) => void;
  updateStudySession: (session: StudySession) => void;
  deleteStudySession: (id: string) => void;
  addPomodoroSession: (session: Omit<PomodoroSession, 'id'>) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  getSubjectById: (id: string) => Subject | undefined;
  dismissReminder: (id: string) => void;
  resetAll: () => void;
  addStudyNote: (note: Omit<StudyNote, 'id' | 'createdAt'>) => void;
  deleteStudyNote: (id: string) => void;
  addExam: (exam: Omit<Exam, 'id' | 'createdAt'>) => void;
  deleteExam: (id: string) => void;
  saveSyllabus: (syllabus: Omit<Syllabus, 'id' | 'createdAt'>) => void;
  deleteSyllabus: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Persist state changes to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.subjects, state.subjects);
  }, [state.subjects]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.assignments, state.assignments);
  }, [state.assignments]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.studySessions, state.studySessions);
  }, [state.studySessions]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.pomodoroSessions, state.pomodoroSessions);
  }, [state.pomodoroSessions]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.reminders, state.reminders);
  }, [state.reminders]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.settings, state.settings);
  }, [state.settings]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.studyNotes, state.studyNotes);
  }, [state.studyNotes]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.exams, state.exams);
  }, [state.exams]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.syllabi, state.syllabi);
  }, [state.syllabi]);

  const addSubject = useCallback(
    (name: string, color: string, icon: string) => {
      dispatch({
        type: 'ADD_SUBJECT',
        payload: { id: uuidv4(), name, color, icon, createdAt: new Date().toISOString() },
      });
    },
    []
  );

  const updateSubject = useCallback((subject: Subject) => {
    dispatch({ type: 'UPDATE_SUBJECT', payload: subject });
  }, []);

  const deleteSubject = useCallback((id: string) => {
    dispatch({ type: 'DELETE_SUBJECT', payload: id });
  }, []);

  const addAssignment = useCallback(
    (assignment: Omit<Assignment, 'id' | 'notes' | 'createdAt'>) => {
      dispatch({
        type: 'ADD_ASSIGNMENT',
        payload: {
          ...assignment,
          id: uuidv4(),
          notes: [],
          createdAt: new Date().toISOString(),
        },
      });
    },
    []
  );

  const updateAssignment = useCallback((assignment: Assignment) => {
    dispatch({ type: 'UPDATE_ASSIGNMENT', payload: assignment });
  }, []);

  const deleteAssignment = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ASSIGNMENT', payload: id });
  }, []);

  const toggleAssignmentStatus = useCallback(
    (id: string) => {
      const assignment = state.assignments.find((a) => a.id === id);
      if (!assignment) return;

      const statusCycle: Record<string, Assignment['status']> = {
        not_started: 'in_progress',
        in_progress: 'completed',
        completed: 'not_started',
      };

      const newStatus = statusCycle[assignment.status];
      dispatch({
        type: 'UPDATE_ASSIGNMENT',
        payload: {
          ...assignment,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
        },
      });
    },
    [state.assignments]
  );

  const addNote = useCallback(
    (assignmentId: string, content: string, isChecklist: boolean) => {
      dispatch({
        type: 'ADD_NOTE',
        payload: {
          assignmentId,
          note: {
            id: uuidv4(),
            content,
            isChecklist,
            checked: false,
            createdAt: new Date().toISOString(),
          },
        },
      });
    },
    []
  );

  const deleteNote = useCallback(
    (assignmentId: string, noteId: string) => {
      dispatch({ type: 'DELETE_NOTE', payload: { assignmentId, noteId } });
    },
    []
  );

  const toggleNoteCheck = useCallback(
    (assignmentId: string, noteId: string) => {
      dispatch({ type: 'TOGGLE_NOTE_CHECK', payload: { assignmentId, noteId } });
    },
    []
  );

  const addStudySession = useCallback(
    (session: Omit<StudySession, 'id'>) => {
      dispatch({
        type: 'ADD_STUDY_SESSION',
        payload: { ...session, id: uuidv4() },
      });
    },
    []
  );

  const updateStudySession = useCallback((session: StudySession) => {
    dispatch({ type: 'UPDATE_STUDY_SESSION', payload: session });
  }, []);

  const deleteStudySession = useCallback((id: string) => {
    dispatch({ type: 'DELETE_STUDY_SESSION', payload: id });
  }, []);

  const addPomodoroSession = useCallback(
    (session: Omit<PomodoroSession, 'id'>) => {
      dispatch({
        type: 'ADD_POMODORO_SESSION',
        payload: { ...session, id: uuidv4() },
      });
    },
    []
  );

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  const getSubjectById = useCallback(
    (id: string) => state.subjects.find((s) => s.id === id),
    [state.subjects]
  );

  const dismissReminder = useCallback((id: string) => {
    dispatch({ type: 'DISMISS_REMINDER', payload: id });
  }, []);

  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
  }, []);

  const addStudyNote = useCallback(
    (note: Omit<StudyNote, 'id' | 'createdAt'>) => {
      dispatch({
        type: 'ADD_STUDY_NOTE',
        payload: { ...note, id: uuidv4(), createdAt: new Date().toISOString() },
      });
    },
    []
  );

  const deleteStudyNote = useCallback((id: string) => {
    dispatch({ type: 'DELETE_STUDY_NOTE', payload: id });
  }, []);

  const addExam = useCallback(
    (exam: Omit<Exam, 'id' | 'createdAt'>) => {
      dispatch({
        type: 'ADD_EXAM',
        payload: { ...exam, id: uuidv4(), createdAt: new Date().toISOString() },
      });
    },
    []
  );

  const deleteExam = useCallback((id: string) => {
    dispatch({ type: 'DELETE_EXAM', payload: id });
  }, []);

  const saveSyllabus = useCallback(
    (syllabus: Omit<Syllabus, 'id' | 'createdAt'>) => {
      dispatch({
        type: 'ADD_SYLLABUS',
        payload: { ...syllabus, id: uuidv4(), createdAt: new Date().toISOString() },
      });
    },
    []
  );

  const deleteSyllabus = useCallback((id: string) => {
    dispatch({ type: 'DELETE_SYLLABUS', payload: id });
  }, []);

  const value: AppContextType = {
    ...state,
    dispatch,
    addSubject,
    updateSubject,
    deleteSubject,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    toggleAssignmentStatus,
    addNote,
    deleteNote,
    toggleNoteCheck,
    addStudySession,
    updateStudySession,
    deleteStudySession,
    addPomodoroSession,
    updateSettings,
    getSubjectById,
    dismissReminder,
    resetAll,
    addStudyNote,
    deleteStudyNote,
    addExam,
    deleteExam,
    saveSyllabus,
    deleteSyllabus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
