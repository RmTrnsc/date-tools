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
  getDayOfWeek,
  compareDates,
  daysInMonth
} from "./date-utils.js";

import {
  frenchPublicHolidays,
  holidaySet
} from "./holidays-fr.js";

import {
  countBusinessDays,
  addBusinessDays,
  isBusinessDay
} from "./business-utils.js";

import {
  getISOWeek,
  getISOWeekRange
} from "./iso-week-utils.js";

import {
  getFactForDate,
  getFactForDuration,
  buildCultureHtml
} from "./culture.js";

const $ = (id) => document.getElementById(id);

function show(id, html) {
  const el = $(id);
  if (el) {
    el.innerHTML = html;
  }
}

// ==========================================
// TWO-TIER NAVIGATION & INDICATORS
// ==========================================

const categoryIndicator = document.getElementById("category-indicator");
const categoryTabs = document.querySelectorAll(".tabs-categories .tab");
const subtabsContainers = document.querySelectorAll(".tabs-sub");
const panels = document.querySelectorAll(".panel");

function moveIndicator(indicator, tab, skipAnimation = false) {
  if (!indicator || !tab) return;
  
  if (skipAnimation) {
    indicator.style.transition = 'none';
  }
  
  indicator.style.width = `${tab.offsetWidth}px`;
  indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
  
  if (skipAnimation) {
    indicator.offsetHeight; // trigger reflow
    indicator.style.transition = '';
  }
}

function updateActiveIndicators(skipAnimation = false) {
  const activeCategoryTab = document.querySelector(".tabs-categories .tab.active");
  if (activeCategoryTab) {
    moveIndicator(categoryIndicator, activeCategoryTab, skipAnimation);
  }

  const activeSubContainer = document.querySelector(".tabs-sub:not([hidden])");
  if (activeSubContainer) {
    const subIndicator = activeSubContainer.querySelector(".tab-indicator");
    const activeSubTab = activeSubContainer.querySelector(".tab.active");
    if (subIndicator && activeSubTab) {
      moveIndicator(subIndicator, activeSubTab, skipAnimation);
    }
  }
}

function activatePanel(tabId) {
  panels.forEach((p) => {
    p.classList.toggle("active", p.id === tabId);
  });
}

// Category Tab Switching (Tier 1)
categoryTabs.forEach((catTab) => {
  catTab.addEventListener("click", () => {
    categoryTabs.forEach((t) => t.classList.toggle("active", t === catTab));
    moveIndicator(categoryIndicator, catTab);

    const category = catTab.dataset.category;

    subtabsContainers.forEach((container) => {
      const match = container.dataset.category === category;
      if (match) {
        container.removeAttribute("hidden");
        container.classList.add("active");

        let activeSubTab = container.querySelector(".tab.active");
        if (!activeSubTab) {
          activeSubTab = container.querySelector(".tab");
          if (activeSubTab) activeSubTab.classList.add("active");
        }

        const subIndicator = container.querySelector(".tab-indicator");
        if (subIndicator && activeSubTab) {
          // Slight delay to allow DOM render before geometry calculation
          requestAnimationFrame(() => {
            moveIndicator(subIndicator, activeSubTab, true);
          });
        }

        if (activeSubTab && activeSubTab.dataset.tab) {
          activatePanel(activeSubTab.dataset.tab);
        }
      } else {
        container.setAttribute("hidden", "");
        container.classList.remove("active");
      }
    });
  });
});

// Sub-Tab Switching (Tier 2)
subtabsContainers.forEach((container) => {
  const subTabs = container.querySelectorAll(".tab");
  const subIndicator = container.querySelector(".tab-indicator");

  subTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      subTabs.forEach((t) => t.classList.toggle("active", t === tab));
      moveIndicator(subIndicator, tab);
      if (tab.dataset.tab) {
        activatePanel(tab.dataset.tab);
      }
    });
  });
});

// Window events for responsive indicator adjustment
window.addEventListener("load", () => {
  updateActiveIndicators(true);
});

window.addEventListener("resize", () => {
  updateActiveIndicators(true);
});

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    updateActiveIndicators(true);
  });
}

// Execute immediately in case DOM is already loaded
updateActiveIndicators(true);

// ==========================================
// TOOL 1 — JOUR DE LA SEMAINE
// ==========================================
const btnWeekday = $("weekday-calculate");
if (btnWeekday) {
  btnWeekday.addEventListener("click", async () => {
    const day = Number($("weekday-day").value);
    const month = Number($("weekday-month").value);
    const year = Number($("weekday-year").value);

    if (!isValidDateParts(year, month, day)) {
      show("weekday-result", `<strong>Date invalide.</strong>`);
      return;
    }

    const weekday = getDayOfWeek(year, month, day);
    
    show(
      "weekday-result",
      `
      <div class="big">${weekday}</div>
      <div class="muted">${day} ${MONTHS[month - 1]} ${year}</div>
      <div class="muted" style="margin-top: 10px;"><span class="loading-dots">Recherche d'une anecdote historique</span></div>
    `
    );

    const fact = await getFactForDate(day, month, year);
    show(
      "weekday-result",
      `
      <div class="big">${weekday}</div>
      <div class="muted">${day} ${MONTHS[month - 1]} ${year}</div>
      ${buildCultureHtml(fact)}
    `
    );
  });
}

// ==========================================
// TOOL 2 — DIFFERENCE ENTRE DEUX DATES
// ==========================================
const btnDiff = $("diff-calculate");
if (btnDiff) {
  btnDiff.addEventListener("click", async () => {
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
      <div class="muted" style="margin-top: 10px;"><span class="loading-dots">Recherche d'une anecdote historique</span></div>
    `
    );

    let fact = getFactForDuration(days);
    if (!fact) {
      fact = await getFactForDate(b.day, b.month, b.year);
    }

    show(
      "diff-result",
      `
      <div class="result-grid">
        <div class="stat"><strong>${days}</strong><span>jours calendaires</span></div>
        <div class="stat"><strong>${Math.floor(days / 7)} sem. + ${days % 7} j.</strong><span>semaines et jours</span></div>
        <div class="stat"><strong>${duration.years}</strong><span>année(s) complète(s)</span></div>
        <div class="stat"><strong>${duration.months}</strong><span>mois après les années complètes</span></div>
      </div>
      ${buildCultureHtml(fact)}
    `
    );
  });
}

// ==========================================
// TOOL 3 — AJOUTER / RETIRER
// ==========================================
const btnAdd = $("add-calculate");
if (btnAdd) {
  btnAdd.addEventListener("click", async () => {
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

    const dow = getDayOfWeek(result.year, result.month, result.day);
    
    show(
      "add-result",
      `
      <div class="big">${humanDate(result)}</div>
      <div class="muted">${dow} — résultat calendaire</div>
      <div class="muted" style="margin-top: 10px;"><span class="loading-dots">Recherche d'une anecdote historique</span></div>
    `
    );

    let fact = null;
    if (unit === "days") fact = getFactForDuration(value);
    if (!fact) fact = await getFactForDate(result.day, result.month, result.year);

    show(
      "add-result",
      `
      <div class="big">${humanDate(result)}</div>
      <div class="muted">${dow} — résultat calendaire</div>
      ${buildCultureHtml(fact)}
    `
    );
  });
}

// ==========================================
// TOOL 4 — DANS COMBIEN DE TEMPS ?
// ==========================================
const btnRel = $("rel-calculate");
if (btnRel) {
  btnRel.addEventListener("click", async () => {
    const target = parseISODate($("rel-target").value);
    const baseVal = $("rel-base").value;
    const base = baseVal ? parseISODate(baseVal) : todayParts;

    if (!target || !base) {
      show("rel-result", `<strong>Veuillez sélectionner une date cible valide.</strong>`);
      return;
    }

    const diff = calendarDaysBetween(base, target);
    const isFuture = compareDates(target, base) > 0;
    const isToday = compareDates(target, base) === 0;
    const weeks = Math.floor(diff / 7);
    const remDays = diff % 7;

    if (isToday) {
      show(
        "rel-result",
        `
        <div class="big">C'est aujourd'hui !</div>
        <div class="muted" style="margin-top: 10px;"><span class="loading-dots">Recherche d'une anecdote historique</span></div>
        `
      );
    } else {
      const prefix = isFuture ? "Dans" : "Il y a";
      show(
        "rel-result",
        `
        <div class="big">${prefix} ${diff} jour${diff > 1 ? "s" : ""}</div>
        <div class="muted">Soit environ ${weeks} semaine${weeks > 1 ? "s" : ""} ${remDays > 0 ? `et ${remDays} jour${remDays > 1 ? "s" : ""}` : ""}</div>
        <div class="muted" style="margin-top: 10px;"><span class="loading-dots">Recherche d'une anecdote historique</span></div>
      `
      );
    }

    let fact = getFactForDuration(diff);
    if (!fact) {
      fact = await getFactForDate(target.day, target.month, target.year);
    }

    if (isToday) {
      show("rel-result", `<div class="big">C'est aujourd'hui !</div>${buildCultureHtml(fact)}`);
      return;
    }

    const prefix = isFuture ? "Dans" : "Il y a";
    show(
      "rel-result",
      `
      <div class="big">${prefix} ${diff} jour${diff > 1 ? "s" : ""}</div>
      <div class="muted">Soit environ ${weeks} semaine${weeks > 1 ? "s" : ""} ${remDays > 0 ? `et ${remDays} jour${remDays > 1 ? "s" : ""}` : ""}</div>
      ${buildCultureHtml(fact)}
    `
    );
  });
}

// ==========================================
// TOOL 5 — ÂGE / ANNIVERSAIRE
// ==========================================
const btnAge = $("age-calculate");
if (btnAge) {
  btnAge.addEventListener("click", async () => {
    const birth = parseISODate($("age-birth").value);
    const targetVal = $("age-target").value;
    const target = targetVal ? parseISODate(targetVal) : todayParts;

    if (!birth || !target) {
      show("age-result", `<strong>Veuillez indiquer une date de naissance.</strong>`);
      return;
    }

    if (compareDates(birth, target) > 0) {
      show("age-result", `<strong>La date de naissance est dans le futur.</strong>`);
      return;
    }

    const dur = formatDuration(birth, target);
    const birthDow = getDayOfWeek(birth.year, birth.month, birth.day);

    // Next birthday calculation
    let nextBdayYear = target.year;
    let nextBday = { year: nextBdayYear, month: birth.month, day: birth.day };
    if (!isValidDateParts(nextBdayYear, birth.month, birth.day)) {
      nextBday = { year: nextBdayYear, month: 2, day: 28 };
    }
    if (compareDates(nextBday, target) < 0) {
      nextBdayYear++;
      nextBday = { year: nextBdayYear, month: birth.month, day: birth.day };
      if (!isValidDateParts(nextBdayYear, birth.month, birth.day)) {
        nextBday = { year: nextBdayYear, month: 2, day: 28 };
      }
    }
    const daysToNext = calendarDaysBetween(target, nextBday);
    
    show(
      "age-result",
      `
      <div class="result-grid">
        <div class="stat"><strong>${dur.years} ans</strong><span>${dur.months} mois et ${dur.days} jours</span></div>
        <div class="stat"><strong>${dur.totalDays}</strong><span>jours vécus au total</span></div>
        <div class="stat"><strong>${humanDate(nextBday)}</strong><span>prochain anniversaire (dans ${daysToNext} j.)</span></div>
        <div class="stat"><strong>${birthDow}</strong><span>jour de naissance</span></div>
      </div>
      <div class="muted" style="margin-top: 10px;"><span class="loading-dots">Recherche d'une anecdote historique</span></div>
    `
    );

    const fact = await getFactForDate(birth.day, birth.month, birth.year);

    show(
      "age-result",
      `
      <div class="result-grid">
        <div class="stat"><strong>${dur.years} ans</strong><span>${dur.months} mois et ${dur.days} jours</span></div>
        <div class="stat"><strong>${dur.totalDays}</strong><span>jours vécus au total</span></div>
        <div class="stat"><strong>${humanDate(nextBday)}</strong><span>prochain anniversaire (dans ${daysToNext} j.)</span></div>
        <div class="stat"><strong>${birthDow}</strong><span>jour de naissance</span></div>
      </div>
      ${buildCultureHtml(fact)}
    `
    );
  });
}

// ==========================================
// TOOL 6 — NUMERO DE SEMAINE ISO 8601
// ==========================================
const btnIsoWeek = $("isoweek-calculate");
if (btnIsoWeek) {
  btnIsoWeek.addEventListener("click", () => {
    const date = parseISODate($("isoweek-date").value);
    if (!date) {
      show("isoweek-result", `<strong>Veuillez sélectionner une date.</strong>`);
      return;
    }

    const { isoYear, week } = getISOWeek(date.year, date.month, date.day);
    const { start, end } = getISOWeekRange(isoYear, week);

    show(
      "isoweek-result",
      `
      <div class="big">Semaine ${String(week).padStart(2, "0")} — ${isoYear}</div>
      <div class="muted">Du lundi ${humanDate(start)} au dimanche ${humanDate(end)}</div>
    `
    );
  });
}

// ==========================================
// TOOL 7 — TROUVER UNE DATE
// ==========================================
const btnFind = $("find-calculate");
if (btnFind) {
  btnFind.addEventListener("click", async () => {
    const start = parseISODate($("find-date-input").value) || todayParts;
    const offset = Number($("find-offset").value);

    if (!Number.isFinite(offset)) {
      show("find-result", `<strong>Veuillez indiquer un nombre de jours valide.</strong>`);
      return;
    }

    const res = addCalendarDays(start, offset);
    const dow = getDayOfWeek(res.year, res.month, res.day);
    
    show(
      "find-result",
      `
      <div class="big">${humanDate(res)}</div>
      <div class="muted">${dow} (${offset >= 0 ? "+" : ""}${offset} jours depuis le ${humanDate(start)})</div>
      <div class="muted" style="margin-top: 10px;"><span class="loading-dots">Recherche d'une anecdote historique</span></div>
    `
    );

    let fact = getFactForDuration(Math.abs(offset));
    if (!fact) {
      fact = await getFactForDate(res.day, res.month, res.year);
    }

    show(
      "find-result",
      `
      <div class="big">${humanDate(res)}</div>
      <div class="muted">${dow} (${offset >= 0 ? "+" : ""}${offset} jours depuis le ${humanDate(start)})</div>
      ${buildCultureHtml(fact)}
    `
    );
  });
}

// ==========================================
// TOOL 8 — JOURS OUVRES
// ==========================================
const btnBusiness = $("business-calculate");
if (btnBusiness) {
  btnBusiness.addEventListener("click", () => {
    const start = parseISODate($("business-start").value);
    const end = parseISODate($("business-end").value);

    if (!start || !end) {
      show("business-result", `<strong>Choisissez les deux dates.</strong>`);
      return;
    }

    const data = countBusinessDays(start, end, {
      excludeHolidays: $("business-holidays").checked,
      includeSaturday: $("business-saturday").checked
    });

    show(
      "business-result",
      `
      <div class="result-grid">
        <div class="stat"><strong>${data.calendarDays}</strong><span>jours calendaires</span></div>
        <div class="stat"><strong>${data.businessDays}</strong><span>jours ouvrés</span></div>
        <div class="stat"><strong>${data.workingDaysOpen}</strong><span>jours ouvrables</span></div>
        <div class="stat"><strong>${data.holidayDays}</strong><span>jours fériés rencontrés</span></div>
      </div>
    `
    );
  });
}

// ==========================================
// TOOL 9 — AJOUTER / RETIRER OUVRES
// ==========================================
const btnBAdd = $("badd-calculate");
if (btnBAdd) {
  btnBAdd.addEventListener("click", () => {
    const date = parseISODate($("badd-date").value);
    const count = Number($("badd-count").value);

    if (!date || !Number.isFinite(count)) {
      show("badd-result", `<strong>Veuillez indiquer une date et un nombre de jours.</strong>`);
      return;
    }

    const target = addBusinessDays(date, count, {
      excludeHolidays: $("badd-holidays").checked,
      includeSaturday: $("badd-saturday").checked
    });
    const dow = getDayOfWeek(target.year, target.month, target.day);

    show(
      "badd-result",
      `
      <div class="big">${humanDate(target)}</div>
      <div class="muted">${dow} (${count >= 0 ? "+" : ""}${count} jours ouvrés)</div>
    `
    );
  });
}

// ==========================================
// TOOL 10 — CONGES
// ==========================================
const btnVacation = $("vacation-calculate");
if (btnVacation) {
  btnVacation.addEventListener("click", () => {
    const start = parseISODate($("vacation-start").value);
    const end = parseISODate($("vacation-end").value);

    if (!start || !end) {
      show("vacation-result", `<strong>Sélectionnez la période de congés.</strong>`);
      return;
    }

    const counts = countBusinessDays(start, end, { includeSaturday: false, excludeHolidays: true });
    const returnDate = addBusinessDays(end, 1, { includeSaturday: false, excludeHolidays: true });
    const returnDow = getDayOfWeek(returnDate.year, returnDate.month, returnDate.day);

    show(
      "vacation-result",
      `
      <div class="result-grid">
        <div class="stat"><strong>${counts.businessDays}</strong><span>jours ouvrés à poser</span></div>
        <div class="stat"><strong>${counts.calendarDays}</strong><span>jours d'absence au total</span></div>
        <div class="stat"><strong>${humanDate(returnDate)}</strong><span>reprise du travail (${returnDow})</span></div>
        <div class="stat"><strong>${counts.holidayDays}</strong><span>férié(s) pendant le congé</span></div>
      </div>
    `
    );
  });
}

// ==========================================
// TOOL 11 — ECHEANCE
// ==========================================
const btnDeadline = $("deadline-calculate");
if (btnDeadline) {
  btnDeadline.addEventListener("click", () => {
    const date = parseISODate($("deadline-date").value);
    const days = Number($("deadline-days").value);

    if (!date || !Number.isFinite(days)) {
      show("deadline-result", `<strong>Indiquez une date et un délai.</strong>`);
      return;
    }

    const calTarget = addCalendarDays(date, days);
    const busTarget = addBusinessDays(date, days, { includeSaturday: false, excludeHolidays: true });

    show(
      "deadline-result",
      `
      <div class="result-grid">
        <div class="stat"><strong>${humanDate(calTarget)}</strong><span>délai calendaire (${days} j.)</span></div>
        <div class="stat"><strong>${humanDate(busTarget)}</strong><span>délai en jours ouvrés (${days} j.)</span></div>
      </div>
    `
    );
  });
}

// ==========================================
// TOOL 12 — PREAVIS
// ==========================================
const btnNotice = $("notice-calculate");
if (btnNotice) {
  btnNotice.addEventListener("click", () => {
    const date = parseISODate($("notice-date").value);
    const months = Number($("notice-months").value);

    if (!date || !Number.isFinite(months)) {
      show("notice-result", `<strong>Indiquez une date de notification et les mois de préavis.</strong>`);
      return;
    }

    const endDate = addMonths(date, months);
    const dow = getDayOfWeek(endDate.year, endDate.month, endDate.day);

    show(
      "notice-result",
      `
      <div class="big">${humanDate(endDate)} (${dow})</div>
      <div class="muted">Fin théorique de préavis (règle générale de date à date). Vérifiez les dispositions conventionnelles applicables.</div>
    `
    );
  });
}

// ==========================================
// TOOL 13 — LISTE JOURS FERIES
// ==========================================
const btnHolidays = $("holidays-calculate");
if (btnHolidays) {
  btnHolidays.addEventListener("click", () => {
    const year = Number($("holidays-year").value) || 2026;
    const holidays = frenchPublicHolidays(year);

    const rows = holidays
      .map((h) => {
        const dow = getDayOfWeek(h.year, h.month, h.day);
        return `<div class="stat" style="margin-bottom: 6px;"><strong>${humanDate(h)} (${dow})</strong><span>${h.name}</span></div>`;
      })
      .join("");

    show("holidays-result", `<div style="display: grid; gap: 8px;">${rows}</div>`);
  });
}

// ==========================================
// TOOL 14 — CALENDRIER MENSUEL
// ==========================================
const btnCalMonth = $("cal-month-view");
if (btnCalMonth) {
  btnCalMonth.addEventListener("click", () => {
    const month = Number($("cal-month-select").value);
    const year = Number($("cal-year-input").value);
    const daysCount = daysInMonth(year, month);
    const hSet = holidaySet(year);

    const firstDowStr = getDayOfWeek(year, month, 1);
    const dowMap = { lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6, dimanche: 7 };
    const firstCol = dowMap[firstDowStr] || 1;
    const weeksCount = Math.ceil(((firstCol - 1) + daysCount) / 7);

    let html = `<div class="result-grid" style="margin-bottom: 16px;">`;
    html += `<div class="stat"><strong>${MONTHS[month - 1].toUpperCase()} ${year}</strong><span>${daysCount} jours</span></div>`;
    html += `<div class="stat"><strong>${weeksCount}</strong><span>semaines (sur le calendrier)</span></div>`;
    html += `</div>`;
    html += `<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; font-size: 0.8rem; text-align: center;">`;

    const weekLabels = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];
    weekLabels.forEach((w) => {
      html += `<div style="font-weight: 700; color: #6b7280; padding: 4px 0;">${w}</div>`;
    });

    for (let i = 1; i < firstCol; i++) {
      html += `<div></div>`;
    }

    for (let d = 1; d <= daysCount; d++) {
      const isHoli = hSet.has(iso({ year, month, day: d }));
      const dow = getDayOfWeek(year, month, d);
      const isWeekend = dow === "samedi" || dow === "dimanche";

      let bg = "#ffffff";
      let color = "#20242b";
      if (isHoli) {
        bg = "#fef3c7";
        color = "#92400e";
      } else if (isWeekend) {
        bg = "#f3f4f6";
        color = "#6b7280";
      }

      html += `<div style="padding: 8px 4px; background: ${bg}; color: ${color}; border-radius: 6px; font-weight: 600;">${d}</div>`;
    }

    html += `</div>`;
    show("cal-month-result", html);
  });
}

// ==========================================
// TOOL 15 — CALENDRIER ANNUEL
// ==========================================
const btnCalAnnual = $("cal-annual-view");
if (btnCalAnnual) {
  btnCalAnnual.addEventListener("click", () => {
    const year = Number($("cal-annual-year").value) || 2026;
    const isLeap = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));

    const dowMap = { lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6, dimanche: 7 };

    let html = `<div class="result-grid">`;
    MONTHS.forEach((mName, idx) => {
      const m = idx + 1;
      const count = daysInMonth(year, m);
      const firstDowStr = getDayOfWeek(year, m, 1);
      const firstCol = dowMap[firstDowStr] || 1;
      const weeksCount = Math.ceil(((firstCol - 1) + count) / 7);
      html += `<div class="stat" style="padding: 10px;"><strong>${mName.toUpperCase()}</strong><span>${count} jours, ${weeksCount} sem.</span></div>`;
    });
    html += `</div>`;
    
    // Le 28 décembre est toujours dans la dernière semaine ISO de l'année
    const lastWeek = getISOWeek(year, 12, 28).week;
    html += `<div class="muted" style="margin-top: 10px;">Année ${year} : ${isLeap ? "366 jours (bissextile)" : "365 jours"} — ${lastWeek} semaines ISO</div>`;

    show("cal-annual-result", html);
  });
}

// ==========================================
// TOOL 16 — JOURS FERIES DE L'ANNEE
// ==========================================
const btnCalHolidays = $("cal-holidays-view");
if (btnCalHolidays) {
  btnCalHolidays.addEventListener("click", () => {
    const year = Number($("cal-holidays-year").value) || 2026;
    const holidays = frenchPublicHolidays(year);

    let weekdays = [];
    let weekends = [];

    holidays.forEach((h) => {
      const dow = getDayOfWeek(h.year, h.month, h.day);
      const str = `<strong>${humanDate(h)} (${dow})</strong><span>${h.name}</span>`;
      if (dow === "samedi" || dow === "dimanche") {
        weekends.push(str);
      } else {
        weekdays.push(str);
      }
    });

    let html = `<div class="result-grid" style="align-items: start;">`;
    
    html += `<div>`;
    if (weekdays.length > 0) {
      html += `<div class="muted" style="margin-bottom: 8px;">En semaine (${weekdays.length})</div>`;
      html += `<div style="display: grid; gap: 8px; margin-bottom: 16px;">`;
      weekdays.forEach(w => html += `<div class="stat" style="padding: 10px;">${w}</div>`);
      html += `</div>`;
    }
    html += `</div>`;
    
    html += `<div>`;
    if (weekends.length > 0) {
      html += `<div class="muted" style="margin-bottom: 8px;">En week-end (${weekends.length})</div>`;
      html += `<div style="display: grid; gap: 8px;">`;
      weekends.forEach(w => html += `<div class="stat" style="padding: 10px;">${w}</div>`);
      html += `</div>`;
    }
    html += `</div>`;

    html += `</div>`;
    show("cal-holidays-result", html);
  });
}

// ==========================================
// TOOL 17 — COMPTE A REBOURS TEMPS REEL
// ==========================================
let timerInterval = null;
const btnTimer = $("timer-start");
if (btnTimer) {
  btnTimer.addEventListener("click", () => {
    if (timerInterval) clearInterval(timerInterval);

    const dateStr = $("timer-date").value;
    const timeStr = $("timer-time").value || "00:00";

    if (!dateStr) {
      show("timer-result", `<strong>Veuillez choisir une date cible.</strong>`);
      return;
    }

    const [tY, tM, tD] = dateStr.split("-").map(Number);
    const [tH, tMin] = timeStr.split(":").map(Number);
    const targetMs = new Date(tY, tM - 1, tD, tH, tMin, 0).getTime();

    function renderTimer() {
      const nowMs = Date.now();
      const diffMs = targetMs - nowMs;

      if (diffMs <= 0) {
        show("timer-result", `<div class="big">Le compte à rebours est terminé !</div>`);
        clearInterval(timerInterval);
        return;
      }

      const totalSec = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      show(
        "timer-result",
        `
        <div class="big">${days}j ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s</div>
        <div class="muted">Compte à rebours en temps réel</div>
      `
      );
    }

    renderTimer();
    timerInterval = setInterval(renderTimer, 1000);
  });
}

// ==========================================
// TOOL 18 — CONVERSION DE DUREE
// ==========================================
const btnConv = $("conv-calculate");
if (btnConv) {
  btnConv.addEventListener("click", () => {
    const days = Number($("conv-days").value);
    if (!Number.isFinite(days) || days < 0) {
      show("conv-result", `<strong>Entrez un nombre de jours valide.</strong>`);
      return;
    }

    const hours = days * 24;
    const minutes = hours * 60;
    const seconds = minutes * 60;
    const weeks = (days / 7).toFixed(2);

    show(
      "conv-result",
      `
      <div class="result-grid">
        <div class="stat"><strong>${hours.toLocaleString("fr-FR")}</strong><span>heures</span></div>
        <div class="stat"><strong>${minutes.toLocaleString("fr-FR")}</strong><span>minutes</span></div>
        <div class="stat"><strong>${seconds.toLocaleString("fr-FR")}</strong><span>secondes</span></div>
        <div class="stat"><strong>${weeks}</strong><span>semaines</span></div>
      </div>
    `
    );
  });
}

// ==========================================
// TOOL 19 — DUREE EXACTE
// ==========================================
const btnExact = $("exact-calculate");
if (btnExact) {
  btnExact.addEventListener("click", () => {
    const startStr = $("exact-start").value;
    const endStr = $("exact-end").value;

    if (!startStr || !endStr) {
      show("exact-result", `<strong>Sélectionnez les deux dates et heures.</strong>`);
      return;
    }

    const diffMs = Math.abs(new Date(endStr).getTime() - new Date(startStr).getTime());
    const totalSec = Math.floor(diffMs / 1000);

    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    show(
      "exact-result",
      `
      <div class="big">${days} j. ${hours} h. ${minutes} min. ${seconds} s.</div>
      <div class="muted">Durée totale exacte</div>
    `
    );
  });
}

// ==========================================
// DEFAULT VALUES INITIALIZATION
// ==========================================
const today = new Date();
const todayParts = {
  year: today.getFullYear(),
  month: today.getMonth() + 1,
  day: today.getDate()
};
const futureParts = addCalendarDays(todayParts, 30);

if ($("weekday-day")) $("weekday-day").value = todayParts.day;
if ($("weekday-month")) $("weekday-month").value = todayParts.month;
if ($("weekday-year")) $("weekday-year").value = todayParts.year;

if ($("diff-start")) $("diff-start").value = iso(todayParts);
if ($("diff-end")) $("diff-end").value = iso(futureParts);
if ($("add-date")) $("add-date").value = iso(todayParts);

if ($("business-start")) $("business-start").value = iso(todayParts);
if ($("business-end")) $("business-end").value = iso(futureParts);
if ($("badd-date")) $("badd-date").value = iso(todayParts);

if ($("rel-target")) $("rel-target").value = iso(futureParts);
if ($("rel-base")) $("rel-base").value = iso(todayParts);

if ($("isoweek-date")) $("isoweek-date").value = iso(todayParts);
if ($("find-date-input")) $("find-date-input").value = iso(todayParts);
if ($("cal-month-select")) $("cal-month-select").value = todayParts.month;
if ($("cal-year-input")) $("cal-year-input").value = todayParts.year;
