import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { getUpcomingAssignments, getOverdueAssignments } from '../../utils/analytics';
import { formatDate, getDaysUntilDue, isOverdue } from '../../utils/dates';
import { useNavigate } from 'react-router-dom';

export default function UpcomingDeadlines() {
  const { assignments, getSubjectById } = useApp();
  const navigate = useNavigate();
  const overdue = getOverdueAssignments(assignments);
  const upcoming = getUpcomingAssignments(assignments, 7);
  const allItems = [...overdue, ...upcoming].slice(0, 8);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Upcoming Deadlines
          {overdue.length > 0 && (
            <span className="ml-2 text-xs font-normal text-rose-400">
              {overdue.length} overdue
            </span>
          )}
        </h3>
        <button
          onClick={() => navigate('/assignments')}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
        >
          View all <ArrowRight size={12} />
        </button>
      </div>

      {allItems.length === 0 ? (
        <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">
          No upcoming deadlines this week 🎉
        </div>
      ) : (
        <div className="space-y-2">
          {allItems.map((assignment) => {
            const subject = getSubjectById(assignment.subjectId);
            const isOD = isOverdue(assignment.dueDate);
            const daysUntil = getDaysUntilDue(assignment.dueDate);

            return (
              <div
                key={assignment.id}
                className={`
                  flex items-center gap-3 p-2.5 rounded-xl transition-colors
                  ${isOD ? 'bg-rose-500/5 border border-rose-500/15' : 'hover:bg-[var(--glass-bg-light)]'}
                `}
              >
                <div
                  className="w-1.5 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: subject?.color || '#94a3b8' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {assignment.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {subject && (
                      <span className="text-xs" style={{ color: subject.color }}>
                        {subject.icon} {subject.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span
                    className={`text-xs font-medium ${
                      isOD ? 'text-rose-400' : daysUntil <= 1 ? 'text-amber-400' : 'text-[var(--color-text-muted)]'
                    }`}
                  >
                    {isOD ? (
                      <span className="flex items-center gap-1">
                        <AlertTriangle size={10} />
                        {Math.abs(daysUntil)}d overdue
                      </span>
                    ) : daysUntil === 0 ? (
                      'Today'
                    ) : (
                      `${daysUntil}d left`
                    )}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {formatDate(assignment.dueDate)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
