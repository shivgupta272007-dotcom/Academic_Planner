import React from 'react';
import { FolderOpen, Plus } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl glass-card-sm flex items-center justify-center mb-4">
        {icon || <FolderOpen size={28} className="text-[var(--color-text-muted)]" />}
      </div>
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
