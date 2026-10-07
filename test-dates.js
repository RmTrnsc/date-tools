#!/usr/bin/env node
/**
 * Test Suite for Date-Tools V2
 * Validates Section 22 of date-tools-v2-cahier-des-charges.md
 */

import {
  isLeapYear,
  daysInMonth,
  isValidDateParts,
  getDayOfWeek,
  calendarDaysBetween,
  addCalendarDays,
  addMonths,
  addYears,
  formatDuration,
  compareDates,
  iso,
  humanDate,
  parseISODate
} from "./js/date-utils.js";

import {
  easterSunday,
  frenchPublicHolidays,
  getFrenchHolidays,
  holidaySet
} from "./js/holidays-fr.js";

import {
  isBusinessDay,
  isWorkingDay,
  countBusinessDays,
  addBusinessDays
} from "./js/business-utils.js";

import {
  getISOWeek,
  getISOWeekRange
} from "./js/iso-week-utils.js";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  assert(actualStr === expectedStr, `${message} (expected: ${expectedStr}, got: ${actualStr})`);
}

function suite(name, fn) {
  console.log(`\n=== [Suite] ${name} ===`);
  fn();
}

console.log("Starting Date-Tools V2 Test Suite (Section 22 Verification)...\n");

// ==========================================
// 22.1 Jour de la semaine (Zeller's congruence)
// ==========================================
suite("22.1 Jour de la semaine (Congruence de Zeller)", () => {
  assertEqual(getDayOfWeek(1989, 1, 23), "lundi", "23/01/1989 -> lundi");
  assertEqual(getDayOfWeek(2000, 1, 1), "samedi", "01/01/2000 -> samedi");
  assertEqual(getDayOfWeek(2024, 2, 29), "jeudi", "29/02/2024 -> jeudi");
  assertEqual(getDayOfWeek(2026, 12, 31), "jeudi", "31/12/2026 -> jeudi");
  assertEqual(getDayOfWeek(2027, 1, 1), "vendredi", "01/01/2027 -> vendredi");
});

// ==========================================
// 22.2 Années bissextiles
// ==========================================
suite("22.2 Années bissextiles", () => {
  assert(isLeapYear(2024) === true, "2024 est bissextile");
  assert(isLeapYear(2025) === false, "2025 n'est pas bissextile");
  assert(isLeapYear(2028) === true, "2028 est bissextile");
  assert(isLeapYear(1900) === false, "1900 n'est pas bissextile (séculaire non divisible par 400)");
  assert(isLeapYear(2000) === true, "2000 est bissextile (séculaire divisible par 400)");

  assertEqual(daysInMonth(2024, 2), 29, "Février 2024 a 29 jours");
  assertEqual(daysInMonth(2025, 2), 28, "Février 2025 a 28 jours");
  assertEqual(daysInMonth(2028, 2), 29, "Février 2028 a 29 jours");

  assert(isValidDateParts(2024, 2, 29) === true, "29/02/2024 est une date valide");
  assert(isValidDateParts(2025, 2, 29) === false, "29/02/2025 est une date invalide");
  assert(isValidDateParts(2028, 2, 29) === true, "29/02/2028 est une date valide");
});

// ==========================================
// 22.3 Différence entre deux dates
// ==========================================
suite("22.3 Différence entre deux dates", () => {
  const d1 = { year: 2024, month: 1, day: 1 };
  const d2 = { year: 2024, month: 1, day: 10 };
  assertEqual(calendarDaysBetween(d1, d2), 9, "Différence calendaire 01/01/2024 -> 10/01/2024 = 9 jours");

  const leapStart = { year: 2024, month: 1, day: 1 };
  const leapEnd = { year: 2025, month: 1, day: 1 };
  assertEqual(calendarDaysBetween(leapStart, leapEnd), 366, "Différence année bissextile complète 2024 = 366 jours");

  const dur1 = formatDuration(d1, d2);
  assertEqual(dur1.totalDays, 9, "Total jours = 9");
  assertEqual(dur1.weeks, 1, "Semaines = 1");
  assertEqual(dur1.remainingDays, 2, "Jours restants = 2");

  const startM = { year: 2024, month: 1, day: 15 };
  const endM = { year: 2024, month: 3, day: 20 };
  const durM = formatDuration(startM, endM);
  assertEqual(durM.totalMonths, 2, "15/01/2024 à 20/03/2024 = 2 mois complets");
  assertEqual(durM.daysAfterMonths, 5, "et 5 jours restants");

  const startYMD = { year: 2020, month: 3, day: 15 };
  const endYMD = { year: 2023, month: 5, day: 20 };
  const durYMD = formatDuration(startYMD, endYMD);
  assertEqual(durYMD.years, 3, "15/03/2020 à 20/05/2023 = 3 ans");
  assertEqual(durYMD.months, 2, "2 mois");
  assertEqual(durYMD.days, 5, "5 jours");
});

// ==========================================
// 22.4 Ajouter / soustraire
// ==========================================
suite("22.4 Ajouter / soustraire des durées (avec serrage fin de mois)", () => {
  // 31 janvier 2026 + 1 mois = 28 février 2026
  const jan31_2026 = { year: 2026, month: 1, day: 31 };
  const feb28_2026 = addMonths(jan31_2026, 1);
  assertEqual(feb28_2026, { year: 2026, month: 2, day: 28 }, "31/01/2026 + 1 mois = 28/02/2026");

  // 31 janvier 2024 + 1 mois = 29 février 2024
  const jan31_2024 = { year: 2024, month: 1, day: 31 };
  const feb29_2024 = addMonths(jan31_2024, 1);
  assertEqual(feb29_2024, { year: 2024, month: 2, day: 29 }, "31/01/2024 + 1 mois = 29/02/2024");

  // 28 février 2025 + 1 mois = 28 mars 2025
  const feb28_2025 = { year: 2025, month: 2, day: 28 };
  const mar28_2025 = addMonths(feb28_2025, 1);
  assertEqual(mar28_2025, { year: 2025, month: 3, day: 28 }, "28/02/2025 + 1 mois = 28/03/2025");

  // 29 février 2024 + 1 an = 28 février 2025
  const leapDate = { year: 2024, month: 2, day: 29 };
  const clampedYear = addYears(leapDate, 1);
  assertEqual(clampedYear, { year: 2025, month: 2, day: 28 }, "29/02/2024 + 1 an = 28/02/2025 (serrage au 28)");

  // 29 février 2024 + 4 ans = 29 février 2028
  const leap4Years = addYears(leapDate, 4);
  assertEqual(leap4Years, { year: 2028, month: 2, day: 29 }, "29/02/2024 + 4 ans = 29/02/2028");

  // Soustraction: 31/03/2026 - 1 mois = 28/02/2026
  const mar31_2026 = { year: 2026, month: 3, day: 31 };
  const subMonth = addMonths(mar31_2026, -1);
  assertEqual(subMonth, { year: 2026, month: 2, day: 28 }, "31/03/2026 - 1 mois = 28/02/2026");
});

// ==========================================
// 22.5 Jours fériés français & Computus de Pâques
// ==========================================
suite("22.5 Jours fériés français (11 jours légaux & Pâques)", () => {
  // Pâques 2024, 2025, 2026
  assertEqual(easterSunday(2024), { year: 2024, month: 3, day: 31 }, "Pâques 2024 = 31/03/2024");
  assertEqual(easterSunday(2025), { year: 2025, month: 4, day: 20 }, "Pâques 2025 = 20/04/2025");
  assertEqual(easterSunday(2026), { year: 2026, month: 4, day: 5 }, "Pâques 2026 = 05/04/2026");

  // 11 jours fériés légaux
  const holidays2024 = frenchPublicHolidays(2024);
  assertEqual(holidays2024.length, 11, "Il y a exactement 11 jours fériés légaux en 2024");

  const set2024 = holidaySet(2024);
  assert(set2024.has("2024-01-01"), "Jour de l'An: 2024-01-01");
  assert(set2024.has("2024-04-01"), "Lundi de Pâques: 2024-04-01");
  assert(set2024.has("2024-05-01"), "Fête du Travail: 2024-05-01");
  assert(set2024.has("2024-05-08"), "Victoire 1945: 2024-05-08");
  assert(set2024.has("2024-05-09"), "Ascension: 2024-05-09");
  assert(set2024.has("2024-05-20"), "Lundi de Pentecôte: 2024-05-20");
  assert(set2024.has("2024-07-14"), "Fête nationale: 2024-07-14");
  assert(set2024.has("2024-08-15"), "Assomption: 2024-08-15");
  assert(set2024.has("2024-11-01"), "Toussaint: 2024-11-01");
  assert(set2024.has("2024-11-11"), "Armistice 1918: 2024-11-11");
  assert(set2024.has("2024-12-25"), "Noël: 2024-12-25");

  // Alias getFrenchHolidays
  assertEqual(getFrenchHolidays(2025).length, 11, "Alias getFrenchHolidays retourne 11 fériés");
});

// ==========================================
// 22.6 Jours ouvrés
// ==========================================
suite("22.6 Jours ouvrés (comptage, décalage, week-ends, fériés)", () => {
  // Vendredi 13/03/2026 à Lundi 16/03/2026 (vendredi, samedi, dimanche, lundi)
  const fri = { year: 2026, month: 3, day: 13 };
  const mon = { year: 2026, month: 3, day: 16 };
  const resWeekend = countBusinessDays(fri, mon, { includeSaturday: false, excludeHolidays: true });
  assertEqual(resWeekend.calendarDays, 4, "4 jours calendaires (ven à lun)");
  assertEqual(resWeekend.businessDays, 2, "2 jours ouvrés (ven et lun, sam/dim exclus)");
  assertEqual(resWeekend.weekendDays, 2, "2 jours de week-end");

  // Vendredi 13/03/2026 + 1 jour ouvré -> Lundi 16/03/2026
  const add1 = addBusinessDays(fri, 1);
  assertEqual(add1, mon, "Vendredi 13/03/2026 + 1 jour ouvré -> Lundi 16/03/2026");

  // Lundi 16/03/2026 - 1 jour ouvré -> Vendredi 13/03/2026
  const sub1 = addBusinessDays(mon, -1);
  assertEqual(sub1, fri, "Lundi 16/03/2026 - 1 jour ouvré -> Vendredi 13/03/2026");

  // Jours fériés exclus: Vendredi 01/05/2026 (Fête du travail) à Lundi 04/05/2026
  const friMay1 = { year: 2026, month: 5, day: 1 };
  const monMay4 = { year: 2026, month: 5, day: 4 };
  const resMay = countBusinessDays(friMay1, monMay4, { includeSaturday: false, excludeHolidays: true });
  assertEqual(resMay.calendarDays, 4, "01/05 au 04/05 = 4 jours calendaires");
  assertEqual(resMay.holidayDays, 1, "1 jour férié rencontré (01/05)");
  assertEqual(resMay.businessDays, 1, "1 seul jour ouvré (le lundi 04/05)");

  // Période traversant un mois:
  // Vendredi 30/10/2026 + 2 jours ouvrés:
  // Sam 31/10 (WE), Dim 01/11 (WE), Lun 02/11 (J1), Mar 03/11 (J2) -> 03/11/2026
  const friOct30 = { year: 2026, month: 10, day: 30 };
  const addCrossMonth = addBusinessDays(friOct30, 2);
  assertEqual(addCrossMonth, { year: 2026, month: 11, day: 3 }, "Traversée de mois: 30/10/2026 + 2 j ouvrés = 03/11/2026");

  // Période traversant une année:
  // Mercredi 30/12/2026 + 3 jours ouvrés:
  // Jeu 31/12 (J1), Ven 01/01/2027 (Férié ignoré), Sam 02/01 (WE), Dim 03/01 (WE), Lun 04/01 (J2), Mar 05/01 (J3) -> 05/01/2027
  const wedDec30 = { year: 2026, month: 12, day: 30 };
  const addCrossYear = addBusinessDays(wedDec30, 3);
  assertEqual(addCrossYear, { year: 2027, month: 1, day: 5 }, "Traversée d'année: 30/12/2026 + 3 j ouvrés = 05/01/2027");
});

// ==========================================
// 22.7 Numéros de semaine ISO 8601
// ==========================================
suite("22.7 Numéros de semaine ISO 8601", () => {
  // 31/12/2026 -> W53 2026
  assertEqual(getISOWeek(2026, 12, 31), { isoYear: 2026, week: 53 }, "31/12/2026 -> W53 2026");

  // 01/01/2027 -> W53 2026
  assertEqual(getISOWeek(2027, 1, 1), { isoYear: 2026, week: 53 }, "01/01/2027 -> W53 2026");

  // 04/01/2027 -> W01 2027
  assertEqual(getISOWeek(2027, 1, 4), { isoYear: 2027, week: 1 }, "04/01/2027 -> W01 2027");

  // 01/01/2024 -> W01 2024
  assertEqual(getISOWeek(2024, 1, 1), { isoYear: 2024, week: 1 }, "01/01/2024 -> W01 2024");

  // getISOWeekRange
  const range2026_53 = getISOWeekRange(2026, 53);
  assertEqual(range2026_53.start, { year: 2026, month: 12, day: 28 }, "W53 2026 débute le lundi 28/12/2026");
  assertEqual(range2026_53.end, { year: 2027, month: 1, day: 3 }, "W53 2026 se termine le dimanche 03/01/2027");

  const range2027_01 = getISOWeekRange(2027, 1);
  assertEqual(range2027_01.start, { year: 2027, month: 1, day: 4 }, "W01 2027 débute le lundi 04/01/2027");
  assertEqual(range2027_01.end, { year: 2027, month: 1, day: 10 }, "W01 2027 se termine le dimanche 10/01/2027");
});

// ==========================================
// 22.8 Dans combien de temps & Âge précis
// ==========================================
suite("22.8 Dans combien de temps & Âge précis", () => {
  // Âge exact avec anniversaire
  const birth = { year: 1990, month: 5, day: 15 };
  const targetSameDay = { year: 2025, month: 5, day: 15 };
  const ageExact = formatDuration(birth, targetSameDay);
  assertEqual(ageExact.years, 35, "Anniversaire exact: 35 ans");
  assertEqual(ageExact.months, 0, "0 mois");
  assertEqual(ageExact.days, 0, "0 jours");

  const targetLater = { year: 2025, month: 6, day: 20 };
  const ageLater = formatDuration(birth, targetLater);
  assertEqual(ageLater.years, 35, "35 ans");
  assertEqual(ageLater.months, 1, "1 mois");
  assertEqual(ageLater.days, 5, "5 jours");

  // Âge né le 29 février 2000
  const leapBirth = { year: 2000, month: 2, day: 29 };
  const leapCheckNonLeap = { year: 2025, month: 3, day: 1 };
  const ageLeap = formatDuration(leapBirth, leapCheckNonLeap);
  assertEqual(ageLeap.years, 25, "Né le 29/02/2000 au 01/03/2025: 25 ans");
  assertEqual(ageLeap.months, 0, "0 mois");
  assertEqual(ageLeap.days, 1, "1 jour");
});

// ==========================================
// SUMMARY
// ==========================================
console.log("\n==========================================");
console.log(`Test Execution Summary:`);
console.log(`  Total assertions : ${totalTests}`);
console.log(`  Passed           : ${passedTests}`);
console.log(`  Failed           : ${failedTests}`);
console.log("==========================================\n");

if (failedTests > 0) {
  console.error(`💥 FAILURE: ${failedTests} test(s) failed.`);
  process.exit(1);
} else {
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! (Exit code: 0)");
  process.exit(0);
}
