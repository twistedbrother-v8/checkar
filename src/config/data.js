// src/config/data.js

const CHECKLIST_FR = [
  {
    id: "niveaux", label: "Niveaux", icon: "🛢️",
    desc: "Huile, refroid, lave-glace, frein",
    group: true,
    items: [
      { id: "huile",           label: "Huile moteur",           desc: "Ça coule ? Ça sent ? On vérifie.",   icon: "🛢️" },
      { id: "refroidissement", label: "Liquide refroidissement", desc: "Entre les deux traits, c'est bon.",   icon: "🌡️" },
      { id: "laveglace",       label: "Lave-glace",             desc: "Pour voir clair par tous les temps.", icon: "💧" },
      { id: "liquidefrein",    label: "Liquide de frein",       desc: "Couleur claire = bon signe.",         icon: "🔴" },
    ],
  },
  {
    id: "eclairage", label: "Éclairage", icon: "💡",
    desc: "Tout doit s'allumer",
    group: true,
    items: [
      { id: "feuxavant",   label: "Feux avant",             desc: "Codes, pleins phares — tout ok ?", icon: "🔦" },
      { id: "feuxarriere", label: "Feux arrière",           desc: "Stop et recul bien visibles ?",    icon: "🔴" },
      { id: "clignotants", label: "Clignotants & détresse", desc: "Les 4 clignotent bien ?",          icon: "🔶" },
    ],
  },
  {
    id: "pneus", label: "Pneus", icon: "⚫",
    desc: "Pression et usure — 2 min chrono.",
    group: true,
    items: [
      { id: "pneusavant",   label: "Pneus avant",   desc: "Pression et usure avant ok ?",   icon: "⚫" },
      { id: "pneusarriere", label: "Pneus arrière",  desc: "Pression et usure arrière ok ?", icon: "⚫" },
    ],
  },
  { id: "freins",   label: "Freins",        desc: "Ça grince ? Ça vibre ? À voir.",       icon: "🛑" },
  { id: "essuie",   label: "Essuie-glaces", desc: "Balais usés ? Rayures sur le pare-brise ?", icon: "🌧️" },
  { id: "batterie", label: "Batterie",      desc: "Démarre bien ? Pas de surprise.",       icon: "🔋" },
  { id: "clim",     label: "Climatisation", desc: "Souffle frais ? Gaz ok ?",             icon: "❄️" },
  { id: "filtre",   label: "Filtre à air",  desc: "Sale = moteur qui travaille plus dur.", icon: "🌀" },
];

const CHECKLIST_EN = [
  {
    id: "niveaux", label: "Fluid levels", icon: "🛢️",
    desc: "Oil, coolant, washer, brake fluid",
    group: true,
    items: [
      { id: "huile",           label: "Engine oil",        desc: "Any leaks or smell? Let's check.",     icon: "🛢️" },
      { id: "refroidissement", label: "Coolant",           desc: "Between the two marks? Good to go.",   icon: "🌡️" },
      { id: "laveglace",       label: "Washer fluid",      desc: "Stay clear in all weather.",           icon: "💧" },
      { id: "liquidefrein",    label: "Brake fluid",       desc: "Clear colour = good sign.",            icon: "🔴" },
    ],
  },
  {
    id: "eclairage", label: "Lighting", icon: "💡",
    desc: "Everything should light up",
    group: true,
    items: [
      { id: "feuxavant",   label: "Front lights",        desc: "Low & high beam — all good?",  icon: "🔦" },
      { id: "feuxarriere", label: "Rear lights",         desc: "Brake & reverse visible?",     icon: "🔴" },
      { id: "clignotants", label: "Indicators & hazards", desc: "All 4 flashing ok?",          icon: "🔶" },
    ],
  },
  {
    id: "pneus", label: "Tyres", icon: "⚫",
    desc: "Pressure & wear — 2 min job.",
    group: true,
    items: [
      { id: "pneusavant",   label: "Front tyres",  desc: "Front pressure & wear ok?",  icon: "⚫" },
      { id: "pneusarriere", label: "Rear tyres",   desc: "Rear pressure & wear ok?",   icon: "⚫" },
    ],
  },
  { id: "freins",   label: "Brakes",         desc: "Any grinding or vibration?",               icon: "🛑" },
  { id: "essuie",   label: "Windscreen wipers", desc: "Worn blades? Streaks on the windscreen?", icon: "🌧️" },
  { id: "batterie", label: "Battery",        desc: "Starting fine? No surprises.",              icon: "🔋" },
  { id: "clim",     label: "Air con",        desc: "Blowing cold? Gas ok?",              icon: "❄️" },
  { id: "filtre",   label: "Air filter",     desc: "Dirty = engine working harder.",      icon: "🌀" },
];

const MOTO_FR = [
  { id: "huile",           label: "Huile moteur",           desc: "Niveau correct ? Pas de fuite ?",  icon: "🛢️" },
  { id: "refroidissement", label: "Liquide de refroidissement", desc: "Entre les deux traits, c'est bon.", icon: "🌡️" },
  { id: "chaine",          label: "Chaîne",                 desc: "Bien tendue et graissée ?",        icon: "⛓️" },
  { id: "freins",          label: "Freins",                 desc: "Plaquettes encore ok ?",           icon: "🔴" },
  {
    id: "pneus", label: "Pneus", icon: "⚫",
    desc: "Pression et usure — vite fait.",
    group: true,
    items: [
      { id: "pneusavant",   label: "Pneu avant",   desc: "Pression et usure avant ok ?",   icon: "⚫" },
      { id: "pneusarriere", label: "Pneu arrière",  desc: "Pression et usure arrière ok ?", icon: "⚫" },
    ],
  },
  {
    id: "eclairage", label: "Éclairage", icon: "💡", desc: "Tout doit s'allumer", group: true,
    items: [
      { id: "feuxavant",   label: "Feux avant",             desc: "Phare ok ?",        icon: "🔦" },
      { id: "feuxarriere", label: "Feux arrière",           desc: "Stop visible ?",     icon: "🔴" },
      { id: "clignotants", label: "Clignotants & détresse", desc: "Les 4 clignotent ?", icon: "🔶" },
    ],
  },
  { id: "batterie", label: "Batterie", desc: "Démarre sans hésiter ?", icon: "🔋" },
];

const MOTO_EN = [
  { id: "huile",           label: "Engine oil", desc: "Level ok? No leaks?",               icon: "🛢️" },
  { id: "refroidissement", label: "Coolant",    desc: "Between the two marks? Good to go.", icon: "🌡️" },
  { id: "chaine",          label: "Chain",      desc: "Tight and lubed?",                  icon: "⛓️" },
  { id: "freins",          label: "Brakes",     desc: "Pads still ok?",                    icon: "🔴" },
  {
    id: "pneus", label: "Tyres", icon: "⚫",
    desc: "Pressure & wear — quick check.",
    group: true,
    items: [
      { id: "pneusavant",   label: "Front tyre",  desc: "Front pressure & wear ok?",  icon: "⚫" },
      { id: "pneusarriere", label: "Rear tyre",   desc: "Rear pressure & wear ok?",   icon: "⚫" },
    ],
  },
  {
    id: "eclairage", label: "Lighting", icon: "💡", desc: "Everything should light up", group: true,
    items: [
      { id: "feuxavant",   label: "Front light",          desc: "Headlight ok?",        icon: "🔦" },
      { id: "feuxarriere", label: "Rear light",           desc: "Brake light visible?", icon: "🔴" },
      { id: "clignotants", label: "Indicators & hazards", desc: "All 4 flashing?",      icon: "🔶" },
    ],
  },
  { id: "batterie", label: "Battery", desc: "Starting without hesitation?", icon: "🔋" },
];

export const getChecklist = (type, lang = "fr") => {
  const base = lang === "en" ? CHECKLIST_EN : CHECKLIST_FR;
  const moto = lang === "en" ? MOTO_EN : MOTO_FR;
  switch (type) {
    case "moto": return moto;
    default:     return base;
  }
};

export const CHECKLIST_MAP = {
  voiture: CHECKLIST_FR,
  moto:    MOTO_FR,
};

export const getAllCheckIds = (checklist) => {
  const ids = [];
  checklist.forEach(item => {
    if (item.group) item.items.forEach(sub => ids.push(sub.id));
    else ids.push(item.id);
  });
  return ids;
};

export const TYPE_ICONS  = { voiture: "🚘", moto: "🏍️" };
export const TYPE_LABELS = { voiture: "Voiture", moto: "Moto" };
export const STATE_COLOR = { OK: "#22ff00", BIENTOT: "#ffa200", PROBLEME: "#ff0000" };
export const STATE_LABEL = { OK: "✓", BIENTOT: "!", PROBLEME: "✗" };

export const TABS = [
  { id: "accueil",   label: "Accueil",   icon: "🏠" },
  { id: "checklist", label: "Checklist", icon: "✅" },
  { id: "documents", label: "Documents", icon: "📄" },
  { id: "depenses",  label: "Dépenses",  icon: "💰" },
  { id: "rapport",   label: "Rapport",   icon: "📊" },
];