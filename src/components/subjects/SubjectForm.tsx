import React, { useState } from 'react';
import { Save } from 'lucide-react';
import Button from '../ui/Button';
import { SUBJECT_COLORS, SUBJECT_ICONS } from '../../utils/constants';
import type { Subject } from '../../types';

interface SubjectFormProps {
  onSubmit: (name: string, color: string, icon: string) => void;
  onCancel: () => void;
  initialData?: Subject;
}

export default function SubjectForm({ onSubmit, onCancel, initialData }: SubjectFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [color, setColor] = useState(initialData?.color || SUBJECT_COLORS[0].hex);
  const [icon, setIcon] = useState(initialData?.icon || SUBJECT_ICONS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim(), color, icon);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
          Subject Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mathematics"
          className="glass-input"
          autoFocus
          required
        />
      </div>

      {/* Icon */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
          Icon
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

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
          Color
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

      {/* Preview */}
      <div className="glass-card-sm p-3 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </div>
        <div>
          <p className="font-medium text-[var(--color-text-primary)]">{name || 'Subject Name'}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Preview</p>
        </div>
        <div
          className="ml-auto w-3 h-3 rounded-full"
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
