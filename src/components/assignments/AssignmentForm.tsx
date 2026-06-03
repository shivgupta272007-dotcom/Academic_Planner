import React, { useState } from 'react';
import { Save } from 'lucide-react';
import Button from '../ui/Button';
import { useApp } from '../../contexts/AppContext';
import { PRIORITY_CONFIG } from '../../utils/constants';
import type { Assignment, Priority, Status } from '../../types';

interface AssignmentFormProps {
  onSubmit: (assignment: Omit<Assignment, 'id' | 'notes' | 'createdAt'>) => void;
  onCancel: () => void;
  initialData?: Assignment;
}

export default function AssignmentForm({ onSubmit, onCancel, initialData }: AssignmentFormProps) {
  const { subjects } = useApp();
  const [title, setTitle] = useState(initialData?.title || '');
  const [subjectId, setSubjectId] = useState(initialData?.subjectId || subjects[0]?.id || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate || new Date().toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<Priority>(initialData?.priority || 'medium');
  const [status, setStatus] = useState<Status>(initialData?.status || 'not_started');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;
    onSubmit({
      title: title.trim(),
      subjectId,
      description: description.trim(),
      dueDate,
      priority,
      status,
      completedAt: status === 'completed' ? new Date().toISOString() : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Chapter 5 Problem Set"
          className="glass-input"
          autoFocus
          required
        />
      </div>

      {/* Subject */}
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

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Additional details..."
          className="glass-input min-h-[80px] resize-none"
          rows={3}
        />
      </div>

      {/* Date & Priority row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="glass-input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="glass-select"
          >
            {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG.low][]).map(
              ([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Status (only for editing) */}
      {initialData && (
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
            Status
          </label>
          <div className="flex gap-2">
            {(['not_started', 'in_progress', 'completed'] as Status[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`
                  flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all duration-200
                  ${
                    status === s
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'glass-card-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                  }
                `}
              >
                {s === 'not_started' ? 'Not Started' : s === 'in_progress' ? 'In Progress' : 'Completed'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" icon={<Save size={16} />} disabled={!title.trim() || !subjectId}>
          {initialData ? 'Update' : 'Add'} Assignment
        </Button>
      </div>
    </form>
  );
}
