

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  bgColor?: string;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export default function Badge({
  children,
  color = '#94a3b8',
  bgColor,
  size = 'sm',
  className = '',
  dot = false,
}: BadgeProps) {
  const bg = bgColor || `${color}20`;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${sizeClass} ${className}
      `}
      style={{ color, backgroundColor: bg }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {children}
    </span>
  );
}
