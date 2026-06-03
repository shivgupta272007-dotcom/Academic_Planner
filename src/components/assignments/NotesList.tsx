import React, { useState } from 'react';
import { Plus, Trash2, CheckSquare, Square, ListChecks, StickyNote } from 'lucide-react';
import type { Note } from '../../types';

interface NotesListProps {
  notes: Note[];
  assignmentId: string;
  onAddNote: (assignmentId: string, content: string, isChecklist: boolean) => void;
  onDeleteNote: (assignmentId: string, noteId: string) => void;
  onToggleCheck: (assignmentId: string, noteId: string) => void;
}

export default function NotesList({
  notes,
  assignmentId,
  onAddNote,
  onDeleteNote,
  onToggleCheck,
}: NotesListProps) {
  const [newNote, setNewNote] = useState('');
  const [isChecklist, setIsChecklist] = useState(true);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(assignmentId, newNote.trim(), isChecklist);
    setNewNote('');
  };

  return (
    <div className="mt-3 pt-3 border-t border-[var(--glass-border)]">
      <div className="flex items-center gap-2 mb-2">
        <ListChecks size={14} className="text-[var(--color-text-muted)]" />
        <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          Notes & Tasks
        </span>
      </div>

      {/* Notes list */}
      <div className="space-y-1 mb-2">
        {notes.map((note) => (
          <div
            key={note.id}
            className="flex items-start gap-2 group py-1 px-1 rounded-lg hover:bg-[var(--glass-bg-light)] transition-colors"
          >
            {note.isChecklist ? (
              <button
                onClick={() => onToggleCheck(assignmentId, note.id)}
                className="mt-0.5 flex-shrink-0 text-[var(--color-text-muted)] hover:text-indigo-400 transition-colors"
              >
                {note.checked ? (
                  <CheckSquare size={15} className="text-emerald-400" />
                ) : (
                  <Square size={15} />
                )}
              </button>
            ) : (
              <StickyNote size={15} className="mt-0.5 flex-shrink-0 text-amber-400" />
            )}
            <span
              className={`text-sm flex-1 ${
                note.checked
                  ? 'line-through text-[var(--color-text-muted)]'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              {note.content}
            </span>
            <button
              onClick={() => onDeleteNote(assignmentId, note.id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 text-[var(--color-text-muted)] hover:text-rose-400 transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Add note form */}
      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsChecklist(!isChecklist)}
          className="flex-shrink-0 p-1 rounded text-[var(--color-text-muted)] hover:text-indigo-400 transition-colors"
          title={isChecklist ? 'Switch to note' : 'Switch to checklist'}
        >
          {isChecklist ? <CheckSquare size={14} /> : <StickyNote size={14} />}
        </button>
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder={isChecklist ? 'Add a task...' : 'Add a note...'}
          className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
        />
        <button
          type="submit"
          disabled={!newNote.trim()}
          className="flex-shrink-0 p-1 rounded text-[var(--color-text-muted)] hover:text-emerald-400 transition-colors disabled:opacity-30"
        >
          <Plus size={14} />
        </button>
      </form>
    </div>
  );
}
