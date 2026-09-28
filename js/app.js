import {
  MONTHS,
  WEEKDAYS,
  parseISODate,
  isValidDateParts,
  toUTCDate,
  fromUTCDate,
  humanDate,
  calendarDaysBetween,
  addCalendarDays,
  addMonths,
  addYears,
  formatDuration,
  iso,
} from "./date-utils.js";
import { holidaySet } from "./holidays-fr.js";

const $ = (id) => document.getElementById(id);
const tabs = document.querySelectorAll(".tab");
const tabIndicator = document.querySelector(".tab-indicator");
const panels = document.querySelectorAll(".panel");

function moveIndicator(tab) {
  tabIndicator.style.width = `${tab.offsetWidth}px`;
  tabIndicator.style.transform = `translateX(${tab.offsetLeft}px)`;

  const tabsContainer = document.querySelector(".tabs");
  const tabRect = tab.getBoundingClientRect();
  const containerRect = tabsContainer.getBoundingClientRect();
  const x = tabRect.left - containerRect.left;
}

window.addEventListener("load", () => {
  const activeTab = document.querySelector(".tab.active");
  if (activeTab) {
    moveIndicator(activeTab);
  }
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.toggle("active", t === tab));
    moveIndicator(tab);
    panels.forEach((p) =>
      p.classList.toggle("active", p.id === tab.dataset.tab),
    );
  });
});

function show(id, html) {
  $(id).innerHTML = html;
}

function zeller(day, month, year) {
  if (month < 3) {
    month += 12;
    year--;
  }
  const K = year % 100;
  const J = Math.floor(year / 100);
  const h =
    (day +
      Math.floor((13 * (month + 1)) / 5) +
      K +
      Math.floor(K / 4) +
      Math.floor(J / 4) -
      2 * J) %
    7;
  return [
    "samedi",
    "dimanche",
    "lundi",
    "mardi",
    "mercredi",
    "jeudi",
    "vendredi",
  ][h];
}

// 1 — Jour de la semaine
$("weekday-calculate").addEventListener("click", () => {
  const day = Number($("weekday-day").value);
  const month = Number($("weekday-month").value);
  const year = Number($("weekday-year").value);

  if (!isValidDateParts(year, month, day)) {
    show("weekday-result", `<strong>Date invalide.</strong>`);
    return;
  }

  const weekday = zeller(day, month, year);
  show(
    "weekday-result",
    `
    <div class="big">${weekday}</div>
    <div class="muted">${day} ${MONTHS[month - 1]} ${year}</div>
  `,
  );
});

// 2 — Différence
$("diff-calculate").addEventListener("click", () => {
  const a = parseISODate($("diff-start").value);
  const b = parseISODate($("diff-end").value);

  if (!a || !b) {
    show("diff-result", `<strong>Choisissez les deux dates.</strong>`);
    return;
  }

  const days = calendarDaysBetween(a, b);
  const duration = formatDuration(a, b);

  show(
    "diff-result",
    `
    <div class="result-grid">
      <div class="stat"><strong>${days}</strong><span>jours calendaires</span></div>
      <div class="stat"><strong>${Math.floor(days / 7)} sem. + ${days % 7} j.</strong><span>semaines et jours</span></div>
      <div class="stat"><strong>${duration.years}</strong><span>année(s) complète(s)</span></div>
      <div class="stat"><strong>${duration.months}</strong><span>mois après les années complètes</span></div>
    </div>
  `,
  );
});

// 3 — Ajouter / retirer
$("add-calculate").addEventListener("click", () => {
  const start = parseISODate($("add-date").value);
  const value = Number($("add-value").value);
  const operation = $("add-operation").value;
  const unit = $("add-unit").value;

  if (!start || !Number.isFinite(value) || value < 0) {
    show("add-result", `<strong>Vérifiez la date et la durée.</strong>`);
    return;
  }

  const signed = operation === "add" ? value : -value;
  let result;

  if (unit === "days") result = addCalendarDays(start, signed);
  if (unit === "weeks") result = addCalendarDays(start, signed * 7);
  if (unit === "months") result = addMonths(start, signed);
  if (unit === "years") result = addYears(start, signed);

  show(
    "add-result",
    `
    <div class="big">${humanDate(result)}</div>
    <div class="muted">${WEEKDAYS[toUTCDate(result).getUTCDay()]} — résultat calendaire</div>
  `,
  );
});

// 4 — Jours ouvrés / ouvrables
function countBusiness(start, end, excludeHolidays, saturdayIsWorking) {
  let a = toUTCDate(start),
    b = toUTCDate(end);
  if (a > b) [a, b] = [b, a];

  let calendar = 0,
    working = 0,
    workingDaysOpen = 0,
    holidays = 0;
  const holidayYears = new Map();

  for (let d = new Date(a); d <= b; d.setUTCDate(d.getUTCDate() + 1)) {
    calendar++;
    const current = fromUTCDate(d);
    const weekday = d.getUTCDay();
    const isSunday = weekday === 0;
    const isSaturday = weekday === 6;
    const set = holidayYears.get(current.year) ?? holidaySet(current.year);
    holidayYears.set(current.year, set);
    const isHoliday = set.has(iso(current));

    if (isHoliday) holidays++;

    // Ouvrable : lundi-samedi, hors dimanche et jours fériés exclus.
    if (!isSunday && !(excludeHolidays && isHoliday)) workingDaysOpen++;

    // Ouvré : lundi-vendredi par défaut, samedi optionnel.
    const weekdayAllowed = saturdayIsWorking
      ? !isSunday
      : !isSunday && !isSaturday;
    if (weekdayAllowed && !(excludeHolidays && isHoliday)) working++;
  }

  return { calendar, working, workingDaysOpen, holidays };
}

$("business-calculate").addEventListener("click", () => {
  const start = parseISODate($("business-start").value);
  const end = parseISODate($("business-end").value);

  if (!start || !end) {
    show("business-result", `<strong>Choisissez les deux dates.</strong>`);
    return;
  }

  const data = countBusiness(
    start,
    end,
    $("business-holidays").checked,
    $("business-saturday").checked,
  );

  show(
    "business-result",
    `
    <div class="result-grid">
      <div class="stat"><strong>${data.calendar}</strong><span>jours calendaires</span></div>
      <div class="stat"><strong>${data.working}</strong><span>jours ouvrés</span></div>
      <div class="stat"><strong>${data.workingDaysOpen}</strong><span>jours ouvrables</span></div>
      <div class="stat"><strong>${data.holidays}</strong><span>jours fériés rencontrés</span></div>
    </div>
  `,
  );
});

// Valeurs par défaut : aujourd'hui et aujourd'hui + 30 jours.
const today = new Date();
const todayParts = {
  year: today.getFullYear(),
  month: today.getMonth() + 1,
  day: today.getDate(),
};
const future = addCalendarDays(todayParts, 30);

$("diff-start").value = iso(todayParts);
$("diff-end").value = iso(future);
$("add-date").value = iso(todayParts);
$("business-start").value = iso(todayParts);
$("business-end").value = iso(future);
