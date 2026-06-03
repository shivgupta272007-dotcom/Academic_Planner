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
  const [attachment, setAttachment] = useState<Assignment['attachment']>(initialData?.attachment);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadError('Please select a PDF file.');
      return;
    }

    const MAX_SIZE = 1.5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError('PDF file is too large (maximum size is 1.5MB for storage limit).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAttachment({
        name: file.name,
        data: dataUrl,
        size: file.size,
      });
    };
    reader.onerror = () => {
      setUploadError('Failed to read file.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setAttachment(undefined);
    setUploadError(null);
  };

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
      attachment,
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

      {/* PDF Attachment */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
          PDF Attachment (optional)
        </label>
        {attachment ? (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
            <div className="flex items-center gap-2 truncate">
              <span className="text-xl flex-shrink-0">📄</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {attachment.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {Math.round(attachment.size / 1024)} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-xs font-semibold"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--glass-border)] rounded-xl py-4 px-3 cursor-pointer hover:border-indigo-500/50 hover:bg-[var(--glass-bg-light)] transition-all text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            >
              <span className="text-2xl mb-1">📤</span>
              <span className="text-xs font-medium">Click to upload a PDF</span>
              <span className="text-[10px] mt-0.5 opacity-70">Max 1.5MB</span>
            </label>
          </div>
        )}
        {uploadError && (
          <p className="text-xs text-rose-400 mt-1">{uploadError}</p>
        )}
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
