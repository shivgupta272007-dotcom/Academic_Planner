import React, { useState } from 'react';
import { Save } from 'lucide-react';
import Button from '../ui/Button';
import { useApp } from '../../contexts/AppContext';
import type { StudySession } from '../../types';

interface SessionFormProps {
  onSubmit: (session: Omit<StudySession, 'id'>) => void;
  onCancel: () => void;
  initialData?: StudySession;
  defaultDate?: string;
  defaultTime?: string;
}

export default function SessionForm({
  onSubmit,
  onCancel,
  initialData,
  defaultDate,
  defaultTime,
}: SessionFormProps) {
  const { subjects } = useApp();
  const [subjectId, setSubjectId] = useState(initialData?.subjectId || subjects[0]?.id || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [date, setDate] = useState(initialData?.date || defaultDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(initialData?.startTime || defaultTime || '09:00');
  const [duration, setDuration] = useState(initialData?.duration || 60);
  const [status, setStatus] = useState<StudySession['status']>(initialData?.status || 'planned');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) return;
    const d = new Date(date);
    onSubmit({
      subjectId,
      title: title.trim() || subjects.find((s) => s.id === subjectId)?.name || 'Study Session',
      date,
      startTime,
      duration,
      status,
      dayOfWeek: d.getDay(),
      actualDuration: initialData?.actualDuration,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
          Subject
        </label>
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="glass-select"
          required
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.icon} {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
          Title (optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Review Chapter 5"
          className="glass-input"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="glass-input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
            Start Time
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="glass-input"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
          Duration: {duration} min
        </label>
        <input
          type="range"
          min={15}
          max={180}
          step={15}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between text-xs text-[var(--color-text-muted)] mt-1">
          <span>15m</span>
          <span>1h</span>
          <span>2h</span>
          <span>3h</span>
        </div>
      </div>

      {initialData && (
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
            Status
          </label>
          <div className="flex gap-2">
            {(['planned', 'completed', 'skipped'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`
                  flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all duration-200 capitalize
                  ${
                    status === s
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'glass-card-sm text-[var(--color-text-muted)]'
                  }
                `}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" icon={<Save size={16} />} disabled={!subjectId}>
          {initialData ? 'Update' : 'Add'} Session
        </Button>
      </div>
    </form>
  );
}
