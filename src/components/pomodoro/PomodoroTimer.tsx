
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { usePomodoro } from '../../contexts/PomodoroContext';
import { useApp } from '../../contexts/AppContext';
import Button from '../ui/Button';

export default function PomodoroTimer() {
  const {
    timerState,
    sessionType,
    timeRemaining,
    currentSession,
    selectedSubjectId,
    selectedAssignmentId,
    settings,
    start,
    pause,
    resume,
    reset,
    skip,
    setSelectedSubject,
    setSelectedAssignment,
    progress,
  } = usePomodoro();
  const { subjects, assignments } = useApp();

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  // SVG circle calculations
  const size = 280;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress / 100);

  const sessionTypeConfig = {
    focus: { label: 'Focus Time', color: '#6366f1', gradient: ['#6366f1', '#8b5cf6'] },
    short_break: { label: 'Short Break', color: '#10b981', gradient: ['#10b981', '#14b8a6'] },
    long_break: { label: 'Long Break', color: '#06b6d4', gradient: ['#06b6d4', '#3b82f6'] },
  };

  const config = sessionTypeConfig[sessionType];
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="flex flex-col items-center">
      {/* Session type indicator */}
      <div className="flex gap-2 mb-6">
        {(['focus', 'short_break', 'long_break'] as const).map((type) => (
          <span
            key={type}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
              ${sessionType === type
                ? 'text-white'
                : 'text-[var(--color-text-muted)] glass-card-sm'
              }
            `}
            style={
              sessionType === type
                ? { background: `linear-gradient(135deg, ${sessionTypeConfig[type].gradient[0]}, ${sessionTypeConfig[type].gradient[1]})` }
                : {}
            }
          >
            {sessionTypeConfig[type].label}
          </span>
        ))}
      </div>

      {/* Timer ring */}
      <div className="relative mb-8">
        <svg width={size} height={size} className="pomodoro-ring">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--glass-border)"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={config.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${config.color}40)`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-bold text-[var(--color-text-primary)] tabular-nums tracking-tight">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
          <span className="text-sm text-[var(--color-text-muted)] mt-2">
            Session {currentSession} of {settings.sessionsBeforeLongBreak}
          </span>
          {selectedSubject && (
            <span className="text-xs mt-1" style={{ color: selectedSubject.color }}>
              {selectedSubject.icon} {selectedSubject.name}
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          icon={<RotateCcw size={16} />}
          disabled={timerState === 'idle'}
        />
        {timerState === 'idle' ? (
          <button
            onClick={start}
            disabled={sessionType === 'focus' && !selectedSubjectId}
            className={`
              w-16 h-16 rounded-full flex items-center justify-center
              transition-all duration-300 shadow-lg
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:scale-105 active:scale-95
            `}
            style={{
              background: `linear-gradient(135deg, ${config.gradient[0]}, ${config.gradient[1]})`,
              boxShadow: `0 8px 24px ${config.color}30`,
            }}
          >
            <Play size={24} className="text-white ml-1" />
          </button>
        ) : timerState === 'running' ? (
          <button
            onClick={pause}
            className={`
              w-16 h-16 rounded-full flex items-center justify-center
              transition-all duration-300 shadow-lg hover:scale-105 active:scale-95
            `}
            style={{
              background: `linear-gradient(135deg, ${config.gradient[0]}, ${config.gradient[1]})`,
              boxShadow: `0 8px 24px ${config.color}30`,
            }}
          >
            <Pause size={24} className="text-white" />
          </button>
        ) : (
          <button
            onClick={resume}
            className={`
              w-16 h-16 rounded-full flex items-center justify-center
              transition-all duration-300 shadow-lg hover:scale-105 active:scale-95
            `}
            style={{
              background: `linear-gradient(135deg, ${config.gradient[0]}, ${config.gradient[1]})`,
              boxShadow: `0 8px 24px ${config.color}30`,
            }}
          >
            <Play size={24} className="text-white ml-1" />
          </button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={skip}
          icon={<SkipForward size={16} />}
        />
      </div>

      {/* Subject & Assignment selector */}
      {sessionType === 'focus' && (
        <div className="w-full max-w-sm space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
              Studying Subject
            </label>
            <select
              value={selectedSubjectId || ''}
              onChange={(e) => {
                setSelectedSubject(e.target.value || null);
                setSelectedAssignment(null);
              }}
              className="glass-select text-sm"
              disabled={timerState === 'running'}
            >
              <option value="">Select a subject...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>

          {selectedSubjectId && (
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
                Working on (optional)
              </label>
              <select
                value={selectedAssignmentId || ''}
                onChange={(e) => setSelectedAssignment(e.target.value || null)}
                className="glass-select text-sm"
                disabled={timerState === 'running'}
              >
                <option value="">No specific assignment</option>
                {assignments
                  .filter((a) => a.subjectId === selectedSubjectId && a.status !== 'completed')
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
