import { useMemo, useState } from "react";
import { DEFAULT_CONFIG, type PricingConfig } from "../lib/config";
import { loadJSON, saveJSON } from "../lib/storage";

const STORAGE_KEY = "solimax_pl_pricing_v1";

export default function AdminPricing() {
  const initial = useMemo(
    () => loadJSON<PricingConfig>(STORAGE_KEY, DEFAULT_CONFIG),
    []
  );

  const [cfg, setCfg] = useState<PricingConfig>(initial);
  const [json, setJson] = useState<string>(() => JSON.stringify(initial, null, 2));
  const [msg, setMsg] = useState<string>("");

  function persist(next: PricingConfig) {
    setCfg(next);
    setJson(JSON.stringify(next, null, 2));
    saveJSON(STORAGE_KEY, next);
    setMsg("Zapisano ✅");
    window.setTimeout(() => setMsg(""), 1200);
  }

  function onApplyJson() {
    try {
      const parsed = JSON.parse(json) as PricingConfig;
      persist(parsed);
    } catch (e: any) {
      setMsg("Błąd JSON ❌: " + (e?.message ?? "invalid"));
      window.setTimeout(() => setMsg(""), 3000);
    }
  }

  function onReset() {
    persist(DEFAULT_CONFIG);
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Admin — Cennik</h1>
          <p className="text-slate-600 text-sm mt-1">
            Tu ustawiasz ceny i założenia kalkulatora (zapis w localStorage).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {msg ? (
            <span className="text-sm text-slate-600">{msg}</span>
          ) : (
            <span className="text-sm text-slate-400">—</span>
          )}
          <button
            onClick={onReset}
            className="px-3 py-2 text-sm rounded-md border border-slate-300 hover:bg-slate-50"
          >
            Reset do domyślnych
          </button>
        </div>
      </div>

      {/* Quick meta editor */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-200 p-4 space-y-3">
          <h2 className="font-medium">Meta</h2>

          <LabelRow label="Uzysk (kWh/kWp/rok)">
            <input
              type="number"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={cfg.meta.regionYieldKwhPerKwp}
              onChange={(e) =>
                persist({
                  ...cfg,
                  meta: { ...cfg.meta, regionYieldKwhPerKwp: Number(e.target.value || 0) },
                })
              }
            />
          </LabelRow>

          <LabelRow label="Cena prądu (PLN/kWh)">
            <input
              type="number"
              step="0.01"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={cfg.meta.elecPriceAllInPLNPerKwh}
              onChange={(e) =>
                persist({
                  ...cfg,
                  meta: { ...cfg.meta, elecPriceAllInPLNPerKwh: Number(e.target.value || 0) },
                })
              }
            />
          </LabelRow>

          <LabelRow label="Net-billing kredyt (PLN/kWh)">
            <input
              type="number"
              step="0.01"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={cfg.meta.exportCreditPLNPerKwh}
              onChange={(e) =>
                persist({
                  ...cfg,
                  meta: { ...cfg.meta, exportCreditPLNPerKwh: Number(e.target.value || 0) },
                })
              }
            />
          </LabelRow>

          <LabelRow label="Opłaty stałe (PLN/mies.)">
            <input
              type="number"
              step="1"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={cfg.meta.fixedGridFeesPLNPerMonth}
              onChange={(e) =>
                persist({
                  ...cfg,
                  meta: { ...cfg.meta, fixedGridFeesPLNPerMonth: Number(e.target.value || 0) },
                })
              }
            />
          </LabelRow>

          <LabelRow label="APR (np. 0.075)">
            <input
              type="number"
              step="0.001"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={cfg.meta.defaultInterestAPR}
              onChange={(e) =>
                persist({
                  ...cfg,
                  meta: { ...cfg.meta, defaultInterestAPR: Number(e.target.value || 0) },
                })
              }
            />
          </LabelRow>
        </div>

        <div className="rounded-lg border border-slate-200 p-4 space-y-3">
          <h2 className="font-medium">Lead</h2>

          <LabelRow label="Webhook URL (opcjonalnie)">
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={cfg.lead.webhookUrl}
              onChange={(e) =>
                persist({
                  ...cfg,
                  lead: { ...cfg.lead, webhookUrl: e.target.value },
                })
              }
              placeholder="https://twojadomena.pl/api/lead"
            />
          </LabelRow>

          <LabelRow label="Email (fallback)">
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={cfg.lead.companyEmail}
              onChange={(e) =>
                persist({
                  ...cfg,
                  lead: { ...cfg.lead, companyEmail: e.target.value },
                })
              }
              placeholder="info@solimax.energy"
            />
          </LabelRow>

          <div className="text-xs text-slate-500">
            Zmiany zapisują się automatycznie w przeglądarce (localStorage).
          </div>
        </div>
      </div>

      {/* JSON editor */}
      <div className="rounded-lg border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-medium">Pełna konfiguracja (JSON)</h2>
          <button
            onClick={onApplyJson}
            className="px-3 py-2 text-sm rounded-md bg-slate-900 text-white hover:bg-slate-800"
          >
            Zastosuj JSON
          </button>
        </div>

        <textarea
          className="w-full min-h-[360px] rounded-md border border-slate-300 px-3 py-2 text-xs font-mono"
          value={json}
          onChange={(e) => setJson(e.target.value)}
        />
      </div>
    </section>
  );
}

function LabelRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
      <div className="text-sm text-slate-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}
