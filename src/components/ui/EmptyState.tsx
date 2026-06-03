import React from 'react';
import { FolderOpen, Plus } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  image?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  image,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
      {image ? (
        <div className="relative w-48 h-48 mb-6 rounded-2xl overflow-hidden shadow-lg border border-[var(--glass-border)]">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-2xl glass-card-sm flex items-center justify-center mb-4 relative shadow-lg shadow-indigo-500/10">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-violet-500/10 blur-xl opacity-50" />
          <span className="relative">
            {icon || <FolderOpen size={28} className="text-indigo-400" />}
          </span>
        </div>
      )}
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] max-w-sm mb-5">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} icon={<Plus size={16} />} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
