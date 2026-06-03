import {
  format,
  formatDistanceToNow,
  isAfter,
  isBefore,
  isToday,
  isTomorrow,
  isYesterday,
  differenceInDays,
  startOfWeek,
  endOfWeek,
  addDays,
  parseISO,
  isValid,
} from 'date-fns';

export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return 'Invalid date';
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d, yyyy');
}

export function formatDateShort(dateStr: string): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return '—';
  return format(date, 'MMM d');
}

export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatDurationLong(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

export function formatRelativeTime(dateStr: string): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return '';
  return formatDistanceToNow(date, { addSuffix: true });
}

export function isOverdue(dateStr: string): boolean {
  const date = parseISO(dateStr);
  if (!isValid(date)) return false;
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return isBefore(date, new Date()) && !isToday(date);
}

export function isDueSoon(dateStr: string, days: number = 3): boolean {
  const date = parseISO(dateStr);
  if (!isValid(date)) return false;
  const now = new Date();
  const threshold = addDays(now, days);
  return isAfter(date, now) && isBefore(date, threshold);
}

export function getDaysUntilDue(dateStr: string): number {
  const date = parseISO(dateStr);
  if (!isValid(date)) return 0;
  return differenceInDays(date, new Date());
}

export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

export function getWeekDays(date: Date = new Date()): Date[] {
  const { start } = getWeekRange(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function isSameDay(date1: string, date2: Date): boolean {
  const d1 = parseISO(date1);
  return format(d1, 'yyyy-MM-dd') === format(date2, 'yyyy-MM-dd');
}

export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function toTimeString(hours: number, minutes: number = 0): string {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export {
  format,
  parseISO,
  isToday,
  isTomorrow,
  addDays,
  differenceInDays,
  startOfWeek,
  endOfWeek,
  isValid,
  isAfter,
  isBefore,
};
