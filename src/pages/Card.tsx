import { useState } from "react";
import logoDark from "../assets/logo-dark.svg";

const cardUrl = "https://solimax.pl/pl/card";
const qrUrl =
  "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https%3A%2F%2Fsolimax.pl%2Fpl%2Fcard";

const company = {
  name: "Solimax Sp. z o.o.",
  headline: "Fotowoltaika i pompy ciepła",
  audience: "Dla domu i firmy",
  description:
    "Profesjonalny dobór, sprzedaż i montaż instalacji fotowoltaicznych oraz pomp ciepła dla klientów indywidualnych i firm.",
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
    icon: "phone",
    primary: true,
  },
  {
    label: "Wyślij e-mail",
    href: `mailto:${company.email}`,
    icon: "mail",
  },
  {
    label: "Zostaw zapytanie",
    href: "/pl/kontakt",
    icon: "message",
    primary: true,
  },
  {
    label: "Otwórz stronę",
    href: company.website,
    icon: "globe",
  },
  {
    label: "Sprawdź lokalizację",
    href: company.mapHref,
    icon: "pin",
  },
  {
    label: "Zapisz kontakt",
    href: "/solimax.vcf",
    icon: "contact",
  },
];

const offers = [
  "Fotowoltaika dla domu",
  "Fotowoltaika dla firm",
  "Pompy ciepła",
  "Magazyny energii",
  "Doradztwo techniczne",
  "Montaż i uruchomienie",
];

function Icon({ name }: { name: string }) {
  const common = {
    className: "h-5 w-5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "phone") {
    return (
      <svg {...common}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.95.35 1.88.66 2.76a2 2 0 0 1-.45 2.11L8.05 9.86a16 16 0 0 0 6.09 6.09l1.27-1.27a2 2 0 0 1 2.11-.45c.88.31 1.81.53 2.76.66A2 2 0 0 1 22 16.92Z" />
      </svg>
    );
  }

  if (name === "mail") {
    return (
      <svg {...common}>
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-10 6L2 7" />
      </svg>
    );
  }

  if (name === "message") {
    return (
      <svg {...common}>
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
      </svg>
    );
  }

  if (name === "globe") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 0 20" />
        <path d="M12 2a15.3 15.3 0 0 0 0 20" />
      </svg>
    );
  }

  if (name === "pin") {
    return (
      <svg {...common}>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  }

  if (name === "share") {
    return (
      <svg {...common}>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="m8.6 13.5 6.8 4" />
        <path d="m15.4 6.5-6.8 4" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}

export default function Card() {
  const [shareStatus, setShareStatus] = useState("");

  const handleShare = async () => {
    const shareData = {
      title: "Solimax Sp. z o.o.",
      text: "Fotowoltaika i pompy ciepła dla domu i firmy",
      url: cardUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus("Wizytówka udostępniona");
        return;
      }

      await navigator.clipboard.writeText(cardUrl);
      setShareStatus("Link skopiowany");
    } catch {
      setShareStatus("Skopiuj link: https://solimax.pl/pl/card");
    }
  };

  return (
    <div className="min-h-screen bg-[#111316] px-3 py-5 text-slate-950 sm:px-6 sm:py-8">
      <section className="mx-auto w-full max-w-[430px] overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-2xl shadow-black/50">
        <div className="relative min-h-[265px] overflow-hidden bg-slate-950">
          <img
            src="/pl/home-solutions.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-78"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/55 to-black" />
          <div className="relative flex min-h-[265px] flex-col justify-between p-6 text-white">
            <div className="flex items-center justify-between gap-4">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-lg">
                <img src={logoDark} alt="Solimax" className="h-8 w-auto max-w-[152px]" />
              </div>
              <span className="rounded-full border border-yellow-300/50 bg-yellow-300 px-3 py-1 text-xs font-bold uppercase text-black">
                NFC ready
              </span>
            </div>

            <div>
              <p className="mb-3 inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-semibold text-yellow-200 backdrop-blur">
                Digital business card
              </p>
              <h1 className="text-[2rem] font-bold leading-tight tracking-tight">{company.name}</h1>
              <p className="mt-3 text-lg font-semibold text-yellow-300">{company.headline}</p>
              <p className="text-sm font-medium text-white/82">{company.audience}</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 bg-[#f6f7f2] px-5 py-5">
          <p className="rounded-2xl border border-slate-200 bg-white p-4 text-[0.95rem] leading-6 text-slate-700 shadow-sm">
            {company.description}
          </p>

          <div className="grid gap-3">
            {actions.map(({ label, href, icon, primary }) => (
              <a
                key={label}
                href={href}
                className={`inline-flex min-h-14 items-center justify-start gap-3 rounded-2xl px-4 py-3 text-base font-bold shadow-sm transition ${
                  primary
                    ? "bg-yellow-400 text-black hover:bg-yellow-300"
                    : "border border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    primary ? "bg-black text-yellow-300" : "bg-slate-900 text-yellow-300"
                  }`}
                >
                  <Icon name={icon} />
                </span>
                <span>{label}</span>
              </a>
            ))}

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex min-h-14 items-center justify-start gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-left text-base font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-400 text-black">
                <Icon name="share" />
              </span>
              <span>Udostępnij wizytówkę</span>
            </button>
            {shareStatus && <p className="px-1 text-center text-sm font-semibold text-slate-700">{shareStatus}</p>}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-bold uppercase text-slate-500">Dane</h2>
            <div className="mt-3 space-y-1 text-[0.95rem] leading-6 text-slate-800">
              <p className="font-semibold text-slate-950">{company.addressLine1}</p>
              <p>{company.addressLine2}</p>
              <p>NIP: {company.nip}</p>
              <p>Telefon: {company.phoneDisplay}</p>
              <p>Email: {company.email}</p>
              <p>Strona: {company.website}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Co oferujemy</h2>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {offers.map((offer) => (
                <div key={offer} className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-yellow-400" />
                  <span>{offer}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
            <img
              src={qrUrl}
              alt="QR kod prowadzący do wizytówki Solimax"
              className="mx-auto h-[220px] w-[220px] rounded-xl border border-slate-200 bg-white p-2"
              loading="lazy"
            />
            <p className="mx-auto mt-3 max-w-[280px] text-sm font-semibold leading-5 text-slate-700">
              Zeskanuj QR kod, aby otworzyć wizytówkę Solimax
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-300/60 bg-slate-950 p-4 text-white shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-yellow-300">NFC ready</h2>
              <span className="rounded-full bg-yellow-400 px-2.5 py-1 text-xs font-bold text-black">CARD / TAG</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/78">
              Ten sam link można zapisać na karcie lub tagu NFC:
            </p>
            <p className="mt-2 break-all rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm font-semibold text-yellow-200">
              {cardUrl}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
