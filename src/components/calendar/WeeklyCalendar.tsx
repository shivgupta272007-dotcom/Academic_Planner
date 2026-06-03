import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check, Trash2 } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import SessionForm from './SessionForm';
import { useToast } from '../ui/Toast';
import {
  getWeekDays,
  format,
  addDays,
  toDateString,
  formatTime,
  formatDuration,
  isSameDay,
} from '../../utils/dates';
import { HOURS_OF_DAY } from '../../utils/constants';
import type { StudySession } from '../../types';

export default function WeeklyCalendar() {
  const {
    studySessions,
    getSubjectById,
    addStudySession,
    updateStudySession,
    deleteStudySession,
  } = useApp();
  const { showToast } = useToast();

  const [weekOffset, setWeekOffset] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);

  const baseDate = useMemo(() => addDays(new Date(), weekOffset * 7), [weekOffset]);
  const weekDays = useMemo(() => getWeekDays(baseDate), [baseDate]);

  const getSessionsForDay = (day: Date) => {
    return studySessions
      .filter((s) => isSameDay(s.date, day))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const handleSlotClick = (day: Date, hour: number) => {
    setSelectedSlot({
      date: toDateString(day),
      time: `${hour.toString().padStart(2, '0')}:00`,
    });
    setShowForm(true);
  };

  const handleAddSession = (session: Omit<StudySession, 'id'>) => {
    addStudySession(session);
    setShowForm(false);
    setSelectedSlot(null);
    showToast('success', 'Study session added!');
  };

  const handleEditSession = (session: Omit<StudySession, 'id'>) => {
    if (!editingSession) return;
    updateStudySession({ ...session, id: editingSession.id });
    setEditingSession(null);
    showToast('success', 'Session updated!');
  };

  const handleDeleteSession = (id: string) => {
    deleteStudySession(id);
    showToast('info', 'Session removed');
  };

  const handleToggleComplete = (session: StudySession) => {
    updateStudySession({
      ...session,
      status: session.status === 'completed' ? 'planned' : 'completed',
      actualDuration: session.status === 'completed' ? undefined : session.duration,
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Study Calendar</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            {format(weekDays[0], 'MMM d')} – {format(weekDays[6], 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWeekOffset((prev) => prev - 1)}
            icon={<ChevronLeft size={16} />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWeekOffset(0)}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWeekOffset((prev) => prev + 1)}
            icon={<ChevronRight size={16} />}
          />
          <Button
            onClick={() => {
              setSelectedSlot(null);
              setShowForm(true);
            }}
            icon={<Plus size={16} />}
            size="sm"
          >
            Add Session
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-card overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-8 border-b border-[var(--glass-border)]">
          <div className="p-3 text-xs font-medium text-[var(--color-text-muted)]" />
          {weekDays.map((day) => {
            const isToday = toDateString(day) === toDateString(new Date());
            return (
              <div
                key={day.toISOString()}
                className={`p-3 text-center border-l border-[var(--glass-border)] ${
                  isToday ? 'bg-indigo-500/5' : ''
                }`}
              >
                <div className="text-xs text-[var(--color-text-muted)]">
                  {format(day, 'EEE')}
                </div>
                <div
                  className={`
                    text-sm font-semibold mt-0.5
                    ${isToday ? 'text-indigo-400' : 'text-[var(--color-text-primary)]'}
                  `}
                >
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Slots */}
        <div className="max-h-[600px] overflow-y-auto">
          {HOURS_OF_DAY.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-[var(--glass-border)] min-h-[60px]">
              {/* Time label */}
              <div className="p-2 text-[11px] text-[var(--color-text-muted)] text-right pr-3 pt-1">
                {formatTime(`${hour.toString().padStart(2, '0')}:00`)}
              </div>

              {/* Day columns */}
              {weekDays.map((day) => {
                const daySessions = getSessionsForDay(day).filter((s) => {
                  const sessionHour = parseInt(s.startTime.split(':')[0]);
                  return sessionHour === hour;
                });
                const isToday = toDateString(day) === toDateString(new Date());

                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className={`
                      border-l border-[var(--glass-border)] p-1 cursor-pointer
                      calendar-slot relative
                      ${isToday ? 'bg-indigo-500/[0.02]' : ''}
                    `}
                    onClick={() => {
                      if (daySessions.length === 0) handleSlotClick(day, hour);
                    }}
                  >
                    {daySessions.map((session) => {
                      const subject = getSubjectById(session.subjectId);
                      return (
                        <div
                          key={session.id}
                          className={`
                            rounded-lg p-1.5 mb-1 text-[10px] cursor-pointer group relative
                            transition-all duration-200 hover:scale-[1.02]
                            ${session.status === 'completed' ? 'opacity-80' : ''}
                            ${session.status === 'skipped' ? 'opacity-50' : ''}
                          `}
                          style={{
                            backgroundColor: `${subject?.color || '#6366f1'}20`,
                            borderLeft: `3px solid ${subject?.color || '#6366f1'}`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSession(session);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`font-medium truncate ${
                                session.status === 'skipped' ? 'line-through' : ''
                              }`}
                              style={{ color: subject?.color }}
                            >
                              {subject?.icon} {session.title || subject?.name}
                            </span>
                          </div>
                          <div className="text-[var(--color-text-muted)] mt-0.5">
                            {formatDuration(session.duration)}
                          </div>
                          {session.status === 'completed' && (
                            <Check
                              size={10}
                              className="absolute top-1 right-1 text-emerald-400"
                            />
                          )}

                          {/* Hover actions */}
                          <div className="absolute top-0.5 right-0.5 hidden group-hover:flex gap-0.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleComplete(session);
                              }}
                              className="p-0.5 rounded bg-[var(--glass-bg)] hover:bg-emerald-500/20"
                            >
                              <Check size={10} className="text-emerald-400" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSession(session.id);
                              }}
                              className="p-0.5 rounded bg-[var(--glass-bg)] hover:bg-rose-500/20"
                            >
                              <Trash2 size={10} className="text-rose-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Add Session Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setSelectedSlot(null); }} title="Add Study Session">
        <SessionForm
          onSubmit={handleAddSession}
          onCancel={() => { setShowForm(false); setSelectedSlot(null); }}
          defaultDate={selectedSlot?.date}
          defaultTime={selectedSlot?.time}
        />
      </Modal>

      {/* Edit Session Modal */}
      <Modal
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
        title="Edit Study Session"
      >
        {editingSession && (
          <SessionForm
            onSubmit={handleEditSession}
            onCancel={() => setEditingSession(null)}
            initialData={editingSession}
          />
        )}
      </Modal>
    </div>
  );
}
