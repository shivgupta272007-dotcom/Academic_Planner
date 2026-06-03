import { useState } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Download,
  Upload,
  Trash2,
  Timer,
  Palette,
} from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../components/ui/Toast';
import { exportAllData, importAllData, clearAllData } from '../utils/storage';
import type { PomodoroSettings } from '../types';

export default function SettingsPage() {
  const { settings, updateSettings, resetAll } = useApp();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings>(settings.pomodoro);

  const handlePomodoroChange = (key: keyof PomodoroSettings, value: number | boolean) => {
    const updated = { ...pomodoroSettings, [key]: value };
    setPomodoroSettings(updated);
    updateSettings({ pomodoro: updated });
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Data exported successfully!');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        if (importAllData(data)) {
          showToast('success', 'Data imported! Reload to see changes.');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          showToast('error', 'Failed to import data. Invalid file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure? This will delete ALL your data permanently.')) {
      if (window.confirm('This action cannot be undone. Continue?')) {
        resetAll();
        clearAllData();
        showToast('info', 'All data cleared.');
        setTimeout(() => window.location.reload(), 500);
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <Header title="Settings" subtitle="Customize your experience" />

      <div className="max-w-2xl space-y-6">
        {/* Theme */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <Palette size={18} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Appearance</h3>
          </div>
          <div className="flex gap-3">
            {([
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'system', label: 'System', icon: Monitor },
            ] as const).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${
                    theme === value
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'glass-card-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                  }
                `}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Pomodoro */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <Timer size={18} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Pomodoro Timer</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="flex justify-between text-sm text-[var(--color-text-secondary)] mb-1.5">
                <span>Focus Duration</span>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {pomodoroSettings.focusDuration} min
                </span>
              </label>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={pomodoroSettings.focusDuration}
                onChange={(e) => handlePomodoroChange('focusDuration', Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
            <div>
              <label className="flex justify-between text-sm text-[var(--color-text-secondary)] mb-1.5">
                <span>Short Break</span>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {pomodoroSettings.shortBreakDuration} min
                </span>
              </label>
              <input
                type="range"
                min={1}
                max={15}
                step={1}
                value={pomodoroSettings.shortBreakDuration}
                onChange={(e) => handlePomodoroChange('shortBreakDuration', Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label className="flex justify-between text-sm text-[var(--color-text-secondary)] mb-1.5">
                <span>Long Break</span>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {pomodoroSettings.longBreakDuration} min
                </span>
              </label>
              <input
                type="range"
                min={5}
                max={30}
                step={5}
                value={pomodoroSettings.longBreakDuration}
                onChange={(e) => handlePomodoroChange('longBreakDuration', Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
            <div>
              <label className="flex justify-between text-sm text-[var(--color-text-secondary)] mb-1.5">
                <span>Sessions before long break</span>
                <span className="font-medium text-[var(--color-text-primary)]">
                  {pomodoroSettings.sessionsBeforeLongBreak}
                </span>
              </label>
              <input
                type="range"
                min={2}
                max={8}
                step={1}
                value={pomodoroSettings.sessionsBeforeLongBreak}
                onChange={(e) =>
                  handlePomodoroChange('sessionsBeforeLongBreak', Number(e.target.value))
                }
                className="w-full accent-violet-500"
              />
            </div>

            <div className="space-y-2 pt-2">
              {([
                { key: 'autoStartBreaks', label: 'Auto-start breaks' },
                { key: 'autoStartFocus', label: 'Auto-start focus sessions' },
                { key: 'soundEnabled', label: 'Sound notification' },
              ] as const).map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center justify-between py-1.5 cursor-pointer"
                >
                  <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
                  <button
                    onClick={() => handlePomodoroChange(key, !pomodoroSettings[key])}
                    className={`
                      w-10 h-5 rounded-full transition-all duration-200 relative
                      ${pomodoroSettings[key] ? 'bg-indigo-500' : 'bg-[var(--color-text-muted)]'}
                    `}
                  >
                    <span
                      className={`
                        absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200
                        ${pomodoroSettings[key] ? 'translate-x-5' : 'translate-x-0.5'}
                      `}
                    />
                  </button>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <Download size={18} className="text-cyan-400" />
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Data Management</h3>
          </div>
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="sm"
                icon={<Download size={14} />}
                onClick={handleExport}
                className="flex-1"
              >
                Export Data
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<Upload size={14} />}
                onClick={handleImport}
                className="flex-1"
              >
                Import Data
              </Button>
            </div>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={14} />}
              onClick={handleClearAll}
              className="w-full"
            >
              Clear All Data
            </Button>
            <p className="text-xs text-[var(--color-text-muted)]">
              All data is stored locally in your browser. Export regularly to avoid data loss.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
