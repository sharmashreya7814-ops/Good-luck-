/**
 * Utility functions for date and time calculations in the 24-hour HH:mm format.
 */

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function addMinutesToTime(time: string, durationMinutes: number): string {
  const totalMins = timeToMinutes(time) + durationMinutes;
  return minutesToTime(totalMins);
}

export function isSaturday(dateStr: string): boolean {
  // Use UTC or local split to avoid timezone off-by-one
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getDay() === 6;
}

/**
 * Checks if interval [startA, endA) overlaps with [startB, endB)
 */
export function isTimeOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const startAMins = timeToMinutes(startA);
  const endAMins = timeToMinutes(endA);
  const startBMins = timeToMinutes(startB);
  const endBMins = timeToMinutes(endB);

  return Math.max(startAMins, startBMins) < Math.min(endAMins, endBMins);
}

export function isValidDateString(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

export function isValidTimeString(timeStr: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(timeStr)) return false;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
}
