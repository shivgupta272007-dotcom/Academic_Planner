
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PomodoroProvider } from './contexts/PomodoroContext';
import { ToastProvider } from './components/ui/Toast';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import AssignmentsPage from './pages/AssignmentsPage';
import CalendarPage from './pages/CalendarPage';
import SubjectsPage from './pages/SubjectsPage';
import PomodoroPage from './pages/PomodoroPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <PomodoroProvider>
          <ToastProvider>
            <Router>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/assignments" element={<AssignmentsPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/subjects" element={<SubjectsPage />} />
                  <Route path="/pomodoro" element={<PomodoroPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Routes>
            </Router>
          </ToastProvider>
        </PomodoroProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
