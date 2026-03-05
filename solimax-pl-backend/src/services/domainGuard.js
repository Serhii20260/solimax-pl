const fs = require("fs");
const path = require("path");

const KEYWORDS_PATH = path.resolve(
  __dirname,
  "..",
  "..",
  "config",
  "energyKeywords.v1.json"
);

let cachedKeywords = null;

const loadKeywords = () => {
  if (cachedKeywords) return cachedKeywords;
  const raw = fs.readFileSync(KEYWORDS_PATH, "utf-8");
  cachedKeywords = JSON.parse(raw);
  return cachedKeywords;
};

const removeDiacritics = (text) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ąćęłńóśźż]/g, (match) =>
      ({ ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" }[
        match
      ] || match)
    );

const normalizeText = (input) => {
  if (!input) return "";
  return removeDiacritics(input.toString().toLowerCase())
    .replace(/[^a-z0-9а-яіїєґ\s·-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const countMatches = (text, keywords) => {
  const normalizedText = normalizeText(text);
  let count = 0;
  const matches = [];

  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword);
    if (!normalizedKeyword) continue;
    if (normalizedText.includes(normalizedKeyword)) {
      count += 1;
      matches.push(keyword);
    }
  }

  return { count, matches };
};

const analyzeDomain = (text) => {
  const keywords = loadKeywords();
  const negative = countMatches(text, keywords.negative || []);

  if (negative.count > 0) {
    return {
      verdict: "out_of_domain",
      matchedKeywordsCount: negative.count,
      matched: { negative: negative.matches },
    };
  }

  const core = countMatches(text, keywords.core || []);
  if (core.count > 0) {
    return {
      verdict: "in_domain_strong",
      matchedKeywordsCount: core.count,
      matched: { core: core.matches },
    };
  }

  const context = countMatches(text, keywords.context || []);
  if (context.count > 0) {
    return {
      verdict: "in_domain_weak",
      matchedKeywordsCount: context.count,
      matched: { context: context.matches },
    };
  }

  return {
    verdict: "out_of_domain_soft",
    matchedKeywordsCount: 0,
    matched: {},
  };
};

module.exports = { analyzeDomain, normalizeText };
