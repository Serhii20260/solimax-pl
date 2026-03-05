import { useState } from "react";
import VisualPlaceholder from "../components/ui/VisualPlaceholder";
import LeadFormSection from "../components/LeadFormSection";
import PromoBanner from "../components/PromoBanner";
import PackageModal from "../components/PackageModal";
import { useLanguage } from "../lib/LanguageContext";
import { Link } from "react-router-dom";
import type { Package } from "../lib/api";

const modules = [
  {
    title: "Фотовольтаїка",
    text: "Енергія, підібрана під реальне споживання — з відчутним ефектом у рахунках.",
  },
  {
    title: "Накопичення енергії",
    text: "Більше власного споживання та стабільніша робота системи — що позитивно відображається на платіжках за електроенергію.",
  },
  {
    title: "Опалення",
    text: "Комфорт і ефективність, адаптовані до вашого дому або об'єкта — без зайвих складнощів.",
  },
  {
    title: "Smart / EMS",
    text: "Автоматичні пріоритети: PV → батарея → будинок/об'єкт → EV, щоб енергія використовувалась найвигідніше.",
  },
];

const brands = [
  "JA Solar", "Huawei", "SolarEdge", "Jinko", "Trina", "BYD", "GoodWe", "Fronius"
];

const whySolimax = [
  "досвідчені фахівці",
  "робота відповідно до норм Польщі та ЄС",
  "повний цикл: від проєкту до запуску",
  "чесна, спокійна комунікація",
];

const warrantyBadges = [
  "Перевірене обладнання",
  "Моніторинг систем",
  "Реальні гарантії",
  "Підтримка після гарантії",
];

export default function Home() {
  const { t } = useLanguage();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePackageClick = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  return (
    <main className="bg-white text-slate-900">
      {/* ═══════════════════════════════════════════════════════════════
          HERO - Video placeholder (loop, no sound) + Text overlay left
          Height: ~72vh (20% taller than before)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-[60vh] md:min-h-[72vh] lg:min-h-[75vh] overflow-hidden">
        {/* Video Placeholder - will be replaced with actual video */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900" />
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-white/30 flex items-center justify-center">
                <svg className="w-12 h-12 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <span className="text-white/40 text-sm uppercase tracking-wider">Video Placeholder</span>
            </div>
          </div>
        </div>
        
        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

        {/* Content - Left aligned with comfortable margin */}
        <div className="relative z-10 flex h-full min-h-[60vh] md:min-h-[72vh] lg:min-h-[75vh] items-center">
          <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
            <div className="max-w-xl space-y-4">
              <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl lg:text-5xl xl:text-6xl">
                Енергія, яка працює на вас — а не навпаки
              </h1>
              <p className="text-lg leading-relaxed text-white/85 md:text-xl lg:text-2xl">
                Менші рахунки. Більше передбачуваності. Спокійне відчуття контролю над витратами на енергію — вдома і в бізнесі.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Text + Interactive Banner Block
          Left: Text about energy situation
          Right: Interactive Promo Banner (3:4 aspect ratio)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid gap-10 md:grid-cols-[1.1fr,0.9fr] md:items-stretch">
            {/* Left - Text content */}
            <div className="flex flex-col justify-center space-y-6">
              <p className="text-lg leading-relaxed text-slate-700 md:text-xl md:leading-relaxed">
                Ціни на електроенергію та газ зростають, а тарифи стають менш передбачуваними. Водночас ми споживаємо більше енергії — електромобілі, теплові насоси, системи автоматизації домогосподарств і бізнесу вже стали нормою.
              </p>
              <p className="text-lg leading-relaxed text-slate-700 md:text-xl md:leading-relaxed">
                Власні енергетичні рішення дозволяють планувати витрати наперед — без стресу і несподіванок.
              </p>
              <p className="text-lg leading-relaxed text-slate-700 md:text-xl md:leading-relaxed">
                Ми продаємо не тільки універсальні пакети. Кожне індивідуальне рішення формується з урахуванням реального споживання, типу об'єкта, режимів роботи та майбутніх змін — електромобіля, теплового насоса або розширення бізнесу.
              </p>
              <p className="text-lg leading-relaxed text-slate-700 md:text-xl md:leading-relaxed">
                Саме тому ми показуємо не абстрактні цифри, а конкретні конфігурації: з обладнанням, технічними характеристиками та зрозумілою логікою роботи системи.
              </p>
              <p className="text-lg leading-relaxed text-slate-700 md:text-xl md:leading-relaxed font-medium">
                Ви одразу бачите, що входить у рішення, для яких умов воно підходить і який результат дає.
              </p>
            </div>
            
            {/* Right - Interactive Promo Banner (3:4 aspect ratio) - variant 1 */}
            <div className="flex items-stretch">
              <PromoBanner 
                onPackageClick={handlePackageClick}
                className="w-full rounded-2xl aspect-[3/4]"
                variant={1}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Рішення Solimax
          Left: House visual with energy equipment (PV, battery, heat pump, EMS)
          Right: Vertical list of solutions
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            {/* Left - House visual placeholder */}
            <div className="relative">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-6 min-h-[320px] md:min-h-[380px] flex items-center justify-center border border-slate-300">
                <div className="text-center space-y-4">
                  {/* Schematic house icon */}
                  <svg className="w-20 h-20 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <div className="flex justify-center gap-3">
                    <span className="px-2 py-1 bg-yellow-400/20 rounded text-xs text-slate-600">PV</span>
                    <span className="px-2 py-1 bg-yellow-400/20 rounded text-xs text-slate-600">Battery</span>
                    <span className="px-2 py-1 bg-yellow-400/20 rounded text-xs text-slate-600">Heat Pump</span>
                    <span className="px-2 py-1 bg-yellow-400/20 rounded text-xs text-slate-600">EMS</span>
                  </div>
                  <p className="text-sm text-slate-500 uppercase tracking-wide">Visual / Energy House Schema</p>
                </div>
              </div>
            </div>

            {/* Right - Vertical list of solutions */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold md:text-3xl">Рішення Solimax</h2>
              <div className="space-y-4">
                {modules.map((module) => (
                  <div key={module.title} className="border-l-2 border-yellow-400 pl-4 py-2">
                    <h3 className="text-lg font-semibold text-slate-900">{module.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{module.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Для кого - Private & Business (clickable cards)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <VisualPlaceholder label="VISUAL / Home" className="h-36 rounded-lg mb-4" />
              <h3 className="text-xl font-semibold mb-3">Приватні клієнти</h3>
              <p className="text-slate-600 mb-4">
                Ми створюємо сучасні, естетичні та енергоефективні рішення — з реальними заощадженнями, комфортом і відчуттям контролю.
              </p>
              <Link
                to="/dom"
                className="inline-flex items-center justify-center rounded-lg bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-300"
              >
                Рішення для дому
              </Link>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <VisualPlaceholder label="VISUAL / Business" className="h-36 rounded-lg mb-4" />
              <h3 className="text-xl font-semibold mb-3">Бізнес</h3>
              <p className="text-slate-600 mb-4">
                Для бізнесу важливі цифри, прогнозованість і контроль. Наші рішення допомагають стабілізувати витрати та планувати енергетику на роки вперед.
              </p>
              <Link
                to="/biznes"
                className="inline-flex items-center justify-center rounded-lg bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-yellow-300"
              >
                Рішення для бізнесу
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Екологічність / Фінансовий ефект / Калькулятор
          Left: One unified text block with all three topics
          Right: Visual (symmetric height)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-stretch">
            {/* Left - Unified text block */}
            <div className="space-y-8">
              {/* Ecology */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold md:text-3xl">Екологічність</h2>
                <p className="text-slate-700">
                  Фотовольтаїка та інші рішення на основі відновлюваних джерел енергії допомагають зменшити залежність від викопного палива — газу, вугілля та нафти.
                  Для когось це — головний аргумент. Для когось — додатковий, але важливий плюс.
                </p>
                <p className="text-slate-700">
                  У будь-якому випадку, це реальний внесок у зменшення викидів CO₂ та відповідальне використання ресурсів.
                  Багато людей обирають відновлювану енергію ще й тому, що хочуть залишити менше проблем і більше можливостей тим, хто житиме після нас. Без пафосу — просто дорослий вибір.
                </p>
              </div>

              {/* Finance */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold md:text-3xl">Фінансовий ефект</h2>
                <p className="text-slate-700">
                  Нижчі рахунки, захист від росту тарифів, ефективне використання власної енергії, зрозумілий фінансовий ефект.
                  Ми допомагаємо зорієнтуватися у варіантах фінансування та доступних програмах підтримки — чесно і без завищених обіцянок.
                </p>
                <Link
                  to="/finansowanie"
                  className="inline-flex items-center justify-center rounded-lg border-2 border-yellow-400 bg-slate-200 px-5 py-2.5 text-sm font-semibold text-yellow-600 transition hover:bg-slate-300"
                >
                  Фінансування та програми
                </Link>
              </div>

              {/* Calculator */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold md:text-3xl">Калькулятор</h2>
                <p className="text-slate-700">
                  Замість гучних слоганів — конкретні розрахунки.
                  Калькулятор дозволяє швидко оцінити вартість рішення та потенційну економію — без реєстрації і зобов'язань.
                </p>
                <Link
                  to="/calculator"
                  className="inline-flex items-center justify-center rounded-lg border-2 border-yellow-400 bg-slate-200 px-5 py-2.5 text-sm font-semibold text-yellow-600 transition hover:bg-slate-300"
                >
                  Калькулятор
                </Link>
              </div>
            </div>

            {/* Right - Visual (symmetric height to text block) */}
            <div className="flex">
              <VisualPlaceholder label="VISUAL / Energy & Finance" className="w-full min-h-[400px] md:min-h-full rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Виробники / Чому Solimax / Гарантії
          Left: Text block (one column)
          Right: 2 small visuals (team & office)
          Below: Brand logos horizontal strip
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            {/* Left - Text content block */}
            <div className="space-y-8">
              {/* Виробники */}
              <div>
                <h2 className="text-2xl font-semibold mb-3 md:text-3xl">Ми працюємо з перевіреними виробниками</h2>
                <p className="text-slate-700">
                  Обираємо обладнання від надійних брендів з підтвердженою якістю та гарантією. Без компромісів на матеріалах.
                </p>
              </div>

              {/* Чому Solimax */}
              <div>
                <h2 className="text-2xl font-semibold mb-3 md:text-3xl">Чому Solimax</h2>
                <ul className="space-y-2">
                  {whySolimax.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-slate-700">
                      <span className="text-yellow-500 mt-1">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-slate-600">Ми не нав'язуємо рішення — ми допомагаємо обрати те, що має сенс саме для вас.</p>
              </div>

              {/* Гарантії */}
              <div>
                <h2 className="text-2xl font-semibold mb-3 md:text-3xl">Гарантії та підтримка</h2>
                <p className="text-slate-700 mb-3">
                  Ми працюємо з перевіреним обладнанням від надійних виробників.
                  Забезпечуємо реальні гарантії, моніторинг систем і підтримку навіть після закінчення гарантійного періоду.
                </p>
                <div className="flex flex-wrap gap-2">
                  {warrantyBadges.map((badge) => (
                    <span key={badge} className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600 border border-slate-200">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right - 2 small visuals (team & office) */}
            <div className="space-y-4">
              <VisualPlaceholder label="PHOTO / Team at work" className="h-44 rounded-xl" />
              <VisualPlaceholder label="PHOTO / Office" className="h-44 rounded-xl" />
            </div>
          </div>

          {/* Brand logos - horizontal strip below */}
          <div className="mt-10 pt-8 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {brands.map((brand) => (
                <span key={brand} className="px-5 py-2.5 bg-slate-100 rounded-lg text-sm font-medium text-slate-600 border border-slate-200">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Final CTA - Lead Form
          Text spans 70-80% width, looks like final thought
          Buttons align with text on scroll (desktop), below text (mobile)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <LeadFormSection 
            id="lead-form" 
            title={t.leadFormTitle} 
            subtitle={t.leadFormSubtitle}
            description={t.leadFormDescription}
          />
        </div>
      </section>

      {/* Package Modal */}
      <PackageModal
        pkg={selectedPackage}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTimeout(() => setSelectedPackage(null), 200);
        }}
      />
    </main>
  );
}
