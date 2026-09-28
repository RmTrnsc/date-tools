export const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre"
];

export const WEEKDAYS = [
  "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"
];

export function parseISODate(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric"
  }).format(date);
}

export function toUTCDate({ year, month, day }) {
  return new Date(Date.UTC(year, month - 1, day));
}

export function fromUTCDate(date) {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate()
  };
}

export function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInMonth(year, month) {
  const lengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return lengths[month - 1];
}

export function isValidDateParts(year, month, day) {
  return Number.isInteger(year) && Number.isInteger(month) && Number.isInteger(day)
    && year >= 1 && month >= 1 && month <= 12
    && day >= 1 && day <= daysInMonth(year, month);
}

export function compareDates(a, b) {
  return toUTCDate(a) - toUTCDate(b);
}

export function calendarDaysBetween(a, b) {
  return Math.round(Math.abs(compareDates(a, b)) / 86400000);
}

export function addCalendarDays(date, amount) {
  const d = toUTCDate(date);
  d.setUTCDate(d.getUTCDate() + amount);
  return fromUTCDate(d);
}

export function addMonths(date, amount) {
  const d = toUTCDate(date);
  const originalDay = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + amount);
  d.setUTCDate(Math.min(originalDay, daysInMonth(d.getUTCFullYear(), d.getUTCMonth() + 1)));
  return fromUTCDate(d);
}

export function addYears(date, amount) {
  return addMonths(date, amount * 12);
}

export function iso(date) {
  return `${String(date.year).padStart(4, "0")}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

export function humanDate(date) {
  return `${String(date.day).padStart(2, "0")}/${String(date.month).padStart(2, "0")}/${date.year}`;
}

export function formatDuration(a, b) {
  let start = a, end = b;
  if (compareDates(start, end) > 0) [start, end] = [end, start];

  let cursor = { ...start };
  let years = 0, months = 0;

  while (compareDates(addYears(cursor, 1), end) <= 0) {
    cursor = addYears(cursor, 1);
    years++;
  }
  while (compareDates(addMonths(cursor, 1), end) <= 0) {
    cursor = addMonths(cursor, 1);
    months++;
  }

  return { years, months, days: calendarDaysBetween(cursor, end) };
}
