import Header from '../components/layout/Header';
import PomodoroTimer from '../components/pomodoro/PomodoroTimer';
import PomodoroHistory from '../components/pomodoro/PomodoroHistory';

export default function PomodoroPage() {
  return (
    <div className="animate-fade-in">
      <Header title="Pomodoro Timer" subtitle="Stay focused with timed study sessions" />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <div className="glass-card p-8 flex items-center justify-center">
            <PomodoroTimer />
          </div>
        </div>
        <div className="lg:col-span-2">
          <PomodoroHistory />
        </div>
      </div>
    </div>
  );
}
