import { Flame } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { calculateStreak } from '../../utils/analytics';

export default function StreakCounter() {
  const { assignments } = useApp();
  const streak = calculateStreak(assignments);

  return (
    <div className="glass-card p-5 flex items-center gap-4">
      <div
        className={`
          w-14 h-14 rounded-2xl flex items-center justify-center
          ${streak > 0 ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/20' : 'bg-[var(--glass-bg-light)]'}
        `}
      >
        <Flame
          size={28}
          className={streak > 0 ? 'text-orange-400' : 'text-[var(--color-text-muted)]'}
        />
      </div>
      <div>
        <div className="text-3xl font-bold text-[var(--color-text-primary)]">
          {streak}
        </div>
        <div className="text-sm text-[var(--color-text-muted)]">
          {streak === 0 ? 'No streak yet' : streak === 1 ? 'day streak!' : 'day streak! 🔥'}
        </div>
        {streak === 0 && (
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Complete an assignment to start your streak
          </p>
        )}
      </div>
    </div>
  );
}
