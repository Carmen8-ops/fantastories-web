export const VACANZA_EVENTS = [
  // BONUS

  { id: "bagno_notturno", text: "Bagno notturno", points: 20, type: "single", tags: ["vacanza", "mare", "serata_amici"] },

  { id: "amicizia_sconosciuto", text: "Fa amicizia con uno sconosciuto", points: 15, type: "single", tags: ["vacanza", "citta", "estero", "mare"] },

  { id: "posto_bellissimo", text: "Scopre un posto bellissimo", points: 15, type: "single", tags: ["vacanza", "citta", "estero", "mare", "montagna"] },

  { id: "offre_bere", text: "Offre da bere a tutti", points: 20, type: "single", tags: ["vacanza", "serata_amici", "mare", "citta", "estero"] },

  { id: "ultimo_dormire", text: "Ultimo ad andare a dormire", points: 15, type: "single", tags: ["vacanza", "serata_amici", "mare", "citta", "estero", "montagna"] },

  { id: "primo_acqua", text: "Primo in acqua", points: 15, type: "single", tags: ["vacanza", "mare"] },

  { id: "locale_incredibile", text: "Trova un locale incredibile", points: 15, type: "single", tags: ["vacanza", "serata_amici", "citta", "estero", "mare"] },

  { id: "organizza_serata", text: "Organizza il piano della serata", points: 15, type: "single", tags: ["vacanza", "serata_amici", "citta", "estero", "mare", "montagna"] },

  { id: "prende_sole", text: "Si mette a prendere il sole", points: 10, type: "single", tags: ["vacanza", "mare", "montagna"] },

  { id: "venditore_ambulante", text: "Compra qualcosa da un venditore ambulante", points: 10, type: "single", tags: ["vacanza", "citta", "estero", "mare"] },

  { id: "non_capisce_menu", text: "Non capisce il menù", points: 15, type: "single", tags: ["vacanza", "citta", "estero"] },

  { id: "comunica_gesti", text: "Comunica a gesti", points: 15, type: "single", tags: ["vacanza", "estero", "citta"] },

  { id: "sbaglia_fermata", text: "Sbaglia fermata", points: 10, type: "single", tags: ["vacanza", "citta", "estero"] },

  { id: "si_orienta_meglio", text: "Si orienta meglio di tutti", points: 15, type: "single", tags: ["vacanza", "citta", "estero", "montagna"] },

  { id: "parla_locale", text: "Parla con qualcuno del posto", points: 15, type: "single", tags: ["vacanza", "citta", "estero", "mare", "montagna"] },

  { id: "guida_turistica", text: "Vive in modalità guida turistica", points: 15, type: "single", tags: ["vacanza", "citta", "estero"] },

  { id: "foto_sconosciuti", text: "Fa una foto con sconosciuti", points: 15, type: "single", tags: ["vacanza", "citta", "estero", "mare", "serata_amici"] },

  { id: "tatuaggio_vacanza", text: "Tatuaggio in vacanza", points: 20, type: "single", tags: ["vacanza", "mare", "citta", "estero", "serata_amici"] },



  // MALUS

  { id: "scottatura", text: "Scottatura solare", points: -10, type: "single", tags: ["vacanza", "mare", "montagna"] },

  { id: "perde_spiaggia", text: "Perde qualcosa in spiaggia", points: -15, type: "single", tags: ["vacanza", "mare"] },

  { id: "chiavi_stanza", text: "Perde le chiavi della stanza", points: -15, type: "single", tags: ["vacanza", "mare", "citta", "estero", "montagna"] },

  { id: "si_perde", text: "Si perde completamente", points: -10, type: "single", tags: ["vacanza", "citta", "estero", "montagna", "mare"] },

  { id: "dorme_troppo", text: "Dorme troppo e salta un'attività", points: -10, type: "single", tags: ["vacanza", "mare", "citta", "estero", "montagna"] },

  { id: "addormenta_spiaggia", text: "Si addormenta in spiaggia", points: -10, type: "single", tags: ["vacanza", "mare"] },

  { id: "sabbia_scarpe", text: "Sabbia nelle scarpe", points: -5, type: "single", tags: ["vacanza", "mare"] },

  { id: "perde_telefono", text: "Perde il telefono", points: -20, type: "single", tags: ["vacanza", "serata_amici", "mare", "citta", "estero", "montagna"] },

  { id: "entra_posto_sbagliato", text: "Entra nel posto sbagliato", points: -10, type: "single", tags: ["vacanza", "citta", "estero"] },

  { id: "dimentica_parcheggio", text: "Si dimentica dove ha parcheggiato", points: -10, type: "single", tags: ["vacanza", "citta", "montagna", "mare"] },

  { id: "dimentica_hotel", text: "Dimentica qualcosa in hotel", points: -10, type: "single", tags: ["vacanza", "citta", "estero", "mare", "montagna"] },

  { id: "valigia_incasinata", text: "Valigia incasinata", points: -10, type: "single", tags: ["vacanza", "estero", "citta", "mare", "montagna"] },

  { id: "ordina_italiano_estero", text: "Ordina italiano anche all'estero", points: -10, type: "single", tags: ["vacanza", "estero"] },

  { id: "paura_aereo", text: "Paura dell'aereo", points: -10, type: "single", tags: ["vacanza", "estero"] },

  { id: "perde_documenti", text: "Perde i documenti", points: -20, type: "single", tags: ["vacanza", "estero", "citta", "mare", "montagna"] },



  // EPICI

  { id: "notte_spiaggia", text: "Dormono sulla spiaggia tutta la notte", points: 40, type: "all", tags: ["epico", "vacanza", "mare"] },

  { id: "dorme_fuori_stanza", text: "Dorme fuori stanza", points: -40, type: "single", tags: ["epico", "vacanza", "estero", "citta", "mare", "montagna"] },

  { id: "sbaglia_lingua", text: "Sbaglia lingua clamorosamente", points: -40, type: "single", tags: ["epico", "vacanza", "estero"] },

  { id: "notte_bianco", text: "Notte in bianco", points: 40, type: "single", tags: ["epico", "vacanza", "serata_amici", "mare", "citta", "estero"] },

  { id: "bagaglio_smarrito", text: "Bagaglio smarrito all'aeroporto", points: -50, type: "single", tags: ["epico", "vacanza", "estero"] }
];