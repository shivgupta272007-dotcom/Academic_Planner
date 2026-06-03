import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { ReminderBell } from '../reminders/ReminderBell';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between py-4 px-1 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">{title}</h1>
        {subtitle && (
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ReminderBell />
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-[var(--glass-bg-light)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}
