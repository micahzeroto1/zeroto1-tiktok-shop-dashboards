import type { WeeklyRollup } from '@/types/dashboard';

/** Parse a date string from Google Sheets (handles various formats) */
export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();

  // Google Sheets serial date number (days since 1899-12-30)
  if (/^\d{4,6}(\.\d+)?$/.test(trimmed)) {
    const serial = parseFloat(trimmed);
    if (serial > 40000 && serial < 60000) {
      // Convert: epoch for serial 0 is 1899-12-30
      const ms = (serial - 25569) * 86400000;
      const d = new Date(ms);
      return isNaN(d.getTime()) ? null : d;
    }
  }

  // Try ISO format: 2026-01-10
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const d = new Date(trimmed + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }

  // Try US format: 1/10/2026 or 01/10/2026 (with optional time)
  const usMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (usMatch) {
    const d = new Date(Number(usMatch[3]), Number(usMatch[1]) - 1, Number(usMatch[2]));
    return isNaN(d.getTime()) ? null : d;
  }

  // Fallback: let Date parse it
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
}

/** Sort weekly rollup data by parsed date (chronological order) */
export function sortWeeklyByDate(weeks: WeeklyRollup[]): WeeklyRollup[] {
  return [...weeks].sort((a, b) => {
    const da = parseDate(a.date);
    const db = parseDate(b.date);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return da.getTime() - db.getTime();
  });
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Build date-range labels for weekly rollup data.
 * Each week's end date comes from the `date` field (Col A).
 * Start date = previous week's end + 1 day (or end - 6 for the first week).
 * Returns labels like "Jan 1-3", "Jan 4-10", "Jan 28 - Feb 3".
 */
export function buildWeekLabels(weeks: WeeklyRollup[]): string[] {
  if (weeks.length === 0) return [];

  const endDates = weeks.map((w) => parseDate(w.date));

  return endDates.map((end, i) => {
    if (!end) return weeks[i].weekLabel || weeks[i].date || `W${i + 1}`;

    let start: Date;
    if (i === 0) {
      start = new Date(end);
      start.setDate(start.getDate() - 6);
    } else {
      const prevEnd = endDates[i - 1];
      if (prevEnd) {
        start = new Date(prevEnd);
        start.setDate(start.getDate() + 1);
      } else {
        start = new Date(end);
        start.setDate(start.getDate() - 6);
      }
    }

    const sMonth = SHORT_MONTHS[start.getMonth()];
    const eMonth = SHORT_MONTHS[end.getMonth()];
    const sDay = start.getDate();
    const eDay = end.getDate();

    if (sMonth === eMonth) {
      return `${sMonth} ${sDay}-${eDay}`;
    }
    return `${sMonth} ${sDay} - ${eMonth} ${eDay}`;
  });
}

/**
 * Check if a date string falls in the current week (i.e., the week ending
 * on or after today).  Used to tag the last bar as "in progress".
 */
export function isCurrentWeek(dateStr: string): boolean {
  const d = parseDate(dateStr);
  if (!d) return false;
  const now = new Date();
  // week-end date is on or after today, and within 7 days before today
  const diffMs = d.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= -7 && diffDays <= 7;
}

/** Time filter periods */
export type TimePeriod = 'current_month' | 'last_month' | 'last_90_days' | 'ytd';

/** Filter weekly rollup data by time period based on the week-ending date */
export function filterWeeklyByPeriod(
  weeks: WeeklyRollup[],
  period: TimePeriod,
): WeeklyRollup[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return weeks.filter((w) => {
    const d = parseDate(w.date);
    if (!d) return false;

    switch (period) {
      case 'current_month':
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      case 'last_month': {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
      }
      case 'last_90_days': {
        const cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - 90);
        return d >= cutoff;
      }
      case 'ytd':
        return d.getFullYear() === currentYear;
      default:
        return true;
    }
  });
}
