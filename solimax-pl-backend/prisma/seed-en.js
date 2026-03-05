/**
 * Seed script for English knowledge base content
 * Run: node prisma/seed-en.js
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const EN_KNOWLEDGE_ITEMS = [
  // === PV MODULES ===
  {
    language: "en",
    category: "pv",
    title: "Solar Module: Definition and Working Principle",
    content: `A photovoltaic (solar) module is a device that converts sunlight directly into electrical energy.

The working principle is based on the photovoltaic effect: light photons knock electrons out of the semiconductor material (usually silicon), creating an electric current.

Modern modules achieve 20-23% efficiency for monocrystalline panels with a lifespan of 25-30 years.`,
  },
  {
    language: "en",
    category: "pv",
    title: "Solar Cell Technologies 2026",
    content: `The market is dominated by monocrystalline silicon cells with these technologies:
- PERC/PERC+ — the most widespread standard
- TOPCon — higher efficiency, lower degradation
- HJT (Heterojunction) — best performance at high temperatures

Polycrystalline modules have practically disappeared from residential installations due to their lower efficiency.`,
  },
  {
    language: "en",
    category: "pv",
    title: "Half-Cut and Other Module Technologies",
    content: `Half-cut cells are the modern standard:
- Lower power losses
- Better performance under partial shading
- Lower operating temperature

Other technologies include: MBB (multi-busbar) — more busbars for better current collection, and bifacial modules that collect light from both sides.`,
  },
  {
    language: "en",
    category: "pv",
    title: "Module Parameters: What Matters",
    content: `Key parameters of a solar module:
- Nominal power (Wp) — under STC conditions
- Open circuit voltage (Voc) and operating voltage (Vmpp)
- Short circuit current (Isc) and operating current (Impp)
- Temperature coefficients — show losses with heating
- Efficiency (%) — ratio of electrical power to solar power

When choosing, overall quality and manufacturer warranties are more important than maximum efficiency.`,
  },
  {
    language: "en",
    category: "pv",
    title: "Temperature and Module Performance",
    content: `As module temperature increases:
- Voltage drops (main factor)
- Current slightly increases
- Overall power decreases

Typical temperature coefficient of power: -0.3% to -0.4% per degree above 25°C.

At a module temperature of 65°C (typical in summer), losses are 12-16%. TOPCon and HJT modules have better temperature characteristics.`,
  },

  // === INVERTERS ===
  {
    language: "en",
    category: "pv",
    title: "Inverter: Types and Purpose",
    content: `The inverter converts direct current (DC) from solar panels to alternating current (AC) for use in the home and grid.

Inverter types:
- Grid-tied (on-grid) — works only with grid, shuts off during outages
- Hybrid — works with grid and batteries, can provide backup
- Off-grid — for systems without grid connection

For most households, a hybrid inverter with battery connection option is the optimal choice.`,
  },
  {
    language: "en",
    category: "pv",
    title: "Grid-Tied vs Hybrid Inverter",
    content: `Grid-tied inverter:
+ Lower cost
+ Simpler installation
- No operation during power outages
- No battery support

Hybrid inverter:
+ Backup power during blackouts
+ Energy storage capability
+ Self-consumption optimization
- Higher cost
- More complex setup

Recommendation: If you're planning a battery now or in the future — choose hybrid.`,
  },
  {
    language: "en",
    category: "pv",
    title: "Inverter Sizing",
    content: `Power ratio of inverter to panel capacity:
- Typical: 0.8-1.0 (inverter can be 10-20% smaller than peak panel power)
- For cloudy regions: 0.7-0.8
- For high irradiation regions: up to 1.1

Example: For a 10 kWp system, an 8-10 kW inverter is suitable.

An undersized inverter saves costs but may limit performance during peak hours.`,
  },

  // === BATTERY STORAGE ===
  {
    language: "en",
    category: "bess",
    title: "Battery Storage for Solar Systems: Basics",
    content: `A battery energy storage system (BESS) allows storing excess energy for use at night or during power outages.

Key parameters:
- Capacity (kWh) — how much energy it stores
- Power (kW) — maximum charge/discharge rate
- DoD (Depth of Discharge) — how much capacity can be used
- Cycle count — lifespan

Typical home battery: 5-15 kWh, sufficient for evening/night consumption.`,
  },
  {
    language: "en",
    category: "bess",
    title: "LiFePO4 vs Other Battery Technologies",
    content: `LiFePO4 (Lithium Iron Phosphate) — optimal choice for home systems:
+ 4000-6000 cycles (10-15 years)
+ High safety — doesn't catch fire
+ Wide temperature range
+ Stable voltage throughout discharge

NMC (Lithium Nickel Manganese Cobalt):
+ Higher energy density
- Shorter lifespan (2000-3000 cycles)
- Requires better cooling

Lead-acid — outdated, not recommended for new systems.`,
  },
  {
    language: "en",
    category: "bess",
    title: "Battery Capacity Sizing",
    content: `Formula for capacity selection:
1. Determine evening/night consumption (kWh)
2. Add 20-30% reserve
3. Account for battery DoD (typically 90-95% for LiFePO4)

Example: consumption of 8 kWh from 6 PM to 8 AM
- Minimum capacity: 8 / 0.9 = 9 kWh
- With reserve: ~10-12 kWh

For backup power during blackouts, add critical daytime loads.`,
  },
  {
    language: "en",
    category: "bess",
    title: "Battery Payback Period",
    content: `Factors affecting battery payback:
+ Day/night tariff difference
+ Frequency and duration of blackouts
+ Self-consumption level
- Initial system cost

Typical payback period: 8-12 years
With frequent blackouts or large tariff differences: 5-8 years

The main value is energy independence, not just financial benefit.`,
  },

  // === INSTALLATION ===
  {
    language: "en",
    category: "process",
    title: "Solar System Installation Steps",
    content: `Typical installation process:
1. Design — capacity calculation, equipment selection
2. Obtaining permits (if required)
3. Mounting structure installation on roof
4. Module installation
5. Cable routing
6. Inverter and protection installation
7. Grid connection
8. Commissioning
9. Connection to metering system

Typical duration for a private home: 1-3 days of installation.`,
  },
  {
    language: "en",
    category: "process",
    title: "Roof Requirements for Installation",
    content: `Optimal conditions for solar panels:
- Orientation: south (±30° acceptable)
- Tilt: 30-40° for temperate climates
- Shading: minimal, especially from 10 AM to 3 PM
- Roof condition: undamaged, supports the load

Roof types:
- Tile, metal — standard mounting
- Bitumen roofing — caution required
- Flat roof — ballast or penetrating system

Minimum area: ~6 m² per kWp (depends on module efficiency).`,
  },

  // === FINANCING ===
  {
    language: "en",
    category: "financing",
    title: "Solar System Cost",
    content: `Approximate turnkey system costs (2026):
- Grid-tied system: $1,500-2,500/kWp
- Hybrid system: $2,000-3,000/kWp
- With battery: +$400-700/kWh

Example for a 150 m² house:
- 8 kWp grid-tied system: $12,000-20,000
- 8 kWp hybrid + 10 kWh battery: $20,000-32,000

Prices depend on equipment quality and installation complexity.`,
  },
  {
    language: "en",
    category: "financing",
    title: "Solar System Payback",
    content: `Factors affecting payback:
+ Self-consumption level (higher = better)
+ Electricity prices
+ Available incentives
- System cost

Typical payback period:
- Grid-tied system: 6-10 years
- Hybrid with battery: 10-15 years

As energy prices rise, payback accelerates. After payback, the system generates net profit for 15-20 years.`,
  },
  {
    language: "en",
    category: "financing",
    title: "Incentives and Support Programs",
    content: `Common solar incentives (vary by region):
- Federal tax credits — percentage reduction on taxes
- State/local rebates — direct cash incentives
- Net metering — credit for exported energy
- Low-interest loans — favorable financing terms

Conditions vary by program:
- Maximum incentive amounts
- Equipment requirements
- Implementation deadlines

We recommend consulting about current conditions before purchase.`,
  },

  // === LEGAL ===
  {
    language: "en",
    category: "legal",
    title: "Grid Connection: Net Metering vs Net Billing",
    content: `Net metering:
- Excess energy is credited 1:1 with consumption
- Credits can be used later (typically within 12 months)
- Best for systems sized to annual consumption

Net billing:
- Excess energy sold at wholesale price
- Consumption bought at retail price
- The difference goes to the consumer

Key points:
- Bidirectional meter required
- Registration as prosumer
- Maximizing self-consumption is important for net billing.`,
  },
  {
    language: "en",
    category: "legal",
    title: "Permits and Formalities",
    content: `For systems up to 10-50 kWp (typical for residential):
- Usually no building permit required
- Grid operator notification needed
- Registration in prosumer system

Documents for connection:
1. Application to grid operator
2. Connection diagram
3. Equipment certificates
4. Testing protocol

The process takes 2-4 weeks after installation.`,
  },
];

async function main() {
  console.log("Seeding English knowledge base...");

  for (const item of EN_KNOWLEDGE_ITEMS) {
    await prisma.knowledgeItem.create({ data: item });
    console.log(`  ✓ ${item.title}`);
  }

  console.log(`\n✅ Seeded ${EN_KNOWLEDGE_ITEMS.length} English items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
