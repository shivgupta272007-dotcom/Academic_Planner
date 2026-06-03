import { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, Calendar, Clock, MapPin, Download, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import SubjectBadge from '../components/subjects/SubjectBadge';
import { useToast } from '../components/ui/Toast';
import { formatDate } from '../utils/dates';
import type { Exam } from '../types';

export default function ExamsPage() {
  const { subjects, exams, addExam, deleteExam, getSubjectById } = useApp();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);

  // Master Datesheet state (persisted locally)
  const [masterDatesheet, setMasterDatesheet] = useState<{
    name: string;
    data: string;
    size: number;
  } | null>(() => {
    try {
      const data = localStorage.getItem('academic-planner-master-datesheet');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (masterDatesheet) {
      localStorage.setItem('academic-planner-master-datesheet', JSON.stringify(masterDatesheet));
    } else {
      localStorage.removeItem('academic-planner-master-datesheet');
    }
  }, [masterDatesheet]);

  // Form states
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [room, setRoom] = useState('');
  const [notes, setNotes] = useState('');
  const [datesheet, setDatesheet] = useState<Exam['datesheet']>(undefined);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Master datesheet upload error
  const [masterUploadError, setMasterUploadError] = useState<string | null>(null);

  const handleMasterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setMasterUploadError(null);
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setMasterUploadError('Please select a PDF datesheet file.');
      return;
    }

    const MAX_SIZE = 1.5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setMasterUploadError('File is too large (maximum size is 1.5MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setMasterDatesheet({
        name: file.name,
        data: dataUrl,
        size: file.size,
      });
      showToast('success', 'Master datesheet uploaded!');
    };
    reader.readAsDataURL(file);
  };

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
      setUploadError('PDF is too large (maximum size is 1.5MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setDatesheet({
        name: file.name,
        data: dataUrl,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId || !date || !time) return;

    addExam({
      title: title.trim(),
      subjectId,
      date,
      time,
      room: room.trim() || undefined,
      notes: notes.trim() || undefined,
      datesheet,
    });

    // Reset and close
    setTitle('');
    setRoom('');
    setNotes('');
    setDatesheet(undefined);
    setUploadError(null);
    setShowForm(false);
    showToast('success', 'Exam scheduled!');
  };

  const handleDelete = (id: string, examTitle: string) => {
    if (window.confirm(`Remove the scheduled exam "${examTitle}"?`)) {
      deleteExam(id);
      showToast('info', 'Exam removed');
    }
  };

  const getDaysRemaining = (examDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exDate = new Date(examDate);
    exDate.setHours(0, 0, 0, 0);
    const diffTime = exDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const sortedExams = useMemo(() => {
    return [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [exams]);

  return (
    <div className="animate-fade-in">
      <Header title="Exams & Schedules" subtitle="Manage exam dates, rooms, and semester datesheets" />

      {/* Top Section - Master Datesheet PDF */}
      <div className="glass-card p-6 mb-6 bg-gradient-to-r from-indigo-500/10 via-violet-500/5 to-cyan-500/5 border border-indigo-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Semester Datesheet</h3>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {masterDatesheet
                ? `Uploaded: ${masterDatesheet.name} (${Math.round(masterDatesheet.size / 1024)} KB)`
                : 'Upload your general exams schedule / datesheet PDF'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {masterDatesheet ? (
            <div className="flex gap-2">
              <a
                href={masterDatesheet.data}
                download={masterDatesheet.name}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500 text-white hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-600/15"
              >
                <Download size={14} /> Download Datesheet
              </a>
              <button
                onClick={() => {
                  if (window.confirm('Delete datesheet?')) setMasterDatesheet(null);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
              >
                Delete
              </button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept=".pdf"
                onChange={handleMasterFileChange}
                className="hidden"
                id="master-datesheet-upload"
              />
              <label
                htmlFor="master-datesheet-upload"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 hover:bg-indigo-500/20 cursor-pointer transition-all"
              >
                Upload Datesheet PDF
              </label>
            </div>
          )}
        </div>
      </div>
      {masterUploadError && (
        <p className="text-xs text-rose-400 mt-[-16px] mb-4 flex items-center gap-1">
          <AlertCircle size={12} />
          {masterUploadError}
        </p>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Exam Schedule</h2>
        <Button onClick={() => setShowForm(true)} icon={<Plus size={16} />} size="sm">
          Schedule Exam
        </Button>
      </div>

      {/* Exams List */}
      {sortedExams.length === 0 ? (
        <EmptyState
          icon={<Calendar size={28} className="text-indigo-400" />}
          title="No exams scheduled"
          description="Schedule midterms, finals, or quiz dates to keep track of exam times and venues."
          actionLabel="Schedule Exam"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedExams.map((exam) => {
            const subject = getSubjectById(exam.subjectId);
            const daysRemaining = getDaysRemaining(exam.date);

            return (
              <div
                key={exam.id}
                className="glass-card p-5 relative overflow-hidden flex flex-col justify-between group"
                style={{
                  boxShadow: subject
                    ? `0 4px 20px -4px ${subject.color}10, 0 2px 8px -2px ${subject.color}05`
                    : undefined,
                }}
              >
                {subject && (
                  <div
                    className="absolute top-0 left-0 w-full h-[3px]"
                    style={{ backgroundColor: subject.color }}
                  />
                )}

                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-semibold text-sm text-[var(--color-text-primary)] truncate">
                      {exam.title}
                    </h3>
                    <button
                      onClick={() => handleDelete(exam.id, exam.title)}
                      className="p-1 rounded-md hover:bg-rose-500/10 text-[var(--color-text-muted)] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove Exam"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Countdown Badge */}
                  <div className="mb-3.5 flex items-center justify-between">
                    {subject && (
                      <SubjectBadge name={subject.name} color={subject.color} icon={subject.icon} />
                    )}
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        daysRemaining < 0
                          ? 'bg-gray-500/10 text-gray-400'
                          : daysRemaining === 0
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : daysRemaining <= 3
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-indigo-500/10 text-indigo-400'
                      }`}
                    >
                      {daysRemaining < 0
                        ? 'Passed'
                        : daysRemaining === 0
                        ? 'Today ⚠️'
                        : daysRemaining === 1
                        ? 'Tomorrow'
                        : `in ${daysRemaining} days`}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[var(--color-text-secondary)] mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-[var(--color-text-muted)]" />
                      <span>{formatDate(exam.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-[var(--color-text-muted)]" />
                      <span>{exam.time}</span>
                    </div>
                    {exam.room && (
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-[var(--color-text-muted)]" />
                        <span>Room: {exam.room}</span>
                      </div>
                    )}
                  </div>

                  {exam.notes && (
                    <div className="p-2 rounded-lg bg-[var(--glass-bg-light)] text-[11px] text-[var(--color-text-secondary)] mb-4 whitespace-pre-line border border-[var(--glass-border)]">
                      {exam.notes}
                    </div>
                  )}
                </div>

                {/* Exam PDF datesheet/guideline link */}
                {exam.datesheet && (
                  <div className="mt-auto pt-3 border-t border-[var(--glass-border)] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-base flex-shrink-0">📄</span>
                      <span className="text-[11px] text-[var(--color-text-secondary)] truncate">
                        {exam.datesheet.name}
                      </span>
                    </div>
                    <a
                      href={exam.datesheet.data}
                      download={exam.datesheet.name}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <Download size={12} />
                      Download
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Schedule Exam" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Exam Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm 1"
              className="glass-input"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                Room / Venue (optional)
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. Hall A, Science Bldg"
                className="glass-input"
              />
            </div>
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
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="glass-input"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Exam Notes / Syllabus scope (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Covers Chapters 1 to 4..."
              className="glass-input min-h-[90px] resize-none"
            />
          </div>

          {/* PDF attachment */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Attach Exam Sheet / Guide PDF (optional)
            </label>
            {datesheet ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-xl flex-shrink-0">📄</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                      {datesheet.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {Math.round(datesheet.size / 1024)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDatesheet(undefined)}
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
                  id="exam-pdf-upload"
                />
                <label
                  htmlFor="exam-pdf-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--glass-border)] rounded-xl py-4 px-3 cursor-pointer hover:border-indigo-500/50 hover:bg-[var(--glass-bg-light)] transition-all text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                >
                  <span className="text-2xl mb-1">📤</span>
                  <span className="text-xs font-medium">Upload Exam PDF</span>
                  <span className="text-[10px] mt-0.5 opacity-70">Max 1.5MB</span>
                </label>
              </div>
            )}
            {uploadError && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                <AlertCircle size={12} />
                {uploadError}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || !subjectId || !date || !time}>
              Schedule Exam
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
