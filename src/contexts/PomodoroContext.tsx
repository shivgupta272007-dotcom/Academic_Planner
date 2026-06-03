import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useApp } from './AppContext';
import type { PomodoroSettings } from '../types';

type TimerState = 'idle' | 'running' | 'paused';
type SessionType = 'focus' | 'short_break' | 'long_break';

interface PomodoroContextType {
  timerState: TimerState;
  sessionType: SessionType;
  timeRemaining: number;
  totalTime: number;
  currentSession: number;
  selectedSubjectId: string | null;
  selectedAssignmentId: string | null;
  settings: PomodoroSettings;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
  setSelectedSubject: (id: string | null) => void;
  setSelectedAssignment: (id: string | null) => void;
  progress: number;
}

const PomodoroContext = createContext<PomodoroContextType | null>(null);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const { settings: appSettings, addPomodoroSession } = useApp();
  const pomSettings = appSettings.pomodoro;

  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [timeRemaining, setTimeRemaining] = useState(pomSettings.focusDuration * 60);
  const [totalTime, setTotalTime] = useState(pomSettings.focusDuration * 60);
  const [currentSession, setCurrentSession] = useState(1);
  const [selectedSubjectId, setSelectedSubject] = useState<string | null>(null);
  const [selectedAssignmentId, setSelectedAssignment] = useState<string | null>(null);

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<string | null>(null);

  const progress = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;

  const getSessionDuration = useCallback(
    (type: SessionType): number => {
      switch (type) {
        case 'focus':
          return pomSettings.focusDuration * 60;
        case 'short_break':
          return pomSettings.shortBreakDuration * 60;
        case 'long_break':
          return pomSettings.longBreakDuration * 60;
      }
    },
    [pomSettings]
  );

  const completeSession = useCallback(() => {
    if (sessionType === 'focus' && selectedSubjectId && startTimeRef.current) {
      addPomodoroSession({
        subjectId: selectedSubjectId,
        assignmentId: selectedAssignmentId || undefined,
        startedAt: startTimeRef.current,
        duration: totalTime,
        type: 'focus',
        completed: true,
      });
    }

    // Play sound
    if (pomSettings.soundEnabled) {
      try {
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch {
        // Audio not available
      }
    }

    // Determine next session type
    let nextType: SessionType;
    if (sessionType === 'focus') {
      if (currentSession % pomSettings.sessionsBeforeLongBreak === 0) {
        nextType = 'long_break';
      } else {
        nextType = 'short_break';
      }
    } else {
      nextType = 'focus';
      if (sessionType === 'long_break') {
        setCurrentSession(1);
      } else {
        setCurrentSession((prev) => prev + 1);
      }
    }

    const nextDuration = getSessionDuration(nextType);
    setSessionType(nextType);
    setTimeRemaining(nextDuration);
    setTotalTime(nextDuration);
    setTimerState('idle');
    startTimeRef.current = null;

    if (
      (nextType === 'focus' && pomSettings.autoStartFocus) ||
      (nextType !== 'focus' && pomSettings.autoStartBreaks)
    ) {
      // Auto-start next session
      setTimeout(() => {
        startTimeRef.current = new Date().toISOString();
        setTimerState('running');
      }, 500);
    }
  }, [
    sessionType,
    selectedSubjectId,
    selectedAssignmentId,
    totalTime,
    currentSession,
    pomSettings,
    addPomodoroSession,
    getSessionDuration,
  ]);

  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState, completeSession]);

  const start = useCallback(() => {
    startTimeRef.current = new Date().toISOString();
    setTimerState('running');
  }, []);

  const pause = useCallback(() => {
    setTimerState('paused');
  }, []);

  const resume = useCallback(() => {
    setTimerState('running');
  }, []);

  const reset = useCallback(() => {
    setTimerState('idle');
    const duration = getSessionDuration(sessionType);
    setTimeRemaining(duration);
    setTotalTime(duration);
    startTimeRef.current = null;
  }, [sessionType, getSessionDuration]);

  const skip = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (sessionType === 'focus' && timerState === 'running' && selectedSubjectId && startTimeRef.current) {
      // Log partial session
      const elapsed = totalTime - timeRemaining;
      if (elapsed > 30) {
        addPomodoroSession({
          subjectId: selectedSubjectId,
          assignmentId: selectedAssignmentId || undefined,
          startedAt: startTimeRef.current,
          duration: elapsed,
          type: 'focus',
          completed: false,
        });
      }
    }

    let nextType: SessionType;
    if (sessionType === 'focus') {
      nextType =
        currentSession % pomSettings.sessionsBeforeLongBreak === 0
          ? 'long_break'
          : 'short_break';
    } else {
      nextType = 'focus';
      setCurrentSession((prev) => prev + 1);
    }

    const nextDuration = getSessionDuration(nextType);
    setSessionType(nextType);
    setTimeRemaining(nextDuration);
    setTotalTime(nextDuration);
    setTimerState('idle');
    startTimeRef.current = null;
  }, [
    sessionType,
    timerState,
    selectedSubjectId,
    selectedAssignmentId,
    totalTime,
    timeRemaining,
    currentSession,
    pomSettings,
    addPomodoroSession,
    getSessionDuration,
  ]);

  // Update timer when settings change while idle
  useEffect(() => {
    if (timerState === 'idle') {
      const duration = getSessionDuration(sessionType);
      setTimeRemaining(duration);
      setTotalTime(duration);
    }
  }, [pomSettings, timerState, sessionType, getSessionDuration]);

  return (
    <PomodoroContext.Provider
      value={{
        timerState,
        sessionType,
        timeRemaining,
        totalTime,
        currentSession,
        selectedSubjectId,
        selectedAssignmentId,
        settings: pomSettings,
        start,
        pause,
        resume,
        reset,
        skip,
        setSelectedSubject,
        setSelectedAssignment,
        progress,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within PomodoroProvider');
  }
  return context;
}
