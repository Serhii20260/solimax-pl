// src/pages/PakietDetails.tsx
import { Link, useParams } from "react-router-dom";
import { getPackageBySlug } from "../data/packages";

export default function PakietDetails() {
  const { slug } = useParams();
  const pkg = getPackageBySlug(slug ?? "");

  if (!pkg) {
    return (
      <section className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Pakiet nie znaleziony
        </h1>
        <Link to="/pakiety" className="text-sm hover:underline">
          Wróć do listy pakietów
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-2">
        <Link to="/pakiety" className="text-sm text-slate-600 hover:underline">
          ← Pakiety
        </Link>

        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          {pkg.title}
        </h1>

        <p className="text-slate-600 text-sm sm:text-base">{pkg.subtitle}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold">Specyfikacja techniczna</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {pkg.technical.map((row) => (
                <tr key={row.key} className="border-t border-slate-200">
                  <td className="py-3 pr-4 font-medium whitespace-nowrap">
                    {row.key}
                  </td>
                  <td className="py-3 text-slate-600">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
        >
          Pobierz PDF (wkrótce)
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 p-6 space-y-3">
        <h2 className="text-lg font-semibold">Komponenty</h2>

        <div className="grid gap-4 sm:grid-cols-2 text-sm">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="font-medium">Moduły</div>
            <div className="mt-1 text-slate-600">
              Model: {pkg.components.modules?.model || "—"}
            </div>
            <div className="text-slate-600">
              Moc: {pkg.components.modules?.powerWp || "—"}
            </div>
            <div className="text-slate-600">
              Gwarancja: {pkg.components.modules?.warranty || "—"}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="font-medium">Inwerter</div>
            <div className="mt-1 text-slate-600">
              Model: {pkg.components.inverter?.model || "—"}
            </div>
            <div className="text-slate-600">
              Moc: {pkg.components.inverter?.powerKw || "—"}
            </div>
            <div className="text-slate-600">
              MPPT: {pkg.components.inverter?.mppt || "—"}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="font-medium">Konstrukcja</div>
            <div className="mt-1 text-slate-600">
              Typ: {pkg.components.structure?.type || "—"}
            </div>
            <div className="text-slate-600">
              Materiał: {pkg.components.structure?.material || "—"}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="font-medium">Monitoring</div>
            <div className="mt-1 text-slate-600">
              Typ: {pkg.components.monitoring?.type || "—"}
            </div>
          </div>

          {pkg.components.bess ? (
            <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
              <div className="font-medium">BESS</div>
              <div className="mt-1 text-slate-600">
                Model: {pkg.components.bess?.model || "—"}
              </div>
              <div className="text-slate-600">
                Pojemność: {pkg.components.bess?.capacityKWh || "—"}
              </div>
              <div className="text-slate-600">
                Gwarancja: {pkg.components.bess?.warranty || "—"}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
