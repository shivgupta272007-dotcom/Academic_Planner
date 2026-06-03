import { useState, useMemo } from 'react';
import { Bell, X, AlertTriangle, Calendar, Check } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { isOverdue, isDueSoon, formatDate, getDaysUntilDue } from '../../utils/dates';

export function ReminderBell() {
  const { assignments } = useApp();
  const [showPanel, setShowPanel] = useState(false);

  const alerts = useMemo(() => {
    return assignments
      .filter((a) => {
        if (a.status === 'completed') return false;
        return isOverdue(a.dueDate) || isDueSoon(a.dueDate, 3);
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [assignments]);

  const overdueCount = alerts.filter((a) => isOverdue(a.dueDate)).length;
  const totalCount = alerts.length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 rounded-xl hover:bg-[var(--glass-bg-light)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        <Bell size={20} />
        {totalCount > 0 && (
          <span
            className={`
              absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-white text-[10px]
              flex items-center justify-center font-bold
              ${overdueCount > 0 ? 'bg-rose-500 animate-pulse-soft' : 'bg-amber-500'}
            `}
          >
            {totalCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {showPanel && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowPanel(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-80 glass-card p-4 shadow-glass animate-scale-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Reminders
              </h3>
              <button
                onClick={() => setShowPanel(false)}
                className="p-1 rounded-lg hover:bg-[var(--glass-bg-light)] text-[var(--color-text-muted)]"
              >
                <X size={14} />
              </button>
            </div>

            {alerts.length === 0 ? (
              <div className="py-6 text-center">
                <Check size={24} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-[var(--color-text-muted)]">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {alerts.map((assignment) => {
                  const overdue = isOverdue(assignment.dueDate);
                  const daysUntil = getDaysUntilDue(assignment.dueDate);

                  return (
                    <div
                      key={assignment.id}
                      className={`
                        p-2.5 rounded-xl
                        ${overdue ? 'bg-rose-500/5 border border-rose-500/15' : 'bg-amber-500/5 border border-amber-500/15'}
                      `}
                    >
                      <div className="flex items-start gap-2">
                        {overdue ? (
                          <AlertTriangle size={14} className="text-rose-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Calendar size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                            {assignment.title}
                          </p>
                          <p className={`text-xs mt-0.5 ${overdue ? 'text-rose-400' : 'text-amber-400'}`}>
                            {overdue
                              ? `${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} overdue`
                              : daysUntil === 0
                              ? 'Due today!'
                              : `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
                          </p>
                          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                            {formatDate(assignment.dueDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
