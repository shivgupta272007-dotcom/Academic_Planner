import { useState, useMemo } from 'react';
import { Plus, Filter, ClipboardList } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import emptyImage from '../../assets/empty.png';
import AssignmentCard from './AssignmentCard';
import AssignmentForm from './AssignmentForm';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import { useToast } from '../ui/Toast';
import { sortAssignmentsByUrgency } from '../../utils/analytics';
import type { Assignment } from '../../types';

type SortBy = 'urgency' | 'due_date' | 'priority' | 'subject' | 'created';

export default function AssignmentList() {
  const { assignments, subjects, addAssignment, updateAssignment, deleteAssignment } = useApp();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('urgency');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAssignments = useMemo(() => {
    let result = [...assignments];

    if (filterSubject !== 'all') {
      result = result.filter((a) => a.subjectId === filterSubject);
    }
    if (filterPriority !== 'all') {
      result = result.filter((a) => a.priority === filterPriority);
    }
    if (filterStatus !== 'all') {
      result = result.filter((a) => a.status === filterStatus);
    }

    switch (sortBy) {
      case 'urgency':
        return sortAssignmentsByUrgency(result);
      case 'due_date':
        return result.sort(
          (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );
      case 'priority': {
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        return result.sort((a, b) => order[a.priority] - order[b.priority]);
      }
      case 'subject':
        return result.sort((a, b) => a.subjectId.localeCompare(b.subjectId));
      case 'created':
        return result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return result;
    }
  }, [assignments, filterSubject, filterPriority, filterStatus, sortBy]);

  const handleAdd = (data: Omit<Assignment, 'id' | 'notes' | 'createdAt'>) => {
    addAssignment(data);
    setShowForm(false);
    showToast('success', 'Assignment added!');
  };

  const handleEdit = (data: Omit<Assignment, 'id' | 'notes' | 'createdAt'>) => {
    if (!editingAssignment) return;
    updateAssignment({
      ...editingAssignment,
      ...data,
      completedAt: data.status === 'completed'
        ? editingAssignment.completedAt || new Date().toISOString()
        : undefined,
    });
    setEditingAssignment(null);
    showToast('success', 'Assignment updated!');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this assignment?')) {
      deleteAssignment(id);
      showToast('info', 'Assignment deleted');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Assignments</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            {assignments.length} total · {assignments.filter((a) => a.status === 'completed').length} completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Filter size={14} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filter
          </Button>
          <Button onClick={() => setShowForm(true)} icon={<Plus size={16} />} size="sm">
            Add
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="glass-card-sm p-3 mb-4 animate-slide-down">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Subject</label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="glass-select text-xs py-1.5"
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="glass-select text-xs py-1.5"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="glass-select text-xs py-1.5"
              >
                <option value="all">All Statuses</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="glass-select text-xs py-1.5"
              >
                <option value="urgency">Urgency</option>
                <option value="due_date">Due Date</option>
                <option value="priority">Priority</option>
                <option value="subject">Subject</option>
                <option value="created">Date Added</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Assignment list */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          image={assignments.length === 0 ? emptyImage : undefined}
          icon={assignments.length > 0 ? <ClipboardList size={28} className="text-indigo-400" /> : undefined}
          title={assignments.length === 0 ? 'No assignments yet' : 'No matching assignments'}
          description={
            assignments.length === 0
              ? 'Add your first assignment to start tracking your academic work.'
              : 'Try adjusting your filters to find what you\'re looking for.'
          }
          actionLabel={assignments.length === 0 ? 'Add Assignment' : undefined}
          onAction={assignments.length === 0 ? () => setShowForm(true) : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onEdit={setEditingAssignment}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Assignment" size="md">
        <AssignmentForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingAssignment}
        onClose={() => setEditingAssignment(null)}
        title="Edit Assignment"
        size="md"
      >
        {editingAssignment && (
          <AssignmentForm
            onSubmit={handleEdit}
            onCancel={() => setEditingAssignment(null)}
            initialData={editingAssignment}
          />
        )}
      </Modal>
    </div>
  );
}
