export const DURATION_FACTS = {
  80: "80 jours : C'est le temps qu'il a fallu à Phileas Fogg pour faire le Tour du monde dans le roman de Jules Verne.",
  365: "365 jours : Le temps qu'il faut à la Terre pour faire une révolution complète autour du Soleil.",
  280: "280 jours : La durée moyenne d'une grossesse humaine (environ 40 semaines).",
  100: "Les Cent-Jours : La période de l'histoire de France comprise entre le retour de Napoléon Ier en France et la dissolution de la Commission Napoléon II (1815).",
  14: "14 jours (ou quatorzaine) : Durée historique d'isolement pour éviter la propagation de maladies contagieuses.",
  7: "7 jours : La durée d'une semaine, un cycle établi depuis l'Antiquité (Babyloniens) calqué sur les phases de la Lune.",
  1000: "1 000 jours : Une période critique dans le développement d'un enfant (de la conception à ses deux ans)."
};

export async function getFactForDate(day, month, targetYear) {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');

  try {
    const response = await fetch(`https://fr.wikipedia.org/api/rest_v1/feed/onthisday/events/${mm}/${dd}`);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.events || data.events.length === 0) return null;

    let validEvents = data.events;
    if (targetYear) {
      validEvents = validEvents.filter(e => e.year <= targetYear);
    }

    if (validEvents.length === 0) return null;

    const event = validEvents[Math.floor(Math.random() * validEvents.length)];
    const factYear = event.year;
    const text = event.text;

    if (factYear === undefined || factYear === null || !targetYear) {
      return text;
    }

    const diff = targetYear - factYear;
    const MONTH_NAMES = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    const mName = MONTH_NAMES[month - 1];
    
    let yearStr = factYear < 0 ? `${Math.abs(factYear)} av. J.-C.` : factYear;
    let baseStr = `<strong>${day} ${mName} ${yearStr}</strong> : ${text}`;

    if (diff === 0) {
      return `${baseStr} <br><span style="opacity: 0.8; font-size: 0.8em;">(Cet événement a eu lieu cette année-là)</span>`;
    } else if (diff > 0) {
      return `${baseStr} <br><span style="opacity: 0.8; font-size: 0.8em;">(Un événement survenu ${diff} an${diff > 1 ? 's' : ''} plus tôt)</span>`;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Erreur API Wikipedia:", error);
    return null;
  }
}

export function getFactForDuration(days) {
  return DURATION_FACTS[days] || null;
}

export function buildCultureHtml(fact) {
  if (!fact) return "";
  return `
    <div style="margin-top: 16px; padding: 12px 16px; background: #e0e7ff; border-left: 4px solid #6366f1; border-radius: 8px; font-size: 0.85rem; color: #3730a3; display: flex; gap: 10px; align-items: center;">
      <div style="font-size: 1.2rem;">💡</div>
      <div>${fact}</div>
    </div>
  `;
}
