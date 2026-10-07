import {
  toUTCDate,
  fromUTCDate,
  addCalendarDays,
  compareDates,
  iso
} from "./date-utils.js";
import { holidaySet } from "./holidays-fr.js";

/**
 * Checks if a given date is a business day (jour ouvré).
 * @param {{ year: number, month: number, day: number }} parts
 * @param {{ includeSaturday?: boolean, excludeHolidays?: boolean }} [options]
 * @returns {boolean}
 */
export function isBusinessDay(parts, options = {}) {
  const { includeSaturday = false, excludeHolidays = true } = options;
  const d = toUTCDate(parts);
  const weekday = d.getUTCDay(); // 0 = Sunday, 6 = Saturday

  if (weekday === 0) return false;
  if (!includeSaturday && weekday === 6) return false;

  if (excludeHolidays) {
    const holidays = holidaySet(parts.year);
    if (holidays.has(iso(parts))) return false;
  }

  return true;
}

/**
 * Checks if a given date is a working day (jour ouvrable: Mon-Sat, excluding public holidays).
 * @param {{ year: number, month: number, day: number }} parts
 * @param {{ excludeHolidays?: boolean }} [options]
 * @returns {boolean}
 */
export function isWorkingDay(parts, options = {}) {
  const { excludeHolidays = true } = options;
  const d = toUTCDate(parts);
  const weekday = d.getUTCDay();

  if (weekday === 0) return false;

  if (excludeHolidays) {
    const holidays = holidaySet(parts.year);
    if (holidays.has(iso(parts))) return false;
  }

  return true;
}

/**
 * Counts business, working, weekend, and holiday days between two dates (inclusive).
 * @param {{ year: number, month: number, day: number }} startParts
 * @param {{ year: number, month: number, day: number }} endParts
 * @param {{ includeSaturday?: boolean, excludeHolidays?: boolean }} [options]
 * @returns {{ calendarDays: number, businessDays: number, weekendDays: number, holidayDays: number, workingDaysOpen: number, inverted: boolean }}
 */
export function countBusinessDays(startParts, endParts, options = {}) {
  const { includeSaturday = false, excludeHolidays = true } = options;
  let a = { ...startParts };
  let b = { ...endParts };
  let inverted = false;

  if (compareDates(a, b) > 0) {
    [a, b] = [b, a];
    inverted = true;
  }

  const holidayCache = new Map();
  function getHolidays(year) {
    if (!holidayCache.has(year)) {
      holidayCache.set(year, holidaySet(year));
    }
    return holidayCache.get(year);
  }

  let calendarDays = 0;
  let businessDays = 0;
  let weekendDays = 0;
  let holidayDays = 0;
  let workingDaysOpen = 0;

  const currentUtc = toUTCDate(a);
  const endUtc = toUTCDate(b);

  while (currentUtc <= endUtc) {
    calendarDays++;
    const currentParts = fromUTCDate(currentUtc);
    const weekday = currentUtc.getUTCDay();
    const isSunday = weekday === 0;
    const isSaturday = weekday === 6;

    const holidays = getHolidays(currentParts.year);
    const isHoliday = holidays.has(iso(currentParts));

    if (isHoliday) {
      holidayDays++;
    }

    if (isSunday || isSaturday) {
      weekendDays++;
    }

    // Jour ouvrable: Monday-Saturday, excluding holidays if excludeHolidays is true
    if (!isSunday && !(excludeHolidays && isHoliday)) {
      workingDaysOpen++;
    }

    // Jour ouvré: Monday-Friday (or Monday-Saturday if includeSaturday is true), excluding holidays if requested
    const isDayAllowed = includeSaturday ? !isSunday : !isSunday && !isSaturday;
    if (isDayAllowed && !(excludeHolidays && isHoliday)) {
      businessDays++;
    }

    currentUtc.setUTCDate(currentUtc.getUTCDate() + 1);
  }

  return {
    calendarDays,
    businessDays,
    weekendDays,
    holidayDays,
    workingDaysOpen,
    inverted
  };
}

/**
 * Adds or subtracts N business days to/from a starting date.
 * Does not count the start date itself; starts counting from the next calendar day.
 * @param {{ year: number, month: number, day: number }} startParts
 * @param {number} count
 * @param {{ includeSaturday?: boolean, excludeHolidays?: boolean }} [options]
 * @returns {{ year: number, month: number, day: number }}
 */
export function addBusinessDays(startParts, count, options = {}) {
  if (count === 0) return { ...startParts };

  const step = count > 0 ? 1 : -1;
  let remaining = Math.abs(count);
  let cursor = { ...startParts };

  while (remaining > 0) {
    cursor = addCalendarDays(cursor, step);
    if (isBusinessDay(cursor, options)) {
      remaining--;
    }
  }

  return cursor;
}
