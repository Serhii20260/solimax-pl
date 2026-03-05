/**
 * Seed script for German knowledge base content
 * Run: node prisma/seed-de.js
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DE_KNOWLEDGE_ITEMS = [
  // === PV MODULE ===
  {
    language: "de",
    category: "pv",
    title: "Solarmodul: Definition und Funktionsweise",
    content: `Ein Photovoltaikmodul (Solarmodul) ist ein Gerät, das Sonnenlicht direkt in elektrische Energie umwandelt.

Das Funktionsprinzip basiert auf dem photoelektrischen Effekt: Lichtphotonen lösen Elektronen aus dem Halbleitermaterial (meist Silizium) heraus und erzeugen so einen elektrischen Strom.

Moderne Module erreichen einen Wirkungsgrad von 20-23% bei monokristallinen Modulen mit einer Lebensdauer von 25-30 Jahren.`,
  },
  {
    language: "de",
    category: "pv",
    title: "Solarzellentechnologien 2026",
    content: `Auf dem Markt dominieren monokristalline Siliziumzellen mit folgenden Technologien:
- PERC/PERC+ — der am weitesten verbreitete Standard
- TOPCon — höhere Effizienz, geringere Degradation
- HJT (Heterojunction) — beste Leistung bei hohen Temperaturen

Polykristalline Module sind bei Hausinstallationen aufgrund ihrer geringeren Effizienz praktisch verschwunden.`,
  },
  {
    language: "de",
    category: "pv",
    title: "Half-Cut und andere Modultechnologien",
    content: `Half-Cut-Zellen (halbierte Zellen) sind heute Standard:
- Geringere Leistungsverluste
- Bessere Leistung bei Teilverschattung
- Niedrigere Betriebstemperatur

Weitere Technologien: MBB (Multi-Busbar) — mehr Stromschienen für bessere Stromsammlung, und bifaziale Module, die Licht von beiden Seiten aufnehmen.`,
  },
  {
    language: "de",
    category: "pv",
    title: "Modulparameter: Was ist wichtig",
    content: `Wichtige Parameter eines Solarmoduls:
- Nennleistung (Wp) — unter STC-Bedingungen
- Leerlaufspannung (Voc) und Betriebsspannung (Vmpp)
- Kurzschlussstrom (Isc) und Betriebsstrom (Impp)
- Temperaturkoeffizienten — zeigen Verluste bei Erwärmung
- Wirkungsgrad (%) — Verhältnis von elektrischer zu Solarleistung

Bei der Auswahl ist die Gesamtqualität und die Herstellergarantie wichtiger als der maximale Wirkungsgrad.`,
  },
  {
    language: "de",
    category: "pv",
    title: "Temperatur und Modulleistung",
    content: `Mit steigender Modultemperatur:
- Sinkt die Spannung (Hauptfaktor)
- Steigt der Strom leicht an
- Sinkt die Gesamtleistung

Typischer Temperaturkoeffizient der Leistung: -0,3% bis -0,4% pro Grad über 25°C.

Bei einer Modultemperatur von 65°C (typisch im Sommer) betragen die Verluste 12-16%. TOPCon- und HJT-Module haben bessere Temperatureigenschaften.`,
  },

  // === WECHSELRICHTER ===
  {
    language: "de",
    category: "pv",
    title: "Wechselrichter: Typen und Funktion",
    content: `Der Wechselrichter wandelt Gleichstrom (DC) von den Solarmodulen in Wechselstrom (AC) für die Nutzung im Haus und im Netz um.

Wechselrichtertypen:
- Netzgekoppelt (On-Grid) — arbeitet nur mit Netz, schaltet bei Ausfall ab
- Hybrid — arbeitet mit Netz und Batterien, kann Notstrom liefern
- Inselbetrieb (Off-Grid) — für Systeme ohne Netzanschluss

Für die meisten Haushalte ist ein Hybrid-Wechselrichter mit Batterieanschluss die optimale Wahl.`,
  },
  {
    language: "de",
    category: "pv",
    title: "Netz- vs. Hybrid-Wechselrichter",
    content: `Netz-Wechselrichter:
+ Geringere Kosten
+ Einfachere Installation
- Kein Betrieb bei Stromausfall
- Keine Batterieunterstützung

Hybrid-Wechselrichter:
+ Notstromversorgung bei Blackout
+ Möglichkeit zur Energiespeicherung
+ Optimierung des Eigenverbrauchs
- Höhere Kosten
- Komplexere Einrichtung

Empfehlung: Wenn Sie jetzt oder zukünftig einen Speicher planen — wählen Sie Hybrid.`,
  },
  {
    language: "de",
    category: "pv",
    title: "Wechselrichter-Dimensionierung",
    content: `Leistungsverhältnis Wechselrichter zu Modulleistung:
- Typisch: 0,8-1,0 (Wechselrichter kann 10-20% kleiner sein als Spitzenleistung)
- Für Regionen mit bewölktem Wetter: 0,7-0,8
- Für Regionen mit hoher Einstrahlung: bis 1,1

Beispiel: Für eine 10-kWp-Anlage passt ein 8-10 kW Wechselrichter.

Ein unterdimensionierter Wechselrichter spart Kosten, kann aber die Leistung zu Spitzenzeiten begrenzen.`,
  },

  // === BATTERIESPEICHER ===
  {
    language: "de",
    category: "bess",
    title: "Batteriespeicher für Solaranlagen: Grundlagen",
    content: `Ein Batteriespeichersystem (BESS) ermöglicht die Speicherung überschüssiger Energie für die Nutzung nachts oder bei Stromausfall.

Wichtige Parameter:
- Kapazität (kWh) — wie viel Energie gespeichert wird
- Leistung (kW) — maximale Lade-/Entladerate
- DoD (Entladetiefe) — wie viel Kapazität genutzt werden kann
- Zyklenanzahl — Lebensdauer

Typischer Heimspeicher: 5-15 kWh, ausreichend für den abendlichen/nächtlichen Verbrauch.`,
  },
  {
    language: "de",
    category: "bess",
    title: "LiFePO4 vs. andere Batterietechnologien",
    content: `LiFePO4 (Lithium-Eisen-Phosphat) — optimale Wahl für Heimsysteme:
+ 4000-6000 Zyklen (10-15 Jahre)
+ Hohe Sicherheit — brennt nicht
+ Breiter Temperaturbereich
+ Stabile Spannung während der Entladung

NMC (Lithium-Nickel-Mangan-Kobalt):
+ Höhere Energiedichte
- Kürzere Lebensdauer (2000-3000 Zyklen)
- Benötigt bessere Kühlung

Blei-Säure — veraltet, nicht empfohlen für neue Systeme.`,
  },
  {
    language: "de",
    category: "bess",
    title: "Speicherkapazität berechnen",
    content: `Formel zur Kapazitätsberechnung:
1. Ermitteln Sie den abendlichen/nächtlichen Verbrauch (kWh)
2. Fügen Sie 20-30% Reserve hinzu
3. Berücksichtigen Sie die DoD der Batterie (typisch 90-95% bei LiFePO4)

Beispiel: Verbrauch 8 kWh von 18:00 bis 8:00 Uhr
- Mindestkapazität: 8 / 0,9 = 9 kWh
- Mit Reserve: ~10-12 kWh

Für Notstromversorgung bei Blackouts fügen Sie kritische Tageslasten hinzu.`,
  },
  {
    language: "de",
    category: "bess",
    title: "Wirtschaftlichkeit des Batteriespeichers",
    content: `Faktoren für die Wirtschaftlichkeit:
+ Tarifunterschiede Tag/Nacht
+ Häufigkeit und Dauer von Stromausfällen
+ Eigenverbrauchsanteil
- Anschaffungskosten

Typische Amortisationszeit in Deutschland: 8-12 Jahre
Mit häufigen Ausfällen oder großen Tarifunterschieden: 5-8 Jahre

Der Hauptwert liegt in der Energieunabhängigkeit, nicht nur im finanziellen Vorteil.`,
  },

  // === INSTALLATION ===
  {
    language: "de",
    category: "process",
    title: "Installationsschritte einer Solaranlage",
    content: `Typischer Installationsprozess:
1. Planung — Leistungsberechnung, Geräteauswahl
2. Genehmigungen einholen (falls erforderlich)
3. Montage der Unterkonstruktion auf dem Dach
4. Installation der Module
5. Kabelverlegung
6. Montage von Wechselrichter und Schutzeinrichtungen
7. Netzanschluss
8. Inbetriebnahme
9. Anmeldung beim Netzbetreiber

Typische Dauer für ein Einfamilienhaus: 1-3 Tage Montage.`,
  },
  {
    language: "de",
    category: "process",
    title: "Dachanforderungen für die Montage",
    content: `Optimale Bedingungen für Solarmodule:
- Ausrichtung: Süden (±30° akzeptabel)
- Neigung: 30-40° für Deutschland
- Verschattung: minimal, besonders von 10:00 bis 15:00 Uhr
- Dachzustand: unbeschädigt, trägt die Last

Dachtypen:
- Ziegel, Blech — Standardmontage
- Bitumendach — Vorsicht erforderlich
- Flachdach — Ballast- oder Durchdringungssystem

Mindestfläche: ca. 6 m² pro kWp (abhängig von der Moduleffizienz).`,
  },

  // === FINANZIERUNG ===
  {
    language: "de",
    category: "financing",
    title: "Kosten einer Solaranlage",
    content: `Ungefähre Kosten einer schlüsselfertigen Anlage (Deutschland, 2026):
- Netzgekoppelte Anlage: 1200-1600 EUR/kWp
- Hybridanlage: 1500-2000 EUR/kWp
- Mit Speicher: +500-800 EUR/kWh

Beispiel für ein Haus mit 150 m²:
- 8 kWp Netzanlage: 10.000-13.000 EUR
- 8 kWp Hybrid + 10 kWh Speicher: 17.000-23.000 EUR

Die Preise hängen von der Gerätequalität und der Installationskomplexität ab.`,
  },
  {
    language: "de",
    category: "financing",
    title: "Wirtschaftlichkeit einer Solaranlage",
    content: `Einflussfaktoren auf die Amortisation:
+ Eigenverbrauchsanteil (höher = besser)
+ Strompreise
+ Verfügbare Förderungen
- Systemkosten

Typische Amortisationszeit:
- Netzanlage: 8-12 Jahre
- Hybrid mit Speicher: 12-16 Jahre

Bei steigenden Strompreisen verkürzt sich die Amortisation. Nach der Amortisation erwirtschaftet die Anlage 15-20 Jahre lang Reingewinn.`,
  },
  {
    language: "de",
    category: "financing",
    title: "Förderungen und Unterstützungsprogramme",
    content: `Wichtige Förderprogramme in Deutschland (2026):
- KfW-Förderung — zinsgünstige Kredite für Solaranlagen
- EEG-Einspeisevergütung — garantierte Vergütung für eingespeisten Strom
- Regionale Förderprogramme — je nach Bundesland unterschiedlich

Bedingungen variieren je nach Programm:
- Maximale Fördersummen
- Anforderungen an die Ausrüstung
- Umsetzungsfristen

Wir empfehlen eine Beratung zu aktuellen Konditionen vor dem Kauf.`,
  },

  // === RECHTLICHES ===
  {
    language: "de",
    category: "legal",
    title: "Netzeinspeisung: EEG-Vergütung",
    content: `Das EEG (Erneuerbare-Energien-Gesetz) regelt die Einspeisung in Deutschland:
- Einspeisevergütung für 20 Jahre garantiert
- Eigenverbrauch wird bevorzugt behandelt
- Überschussstrom wird ins Netz eingespeist

Wichtige Punkte:
- Anmeldung beim Netzbetreiber erforderlich
- Intelligenter Zähler (Smart Meter) vorgeschrieben
- Registrierung im Marktstammdatenregister

Für maximalen Nutzen ist es wichtig, den Eigenverbrauch zu optimieren.`,
  },
  {
    language: "de",
    category: "legal",
    title: "Genehmigungen und Formalitäten",
    content: `Für Anlagen bis 10 kWp (typisch für Einfamilienhäuser):
- Meist keine Baugenehmigung erforderlich
- Anmeldung beim Netzbetreiber notwendig
- Registrierung im Marktstammdatenregister

Erforderliche Dokumente:
1. Anmeldung beim Netzbetreiber
2. Anschlussschema
3. Gerätezertifikate
4. Prüfprotokoll

Der Prozess dauert 2-4 Wochen nach der Installation.`,
  },
];

async function main() {
  console.log("Seeding German knowledge base...");

  for (const item of DE_KNOWLEDGE_ITEMS) {
    await prisma.knowledgeItem.create({ data: item });
    console.log(`  ✓ ${item.title}`);
  }

  console.log(`\n✅ Seeded ${DE_KNOWLEDGE_ITEMS.length} German items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
