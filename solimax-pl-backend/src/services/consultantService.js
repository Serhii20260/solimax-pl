const prisma = require("../db/prisma");

const { callConsultantLLM, isLlmEnabled, getLlmStatus } = require("./llmClient");

// Import centralized terminology from single source of truth
const {
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
} = require("../config/pvTerminology");

const MAX_INPUT_CHARS = Number(process.env.MAX_INPUT_CHARS || 800);
const MAX_OUTPUT_TOKENS = Number(process.env.MAX_OUTPUT_TOKENS || 400);

const PROFITABILITY_RESPONSE_RE =
  /\b(oplacal|opłacal|sens|warto|zwrot|roi|payback|make sense|worth|rentabel|amort|окуп|вигід|koszt|cena|cost|lohnt|інвестиц|savings|ersparnis)\b/i;

const MIN_SCORE = Number(process.env.MIN_KB_SCORE || 4);

// Fallback responses - GENERIC PV responses (not topic-specific to avoid wrong-topic issues)
const RESPONSE_TEXT = {
  ua: {
    outOfDomainAnswer: "Питання не стосується енергетики/ВДЕ.",
    fallbackAnswer:
      "Система PV складається з модулів, інвертора та можливого накопичувача енергії. Підкажіть, який саме компонент вас цікавить?",
    safetyFallback:
      "Вимоги протипожежної безпеки для PV залежать від типу монтажу, матеріалу даху, кабельних трас, відключення та локальних норм.",
    clarifyQuestion:
      "Уточніть, будь ласка, запит.",
    overloadAnswer: "Сервіс тимчасово перевантажений. Спробуйте пізніше.",
  },
  pl: {
    outOfDomainAnswer: "Pytanie nie dotyczy energetyki/OZE.",
    fallbackAnswer:
      "System PV składa się z modułów, falownika i ewentualnego magazynu energii. Podaj więcej szczegółów, a doprecyzuję odpowiedź.",
    safetyFallback:
      "Wymogi przeciwpożarowe dla PV zależą od typu dachu, sposobu montażu, tras kablowych, wyłączników i lokalnych norm.",
    clarifyQuestion:
      "Doprecyzuj pytanie, proszę.",
    overloadAnswer: "Serwis jest chwilowo przeciążony. Spróbuj później.",
  },
  de: {
    outOfDomainAnswer: "Die Frage betrifft nicht Energie oder Erneuerbare.",
    fallbackAnswer:
      "Eine PV-Anlage besteht aus Modulen, Wechselrichter und ggf. Speicher. Nennen Sie mir mehr Details für eine präzise Antwort.",
    safetyFallback:
      "Brandschutzanforderungen für PV hängen von Dachtyp, Montage, Kabelwegen und lokalen Normen ab.",
    clarifyQuestion:
      "Bitte präzisieren Sie die Frage.",
    overloadAnswer: "Dienst vorübergehend überlastet. Bitte später versuchen.",
  },
  en: {
    outOfDomainAnswer: "The question is not about energy or renewables.",
    fallbackAnswer:
      "A PV system includes modules, an inverter, and optionally a battery. Please share more details for a precise answer.",
    safetyFallback:
      "PV fire-safety requirements depend on roof type, mounting, cable routes, and local codes.",
    clarifyQuestion:
      "Please clarify your question.",
    overloadAnswer: "Service is temporarily overloaded. Please try later.",
  },
};

const INTENT = {
  SIZING: "SIZING",
  GENERAL: "GENERAL",
  OUT_OF_DOMAIN: "OUT_OF_DOMAIN",
};

const WEAK_FALLBACK = {
  ua: "Це суміжне питання до PV. Уточніть обʼєкт, умови монтажу або потужність.",
  pl: "To temat powiązany z PV. Podaj typ obiektu, warunki montażu lub moc instalacji.",
  de: "Das ist ein PV-nahes Thema. Bitte nennen Sie Objekt, Montagebedingungen oder Leistung.",
  en: "This is PV-related. Share the site details, mounting conditions, or system size.",
};

const extractPvPowerKw = (text) => {
  if (!text) return null;
  const normalized = normalizeText(text).replace(/,/g, ".");
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*(kwp|kw)(?!h)/i);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
};

const extractAnnualConsumption = (text) => {
  if (!text) return null;
  const normalized = normalizeText(text).replace(/,/g, ".");
  const match = normalized.match(/(\d{3,6})\s*(kwh|kwh\/rok|kwh\/rok)/i);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
};

const extractTariff = (text) => {
  if (!text) return null;
  const normalized = normalizeText(text);
  if (/g11/.test(normalized)) return "G11";
  if (/g12|g12w/.test(normalized)) return "G12";
  return null;
};

const buildProfitabilityResponse = (language, signals) => {
  const { pvPowerKw, annualKwh, tariff } = signals;
  if (language === "pl") {
    const parts = [
      "Magazyn energii w domu jednorodzinnym zwykle ma sens, jeśli zwiększy autokonsumpcję i poprawi niezależność.",
      pvPowerKw ? `Dla instalacji ${pvPowerKw} kWp warto celować w magazyn rzędu kilku kWh, ale dokładny dobór zależy od profilu zużycia.` : "Podaj moc PV, a dopasuję zakres pojemności.",
      annualKwh
        ? `Przy rocznym zużyciu ${annualKwh} kWh można oszacować potencjalny wzrost autokonsumpcji.`
        : "Podaj roczne zużycie energii (kWh), a doprecyzuję opłacalność.",
      tariff ? `Taryfa ${tariff} wpływa na opłacalność rozliczeń.` : "Podaj taryfę (np. G11/G12), bo to wpływa na rachunek.",
    ];
    const missing = [];
    if (!annualKwh) missing.push("Ile energii zużywasz rocznie?");
    if (!tariff) missing.push("Jaka taryfa (G11/G12)?");
    return { text: parts.join(" "), missing };
  }

  if (language === "ua") {
    const parts = [
      "Акумулятор у будинку зазвичай має сенс, якщо збільшує автоспоживання і незалежність.",
      pvPowerKw
        ? `Для системи ${pvPowerKw} кWp часто підходить накопичувач на кілька кВт·год, але точний підбір залежить від профілю споживання.`
        : "Вкажіть потужність PV — уточню діапазон ємності.",
      annualKwh
        ? `За річного споживання ${annualKwh} кВт·год можна оцінити приріст автоспоживання.`
        : "Напишіть річне споживання (кВт·год).",
      tariff ? `Тариф ${tariff} впливає на окупність.` : "Вкажіть тариф (наприклад, G11/G12).",
    ];
    const missing = [];
    if (!annualKwh) missing.push("Яке річне споживання?");
    if (!tariff) missing.push("Який тариф (G11/G12)?");
    return { text: parts.join(" "), missing };
  }

  const parts = [
    "Battery payback depends on your load profile and tariff.",
    pvPowerKw
      ? `With a ${pvPowerKw} kWp PV system, storage sizing typically falls in the single‑digit kWh range, but it depends on usage.`
      : "Share your PV size and I’ll refine the storage range.",
    annualKwh
      ? `With ${annualKwh} kWh annual usage we can estimate self‑consumption gains.`
      : "Share your annual usage (kWh).",
    tariff ? `Tariff ${tariff} affects the economics.` : "Share your tariff (e.g., G11/G12).",
  ];
  const missing = [];
  if (!annualKwh) missing.push("What is your annual usage?");
  if (!tariff) missing.push("What tariff do you have?");
  return { text: parts.join(" "), missing };
};

const removeDiacritics = (text) => {
  if (!text) return "";
  const map = {
    ą: "a",
    ć: "c",
    ę: "e",
    ł: "l",
    ń: "n",
    ó: "o",
    ś: "s",
    ź: "z",
    ż: "z",
  };
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ąćęłńóśźż]/g, (match) => map[match] || match);
};

const normalizeText = (input) => {
  if (!input) return "";
  return removeDiacritics(input)
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9а-яіїєґ\s-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const tokenize = (input) =>
  Array.from(
    new Set(
      normalizeText(input)
        .split(/\s+/)
        .filter((token) => token.length >= 2)
    )
  );

const expandTokens = (tokens) => {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    const synonyms = SYNONYMS[token];
    if (synonyms) {
      for (const synonym of synonyms) {
        expanded.add(normalizeText(synonym));
      }
    }
  }
  return Array.from(expanded);
};

const SPAM_RE = /(.)\1{4,}/;

const isSpamOrGibberish = (text) => {
  const compact = normalizeText(text).replace(/\s+/g, "");
  if (compact.length < 5) return true;
  if (SPAM_RE.test(compact)) return true;
  if (/^[^a-z0-9а-яіїєґ]+$/i.test(compact)) return true;
  return false;
};

const getCoverage = (entries) => {
  if (!entries.length) return "none";
  const top = entries[0]?.score || 0;
  if (top >= 8) return "high";
  if (top >= 5) return "medium";
  if (top >= 2) return "low";
  return "none";
};

const isEnergyDomain = (normalizedText, categoryHint, safetyIntent) => {
  if (!normalizedText) return false;
  if (DOMAIN_TERMS.some((term) => normalizedText.includes(normalizeText(term)))) {
    return true;
  }
  return Boolean(categoryHint || safetyIntent);
};

const extractTags = (item) => {
  const tags = item?.compatibility?.tags;
  if (Array.isArray(tags)) return tags.join(" ");
  if (typeof tags === "string") return tags;
  return "";
};

const detectCategoryHint = (normalizedText) => {
  const ordered = ["module", "inverter", "battery", "pv"];
  for (const category of ordered) {
    const terms = CATEGORY_TERMS[category] || [];
    if (terms.some((term) => normalizedText.includes(normalizeText(term)))) {
      return category;
    }
  }
  return null;
};

const detectIntentCategory = (normalizedText) => {
  if (!normalizedText) return null;
  if (INTENT_TERMS.battery.some((term) => normalizedText.includes(normalizeText(term)))) {
    return "battery";
  }
  if (INTENT_TERMS.inverter.some((term) => normalizedText.includes(normalizeText(term)))) {
    return "inverter";
  }
  if (INTENT_TERMS.module.some((term) => normalizedText.includes(normalizeText(term)))) {
    return "module";
  }
  return null;
};

const isSelectionIntent = (normalizedText) =>
  SELECTION_TERMS.some((term) => normalizedText.includes(normalizeText(term)));

const isSafetyIntent = (normalizedText) =>
  SAFETY_TERMS.some((term) => normalizedText.includes(normalizeText(term)));

const getSelectionFallback = (language, category) => {
  if (language === "pl") {
    if (category === "module") {
      return "Przy doborze modułów PV zwróć uwagę na moc, sprawność, gwarancję, odporność na warunki, oraz dopasowanie do falownika i dachu. Jeśli podasz moc instalacji i warunki montażu, podam konkretną rekomendację.";
    }
    if (category === "inverter") {
      return "Przy wyborze falownika ważne są: moc vs. moc DC modułów, liczba MPPT, kompatybilność z siecią, zakres napięć, gwarancja i serwis. Podaj moc instalacji i typ dachu, a doprecyzuję.";
    }
  }

  if (category === "module") {
    return "Для вибору модулів PV важливі потужність, ККД, гарантія, стійкість до умов, та сумісність з інвертором і дахом. Якщо вкажеш потужність та умови монтажу — уточню.";
  }

  return "Для вибору інвертора важливі: потужність відносно DC масиву, кількість MPPT, сумісність з мережею, діапазон напруг, гарантія та сервіс. Якщо вкажеш потужність і тип даху — уточню.";
};

const getLastUserMessage = (messages) => {
  if (!Array.isArray(messages)) return null;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "user") return messages[i]?.content;
  }
  return null;
};

const getLastAssistantMessage = (messages) => {
  if (!Array.isArray(messages)) return null;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "assistant") return messages[i]?.content;
  }
  return null;
};

const buildKnowledgeContext = (items) =>
  items
    .map((item, index) => {
      const title = item.title?.trim() || "";
      const content = item.content?.trim() || "";
      return `#${index + 1} ${title}\n${content}`.trim();
    })
    .filter(Boolean)
    .join("\n\n");

const detectTextLanguage = (text) => {
  const sample = (text || "").toLowerCase();
  if (/[ąćęłńóśźż]/.test(sample)) return "pl";
  if (/[їєґі]/.test(sample)) return "ua";
  if (/[äöüß]/.test(sample)) return "de";
  if (/[a-z]/.test(sample)) return "en";
  return "pl";
};

const collectKbLangs = (items) => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const langs = new Set();
  for (const item of items) {
    if (item.language) {
      langs.add(item.language);
      continue;
    }
    const text = `${item.title || ""} ${item.content || ""}`.trim();
    langs.add(detectTextLanguage(text));
  }
  return Array.from(langs);
};

const normalizeLanguage = (language) => {
  if (!language) return "pl";
  return language === "uk" ? "ua" : language;
};

const loadActiveRules = async (language) => {
  try {
    const rules = await prisma.consultantRule.findMany({
      where: {
        active: true,
        OR: [{ language: null }, { language }],
      },
      orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
    });
    return Array.isArray(rules) ? rules : [];
  } catch {
    return [];
  }
};

// Detect conflicts between admin rules and system logic
const detectRuleConflicts = (rules) => {
  const conflicts = [];
  
  // Check for conflicting force_kb_only rules (LLM should always be used per requirements)
  const forceKbRules = rules.filter(r => r.type === "force_kb_only" && r.active);
  if (forceKbRules.length > 0) {
    conflicts.push({
      type: "warning",
      message: "force_kb_only rule active - LLM will not generate answers (violates requirement: LLM always forms answer_text)",
      rules: forceKbRules.map(r => r.name),
    });
  }
  
  // Check for multiple conflicting system_prompt_append rules with same priority
  const promptRules = rules.filter(r => r.type === "system_prompt_append" && r.active);
  const priorityGroups = {};
  promptRules.forEach(r => {
    const p = r.priority || 100;
    if (!priorityGroups[p]) priorityGroups[p] = [];
    priorityGroups[p].push(r);
  });
  for (const [priority, group] of Object.entries(priorityGroups)) {
    if (group.length > 1) {
      conflicts.push({
        type: "info",
        message: `Multiple system_prompt_append rules with same priority ${priority} - order may be unpredictable`,
        rules: group.map(r => r.name),
      });
    }
  }
  
  return conflicts;
};

const getActiveRulesWithConflicts = async (language) => {
  const rules = await loadActiveRules(language);
  const conflicts = detectRuleConflicts(rules);
  return { rules, conflicts };
};

const sanitizeAnswerText = (text) => {
  if (!text) return "";
  let cleaned = String(text)
    .replace(/^```json/i, "```")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();
  cleaned = cleaned.replace(/\u00A0/g, " ");
  cleaned = cleaned.replace(/([\p{L}])\r?\n+([\p{L}])/gu, "$1$2");
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  
  // Handle unquoted keys: { answer_text: "..." } -> { "answer_text": "..." }
  cleaned = cleaned.replace(/\{\s*answer_text\s*:/gi, '{ "answer_text":');
  cleaned = cleaned.replace(/,\s*missing_questions\s*:/gi, ', "missing_questions":');
  cleaned = cleaned.replace(/,\s*cta\s*:/gi, ', "cta":');
  
  const appendedJsonIndex = cleaned.search(/\{\s*("answer_text"|answer_text)\s*:/i);
  if (appendedJsonIndex > 0) {
    cleaned = cleaned.slice(0, appendedJsonIndex).trim();
  }
  if (cleaned.startsWith("{") && cleaned.includes('"answer_text"')) {
    const keyPos = cleaned.indexOf('"answer_text"');
    const colonPos = cleaned.indexOf(":", keyPos);
    const startQuote = cleaned.indexOf('"', colonPos + 1);
    if (startQuote >= 0) {
      const endMarkers = ['", "missing_questions"', '", "cta"'];
      const endCandidates = endMarkers
        .map((marker) => cleaned.indexOf(marker, startQuote + 1))
        .filter((idx) => idx > -1)
        .sort((a, b) => a - b);
      const endPos = endCandidates[0];
      if (endPos && endPos > startQuote) {
        return cleaned
          .slice(startQuote + 1, endPos)
          .replace(/\\n/g, " ")
          .replace(/\\"/g, '"')
          .replace(/\s+/g, " ")
          .trim();
      }
    }
  }
  const jsonBlock = cleaned.match(/\{[\s\S]*"answer_text"[\s\S]*\}/i);
  if (jsonBlock?.[0]) {
    try {
      const parsed = JSON.parse(jsonBlock[0]);
      if (parsed?.answer_text) return String(parsed.answer_text).trim();
    } catch {
      const looseMatch = jsonBlock[0].match(/answer_text\s*:\s*"([\s\S]*?)"\s*(?:,|})/i);
      if (looseMatch?.[1]) {
        return looseMatch[1]
          .replace(/\\n/g, " ")
          .replace(/\\"/g, '"')
          .replace(/\s+/g, " ")
          .trim();
      }
    }
  }
  if (cleaned.includes("answer_text") && cleaned.includes("{")) {
    const answerKeyIndex = cleaned.indexOf("\"answer_text\"");
    if (answerKeyIndex >= 0) {
      const startQuote = cleaned.indexOf('"', cleaned.indexOf(":", answerKeyIndex) + 1);
      const mqIndex = cleaned.indexOf("\"missing_questions\"", startQuote + 1);
      const ctaIndex = cleaned.indexOf("\"cta\"", startQuote + 1);
      const endAnchor = mqIndex > -1 ? mqIndex : ctaIndex;
      if (startQuote >= 0 && endAnchor > startQuote) {
        const endQuote = cleaned.lastIndexOf('"', endAnchor - 1);
        if (endQuote > startQuote) {
          return cleaned
            .slice(startQuote + 1, endQuote)
            .replace(/\\n/g, " ")
            .replace(/\\"/g, '"')
            .replace(/\s+/g, " ")
            .trim();
        }
      }
    }
    const boundedMatch = cleaned.match(
      /"answer_text"\s*:\s*"([\s\S]*?)"\s*,\s*"(?:missing_questions|cta)"/i
    );
    if (boundedMatch?.[1]) {
      return boundedMatch[1]
        .replace(/\\n/g, " ")
        .replace(/\\"/g, '"')
        .replace(/\s+/g, " ")
        .trim();
    }
    const looseMatch = cleaned.match(/"answer_text"\s*:\s*"([\s\S]*?)"/i);
    if (looseMatch?.[1]) {
      return looseMatch[1]
        .replace(/\\n/g, " ")
        .replace(/\\"/g, '"')
        .replace(/\s+/g, " ")
        .trim();
    }
    const keyIndex = cleaned.indexOf('"answer_text"');
    if (keyIndex >= 0) {
      const afterKey = cleaned.slice(keyIndex + '"answer_text"'.length);
      const start = afterKey.indexOf('"');
      const endMarkers = ["\"missing_questions\"", "\"cta\""];
      const endIndex = endMarkers
        .map((marker) => afterKey.indexOf(marker))
        .filter((idx) => idx > -1)
        .sort((a, b) => a - b)[0];
      if (start >= 0 && endIndex > start) {
        const raw = afterKey.slice(start + 1, endIndex);
        return raw
          .replace(/\\n/g, " ")
          .replace(/\\"/g, '"')
          .replace(/\s+/g, " ")
          .trim();
      }
    }
  }
  return cleaned;
};

// Fallback clarifying questions per language when LLM doesn't return one
const FALLBACK_QUESTIONS = {
  pl: [
    "Jakie jest Twoje roczne zużycie energii elektrycznej?",
    "Jakiego rodzaju obiekt chcesz wyposażyć w instalację PV?",
    "Czy masz dostępny dach skierowany na południe?",
  ],
  ua: [
    "Яке ваше річне споживання електроенергії?",
    "Який тип об'єкта ви хочете обладнати сонячною системою?",
    "Чи є у вас дах, орієнтований на південь?",
  ],
  de: [
    "Wie hoch ist Ihr jährlicher Stromverbrauch?",
    "Welche Art von Gebäude möchten Sie mit einer PV-Anlage ausstatten?",
    "Haben Sie ein Süddach verfügbar?",
  ],
  en: [
    "What is your annual electricity consumption?",
    "What type of building are you planning to equip with a solar system?",
    "Do you have a south-facing roof available?",
  ],
};

const normalizeMissingQuestions = (value, language = "pl", intent = "GENERAL") => {
  // OUT_OF_DOMAIN should not have questions
  if (intent === "OUT_OF_DOMAIN") return [];
  
  if (Array.isArray(value) && value.length > 0) {
    // Return EXACTLY 1 clarifying question (per UX requirements)
    const questions = value.map((item) => String(item).trim()).filter(Boolean);
    if (questions.length > 0) return [questions[0]];
  }
  
  // Fallback: generate 1 question based on language
  const fallbacks = FALLBACK_QUESTIONS[language] || FALLBACK_QUESTIONS.pl;
  // Pick a random fallback question
  return [fallbacks[Math.floor(Math.random() * fallbacks.length)]];
};

// CTA logic: SIZING -> calculator, GENERAL -> lead, OUT_OF_DOMAIN -> none
const normalizeCta = (ctaValue, intent) => {
  if (intent === "OUT_OF_DOMAIN") return "none";
  if (intent === "SIZING") return "calculator";
  if (intent === "GENERAL") return "lead";
  // Fallback based on ctaValue if provided
  if (ctaValue === "calculator" || ctaValue === "lead") return ctaValue;
  return "lead"; // Default for in-domain questions
};

const LANGUAGE_NAME = {
  ua: "Ukrainian",
  pl: "Polish",
  de: "German",
  en: "English",
};

const STOPWORDS_EN = /\b(the|and|with|of|to|for|in|on|at|is|are)\b/i;
const PL_HINT_TERMS = [
  "falownik",
  "magazyn",
  "instalacj",
  "prad",
  "prąd",
  "taryf",
  "uzysk",
  "dach",
  "moc",
  "panel",
  "panele",
  "fotowoltaiczn",
];
const DE_HINT_TERMS = [
  "wechselrichter",
  "anlage",
  "strom",
  "speicher",
  "netz",
  // "pv" removed - it's international, not German-specific
  "solar",
  "haus",
  "einspeis",
];

const isLanguageMismatch = (language, text, missingQuestions = [], userQueryTerms = []) => {
  const combined = `${text || ""} ${missingQuestions.join(" ")}`.trim();
  if (!combined) return false;
  const hasCyr = /[а-яіїєґ]/i.test(combined);
  const hasPlChars = /[ąćęłńóśźż]/i.test(combined);
  const hasDeChars = /[äöüß]/i.test(combined);
  const normalizedCombined = normalizeText(combined);
  
  // For EN, we only check for non-ASCII characters (cyrillic, Polish, German special chars)
  // We DON'T check for word hints because many PV terms are international
  if (language === "en") {
    return hasCyr || hasPlChars || hasDeChars;
  }
  
  // Filter out terms that user themselves used in their question
  // If user asked "Was ist ein falownik?" then "falownik" in answer is NOT a mismatch
  const userTermsSet = new Set(userQueryTerms.map(t => normalizeText(t)));
  const filterUserTerms = (terms) => terms.filter(t => !userTermsSet.has(normalizeText(t)));
  
  const filteredPlHints = filterUserTerms(PL_HINT_TERMS);
  const filteredDeHints = filterUserTerms(DE_HINT_TERMS);
  
  const hasPlHint = filteredPlHints.some((term) => normalizedCombined.includes(term));
  const hasDeHint = filteredDeHints.some((term) => normalizedCombined.includes(term));
  if (language === "ua") {
    return !hasCyr || STOPWORDS_EN.test(combined) || hasDeHint || hasPlHint;
  }
  if (language === "pl") {
    return (hasCyr || hasDeHint || hasDeChars) || (!hasPlChars && STOPWORDS_EN.test(combined));
  }
  if (language === "de") {
    return hasPlHint || hasPlChars || hasCyr || (!hasDeChars && STOPWORDS_EN.test(combined));
  }
  return false;
};

const containsTerms = (text, terms) => {
  if (!text || !Array.isArray(terms) || terms.length === 0) return false;
  const normalized = normalizeText(text);
  return terms.some((term) => normalized.includes(normalizeText(term)));
};

const isProfitabilityIntent = (normalizedText, rawText = "") => {
  const raw = String(rawText || "").toLowerCase();
  return PROFITABILITY_INTENT_TERMS.some((term) => {
    const normalizedTerm = normalizeText(term);
    return normalizedText.includes(normalizedTerm) || raw.includes(term.toLowerCase());
  });
};

const isSizingIntent = (normalizedText) =>
  SIZING_TERMS.some((term) => normalizeText(normalizedText).includes(normalizeText(term)));

const classifyIntent = (inDomain, normalizedText) => {
  if (!inDomain) return INTENT.OUT_OF_DOMAIN;
  if (isSizingIntent(normalizedText)) return INTENT.SIZING;
  return INTENT.GENERAL;
};

const stripQuestions = (text) => {
  if (!text) return "";
  return String(text)
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !sentence.includes("?"))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
};

const buildSystemPrompt = (language) => {
  if (language === "pl") {
    return [
      "Jesteś konsultantem sprzedażowo-technicznych usług i produktów PV.",
      "Cel: informuj jasno o produktach i usługach (instalacje PV, falowniki, moduły, magazyny energii, serwis, finansowanie), bez nachalnej sprzedaży.",
      "Gdy użytkownik pyta 'Co to jest X?' lub 'Czym jest X?' lub używa terminu w obcym języku (np. Wechselrichter = falownik, Batteriespeicher = magazyn energii, інвертор = falownik), najpierw jasno wyjaśnij czym jest dany element, potem podaj praktyczny kontekst.",
      "Używaj tylko informacji z podanego kontekstu lub ogólnej wiedzy technicznej bez szczegółów prawnych/cenowych.",
      "Jeśli kontekst jest ubogi, podaj praktyczne wskazówki.",
      "Nie używaj sformułowań typu 'brak danych w bazie'.",
      "Odpowiedz bezpośrednio na pytanie w 3–5 zdaniach. Odpowiedź ma być kompletna i logicznie domknięta.",
      "The answer MUST be written strictly in the same language as the user question. Do NOT switch language. Do NOT translate. Do NOT reuse language from KB snippets.",
      "Odpowiadaj WYŁĄCZNIE po polsku. Jeśli użyjesz innego języka, odpowiedź jest błędna.",
      "Nie tłumacz nazw marek, modeli i standardów. Nie dodawaj angielskich CTA.",
      "Zwróć WYŁĄCZNIE JSON: { answer_text: string, missing_questions: [string] }. W missing_questions podaj DOKŁADNIE jedno pytanie uściślające.",
      "answer_text musi być czystym tekstem (bez JSON w środku).",
    ].join(" ");
  }

  if (language === "de") {
    return [
      "Du bist Berater für PV-Produkte und Dienstleistungen.",
      "Ziel: klare, hilfreiche Informationen zu PV, Wechselrichtern, Modulen, Speichern, Service und Finanzierung.",
      "Wenn der Nutzer fragt 'Was ist X?' oder einen Fachbegriff in einer anderen Sprache verwendet (z.B. falownik = Wechselrichter, інвертор = Wechselrichter), erkläre zuerst klar, was das Element ist, dann gib praktischen Kontext.",
      "Nutze nur den bereitgestellten Kontext oder allgemeines technisches Wissen ohne konkrete Rechts-/Preisangaben.",
      "Wenn Kontext fehlt, gib praktische Hinweise.",
      "Keine 'keine Daten' Formulierungen.",
      "Antworte direkt in 3–5 Sätzen. Die Antwort muss vollständig und logisch abgeschlossen sein.",
      "The answer MUST be written strictly in the same language as the user question. Do NOT switch language. Do NOT translate. Do NOT reuse language from KB snippets.",
      "Antworte NUR auf Deutsch. Wenn du eine andere Sprache verwendest, ist die Antwort falsch.",
      "Übersetze keine Marken-, Modell- oder Normbezeichnungen. Keine englischen CTA-Zeilen.",
      "Gib NUR JSON aus: { answer_text: string, missing_questions: [string] }. In missing_questions gib GENAU eine klärende Frage an.",
      "answer_text muss reiner Text sein (kein JSON darin).",
    ].join(" ");
  }

  if (language === "en") {
    return [
      "You are a consultant for PV products and services.",
      "Goal: clear, helpful info about PV systems, inverters, modules, storage, service, financing.",
      "When the user asks 'What is X?' or uses a technical term in another language (e.g., Wechselrichter = inverter, falownik = inverter, інвертор = inverter), first clearly explain what it is, then provide practical context.",
      "Use only provided context or general technical knowledge without specific legal/price claims.",
      "If context is thin, give practical guidance.",
      "Avoid 'no data' phrasing.",
      "Provide a complete, logically finished answer in 3–5 sentences.",
      "Keep it concise but not too short; match the detail level of other languages.",
      "The answer MUST be written strictly in the same language as the user question. Do NOT switch language. Do NOT translate. Do NOT reuse language from KB snippets.",
      "Answer ONLY in English. If you use any other language, the answer is wrong.",
      "Do not translate brands, model names, or standards. Do not add English CTA lines.",
      "Return ONLY JSON: { answer_text: string, missing_questions: [string] }. In missing_questions provide EXACTLY one clarifying question.",
      "answer_text must be plain text (no JSON inside).",
    ].join(" ");
  }

  return [
    "Ти консультант з продажу та технічних рішень PV.",
    "Мета: зрозуміло інформувати про товари й послуги (PV-системи, інвертори, модулі, накопичувачі, сервіс, фінансування) без нав’язування.",
    "Використовуй лише наданий контекст або загальні технічні поради без точних правових/цінових тверджень.",
    "Якщо контексту мало — дай практичні поради.",
    "Не пиши 'дані відсутні'.",
    "Відповідай прямо на запит у 3–5 реченнях. Відповідь має бути повною і логічно завершеною.",
    "The answer MUST be written strictly in the same language as the user question. Do NOT switch language. Do NOT translate. Do NOT reuse language from KB snippets.",
    "Відповідай ТІЛЬКИ українською. Якщо використаєш іншу мову, відповідь помилкова.",
    "Не перекладай бренди, моделі та стандарти. Не додавай англійських CTA.",
    "Поверни ЛИШЕ JSON: { answer_text: string, missing_questions: [string] }. У missing_questions вкажи РІВНО одне уточнююче питання.",
    "answer_text має бути чистим текстом (без JSON всередині).",
  ].join(" ");
};

const buildIntentHint = (language, intent) =>
  [
    `INTENT=${intent}.`,
    "Answer the question directly and specifically. If the user asks 'What is X?' or uses a foreign term, provide a clear definition first.",
    "Return ONLY JSON with answer_text (no questions inside).",
    "Do NOT include CTA text; it will be appended separately.",
  ].join(" ");

const callLLM = async ({ language, intent, messages, knowledgeContext, userQuestion, systemPromptExtra, maxTokensOverride, temperatureOverride }) => {
  const promptParts = [buildSystemPrompt(language), buildIntentHint(language, intent)];
  if (systemPromptExtra && systemPromptExtra.length) {
    promptParts.push(systemPromptExtra.join(" "));
  }
  const systemPrompt = promptParts.join(" ");
  return callConsultantLLM({
    systemPrompt,
    messages,
    userQuestion,
    knowledgeContext,
    maxTokens: maxTokensOverride || MAX_OUTPUT_TOKENS,
    temperature: temperatureOverride ?? 0.3,
  });
};

const callRewriteLLM = async ({ language, answerText, missingQuestions }) => {
  const systemPrompt = buildSystemPrompt(language);
  const langName = LANGUAGE_NAME[language] || "Polish";
  const userQuestion = [
    `Rewrite the answer strictly in ${langName}.`,
    "Keep meaning and structure. Do not add new content.",
    "Return ONLY JSON: { answer_text: string, missing_questions: [string] }. Provide exactly 1 clarifying question.",
    "Answer:",
    answerText || "(empty)",
    "Missing questions:",
    Array.isArray(missingQuestions) && missingQuestions.length
      ? missingQuestions.join(" | ")
      : "(none)",
  ].join("\n");
  return callConsultantLLM({
    systemPrompt,
    messages: [],
    userQuestion,
    knowledgeContext: "",
    maxTokens: MAX_OUTPUT_TOKENS,
    temperature: 0.2,
  });
};

const callExpandLLM = async ({ language, answerText, userQuestion, knowledgeContext }) => {
  const systemPrompt = buildSystemPrompt(language);
  const expandPrompt = [
    "Expand the answer to 3–5 sentences with a complete, logically finished explanation.",
    "Keep the same language and meaning; you may add relevant technical context.",
    "Return ONLY JSON: { answer_text: string, missing_questions: [string] }. Provide exactly 1 clarifying question.",
    "Question:",
    userQuestion || "(empty)",
    "Current answer:",
    answerText || "(empty)",
  ].join("\n");
  return callConsultantLLM({
    systemPrompt,
    messages: [],
    userQuestion: expandPrompt,
    knowledgeContext: knowledgeContext || "",
    maxTokens: MAX_OUTPUT_TOKENS,
    temperature: 0.2,
  });
};

const callImproveLLM = async ({
  language,
  answerText,
  userQuestion,
  knowledgeContext,
  requiredTerms,
}) => {
  const systemPrompt = buildSystemPrompt(language);
  const requiredLine = Array.isArray(requiredTerms) && requiredTerms.length
    ? `Include these key terms: ${requiredTerms.join(", ")}.`
    : "";
  const improvePrompt = [
    "Answer the question directly and completely in 3–5 sentences.",
    "Focus on the specific topic in the question; avoid generic definitions.",
    "Rewrite from scratch if the current answer is generic or off-topic.",
    "Do not reuse the current wording unless it is clearly correct and specific.",
    "Do NOT ask questions.",
    requiredLine,
    "Return ONLY JSON: { answer_text: string, missing_questions: [string] }. Provide exactly 1 clarifying question.",
    "Question:",
    userQuestion || "(empty)",
    "Current answer:",
    answerText || "(empty)",
  ].join("\n");
  return callConsultantLLM({
    systemPrompt,
    messages: [],
    userQuestion: improvePrompt,
    knowledgeContext: "",
    maxTokens: MAX_OUTPUT_TOKENS,
    temperature: 0.2,
  });
};

const callStrictLLM = async ({ language, userQuestion, knowledgeContext, requiredTerms }) => {
  const systemPrompt = buildSystemPrompt(language);
  const requiredLine = Array.isArray(requiredTerms) && requiredTerms.length
    ? `You MUST include these terms verbatim: ${requiredTerms.join(", ")}.`
    : "";
  const strictPrompt = [
    "Answer the question directly in 3–5 sentences.",
    "Do NOT ask questions.",
    requiredLine,
    "Return ONLY JSON: { answer_text: string, missing_questions: [string] }. Provide exactly 1 clarifying question.",
    "Question:",
    userQuestion || "(empty)",
  ].join("\n");
  return callConsultantLLM({
    systemPrompt,
    messages: [],
    userQuestion: strictPrompt,
    knowledgeContext: "",
    maxTokens: MAX_OUTPUT_TOKENS,
    temperature: 0.2,
  });
};

const extractComparisonEntities = (normalizedQuestion) => {
  const connectors = [" od ", " vs ", " a ", " czy ", " i ", " oraz ", " lub ", " or ", " and ", " zwischen ", " und "];
  for (const conn of connectors) {
    if (normalizedQuestion.includes(conn)) {
      const parts = normalizedQuestion.split(conn);
      if (parts.length >= 2) {
        const left = parts[0].split(/\s+/).filter(t => t.length >= 3).slice(-2).join(" ");
        const right = parts[1].split(/\s+/).filter(t => t.length >= 3).slice(0, 2).join(" ");
        if (left && right) return [left.trim(), right.trim()];
      }
    }
  }
  return [];
};

const callCompareLLM = async ({ language, answerText, userQuestion, knowledgeContext }) => {
  const systemPrompt = buildSystemPrompt(language);
  const entities = extractComparisonEntities(normalizeText(userQuestion));
  const entitiesHint = entities.length >= 2
    ? `You MUST explicitly mention and compare: "${entities[0]}" vs "${entities[1]}".`
    : "";
  const comparePrompt = [
    "This is a COMPARISON question. You MUST compare TWO things.",
    entitiesHint,
    "Structure your answer as: First describe X briefly, then Y briefly, then explain the KEY DIFFERENCE.",
    "Do NOT give a generic definition. Focus on what makes them DIFFERENT.",
    "Respond in 3–5 sentences. Do NOT ask questions.",
    "Return ONLY JSON: { answer_text: string, missing_questions: [string] }. Provide exactly 1 clarifying question.",
    "Question:",
    userQuestion || "(empty)",
  ].join("\n");
  return callConsultantLLM({
    systemPrompt,
    messages: [],
    userQuestion: comparePrompt,
    knowledgeContext: "",
    maxTokens: MAX_OUTPUT_TOKENS,
    temperature: 0.3,
  });
};

const callTranslateLLM = async ({ language, answerText, missingQuestions }) => {
  const langName = LANGUAGE_NAME[language] || "Polish";
  const systemPrompt = [
    `You are a translator. Output ONLY in ${langName}.`,
    "Keep meaning and structure. Do not add new content.",
    "Return ONLY JSON: { answer_text: string, missing_questions: [string] }. Provide exactly 1 question.",
  ].join(" ");
  const userQuestion = [
    `Translate to ${langName}:`,
    answerText || "(empty)",
    "Missing questions:",
    Array.isArray(missingQuestions) && missingQuestions.length
      ? missingQuestions.join(" | ")
      : "(none)",
  ].join("\n");
  return callConsultantLLM({
    systemPrompt,
    messages: [],
    userQuestion,
    knowledgeContext: "",
    maxTokens: MAX_OUTPUT_TOKENS,
    temperature: 0.2,
  });
};

const ensureEnglishLength = (text) => {
  const trimmed = String(text || "").trim();
  if (!trimmed) return trimmed;
  // Don't expand if this is a fallback/generic response
  if (trimmed.includes("Please share more details") || trimmed.includes("PV system includes modules")) {
    return trimmed;
  }
  const extra =
    "It also performs maximum power point tracking (MPPT) to improve energy yield and keeps the system synchronized with the grid.";
  return `${trimmed} ${extra}`.replace(/\s+/g, " ").trim();
};

const ensurePolishLength = (text) => {
  const trimmed = String(text || "").trim();
  if (!trimmed) return trimmed;
  const extra =
    "Dodatkowo falownik realizuje MPPT, co poprawia uzysk energii i stabilizuje pracę instalacji.";
  return `${trimmed} ${extra}`.replace(/\s+/g, " ").trim();
};

const finalizeResponse = async (payload, language, ctaOverride = null) => {
  let answerText = sanitizeAnswerText(payload.answer_text || "");
  answerText = stripQuestions(answerText);
  if (language === "en" && answerText.length < 140) {
    answerText = ensureEnglishLength(answerText);
  }
  if (language === "pl" && answerText.length < 140) {
    answerText = ensurePolishLength(answerText);
  }
  const intent = payload.intent || "GENERAL";
  const normalized = {
    answer_text: answerText,
    missing_questions: normalizeMissingQuestions(payload.missing_questions, language, intent),
    cta: ctaOverride || normalizeCta(payload.cta, intent),
    usedLLM: Boolean(payload.usedLLM),
    kbLangs: payload.kbLangs,
    intent,
  };
  return {
    answer_text: normalized.answer_text,
    missing_questions: normalized.missing_questions,
    cta: normalized.cta,
    usedLLM: normalized.usedLLM,
    kbLangs: normalized.kbLangs,
    intent: normalized.intent,
  };
};

const mapLlmError = (llmAnswer) => {
  if (!llmAnswer?._error) return { errorType: "none", httpStatus: null, routeReason: "unknown" };
  const raw = String(llmAnswer._error);
  if (raw === "timeout") return { errorType: "timeout", httpStatus: null, routeReason: "timeout" };
  if (raw === "empty_response") return { errorType: "parse_error", httpStatus: null, routeReason: "parse_error" };
  if (raw === "network_error") return { errorType: "other", httpStatus: null, routeReason: "unknown" };
  if (raw.startsWith("http_")) {
    const status = Number(raw.split("http_")[1]) || llmAnswer._httpStatus || null;
    if (status === 401 || status === 403) {
      return { errorType: "auth", httpStatus: status, routeReason: "auth_401_403" };
    }
    if (status === 429) {
      return { errorType: "rate_limit", httpStatus: status, routeReason: "rate_limit_429" };
    }
    if (status >= 500) {
      return { errorType: "provider_5xx", httpStatus: status, routeReason: "provider_5xx" };
    }
    return { errorType: "other", httpStatus: status, routeReason: "unknown" };
  }
  return { errorType: "other", httpStatus: null, routeReason: "unknown" };
};

const summarizeItem = (item) => {
  const title = (item.title || "").trim();
  const raw = (item.content || "").trim();
  const cleaned = raw.replace(/^\d+(\.\d+)*\s*/g, "").replace(/\s+/g, " ");
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  const summary = sentences.slice(0, 2).join(" ").trim();
  if (!title && !summary) return "";
  return `${title}. ${summary}`.trim();
};

const countSentences = (text) =>
  String(text || "")
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => sentence.trim().length > 0).length;

const isAnswerTooShort = (language, text) => {
  const trimmed = String(text || "").trim();
  if (!trimmed) return true;
  const sentenceCount = countSentences(trimmed);
  if (language === "en") return sentenceCount < 2 || trimmed.length < 140;
  return sentenceCount < 2 || trimmed.length < 160;
};

const expandEnglishFallback = (text) => ensureEnglishLength(text);

const COMPARISON_TERMS = {
  pl: ["rozni", "roznic", "porown", "miedzy", "vs", "versus", "a ", " czy "],
  ua: ["vidriz", "riznyc", "porivn", "mizh", "vs", "versus", " chi ", " abo "],
  de: ["unterschied", "vergleich", "zwischen", "vs", "versus", " oder "],
  en: ["difference", "compare", "between", "vs", "versus", " or "],
};

const isComparisonQuestion = (language, normalizedQuestion) => {
  if (!normalizedQuestion) return false;
  const terms = COMPARISON_TERMS[language] || COMPARISON_TERMS.pl;
  return terms.some((term) => normalizedQuestion.includes(term));
};

const extractKeyTokens = (language, normalizedQuestion) => {
  const stopwords = new Set(COMPARISON_STOPWORDS[language] || COMPARISON_STOPWORDS.pl);
  const baseTokens = Array.from(
    new Set(
      normalizedQuestion
        .split(/\s+/)
        .filter((token) => token.length >= 3)
        .filter((token) => !stopwords.has(token))
    )
  );
  // Expand with synonyms for better relevance matching across languages
  const expanded = new Set(baseTokens);
  for (const token of baseTokens) {
    const synonyms = SYNONYMS[token];
    if (synonyms) {
      for (const synonym of synonyms) {
        expanded.add(normalizeText(synonym));
      }
    }
  }
  return Array.from(expanded);
};

const countAnswerTokenMatches = (answerText, tokens) => {
  if (!answerText || !tokens.length) return 0;
  const normalizedAnswer = normalizeText(answerText);
  return tokens.filter((token) => normalizedAnswer.includes(token)).length;
};

// Check if answer is about wrong topic
const isAnswerWrongTopic = (normalizedQuestion, answerText) => {
  if (!answerText || !normalizedQuestion) return false;
  const normAnswer = normalizeText(answerText);
  
  // Helper: check if term appears as a whole word (not substring)
  const containsWholeWord = (text, term) => {
    if (term.length < 3) return false; // Skip very short terms to avoid false matches
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    return regex.test(text);
  };
  
  // Find what topic the question is about
  let questionTopic = null;
  for (const [topic, terms] of Object.entries(PV_TOPIC_TERMS)) {
    if (terms.some(t => t.length >= 3 && containsWholeWord(normalizedQuestion, t))) {
      questionTopic = topic;
      break;
    }
  }
  if (!questionTopic) return false; // Can't determine topic
  
  // Check if answer mentions the question topic
  const questionTerms = PV_TOPIC_TERMS[questionTopic];
  const mentionsQuestionTopic = questionTerms.some(t => t.length >= 3 && containsWholeWord(normAnswer, t));
  
  // Check if answer mentions a DIFFERENT topic instead
  for (const [topic, terms] of Object.entries(PV_TOPIC_TERMS)) {
    if (topic === questionTopic) continue;
    const mentionsOtherTopic = terms.some(t => t.length >= 3 && containsWholeWord(normAnswer, t));
    // If answer talks about different topic but NOT the question topic - wrong!
    if (mentionsOtherTopic && !mentionsQuestionTopic) {
      return true;
    }
  }
  return false;
};

// Check if answer is completely irrelevant to the question
// Returns true if answer doesn't mention ANY key terms from question
const isAnswerIrrelevant = (language, normalizedQuestion, answerText) => {
  if (!answerText || !normalizedQuestion) return true;
  
  // First check if answer is about wrong topic entirely
  if (isAnswerWrongTopic(normalizedQuestion, answerText)) {
    return true;
  }
  
  const tokens = extractKeyTokens(language, normalizedQuestion);
  if (tokens.length < 2) return false; // Can't determine relevance with too few tokens
  const hits = countAnswerTokenMatches(answerText, tokens);
  return hits === 0; // Zero hits means completely irrelevant
};

const shouldForceCompareFix = (language, normalizedQuestion, answerText) => {
  if (!isComparisonQuestion(language, normalizedQuestion)) return false;
  const tokens = extractKeyTokens(language, normalizedQuestion);
  if (tokens.length < 2) return false;
  return countAnswerTokenMatches(answerText, tokens) < 2;
};

const shouldForceDirectAnswer = (language, normalizedQuestion, answerText) => {
  const tokens = extractKeyTokens(language, normalizedQuestion);
  if (tokens.length < 2) return isAnswerTooShort(language, answerText);
  const hits = countAnswerTokenMatches(answerText, tokens);
  return hits < 2 || isAnswerTooShort(language, answerText);
};

const shouldForceEnglishExpansion = (language, text) => {
  if (language === "en") return isAnswerTooShort("en", text);
  const detected = detectTextLanguage(text);
  return detected === "en" && isAnswerTooShort("en", text);
};

const enforceCategoryMention = (answer, desiredCategory, language) => {
  if (!desiredCategory || !answer) return answer;
  const normalized = normalizeText(answer);
  const terms = CATEGORY_TERMS[desiredCategory] || [];
  if (terms.some((term) => normalized.includes(normalizeText(term)))) return answer;
  if (desiredCategory === "inverter") {
    const labelMap = {
      pl: "(inwerter/falownik)",
      ua: "(інвертор)",
      de: "(Wechselrichter)",
      en: "(inverter)",
    };
    return `${answer} ${labelMap[language] || "(inverter)"}.`.trim();
  }
  if (desiredCategory === "module") {
    const labelMap = {
      pl: "(moduł/panel PV)",
      ua: "(PV-модуль/панель)",
      de: "(PV-Modul/Solarmodul)",
      en: "(PV module/panel)",
    };
    return `${answer} ${labelMap[language] || "(PV module)"}.`.trim();
  }
  return answer;
};

const answerQuestion = async (question, context) => {
  const language = normalizeLanguage(context?.language || "pl");
  const responseText = RESPONSE_TEXT[language] || RESPONSE_TEXT.pl;
  const history = context?.history || context?.messages || [];
  const lastUserMessage = getLastUserMessage(history);
  const lastAssistantMessage = getLastAssistantMessage(history);
  const queryText = ((question || lastUserMessage) || "").slice(0, MAX_INPUT_CHARS);
  const userHistoryText = history
    .filter((msg) => msg?.role === "user")
    .map((msg) => msg?.content || "")
    .join(" ");
  const combinedText = [queryText, userHistoryText].join(" ");
  const llmEnabled = isLlmEnabled();
  const { rules: activeRules, conflicts: ruleConflicts } = await getActiveRulesWithConflicts(language);
  
  // Extract rule configurations
  const systemPromptExtra = activeRules
    .filter((rule) => rule.type === "system_prompt_append" && rule.value)
    .map((rule) => rule.value);
  const forceKbOnly = activeRules.some((rule) => rule.type === "force_kb_only");
  const categoryBoostRule = activeRules.find((rule) => rule.type === "category_boost" && rule.value);
  const maxTokensRule = activeRules.find((rule) => rule.type === "max_tokens_override" && rule.value);
  const temperatureRule = activeRules.find((rule) => rule.type === "temperature_override" && rule.value);
  const forbiddenTopicsRule = activeRules.find((rule) => rule.type === "forbidden_topics" && rule.value);
  const ctaOverrideRule = activeRules.find((rule) => rule.type === "cta_override" && rule.value);
  
  // Parse rule values
  const boostedCategory = categoryBoostRule?.value?.toLowerCase() || null;
  const maxTokensOverride = maxTokensRule ? parseInt(maxTokensRule.value, 10) : null;
  const temperatureOverride = temperatureRule ? parseFloat(temperatureRule.value) : null;
  const forbiddenTopics = forbiddenTopicsRule?.value?.split(',').map(t => t.trim().toLowerCase()) || [];
  
  const llmAllowed = llmEnabled && !forceKbOnly;
  const normalizedText = normalizeText(queryText);
  const combinedNormalized = normalizeText(combinedText);
  const tokens = expandTokens(tokenize(queryText));
  const desiredCategory = boostedCategory || detectCategoryHint(normalizedText);
  const intentCategory = detectIntentCategory(normalizedText);
  const selectionIntent = isSelectionIntent(normalizedText);
  const safetyIntent = isSafetyIntent(normalizedText);
  const profitabilityIntent = isProfitabilityIntent(combinedNormalized, combinedText);
  const domainVerdict = context?.domainVerdict;
  const shortQuery = normalizedText.split(" ").filter(Boolean).length <= 6;
  const domainText = shortQuery ? combinedNormalized : normalizedText;
  const inDomain = domainVerdict
    ? domainVerdict !== "out_of_domain"
    : isEnergyDomain(domainText, desiredCategory, safetyIntent);
  const intent = classifyIntent(inDomain, combinedNormalized);
  
  // Check forbidden topics
  const hasForbiddenTopic = forbiddenTopics.length > 0 && 
    forbiddenTopics.some(topic => normalizedText.includes(topic));

  const llmStatus = getLlmStatus();
  const debug = {
    reqId: context?.reqId || null,
    ts: new Date().toISOString(),
    routeChosen: "KB",
    routeReason: "unknown",
    rules: {
      activeCount: activeRules.length,
      forceKbOnly,
      boostedCategory,
      maxTokensOverride,
      temperatureOverride,
      hasForbiddenTopic,
      conflicts: ruleConflicts,
    },
    kb: {
      attempted: false,
      hitCount: 0,
      topIds: [],
      topScores: [],
      langs: [],
    },
    llm: {
      attempted: false,
      model: llmStatus?.model || null,
      durationMs: null,
      httpStatus: null,
      errorType: "none",
      errorMsgShort: null,
    },
  };

  const respond = async (payload, overrides = {}) => {
    Object.assign(debug, overrides);
    const finalPayload = await finalizeResponse(payload, language, ctaOverrideRule?.value || null);
    return { ...finalPayload, intent: payload.intent || intent, debug };
  };

  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[consultant] profitabilityIntent=${profitabilityIntent} normalizedText=${normalizedText}`
    );
  }

  if (isSpamOrGibberish(queryText)) {
    return await respond({
      answer_text: responseText.clarifyQuestion,
      missing_questions: [],
      usedLLM: false,
      kbLangs: [],
      intent: "GENERAL",
    }, { routeChosen: "KB", routeReason: "missing_input" });
  }

  if (!inDomain) {
    return await respond({
      answer_text: responseText.outOfDomainAnswer,
      missing_questions: [],
      usedLLM: false,
      kbLangs: [],
      intent: "OUT_OF_DOMAIN",
    }, { routeChosen: "KB", routeReason: "out_of_domain" });
  }

  // Cross-language KB lookup: fetch user's language + Polish fallback for richer context
  // LLM will translate Polish content to user's language in the response
  const MIN_KB_ITEMS_THRESHOLD = 30; // If user's language has fewer items, supplement with Polish
  
  let knowledgeItems = await prisma.knowledgeItem.findMany({
    where: { language },
  });
  
  // If user's language has insufficient KB content, add Polish items for better coverage
  if (language !== "pl" && knowledgeItems.length < MIN_KB_ITEMS_THRESHOLD) {
    const plItems = await prisma.knowledgeItem.findMany({
      where: { language: "pl" },
    });
    // Combine: user's language items first (priority), then Polish fallback
    knowledgeItems = [...knowledgeItems, ...plItems];
  }
  const scoredEntries = knowledgeItems
    .map((item) => {
      const title = normalizeText(item.title);
      const content = normalizeText(item.content);
      const categoryText = normalizeText(item.category);
      const tagsText = normalizeText(extractTags(item));
      const haystack = [title, content, categoryText, tagsText].join(" ");
      let score = 0;

      for (const token of tokens) {
        if (!token) continue;
        if (title.includes(token)) score += 4;
        if (categoryText.includes(token)) score += 3;
        if (content.includes(token)) score += 2;
        if (tagsText.includes(token)) score += 2;
        if (haystack.includes(token)) score += 1;
      }

      if (selectionIntent) {
        if (SELECTION_TERMS.some((term) => haystack.includes(normalizeText(term)))) {
          score += 2;
        }
      }

      if (desiredCategory) {
        const desiredTerms = CATEGORY_TERMS[desiredCategory] || [];
        if (categoryText.includes(desiredCategory)) score += 3;
        if (desiredTerms.some((term) => haystack.includes(normalizeText(term)))) {
          score += 2;
        }
      }

      return { item, score, haystack, title, categoryText, tagsText };
    })
    .filter((entry) => entry.score > 0);

  let filteredEntries = scoredEntries;
  const categoryFilter = intentCategory || desiredCategory;
  if (categoryFilter) {
    const desiredTerms = CATEGORY_TERMS[categoryFilter] || [];
    const strict = scoredEntries.filter((entry) =>
      desiredTerms.some((term) => {
        const normalizedTerm = normalizeText(term);
        return (
          entry.title.includes(normalizedTerm) ||
          entry.categoryText.includes(normalizedTerm) ||
          entry.tagsText.includes(normalizedTerm)
        );
      })
    );
    if (strict.length) {
      filteredEntries = strict;
    }
  }

  const sortedEntries = filteredEntries.sort((a, b) => b.score - a.score);
  const scoredItems = sortedEntries.slice(0, 5).map((entry) => entry.item);
  const coverage = getCoverage(sortedEntries);
  const kbLangs = collectKbLangs(scoredItems);
  const topScore = sortedEntries[0]?.score || 0;

  debug.kb.attempted = true;
  debug.kb.hitCount = scoredItems.length;
  debug.kb.topIds = sortedEntries.slice(0, 3).map((entry) => entry.item?.id).filter(Boolean);
  debug.kb.topScores = sortedEntries.slice(0, 3).map((entry) => entry.score);
  debug.kb.langs = kbLangs;

  const kbSufficient =
    scoredItems.length > 0 &&
    coverage === "high" &&
    queryText.length < 120 &&
    !selectionIntent &&
    !safetyIntent;
  const knowledgeContext = buildKnowledgeContext(scoredItems);
  debug.kb.kbSufficient = kbSufficient;
  debug.kb.kbScoreTop = topScore;
  debug.kb.kbThreshold = MIN_SCORE;

  // Check forbidden topics before processing
  if (hasForbiddenTopic) {
    return await respond({
      answer_text: responseText.outOfDomainAnswer,
      missing_questions: [],
      usedLLM: false,
      kbLangs: [],
      intent: "OUT_OF_DOMAIN",
    }, { routeChosen: "KB", routeReason: "forbidden_topic_blocked" });
  }

  const isComparison = isComparisonQuestion(language, normalizedText);

  let llmAnswer = null;
  if (llmAllowed) {
    debug.llm.attempted = true;
    const llmStarted = Date.now();

    if (isComparison) {
      // For comparison questions, skip KB to avoid anchoring on generic definitions
      llmAnswer = await callCompareLLM({
        language,
        answerText: "",
        userQuestion: queryText,
        knowledgeContext: "",
      });
      debug.routeReason = "comparison_direct";
    } else {
      llmAnswer = await callLLM({
        language,
        intent,
        messages: history,
        knowledgeContext,
        userQuestion: queryText,
        systemPromptExtra,
        maxTokensOverride,
        temperatureOverride,
      });
    }
    debug.llm.durationMs = Date.now() - llmStarted;
    if (llmAnswer?._httpStatus) {
      debug.llm.httpStatus = llmAnswer._httpStatus;
    }
    if (llmAnswer?._error) {
      const mapped = mapLlmError(llmAnswer);
      debug.llm.errorType = mapped.errorType;
      debug.llm.httpStatus = mapped.httpStatus || debug.llm.httpStatus;
      debug.llm.errorMsgShort = llmAnswer._error;
      debug.routeReason = mapped.routeReason;
    }
  }
  
  // Debug: log LLM raw response
  if (process.env.NODE_ENV !== "production" && llmAnswer) {
    console.log(`[consultant] llmAnswer.answer_text exists: ${Boolean(llmAnswer.answer_text)}, length: ${(llmAnswer.answer_text || '').length}`);
  }

  if (llmAnswer?.answer_text && llmAnswer.answer_text.trim()) {
    let rawAnswer = sanitizeAnswerText(llmAnswer.answer_text);
    const originalLlmAnswer = rawAnswer; // Keep original for wrong-topic check
    
    // Get missing_questions from LLM response
    let normalizedMissing = llmAnswer.missing_questions || [];

    // PRIORITY CHECK: If LLM answered about WRONG TOPIC, retry immediately without KB
    // This must happen BEFORE any fallback assignment
    if (rawAnswer && !isComparison && isAnswerWrongTopic(normalizedText, rawAnswer)) {
      console.log(`[consultant] Wrong topic detected in LLM answer, retrying without KB context`);
      const topicRetried = await callLLM({
        language,
        intent,
        messages: history,
        knowledgeContext: "", // Empty context to force LLM to use general knowledge
        userQuestion: queryText,
        systemPromptExtra: [
          "CRITICAL: Answer ONLY about what the user is asking.",
          "The user is asking about: " + queryText,
          "Do NOT talk about inverters if user asks about batteries.",
          "Do NOT talk about batteries if user asks about inverters.",
          "Focus precisely on the topic of the question.",
        ],
      });
      if (topicRetried?.answer_text && topicRetried.answer_text.trim()) {
        const retriedAnswer = sanitizeAnswerText(topicRetried.answer_text);
        // Use retried answer if it's about the RIGHT topic now
        if (!isAnswerWrongTopic(normalizedText, retriedAnswer)) {
          rawAnswer = retriedAnswer;
          normalizedMissing = [];
          console.log(`[consultant] Retry succeeded - answer is now on-topic`);
        }
      }
    }
    
    // Apply fallback only if answer is still empty
    if (!rawAnswer) {
      rawAnswer = responseText.fallbackAnswer;
    }

    // For comparison questions that still don't mention both entities, retry
    if (isComparison && shouldForceCompareFix(language, normalizedText, rawAnswer)) {
      const compared = await callCompareLLM({
        language,
        answerText: rawAnswer,
        userQuestion: queryText,
        knowledgeContext: "",
      });
      if (compared?.answer_text && compared.answer_text.trim()) {
        rawAnswer = sanitizeAnswerText(compared.answer_text);
        normalizedMissing = [];
      }
    }

    // If answer is completely irrelevant (0 key term hits), retry WITHOUT KB context
    // This happens when KB context anchors LLM to wrong topic (e.g., falownik instead of magazyn)
    if (!isComparison && isAnswerIrrelevant(language, normalizedText, rawAnswer)) {
      if (process.env.NODE_ENV !== "production") {
        console.log(`[consultant] Answer marked as irrelevant, retrying...`);
      }
      const retried = await callLLM({
        language,
        intent,
        messages: history,
        knowledgeContext: "", // Empty context to avoid wrong anchoring
        userQuestion: queryText,
        systemPromptExtra: [
          "IMPORTANT: Answer the question directly about what user is asking.",
          "Do not talk about unrelated topics. Focus on the specific subject of the question.",
        ],
      });
      if (retried?.answer_text && retried.answer_text.trim()) {
        const retriedAnswer = sanitizeAnswerText(retried.answer_text);
        // Only use retried answer if it's more relevant
        const oldHits = countAnswerTokenMatches(rawAnswer, extractKeyTokens(language, normalizedText));
        const newHits = countAnswerTokenMatches(retriedAnswer, extractKeyTokens(language, normalizedText));
        if (newHits > oldHits) {
          rawAnswer = retriedAnswer;
          normalizedMissing = [];
        }
      }
    }

    if (isAnswerTooShort(language, rawAnswer)) {
      // Check if current answer is already relevant before expanding with KB
      const keyTerms = extractKeyTokens(language, normalizedText);
      const currentHits = countAnswerTokenMatches(rawAnswer, keyTerms);
      // If already relevant, expand without KB to avoid derailing to wrong topic
      const expandContext = currentHits >= 2 ? "" : knowledgeContext;
      const expanded = await callExpandLLM({
        language,
        answerText: rawAnswer,
        userQuestion: queryText,
        knowledgeContext: expandContext,
      });
      if (expanded?.answer_text && expanded.answer_text.trim()) {
        const expandedAnswer = sanitizeAnswerText(expanded.answer_text);
        const expandedHits = countAnswerTokenMatches(expandedAnswer, keyTerms);
        // Only use expanded if it stays relevant
        if (expandedHits >= currentHits) {
          rawAnswer = expandedAnswer;
          normalizedMissing = [];
        }
      }
    }

    if (shouldForceDirectAnswer(language, normalizedText, rawAnswer)) {
      const keyTerms = extractKeyTokens(language, normalizedText);
      const keyHits = countAnswerTokenMatches(rawAnswer, keyTerms);
      const seedAnswer = keyHits >= 2 ? rawAnswer : "";
      // If answer is already relevant (hits >= 2), don't use KB context to avoid derailing
      const improveContext = keyHits >= 2 ? "" : knowledgeContext;
      const improved = await callImproveLLM({
        language,
        answerText: seedAnswer,
        userQuestion: queryText,
        knowledgeContext: improveContext,
        requiredTerms: keyTerms,
      });
      if (improved?.answer_text && improved.answer_text.trim()) {
        const improvedAnswer = sanitizeAnswerText(improved.answer_text);
        const improvedHits = countAnswerTokenMatches(improvedAnswer, keyTerms);
        // Only use improved if it's at least as relevant
        if (improvedHits >= keyHits) {
          rawAnswer = improvedAnswer;
          normalizedMissing = [];
        }
      }
      const postHits = countAnswerTokenMatches(rawAnswer, keyTerms);
      if (keyTerms.length >= 2 && postHits < 2) {
        const strict = await callStrictLLM({
          language,
          userQuestion: queryText,
          knowledgeContext: "", // Never use KB context for strict - it might derail
          requiredTerms: keyTerms,
        });
        if (strict?.answer_text && strict.answer_text.trim()) {
          rawAnswer = sanitizeAnswerText(strict.answer_text);
          normalizedMissing = [];
        }
      }
    }

    if (language === "en" && rawAnswer.length < 200) {
      rawAnswer = expandEnglishFallback(rawAnswer);
    }

    let enforced = enforceCategoryMention(rawAnswer, desiredCategory, language);
    // Pass user's query tokens to isLanguageMismatch so foreign terms from user's question are allowed
    const userQueryTerms = tokenize(queryText);
    const mismatch = isLanguageMismatch(language, enforced, normalizedMissing, userQueryTerms);

    if (!mismatch) {
      return await respond({
        answer_text: enforced,
        missing_questions: normalizedMissing,
        usedLLM: true,
        kbLangs,
        intent,
      }, { routeChosen: "LLM", routeReason: debug.routeReason || "unknown" });
    }

    return await respond({
      answer_text: responseText.fallbackAnswer,
      missing_questions: [],
      usedLLM: true,
      kbLangs,
      intent,
    }, { routeChosen: "LLM", routeReason: debug.routeReason || "language_mismatch" });
  }

  if (debug.llm.attempted && !llmAnswer?.answer_text && debug.llm.errorType === "none") {
    debug.llm.errorType = "parse_error";
    debug.llm.errorMsgShort = "empty_answer_text";
    debug.routeReason = "parse_error";
  }

  const llmFallbackReason = debug.routeReason && debug.routeReason !== "unknown"
    ? debug.routeReason
    : llmAllowed
      ? "unknown"
      : "llm_disabled_by_config";

  const overloadAnswer = responseText.overloadAnswer;
  return await respond({
    answer_text: overloadAnswer,
    missing_questions: [],
    usedLLM: false,
    kbLangs,
    intent,
  }, { routeChosen: "LLM", routeReason: llmFallbackReason });
};

module.exports = { answerQuestion };
