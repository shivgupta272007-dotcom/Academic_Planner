import { useState } from 'react';
import { Pencil, Trash2, BookOpen, Plus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import ProgressBar from '../ui/ProgressBar';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import EmptyState from '../ui/EmptyState';
import SubjectForm from './SubjectForm';
import { useToast } from '../ui/Toast';
import { getSubjectCompletionPercentage } from '../../utils/analytics';

export default function SubjectList() {
  const { subjects, assignments, addSubject, updateSubject, deleteSubject } = useApp();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);

  const handleAdd = (name: string, color: string, icon: string) => {
    addSubject(name, color, icon);
    setShowForm(false);
    showToast('success', `Subject "${name}" added!`);
  };

  const handleEdit = (name: string, color: string, icon: string) => {
    if (!editingSubject) return;
    const subject = subjects.find((s) => s.id === editingSubject);
    if (!subject) return;
    updateSubject({ ...subject, name, color, icon });
    setEditingSubject(null);
    showToast('success', `Subject updated!`);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}" and all its assignments?`)) {
      deleteSubject(id);
      showToast('info', `Subject "${name}" deleted`);
    }
  };

  if (subjects.length === 0 && !showForm) {
    return (
      <EmptyState
        icon={<BookOpen size={28} className="text-indigo-400" />}
        title="No subjects yet"
        description="Add your first subject to start organizing your academic work."
        actionLabel="Add Subject"
        onAction={() => setShowForm(true)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Subjects</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} icon={<Plus size={16} />} size="sm">
          Add Subject
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject, index) => {
          const subjectAssignments = assignments.filter(
            (a) => a.subjectId === subject.id
          );
          const completed = subjectAssignments.filter(
            (a) => a.status === 'completed'
          ).length;
          const completion = getSubjectCompletionPercentage(assignments, subject.id);

          return (
            <div
              key={subject.id}
              className="glass-card p-5 hover:shadow-glass transition-all duration-300 animate-slide-up group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${subject.color}20` }}
                  >
                    {subject.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-text-primary)]">
                      {subject.name}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {subjectAssignments.length} assignment{subjectAssignments.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingSubject(subject.id)}
                    className="p-1.5 rounded-lg hover:bg-[var(--glass-bg-light)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(subject.id, subject.name)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-[var(--color-text-muted)] hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--color-text-muted)]">
                    {completed}/{subjectAssignments.length} completed
                  </span>
                  <span className="font-medium" style={{ color: subject.color }}>
                    {completion}%
                  </span>
                </div>
                <ProgressBar value={completion} color={subject.color} size="sm" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Subject">
        <SubjectForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingSubject}
        onClose={() => setEditingSubject(null)}
        title="Edit Subject"
      >
        {editingSubject && (
          <SubjectForm
            onSubmit={handleEdit}
            onCancel={() => setEditingSubject(null)}
            initialData={subjects.find((s) => s.id === editingSubject)}
          />
        )}
      </Modal>
    </div>
  );
}
