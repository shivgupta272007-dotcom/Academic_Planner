import { useState } from 'react';
import { Download, FileText, Upload, Trash2, Edit3, AlertCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import type { Syllabus } from '../types';

export default function SyllabusPage() {
  const { subjects, syllabi, saveSyllabus, deleteSyllabus } = useApp();
  const { showToast } = useToast();

  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [syllabusNotes, setSyllabusNotes] = useState('');
  const [attachment, setAttachment] = useState<Syllabus['attachment']>(undefined);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const getSyllabusForSubject = (subjectId: string) => {
    return syllabi.find((s) => s.subjectId === subjectId);
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
      setAttachment({
        name: file.name,
        data: dataUrl,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleOpenUpload = (subjectId: string) => {
    const existing = getSyllabusForSubject(subjectId);
    setSyllabusNotes(existing?.notes || '');
    setAttachment(existing?.attachment || undefined);
    setUploadError(null);
    setActiveSubjectId(subjectId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubjectId) return;

    saveSyllabus({
      subjectId: activeSubjectId,
      notes: syllabusNotes.trim() || undefined,
      attachment,
    });

    setSyllabusNotes('');
    setAttachment(undefined);
    setUploadError(null);
    setActiveSubjectId(null);
    showToast('success', 'Syllabus updated!');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this syllabus?')) {
      deleteSyllabus(id);
      showToast('info', 'Syllabus removed');
    }
  };

  return (
    <div className="animate-fade-in">
      <Header title="Syllabus Directory" subtitle="Store, organize, and view your course syllabi" />

      {subjects.length === 0 ? (
        <div className="py-12 text-center text-sm text-[var(--color-text-muted)]">
          Please add subjects under the Subjects tab first to configure syllabus sheets.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((subject) => {
            const syllabus = getSyllabusForSubject(subject.id);

            return (
              <div
                key={subject.id}
                className="glass-card p-5 relative overflow-hidden flex flex-col justify-between group"
                style={{
                  boxShadow: `0 4px 24px -4px ${subject.color}15, 0 2px 10px -2px ${subject.color}08`,
                }}
              >
                {/* Accent bar */}
                <div
                  className="absolute top-0 left-0 w-full h-[3px]"
                  style={{ backgroundColor: subject.color }}
                />

                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${subject.color}20` }}
                    >
                      {subject.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">
                        {subject.name}
                      </h3>
                      <p className="text-xs text-[var(--color-text-muted)]">Syllabus details</p>
                    </div>
                  </div>

                  {syllabus ? (
                    <div className="space-y-4">
                      {syllabus.notes && (
                        <div className="p-3 rounded-xl bg-[var(--glass-bg-light)] border border-[var(--glass-border)] text-xs text-[var(--color-text-secondary)] whitespace-pre-line leading-relaxed">
                          {syllabus.notes}
                        </div>
                      )}

                      {/* PDF file link */}
                      {syllabus.attachment ? (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-lg flex-shrink-0">📄</span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate">
                                {syllabus.attachment.name}
                              </p>
                              <p className="text-[10px] text-[var(--color-text-muted)]">
                                {Math.round(syllabus.attachment.size / 1024)} KB
                              </p>
                            </div>
                          </div>
                          <a
                            href={syllabus.attachment.data}
                            download={syllabus.attachment.name}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition-colors flex items-center justify-center"
                            title="Download PDF"
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      ) : (
                        <p className="text-xs text-[var(--color-text-muted)] italic">
                          No PDF file attached.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-[var(--glass-border)] rounded-xl">
                      <FileText size={28} className="text-[var(--color-text-muted)] mb-2" />
                      <p className="text-xs text-[var(--color-text-muted)] max-w-xs">
                        No syllabus uploaded yet. Add details or upload a course syllabus PDF.
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-[var(--glass-border)] flex items-center justify-end gap-2">
                  {syllabus ? (
                    <>
                      <button
                        onClick={() => handleOpenUpload(subject.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-400 hover:bg-indigo-500/10 transition-colors flex items-center gap-1.5"
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(syllabus.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleOpenUpload(subject.id)}
                      icon={<Upload size={13} />}
                      size="sm"
                    >
                      Configure Syllabus
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit/Configure Syllabus Modal */}
      <Modal
        isOpen={!!activeSubjectId}
        onClose={() => setActiveSubjectId(null)}
        title="Configure Syllabus"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Course Outline / Syllabus Summary (optional)
            </label>
            <textarea
              value={syllabusNotes}
              onChange={(e) => setSyllabusNotes(e.target.value)}
              placeholder="e.g. Topics covered: Algebra, Calculus, Trigonometry..."
              className="glass-input min-h-[120px] resize-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Upload Syllabus PDF (optional)
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
                  onClick={() => setAttachment(undefined)}
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
                  id="syllabus-pdf-upload"
                />
                <label
                  htmlFor="syllabus-pdf-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--glass-border)] rounded-xl py-4 px-3 cursor-pointer hover:border-indigo-500/50 hover:bg-[var(--glass-bg-light)] transition-all text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                >
                  <span className="text-2xl mb-1">📤</span>
                  <span className="text-xs font-medium">Select Syllabus PDF</span>
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
            <Button type="button" variant="ghost" onClick={() => setActiveSubjectId(null)}>
              Cancel
            </Button>
            <Button type="submit">Save Syllabus</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
