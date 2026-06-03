import { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  Clock,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import Badge from '../ui/Badge';
import SubjectBadge from '../subjects/SubjectBadge';
import NotesList from './NotesList';
import { formatDate, isOverdue, getDaysUntilDue, formatRelativeTime } from '../../utils/dates';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '../../utils/constants';
import type { Assignment } from '../../types';

interface AssignmentCardProps {
  assignment: Assignment;
  onEdit: (assignment: Assignment) => void;
  onDelete: (id: string) => void;
}

export default function AssignmentCard({ assignment, onEdit, onDelete }: AssignmentCardProps) {
  const { toggleAssignmentStatus, addNote, deleteNote, toggleNoteCheck, getSubjectById } = useApp();
  const [expanded, setExpanded] = useState(false);

  const subject = getSubjectById(assignment.subjectId);
  const overdue = assignment.status !== 'completed' && isOverdue(assignment.dueDate);
  const daysUntil = getDaysUntilDue(assignment.dueDate);
  const priority = PRIORITY_CONFIG[assignment.priority];
  const status = STATUS_CONFIG[assignment.status];

  return (
    <div
      className={`
        glass-card p-4 transition-all duration-300 animate-slide-up
        ${overdue ? 'border-rose-500/30 shadow-glow-rose' : ''}
        ${assignment.status === 'completed' ? 'opacity-70' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Status toggle */}
        <button
          onClick={() => toggleAssignmentStatus(assignment.id)}
          className={`
            mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
            transition-all duration-200
            ${
              assignment.status === 'completed'
                ? 'border-emerald-400 bg-emerald-400'
                : assignment.status === 'in_progress'
                ? 'border-indigo-400 bg-indigo-400/20'
                : 'border-[var(--color-text-muted)] hover:border-indigo-400'
            }
          `}
        >
          {assignment.status === 'completed' && (
            <CircleCheck size={14} className="text-white" />
          )}
          {assignment.status === 'in_progress' && (
            <div className="w-2 h-2 rounded-full bg-indigo-400" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`font-medium text-sm ${
                assignment.status === 'completed'
                  ? 'line-through text-[var(--color-text-muted)]'
                  : 'text-[var(--color-text-primary)]'
              }`}
            >
              {assignment.title}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => onEdit(assignment)}
                className="p-1 rounded-md hover:bg-[var(--glass-bg-light)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => onDelete(assignment.id)}
                className="p-1 rounded-md hover:bg-rose-500/10 text-[var(--color-text-muted)] hover:text-rose-400 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {assignment.description && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">
              {assignment.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            {subject && (
              <SubjectBadge name={subject.name} color={subject.color} icon={subject.icon} />
            )}
            <Badge color={priority.color} bgColor={priority.bgColor} dot>
              {priority.label}
            </Badge>
            <Badge color={status.color} bgColor={status.bgColor}>
              {status.label}
            </Badge>
          </div>

          {/* Due date */}
          <div className="flex items-center gap-4 mt-2.5">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-[var(--color-text-muted)]" />
              <span
                className={`text-xs ${
                  overdue ? 'text-rose-400 font-medium' : 'text-[var(--color-text-muted)]'
                }`}
              >
                {formatDate(assignment.dueDate)}
              </span>
            </div>
            {overdue && (
              <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-medium">
                <AlertTriangle size={11} />
                {Math.abs(daysUntil)} day{Math.abs(daysUntil) !== 1 ? 's' : ''} overdue
              </span>
            )}
            {!overdue && assignment.status !== 'completed' && daysUntil >= 0 && daysUntil <= 7 && (
              <span className="text-xs text-amber-400">
                {daysUntil === 0 ? 'Due today' : `${daysUntil} day${daysUntil !== 1 ? 's' : ''} left`}
              </span>
            )}
            {assignment.completedAt && (
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-emerald-400" />
                <span className="text-xs text-emerald-400">
                  Completed {formatRelativeTime(assignment.completedAt)}
                </span>
              </div>
            )}
          </div>

          {/* Expand toggle for notes */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 mt-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {assignment.notes.length > 0
              ? `${assignment.notes.filter((n) => n.checked).length}/${assignment.notes.length} tasks`
              : 'Add notes'}
          </button>

          {/* Notes */}
          {expanded && (
            <NotesList
              notes={assignment.notes}
              assignmentId={assignment.id}
              onAddNote={addNote}
              onDeleteNote={deleteNote}
              onToggleCheck={toggleNoteCheck}
            />
          )}
        </div>
      </div>
    </div>
  );
}
