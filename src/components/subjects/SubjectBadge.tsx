interface SubjectBadgeProps {
  name: string;
  color: string;
  icon?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function SubjectBadge({
  name,
  color,
  icon,
  size = 'sm',
  className = '',
}: SubjectBadgeProps) {
  const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-lg
        ${sizeClass} ${className}
      `}
      style={{
        color,
        backgroundColor: `${color}18`,
        border: `1px solid ${color}25`,
      }}
    >
      {icon && <span className="text-xs">{icon}</span>}
      {name}
    </span>
  );
}
