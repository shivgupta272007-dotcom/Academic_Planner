import { useState } from 'react';
import { Pencil, Trash2, BookOpen, Plus, Award, Mail, Clock, User, CheckCircle } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import ProgressBar from '../ui/ProgressBar';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import EmptyState from '../ui/EmptyState';
import SubjectForm from './SubjectForm';
import { useToast } from '../ui/Toast';
import { getSubjectCompletionPercentage } from '../../utils/analytics';

const getGPAPoints = (letterGrade?: string): number | null => {
  if (!letterGrade) return null;
  switch (letterGrade) {
    case 'A+': return 4.0;
    case 'A': return 4.0;
    case 'A-': return 3.7;
    case 'B+': return 3.3;
    case 'B': return 3.0;
    case 'B-': return 2.7;
    case 'C+': return 2.3;
    case 'C': return 2.0;
    case 'C-': return 1.7;
    case 'D': return 1.0;
    case 'F': return 0.0;
    default: return null;
  }
};

export default function SubjectList() {
  const { subjects, assignments, addSubject, updateSubject, deleteSubject } = useApp();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);

  const handleAdd = (
    name: string,
    color: string,
    icon: string,
    courseCode?: string,
    credits?: number,
    professorName?: string,
    professorEmail?: string,
    officeHours?: string,
    grade?: string
  ) => {
    addSubject(name, color, icon, courseCode, credits, professorName, professorEmail, officeHours, grade);
    setShowForm(false);
    showToast('success', `Subject "${name}" added!`);
  };

  const handleEditSubmit = (
    name: string,
    color: string,
    icon: string,
    courseCode?: string,
    credits?: number,
    professorName?: string,
    professorEmail?: string,
    officeHours?: string,
    grade?: string
  ) => {
    if (!editingSubject) return;
    const subject = subjects.find((s) => s.id === editingSubject);
    if (!subject) return;

    updateSubject({
      ...subject,
      name,
      color,
      icon,
      courseCode,
      credits,
      professorName,
      professorEmail,
      officeHours,
      grade,
    });
    setEditingSubject(null);
    showToast('success', `Subject "${name}" updated!`);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}" and all its assignments?`)) {
      deleteSubject(id);
      showToast('info', `Subject "${name}" deleted`);
    }
  };

  // GPA Calculations
  const gpaSummary = (() => {
    let totalPoints = 0;
    let totalCredits = 0;
    let gradedCredits = 0;

    subjects.forEach((s) => {
      const cred = s.credits || 0;
      totalCredits += cred;
      const pts = getGPAPoints(s.grade);
      if (pts !== null && cred > 0) {
        totalPoints += pts * cred;
        gradedCredits += cred;
      }
    });

    const gpaVal = gradedCredits > 0 ? (totalPoints / gradedCredits).toFixed(2) : null;

    return {
      gpa: gpaVal,
      totalCredits,
      gradedCredits,
    };
  })();

  if (subjects.length === 0 && !showForm) {
    return (
      <EmptyState
        icon={<BookOpen size={28} className="text-indigo-400" />}
        title="No subjects yet"
        description="Add your first college course subject to start calculating your GPA and planning assignments."
        actionLabel="Add Subject"
        onAction={() => setShowForm(true)}
      />
    );
  }

  return (
    <div>
      {/* Subject Page Title & Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Subjects & Courses</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            {subjects.length} course{subjects.length !== 1 ? 's' : ''} enrolled
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} icon={<Plus size={16} />} size="sm">
          Add Course
        </Button>
      </div>

      {/* College GPA Summary Card */}
      <div className="glass-card p-5 mb-6 bg-gradient-to-r from-indigo-500/10 via-violet-500/5 to-cyan-500/5 border-indigo-500/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
            <Award size={16} className="text-indigo-400" />
            Semester GPA Estimator
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] max-w-md">
            Your GPA is calculated dynamically based on course credit hours and letter grades. Ensure your courses have credit weights and expected grades set.
          </p>
        </div>

        <div className="flex gap-6 items-center justify-center">
          <div className="text-center bg-[var(--glass-bg-light)] px-4 py-2.5 rounded-xl border border-[var(--glass-border)]">
            <div className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Credits</div>
            <div className="text-lg font-extrabold text-[var(--color-text-primary)]">{gpaSummary.totalCredits} hrs</div>
          </div>
          <div className="text-center bg-[var(--glass-bg-light)] px-4 py-2.5 rounded-xl border border-[var(--glass-border)]">
            <div className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Graded</div>
            <div className="text-lg font-extrabold text-indigo-400">{gpaSummary.gradedCredits} hrs</div>
          </div>
          <div className="text-center bg-gradient-to-br from-indigo-500/20 to-violet-500/20 px-5 py-3 rounded-2xl border border-indigo-500/20 shadow-md">
            <div className="text-[10px] uppercase font-bold text-indigo-300">GPA</div>
            <div className="text-3xl font-black text-white">{gpaSummary.gpa || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Grid of Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((subject, index) => {
          const subjectAssignments = assignments.filter((a) => a.subjectId === subject.id);
          const completed = subjectAssignments.filter((a) => a.status === 'completed').length;
          const completion = getSubjectCompletionPercentage(assignments, subject.id);

          return (
            <div
              key={subject.id}
              className="glass-card p-5 transition-all duration-300 animate-slide-up group relative overflow-hidden flex flex-col justify-between"
              style={{
                animationDelay: `${index * 50}ms`,
                boxShadow: `0 4px 24px -4px ${subject.color}15, 0 2px 10px -2px ${subject.color}08`,
              }}
            >
              {/* Top Accent Strip */}
              <div
                className="absolute top-0 left-0 w-full h-[3px]"
                style={{ backgroundColor: subject.color }}
              />

              <div className="space-y-4">
                {/* Subject Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: `${subject.color}20` }}
                    >
                      {subject.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-[var(--color-text-primary)] truncate text-base">
                        {subject.name}
                      </h3>
                      {subject.courseCode ? (
                        <span className="text-[10px] font-semibold text-indigo-400 uppercase">
                          {subject.courseCode}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[var(--color-text-muted)]">No course code</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingSubject(subject.id)}
                      className="p-1.5 rounded-lg hover:bg-[var(--glass-bg-light)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                      title="Edit Subject"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(subject.id, subject.name)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-[var(--color-text-muted)] hover:text-rose-400 transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* College Meta Info Block */}
                <div className="p-3 rounded-xl bg-[var(--glass-bg-light)] border border-[var(--glass-border)] text-xs space-y-2">
                  <div className="flex justify-between items-center text-[var(--color-text-secondary)]">
                    <span className="flex items-center gap-1 font-medium"><Award size={13} className="text-indigo-400" /> Credit Hours:</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {subject.credits !== undefined ? `${subject.credits} hrs` : 'TBD'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[var(--color-text-secondary)]">
                    <span className="flex items-center gap-1 font-medium"><CheckCircle size={13} className="text-indigo-400" /> Expected Grade:</span>
                    <span
                      className="font-bold text-xs px-2 py-0.5 rounded-md border"
                      style={{
                        color: subject.color,
                        borderColor: `${subject.color}30`,
                        backgroundColor: `${subject.color}08`,
                      }}
                    >
                      {subject.grade || 'None'}
                    </span>
                  </div>

                  {/* Optional Professor Details */}
                  {(subject.professorName || subject.officeHours || subject.professorEmail) && (
                    <div className="pt-2 border-t border-[var(--glass-border)] space-y-1.5">
                      {subject.professorName && (
                        <div className="flex items-center gap-1 text-[var(--color-text-muted)]">
                          <User size={12} className="text-indigo-400/80" />
                          <span className="truncate">Prof: {subject.professorName}</span>
                        </div>
                      )}
                      {subject.professorEmail && (
                        <a
                          href={`mailto:${subject.professorEmail}`}
                          className="flex items-center gap-1 text-[var(--color-text-muted)] hover:text-indigo-400 transition-colors truncate"
                        >
                          <Mail size={12} className="text-indigo-400/80" />
                          <span className="truncate underline">{subject.professorEmail}</span>
                        </a>
                      )}
                      {subject.officeHours && (
                        <div className="flex items-center gap-1 text-[var(--color-text-muted)]">
                          <Clock size={12} className="text-indigo-400/80" />
                          <span className="truncate">{subject.officeHours}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Slider */}
              <div className="space-y-2 pt-4">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--color-text-muted)]">
                    {completed}/{subjectAssignments.length} completed
                  </span>
                  <span className="font-semibold" style={{ color: subject.color }}>
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
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add College Course">
        <SubjectForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingSubject}
        onClose={() => setEditingSubject(null)}
        title="Edit College Course"
      >
        {editingSubject && (
          <SubjectForm
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingSubject(null)}
            initialData={subjects.find((s) => s.id === editingSubject)}
          />
        )}
      </Modal>
    </div>
  );
}
