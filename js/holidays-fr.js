import { addCalendarDays, iso } from "./date-utils.js";

function easterSunday(year) {
  // Anonymous Gregorian computus.
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

export function frenchPublicHolidays(year) {
  const easter = easterSunday(year);
  const holidays = [
    { ...easter, name: "Pâques" },
    { ...addCalendarDays(easter, 1), name: "Lundi de Pâques" },
    { year, month: 5, day: 1, name: "Fête du Travail" },
    { year, month: 5, day: 8, name: "Victoire 1945" },
    { ...addCalendarDays(easter, 39), name: "Ascension" },
    { ...addCalendarDays(easter, 50), name: "Lundi de Pentecôte" },
    { year, month: 7, day: 14, name: "Fête nationale" },
    { year, month: 8, day: 15, name: "Assomption" },
    { year, month: 11, day: 1, name: "Toussaint" },
    { year, month: 11, day: 11, name: "Armistice 1918" },
    { year, month: 12, day: 25, name: "Noël" },
    { year, month: 1, day: 1, name: "Jour de l'An" }
  ];
  return holidays;
}

export function holidaySet(year) {
  return new Set(frenchPublicHolidays(year).map(iso));
}
