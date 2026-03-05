export type RoofType = "skośny" | "płaski" | "grunt";
export type SunCond = "dobre" | "średnie" | "trudne";

export type HeatingCurrent =
  | "gaz"
  | "węgiel/pellet"
  | "olej"
  | "prąd"
  | "pompa ciepła"
  | "inne";

export type HeatingUpgrade = "none" | "p_w" | "p_p_gas_backup" | "unknown";

export type BatteryMode = "auto" | "manual" | "none";
export type InstallationMode = "z_montazem" | "bez_montazu";
export type PayMode = "gotowka" | "kredyt";

export type CatalogItem = {
  id: string;
  name: string;
  active: boolean;
  // price in PLN gross
  pricePLN: number;
};

export type PricingConfig = {
  meta: {
    currency: "PLN";
    regionYieldKwhPerKwp: number; // e.g. 1000 for Wrocław region
    elecPriceAllInPLNPerKwh: number; // used to translate PLN->kWh and import cost
    exportCreditPLNPerKwh: number; // net-billing average credit
    gasPriceAllInPLNPerKwh: number;
    fixedGridFeesPLNPerMonth: number;
    defaultInterestAPR: number; // e.g. 0.075
  };

  pvPackages: Array<{ kwp: number; pricePLN: number; active: boolean }>;
  batteryOptions: Array<{ kwh: 5 | 10 | 15; pricePLN: number; active: boolean }>;
  ems: CatalogItem; // EMS/HEMS smart control

  installAdders: {
    // added when "z montażem"
    roofMultiplier: Record<SunCond, number>; // affects install complexity
    baseInstallPLN: number; // base installation price add
    perKwpInstallPLN: number; // per kWp add
  };

  heatingPackages: {
    // optional upgrades
    airToWater: CatalogItem; // p/w package
    airToAir4Rooms: CatalogItem; // p/p package for 4 zones
    bathroomFloorHeating: CatalogItem; // optional
  };

  dotations: {
    mojPradMaxPLN: number; // estimate cap
    czystePowietrze_airToWater_basicPLN: number;
    czystePowietrze_airToWater_increasedPLN: number;
    includeUlgaTermoHint: boolean;
  };

  lead: {
    // where to POST lead; if empty -> mailto fallback
    webhookUrl: string; // e.g. https://yourdomain.com/api/lead
    companyEmail: string; // used for mailto fallback
  };
};

export const DEFAULT_CONFIG: PricingConfig = {
  meta: {
    currency: "PLN",
    regionYieldKwhPerKwp: 1000,
    elecPriceAllInPLNPerKwh: 1.02,
    exportCreditPLNPerKwh: 0.38,
    gasPriceAllInPLNPerKwh: 0.34,
    fixedGridFeesPLNPerMonth: 55,
    defaultInterestAPR: 0.075,
  },

  pvPackages: [
    { kwp: 6.0, pricePLN: 35000, active: true },
    { kwp: 7.5, pricePLN: 42000, active: true },
    { kwp: 9.9, pricePLN: 60000, active: true },
    { kwp: 12.0, pricePLN: 71000, active: true },
  ],

  batteryOptions: [
    { kwh: 5, pricePLN: 9000, active: true },
    { kwh: 10, pricePLN: 16000, active: true },
    { kwh: 15, pricePLN: 23000, active: true },
  ],

  ems: { id: "ems", name: "EMS/HEMS (Smart sterowanie)", active: true, pricePLN: 3500 },

  installAdders: {
    roofMultiplier: { dobre: 1.0, średnie: 1.08, trudne: 1.18 },
    baseInstallPLN: 9000,
    perKwpInstallPLN: 900,
  },

  heatingPackages: {
    airToWater: { id: "hp_pw", name: "Pompa ciepła powietrze–woda (pakiet)", active: true, pricePLN: 60000 },
    airToAir4Rooms: { id: "hp_pp", name: "Klimatyzacja z grzaniem (4 strefy)", active: true, pricePLN: 25000 },
    bathroomFloorHeating: { id: "bath_fh", name: "Elektryczne ogrzewanie podłogowe (łazienki)", active: true, pricePLN: 4500 },
  },

  dotations: {
    mojPradMaxPLN: 28000,
    czystePowietrze_airToWater_basicPLN: 14080,
    czystePowietrze_airToWater_increasedPLN: 24640,
    includeUlgaTermoHint: true,
  },

  lead: {
    webhookUrl: "",
    companyEmail: "info@solimax.energy",
  },
};
