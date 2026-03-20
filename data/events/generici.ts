export const COLORI = [
  "rosso",
  "blu",
  "verde",
  "giallo",
  "nero",
  "bianco",
  "rosa",
  "viola",
  "arancione",
  "colore oro",
  "colore argento",
  "azzurro",
  "turchese",
  "marrone"
];

export const ABBIGLIAMENTO_EVENTS = [
  { id: "colore", text: "Indossa qualcosa di {colore}", points: 5, type: "single", tags: ["generico", "abbigliamento"] },

  { id: "look_elegante", text: "Look elegante", points: 5, type: "single", tags: ["generico", "abbigliamento"] },
  { id: "outfit_luccicante", text: "Outfit luccicante", points: 5, type: "single", tags: ["generico", "abbigliamento"] },
  { id: "indumento_vintage", text: "Indumento vintage", points: 5, type: "single", tags: ["generico", "abbigliamento"] },

  { id: "camicia", text: "Camicia", points: 5, type: "single", tags: ["generico", "abbigliamento"] },
  { id: "giacca", text: "Giacca", points: 5, type: "single", tags: ["generico", "abbigliamento"] },
  { id: "vestito", text: "Vestito", points: 5, type: "single", tags: ["generico", "abbigliamento"] },
  { id: "felpa", text: "Felpa", points: 5, type: "single", tags: ["generico", "abbigliamento"] },

  { id: "tacchi", text: "Tacchi", points: 5, type: "single", tags: ["generico", "abbigliamento"] },
  { id: "mocassini", text: "Mocassini", points: 5, type: "single", tags: ["generico", "abbigliamento"] },
  { id: "scarpe_ginnastica", text: "Scarpe da ginnastica", points: 5, type: "single", tags: ["generico", "abbigliamento"] },

  { id: "leopardato", text: "Indumento leopardato", points: 8, type: "single", tags: ["generico", "abbigliamento"] },
  { id: "coccodrillo", text: "Indumento effetto coccodrillo", points: 8, type: "single", tags: ["generico", "abbigliamento"] },
  { id: "stivali_punta", text: "Stivali a punta", points: 8, type: "single", tags: ["generico", "abbigliamento"] },
];

export const ACCESSORI_EVENTS = [
  { id: "cappello", text: "Cappello", points: 5, type: "single", tags: ["generico", "accessori"] },
  { id: "occhiali_sole", text: "Occhiali da sole", points: 5, type: "single", tags: ["generico", "accessori"] },
  { id: "occhiali_vista", text: "Occhiali da vista", points: 5, type: "single", tags: ["generico", "accessori"] },
  { id: "collana", text: "Collana", points: 5, type: "single", tags: ["generico", "accessori"] },
  { id: "bracciale", text: "Bracciale", points: 5, type: "single", tags: ["generico", "accessori"] },
  { id: "anello", text: "Anello", points: 5, type: "single", tags: ["generico", "accessori"] },
  { id: "cintura", text: "Cintura", points: 5, type: "single", tags: ["generico", "accessori"] },
  { id: "cravatta", text: "Cravatta", points: 5, type: "single", tags: ["generico", "accessori"] },
  { id: "sciarpa", text: "Sciarpa", points: 5, type: "single", tags: ["generico", "accessori"] },
  { id: "borsa", text: "Borsa", points: 5, type: "single", tags: ["generico", "accessori"] },
  { id: "zaino", text: "Zaino", points: 5, type: "single", tags: ["generico", "accessori"] },
  { id: "orecchini", text: "Orecchini", points: 5, type: "single", tags: ["generico", "accessori"] },
];

export const COMPORTAMENTI_EVENTS = [
  { id: "selfie_gruppo", text: "Selfie di gruppo", points: 10, type: "all", tags: ["generico", "comportamenti", "social"] },

  { id: "battuta", text: "Fa una battuta", points: 10, type: "single", tags: ["generico", "comportamenti"] },
  { id: "aneddoto", text: "Racconta un aneddoto", points: 10, type: "single", tags: ["generico", "comportamenti"] },
  { id: "scatta_fotografie", text: "Scatta fotografie", points: 10, type: "single", tags: ["generico", "social"] },
  { id: "fa_brindisi", text: "Fa un brindisi", points: 10, type: "single", tags: ["generico", "comportamenti"] },
  { id: "telefono", text: "Si distrae con il telefono", points: 10, type: "single", tags: ["generico", "comportamenti"] },
  { id: "interrompe", text: "Interrompe qualcuno mentre parla", points: 10, type: "single", tags: ["generico", "comportamenti"] },
  { id: "silenzio", text: "Chiede di fare silenzio", points: 10, type: "single", tags: ["generico", "comportamenti"] },
  { id: "ripete_frase", text: "Ripete una frase già detta", points: 10, type: "single", tags: ["generico", "comportamenti"] },
  { id: "commenta_cibo", text: "Commenta il cibo", points: 10, type: "single", tags: ["generico", "comportamenti"] },
  { id: "commenta_musica", text: "Commenta la musica", points: 10, type: "single", tags: ["generico", "comportamenti"] },
  { id: "parla_lavoro", text: "Parla di lavoro", points: 10, type: "single", tags: ["generico", "comportamenti"] },
  { id: "commenta_meteo", text: "Commenta il meteo o il clima", points: 10, type: "single", tags: ["generico", "comportamenti"] },
];

export const SOCIAL_EVENTS = [
  { id: "storia_social", text: "Fa una storia social", points: 10, type: "single", tags: ["generico", "social"] },
  { id: "chiede_foto", text: "Chiede una foto", points: 10, type: "single", tags: ["generico", "social"] },
  { id: "controlla_social", text: "Controlla i social", points: 10, type: "single", tags: ["generico", "social"] },
  { id: "fa_video", text: "Fa un video", points: 10, type: "single", tags: ["generico", "social"] },
  { id: "riguarda_foto", text: "Riguarda una foto appena scattata", points: 10, type: "single", tags: ["generico", "social"] },
];

export const INCIDENTI_EVENTS = [
  { id: "rovescia_bevanda", text: "Rovescia una bevanda", points: -8, type: "single", tags: ["generico", "incidenti"] },

  { id: "si_macchia", text: "Si macchia i vestiti", points: -8, type: "single", tags: ["generico", "incidenti"] },

  { id: "cade_oggetto", text: "Fa cadere qualcosa", points: -5, type: "single", tags: ["generico", "incidenti"] },

  { id: "telefono_cade", text: "Fa cadere il telefono", points: -8, type: "single", tags: ["generico", "incidenti"] },

  { id: "parla_troppo_forte", text: "Parla troppo forte", points: -5, type: "single", tags: ["generico", "incidenti"] },
];

export const EPIC_EVENTS = [

  // BONUS EPICI

  { id: "ballo_tavolo", text: "Balla sul tavolo", points: 40, type: "single", tags: ["epico", "serata_amici", "vacanza", "compleanno"] },

  { id: "karaoke_improvviso", text: "Karaoke improvviso", points: 40, type: "single", tags: ["epico", "serata_amici", "vacanza", "compleanno"] },

  { id: "entrata_teatrale", text: "Entrata teatrale", points: 40, type: "single", tags: ["epico", "generico"] },

  { id: "ballo_gruppo", text: "Ballo di gruppo", points: 40, type: "all", tags: ["epico", "serata_amici", "festivita", "compleanno"] },

  { id: "imitazione_perfetta", text: "Imitazione perfetta", points: 40, type: "single", tags: ["epico", "generico"] },

  { id: "tuffo_vestito", text: "Si tuffa vestito", points: 50, type: "single", tags: ["epico", "vacanza"] },

  { id: "sparisce_ora", text: "Sparisce per un'ora", points: 40, type: "single", tags: ["epico", "serata_amici", "vacanza", "compleanno"] },



  // MALUS EPICI

  { id: "caduta_spettacolare", text: "Caduta spettacolare", points: -40, type: "single", tags: ["epico", "generico"] },

  { id: "gaffe_clamorosa", text: "Gaffe clamorosa", points: -40, type: "single", tags: ["epico", "generico"] },

  { id: "oggetto_rotto", text: "Oggetto rotto", points: -40, type: "single", tags: ["epico", "generico"] },

  { id: "schermo_rotto", text: "Schermo del telefono rotto", points: -50, type: "single", tags: ["epico", "generico"] },

  { id: "telefono_acqua", text: "Telefono cade in acqua", points: -50, type: "single", tags: ["epico", "vacanza"] },

  { id: "torta_cade", text: "Cade la torta", points: -50, type: "single", tags: ["epico", "compleanno", "festivita", "cerimonia"] },

  { id: "rompe_sedia", text: "Rompe una sedia", points: -50, type: "single", tags: ["epico", "generico"] },

  { id: "addormenta_tavolo", text: "Si addormenta al tavolo", points: -40, type: "single", tags: ["epico", "famiglia", "festivita", "compleanno"] },



  // EVENTI EPICI AMBIENTALI

  { id: "arriva_polizia", text: "Arriva la polizia", points: -50, type: "all", tags: ["epico", "serata_amici", "vacanza"] },
];