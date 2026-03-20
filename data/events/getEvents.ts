import {
  ABBIGLIAMENTO_EVENTS,
  ACCESSORI_EVENTS,
  COMPORTAMENTI_EVENTS,
  SOCIAL_EVENTS,
  INCIDENTI_EVENTS,
  EPIC_EVENTS,
  COLORI,
} from "./generici";
import { VACANZA_EVENTS } from "./vacanza";
import { SERATA_AMICI_EVENTS } from "./serataAmici";

type EventItem = {
  id: string;
  text: string;
  points: number;
  type: string;
  tags: string[];
};

type GenerateEventPoolParams = {
  eventPack: string;
  eventGroup?: string;
  location?: string;
};

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

function take<T>(array: T[], count: number): T[] {
  return shuffle(array).slice(0, count);
}

function matchesContext(event: EventItem, allowedTags: string[]) {
  const specialTags = [
    "vacanza",
    "serata_amici",
    "festivita",
    "compleanno",
    "famiglia",
    "lavoro",
    "cerimonia",
    "amici",
    "misto",
    "coppia",
    "mare",
    "montagna",
    "citta",
    "estero",
  ];

  const expandedAllowedTags = [...allowedTags];

  // Se l'evento è "amici", consideriamo compatibili anche i tag "serata_amici"
  if (allowedTags.includes("amici") && !expandedAllowedTags.includes("serata_amici")) {
    expandedAllowedTags.push("serata_amici");
  }

  const eventSpecialTags = event.tags.filter((tag) => specialTags.includes(tag));

  // Se l'evento non ha tag speciali di contesto, è sempre compatibile
  if (eventSpecialTags.length === 0) return true;

  // Tutti i tag speciali dell'evento devono essere compatibili col contesto scelto
  return eventSpecialTags.every((tag) => expandedAllowedTags.includes(tag));
}

function applyDynamicText(event: EventItem): EventItem {
  let text = event.text;

  if (text.includes("{colore}")) {
    const colore = COLORI[Math.floor(Math.random() * COLORI.length)];
    text = text.replace("{colore}", colore);
  }

  return {
    ...event,
    text,
  };
}

export function generateEventPool({
  eventPack,
  eventGroup = "",
  location = "",
}: GenerateEventPoolParams) {
  // GENERICI NORMALI
  const genericEvents = [
    ...ABBIGLIAMENTO_EVENTS,
    ...ACCESSORI_EVENTS,
    ...COMPORTAMENTI_EVENTS,
    ...SOCIAL_EVENTS,
    ...INCIDENTI_EVENTS,
  ] as EventItem[];

  // GENERICI EPICI
  const genericEpicEvents = [...EPIC_EVENTS] as EventItem[];

  // PACK EVENTS (qui aggiungeremo anche gli altri pack futuri)
  const packEvents = [
    ...VACANZA_EVENTS,
    ...SERATA_AMICI_EVENTS,
  ] as EventItem[];

  const allowedTags = [eventPack, eventGroup, location].filter(Boolean);

  // Filtra generici normali compatibili
  const compatibleGeneric = genericEvents.filter((event) =>
    matchesContext(event, allowedTags)
  );

  // Filtra pack compatibili
  const compatiblePack = packEvents.filter((event) =>
    matchesContext(event, allowedTags)
  );

  // Eventi normali dal pack
  const normalPack = compatiblePack.filter(
    (event) => !event.tags.includes("epico")
  );

  // Eventi epici dal pack
  const epicPack = compatiblePack.filter((event) =>
    event.tags.includes("epico")
  );

  // Eventi epici generici compatibili col contesto
  const epicGeneric = genericEpicEvents.filter((event) =>
    matchesContext(event, allowedTags)
  );

 // --- GENERICI DIVISI ---
const genericBonus = compatibleGeneric.filter((e) => e.points > 0);
const genericMalus = compatibleGeneric.filter((e) => e.points < 0);

const selectedGeneric = [
  ...take(genericBonus, 6),
  ...take(genericMalus, 4),
];

// --- PACK DIVISI ---
const packBonus = normalPack.filter((e) => e.points > 0);
const packMalus = normalPack.filter((e) => e.points < 0);

const selectedPack = [
  ...take(packBonus, 6),
  ...take(packMalus, 4),
];

// --- EPICI DIVISI ---
const allEpic = [...epicGeneric, ...epicPack];
const epicBonus = allEpic.filter((e) => e.points > 0);
const epicMalus = allEpic.filter((e) => e.points < 0);

const selectedEpic = [
  ...take(epicBonus, 2),
  ...take(epicMalus, 1),
];

const allEvents = [...selectedGeneric, ...selectedPack, ...selectedEpic].map(
  applyDynamicText
);

return {
  genericEvents: selectedGeneric,
  packEvents: selectedPack,
  epicEvents: selectedEpic,
  allEvents,
};
}