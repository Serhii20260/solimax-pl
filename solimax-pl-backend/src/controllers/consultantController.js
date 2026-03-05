const crypto = require("crypto");
const {
  consultantAskSchema,
  consultantLeadSchema,
} = require("../validation/consultantSchemas");
const { answerQuestion } = require("../services/consultantService");
const { processLead } = require("../services/leadService");
const { getLlmStatus } = require("../services/llmClient");
const { analyzeDomain } = require("../services/domainGuard");
const prisma = require("../db/prisma");

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

const normalizeText = (input) =>
  removeDiacritics(input)
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9а-яіїєґ\s-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const getQuestionRaw = (value) => (value || "").slice(0, 50);

const detectLanguage = (text) => {
  const sample = (text || "").toLowerCase().trim();
  if (!sample) return null;
  
  // 1. Script-based detection (100% reliable)
  if (/\p{Script=Cyrillic}/u.test(sample)) return "ua";
  if (/[ąćęłńóśźż]/.test(sample)) return "pl";
  if (/[äöüß]/.test(sample)) return "de";

  // 2. Word-based detection - count matches across ALL words
  // Clean sample: remove punctuation but keep German umlauts
  const cleanSample = sample.replace(/[^a-zäöüß\s]/gi, " ").replace(/\s+/g, " ").trim();
  const words = cleanSample.split(/\s+/).filter(w => w.length > 0);
  
  // Expanded word lists for accurate detection
  const enSet = new Set(["what","how","which","why","when","where","who","is","are","do","does","can","could","would","should","will","have","has","the","a","an","i","my","your","it","this","that","for","with","from","about","into","of","to","and","or","but","if","so","at","by","on","in","as","be","was","were","been","being","not","no","yes","very","just","also","only","more","most","some","any","all","each","every","both","few","many","much","other","another","such","own","same","than","then","too","now","here","there","because","although","though","while","before","after","since","until","unless","whether","either","neither","nor","yet","still","already","always","never","often","sometimes","usually","probably","maybe","perhaps","really","actually","certainly","definitely","possibly","likely","unlikely","home","house","cost","price","install","installation","battery","panel","solar","energy","power","system","worth","need","want","get","make","take","give","know","think","see","come","go","find","use","tell","ask","work","seem","feel","try","leave","call","keep","let","begin","help","show","hear","play","run","move","live","believe","bring","happen","write","provide","sit","stand","lose","pay","meet","include","continue","set","learn","change","lead","understand","watch","follow","stop","create","speak","read","allow","add","spend","grow","open","walk","win","offer","remember","love","consider","appear","buy","wait","serve","die","send","expect","build","stay","fall","cut","reach","kill","remain","suggest","raise","pass","sell","require","report","decide","pull","inverter","roof","efficiency","kwh","kwp","storage"]);
  const plSet = new Set(["co","jak","jaki","jaka","jakie","jakim","czy","ile","gdzie","kiedy","dlaczego","kto","moj","moja","moje","chce","potrzebuje","jest","sa","to","ten","ta","te","tym","tego","tej","tych","na","do","od","dla","za","po","przed","przy","nad","pod","miedzy","bez","przez","oraz","lub","albo","ale","jednak","jesli","gdy","bo","poniewaz","ze","iz","tylko","juz","jeszcze","bardzo","tak","nie","moze","trzeba","mozna","nalezy","warto","dobrze","lepiej","najlepiej","gorzej","najbardziej","mniej","wiecej","duzo","malo","pare","kilka","wszystko","nic","cos","ktos","nikt","kazdy","zaden","inny","taki","sam","swoj","nasz","wasz","ich","dom","domu","magazyn","falownik","instalacji","fotowoltaiczny","polsce","polska","rocznie","taryfa","energia","panel","bateria","system","cena","koszt","moc","prad","siec","hybryda","dach","ile","kw","kwh","kwp"]);
  const deSet = new Set(["was","wie","welche","welcher","welches","warum","wann","wo","wer","ist","sind","sein","war","waren","wird","werden","wurde","wurden","hat","haben","hatte","hatten","kann","konnen","können","konnte","konnten","muss","mussen","müssen","musste","mussten","soll","sollen","sollte","sollten","will","wollen","wollte","wollten","darf","durfen","dürfen","durfte","durften","mag","mogen","mögen","mochte","möchte","mochten","möchten","der","die","das","den","dem","des","ein","eine","einen","einem","einer","eines","und","oder","aber","denn","weil","wenn","als","ob","dass","damit","obwohl","obgleich","wahrend","während","bevor","nachdem","seit","bis","falls","sofern","soweit","nicht","kein","keine","keinen","keinem","keiner","keines","ja","nein","doch","schon","noch","auch","nur","sehr","viel","mehr","weniger","am","im","an","auf","bei","durch","fur","für","gegen","hinter","mit","nach","neben","ohne","uber","über","um","unter","von","vor","zu","zwischen","ich","du","er","sie","es","wir","ihr","mein","meine","dein","deine","seine","unser","unsere","euer","eure","lohnt","brauche","habe","gibt","haus","strom","speicher","anlage","batterie","energie","kosten","preis","netz","wechselrichter","hybridwechselrichter","photovoltaik","rentiert","sich","hohem","verbrauch","abend"]);

  let enCount = 0, plCount = 0, deCount = 0;
  
  for (const word of words) {
    if (enSet.has(word)) enCount++;
    if (plSet.has(word)) plCount++;
    if (deSet.has(word)) deCount++;
  }

  // Return language with most matches (minimum 1 match required)
  const max = Math.max(enCount, plCount, deCount);
  if (max === 0) return null;
  
  if (enCount === max) return "en";
  if (deCount === max) return "de";
  if (plCount === max) return "pl";
  
  return null;
};

const normalizeLang = (value) => {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "uk") return "ua";
  if (["ua", "pl", "de", "en"].includes(normalized)) return normalized;
  return null;
};

const pickLanguage = (text, fallback) => detectLanguage(text) || fallback || "pl";

const resolveLanguage = ({
  text,
  payloadLanguage,
  languagePolicy,
}) => {
  const detected = detectLanguage(text);
  const fallback = payloadLanguage || "pl";

  if (languagePolicy === "payload_only") {
    return payloadLanguage || "pl";
  }
  if (languagePolicy === "detect_only") {
    return detected || "pl";
  }
  if (languagePolicy === "payload_then_detect") {
    return payloadLanguage || detected || "pl";
  }
  if (languagePolicy === "detect_then_payload") {
    return detected || payloadLanguage || "pl";
  }

  return pickLanguage(text, fallback);
};

const MAX_HISTORY_ITEMS = Number(process.env.MAX_HISTORY_ITEMS || 10);

const askConsultant = async (req, res, next) => {
  try {
    const startedAt = Date.now();
    const reqId = crypto.randomUUID();
    const payload = consultantAskSchema.parse(req.body);
    const incomingHistory = payload.history || payload.messages || [];
    const history = incomingHistory.slice(-MAX_HISTORY_ITEMS);
    const message = payload.message || payload.question;
    const lastUserMessage = history
      .slice()
      .reverse()
      .find((msg) => msg.role === "user")?.content;
    const queryText = message || lastUserMessage || "";
    const combinedText = [queryText, ...history.map((msg) => msg?.content || "")].join(" ");
    const shortQuery = queryText.trim().split(/\s+/).filter(Boolean).length <= 6;
    const detectedLanguage = detectLanguage(queryText);
    const languageRaw = payload.language || payload.lang || payload.context?.language || null;
    const languageFallback = normalizeLang(languageRaw);
    const rules = await prisma.consultantRule.findMany({
      where: {
        active: true,
        OR: [{ language: null }, { language: languageFallback || undefined }],
      },
      orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
    });
    const languagePolicy =
      rules.find((rule) => rule.type === "language_source")?.value || null;
    const language = resolveLanguage({
      text: queryText,
      payloadLanguage: languageFallback,
      languagePolicy,
    });
    const responseLanguage = language;
    const domain = analyzeDomain(shortQuery ? combinedText : queryText);
    const questionRaw = getQuestionRaw(queryText);
    const questionLenBeforeNormalize = queryText.length;
    const questionLenAfterNormalize = normalizeText(queryText).length;

    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[consultant] domain=${domain.verdict.replace("in_domain_", "") || "out"} ` +
          `matchedKeywordsCount=${domain.matchedKeywordsCount} ` +
          `rateLimited=${res.locals.rateLimited === true}`
      );
    }

    // Hard block: negative keywords found (spam, off-topic stopwords)
    if (domain.verdict === "out_of_domain") {
      const outMap = {
        pl: "Pytanie nie dotyczy energetyki/OZE.",
        ua: "Питання не стосується енергетики/ВДЕ.",
        de: "Die Frage betrifft nicht Energie oder Erneuerbare.",
        en: "The question is not about energy or renewables.",
      };
      const response = {
        answer_text: outMap[language] || outMap.pl,
        missing_questions: [],
        cta: "none",
        meta: { usedLLM: false, language: responseLanguage },
      };

      console.log("[CONSULTANT TRACE]", {
        question: queryText,
        languageFromPayload: payload.language || payload.lang || payload.context?.language || null,
        detectedLanguage,
        routeChosen: "KB",
        answerLanguage: detectLanguage(response.answer_text),
        followupLanguage: detectLanguage((response.missing_questions || []).join(" ")),
        ctaLanguage: null,
      });

      if (process.env.NODE_ENV !== "production") {
        const latency = Date.now() - startedAt;
        console.log(
          `[consultant] domainDecision=out kbMatches=0 kbCoverage=none ` +
            `tokens=${queryText.length} latencyMs=${latency}`
        );
      }

      return res.json(response);
    }

    // Soft out_of_domain: no PV terms found, but no negative words either
    // Offer calculator/lead form with polite message
    if (domain.verdict === "out_of_domain_soft") {
      const softOutMap = {
        pl: "Przepraszamy, na ten moment nie znaleziono w bazie informacji pasujących do Twojego zapytania. Skorzystaj z naszego kalkulatora lub zostaw zapytanie, a nasz konsultant skontaktuje się z Tobą.",
        ua: "Вибачте, на даний момент за вашим запитом потрібної інформації в базі не знайдено. Скористайтеся нашим калькулятором або залиште заявку, і наш консультант зв'яжеться з вами.",
        de: "Entschuldigung, zu Ihrer Anfrage wurden derzeit keine passenden Informationen in der Datenbank gefunden. Nutzen Sie unseren Rechner oder hinterlassen Sie eine Anfrage, und unser Berater wird sich bei Ihnen melden.",
        en: "Sorry, no matching information was found in the database for your query at this time. Please use our calculator or leave a request, and our consultant will contact you.",
      };
      const response = {
        answer_text: softOutMap[language] || softOutMap.pl,
        missing_questions: [],
        cta: "calculator",
        meta: { usedLLM: false, language: responseLanguage },
      };

      console.log("[CONSULTANT TRACE]", {
        question: queryText,
        languageFromPayload: payload.language || payload.lang || payload.context?.language || null,
        detectedLanguage,
        routeChosen: "SOFT_OUT",
        answerLanguage: detectLanguage(response.answer_text),
        followupLanguage: null,
        ctaLanguage: null,
      });

      if (process.env.NODE_ENV !== "production") {
        const latency = Date.now() - startedAt;
        console.log(
          `[consultant] domainDecision=soft_out kbMatches=0 kbCoverage=none ` +
            `tokens=${queryText.length} latencyMs=${latency}`
        );
      }

      return res.json(response);
    }

    const response = await answerQuestion(message, {
      language,
      history,
      sessionId: payload.sessionId,
      page: payload.page || payload.context?.page,
      domainVerdict: domain.verdict,
      reqId,
    });
    const responseDebug = response.debug || {};
    const debugPayload = {
      reqId,
      ts: new Date().toISOString(),
      routeChosen: responseDebug.routeChosen || (response.usedLLM ? "LLM" : "KB"),
      routeReason: responseDebug.routeReason || "unknown",
      input: {
        languageRaw,
        languageNormalized: ["ua", "pl", "de", "en"].includes(responseLanguage)
          ? responseLanguage
          : "unknown",
        questionLen: queryText.length,
        questionRaw,
        questionLenBeforeNormalize,
        questionLenAfterNormalize,
        historyLen: history.length,
        userAgent: req.get("user-agent") || undefined,
        payloadKeys: {
          hasQuestion: Boolean(payload.question || payload.message),
          hasLanguage: Boolean(languageRaw),
          hasHistory: history.length > 0,
        },
      },
      config: {
        LLM_MODE: process.env.LLM_MODE || process.env.CONSULTANT_LLM_MODE || "unknown",
        KB_PREFERRED_LANG: process.env.KB_PREFERRED_LANG || undefined,
        FORCE_KB_FOR_LANGS: process.env.FORCE_KB_FOR_LANGS
          ? process.env.FORCE_KB_FOR_LANGS.split(",").map((lang) => lang.trim()).filter(Boolean)
          : undefined,
        DEFAULT_LANG: process.env.DEFAULT_LANG || undefined,
        MODEL: getLlmStatus().model,
      },
      kb: responseDebug.kb || {
        attempted: false,
        hitCount: 0,
        topIds: [],
        topScores: [],
        langs: [],
        kbSufficient: false,
        kbScoreTop: null,
        kbThreshold: null,
      },
      llm: responseDebug.llm || {
        attempted: false,
        model: getLlmStatus().model,
        durationMs: null,
        httpStatus: null,
        errorType: "none",
        errorMsgShort: null,
      },
    };
    const finalResponse = {
      answer_text: response.answer_text || "",
      missing_questions: Array.isArray(response.missing_questions)
        ? response.missing_questions
        : [],
      cta: response.cta || "none",
      meta: {
        usedLLM: response.usedLLM === true,
        language: responseLanguage,
        intent: response.intent || "unknown",
        cta: response.cta || "none",
        ...(Array.isArray(response.kbLangs) && response.kbLangs.length
          ? { kbLangs: response.kbLangs }
          : {}),
        ...(process.env.NODE_ENV !== "production" ? { debug: debugPayload } : {}),
      },
    };

    console.log("[CONSULTANT TRACE]", {
      question: queryText,
      languageFromPayload: payload.language || payload.lang || payload.context?.language || null,
      detectedLanguage,
      routeChosen: responseDebug.routeChosen || (response.usedLLM ? "LLM" : "KB"),
      answerLanguage: detectLanguage(finalResponse.answer_text),
      followupLanguage: detectLanguage((finalResponse.missing_questions || []).join(" ")),
      ctaLanguage: null,
    });

    if (process.env.NODE_ENV !== "production") {
      const latency = Date.now() - startedAt;
      console.log(
        `[consultant] domainDecision=${domain.verdict.replace("in_domain_", "")} ` +
          `usedLLM=${response.usedLLM === true} ` +
          `tokens=${queryText.length} latencyMs=${latency}`
      );
    }

    return res.json(finalResponse);
  } catch (error) {
    return next(error);
  }
};

const leadConsultant = async (req, res, next) => {
  try {
    const validatedData = consultantLeadSchema.parse(req.body);
    
    // Process lead: save to DB + send notification
    const lead = await processLead(validatedData);
    
    return res.status(201).json({ 
      status: "created",
      id: lead.id,
      message: "Lead received successfully"
    });
  } catch (error) {
    return next(error);
  }
};

const consultantHealth = (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
};

const consultantStatus = (req, res) => {
  res.json(getLlmStatus());
};

module.exports = { askConsultant, leadConsultant, consultantHealth, consultantStatus };
