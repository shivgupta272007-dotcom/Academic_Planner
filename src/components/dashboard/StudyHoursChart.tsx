import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '../../contexts/AppContext';
import { getStudyHoursBySubject } from '../../utils/analytics';

export default function StudyHoursChart() {
  const { pomodoroSessions, subjects } = useApp();
  const data = getStudyHoursBySubject(pomodoroSessions, subjects, 7);

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">
        Study Hours by Subject
        <span className="text-xs font-normal text-[var(--color-text-muted)] ml-2">Last 7 days</span>
      </h3>
      {data.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-sm text-[var(--color-text-muted)]">
          Start a Pomodoro session to track study hours
        </div>
      ) : (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                unit="h"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(12px)',
                  color: 'var(--color-text-primary)',
                  fontSize: '12px',
                }}
                formatter={(value: any) => [`${value}h`, 'Hours']}
              />
              <Bar dataKey="hours" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
