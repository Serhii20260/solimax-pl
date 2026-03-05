/**
 * Script to synchronize energyKeywords.v1.json with pvTerminology.js
 * This ensures domainGuard has all PV terms from the centralized terminology.
 *
 * Usage: node scripts/sync-energy-keywords.js
 */

const fs = require("fs");
const path = require("path");

const { DOMAIN_TERMS } = require("../src/config/pvTerminology");

const KEYWORDS_PATH = path.join(__dirname, "../config/energyKeywords.v1.json");

// Read current keywords file
const currentKeywords = require(KEYWORDS_PATH);

// Preserve existing terms
const existingCore = new Set(currentKeywords.core || []);
const existingContext = new Set(currentKeywords.context || []);
const allExisting = new Set([...existingCore, ...existingContext]);

// Find terms from pvTerminology that are not in energyKeywords
const missingTerms = DOMAIN_TERMS.filter(
  (t) => !allExisting.has(t) && !allExisting.has(t.toLowerCase())
);

console.log(`\n📊 Sync Statistics:`);
console.log(`   DOMAIN_TERMS total: ${DOMAIN_TERMS.length}`);
console.log(`   energyKeywords core: ${existingCore.size}`);
console.log(`   energyKeywords context: ${existingContext.size}`);
console.log(`   Missing terms: ${missingTerms.length}`);

if (missingTerms.length === 0) {
  console.log(`\n✅ energyKeywords.v1.json is already synchronized!`);
  process.exit(0);
}

// Categorize new terms - PV core terms vs context/supporting terms
const corePatterns = [
  /инвертор|inverter|falownik|wechselrichter|перетвор/i,
  /батаре|battery|bateria|akk|speicher|storage|ess|накопич|сховищ/i,
  /панел|panel|modul|модул/i,
  /фотовольт|fotowoltai|photovolta|pv$/i,
  /сонячн|solar/i,
  /mppt|string|стрінг|стринг/i,
  /кв[тг]|kwp|kwh|wh$/i,
  /grid|грід|мереж|sieć|netz/i,
  /гібрид|hybrid|hybryd/i,
  /lifepo|lithium|li-ion|lfp/i,
  /dc-ac|ac-dc|однофаз|трифаз|einphasig|dreiphasig|1-faz|3-faz/i,
];

const newCore = [];
const newContext = [];

for (const term of missingTerms) {
  const isCore = corePatterns.some((p) => p.test(term));
  if (isCore) {
    newCore.push(term);
  } else {
    newContext.push(term);
  }
}

console.log(`\n   → New core terms: ${newCore.length}`);
console.log(`   → New context terms: ${newContext.length}`);

// Build updated keywords object
const updatedKeywords = {
  core: [...currentKeywords.core, ...newCore.sort()],
  context: [...currentKeywords.context, ...newContext.sort()],
  negative: currentKeywords.negative || [],
};

// Write back
fs.writeFileSync(KEYWORDS_PATH, JSON.stringify(updatedKeywords, null, 2) + "\n");

console.log(`\n✅ Updated ${KEYWORDS_PATH}`);
console.log(`   New core count: ${updatedKeywords.core.length}`);
console.log(`   New context count: ${updatedKeywords.context.length}`);

// Show some sample new terms
console.log(`\n📝 Sample new core terms:`);
newCore.slice(0, 10).forEach((t) => console.log(`   - ${t}`));
console.log(`\n📝 Sample new context terms:`);
newContext.slice(0, 10).forEach((t) => console.log(`   - ${t}`));

console.log(`\n🔄 Remember to restart the server for changes to take effect!`);
