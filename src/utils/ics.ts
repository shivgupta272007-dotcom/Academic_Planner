import type { StudySession, Exam, Subject } from '../types';

export function exportToICS(sessions: StudySession[], exams: Exam[], subjects: Subject[]) {
  // Setup Calendar Headers (Standard RFC 5545 format)
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Academic Planner//Study Assistant//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ].join('\r\n') + '\r\n';

  // Format YYYY-MM-DD and HH:MM to UTC ICS format: YYYYMMDDTHHMMSSZ
  const formatICSDate = (dateStr: string, timeStr: string = '09:00', durationMinutes: number = 60) => {
    const [hh, mm] = timeStr.split(':').map(Number);
    const year = Number(dateStr.substring(0, 4));
    const month = Number(dateStr.substring(5, 7)) - 1;
    const day = Number(dateStr.substring(8, 10));

    // Convert local study session date/time into a Date object
    const startDate = new Date(year, month, day, hh, mm, 0);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

    const toUTCString = (d: Date) => {
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    return {
      start: toUTCString(startDate),
      end: toUTCString(endDate)
    };
  };

  // 1. Process Study Sessions
  sessions.forEach((s) => {
    const subject = subjects.find(sub => sub.id === s.subjectId);
    const { start, end } = formatICSDate(s.date, s.startTime, s.duration);
    const title = `${subject?.icon || '⚡'} Session: ${s.title || subject?.name || 'Study Block'}`;
    const description = `Subject: ${subject?.name || 'General'}\nStatus: ${s.status}\nLogged Duration: ${s.duration} minutes`;

    icsContent += [
      'BEGIN:VEVENT',
      `UID:session-${s.id}@academic-planner`,
      `DTSTAMP:${start}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      'END:VEVENT'
    ].join('\r\n') + '\r\n';
  });

  // 2. Process Exams
  exams.forEach((e) => {
    const subject = subjects.find(sub => sub.id === e.subjectId);
    // Default exam slot is 2 hours (120 minutes)
    const { start, end } = formatICSDate(e.date, e.time, 120);
    const title = `🚨 EXAM: ${e.title} (${subject?.name || 'Course'})`;
    const description = `Exam Details:\nSubject: ${subject?.name || 'General'}\nRoom: ${e.room || 'Online/TBD'}\nNotes: ${e.notes || ''}`;
    const location = e.room || '';

    icsContent += [
      'BEGIN:VEVENT',
      `UID:exam-${e.id}@academic-planner`,
      `DTSTAMP:${start}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      location ? `LOCATION:${location}` : '',
      'END:VEVENT'
    ].filter(Boolean).join('\r\n') + '\r\n';
  });

  icsContent += 'END:VCALENDAR';

  // Trigger browser download of .ics calendar file
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `academic-planner-${new Date().toISOString().split('T')[0]}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
