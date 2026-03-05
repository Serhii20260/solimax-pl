// src/data/packages.ts
export type PackageTechRow = { key: string; value: string };

export type PackageItem = {
  slug: string;
  title: string;
  subtitle: string;
  components: {
    modules?: { model: string; powerWp: string; warranty: string };
    inverter?: { model: string; powerKw: string; mppt: string };
    structure?: { type: string; material: string };
    monitoring?: { type: string };
    bess?: { model: string; capacityKWh: string; warranty: string };
    options?: string[];
  };
  technical: PackageTechRow[];
};

export const PACKAGES: PackageItem[] = [
  {
    slug: "pv-biznes-50kwp",
    title: "PV dla biznesu — 50 kWp",
    subtitle: "Zestaw przykładowy (do uzupełnienia sprzętu i parametrów).",
    components: {
      modules: { model: "", powerWp: "", warranty: "" },
      inverter: { model: "", powerKw: "", mppt: "" },
      structure: { type: "", material: "" },
      monitoring: { type: "" },
      options: ["", "", ""],
    },
    technical: [
      { key: "Moc instalacji", value: "" },
      { key: "Liczba modułów", value: "" },
      { key: "Inwerter", value: "" },
      { key: "Konstrukcja", value: "" },
    ],
  },
  {
    slug: "pv-dom-10kwp",
    title: "PV dla domu — 10 kWp",
    subtitle: "Zestaw przykładowy (do uzupełnienia sprzętu i parametrów).",
    components: {
      modules: { model: "", powerWp: "", warranty: "" },
      inverter: { model: "", powerKw: "", mppt: "" },
      structure: { type: "", material: "" },
      monitoring: { type: "" },
      options: ["", ""],
    },
    technical: [
      { key: "Moc instalacji", value: "" },
      { key: "Liczba modułów", value: "" },
      { key: "Inwerter", value: "" },
      { key: "Konstrukcja", value: "" },
    ],
  },
  {
    slug: "pv-bess-30kwp",
    title: "PV + BESS — 30 kWp",
    subtitle: "Zestaw przykładowy (do uzupełnienia sprzętu i parametrów).",
    components: {
      modules: { model: "", powerWp: "", warranty: "" },
      inverter: { model: "", powerKw: "", mppt: "" },
      bess: { model: "", capacityKWh: "", warranty: "" },
      structure: { type: "", material: "" },
      monitoring: { type: "" },
      options: ["EMS", "Zero-export", ""],
    },
    technical: [
      { key: "Moc PV", value: "" },
      { key: "Pojemność BESS", value: "" },
      { key: "Inwerter", value: "" },
      { key: "Sterowanie/EMS", value: "" },
    ],
  },
];

export function getPackageBySlug(slug: string): PackageItem | null {
  return PACKAGES.find((p) => p.slug === slug) ?? null;
}
