import { addCalendarDays, iso, compareDates } from "./date-utils.js";

/**
 * Computes Easter Sunday for a given Gregorian year using the Meeus/Jones algorithm.
 * @param {number} year
 * @returns {{ year: number, month: number, day: number }}
 */
export function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { year, month, day };
}

/**
 * Returns the 11 statutory French public holidays for a given year.
 * @param {number} year
 * @returns {Array<{ date: string, name: string, year: number, month: number, day: number }>}
 */
export function frenchPublicHolidays(year) {
  const easter = easterSunday(year);
  const easterMonday = addCalendarDays(easter, 1);
  const ascension = addCalendarDays(easter, 39);
  const whitMonday = addCalendarDays(easter, 50);

  const rawHolidays = [
    { year, month: 1, day: 1, name: "Jour de l'An" },
    { ...easterMonday, name: "Lundi de Pâques" },
    { year, month: 5, day: 1, name: "Fête du Travail" },
    { year, month: 5, day: 8, name: "Victoire 1945" },
    { ...ascension, name: "Ascension" },
    { ...whitMonday, name: "Lundi de Pentecôte" },
    { year, month: 7, day: 14, name: "Fête nationale" },
    { year, month: 8, day: 15, name: "Assomption" },
    { year, month: 11, day: 1, name: "Toussaint" },
    { year, month: 11, day: 11, name: "Armistice 1918" },
    { year, month: 12, day: 25, name: "Noël" }
  ];

  const holidays = rawHolidays.map((item) => ({
    ...item,
    date: iso(item)
  }));

  holidays.sort((a, b) => compareDates(a, b));
  return holidays;
}

export const getFrenchHolidays = frenchPublicHolidays;

/**
 * Returns a Set of ISO date strings ("YYYY-MM-DD") representing the statutory public holidays for a year.
 * @param {number} year
 * @returns {Set<string>}
 */
export function holidaySet(year) {
  return new Set(frenchPublicHolidays(year).map((h) => h.date));
}
