// src/pages/CalculatorWizard.tsx
import { useMemo, useState } from "react";
import { DEFAULT_CONFIG, type PricingConfig } from "../lib/config";
import { loadJSON, saveJSON } from "../lib/storage";
import { checklistAsTextBlock } from "../lib/checklist";
import { useLanguage } from "../lib/LanguageContext";
import type { Language } from "../lib/i18n";

const PRICING_KEY = "solimax_pl_pricing_config_v1";

/** ---------------------------
 * Types (local, minimal)
 * --------------------------*/
type EnergyClass = "brak" | "A" | "B" | "C" | "D" | "E" | "F" | "G";
type HouseType = "nowy" | "modernizowany";

type HeatingCurrent =
  | "gaz"
  | "wegiel_pellet"
  | "olej"
  | "prad"
  | "pompa_ciepla"
  | "inne";

type HeatingUpgrade = "none" | "air_to_water" | "air_to_air_gas_backup" | "unknown";

type RoofType = "skośny" | "płaski" | "grunt";
type SunCond = "dobre" | "średnie" | "trudne";

type BatteryMode = "auto" | "manual" | "none";
type InstallationMode = "with_install" | "without_install";
type PayMode = "cash" | "credit";
type PackageType = "standard" | "premium";
type ClimateZone = "normal" | "cold" | "auto";

type EmittersType = "podlogowka" | "grzejniki" | "mieszane" | "nie_wiem";
type RadiatorsKind = "zeliwne" | "panelowe" | "niskotemp" | "nie_wiem";

type ManualProfile = "dzien" | "noc" | "mieszany";
type ManualDeviceRow = {
  name: string;
  powerkW: number;
  qty: number;
  hoursPerDay: number;
  profile: ManualProfile;
  seasonal: boolean;
  months: number[]; // 1..12
};

type WizardData = {
  // step 1
  address: string;
  houseAreaM2: number | "";
  energyClass: EnergyClass;
  houseType: HouseType;

  // step 2
  advancedManual: boolean;
  elecCostYearPLN: number | "";
  heatingTypeCurrent: HeatingCurrent;
  heatingCostYearPLN: number | "" | "nie_wiem";

  // manual step 2A
  manualDevices: ManualDeviceRow[];

  // step 3
  evNow: boolean;
  evKmYear: number | "";
  evPlan: "nie" | "0_12" | "1_3" | "3_plus";
  homeCharging: "tak" | "nie" | "planuje";

  // step 4
  roofType: RoofType;
  roofAreaM2: number | "" | "nie_wiem";
  sunCond: SunCond;

  // step 5
  batteryMode: BatteryMode;
  batteryKwhManual: 5 | 10 | 15;

  // step 6
  upgradeHeating: "tak" | "nie" | "rozwazam";
  targetHeating: HeatingUpgrade;
  emittersType: EmittersType;
  climateZone: ClimateZone;
  radiatorsKind: RadiatorsKind;
  keepExistingSystem: "wymiana" | "pod_istniejaca" | "nie_wiem";

  // step 7
  payMode: PayMode;
  creditYears: 5 | 7 | 10;
  includeDotacje: boolean;
  dot_moj_prad: boolean;
  dot_czyste_powietrze: boolean;
  dot_ulga_termo: boolean;

  installationMode: InstallationMode;

  // lead
  leadName: string;
  leadPhone: string;
  leadEmail: string;
  leadConsent: boolean;

  // package
  packageType: PackageType;
};

type HeatingType = "no_change" | "air_to_water" | "air_to_air_backup" | "modernization";
type NoteKey = "autoConsumption" | "dayProfile" | "batteryAuto" | "ulgaTermo" | "checklist" | "heatPumpExtra";

type CalcResult = {
  pvKwp: number;
  batteryKwh: number;
  heatingType: HeatingType;
  withInstall: boolean;
  checklistNeeded: boolean;

  // NEW: Pricing model fields
  pricePvPLN: number;
  priceHpPLN: number;
  heatPumpPowerKw: number;
  packageType: PackageType;

  capexPLN: number;
  dotacjaPLN: number;
  financePLN: number;
  monthlyPaymentPLN: number;

  monthlyBeforePLN: number;
  monthlyAfterBillsPLN: number;
  monthlyTotalAfterPLN: number;

  selfRate: number;
  dayShare: number;
  noteKeys: NoteKey[];
};

/** ---------------------------
 * Helpers
 * --------------------------*/
function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
function round(n: number, digits = 0) {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
}
function fmtPLN(n: number, lang: Language = "pl") {
  const v = isFinite(n) ? n : 0;
  const locale = lang === "ua" ? "uk-UA" : lang === "de" ? "de-DE" : lang === "en" ? "en-GB" : "pl-PL";
  return v.toLocaleString(locale) + " zł";
}
function fmtNum(n: number, digits = 1) {
  return n.toFixed(digits);
}
function monthArrayAll() {
  return [1,2,3,4,5,6,7,8,9,10,11,12];
}
function annuityPayment(principal: number, years: number, annualRate: number) {
  const r = annualRate / 12;
  const n = years * 12;
  if (principal <= 0) return 0;
  if (r <= 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

function defaultWizardData(): WizardData {
  return {
    address: "",
    houseAreaM2: 140,
    energyClass: "brak",
    houseType: "modernizowany",

    advancedManual: false,
    elecCostYearPLN: "",
    heatingTypeCurrent: "gaz",
    heatingCostYearPLN: "",

    manualDevices: [
      {
        name: "Oświetlenie + AGD (szacunek)",
        powerkW: 0.3,
        qty: 1,
        hoursPerDay: 6,
        profile: "mieszany",
        seasonal: false,
        months: monthArrayAll(),
      },
    ],

    evNow: false,
    evKmYear: "",
    evPlan: "nie",
    homeCharging: "nie",

    roofType: "skośny",
    roofAreaM2: "nie_wiem",
    sunCond: "dobre",

    batteryMode: "auto",
    batteryKwhManual: 15,

    upgradeHeating: "nie",
    targetHeating: "none",
    emittersType: "nie_wiem",
    climateZone: "auto",
    radiatorsKind: "nie_wiem",
    keepExistingSystem: "nie_wiem",

    payMode: "credit",
    creditYears: 10,
    includeDotacje: true,
    dot_moj_prad: true,
    dot_czyste_powietrze: true,
    dot_ulga_termo: false,

    installationMode: "with_install",

    leadName: "",
    leadPhone: "",
    leadEmail: "",
    leadConsent: false,

    packageType: "standard",
  };
}

/** ---------------------------
 * STUB PRICING CONFIG
 * TODO: Replace with admin panel values later
 * --------------------------*/
const STUB_PRICING = {
  pv: {
    perKwp: 500,           // PLN per kWp
    perBatteryKwh: 300,    // PLN per kWh battery
    fixedCost: 3000,       // PLN fixed
    premiumMultiplier: 1.5,
  },
  heatPump: {
    perKw: 1000,           // PLN per kW
    fixedCost: 10000,      // PLN fixed
    premiumMultiplier: 1.5,
  },
};

/** ---------------------------
 * Compute (simple v1)
 * NOTE: uses cfg as any to avoid type mismatch with your config.ts
 * --------------------------*/
function computeResult(d: WizardData, cfgTyped: PricingConfig): CalcResult {
  const cfg = cfgTyped as any;

  // Admin-configurable knobs (fallbacks)
  const elecPriceAllIn = cfg?.energy?.elecPriceAllInPLN ?? 0.95;
  const exportCreditPrice = cfg?.energy?.exportCreditPLN ?? 0.40;
  const gasPriceAllIn = cfg?.energy?.gasPriceAllInPLN ?? 0.35; // per kWh(th) equiv, just placeholder

  const yieldKwhPerKwp = cfg?.energy?.pvYieldKwhPerKwp ?? 1000;

  const creditRateAnnual = cfg?.finance?.annualRate ?? 0.075;

  const fixedFeesMonthly = cfg?.energy?.fixedFeesMonthlyPLN ?? 35;

  // Pricing packages (fallbacks)
  const pvPricePerKwp = cfg?.prices?.pvPricePerKwpPLN ?? 4200;
  const pvMinKwp = cfg?.prices?.pvMinKwp ?? 3;

  const batteryPrices = cfg?.prices?.batteryPLN ?? { 5: 12000, 10: 20000, 15: 26000 };
  const emsPrice = cfg?.prices?.emsPLN ?? 4500;

  const hpAirToWaterPackage = cfg?.prices?.heat_airToWaterPLN ?? 60000;
  const hpAirToAirPackage = cfg?.prices?.heat_airToAir4RoomsPLN ?? 24000;

  const installBasePV = cfg?.prices?.installBasePVPLN ?? 9000;
  const installPerKwp = cfg?.prices?.installPerKwpPLN ?? 250;
  const installHeatExtra = cfg?.prices?.installHeatExtraPLN ?? 8000;

  // Dotacje caps (fallbacks)
  const dotMP_PV = cfg?.dotations?.mojPrad_pvPLN ?? 6000;
  const dotMP_BAT = cfg?.dotations?.mojPrad_batteryPLN ?? 16000;
  const dotCP_A2W_basic = cfg?.dotations?.czystePowietrze_airToWater_basicPLN ?? 14080;
  

  // 1) Monthly BEFORE (use user costs directly)
  const elecYear = typeof d.elecCostYearPLN === "number" ? d.elecCostYearPLN : 0;
  const heatYear =
    d.heatingCostYearPLN === "nie_wiem" ? 0 : typeof d.heatingCostYearPLN === "number" ? d.heatingCostYearPLN : 0;
  const monthlyBefore = (elecYear + heatYear) / 12;

  // 2) Estimate annual kWh demand
  // If manual mode: compute from devices; else approximate from PLN using price.
  let totalKwhYear = 0;
  let dayShare = 0.55;

  if (d.advancedManual) {
    const deviceKwhYear = d.manualDevices.reduce((acc, r) => {
      const base = Math.max(0, r.powerkW) * Math.max(1, r.qty) * Math.max(0, r.hoursPerDay) * 365;
      const seasonalFactor = r.seasonal ? clamp(r.months.length / 12, 0.1, 1) : 1;
      return acc + base * seasonalFactor;
    }, 0);

    totalKwhYear = deviceKwhYear;

    // profile estimate
    const profScore = d.manualDevices.reduce((acc, r) => {
      const w = Math.max(0, r.powerkW) * Math.max(1, r.qty) * Math.max(0, r.hoursPerDay);
      if (r.profile === "dzien") return acc + w * 1.0;
      if (r.profile === "noc") return acc + w * 0.2;
      return acc + w * 0.6;
    }, 0);
    const denom = d.manualDevices.reduce((acc, r) => acc + Math.max(0, r.powerkW) * Math.max(1, r.qty) * Math.max(0, r.hoursPerDay), 0);
    dayShare = denom > 0 ? clamp(profScore / denom, 0.2, 0.9) : 0.55;

    // add EV if exists/planned
    const evKm = typeof d.evKmYear === "number" ? d.evKmYear : 0;
    const hasEV = d.evNow || d.evPlan !== "nie";
    if (hasEV && evKm > 0) {
      totalKwhYear += evKm * 0.18;
      dayShare = clamp(dayShare + 0.05, 0.2, 0.9);
    }
  } else {
    // convert PLN to kWh by price
    const elecKwh = elecPriceAllIn > 0 ? elecYear / elecPriceAllIn : 0;
    totalKwhYear = elecKwh;
    if (d.evNow || d.evPlan !== "nie") dayShare = clamp(dayShare + 0.05, 0.2, 0.9);
  }

  // 3) Heating upgrade impacts (simplified, marketing-friendly but not fantasy)
  let heatingType: HeatingType = "no_change";
  let heatingAddsCapex = 0;

  if (d.upgradeHeating !== "nie") {
    if (d.targetHeating === "air_to_water") {
      heatingType = "air_to_water";
      heatingAddsCapex = hpAirToWaterPackage;

      // shift part of heating costs to electricity (roughly)
      // If user provided heating PLN, assume it's current fuel cost and convert to thermal kWh (placeholder),
      // then divide by SCOP.
      const sc = d.emittersType === "podlogowka" ? 3.6 : d.emittersType === "grzejniki" ? 2.8 : 3.2;
      const heatThermalKwh = gasPriceAllIn > 0 ? heatYear / gasPriceAllIn : 0;
      const addElecKwh = heatThermalKwh / sc;

      totalKwhYear += addElecKwh;
      dayShare = clamp(dayShare + 0.10, 0.2, 0.95);
    } else if (d.targetHeating === "air_to_air_gas_backup") {
      heatingType = "air_to_air_backup";
      heatingAddsCapex = hpAirToAirPackage;

      // move part of heating to electricity, keep gas minimal
      const shareToElec = d.emittersType === "podlogowka" ? 0.75 : 0.55;
      const scop = 3.2;
      const heatThermalKwh = gasPriceAllIn > 0 ? heatYear / gasPriceAllIn : 0;
      const movedThermal = heatThermalKwh * shareToElec;
      totalKwhYear += movedThermal / scop;
      dayShare = clamp(dayShare + 0.07, 0.2, 0.95);
    } else if (d.targetHeating === "unknown") {
      heatingType = "modernization";
      // no capex added here; keep neutral
    }
  }

  // 4) PV sizing
  // target: cover 70-110% of annual kWh depending on profile and EV/heat
  const sizingFactor = clamp(0.75 + (dayShare - 0.5) * 0.8, 0.65, 1.10);
  let pvKwp = (totalKwhYear * sizingFactor) / yieldKwhPerKwp;

  // roof constraint if area known: approx 1 kWp per 5.5 m²
  if (typeof d.roofAreaM2 === "number" && d.roofAreaM2 > 10) {
    const maxKwp = d.roofAreaM2 / 5.5;
    pvKwp = Math.min(pvKwp, maxKwp);
  }
  pvKwp = clamp(pvKwp, pvMinKwp, 20);
  // nicer marketing tiers
  const tiers = [3.3, 4.4, 6.6, 7.7, 9.9, 12.0, 15.0, 20.0];
  pvKwp = tiers.reduce((best, t) => (Math.abs(t - pvKwp) < Math.abs(best - pvKwp) ? t : best), tiers[0]);

  // 5) Battery selection
  let batteryKwh = 0;
  if (d.batteryMode === "none") {
    batteryKwh = 0;
  } else if (d.batteryMode === "manual") {
    batteryKwh = d.batteryKwhManual;
  } else {
    // auto
    const hasEV = d.evNow || d.evPlan !== "nie";
    const hasHeat = d.upgradeHeating !== "nie" && (d.targetHeating === "air_to_water" || d.targetHeating === "air_to_air_gas_backup");
    if (hasEV && hasHeat) batteryKwh = 15;
    else if (hasEV || hasHeat) batteryKwh = 10;
    else batteryKwh = 5;
  }

  // 6) Self-consumption model (simple)
  // base depends on dayShare; battery increases; EMS adds small bonus
  let selfRate = clamp(0.35 + (dayShare - 0.5) * 0.4, 0.25, 0.65);
  if (batteryKwh === 5) selfRate += 0.10;
  if (batteryKwh === 10) selfRate += 0.18;
  if (batteryKwh === 15) selfRate += 0.24;
  const hasEMS = true; // we include EMS by default (can be made toggle later)
  if (hasEMS) selfRate += 0.06;
  selfRate = clamp(selfRate, 0.20, 0.90);

  const pvKwhYear = pvKwp * yieldKwhPerKwp;
  const selfUsed = pvKwhYear * selfRate;
  const importKwh = Math.max(0, totalKwhYear - selfUsed);
  const exportKwh = Math.max(0, pvKwhYear - selfUsed);

  // Bills AFTER (electric)
  const elecBillYearAfter = importKwh * elecPriceAllIn - exportKwh * exportCreditPrice;
  const elecBillMonthAfter = elecBillYearAfter / 12 + fixedFeesMonthly;

  // Gas after (if p/p gas backup keep small gas cost; otherwise keep old if no change)
  let gasMonthAfter = 0;
  if (d.upgradeHeating === "nie" && d.heatingTypeCurrent === "gaz") {
    gasMonthAfter = heatYear / 12;
  } else if (d.targetHeating === "air_to_air_gas_backup") {
    // keep 20% of original heating bill as gas reserve baseline
    gasMonthAfter = (heatYear * 0.20) / 12;
  } else {
    gasMonthAfter = 0;
  }

  const monthlyAfterBills = Math.max(0, elecBillMonthAfter + gasMonthAfter);

  // 7) CAPEX
  const pvCapex = pvKwp * pvPricePerKwp;
  const batteryCapex = batteryKwh === 0 ? 0 : batteryPrices?.[batteryKwh] ?? 0;
  const emsCapex = hasEMS ? emsPrice : 0;

  const installCapex =
    d.installationMode === "with_install"
      ? installBasePV + pvKwp * installPerKwp + (heatingAddsCapex > 0 ? installHeatExtra : 0)
      : 0;

  const capex = pvCapex + batteryCapex + emsCapex + heatingAddsCapex + installCapex;

  // 8) Dotacje (simplified estimate)
  let dot = 0;
  if (d.includeDotacje) {
    if (d.dot_moj_prad) {
      dot += dotMP_PV;
      if (batteryKwh > 0) dot += dotMP_BAT;
    }
    if (d.dot_czyste_powietrze && d.targetHeating === "air_to_water") {
      // choose “attractive” but still plausible: basic by default, increased if low-income not known -> we keep basic
      dot += dotCP_A2W_basic;
    }
    // ulga termo is tax relief, not direct payout — we DO NOT add to dot cash,
    // but we can show hint in notes.
  }

  dot = Math.min(dot, capex * 0.60); // sanity cap

  const finance = Math.max(0, capex - dot);
  const monthlyPayment = d.payMode === "credit" ? annuityPayment(finance, d.creditYears, creditRateAnnual) : 0;

  const monthlyTotalAfter = monthlyAfterBills + monthlyPayment;

  // 9) Install label + checklist
  const withInstall = d.installationMode === "with_install";
  const checklistNeeded = d.installationMode === "without_install";

  const noteKeys: NoteKey[] = ["autoConsumption", "dayProfile"];
  if (d.batteryMode === "auto") noteKeys.push("batteryAuto");
  if (d.dot_ulga_termo) noteKeys.push("ulgaTermo");
  if (checklistNeeded) noteKeys.push("checklist");

  // ========== ЕТАП 1: Stub pricing model ==========
  const premiumMult = d.packageType === "premium" ? 1.5 : 1.0;
  
  // PV price: pvKwp * perKwp + battery * perKwh + fixed
  const pricePvPLN = round(
    (pvKwp * STUB_PRICING.pv.perKwp + batteryKwh * STUB_PRICING.pv.perBatteryKwh + STUB_PRICING.pv.fixedCost) * premiumMult
  );

  // ========== ЕТАП 2: Heat pump power calculation ==========
  // emittersFactor: floor heating (podlogowka) is more efficient
  const emittersFactor = 
    d.emittersType === "podlogowka" ? 0.9 : 
    d.emittersType === "grzejniki" ? 1.15 : 
    d.emittersType === "mieszane" ? 1.0 : 
    1.0; // nie_wiem -> neutral
  
  // climateFactor: cold regions need more power
  const climateFactor = 
    d.climateZone === "cold" ? 1.2 : 
    d.climateZone === "normal" ? 1.0 : 
    1.1; // auto -> assume slightly elevated average for Poland
  
  let heatPumpPowerKw = 0;
  let priceHpPLN = 0;
  
  if (d.upgradeHeating !== "nie" && (d.targetHeating === "air_to_water" || d.targetHeating === "air_to_air_gas_backup")) {
    // Estimate thermal demand from heating costs
    const heatThermalKwh = gasPriceAllIn > 0 ? heatYear / gasPriceAllIn : 0;
    
    // Base HP power calculation: thermal demand / 2000 hours heating season
    // Then apply emitters and climate factors
    const basePower = heatThermalKwh / 2000;
    heatPumpPowerKw = round(
      Math.max(5, Math.min(16, basePower * emittersFactor * climateFactor)), 
      1
    );
    
    priceHpPLN = round(
      (heatPumpPowerKw * STUB_PRICING.heatPump.perKw + STUB_PRICING.heatPump.fixedCost) * premiumMult
    );
    
    noteKeys.push("heatPumpExtra");
  }
  // ========== END ЕТАП 2 ==========

  return {
    pvKwp,
    batteryKwh,
    heatingType,
    withInstall,
    checklistNeeded,

    capexPLN: round(capex),
    dotacjaPLN: round(dot),
    financePLN: round(finance),
    monthlyPaymentPLN: round(monthlyPayment),

    monthlyBeforePLN: round(monthlyBefore),
    monthlyAfterBillsPLN: round(monthlyAfterBills),
    monthlyTotalAfterPLN: round(monthlyTotalAfter),

    // ЕТАП 1: New pricing fields
    pricePvPLN,
    priceHpPLN,
    heatPumpPowerKw,
    packageType: d.packageType,

    selfRate,
    dayShare,
    noteKeys,
  };
}

/** ---------------------------
 * UI atoms
 * --------------------------*/
function StepShell(props: {
  title: string;
  subtitle?: string;
  step: number;
  total: number;
  children: any;
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  backLabel?: string;
  stepLabel?: string;
}) {
  const { title, subtitle, step, total, children, onBack, onNext, nextDisabled, nextLabel, backLabel, stepLabel } = props;
  return (
    <div id="calculator" className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 lg:px-8">
      <div className="max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">{stepLabel || "Krok"} {step}/{total}</div>
            <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
            {subtitle ? <p className="mt-2 text-slate-600">{subtitle}</p> : null}
          </div>
          <div className="w-32">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${Math.round((step / total) * 100)}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">{children}</div>

        <div className="mt-10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={!onBack}
            className={`px-4 py-2 rounded-lg border ${
              onBack ? "border-slate-300 hover:bg-slate-50" : "border-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {backLabel || "Wstecz"}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!onNext || !!nextDisabled}
            className={`px-4 py-2 rounded-lg ${
              !onNext || nextDisabled
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {nextLabel ?? "Dalej"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field(props: { label: string; hint?: string; children: any }) {
  return (
    <div className="space-y-1">
      <div className="text-sm font-medium">{props.label}</div>
      {props.children}
      {props.hint ? <div className="text-xs text-slate-500">{props.hint}</div> : null}
    </div>
  );
}

function Input(props: any) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 " +
        (props.className ?? "")
      }
    />
  );
}

function Select(props: any) {
  return (
    <select
      {...props}
      className={
        "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 " +
        (props.className ?? "")
      }
    />
  );
}

function Toggle(props: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  const { checked, onChange, label, hint } = props;
  return (
    <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1" />
      <div>
        <div className="font-medium">{label}</div>
        {hint ? <div className="text-xs text-slate-500 mt-1">{hint}</div> : null}
      </div>
    </label>
  );
}

/** ---------------------------
 * Main page
 * --------------------------*/
export default function CalculatorWizard() {
  const { language, t } = useLanguage();
  const [cfg, setCfg] = useState<PricingConfig>(() => loadJSON(PRICING_KEY, DEFAULT_CONFIG));
  const [data, setData] = useState<WizardData>(() => defaultWizardData());
  const [step, setStep] = useState<number>(1);
  const totalSteps = 7;
  const manualExtraStep = data.advancedManual ? 1 : 0; // step 2A exists when manual
  const totalWithManual = totalSteps + manualExtraStep;

  // reload config button (so you can edit admin and re-open calc)
  const reloadCfg = () => setCfg(loadJSON(PRICING_KEY, DEFAULT_CONFIG));

  const computed = useMemo(() => computeResult(data, cfg), [data, cfg]);

  function goNext() {
    // step mapping:
    // 1,2,(2A),3,4,5,6,7 => totalWithManual
    if (step === 2 && data.advancedManual) {
      setStep(3); // 2A is displayed as step=3 in UI (shifted)
      return;
    }
    setStep((s) => Math.min(totalWithManual, s + 1));
  }

  function goBack() {
    if (data.advancedManual && step === 3) {
      // back from 2A to 2
      setStep(2);
      return;
    }
    setStep((s) => Math.max(1, s - 1));
  }

  // UI step number in header (accounts manual)
  function uiStepIndex(): number {
    // We keep: 1..totalWithManual
    return step;
  }

  // Helpers update
  const patch = (p: Partial<WizardData>) => setData((prev) => ({ ...prev, ...p }));

  // Validation per step (minimal)
  const canNext = useMemo(() => {
    if (step === 1) {
      const okAddr = data.address.trim().length >= 3;
      const okArea = typeof data.houseAreaM2 === "number" && data.houseAreaM2 >= 40;
      return okAddr && okArea;
    }
    if (step === 2) {
      if (data.advancedManual) return true;
      const okElec = typeof data.elecCostYearPLN === "number" && data.elecCostYearPLN > 0;
      const okHeat = data.heatingCostYearPLN === "nie_wiem" || typeof data.heatingCostYearPLN === "number" || data.heatingTypeCurrent === "pompa_ciepla";
      return okElec && okHeat;
    }
    // manual extra step
    if (data.advancedManual && step === 3) {
      // at least one meaningful device
      const sum = data.manualDevices.reduce((acc, r) => acc + r.powerkW * r.qty * r.hoursPerDay, 0);
      return sum > 0;
    }
    // EV step index depends on manual
    const evStep = data.advancedManual ? 4 : 3;
    if (step === evStep) {
      if (!data.evNow) return true;
      const okKm = typeof data.evKmYear === "number" && data.evKmYear >= 1000;
      return okKm;
    }
    // roof
    const roofStep = data.advancedManual ? 5 : 4;
    if (step === roofStep) return true;

    // battery
    const batStep = data.advancedManual ? 6 : 5;
    if (step === batStep) return true;

    // heating
    const heatStep = data.advancedManual ? 7 : 6;
    if (step === heatStep) {
      if (data.upgradeHeating === "nie") return true;
      // if upgrading, target may be unknown but allowed
      return true;
    }

    // final step always ok (lead validation handled on submit)
    return true;
  }, [step, data]);

  // Step components mapping
  const step1 = (
    <StepShell
      title={t.calcStep1Title}
      subtitle={t.calcStep1Subtitle}
      step={uiStepIndex()}
      total={totalWithManual}
      onBack={undefined}
      onNext={goNext}
      nextDisabled={!canNext}
      stepLabel={t.step}
      backLabel={t.back}
      nextLabel={t.next}
    >
      <Field label={t.calcAddressLabel} hint={t.calcAddressHint}>
        <Input
          value={data.address}
          onChange={(e: any) => patch({ address: e.target.value })}
          placeholder={t.calcAddressPlaceholder}
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label={t.calcAreaLabel}>
          <Input
            type="number"
            value={data.houseAreaM2}
            onChange={(e: any) => patch({ houseAreaM2: e.target.value === "" ? "" : Number(e.target.value) })}
            min={40}
            max={400}
          />
        </Field>

        <Field label={t.calcBuildingType}>
          <Select value={data.houseType} onChange={(e: any) => patch({ houseType: e.target.value })}>
            <option value="nowy">{t.calcBuildingNew}</option>
            <option value="modernizowany">{t.calcBuildingModernized}</option>
          </Select>
        </Field>
      </div>

      <Field label={t.calcEnergyClass} hint={t.calcEnergyClassHint}>
        <Select value={data.energyClass} onChange={(e: any) => patch({ energyClass: e.target.value })}>
          <option value="brak">{t.calcEnergyClassNone}</option>
          {(["A","B","C","D","E","F","G"] as const).map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </Select>
      </Field>
    </StepShell>
  );

  const step2 = (
    <StepShell
      title={t.calcStep2Title}
      subtitle={t.calcStep2Subtitle}
      step={uiStepIndex()}
      total={totalWithManual}
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!canNext}
      stepLabel={t.step}
      backLabel={t.back}
      nextLabel={t.next}
    >
      <Toggle
        checked={data.advancedManual}
        onChange={(v) => {
          patch({ advancedManual: v });
          // reset step if turning off while in manual step later
          if (!v && step > 2) setStep(2);
        }}
        label={t.calcAdvancedMode}
        hint={t.calcAdvancedModeHint}
      />

      {!data.advancedManual ? (
        <>
          <Field label={t.calcElecCostLabel} hint={t.calcElecCostHint}>
            <Input
              type="number"
              value={data.elecCostYearPLN}
              onChange={(e: any) => patch({ elecCostYearPLN: e.target.value === "" ? "" : Number(e.target.value) })}
              min={0}
            />
          </Field>

          <Field label={t.calcHeatingCurrent}>
            <Select
              value={data.heatingTypeCurrent}
              onChange={(e: any) => patch({ heatingTypeCurrent: e.target.value })}
            >
              <option value="gaz">{t.calcHeatingGas}</option>
              <option value="wegiel_pellet">{t.calcHeatingCoalPellet}</option>
              <option value="olej">{t.calcHeatingOil}</option>
              <option value="prad">{t.calcHeatingElectric}</option>
              <option value="pompa_ciepla">{t.calcHeatingHeatPump}</option>
              <option value="inne">{t.calcHeatingOther}</option>
            </Select>
          </Field>

          <Field label={t.calcHeatingCostLabel} hint={t.calcHeatingCostHint}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                type="number"
                value={typeof data.heatingCostYearPLN === "number" ? data.heatingCostYearPLN : ""}
                onChange={(e: any) => patch({ heatingCostYearPLN: e.target.value === "" ? "" : Number(e.target.value) })}
                min={0}
                disabled={data.heatingCostYearPLN === "nie_wiem"}
              />
              <button
                type="button"
                onClick={() => patch({ heatingCostYearPLN: data.heatingCostYearPLN === "nie_wiem" ? "" : "nie_wiem" })}
                className={`px-3 py-2 rounded-lg border ${
                  data.heatingCostYearPLN === "nie_wiem"
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-white border-slate-300 text-slate-700"
                }`}
              >
                {data.heatingCostYearPLN === "nie_wiem" ? t.calcDontKnowEnabled : t.calcDontKnow}
              </button>
              <div className="text-xs text-slate-500 self-center">
                Jeśli „nie wiem”, wynik będzie bardziej orientacyjny.
              </div>
            </div>
          </Field>
        </>
      ) : (
        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
          {t.calcAdvancedModeEnabled}
        </div>
      )}

      <div className="text-xs text-slate-500 flex items-center justify-between">
        <span>{t.calcUsingAdminPricing} </span>
        <button type="button" onClick={reloadCfg} className="underline hover:no-underline">
          Odśwież ceny
        </button>
      </div>
    </StepShell>
  );

  const manualStep = (
    <StepShell
      title="Tryb zaawansowany — urządzenia i zużycie"
      subtitle={t.calcManualSubtitle}
      step={uiStepIndex()}
      total={totalWithManual}
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!canNext}
    >
      <div className="space-y-3">
        {data.manualDevices.map((r, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label={t.calcDeviceLabel}>
                <Input
                  value={r.name}
                  onChange={(e: any) => {
                    const next = [...data.manualDevices];
                    next[idx] = { ...r, name: e.target.value };
                    patch({ manualDevices: next });
                  }}
                  placeholder={t.calcDevicePlaceholder}
                />
              </Field>

              <Field label={t.calcPowerLabel}>
                <Input
                  type="number"
                  value={r.powerkW}
                  step="0.1"
                  min={0}
                  onChange={(e: any) => {
                    const next = [...data.manualDevices];
                    next[idx] = { ...r, powerkW: Number(e.target.value) };
                    patch({ manualDevices: next });
                  }}
                />
              </Field>

              <Field label={t.calcQuantityLabel}>
                <Input
                  type="number"
                  value={r.qty}
                  min={1}
                  onChange={(e: any) => {
                    const next = [...data.manualDevices];
                    next[idx] = { ...r, qty: Number(e.target.value) };
                    patch({ manualDevices: next });
                  }}
                />
              </Field>

              <Field label={t.calcHoursLabel}>
                <Input
                  type="number"
                  value={r.hoursPerDay}
                  min={0}
                  step="0.5"
                  onChange={(e: any) => {
                    const next = [...data.manualDevices];
                    next[idx] = { ...r, hoursPerDay: Number(e.target.value) };
                    patch({ manualDevices: next });
                  }}
                />
              </Field>

              <Field label={t.calcProfileLabel}>
                <Select
                  value={r.profile}
                  onChange={(e: any) => {
                    const next = [...data.manualDevices];
                    next[idx] = { ...r, profile: e.target.value };
                    patch({ manualDevices: next });
                  }}
                >
                  <option value="dzien">{t.calcProfileDay}</option>
                  <option value="noc">{t.calcProfileNight}</option>
                  <option value="mieszany">{t.calcProfileMixed}</option>
                </Select>
              </Field>

              <Field label={t.calcSeasonalLabel}>
                <Select
                  value={r.seasonal ? "tak" : "nie"}
                  onChange={(e: any) => {
                    const seasonal = e.target.value === "tak";
                    const next = [...data.manualDevices];
                    next[idx] = { ...r, seasonal, months: seasonal ? r.months : monthArrayAll() };
                    patch({ manualDevices: next });
                  }}
                >
                  <option value="nie">{t.calcSeasonalNo}</option>
                  <option value="tak">{t.calcSeasonalYes}</option>
                </Select>
              </Field>
            </div>

            {r.seasonal ? (
              <div className="mt-3 text-xs text-slate-600">
                {t.calcSeasonalNote.replace("{months}", String(r.months.length))}
              </div>
            ) : null}

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className="text-sm underline text-slate-600 hover:text-slate-900"
                onClick={() => {
                  const next = data.manualDevices.filter((_, i) => i !== idx);
                  patch({ manualDevices: next.length ? next : data.manualDevices });
                }}
              >
                Usuń
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50"
          onClick={() =>
            patch({
              manualDevices: [
                ...data.manualDevices,
                { name: "", powerkW: 1, qty: 1, hoursPerDay: 1, profile: "mieszany", seasonal: false, months: monthArrayAll() },
              ],
            })
          }
        >
          {t.calcAddDevice}
        </button>

        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
          <div className="text-sm font-medium text-emerald-900">{t.calcManualSummary}</div>
          <div className="mt-2 text-sm text-emerald-900">
            Rekomendacja i wynik pojawią się na końcu — na podstawie urządzeń, EV i ogrzewania.
          </div>
        </div>
      </div>
    </StepShell>
  );

  // Steps indices (depend on manual)
  const evStep = data.advancedManual ? 4 : 3;
  const roofStep = data.advancedManual ? 5 : 4;
  const batStep = data.advancedManual ? 6 : 5;
  const heatStep = data.advancedManual ? 7 : 6;
  const finalStep = data.advancedManual ? 8 : 7;

  const stepEV = (
    <StepShell
      title={t.calcEvTitle}
      subtitle={t.calcEvSubtitle}
      step={uiStepIndex()}
      total={totalWithManual}
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!canNext}
    >
      <Toggle checked={data.evNow} onChange={(v) => patch({ evNow: v })} label={t.calcEvNow} />
      {data.evNow ? (
        <Field label={t.calcEvKmYear}>
          <Input
            type="number"
            value={data.evKmYear}
            onChange={(e: any) => patch({ evKmYear: e.target.value === "" ? "" : Number(e.target.value) })}
            min={0}
          />
        </Field>
      ) : null}

      <Field label={t.calcEvPlan}>
        <Select value={data.evPlan} onChange={(e: any) => patch({ evPlan: e.target.value })}>
          <option value="nie">{t.calcSeasonalNo}</option>
          <option value="0_12">{t.calcEvPlan012}</option>
          <option value="1_3">{t.calcEvPlan13}</option>
          <option value="3_plus">{t.calcEvPlan3plus}</option>
        </Select>
      </Field>

      <Field label={t.calcEvHomeCharging}>
        <Select value={data.homeCharging} onChange={(e: any) => patch({ homeCharging: e.target.value })}>
          <option value="nie">{t.calcSeasonalNo}</option>
          <option value="tak">{t.calcSeasonalYes}</option>
          <option value="planuje">{t.calcEvHomeChargingPlanning}</option>
        </Select>
      </Field>
    </StepShell>
  );

  const stepRoof = (
    <StepShell
      title={t.calcRoofTitle}
      subtitle="Bez azymutów — tylko realistyczna ocena warunków."
      step={uiStepIndex()}
      total={totalWithManual}
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!canNext}
    >
      <Field label={t.calcRoofType}>
        <Select value={data.roofType} onChange={(e: any) => patch({ roofType: e.target.value })}>
          <option value="skośny">{t.calcRoofSloped}</option>
          <option value="płaski">{t.calcRoofFlat}</option>
          <option value="grunt">{t.calcRoofGround}</option>
        </Select>
      </Field>

      <Field label="Powierzchnia dachu (m²) — jeśli znasz">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            type="number"
            value={typeof data.roofAreaM2 === "number" ? data.roofAreaM2 : ""}
            onChange={(e: any) => patch({ roofAreaM2: e.target.value === "" ? "" : Number(e.target.value) })}
            disabled={data.roofAreaM2 === "nie_wiem"}
            min={0}
          />
          <button
            type="button"
            onClick={() => patch({ roofAreaM2: data.roofAreaM2 === "nie_wiem" ? "" : "nie_wiem" })}
            className={`px-3 py-2 rounded-lg border ${
              data.roofAreaM2 === "nie_wiem"
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-white border-slate-300 text-slate-700"
            }`}
          >
            {data.roofAreaM2 === "nie_wiem" ? t.calcDontKnowEnabled : t.calcDontKnow}
          </button>
          <div className="text-xs text-slate-500 self-center">Jeśli nie wiesz — dobierzemy po rachunkach.</div>
        </div>
      </Field>

      <Field label={t.calcSunConditions}>
        <Select value={data.sunCond} onChange={(e: any) => patch({ sunCond: e.target.value })}>
          <option value="dobre">{t.calcSunGood}</option>
          <option value="średnie">{t.calcSunMedium}</option>
          <option value="trudne">{t.calcSunDifficult}</option>
        </Select>
      </Field>
    </StepShell>
  );

  const stepBattery = (
    <StepShell
      title={t.calcBatteryTitle}
      subtitle={t.calcBatterySubtitle}
      step={uiStepIndex()}
      total={totalWithManual}
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!canNext}
    >
      <Field label={t.calcBatteryChoice}>
        <Select value={data.batteryMode} onChange={(e: any) => patch({ batteryMode: e.target.value })}>
          <option value="auto">Tak — system dobierze optymalnie (rekomendowane)</option>
          <option value="manual">Tak — wybieram sam</option>
          <option value="none">{t.calcBatteryNone}</option>
        </Select>
      </Field>

      {data.batteryMode === "manual" ? (
        <Field label={t.calcBatteryCapacity}>
          <Select
            value={data.batteryKwhManual}
            onChange={(e: any) => patch({ batteryKwhManual: Number(e.target.value) as 5 | 10 | 15 })}
          >
            <option value={5}>5 kWh</option>
            <option value={10}>10 kWh</option>
            <option value={15}>15 kWh</option>
          </Select>
        </Field>
      ) : null}

      <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
        W praktyce magazyn zwiększa autokonsumpcję i stabilizuje rachunki — szczególnie z EV i ogrzewaniem na prąd.
      </div>
    </StepShell>
  );

  const stepHeating = (
    <StepShell
      title="Ogrzewanie — modernizacja (opcjonalnie)"
      subtitle={t.calcHeatingSubtitle}
      step={uiStepIndex()}
      total={totalWithManual}
      onBack={goBack}
      onNext={goNext}
      nextDisabled={!canNext}
    >
      <Field label={t.calcHeatingUpgrade}>
        <Select value={data.upgradeHeating} onChange={(e: any) => patch({ upgradeHeating: e.target.value })}>
          <option value="nie">{t.calcSeasonalNo}</option>
          <option value="rozwazam">{t.calcHeatingUpgradeConsidering}</option>
          <option value="tak">{t.calcSeasonalYes}</option>
        </Select>
      </Field>

      {data.upgradeHeating !== "nie" ? (
        <>
          <Field label={t.calcHeatingTarget}>
            <Select
              value={data.targetHeating}
              onChange={(e: any) => patch({ targetHeating: e.target.value as HeatingUpgrade })}
            >
              <option value="air_to_water">Pompa ciepła powietrze–woda (p/w)</option>
              <option value="air_to_air_gas_backup">Powietrze–powietrze (p/p) + gaz jako rezerwa</option>
              <option value="unknown">Nie wiem — dobierzcie</option>
              <option value="none">{t.calcHeatingNoChange}</option>
            </Select>
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={t.calcEmitters}>
              <Select value={data.emittersType} onChange={(e: any) => patch({ emittersType: e.target.value })}>
                <option value="podlogowka">{t.calcEmittersFloor}</option>
                <option value="grzejniki">{t.calcEmittersRadiators}</option>
                <option value="mieszane">{t.calcEmittersMixed}</option>
                <option value="nie_wiem">{t.calcEmittersDontKnow}</option>
              </Select>
            </Field>

            <Field label={t.calcClimateZone}>
              <Select value={data.climateZone} onChange={(e: any) => patch({ climateZone: e.target.value as ClimateZone })}>
                <option value="auto">{t.calcClimateAuto}</option>
                <option value="normal">{t.calcClimateNormal}</option>
                <option value="cold">{t.calcClimateCold}</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.emittersType === "grzejniki" ? (
              <Field label={t.calcRadiatorsType}>
                <Select value={data.radiatorsKind} onChange={(e: any) => patch({ radiatorsKind: e.target.value })}>
                  <option value="zeliwne">{t.calcRadiatorsCastIron}</option>
                  <option value="panelowe">{t.calcRadiatorsPanel}</option>
                  <option value="niskotemp">{t.calcRadiatorsLowTemp}</option>
                  <option value="nie_wiem">{t.calcEmittersDontKnow}</option>
                </Select>
              </Field>
            ) : (
              <Field label={t.calcInstallationFit}>
                <Select
                  value={data.keepExistingSystem}
                  onChange={(e: any) => patch({ keepExistingSystem: e.target.value })}
                >
                  <option value="wymiana">{t.calcInstallationFull}</option>
                  <option value="pod_istniejaca">{t.calcInstallationExisting}</option>
                  <option value="nie_wiem">{t.calcEmittersDontKnow}</option>
                </Select>
              </Field>
            )}
          </div>

          <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900">
            Tip: Najbardziej „komfortowy” wariant to p/w, a „najtańszy start” to p/p + gaz jako rezerwa.
          </div>
        </>
      ) : (
        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
          {t.calcHeatingNoChangeNote}
        </div>
      )}
    </StepShell>
  );

  const stepFinal = (
    <StepShell
      title={t.calcFinalTitle}
      subtitle={t.calcFinalSubtitle}
      step={uiStepIndex()}
      total={totalWithManual}
      onBack={goBack}
      onNext={undefined}
      nextLabel="—"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offer */}
        <div className="p-5 rounded-2xl border border-slate-200">
          <div className="text-sm text-slate-500">{t.calcRecommendedConfig}</div>
          <div className="mt-2 text-xl font-semibold">PV {fmtNum(computed.pvKwp)} kWp</div>
          <div className="mt-2 text-slate-700">
            {t.calcStorage}: <span className="font-medium">{computed.batteryKwh === 0 ? t.calcNoStorage : `${computed.batteryKwh} kWh`}</span>
          </div>
          <div className="mt-1 text-slate-700">
            {t.calcHeating}: <span className="font-medium">{
              computed.heatingType === "no_change" ? t.calcHeatingNoChange2 :
              computed.heatingType === "air_to_water" ? t.calcHeatingAirToWater2 :
              computed.heatingType === "air_to_air_backup" ? t.calcHeatingAirToAirBackup :
              t.calcHeatingModernization
            }</span>
          </div>

          <Field label={t.calcInstallOption} hint={t.calcInstallOptionHint}>
            <Select
              value={data.installationMode}
              onChange={(e: any) => patch({ installationMode: e.target.value as InstallationMode })}
            >
              <option value="with_install">{t.calcWithInstall}</option>
              <option value="without_install">{t.calcWithoutInstall}</option>
            </Select>
          </Field>

          {computed.checklistNeeded ? (
            <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-medium">{t.calcChecklist}</div>
              <div className="mt-2 text-sm text-slate-700 whitespace-pre-line">{checklistAsTextBlock()}</div>
            </div>
          ) : null}

          <div className="mt-4 text-xs text-slate-500">
            {computed.noteKeys.map((key, i) => {
              const noteText = 
                key === "autoConsumption" ? `${t.calcAutoConsumption}: ${round(computed.selfRate * 100)}%` :
                key === "dayProfile" ? `${t.calcDayProfile}: ${round(computed.dayShare * 100)}%` :
                key === "batteryAuto" ? t.calcBatteryAutoNote :
                key === "ulgaTermo" ? t.calcUlgaTermoNote :
                key === "checklist" ? t.calcChecklistNote :
                key === "heatPumpExtra" ? t.calcHeatPumpExtra :
                "";
              return <div key={i}>• {noteText}</div>;
            })}
          </div>
        </div>

        {/* Finance */}
        <div className="p-5 rounded-2xl border border-slate-200">
          <div className="text-sm text-slate-500">{t.calcCostDotations}</div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-slate-600">{t.calcGrossPrice}</div>
              <div className="font-semibold">{fmtPLN(computed.capexPLN, language)}</div>
            </div>

            <Toggle
              checked={data.includeDotacje}
              onChange={(v) => patch({ includeDotacje: v })}
              label={t.calcIncludeDotations}
              hint="Bez obietnic — tylko limity programów."
            />

            {data.includeDotacje ? (
              <div className="grid grid-cols-1 gap-2">
                <Toggle checked={data.dot_moj_prad} onChange={(v) => patch({ dot_moj_prad: v })} label={t.calcMojPrad} />
                <Toggle
                  checked={data.dot_czyste_powietrze}
                  onChange={(v) => patch({ dot_czyste_powietrze: v })}
                  label={t.calcCzystePowietrze}
                  hint={t.calcCzystePowietrzeHint}
                />
                <Toggle
                  checked={data.dot_ulga_termo}
                  onChange={(v) => patch({ dot_ulga_termo: v })}
                  label={t.calcUlgaTermo}
                  hint={t.calcUlgaTermoHint}
                />
              </div>
            ) : null}

            <div className="flex items-center justify-between">
              <div className="text-slate-600">{t.calcEstimatedDotation}</div>
              <div className="font-semibold text-emerald-700">{fmtPLN(computed.dotacjaPLN, language)}</div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-slate-600">{t.calcAmountToFinance}</div>
              <div className="font-semibold">{fmtPLN(computed.financePLN, language)}</div>
            </div>

            {/* ЕТАП 1: Package type selection */}
            <Field label={t.calcPackage}>
              <Select value={data.packageType} onChange={(e: any) => patch({ packageType: e.target.value as PackageType })}>
                <option value="standard">{t.calcPackageStandard}</option>
                <option value="premium">Premium (×1.5)</option>
              </Select>
            </Field>

            {/* Show new pricing breakdown */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">{t.calcPvStoragePrice}</span>
                <span className="font-medium">{fmtPLN(computed.pricePvPLN, language)}</span>
              </div>
              {computed.priceHpPLN > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">{t.calcHeatPumpPrice} ({computed.heatPumpPowerKw} kW)</span>
                  <span className="font-medium">{fmtPLN(computed.priceHpPLN, language)}</span>
                </div>
              )}
            </div>

            <Field label={t.calcPaymentMethod}>
              <Select value={data.payMode} onChange={(e: any) => patch({ payMode: e.target.value })}>
                <option value="credit">{t.calcPaymentCredit}</option>
                <option value="cash">{t.calcPaymentCash}</option>
              </Select>
            </Field>

            {data.payMode === "credit" ? (
              <Field label={t.calcCreditPeriod}>
                <Select
                  value={data.creditYears}
                  onChange={(e: any) => patch({ creditYears: Number(e.target.value) as 5 | 7 | 10 })}
                >
                  <option value={5}>5 {t.calcYears}</option>
                  <option value={7}>7 {t.calcYears}</option>
                  <option value={10}>10 {t.calcYears}</option>
                </Select>
              </Field>
            ) : null}

            <div className="mt-2 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="text-sm text-emerald-900">{t.calcMonthlyComparison}</div>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-emerald-900/80">{t.calcBefore}</span>
                  <span className="font-semibold text-emerald-900">{fmtPLN(computed.monthlyBeforePLN, language)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-900/80">{t.calcAfterBills}</span>
                  <span className="font-semibold text-emerald-900">{fmtPLN(computed.monthlyAfterBillsPLN, language)}</span>
                </div>
                {data.payMode === "credit" ? (
                  <div className="flex justify-between">
                    <span className="text-emerald-900/80">{t.calcInstallment}</span>
                    <span className="font-semibold text-emerald-900">{fmtPLN(computed.monthlyPaymentPLN, language)}</span>
                  </div>
                ) : null}
                <div className="border-t border-emerald-200 pt-2 flex justify-between">
                  <span className="text-emerald-900/80">{t.calcTotalAfter}</span>
                  <span className="font-semibold text-emerald-900">{fmtPLN(computed.monthlyTotalAfterPLN, language)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lead */}
      <div className="mt-6 p-6 rounded-2xl border border-slate-200">
        <div className="text-lg font-semibold">{t.calcLeadTitle}</div>
        <div className="mt-1 text-sm text-slate-600">
          {t.calcLeadSubtitle}
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label={t.calcNameLabel}>
            <Input value={data.leadName} onChange={(e: any) => patch({ leadName: e.target.value })} />
          </Field>
          <Field label={t.calcPhoneLabel}>
            <Input value={data.leadPhone} onChange={(e: any) => patch({ leadPhone: e.target.value })} />
          </Field>
          <Field label={t.calcEmailLabel}>
            <Input value={data.leadEmail} onChange={(e: any) => patch({ leadEmail: e.target.value })} />
          </Field>
        </div>

        <div className="mt-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={data.leadConsent}
              onChange={(e) => patch({ leadConsent: e.target.checked })}
              className="mt-1"
            />
            <span className="text-sm text-slate-700">
              {t.calcConsentLabel}
            </span>
          </label>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            className={`px-5 py-3 rounded-xl font-medium ${
              data.leadConsent && data.leadPhone.trim()
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-slate-200 text-slate-500 cursor-not-allowed"
            }`}
            disabled={!(data.leadConsent && data.leadPhone.trim())}
            onClick={async () => {
              const webhookUrl = (cfg as any)?.lead?.webhookUrl || "";
              const companyEmail = (cfg as any)?.lead?.companyEmail || "info@solimax.energy";

              // ЕТАП 3: Structured Lead payload
              const payload = {
                source: "solimax_pl_calculator_v1",
                
                // Top-level contact info
                name: data.leadName,
                phone: data.leadPhone,
                email: data.leadEmail,
                
                // Product type
                productType: computed.priceHpPLN > 0 ? "pv_hp" : "pv",
                
                // Package selection
                packageType: computed.packageType,
                
                // Key calculated values
                pvPower: computed.pvKwp,
                batteryCapacity: computed.batteryKwh,
                heatPumpPower: computed.heatPumpPowerKw,
                
                // Pricing
                pricePvPLN: computed.pricePvPLN,
                priceHpPLN: computed.priceHpPLN,
                capexPLN: computed.capexPLN,
                dotacjaPLN: computed.dotacjaPLN,
                
                // All detailed data in meta
                meta: {
                  createdAt: new Date().toISOString(),
                  address: data.address,
                  inputs: data,
                  result: computed,
                  checklist: computed.checklistNeeded ? checklistAsTextBlock() : "",
                },
              };

              // Always save last lead payload locally (debug)
              saveJSON("solimax_pl_last_lead_payload", payload);

              // If webhook set -> POST
              try {
                if (webhookUrl) {
                  await fetch(webhookUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                  alert(t.calcThankYou);
                  return;
                }
              } catch {
                // fallthrough to mailto
              }

              // fallback: mailto
              const heatingLabelText = 
                computed.heatingType === "no_change" ? t.calcHeatingNoChange2 :
                computed.heatingType === "air_to_water" ? t.calcHeatingAirToWater2 :
                computed.heatingType === "air_to_air_backup" ? t.calcHeatingAirToAirBackup :
                t.calcHeatingModernization;
              const installLabelText = computed.withInstall ? t.calcWithInstall : t.calcWithoutInstall;
              
              const subject = encodeURIComponent("Zapytanie - Solimax PL (kalkulator)");
              const body = encodeURIComponent(
                [
                  `${t.calcNameLabel}: ${data.leadName}`,
                  `${t.calcPhoneLabel}: ${data.leadPhone}`,
                  `${t.calcEmailLabel}: ${data.leadEmail}`,
                  ``,
                  `${t.calcPackage}: ${computed.packageType}`,
                  `PV ${fmtNum(computed.pvKwp)} kWp, ${t.calcStorage.toLowerCase()} ${computed.batteryKwh} kWh`,
                  `${t.calcPvStoragePrice}: ${fmtPLN(computed.pricePvPLN, language)}`,
                  computed.priceHpPLN > 0 ? `${t.calcHeatPumpPrice}: ${computed.heatPumpPowerKw} kW - ${fmtPLN(computed.priceHpPLN, language)}` : "",
                  `${t.calcHeating}: ${heatingLabelText}`,
                  `${t.calcInstallOption}: ${installLabelText}`,
                  ``,
                  `${t.calcGrossPrice}: ${fmtPLN(computed.capexPLN, language)}`,
                  `${t.calcEstimatedDotation}: ${fmtPLN(computed.dotacjaPLN, language)}`,
                  `${t.calcBefore}: ${fmtPLN(computed.monthlyBeforePLN, language)}`,
                  `${t.calcTotalAfter}: ${fmtPLN(computed.monthlyTotalAfterPLN, language)}`,
                  ``,
                  computed.checklistNeeded ? `CHECKLIST:\n${checklistAsTextBlock()}` : "",
                ].filter(Boolean).join("\n")
              );
              window.location.href = `mailto:${companyEmail}?subject=${subject}&body=${body}`;
            }}
          >
            {t.calcSubmit}
          </button>

          <button
            type="button"
            className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50"
            onClick={() => {
              // quick reset
              setData(defaultWizardData());
              setStep(1);
            }}
          >
            {t.calcClear}
          </button>

          <button
            type="button"
            className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50"
            onClick={() => {
              // debug copy
              navigator.clipboard?.writeText(
                JSON.stringify(
                  {
                    inputs: data,
                    result: computed,
                    checklist: computed.checklistNeeded ? checklistAsTextBlock() : "",
                  },
                  null,
                  2
                )
              );
              alert(t.calcResultCopied);
            }}
          >
            {t.calcCopyResult}
          </button>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          {t.calcResultNote}
        </div>
      </div>
    </StepShell>
  );

  // Render current step
  if (step === 1) return step1;
  if (step === 2) return step2;

  if (data.advancedManual && step === 3) return manualStep;

  // After step 2 (or 2A) the indices shift:
  if (step === evStep) return stepEV;
  if (step === roofStep) return stepRoof;
  if (step === batStep) return stepBattery;
  if (step === heatStep) return stepHeating;
  if (step === finalStep) return stepFinal;

  // fallback
  return stepFinal;
}
