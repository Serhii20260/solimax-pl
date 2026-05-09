const company = {
  name: "Solimax Sp. z o.o.",
  description: "Fotowoltaika i pompy ciepła dla domu i firmy",
  addressLine1: "ul. Ruska 22",
  addressLine2: "50-079 Wrocław, Polska",
  nip: "8971959206",
  phoneDisplay: "+48 732 071 337",
  phoneHref: "tel:+48732071337",
  email: "info@solimax.pl",
  website: "https://solimax.pl",
  mapHref:
    "https://www.google.com/maps/search/?api=1&query=Solimax%20Sp.%20z%20o.o.%20Ruska%2022%2050-079%20Wroc%C5%82aw",
};

const actions = [
  {
    label: "Zadzwoń",
    href: company.phoneHref,
    icon: "TEL",
    primary: true,
  },
  {
    label: "Wyślij e-mail",
    href: `mailto:${company.email}`,
    icon: "MAIL",
  },
  {
    label: "Otwórz stronę",
    href: company.website,
    icon: "WEB",
  },
  {
    label: "Sprawdź lokalizację",
    href: company.mapHref,
    icon: "MAP",
  },
  {
    label: "Zapisz kontakt",
    href: "/solimax.vcf",
    icon: "VCF",
  },
  {
    label: "Zostaw zapytanie",
    href: "/pl/kontakt",
    icon: "FORM",
    primary: true,
  },
];

export default function Card() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl shadow-slate-950/30">
          <div className="bg-slate-900 px-6 py-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-yellow-400 text-2xl font-bold text-slate-950">
              S
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">{company.name}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">{company.description}</p>
          </div>

          <div className="space-y-6 px-6 py-6 text-slate-900">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              <p className="font-medium text-slate-950">{company.addressLine1}</p>
              <p>{company.addressLine2}</p>
              <p className="mt-3">NIP: {company.nip}</p>
              <p>Tel.: {company.phoneDisplay}</p>
              <p>Email: {company.email}</p>
              <p>Strona: solimax.pl</p>
            </div>

            <div className="grid gap-3">
              {actions.map(({ label, href, icon, primary }) => (
                <a
                  key={label}
                  href={href}
                  className={`inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                    primary
                      ? "bg-yellow-400 text-slate-950 hover:bg-yellow-300"
                      : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <span className="min-w-10 text-center text-[0.65rem] font-bold tracking-wide" aria-hidden="true">
                    {icon}
                  </span>
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
