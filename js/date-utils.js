export const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre"
];

export const WEEKDAYS = [
  "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"
];

export function parseISODate(value) {
  if (!value || typeof value !== "string") return null;
  const parts = value.split("-").map(Number);
  if (parts.length !== 3) return null;
  const [year, month, day] = parts;
  if (!isValidDateParts(year, month, day)) return null;
  return { year, month, day };
}

export function formatDate(date) {
  const d = date instanceof Date ? date : toUTCDate(date);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC"
  }).format(d);
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
  if (!Number.isInteger(year)) return false;
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInMonth(year, month) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return 0;
  }
  const lengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return lengths[month - 1];
}

export function isValidDateParts(year, month, day) {
  return Number.isInteger(year) && Number.isInteger(month) && Number.isInteger(day)
    && year >= 1 && month >= 1 && month <= 12
    && day >= 1 && day <= daysInMonth(year, month);
}

export function getDayOfWeek(year, month, day) {
  let m = month;
  let y = year;
  if (m < 3) {
    m += 12;
    y -= 1;
  }
  const K = y % 100;
  const J = Math.floor(y / 100);
  const h = (day + Math.floor((13 * (m + 1)) / 5) + K + Math.floor(K / 4) + Math.floor(J / 4) - 2 * J) % 7;
  // Zeller: 0=samedi, 1=dimanche, 2=lundi, 3=mardi, 4=mercredi, 5=jeudi, 6=vendredi
  const days = ["samedi", "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi"];
  return days[((h % 7) + 7) % 7];
}

export function compareDates(a, b) {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

export function calendarDaysBetween(a, b) {
  const utcA = Date.UTC(a.year, a.month - 1, a.day);
  const utcB = Date.UTC(b.year, b.month - 1, b.day);
  return Math.round(Math.abs(utcB - utcA) / 86400000);
}

export function addCalendarDays(date, amount) {
  const d = toUTCDate(date);
  d.setUTCDate(d.getUTCDate() + amount);
  return fromUTCDate(d);
}

export function addMonths(date, amount) {
  const totalMonths = date.year * 12 + (date.month - 1) + amount;
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonth = ((totalMonths % 12) + 12) % 12 + 1;
  const maxDay = daysInMonth(targetYear, targetMonth);
  const targetDay = Math.min(date.day, maxDay);
  return { year: targetYear, month: targetMonth, day: targetDay };
}

export function addYears(date, amount) {
  const targetYear = date.year + amount;
  const targetMonth = date.month;
  const maxDay = daysInMonth(targetYear, targetMonth);
  const targetDay = Math.min(date.day, maxDay);
  return { year: targetYear, month: targetMonth, day: targetDay };
}

export function iso(date) {
  return `${String(date.year).padStart(4, "0")}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

export function humanDate(date) {
  return `${String(date.day).padStart(2, "0")}/${String(date.month).padStart(2, "0")}/${date.year}`;
}

export function formatDuration(a, b) {
  if (typeof a === "number" && b === undefined) {
    const days = Math.abs(a);
    return {
      days,
      weeks: Math.floor(days / 7),
      remainingDays: days % 7,
      months: Math.floor(days / 30.4375),
      years: Math.floor(days / 365.25)
    };
  }

  let start = a, end = b;
  let inverted = false;
  if (compareDates(start, end) > 0) {
    start = b;
    end = a;
    inverted = true;
  }

  const totalDays = calendarDaysBetween(start, end);
  const weeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;

  // Years + months + days calculation
  let cursor = { ...start };
  let years = 0;
  let months = 0;

  while (compareDates(addYears(cursor, 1), end) <= 0) {
    cursor = addYears(cursor, 1);
    years++;
  }
  while (compareDates(addMonths(cursor, 1), end) <= 0) {
    cursor = addMonths(cursor, 1);
    months++;
  }
  const days = calendarDaysBetween(cursor, end);

  // Months + days breakdown
  let cursorM = { ...start };
  let totalMonths = 0;
  while (compareDates(addMonths(cursorM, 1), end) <= 0) {
    cursorM = addMonths(cursorM, 1);
    totalMonths++;
  }
  const daysAfterMonths = calendarDaysBetween(cursorM, end);

  return {
    years,
    months,
    days,
    totalMonths,
    daysAfterMonths,
    totalDays,
    weeks,
    remainingDays,
    inverted
  };
}
