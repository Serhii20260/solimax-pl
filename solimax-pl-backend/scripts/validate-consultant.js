/**
 * Validation script for consultant responses
 * Tests 4 languages × 3 intents = 12 test cases
 * 
 * Usage: node scripts/validate-consultant.js
 * Requirements: Server must be running on port 4000
 * 
 * Validates:
 * - Language consistency (response in same language as query)
 * - LLM generates answer_text (not raw KB snippets)
 * - Exactly 1 clarifying question in missing_questions
 * - Correct CTA based on intent (SIZING→calculator, GENERAL→lead, OUT→none)
 */

const BASE_URL = process.env.API_URL || "http://localhost:4000";

// Test cases: 4 languages × 3 intents
const TEST_CASES = [
  // UA - Ukrainian
  { lang: "ua", intent: "GENERAL", query: "Як працюють сонячні панелі?", expectedCta: "lead" },
  { lang: "ua", intent: "SIZING", query: "Яка потужність сонячної станції потрібна для дому 150 м²?", expectedCta: "calculator" },
  { lang: "ua", intent: "OUT_OF_DOMAIN", query: "Яка погода буде завтра?", expectedCta: "none" },
  
  // PL - Polish
  { lang: "pl", intent: "GENERAL", query: "Jak działają panele fotowoltaiczne?", expectedCta: "lead" },
  { lang: "pl", intent: "SIZING", query: "Jaka moc instalacji PV potrzebna dla domu 120 m²?", expectedCta: "calculator" },
  { lang: "pl", intent: "OUT_OF_DOMAIN", query: "Jaki jest przepis na bigos?", expectedCta: "none" },
  
  // DE - German
  { lang: "de", intent: "GENERAL", query: "Wie funktionieren Solarmodule?", expectedCta: "lead" },
  { lang: "de", intent: "SIZING", query: "Welche Leistung brauche ich für ein 150m² Haus?", expectedCta: "calculator" },
  { lang: "de", intent: "OUT_OF_DOMAIN", query: "Was ist das Wetter morgen?", expectedCta: "none" },
  
  // EN - English
  { lang: "en", intent: "GENERAL", query: "How do solar panels work?", expectedCta: "lead" },
  { lang: "en", intent: "SIZING", query: "What size solar system do I need for a 200sqm house?", expectedCta: "calculator" },
  { lang: "en", intent: "OUT_OF_DOMAIN", query: "What is the recipe for apple pie?", expectedCta: "none" },
];

// Language detection patterns (simplified)
const LANG_PATTERNS = {
  ua: /[їієґ]|ається|ений|ність|сонячн|енерг|панел/i,
  pl: /[ąćęłńóśźż]|fotowoltaicz|instalacj|solarny|panele|moduly|falownik/i,
  de: /[äöüß]|Solarmodul|Photovoltaik|Strom|elektrische|wandeln|umwandeln|Sonnenlicht|bestehen/i,
  en: /\b(solar|panel|energy|power|system|work|convert|sunlight)\b/i,
};

// Generic detection - response is just a KB snippet or translation key
const GENERIC_PATTERNS = [
  /^[A-Z][a-z]+Item$/,       // Raw model name like "KnowledgeItem"
  /^responseText\./,          // Translation key
  /^\[.*\]$/,                 // Raw array
];

async function sendQuery(lang, query) {
  const response = await fetch(`${BASE_URL}/api/consultant/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      question: query, 
      language: lang,
      history: [],
    }),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

function detectResponseLang(text) {
  if (!text || typeof text !== "string") return "unknown";
  
  // Check each language pattern
  for (const [lang, pattern] of Object.entries(LANG_PATTERNS)) {
    if (pattern.test(text)) {
      return lang;
    }
  }
  return "unknown";
}

function isGenericResponse(text) {
  if (!text || typeof text !== "string") return true;
  if (text.length < 20) return true;
  
  for (const pattern of GENERIC_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  return false;
}

function validateResponse(testCase, response) {
  const errors = [];
  const warnings = [];
  
  // 1. Check answer_text exists and is not generic
  if (!response.answer_text) {
    errors.push("Missing answer_text");
  } else if (isGenericResponse(response.answer_text)) {
    errors.push(`Generic/empty answer: "${response.answer_text.slice(0, 50)}..."`);
  }
  
  // 2. Check language consistency (skip for OUT_OF_DOMAIN - may have hardcoded responses)
  if (response.answer_text && testCase.intent !== "OUT_OF_DOMAIN") {
    const responseLang = detectResponseLang(response.answer_text);
    if (responseLang !== "unknown" && responseLang !== testCase.lang) {
      errors.push(`Language mismatch: expected ${testCase.lang}, got ${responseLang}`);
    }
  }
  
  // 3. Check missing_questions - should be exactly 1 for GENERAL/SIZING, 0 for OUT
  const mq = response.missing_questions || [];
  if (testCase.intent === "OUT_OF_DOMAIN") {
    if (mq.length > 0) {
      warnings.push(`OUT_OF_DOMAIN should have 0 questions, got ${mq.length}`);
    }
  } else {
    if (mq.length !== 1) {
      errors.push(`Expected exactly 1 missing_question, got ${mq.length}`);
    }
  }
  
  // 4. Check CTA
  if (response.cta !== testCase.expectedCta) {
    errors.push(`CTA mismatch: expected "${testCase.expectedCta}", got "${response.cta}"`);
  }
  
  // 5. Check intent classification (can be in response.meta.intent or response.intent)
  const responseIntent = response.meta?.intent || response.intent || response.debug?.routeReason;
  if (testCase.intent === "OUT_OF_DOMAIN") {
    if (responseIntent !== "OUT_OF_DOMAIN" && response.meta?.debug?.routeReason !== "out_of_domain") {
      warnings.push(`Intent mismatch: expected OUT_OF_DOMAIN, got ${responseIntent}`);
    }
  }
  
  // 6. Check LLM was used (for in-domain queries)
  if (testCase.intent !== "OUT_OF_DOMAIN") {
    const usedLLM = response.meta?.usedLLM || response.usedLLM || response.meta?.debug?.llm?.attempted;
    if (!usedLLM) {
      warnings.push("LLM was not used for in-domain query");
    }
  }
  
  return { errors, warnings };
}

async function runTests() {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║        CONSULTANT VALIDATION - 12 TEST CASES                    ║");
  console.log("╠════════════════════════════════════════════════════════════════╣");
  console.log(`║  Server: ${BASE_URL.padEnd(53)}║`);
  console.log("╚════════════════════════════════════════════════════════════════╝");
  console.log();

  let passed = 0;
  let failed = 0;
  let warned = 0;
  const results = [];

  for (let i = 0; i < TEST_CASES.length; i++) {
    const tc = TEST_CASES[i];
    const testNum = String(i + 1).padStart(2, "0");
    const label = `[${testNum}] ${tc.lang.toUpperCase()} / ${tc.intent}`;
    
    process.stdout.write(`${label.padEnd(25)}`);
    
    try {
      const response = await sendQuery(tc.lang, tc.query);
      const { errors, warnings } = validateResponse(tc, response);
      
      if (errors.length > 0) {
        console.log("❌ FAIL");
        errors.forEach(e => console.log(`     └── ${e}`));
        failed++;
        results.push({ ...tc, status: "FAIL", errors, warnings, response });
      } else if (warnings.length > 0) {
        console.log("⚠️  WARN");
        warnings.forEach(w => console.log(`     └── ${w}`));
        warned++;
        passed++; // Warnings don't count as failures
        results.push({ ...tc, status: "WARN", errors, warnings, response });
      } else {
        console.log("✅ PASS");
        passed++;
        results.push({ ...tc, status: "PASS", errors: [], warnings: [], response });
      }
      
    } catch (err) {
      console.log("❌ ERROR");
      console.log(`     └── ${err.message}`);
      failed++;
      results.push({ ...tc, status: "ERROR", error: err.message });
    }
  }

  console.log();
  console.log("════════════════════════════════════════════════════════════════");
  console.log(`  SUMMARY: ${passed} passed, ${failed} failed, ${warned} warnings`);
  console.log("════════════════════════════════════════════════════════════════");
  
  // Detailed output for failed tests
  const failures = results.filter(r => r.status === "FAIL" || r.status === "ERROR");
  if (failures.length > 0) {
    console.log("\n  FAILED TEST DETAILS:\n");
    for (const f of failures) {
      console.log(`  [${f.lang.toUpperCase()}/${f.intent}] "${f.query}"`);
      if (f.error) {
        console.log(`    Error: ${f.error}`);
      }
      if (f.response) {
        console.log(`    Answer (first 100 chars): "${(f.response.answer_text || "").slice(0, 100)}"`);
        console.log(`    CTA: ${f.response.cta}, Intent: ${f.response.intent}`);
        console.log(`    Missing Questions: ${JSON.stringify(f.response.missing_questions || [])}`);
      }
      console.log();
    }
  }
  
  // Exit with error code if any test failed
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
