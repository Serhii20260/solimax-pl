import type {
  BatteryMode,
  HeatingCurrent,
  HeatingUpgrade,
  InstallationMode,
  PayMode,
  PricingConfig,
  RoofType,
  SunCond,
} from "./config";

export type ManualDeviceRow = {
  name: string;
  powerKw: number;
  qty: number;
  hoursPerDay: number;
  profile: "dzień" | "noc" | "mieszany";
  days: "pn-pt" | "codziennie" | "weekendy";
  seasonal: boolean;
  months: number; // 1..12
};

export type WizardData = {
  // Step 1
  cityZip: string;
  houseAreaM2: number;
  energyClass: "brak" | "A" | "B" | "C" | "D" | "E" | "F" | "G";
  houseType: "nowy" | "modernizowany";

  // Step 2 mode
  advancedMode: boolean;
  elecCostYearPLN: number | null;
  heatingCurrent: HeatingCurrent;
  heatingCostYearPLN: number | null;

  // Manual devices
  devices: ManualDeviceRow[];

  // Step 3 EV
  evNow: boolean;
  evKmYear: number;
  evPlan: "nie" | "0-12m" | "1-3l" | "3plus";
  homeCharging: "tak" | "nie" | "planuje";

  // Step 4 roof
  roofType: RoofType;
  roofAreaM2: number | null;
  sunCond: SunCond;

  // Step 5 battery
  batteryMode: BatteryMode;
  batteryManualKwh: 5 | 10 | 15 | null;

  // Step 6 heating upgrade
  upgradeHeating: "tak" | "nie" | "rozwazam";
  upgradeType: HeatingUpgrade;
  emitters: "podlogowka" | "grzejniki" | "mieszane" | "nie_wiem";
  radiatorsKind: "zeliwne" | "panelowe" | "niskotemp" | "nie_wiem";
  keepExisting: "wymiana" | "pod_istniejaca" | "nie_wiem";
  wantBathroomFloorHeat: boolean;

  // Step 7 financing + install
  installationMode: InstallationMode;
  payMode: PayMode;
  creditYears: 5 | 7 | 10;
  aprOverride: number | null; // optional advanced
  includeDotations: boolean;
  dot_mojPrad: boolean;
  dot_czyste_basic: boolean;
  dot_czyste_increased: boolean;
  dot_ulga_termo: boolean;

  // Lead
  leadName: string;
  leadPhone: string;
  leadEmail: string;
  leadConsent: boolean;
};

export type CalcResult = {
  assumptions: {
    pvKwp: number;
    pvKwhYear: number;
    batteryKwh: number;
    selfRate: number; // 0..1
    importKwh: number;
    exportKwh: number;
    totalElecKwh: number;
    totalBeforePLNYear: number;
    totalAfterPLNYear: number;
  };
  pricing: {
    capexPLN: number;
    dotationPLN: number;
    financePLN: number;
    monthlyPaymentPLN: number;
    monthlyBillsBeforePLN: number;
    monthlyBillsAfterPLN: number;
    monthlyTotalAfterPLN: number;
  };
  offer: {
    pvPackageLabel: string;
    batteryLabel: string;
    heatingLabel: string;
    installLabel: string;
    checklistNeeded: boolean;
  };
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function annuityPayment(principal: number, apr: number, years: number) {
  if (principal <= 0) return 0;
  const r = apr / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
}

function estimateBaseHomeKwh(areaM2: number, energyClass: WizardData["energyClass"]) {
  // Conservative, simple model: 2500..6500 kWh/yr for typical home loads
  const areaFactor = clamp(areaM2, 60, 300) / 140;
  const classFactor =
    energyClass === "A"
      ? 0.85
      : energyClass === "B"
      ? 0.92
      : energyClass === "C"
      ? 1.0
      : energyClass === "D"
      ? 1.08
      : energyClass === "E"
      ? 1.18
      : energyClass === "F"
      ? 1.28
      : energyClass === "G"
      ? 1.38
      : 1.0;

  return clamp(4200 * areaFactor * classFactor, 2500, 6500);
}

function devicesToAnnualKwh(devices: ManualDeviceRow[]) {
  let dayKwh = 0;
  let nightKwh = 0;

  for (const d of devices) {
    const dailyKwh =
      Math.max(0, d.powerKw) * Math.max(0, d.qty) * Math.max(0, d.hoursPerDay);

    const daysPerWeek = d.days === "codziennie" ? 7 : d.days === "pn-pt" ? 5 : 2;
    const weeksPerYear = 52;
    const seasonFactor = d.seasonal ? clamp(d.months, 1, 12) / 12 : 1;

    const annual = dailyKwh * daysPerWeek * weeksPerYear * seasonFactor;

    if (d.profile === "dzień") dayKwh += annual;
    else if (d.profile === "noc") nightKwh += annual;
    else {
      dayKwh += annual * 0.6;
      nightKwh += annual * 0.4;
    }
  }

  const total = dayKwh + nightKwh;
  const dayShare = total > 0 ? dayKwh / total : 0.55;
  return { totalKwh: total, dayShare };
}

function pickPvPackage(config: PricingConfig, targetKwhYear: number, roofAreaM2: number | null) {
  const yieldPerKwp = config.meta.regionYieldKwhPerKwp;

  const targetKwpFromKwh = clamp(targetKwhYear / yieldPerKwp, 3, 20);

  let roofMaxKwp = Infinity;
  if (roofAreaM2 && roofAreaM2 > 0) {
    // conservative 6 m² per 1 kWp
    roofMaxKwp = clamp(roofAreaM2 / 6, 3, 30);
  }

  const maxKwp = Math.min(targetKwpFromKwh, roofMaxKwp);

  const active = config.pvPackages.filter((p) => p.active).sort((a, b) => a.kwp - b.kwp);
  if (active.length === 0) return { kwp: 9.9, pricePLN: 60000 };

  const pick = active.find((p) => p.kwp >= maxKwp) ?? active[active.length - 1];
  return { kwp: pick.kwp, pricePLN: pick.pricePLN };
}

function recommendBatteryKwh(data: WizardData) {
  const hasEV = data.evNow || data.evPlan !== "nie";
  const wantsUpgrade = data.upgradeHeating !== "nie";
  const isAirToWater = data.upgradeType === "p_w";

  if (data.batteryMode === "none") return 0;
  if (data.batteryMode === "manual") return data.batteryManualKwh ?? 10;

  let kwh: 5 | 10 | 15 = 10;
  if (hasEV) kwh = 15;
  if (wantsUpgrade && isAirToWater) kwh = 15;
  if (!hasEV && !wantsUpgrade) kwh = 10;
  if (!hasEV && wantsUpgrade && data.upgradeType === "p_p_gas_backup") kwh = 10;
  return kwh;
}

function calcSelfRate(data: WizardData, batteryKwh: number, dayShare: number) {
  // baseline self-consumption without battery around 35-45%, depends on day usage
  let rate = 0.38 + (dayShare - 0.5) * 0.2;

  rate += data.evNow || data.evPlan !== "nie" ? 0.05 : 0;
  rate += data.upgradeType === "p_w" ? 0.06 : data.upgradeType === "p_p_gas_backup" ? 0.04 : 0;
  rate += data.sunCond === "trudne" ? -0.02 : 0;

  if (batteryKwh >= 15) rate += 0.25;
  else if (batteryKwh >= 10) rate += 0.18;
  else if (batteryKwh >= 5) rate += 0.1;

  return clamp(rate, 0.25, 0.9);
}

export function runCalc(config: PricingConfig, data: WizardData): CalcResult {
  const elecPrice = config.meta.elecPriceAllInPLNPerKwh;
  const exportCredit = config.meta.exportCreditPLNPerKwh;

  // BEFORE: from user PLN inputs
  const elecBeforePLN = data.elecCostYearPLN ?? 0;
  const heatBeforePLN = data.heatingCostYearPLN ?? 0;
  const totalBeforePLN = elecBeforePLN + heatBeforePLN;

  // Estimate annual kWh
  let dayShare = 0.6;

  let totalElecKwh = data.advancedMode
    ? devicesToAnnualKwh(data.devices).totalKwh
    : data.elecCostYearPLN
    ? data.elecCostYearPLN / elecPrice
    : estimateBaseHomeKwh(data.houseAreaM2, data.energyClass);

  if (data.advancedMode) {
    const d = devicesToAnnualKwh(data.devices);
    totalElecKwh = Math.max(0, d.totalKwh);
    dayShare = d.dayShare;
  } else {
    dayShare = 0.6;
  }

  // Add EV energy if not already in manual devices
  const evKwh = data.evNow ? data.evKmYear * 0.18 : 0;
  if (!data.advancedMode) totalElecKwh += evKwh;

  // Heating upgrade effect approximation
  let addElecForHeating = 0;
  let gasAfterPLN = 0;

  if (data.upgradeHeating !== "nie") {
    if (data.upgradeType === "p_w") {
      const baseHeatKwh = data.heatingCostYearPLN
        ? data.heatingCostYearPLN /
          (data.heatingCurrent === "gaz" ? config.meta.gasPriceAllInPLNPerKwh : elecPrice)
        : data.houseAreaM2 * 80;

      const scOP =
        data.emitters === "podlogowka" ? 3.5 :
        data.emitters === "mieszane" ? 3.0 :
        data.emitters === "grzejniki" ? 2.6 : 3.0;

      addElecForHeating = baseHeatKwh / scOP;
      gasAfterPLN = 0;
    } else if (data.upgradeType === "p_p_gas_backup") {
      const baseHeatKwh = data.heatingCostYearPLN
        ? data.heatingCostYearPLN /
          (data.heatingCurrent === "gaz" ? config.meta.gasPriceAllInPLNPerKwh : elecPrice)
        : data.houseAreaM2 * 75;

      const shareElec = 0.65;
      const scOP = 3.1;

      addElecForHeating = (baseHeatKwh * shareElec) / scOP;
      gasAfterPLN = baseHeatKwh * (1 - shareElec) * config.meta.gasPriceAllInPLNPerKwh;
    } else {
      gasAfterPLN = data.heatingCostYearPLN ?? 0;
    }
  } else {
    gasAfterPLN = data.heatingCostYearPLN ?? 0;
  }

  if (!data.advancedMode) totalElecKwh += addElecForHeating;

  // Pick PV
  const pvPick = pickPvPackage(config, totalElecKwh * 0.85, data.roofAreaM2);

  const pvKwhYear =
    pvPick.kwp *
    config.meta.regionYieldKwhPerKwp *
    (data.sunCond === "dobre" ? 1 : data.sunCond === "średnie" ? 0.92 : 0.82);

  // Battery
  const batteryKwh = recommendBatteryKwh(data);
  const selfRate = calcSelfRate(data, batteryKwh, dayShare);

  const selfUsed = pvKwhYear * selfRate;
  const importKwh = Math.max(0, totalElecKwh - selfUsed);
  const exportKwh = Math.max(0, pvKwhYear - selfUsed);

  // After electricity bill (simplified net-billing)
  const elecAfterPLNYear =
    importKwh * elecPrice -
    exportKwh * exportCredit +
    config.meta.fixedGridFeesPLNPerMonth * 12;

  const totalAfterPLN = Math.max(0, elecAfterPLNYear) + Math.max(0, gasAfterPLN);

  // CAPEX
  const batteryPrice =
    batteryKwh === 0
      ? 0
      : config.batteryOptions.find((b) => b.active && b.kwh === batteryKwh)?.pricePLN ?? 0;

  const emsPrice = config.ems.active ? config.ems.pricePLN : 0;

  let heatingPrice = 0;
  let heatingLabel = "Bez modernizacji ogrzewania";

  if (data.upgradeHeating !== "nie") {
    if (data.upgradeType === "p_w" && config.heatingPackages.airToWater.active) {
      heatingPrice += config.heatingPackages.airToWater.pricePLN;
      heatingLabel = config.heatingPackages.airToWater.name;
    } else if (data.upgradeType === "p_p_gas_backup" && config.heatingPackages.airToAir4Rooms.active) {
      heatingPrice += config.heatingPackages.airToAir4Rooms.pricePLN;
      heatingLabel = config.heatingPackages.airToAir4Rooms.name + " + gaz jako rezerwa";
    } else {
      heatingLabel = "Dobór ogrzewania: do konsultacji";
    }
  }

  if (data.wantBathroomFloorHeat && config.heatingPackages.bathroomFloorHeating.active) {
    heatingPrice += config.heatingPackages.bathroomFloorHeating.pricePLN;
    heatingLabel += " + (łazienki: podłogowe elektryczne)";
  }

  // Install vs no install
  let installPrice = 0;
  let installLabel = "Tylko sprzęt (bez montażu)";

  if (data.installationMode === "z_montazem") {
    const mult = config.installAdders.roofMultiplier[data.sunCond] ?? 1;
    installPrice =
      (config.installAdders.baseInstallPLN + config.installAdders.perKwpInstallPLN * pvPick.kwp) * mult;
    installLabel = "Z montażem";
  }

  const capex = pvPick.pricePLN + batteryPrice + emsPrice + heatingPrice + installPrice;

  // Dotations
  let dot = 0;

  if (data.includeDotations) {
    if (data.dot_mojPrad) {
      const eligible = pvPick.pricePLN + batteryPrice + emsPrice;
      dot += Math.min(config.dotations.mojPradMaxPLN, eligible * 0.55);
    }

    if (data.upgradeType === "p_w") {
      if (data.dot_czyste_increased) dot += config.dotations.czystePowietrze_airToWater_increasedPLN;
      else if (data.dot_czyste_basic) dot += config.dotations.czystePowietrze_airToWater_basicPLN;
    }

    if (data.dot_ulga_termo && config.dotations.includeUlgaTermoHint) {
      dot += Math.min(9000, capex * 0.08);
    }
  }

  dot = Math.min(dot, capex * 0.7);

  const finance = Math.max(0, capex - dot);
  const apr = data.aprOverride ?? config.meta.defaultInterestAPR;

  const monthlyPayment = data.payMode === "kredyt" ? annuityPayment(finance, apr, data.creditYears) : 0;

  const monthlyBillsBefore = totalBeforePLN / 12;
  const monthlyBillsAfter = totalAfterPLN / 12;
  const monthlyTotalAfter = monthlyBillsAfter + monthlyPayment;

  const checklistNeeded = data.installationMode === "bez_montazu";

  return {
    assumptions: {
      pvKwp: pvPick.kwp,
      pvKwhYear,
      batteryKwh,
      selfRate,
      importKwh,
      exportKwh,
      totalElecKwh,
      totalBeforePLNYear: totalBeforePLN,
      totalAfterPLNYear: totalAfterPLN,
    },
    pricing: {
      capexPLN: round(capex),
      dotationPLN: round(dot),
      financePLN: round(finance),
      monthlyPaymentPLN: round(monthlyPayment),
      monthlyBillsBeforePLN: round(monthlyBillsBefore),
      monthlyBillsAfterPLN: round(monthlyBillsAfter),
      monthlyTotalAfterPLN: round(monthlyTotalAfter),
    },
    offer: {
      pvPackageLabel: `${pvPick.kwp.toFixed(1)} kWp`,
      batteryLabel: batteryKwh === 0 ? "Bez magazynu" : `${batteryKwh} kWh`,
      heatingLabel,
      installLabel,
      checklistNeeded,
    },
  };
}

function round(n: number) {
  return Math.round(n);
}
