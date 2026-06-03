import Header from '../components/layout/Header';
import DashboardStats from '../components/dashboard/DashboardStats';
import UpcomingDeadlines from '../components/dashboard/UpcomingDeadlines';
import ProgressChart from '../components/dashboard/ProgressChart';
import StudyHoursChart from '../components/dashboard/StudyHoursChart';
import StreakCounter from '../components/dashboard/StreakCounter';
import Button from '../components/ui/Button';
import { Plus, Play, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../assets/hero.png';

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <Header
        title="Dashboard"
        subtitle="Your academic overview at a glance"
      />

      {/* Premium Welcome Hero Banner */}
      <div className="glass-card overflow-hidden p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-indigo-500/10 via-violet-500/5 to-cyan-500/5 relative border border-indigo-500/10 shadow-lg">
        <div className="flex-1 space-y-3 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
            <span>✨ Welcome back, Student!</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
            Ready to crush your <span className="gradient-text">Academic Goals</span> today?
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] max-w-md">
            Stay organized, manage assignments, log focus sessions, and build a productive study streak. Everything you need is right here.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => navigate('/assignments')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-md shadow-indigo-600/20"
            >
              Add Assignment
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<Calendar size={14} />}
              onClick={() => navigate('/calendar')}
            >
              Schedule Session
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<Play size={14} />}
              onClick={() => navigate('/pomodoro')}
            >
              Start Pomodoro
            </Button>
          </div>
        </div>
        
        {/* Colorful Hero Image */}
        <div className="relative w-full md:w-80 h-48 md:h-52 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl border border-[var(--glass-border)] group">
          <img
            src={heroImage}
            alt="Student Studying Illustration"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          {/* Subtle glow layer behind the image */}
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Stats */}
      <DashboardStats />

      {/* Charts & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 mb-4">
        <UpcomingDeadlines />
        <StreakCounter />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProgressChart />
        <StudyHoursChart />
      </div>
    </div>
  );
}
