import Header from '../components/layout/Header';
import WeeklyCalendar from '../components/calendar/WeeklyCalendar';

export default function CalendarPage() {
  return (
    <div className="animate-fade-in">
      <Header title="Study Calendar" subtitle="Plan and schedule your study sessions" />
      <WeeklyCalendar />
    </div>
  );
}
