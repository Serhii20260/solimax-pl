/**
 * Centralized PV/Energy Terminology Dictionary
 * Single source of truth for all term detection across languages
 * 
 * Languages: pl (Polish), en (English), de (German), ua (Ukrainian)
 * 
 * Structure:
 * - CONCEPTS: Core PV concepts with translations
 * - DOMAIN_TERMS: Flat list for in-domain detection
 * - TOPIC_TERMS: Terms grouped by topic for wrong-topic detection
 * - CATEGORY_TERMS: Terms for category filtering in KB search
 * - SYNONYMS: Cross-language synonyms for query expansion
 */

// =============================================================================
// CORE CONCEPTS - Single source of truth with all language variants
// =============================================================================

const CONCEPTS = {
  // === INVERTER / FALOWNIK ===
  inverter: {
    pl: ['falownik', 'inwerter', 'przekształtnik'],
    en: ['inverter', 'inverters', 'converter', 'microinverter', 'micro-inverter'],
    de: ['wechselrichter', 'umrichter', 'spannungswandler'],
    ua: ['інвертор', 'інвертори', 'перетворювач'],
    types: ['hybrid', 'hybrydowy', 'hybridwechselrichter', 'гібридний', 'гібрид',
            'on-grid', 'off-grid', 'sieciowy', 'netzwechselrichter', 'мережевий',
            'string', 'stringowy', 'stringwechselrichter', 'стрінговий',
            'mikrofalownik', 'mikroinwerter'],
    technical: ['mppt', 'dc-ac', 'ac-dc', 'jednofazowy', 'trójfazowy', 'trzyfazowy',
                'einphasig', 'dreiphasig', 'однофазний', 'трифазний', 'three-phase', 'single-phase'],
  },

  // === BATTERY / STORAGE / MAGAZYN ===
  battery: {
    pl: ['magazyn', 'magazyn energii', 'bateria', 'akumulator', 'akum'],
    en: ['battery', 'batteries', 'storage', 'energy storage', 'home battery', 
         'powerwall', 'home storage', 'residential storage'],
    de: ['speicher', 'stromspeicher', 'akkumulator', 'heimspeicher', 'hausbatterie',
         'batteriespeicher', 'energiespeicher'],
    ua: ['накопичувач', 'батарея', 'акумулятор', 'енергосховище', 'зберігання'],
    technical: ['bess', 'ess', 'lifepo4', 'lithium', 'li-ion', 'lfp'],
    capacity: ['kwh', 'ah', 'wh', 'pojemność', 'pojemnosc', 'ємність', 'capacity', 'kapazität'],
    context: ['evening', 'night', 'wieczór', 'wieczor', 'noc', 'abend', 'nacht', 'вечір', 'ніч',
              'blackout', 'backup', 'outage', 'awaria', 'резерв', 'stromausfall', 'przerwa',
              'self-consumption', 'autokonsumpcja', 'eigenverbrauch', 'автоспоживання',
              'autonomia', 'autonomy', 'autarkie', 'автономність', 'niezależność'],
  },

  // === PANEL / MODULE ===
  panel: {
    pl: ['panel', 'panele', 'moduł', 'moduły', 'modul', 'moduly', 'ogniwo', 'ogniwa'],
    en: ['panel', 'panels', 'module', 'modules', 'solar panel', 'solar panels', 
         'pv panel', 'pv panels', 'cell', 'cells', 'solar cell'],
    de: ['solarmodul', 'solarmodule', 'modul', 'module', 'solarzelle', 'solarzellen',
         'photovoltaikmodul', 'pv-modul'],
    ua: ['модуль', 'модулі', 'панель', 'панелі', 'сонячний', 'сонячна', 'сонячні'],
    types: ['mono', 'monokrystaliczny', 'monocrystalline', 'monokristallin', 'монокристал', 'монокристалічний',
            'poly', 'polikrystaliczny', 'polycrystalline', 'polykristallin', 'полікристал', 'полікристалічний',
            'bifacial', 'dwustronny', 'bifazial', 'двосторонній', 'двосторонні',
            'topcon', 'perc', 'hjt', 'heterojunction'],
    technical: ['krzem', 'silicon', 'silizium', 'кремній', 'wp', 'kwp'],
  },

  // === INSTALLATION / MOUNTING ===
  installation: {
    pl: ['montaż', 'montaz', 'instalacja', 'instalowanie', 'konstrukcja', 'stelaż', 'stelaz'],
    en: ['installation', 'mounting', 'install', 'setup', 'commissioning', 'racking'],
    de: ['montage', 'installation', 'aufbau', 'einbau', 'inbetriebnahme', 'gestell'],
    ua: ['монтаж', 'встановлення', 'установка', 'інсталяція', 'каркас'],
    locations: ['dach', 'dachu', 'dachowy', 'roof', 'rooftop', 'dachmontage', 'дах', 'даху', 'дахова',
                'grunt', 'ground', 'ziemia', 'naziemny', 'bodenmontage', 'земля', 'наземний', 'наземна',
                'fasada', 'facade', 'elewacja', 'fassade', 'фасад', 'фасадна',
                'balkon', 'balcony', 'balkonkraftwerk', 'балкон'],
  },

  // === PV SYSTEM ===
  pv_system: {
    pl: ['fotowoltaika', 'pv', 'instalacja pv', 'system pv', 'elektrownia słoneczna'],
    en: ['photovoltaic', 'photovoltaics', 'pv', 'pv system', 'solar system', 'solar power'],
    de: ['photovoltaik', 'pv', 'pv-anlage', 'solaranlage', 'solarsystem'],
    ua: ['фотовольтаїка', 'pv', 'сонячна електростанція', 'сонячна система', 'сес'],
    technical: ['kwp', 'kw', 'mwp', 'mw', 'wp'],
  },

  // === GRID / NETWORK ===
  grid: {
    pl: ['sieć', 'sieci', 'sieciowy', 'przyłącze', 'przylacze'],
    en: ['grid', 'network', 'utility', 'grid-tied', 'on-grid', 'off-grid'],
    de: ['netz', 'stromnetz', 'netzanschluss', 'netzgekoppelt'],
    ua: ['мережа', 'мережі', 'мережевий', 'приєднання'],
    billing: ['net-billing', 'net billing', 'opusty', 'prosument', 'prosumer', 
              'einspeisevergütung', 'einspeisung', 'feed-in', 'зелений тариф'],
  },

  // === COST / PROFITABILITY ===
  cost: {
    pl: ['koszt', 'koszty', 'cena', 'ceny', 'opłata', 'oplata', 'opłacalność', 'oplacalnosc',
         'zwrot', 'amortyzacja', 'inwestycja', 'wydatek', 'oszczędność', 'oszczednosc'],
    en: ['cost', 'costs', 'price', 'pricing', 'investment', 'return', 'payback', 'roi',
         'profitable', 'profitability', 'worth', 'afford', 'expensive', 'cheap', 'savings'],
    de: ['kosten', 'preis', 'preise', 'investition', 'amortisation', 'rentabel', 'rentabilität',
         'wirtschaftlich', 'ersparnis', 'einsparung'],
    ua: ['вартість', 'ціна', 'ціни', 'окупність', 'інвестиція', 'вигода', 'вигідний',
         'доступний', 'економія', 'заощадження'],
    indicators: ['roi', 'payback', 'irr', 'npv', 'lcoe'],
  },

  // === SAFETY ===
  safety: {
    pl: ['bezpieczeństwo', 'bezpieczenstwo', 'przeciwpożarowe', 'przeciwpozarowe', 
         'pożar', 'pozar', 'ppoz', 'ppoż', 'ochrona'],
    en: ['safety', 'fire', 'fire safety', 'protection', 'hazard'],
    de: ['sicherheit', 'brandschutz', 'brand', 'feuer', 'schutz'],
    ua: ['безпека', 'пожежна', 'протипожежний', 'захист'],
  },

  // === POWER / ENERGY ===
  power: {
    pl: ['moc', 'prąd', 'prad', 'energia', 'elektryczność', 'elektrycznosc', 'napięcie', 'napiecie'],
    en: ['power', 'energy', 'electricity', 'current', 'voltage', 'wattage'],
    de: ['leistung', 'strom', 'energie', 'elektrizität', 'spannung'],
    ua: ['потужність', 'енергія', 'електрика', 'струм', 'напруга'],
    units: ['kw', 'kwp', 'kwh', 'mw', 'mwp', 'mwh', 'w', 'wp', 'wh', 'v', 'a'],
  },

  // === COMPONENTS ===
  components: {
    pl: ['kabel', 'kable', 'przewód', 'przewody', 'złącze', 'zlacze', 'optymalizator', 'rozdzielnica'],
    en: ['cable', 'cables', 'wire', 'wires', 'connector', 'connectors', 'optimizer', 'junction box'],
    de: ['kabel', 'leitung', 'leitungen', 'stecker', 'optimierer', 'anschlussdose'],
    ua: ['кабель', 'кабелі', 'провід', 'провода', 'конектор', 'оптимізатор', 'розподільча'],
  },

  // === BUILDING CONTEXT ===
  building: {
    pl: ['dom', 'budynek', 'mieszkanie', 'obiekt', 'gospodarstwo'],
    en: ['house', 'home', 'building', 'apartment', 'property', 'residential', 'commercial'],
    de: ['haus', 'gebäude', 'gebaude', 'wohnung', 'objekt', 'einfamilienhaus'],
    ua: ['дім', 'будинок', 'квартира', 'обʼєкт', "об'єкт", 'господарство'],
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Flatten all terms from a concept into a single array
 */
const flattenConcept = (concept) => {
  const terms = [];
  for (const [key, values] of Object.entries(concept)) {
    if (Array.isArray(values)) {
      terms.push(...values);
    }
  }
  return [...new Set(terms)];
};

/**
 * Get all terms for a specific language from a concept
 */
const getLanguageTerms = (concept, lang) => {
  return concept[lang] || [];
};

/**
 * Get all terms across all concepts
 */
const getAllTerms = () => {
  const terms = [];
  for (const concept of Object.values(CONCEPTS)) {
    terms.push(...flattenConcept(concept));
  }
  return [...new Set(terms)];
};

// =============================================================================
// DERIVED STRUCTURES (for backward compatibility)
// =============================================================================

/**
 * DOMAIN_TERMS - Flat array of all PV-related terms for in-domain detection
 */
const DOMAIN_TERMS = getAllTerms();

/**
 * PV_TOPIC_TERMS - Terms grouped by main topic for wrong-topic detection
 */
const PV_TOPIC_TERMS = {
  magazyn: [
    ...flattenConcept(CONCEPTS.battery),
  ],
  falownik: [
    ...flattenConcept(CONCEPTS.inverter),
  ],
  panel: [
    ...flattenConcept(CONCEPTS.panel),
  ],
  montaz: [
    ...flattenConcept(CONCEPTS.installation),
  ],
  koszt: [
    ...flattenConcept(CONCEPTS.cost),
  ],
  siec: [
    ...flattenConcept(CONCEPTS.grid),
  ],
};

/**
 * CATEGORY_TERMS - Terms for KB category filtering
 */
const CATEGORY_TERMS = {
  inverter: [
    ...CONCEPTS.inverter.pl,
    ...CONCEPTS.inverter.en,
    ...CONCEPTS.inverter.de,
    ...CONCEPTS.inverter.ua,
  ],
  battery: [
    ...CONCEPTS.battery.pl,
    ...CONCEPTS.battery.en,
    ...CONCEPTS.battery.de,
    ...CONCEPTS.battery.ua,
  ],
  module: [
    ...CONCEPTS.panel.pl,
    ...CONCEPTS.panel.en,
    ...CONCEPTS.panel.de,
    ...CONCEPTS.panel.ua,
  ],
  pv: [
    ...CONCEPTS.pv_system.pl,
    ...CONCEPTS.pv_system.en,
    ...CONCEPTS.pv_system.de,
    ...CONCEPTS.pv_system.ua,
  ],
};

/**
 * INTENT_TERMS - Terms for detecting specific user intents
 */
const INTENT_TERMS = {
  battery: [
    ...CONCEPTS.battery.pl,
    ...CONCEPTS.battery.en,
    ...CONCEPTS.battery.de,
    ...CONCEPTS.battery.ua,
    ...CONCEPTS.battery.technical,
  ],
  inverter: [
    ...CONCEPTS.inverter.pl,
    ...CONCEPTS.inverter.en,
    ...CONCEPTS.inverter.de,
    ...CONCEPTS.inverter.ua,
  ],
  module: [
    ...CONCEPTS.panel.pl,
    ...CONCEPTS.panel.en,
    ...CONCEPTS.panel.de,
    ...CONCEPTS.panel.ua,
  ],
  grid: [
    ...CONCEPTS.grid.pl,
    ...CONCEPTS.grid.en,
    ...CONCEPTS.grid.de,
    ...CONCEPTS.grid.ua,
    ...CONCEPTS.grid.billing,
  ],
  country_pl: ['polsce', 'polska', 'w polsce', 'poland', 'polen', 'польща', 'польщі'],
};

/**
 * PROFITABILITY_INTENT_TERMS - Terms indicating profitability questions
 */
const PROFITABILITY_INTENT_TERMS = [
  // Polish
  'opłacal', 'oplacal', 'sens', 'czy warto', 'warto', 'zwrot', 'amortyzacja', 'inwestycja',
  'oszczędność', 'oszczednosc', 'zysk',
  // English
  'worth', 'worth it', 'make sense', 'profitable', 'profitability', 'payback', 'roi',
  'return', 'investment', 'savings', 'save money', 'cost effective',
  // German
  'rentabel', 'lohnt', 'lohnt sich', 'amortisation', 'wirtschaftlich', 'ersparnis',
  'investition', 'rendite',
  // Ukrainian
  'окуп', 'вигід', 'вигодн', 'заощад', 'інвестиц', 'сенс', 'варто',
];

/**
 * SIZING_TERMS - Terms indicating sizing/dimensioning questions
 */
const SIZING_TERMS = [
  // Polish
  'dobór', 'dobor', 'dobrać', 'dobrac', 'wybór', 'wybor', 'wybrać', 'wybrac',
  'jaki', 'jaka', 'jakie', 'ile', 'jak duży', 'jak duza',
  // English
  'size', 'sizing', 'dimension', 'dimensioning', 'how big', 'how much', 'what size',
  'how many', 'capacity needed', 'required',
  // German
  'dimensionierung', 'dimensionieren', 'wie groß', 'wie gross', 'welche größe', 'welche grosse',
  'wie viel', 'wieviel', 'benötigt', 'benotigt', 'leistung', 'brauche', 'brauchen',
  'welche leistung',
  // Ukrainian
  'потужність', 'потужн', 'розмір', 'скільки', 'який', 'яка', 'яке', 'потрібн', 'потрібна',
  'для дому', 'для будинку',
  // Technical
  'kwp', 'kw', 'moc',
];

/**
 * SELECTION_TERMS - Terms indicating selection/comparison intent
 */
const SELECTION_TERMS = [
  // Polish
  'wybór', 'wybor', 'wybrać', 'wybrac', 'dobór', 'dobor', 'jak wybrać', 'jak wybrac',
  'który', 'ktory', 'która', 'ktora', 'które', 'ktore', 'porównanie', 'porownanie',
  // English
  'choose', 'choosing', 'selection', 'select', 'which', 'compare', 'comparison',
  'difference', 'vs', 'versus', 'or', 'better',
  // German
  'auswahl', 'auswählen', 'auswahlen', 'welcher', 'welche', 'welches', 'vergleich',
  'unterschied', 'oder', 'besser',
  // Ukrainian
  'вибір', 'вибрати', 'як вибрати', 'який', 'яка', 'яке', 'порівняння', 'різниця',
  'чи', 'краще', 'кращий',
];

/**
 * SAFETY_TERMS - Terms related to fire safety
 */
const SAFETY_TERMS = [
  ...flattenConcept(CONCEPTS.safety),
];

/**
 * COMPARISON_STOPWORDS - Words to exclude when extracting key terms for comparison
 */
const COMPARISON_STOPWORDS = {
  pl: ['czy', 'jest', 'to', 'a', 'i', 'lub', 'albo', 'oraz', 'co', 'jak', 'jaki', 'jaka', 'jakie',
       'który', 'która', 'które', 'gdzie', 'kiedy', 'dlaczego', 'po', 'na', 'w', 'z', 'do', 'od',
       'dla', 'przy', 'bez', 'przed', 'za', 'nad', 'pod', 'między', 'ze', 'we', 'si', 'sie', 'się'],
  en: ['the', 'and', 'with', 'of', 'to', 'for', 'in', 'on', 'at', 'is', 'are', 'a', 'an',
       'what', 'which', 'how', 'why', 'when', 'where', 'who', 'or', 'but', 'if', 'than',
       'worth', 'it', 'high', 'low', 'good', 'bad', 'best', 'better', 'vs', 'versus',
       'between', 'from', 'by', 'this', 'that', 'these', 'those', 'my', 'your', 'our'],
  de: ['der', 'die', 'das', 'und', 'mit', 'von', 'zu', 'für', 'fur', 'in', 'an', 'auf',
       'ist', 'sind', 'ein', 'eine', 'einer', 'was', 'wie', 'warum', 'wann', 'wo', 'wer',
       'oder', 'aber', 'wenn', 'als', 'ob', 'bei', 'nach', 'vor', 'über', 'uber', 'zwischen',
       'sich', 'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr'],
  ua: ['чи', 'є', 'це', 'а', 'і', 'й', 'або', 'та', 'що', 'як', 'який', 'яка', 'яке',
       'котрий', 'котра', 'де', 'коли', 'чому', 'по', 'на', 'в', 'у', 'з', 'із', 'до', 'від',
       'для', 'при', 'без', 'перед', 'за', 'над', 'під', 'між', 'зі', 'ві', 'собі', 'себе'],
};

/**
 * SYNONYMS - Cross-language synonyms for query expansion
 */
const SYNONYMS = {};
// Build synonyms from concepts
for (const [conceptName, concept] of Object.entries(CONCEPTS)) {
  const allTerms = [];
  for (const [key, values] of Object.entries(concept)) {
    if (Array.isArray(values)) {
      allTerms.push(...values);
    }
  }
  // Create bidirectional synonyms for main terms
  const mainTerms = [
    ...(concept.pl || []),
    ...(concept.en || []),
    ...(concept.de || []),
    ...(concept.ua || []),
  ];
  for (const term of mainTerms) {
    SYNONYMS[term] = mainTerms.filter(t => t !== term);
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  // Core concepts
  CONCEPTS,
  
  // Derived structures
  DOMAIN_TERMS,
  PV_TOPIC_TERMS,
  CATEGORY_TERMS,
  INTENT_TERMS,
  PROFITABILITY_INTENT_TERMS,
  SIZING_TERMS,
  SELECTION_TERMS,
  SAFETY_TERMS,
  COMPARISON_STOPWORDS,
  SYNONYMS,
  
  // Helper functions
  flattenConcept,
  getLanguageTerms,
  getAllTerms,
};
