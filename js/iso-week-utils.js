import { fromUTCDate, toUTCDate, addCalendarDays } from "./date-utils.js";

/**
 * Returns the ISO 8601 week number and ISO year for a given date.
 * Under ISO 8601:
 * - Weeks start on Monday.
 * - Week 1 is the week with the first Thursday of the Gregorian year (contains Jan 4).
 * @param {number} year
 * @param {number} month
 * @param {number} day
 * @returns {{ isoYear: number, week: number }}
 */
export function getISOWeek(year, month, day) {
  const d = new Date(Date.UTC(year, month - 1, day));
  const dayNum = d.getUTCDay() || 7; // 1 = Monday, 7 = Sunday
  // Set to nearest Thursday: current date + 4 - current day number
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const isoYear = d.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return { isoYear, week };
}

/**
 * Returns the date range (Monday to Sunday) for a given ISO year and week number.
 * @param {number} isoYear
 * @param {number} week
 * @returns {{ start: { year: number, month: number, day: number }, end: { year: number, month: number, day: number } }}
 */
export function getISOWeekRange(isoYear, week) {
  // Jan 4 is always in ISO week 1
  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  const dayNum = jan4.getUTCDay() || 7; // 1 = Monday, 7 = Sunday
  // Monday of week 1
  const week1Monday = new Date(Date.UTC(isoYear, 0, 4 - (dayNum - 1)));
  // Monday of requested week
  const startUtc = new Date(week1Monday.getTime() + (week - 1) * 7 * 86400000);
  const endUtc = new Date(startUtc.getTime() + 6 * 86400000);

  return {
    start: fromUTCDate(startUtc),
    end: fromUTCDate(endUtc)
  };
}
