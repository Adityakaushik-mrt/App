/**
 * Date and Time Utilities adhering to:
 * - Date Format: DD-MM-YYYY
 * - Time Format: 12-hour format with AM/PM
 */

/**
 * Returns today's ISO date string: YYYY-MM-DD
 */
export function getTodayISODate(): string {
  const now = new Date();
  return formatDateToISO(now);
}

/**
 * Returns current 24h time: HH:mm
 */
export function getCurrentTime24(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Formats a Date object to ISO YYYY-MM-DD
 */
export function formatDateToISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts ISO YYYY-MM-DD to DD-MM-YYYY
 */
export function isoToDDMMYYYY(isoDate: string): string {
  if (!isoDate || !isoDate.includes('-')) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

/**
 * Converts DD-MM-YYYY to ISO YYYY-MM-DD
 */
export function ddmmYYYYToISO(ddmmyyyy: string): string {
  if (!ddmmyyyy || !ddmmyyyy.includes('-')) return '';
  const parts = ddmmyyyy.split('-');
  if (parts.length !== 3) return ddmmyyyy;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

/**
 * Converts 24h "HH:mm" time to 12-hour "hh:mm AM/PM"
 */
export function format24To12Hour(time24: string): string {
  if (!time24 || !time24.includes(':')) return time24;
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr.padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // 0 hour should be 12
  const formattedH = String(h).padStart(2, '0');
  return `${formattedH}:${m} ${ampm}`;
}

/**
 * Converts 12h "hh:mm AM/PM" to 24h "HH:mm"
 */
export function format12To24Hour(time12: string): string {
  if (!time12) return '12:00';
  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return time12;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = match[3].toUpperCase();
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

/**
 * Format ISO date to readable long form: e.g. "29 October 2026"
 */
export function formatReadableDate(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Checks if ISO date is Today
 */
export function isToday(isoDate: string): boolean {
  return isoDate === getTodayISODate();
}

/**
 * Checks if ISO date is Yesterday
 */
export function isYesterday(isoDate: string): boolean {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return isoDate === formatDateToISO(d);
}

/**
 * Returns readable relative badge: "Today", "Yesterday", or "DD-MM-YYYY"
 */
export function getRelativeDateLabel(isoDate: string): string {
  if (isToday(isoDate)) return 'Today';
  if (isYesterday(isoDate)) return 'Yesterday';
  return isoToDDMMYYYY(isoDate);
}

/**
 * Get start and end of week (Monday to Sunday) containing target date
 */
export function getWeekRange(date: Date = new Date()): { start: Date; end: Date; startISO: string; endISO: string } {
  const current = new Date(date);
  const day = current.getDay();
  // In JS: Sunday is 0, Monday is 1... Saturday is 6
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: monday,
    end: sunday,
    startISO: formatDateToISO(monday),
    endISO: formatDateToISO(sunday),
  };
}

/**
 * Get start and end of month containing target date
 */
export function getMonthRange(year: number, monthZeroIndexed: number): { startISO: string; endISO: string; label: string } {
  const start = new Date(year, monthZeroIndexed, 1);
  const end = new Date(year, monthZeroIndexed + 1, 0);
  const label = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  return {
    startISO: formatDateToISO(start),
    endISO: formatDateToISO(end),
    label,
  };
}
