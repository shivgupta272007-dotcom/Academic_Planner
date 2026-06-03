
import { CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { formatRelativeTime, formatDuration } from '../../utils/dates';

export default function PomodoroHistory() {
  const { pomodoroSessions, getSubjectById } = useApp();

  const recentSessions = [...pomodoroSessions]
    .filter((s) => s.type === 'focus')
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 20);

  if (recentSessions.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
          Session History
        </h3>
        <div className="py-6 text-center text-sm text-[var(--color-text-muted)]">
          No sessions logged yet. Start a Pomodoro to begin!
        </div>
      </div>
    );
  }

  const totalMinutes = recentSessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Session History
        </h3>
        <span className="text-xs text-[var(--color-text-muted)]">
          Total: {formatDuration(totalMinutes)}
        </span>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {recentSessions.map((session) => {
          const subject = getSubjectById(session.subjectId);
          const durationMin = Math.round(session.duration / 60);

          return (
            <div
              key={session.id}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--glass-bg-light)] transition-colors"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                style={{ backgroundColor: `${subject?.color || '#6366f1'}20` }}
              >
                {subject?.icon || '📚'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {subject?.name || 'Unknown Subject'}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {formatRelativeTime(session.startedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {formatDuration(durationMin)}
                </span>
                {session.completed ? (
                  <CheckCircle size={14} className="text-emerald-400" />
                ) : (
                  <XCircle size={14} className="text-amber-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
