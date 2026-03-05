/**
 * Seed script for Package offers
 * Run: node prisma/seed-packages.js
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const packages = [
  // ============ HOME - STANDARD ============
  {
    category: "home",
    tier: "standard",
    title: "Pakiet Starter PV 3kW",
    shortDescription: "Idealny dla małych gospodarstw domowych. Podstawowe rozwiązanie fotowoltaiczne.",
    fullDescription: `## Pakiet Starter PV 3kW

Kompletny zestaw fotowoltaiczny dla małych gospodarstw domowych.

### Co zawiera:
- Panele fotowoltaiczne 3kW
- Inwerter sieciowy
- Konstrukcja montażowa
- Okablowanie i zabezpieczenia
- Montaż i uruchomienie

### Korzyści:
- Oszczędność do 70% na rachunkach za prąd
- Gwarancja producenta 25 lat na panele
- Profesjonalny montaż

### Dla kogo:
Mieszkania, małe domy jednorodzinne, niskie zużycie energii.`,
    manufacturerName: "JA Solar",
    manufacturerUrl: "https://www.jasolar.com",
    imageUrl: "/uploads/package-home-starter.webp",
    priceLabel: "od 15 000 PLN netto",
    specs: JSON.stringify([
      { key: "Moc", value: "3 kW" },
      { key: "Liczba paneli", value: "6-8 szt." },
      { key: "Roczna produkcja", value: "~3000 kWh" },
      { key: "Gwarancja", value: "25 lat" },
    ]),
    isActive: true,
    isPromo: false,
    isNew: false,
    sortOrder: 1,
  },
  {
    category: "home",
    tier: "standard",
    title: "Pakiet Family PV 5kW",
    shortDescription: "Optymalny wybór dla 4-osobowej rodziny. Pokrywa średnie zużycie energii.",
    fullDescription: `## Pakiet Family PV 5kW

Najpopularniejszy pakiet dla rodzin. Idealnie zbilansowany stosunek ceny do wydajności.

### Co zawiera:
- Panele fotowoltaiczne 5kW premium
- Inwerter hybrydowy
- Konstrukcja montażowa premium
- Pełne okablowanie i zabezpieczenia
- Profesjonalny montaż z gwarancją

### Korzyści:
- Pokrycie ~80% rocznego zużycia energii
- Możliwość rozbudowy o magazyn energii
- Monitoring online produkcji

### Dla kogo:
Domy jednorodzinne, rodziny 3-5 osób, średnie zużycie energii.`,
    manufacturerName: "Longi",
    manufacturerUrl: "https://www.longi.com",
    imageUrl: "/uploads/package-home-family.webp",
    priceLabel: "od 22 000 PLN netto",
    specs: JSON.stringify([
      { key: "Moc", value: "5 kW" },
      { key: "Liczba paneli", value: "10-12 szt." },
      { key: "Roczna produkcja", value: "~5000 kWh" },
      { key: "Gwarancja", value: "25 lat" },
    ]),
    isActive: true,
    isPromo: true,
    isNew: false,
    promoLabel: "Bestseller",
    sortOrder: 2,
  },
  {
    category: "home",
    tier: "standard",
    title: "Pakiet Comfort PV 8kW",
    shortDescription: "Dla domów z wyższym zużyciem. Klimatyzacja, pompa ciepła, samochód elektryczny.",
    fullDescription: `## Pakiet Comfort PV 8kW

Rozwiązanie dla domów z podwyższonym zapotrzebowaniem na energię.

### Co zawiera:
- Panele fotowoltaiczne 8kW top tier
- Inwerter hybrydowy z funkcją backup
- Konstrukcja montażowa premium
- Kompletna instalacja elektryczna
- Montaż i konfiguracja systemu

### Korzyści:
- Pełne pokrycie zużycia + nadwyżka
- Gotowość na magazyn energii
- Zasilanie awaryjne

### Dla kogo:
Duże domy, pompy ciepła, klimatyzacja, samochód elektryczny.`,
    manufacturerName: "Trina Solar",
    manufacturerUrl: "https://www.trinasolar.com",
    imageUrl: "/uploads/package-home-comfort.webp",
    priceLabel: "od 32 000 PLN netto",
    specs: JSON.stringify([
      { key: "Moc", value: "8 kW" },
      { key: "Liczba paneli", value: "16-18 szt." },
      { key: "Roczna produkcja", value: "~8000 kWh" },
      { key: "Gwarancja", value: "25 lat" },
    ]),
    isActive: true,
    isPromo: false,
    isNew: true,
    promoLabel: "Nowość",
    sortOrder: 3,
  },

  // ============ HOME - PREMIUM ============
  {
    category: "home",
    tier: "premium",
    title: "Premium Solar + Storage 6kW",
    shortDescription: "Panele premium z magazynem energii 5kWh. Pełna niezależność energetyczna.",
    fullDescription: `## Premium Solar + Storage 6kW

Kompletny system z magazynem energii dla maksymalnej niezależności.

### Co zawiera:
- Panele fotowoltaiczne premium 6kW
- Magazyn energii 5kWh
- Inwerter hybrydowy top-tier
- System zarządzania energią
- Pełna instalacja i konfiguracja

### Korzyści:
- Energia dostępna 24/7
- Zasilanie awaryjne całego domu
- Optymalizacja zużycia i sprzedaży

### Technologia:
- Panele n-type, najwyższa sprawność
- Baterie LFP, 6000 cykli`,
    manufacturerName: "Huawei",
    manufacturerUrl: "https://solar.huawei.com",
    imageUrl: "/uploads/package-home-premium-storage.webp",
    priceLabel: "od 55 000 PLN netto",
    specs: JSON.stringify([
      { key: "Moc PV", value: "6 kW" },
      { key: "Magazyn", value: "5 kWh" },
      { key: "Backup", value: "Tak" },
      { key: "Gwarancja baterii", value: "10 lat" },
    ]),
    isActive: true,
    isPromo: true,
    isNew: false,
    promoLabel: "Polecamy",
    sortOrder: 1,
  },
  {
    category: "home",
    tier: "premium",
    title: "Premium All-in-One 10kW + 10kWh",
    shortDescription: "Flagowy pakiet. Maksymalna moc i pojemność magazynu.",
    fullDescription: `## Premium All-in-One 10kW + 10kWh

Flagowe rozwiązanie dla wymagających klientów.

### Co zawiera:
- Panele fotowoltaiczne premium 10kW
- Magazyn energii 10kWh
- Inwerter All-in-One
- Inteligentny system zarządzania
- Ładowarka EV (opcja)

### Korzyści:
- Całkowita niezależność energetyczna
- Zasilanie domu przez 24h bez słońca
- Integracja z smart home

### Premium serwis:
- Gwarancja rozszerzona 15 lat
- Monitoring 24/7
- Serwis priorytetowy`,
    manufacturerName: "SolarEdge",
    manufacturerUrl: "https://www.solaredge.com",
    imageUrl: "/uploads/package-home-premium-aio.webp",
    priceLabel: "od 95 000 PLN netto",
    specs: JSON.stringify([
      { key: "Moc PV", value: "10 kW" },
      { key: "Magazyn", value: "10 kWh" },
      { key: "Backup", value: "Full Home" },
      { key: "Gwarancja", value: "15 lat" },
    ]),
    isActive: true,
    isPromo: false,
    isNew: true,
    promoLabel: "Nowość 2026",
    sortOrder: 2,
  },

  // ============ BUSINESS - STANDARD ============
  {
    category: "business",
    tier: "standard",
    title: "Biznes Start 15kW",
    shortDescription: "Dla małych firm i usług. Redukcja kosztów energii nawet o 60%.",
    fullDescription: `## Biznes Start 15kW

Rozwiązanie dla małych i średnich przedsiębiorstw.

### Co zawiera:
- System PV 15kW na dachu płaskim lub skośnym
- Inwerter przemysłowy
- Konstrukcja montażowa certyfikowana
- Kompletna dokumentacja
- Montaż i odbiór techniczny

### Korzyści:
- Szybki zwrot inwestycji (4-5 lat)
- Odliczenie VAT
- Amortyzacja podatkowa

### Dla kogo:
Biura, sklepy, warsztaty, małe magazyny.`,
    manufacturerName: "Canadian Solar",
    manufacturerUrl: "https://www.canadiansolar.com",
    imageUrl: "/uploads/package-business-start.webp",
    priceLabel: "od 45 000 PLN netto",
    specs: JSON.stringify([
      { key: "Moc", value: "15 kW" },
      { key: "Roczna produkcja", value: "~15000 kWh" },
      { key: "ROI", value: "4-5 lat" },
      { key: "Gwarancja", value: "25 lat" },
    ]),
    isActive: true,
    isPromo: false,
    isNew: false,
    sortOrder: 1,
  },
  {
    category: "business",
    tier: "standard",
    title: "Biznes Pro 30kW",
    shortDescription: "Dla średnich firm produkcyjnych. Optymalne rozwiązanie kosztowe.",
    fullDescription: `## Biznes Pro 30kW

Profesjonalne rozwiązanie dla średnich przedsiębiorstw.

### Co zawiera:
- System PV 30kW
- Dwa inwertery przemysłowe
- Monitoring produkcji online
- Pełna dokumentacja i pozwolenia
- Montaż i uruchomienie

### Korzyści:
- Znacząca redukcja kosztów operacyjnych
- Możliwość sprzedaży nadwyżek
- Certyfikaty zielonej energii

### Dla kogo:
Hale produkcyjne, większe biura, centra logistyczne.`,
    manufacturerName: "JinkoSolar",
    manufacturerUrl: "https://www.jinkosolar.com",
    imageUrl: "/uploads/package-business-pro.webp",
    priceLabel: "od 85 000 PLN netto",
    specs: JSON.stringify([
      { key: "Moc", value: "30 kW" },
      { key: "Roczna produkcja", value: "~30000 kWh" },
      { key: "ROI", value: "3-4 lata" },
      { key: "Gwarancja", value: "25 lat" },
    ]),
    isActive: true,
    isPromo: true,
    isNew: false,
    promoLabel: "Najczęściej wybierane",
    sortOrder: 2,
  },

  // ============ BUSINESS - PREMIUM ============
  {
    category: "business",
    tier: "premium",
    title: "Enterprise 50kW + Storage",
    shortDescription: "Rozwiązanie enterprise z magazynem energii. Stabilność i niezależność.",
    fullDescription: `## Enterprise 50kW + Storage

Kompleksowe rozwiązanie dla dużych przedsiębiorstw.

### Co zawiera:
- System PV 50kW premium
- Magazyn energii 30kWh
- System zarządzania energią EMS
- Zasilanie awaryjne krytycznych systemów
- Pełna obsługa prawna i techniczna

### Korzyści:
- Stabilność zasilania
- Peak shaving - redukcja mocy szczytowej
- Arbitraż cenowy energii

### Premium obsługa:
- Dedykowany opiekun projektu
- Serwis 24/7
- Raportowanie ESG`,
    manufacturerName: "BYD",
    manufacturerUrl: "https://www.byd.com",
    imageUrl: "/uploads/package-enterprise.webp",
    priceLabel: "Wycena indywidualna",
    specs: JSON.stringify([
      { key: "Moc PV", value: "50 kW" },
      { key: "Magazyn", value: "30 kWh" },
      { key: "EMS", value: "Tak" },
      { key: "Backup", value: "Krytyczne systemy" },
    ]),
    isActive: true,
    isPromo: false,
    isNew: true,
    promoLabel: "Nowość",
    sortOrder: 1,
  },

  // ============ HEATPUMPS - STANDARD ============
  {
    category: "heatpumps",
    tier: "standard",
    title: "Pompa Ciepła Air 8kW",
    shortDescription: "Pompa powietrzna dla domów do 120m². Ekonomiczne ogrzewanie i chłodzenie.",
    fullDescription: `## Pompa Ciepła Air 8kW

Efektywna pompa ciepła powietrze-woda dla domów jednorodzinnych.

### Co zawiera:
- Pompa ciepła 8kW
- Zbiornik CWU 200L
- Bufor 50L
- Automatyka i sterowanie
- Montaż i uruchomienie

### Parametry:
- COP do 4.5 przy A7/W35
- Praca do -25°C
- Ciche działanie (35dB)

### Dla kogo:
Domy do 120m², nowe i modernizowane budynki.`,
    manufacturerName: "Daikin",
    manufacturerUrl: "https://www.daikin.eu",
    imageUrl: "/uploads/package-heatpump-air8.webp",
    priceLabel: "od 35 000 PLN netto",
    specs: JSON.stringify([
      { key: "Moc grzewcza", value: "8 kW" },
      { key: "COP", value: "4.5" },
      { key: "Min. temp. pracy", value: "-25°C" },
      { key: "Gwarancja", value: "5 lat" },
    ]),
    isActive: true,
    isPromo: false,
    isNew: false,
    sortOrder: 1,
  },
  {
    category: "heatpumps",
    tier: "standard",
    title: "Pompa Ciepła Air 12kW",
    shortDescription: "Dla domów 120-180m². Wysoka efektywność przy niskich temperaturach.",
    fullDescription: `## Pompa Ciepła Air 12kW

Wydajna pompa ciepła dla większych domów.

### Co zawiera:
- Pompa ciepła 12kW
- Zbiornik CWU 300L
- Bufor 100L
- Inteligentna automatyka
- Profesjonalny montaż

### Parametry:
- COP do 4.3 przy A7/W35
- Praca do -28°C
- Funkcja chłodzenia

### Dla kogo:
Domy 120-180m², starsze budynki po termomodernizacji.`,
    manufacturerName: "Mitsubishi Electric",
    manufacturerUrl: "https://www.mitsubishielectric.com",
    imageUrl: "/uploads/package-heatpump-air12.webp",
    priceLabel: "od 45 000 PLN netto",
    specs: JSON.stringify([
      { key: "Moc grzewcza", value: "12 kW" },
      { key: "COP", value: "4.3" },
      { key: "Min. temp. pracy", value: "-28°C" },
      { key: "Gwarancja", value: "5 lat" },
    ]),
    isActive: true,
    isPromo: true,
    isNew: false,
    promoLabel: "Popularny wybór",
    sortOrder: 2,
  },

  // ============ HEATPUMPS - PREMIUM ============
  {
    category: "heatpumps",
    tier: "premium",
    title: "Premium Ground Source 10kW",
    shortDescription: "Pompa gruntowa. Najwyższa efektywność przez cały rok, niezależnie od pogody.",
    fullDescription: `## Premium Ground Source 10kW

Pompa ciepła gruntowa - najwyższa efektywność na rynku.

### Co zawiera:
- Pompa ciepła gruntowa 10kW
- Odwierty lub kolektor poziomy
- Zbiornik CWU 300L z solarną wężownicą
- Bufor 100L
- Kompletna instalacja hydrauliczna

### Parametry:
- COP do 5.5 (grunt)
- Stabilna praca przez cały rok
- Chłodzenie pasywne gratis

### Dla kogo:
Domy z działką, budynki nowe, najwyższe wymagania efektywności.`,
    manufacturerName: "Viessmann",
    manufacturerUrl: "https://www.viessmann.pl",
    imageUrl: "/uploads/package-heatpump-ground.webp",
    priceLabel: "od 75 000 PLN netto",
    specs: JSON.stringify([
      { key: "Moc grzewcza", value: "10 kW" },
      { key: "COP", value: "5.5" },
      { key: "Źródło", value: "Grunt" },
      { key: "Gwarancja", value: "10 lat" },
    ]),
    isActive: true,
    isPromo: false,
    isNew: true,
    promoLabel: "Premium",
    sortOrder: 1,
  },
  {
    category: "heatpumps",
    tier: "premium",
    title: "Premium Hybrid PV + Heat Pump",
    shortDescription: "Połączenie PV 6kW z pompą ciepła 10kW. Zerowe rachunki za ogrzewanie.",
    fullDescription: `## Premium Hybrid PV + Heat Pump

Kompletny system: fotowoltaika + pompa ciepła = dom samowystarczalny.

### Co zawiera:
- System PV 6kW
- Pompa ciepła powietrzna 10kW
- Inteligentne sterowanie zintegrowane
- Zbiornik CWU 300L
- Kompleksowa instalacja

### Synergia:
- PV zasila pompę ciepła
- Automatyczna optymalizacja zużycia
- Nadwyżka energii do sieci

### Efekt:
- Rachunki za ogrzewanie bliskie 0
- Niezależność od cen gazu i prądu`,
    manufacturerName: "Solimax",
    manufacturerUrl: "https://solimax.pl",
    imageUrl: "/uploads/package-hybrid.webp",
    priceLabel: "od 85 000 PLN netto",
    specs: JSON.stringify([
      { key: "Moc PV", value: "6 kW" },
      { key: "Moc PC", value: "10 kW" },
      { key: "Oszczędność", value: "do 95%" },
      { key: "Gwarancja", value: "10 lat" },
    ]),
    isActive: true,
    isPromo: true,
    isNew: true,
    promoLabel: "🔥 Hit 2026",
    sortOrder: 2,
  },
];

async function main() {
  console.log("🌱 Seeding packages...\n");

  // Clear existing packages
  await prisma.package.deleteMany();
  console.log("✓ Cleared existing packages\n");

  // Insert new packages
  for (const pkg of packages) {
    const created = await prisma.package.create({ data: pkg });
    console.log(`✓ Created: ${created.title}`);
  }

  console.log(`\n✅ Successfully seeded ${packages.length} packages`);
  
  // Summary
  const summary = await prisma.package.groupBy({
    by: ["category", "tier"],
    _count: true,
  });
  
  console.log("\n📊 Summary:");
  summary.forEach(({ category, tier, _count }) => {
    console.log(`   ${category} / ${tier}: ${_count} packages`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
