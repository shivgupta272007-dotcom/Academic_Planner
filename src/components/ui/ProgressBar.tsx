

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  color = '#6366f1',
  size = 'md',
  showLabel = false,
  animated = true,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-[var(--color-text-muted)]">Progress</span>
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={`w-full ${heightClass} rounded-full overflow-hidden`}
        style={{ backgroundColor: `${color}20` }}
      >
        <div
          className={`${heightClass} rounded-full transition-all duration-700 ease-out ${animated ? 'animate-progress' : ''}`}
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
            boxShadow: percentage > 0 ? `0 0 8px ${color}40` : 'none',
          }}
        />
      </div>
    </div>
  );
}
