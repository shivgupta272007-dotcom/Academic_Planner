import { useState, useMemo } from 'react';
import { Plus, Search, Trash2, FileText, Download, AlertCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import SubjectBadge from '../components/subjects/SubjectBadge';
import { useToast } from '../components/ui/Toast';
import { formatDate } from '../utils/dates';
import type { StudyNote } from '../types';

export default function NotesPage() {
  const { subjects, studyNotes, addStudyNote, deleteStudyNote, getSubjectById } = useApp();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');

  // Form states
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState<StudyNote['attachment']>(undefined);
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
      setUploadError('PDF is too large (maximum size is 1.5MB to save storage).');
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
    if (!title.trim() || !content.trim() || !subjectId) return;

    addStudyNote({
      title: title.trim(),
      subjectId,
      content: content.trim(),
      attachment,
    });

    // Reset and close
    setTitle('');
    setContent('');
    setAttachment(undefined);
    setUploadError(null);
    setShowForm(false);
    showToast('success', 'Study Note created!');
  };

  const handleDelete = (id: string, noteTitle: string) => {
    if (window.confirm(`Delete the note "${noteTitle}"?`)) {
      deleteStudyNote(id);
      showToast('info', 'Note removed');
    }
  };

  const filteredNotes = useMemo(() => {
    return studyNotes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase());
      const matchesSubject =
        selectedSubjectFilter === 'all' || note.subjectId === selectedSubjectFilter;
      return matchesSearch && matchesSubject;
    });
  }, [studyNotes, search, selectedSubjectFilter]);

  return (
    <div className="animate-fade-in">
      <Header title="Study Notes" subtitle="Capture lectures, summaries, and lecture PDFs" />

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="glass-input pl-9"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="glass-select sm:w-48"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={() => setShowForm(true)} icon={<Plus size={16} />} size="sm">
          Add Note
        </Button>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <EmptyState
          icon={<FileText size={28} className="text-indigo-400" />}
          title={studyNotes.length === 0 ? 'No study notes yet' : 'No matching notes'}
          description={
            studyNotes.length === 0
              ? 'Create notes, write summaries, and upload lectures PDFs to keep everything organized.'
              : 'Try clearing your filters or changing your search terms.'
          }
          actionLabel={studyNotes.length === 0 ? 'Create First Note' : undefined}
          onAction={studyNotes.length === 0 ? () => setShowForm(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const subject = getSubjectById(note.subjectId);
            return (
              <div
                key={note.id}
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
                      {note.title}
                    </h3>
                    <button
                      onClick={() => handleDelete(note.id, note.title)}
                      className="p-1 rounded-md hover:bg-rose-500/10 text-[var(--color-text-muted)] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete Note"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <p className="text-xs text-[var(--color-text-muted)] mb-3">
                    {formatDate(note.createdAt)}
                  </p>

                  <div className="flex mb-3">
                    {subject && (
                      <SubjectBadge name={subject.name} color={subject.color} icon={subject.icon} />
                    )}
                  </div>

                  <p className="text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap line-clamp-6 mb-4">
                    {note.content}
                  </p>
                </div>

                {/* PDF Link */}
                {note.attachment && (
                  <div className="mt-auto pt-3 border-t border-[var(--glass-border)] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-base flex-shrink-0">📄</span>
                      <span className="text-[11px] text-[var(--color-text-secondary)] truncate">
                        {note.attachment.name}
                      </span>
                    </div>
                    <a
                      href={note.attachment.data}
                      download={note.attachment.name}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                      title="Download PDF"
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

      {/* Creation Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create Study Note" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 4 Lecture Notes"
              className="glass-input"
              required
              autoFocus
            />
          </div>

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
              Note Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing your summary or key take-aways..."
              className="glass-input min-h-[140px] resize-none"
              required
            />
          </div>

          {/* PDF attachment */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Attach Lecture PDF (optional)
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
                  id="note-pdf-upload"
                />
                <label
                  htmlFor="note-pdf-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--glass-border)] rounded-xl py-4 px-3 cursor-pointer hover:border-indigo-500/50 hover:bg-[var(--glass-bg-light)] transition-all text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                >
                  <span className="text-2xl mb-1">📤</span>
                  <span className="text-xs font-medium">Upload PDF Study Sheet</span>
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
            <Button type="submit" disabled={!title.trim() || !content.trim() || !subjectId}>
              Save Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
