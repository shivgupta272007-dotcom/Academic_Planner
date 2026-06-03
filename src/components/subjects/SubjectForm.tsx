import React, { useState } from 'react';
import { Save } from 'lucide-react';
import Button from '../ui/Button';
import { SUBJECT_COLORS, SUBJECT_ICONS } from '../../utils/constants';
import type { Subject } from '../../types';

interface SubjectFormProps {
  onSubmit: (
    name: string,
    color: string,
    icon: string,
    courseCode?: string,
    credits?: number,
    professorName?: string,
    professorEmail?: string,
    officeHours?: string,
    grade?: string
  ) => void;
  onCancel: () => void;
  initialData?: Subject;
}

const GRADE_OPTIONS = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

export default function SubjectForm({ onSubmit, onCancel, initialData }: SubjectFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [color, setColor] = useState(initialData?.color || SUBJECT_COLORS[0].hex);
  const [icon, setIcon] = useState(initialData?.icon || SUBJECT_ICONS[0]);

  // College-specific fields
  const [courseCode, setCourseCode] = useState(initialData?.courseCode || '');
  const [credits, setCredits] = useState<number | ''>(initialData?.credits !== undefined ? initialData.credits : '');
  const [professorName, setProfessorName] = useState(initialData?.professorName || '');
  const [professorEmail, setProfessorEmail] = useState(initialData?.professorEmail || '');
  const [officeHours, setOfficeHours] = useState(initialData?.officeHours || '');
  const [grade, setGrade] = useState(initialData?.grade || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit(
      name.trim(),
      color,
      icon,
      courseCode.trim() || undefined,
      credits !== '' ? Number(credits) : undefined,
      professorName.trim() || undefined,
      professorEmail.trim() || undefined,
      officeHours.trim() || undefined,
      grade || undefined
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1 no-scrollbar">
      {/* Basic Subject Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
            Subject Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Linear Algebra"
            className="glass-input"
            autoFocus
            required
          />
        </div>

        {/* 2-Column Grid for College Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
              Course Code
            </label>
            <input
              type="text"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g. MATH 201"
              className="glass-input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
              Course Credits
            </label>
            <input
              type="number"
              min={0}
              max={10}
              value={credits}
              onChange={(e) => setCredits(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 4"
              className="glass-input text-sm"
            />
          </div>
        </div>

        {/* Professor & Grade Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
              Expected/Actual Grade
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="glass-select text-sm py-2.5"
            >
              <option value="">No Grade</option>
              {GRADE_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
              Professor Name
            </label>
            <input
              type="text"
              value={professorName}
              onChange={(e) => setProfessorName(e.target.value)}
              placeholder="e.g. Dr. Smith"
              className="glass-input text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
              Professor Email
            </label>
            <input
              type="email"
              value={professorEmail}
              onChange={(e) => setProfessorEmail(e.target.value)}
              placeholder="e.g. smith@univ.edu"
              className="glass-input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
              Office Hours / Room
            </label>
            <input
              type="text"
              value={officeHours}
              onChange={(e) => setOfficeHours(e.target.value)}
              placeholder="e.g. Mon/Wed 2-4 PM"
              className="glass-input text-sm"
            />
          </div>
        </div>
      </div>

      {/* Icon Picker */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
          Select Icon
        </label>
        <div className="flex flex-wrap gap-2">
          {SUBJECT_ICONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setIcon(emoji)}
              className={`
                w-10 h-10 rounded-xl text-lg flex items-center justify-center
                transition-all duration-150
                ${
                  icon === emoji
                    ? 'ring-2 ring-indigo-500 bg-indigo-500/10 scale-110'
                    : 'glass-card-sm hover:scale-105'
                }
              `}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Color Picker */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1.5">
          Theme Color
        </label>
        <div className="flex flex-wrap gap-2">
          {SUBJECT_COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => setColor(c.hex)}
              className={`
                w-8 h-8 rounded-full transition-all duration-150
                ${
                  color === c.hex
                    ? 'ring-2 ring-offset-2 ring-offset-[var(--color-bg-secondary)] scale-110'
                    : 'hover:scale-110'
                }
              `}
              style={{
                backgroundColor: c.hex,
                ['--tw-ring-color' as any]: c.hex,
              }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      {/* Preview Card */}
      <div className="glass-card-sm p-3.5 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[var(--color-text-primary)] truncate">
            {name || 'Subject Name'} {courseCode && `(${courseCode})`}
          </p>
          <p className="text-[10px] text-[var(--color-text-muted)] truncate">
            {credits ? `${credits} Credit(s)` : 'No credits'} {grade && `• Grade: ${grade}`}
          </p>
        </div>
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" icon={<Save size={16} />} disabled={!name.trim()}>
          {initialData ? 'Update' : 'Add'} Subject
        </Button>
      </div>
    </form>
  );
}
