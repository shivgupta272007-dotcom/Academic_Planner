import { useState } from 'react';
import { Plus, Search, Trash2, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import SubjectBadge from '../components/subjects/SubjectBadge';
import { useToast } from '../components/ui/Toast';

// Pre-seeded standard study resources
const DEFAULT_PRESEED_RESOURCES = [
  {
    id: 'seed-1',
    title: 'Khan Academy',
    url: 'https://www.khanacademy.org',
    description: 'Free online courses, lessons, and practice tools for maths, science, and humanities.',
    category: 'website' as const,
  },
  {
    id: 'seed-2',
    title: 'Wolfram Alpha',
    url: 'https://www.wolframalpha.com',
    description: 'Compute expert-level answers using AI technology and query engineering algorithms.',
    category: 'website' as const,
  },
  {
    id: 'seed-3',
    title: 'Wikipedia',
    url: 'https://www.wikipedia.org',
    description: 'Free encyclopedia detailing articles, histories, concepts, and literature reviews.',
    category: 'article' as const,
  },
  {
    id: 'seed-4',
    title: 'Quizlet',
    url: 'https://quizlet.com',
    description: 'Flashcards, learning sets, and vocabulary practice tools for active recall.',
    category: 'website' as const,
  },
];

export default function ResourcesPage() {
  const { subjects, studyResources, addStudyResource, deleteStudyResource, getSubjectById } = useApp();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Form states
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || 'general');
  const [category, setCategory] = useState<typeof studyResources[number]['category']>('website');
  const [description, setDescription] = useState('');

  // Combine user-created resources with defaults
  const allResources = [
    ...DEFAULT_PRESEED_RESOURCES.map(r => ({
      ...r,
      subjectId: 'general',
      createdAt: new Date().toISOString(),
    })),
    ...studyResources,
  ];

  const handleOpenAddForm = () => {
    setTitle('');
    setUrl('');
    setSubjectId(subjects[0]?.id || 'general');
    setCategory('website');
    setDescription('');
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !url.trim()) {
      showToast('error', 'Please fill in the required fields.');
      return;
    }

    // Basic URL validation
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    addStudyResource({
      title: title.trim(),
      url: formattedUrl,
      subjectId,
      category,
      description: description.trim() || undefined,
    });

    setShowForm(false);
    showToast('success', 'Resource added successfully!');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      deleteStudyResource(id);
      showToast('info', 'Resource removed.');
    }
  };

  const filteredResources = allResources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase())) ||
      r.url.toLowerCase().includes(search.toLowerCase());

    const matchesSubject =
      selectedSubjectFilter === 'all' ||
      r.subjectId === selectedSubjectFilter ||
      (selectedSubjectFilter === 'general' && r.subjectId === 'general');

    const matchesCategory = selectedCategoryFilter === 'all' || r.category === selectedCategoryFilter;

    return matchesSearch && matchesSubject && matchesCategory;
  });

  const getCategoryIcon = (cat: typeof studyResources[number]['category']) => {
    switch (cat) {
      case 'website': return '🌐';
      case 'video': return '🎥';
      case 'book': return '📖';
      case 'article': return '📄';
      default: return '🔗';
    }
  };

  return (
    <div className="animate-fade-in">
      <Header title="Study Resources" subtitle="Access course syllabus links, online tools, and learning materials" />

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex-1 w-full flex flex-col md:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resource url or title..."
              className="glass-input pl-9 py-2"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="w-full md:max-w-xs bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm px-3 py-2 text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">📁 All Subjects</option>
            <option value="general">🌍 General Reference</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.icon} {sub.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="w-full md:max-w-xs bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm px-3 py-2 text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">💡 All Categories</option>
            <option value="website">🌐 Websites</option>
            <option value="video">🎥 Videos</option>
            <option value="book">📖 Books</option>
            <option value="article">📄 Articles</option>
            <option value="other">🔗 Others</option>
          </select>
        </div>

        <Button onClick={handleOpenAddForm} icon={<Plus size={16} />} className="w-full sm:w-auto">
          Add Resource
        </Button>
      </div>

      {/* Grid of Resource Cards */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((res) => {
            const subject = res.subjectId !== 'general' ? getSubjectById(res.subjectId) : null;
            const isDefaultSeed = res.id.startsWith('seed-');

            return (
              <div
                key={res.id}
                className="glass-card p-5 flex flex-col justify-between group hover:border-indigo-500/30 transition-all relative overflow-hidden"
              >
                {/* Glow accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px]"
                  style={{ backgroundColor: subject ? subject.color : '#64748b' }}
                />

                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl" title={res.category}>{getCategoryIcon(res.category)}</span>
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {res.title}
                      </h3>
                    </div>

                    {!isDefaultSeed && (
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="text-[var(--color-text-muted)] hover:text-red-400 p-1 rounded-lg hover:bg-red-500/5 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Resource"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {res.description && (
                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>
                  )}

                  <div className="text-[10px] font-mono text-[var(--color-text-muted)] truncate select-all" title={res.url}>
                    {res.url}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-4 border-t border-[var(--glass-border)] mt-4">
                  {subject ? (
                    <SubjectBadge name={subject.name} color={subject.color} icon={subject.icon} />
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                      🌍 General
                    </span>
                  )}

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Open Link <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No resources found"
          description="Try modifying your search or filters, or add a new study reference link to keep your materials organized!"
          icon={<LinkIcon size={48} className="text-indigo-400" />}
        />
      )}

      {/* Add Resource Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add Study Resource">
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Resource Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mathematics Formula Reference Sheet"
              className="glass-input"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Resource URL <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. https://www.khanacademy.org/math"
              className="glass-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Subject picker */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                Subject association
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="glass-select"
              >
                <option value="general">🌍 General Reference</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.icon} {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category picker */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                className="glass-select"
              >
                <option value="website">🌐 Website</option>
                <option value="video">🎥 Video</option>
                <option value="book">📖 Book</option>
                <option value="article">📄 Article</option>
                <option value="other">🔗 Other</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a brief overview of what this study guide covers..."
              className="glass-input resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || !url.trim()}>
              Save Resource
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
