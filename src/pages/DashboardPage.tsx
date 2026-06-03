
import Header from '../components/layout/Header';
import DashboardStats from '../components/dashboard/DashboardStats';
import UpcomingDeadlines from '../components/dashboard/UpcomingDeadlines';
import ProgressChart from '../components/dashboard/ProgressChart';
import StudyHoursChart from '../components/dashboard/StudyHoursChart';
import StreakCounter from '../components/dashboard/StreakCounter';
import Button from '../components/ui/Button';
import { Plus, Play, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <Header
        title="Dashboard"
        subtitle="Your academic overview at a glance"
      />

      {/* Stats */}
      <DashboardStats />

      {/* Quick Actions */}
      <div className="flex gap-2 mt-6 mb-6">
        <Button
          size="sm"
          variant="secondary"
          icon={<Plus size={14} />}
          onClick={() => navigate('/assignments')}
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

      {/* Charts & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
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
