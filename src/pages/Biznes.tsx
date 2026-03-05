// src/pages/Biznes.tsx
import { useState } from "react";
import VisualPlaceholder from "../components/ui/VisualPlaceholder";
import LeadFormSection from "../components/LeadFormSection";
import PromoBanner from "../components/PromoBanner";
import PackageModal from "../components/PackageModal";
import { useLanguage } from "../lib/LanguageContext";
import type { Package } from "../lib/api";

const biznesSolutions = [
  {
    title: "Фотовольтаїка для бізнесу",
    icon: "☀️",
    text: "Системи проєктуються під реальний графік споживання: виробництво, офіс, склад, сервіс. Це дозволяє максимально використовувати власну генерацію і зменшити купівлю електроенергії з мережі.",
  },
  {
    title: "Накопичення енергії",
    icon: "🔋",
    text: "Магазини енергії підвищують автоспоживання, згладжують пікові навантаження та напряму впливають на зниження витрат на електроенергію. Особливо актуально для бізнесів із нерівномірним профілем споживання.",
  },
  {
    title: "Опалення та теплові системи",
    icon: "♻️",
    text: "Ефективні системи опалення, зокрема теплові насоси, дозволяють зменшити залежність від газу та інших викопних джерел енергії. Це не лише економіка, а й стратегічна стабільність.",
  },
  {
    title: "Smart / EMS",
    icon: "⚙️",
    text: "Системи керування енергією дозволяють контролювати споживання, пріоритети та навантаження — без ручного втручання і без втрати контролю.",
  },
];

const warrantyBadges = [
  "Реальні гарантії",
  "Моніторинг систем",
  "Підтримка та модернізація",
  "Супровід після гарантії",
];

export default function Biznes() {
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
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-[60vh] md:min-h-[72vh] lg:min-h-[75vh] overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="relative z-10 flex h-full min-h-[60vh] md:min-h-[72vh] lg:min-h-[75vh] items-center">
          <div className="mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16">
            <div className="max-w-xl space-y-4">
              <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl lg:text-5xl xl:text-6xl">
                Енергія як інструмент контролю витрат
              </h1>
              <p className="text-lg leading-relaxed text-white/85 md:text-xl lg:text-2xl">
                Фінансова передбачуваність і ефективність для вашого бізнесу
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Text + Interactive Banner Block (reversed for variety)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid gap-10 md:grid-cols-[0.9fr,1.1fr] md:items-stretch">
            {/* Left - Interactive Promo Banner (3:4 aspect ratio) */}
            <div className="flex items-stretch order-2 md:order-1">
              <PromoBanner 
                onPackageClick={handlePackageClick}
                className="w-full rounded-2xl aspect-[3/4]"
                variant={1}
              />
            </div>
            
            {/* Right - Text content */}
            <div className="flex flex-col justify-center space-y-6 order-1 md:order-2">
              <h2 className="text-2xl font-semibold md:text-3xl">Енергетичні рішення для бізнесу, які дають фінансову передбачуваність</h2>
              <p className="text-lg leading-relaxed text-slate-700 md:text-xl md:leading-relaxed">
                Ви інвестуєте не тільки в обладнання, а також в контроль витрат, стабільність і довгострокову ефективність енергоспоживання.
              </p>
              <p className="text-lg leading-relaxed text-slate-700 md:text-xl md:leading-relaxed">
                Фотовольтаїка, накопичення енергії, опалення та системи керування можуть реалізовуватись окремо або бути поєднані в одному рішенні — відповідно до специфіки бізнесу, профілю споживання та фінансових цілей.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          З якими бізнес-завданнями ми працюємо
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            {/* Left - Challenges list */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold md:text-3xl">З якими бізнес-завданнями ми працюємо</h2>
              <div className="space-y-4">
                <div className="border-l-2 border-yellow-400 pl-4 py-2">
                  <h3 className="text-lg font-semibold text-slate-900">Зростання витрат на енергію</h3>
                  <p className="text-sm text-slate-600 mt-1">Ми зменшуємо залежність від ринку та коливань тарифів.</p>
                </div>
                <div className="border-l-2 border-yellow-400 pl-4 py-2">
                  <h3 className="text-lg font-semibold text-slate-900">Потреба у прогнозованості</h3>
                  <p className="text-sm text-slate-600 mt-1">Енергетичні витрати стають керованою статтею бюджету.</p>
                </div>
                <div className="border-l-2 border-yellow-400 pl-4 py-2">
                  <h3 className="text-lg font-semibold text-slate-900">Розширення або модернізація</h3>
                  <p className="text-sm text-slate-600 mt-1">Рішення проєктуються з урахуванням росту бізнесу.</p>
                </div>
                <div className="border-l-2 border-yellow-400 pl-4 py-2">
                  <h3 className="text-lg font-semibold text-slate-900">Вимоги до відповідальності та ESG</h3>
                  <p className="text-sm text-slate-600 mt-1">OZE — це реальний крок до більш відповідального профілю компанії.</p>
                </div>
              </div>
            </div>

            {/* Right - Visual placeholder */}
            <div className="relative">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-6 min-h-[320px] md:min-h-[400px] flex items-center justify-center border border-slate-300">
                <div className="text-center space-y-4">
                  <svg className="w-20 h-20 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div className="flex justify-center gap-3">
                    <span className="px-2 py-1 bg-yellow-400/20 rounded text-xs text-slate-600">PV</span>
                    <span className="px-2 py-1 bg-yellow-400/20 rounded text-xs text-slate-600">BESS</span>
                    <span className="px-2 py-1 bg-yellow-400/20 rounded text-xs text-slate-600">EMS</span>
                    <span className="px-2 py-1 bg-yellow-400/20 rounded text-xs text-slate-600">EPC</span>
                  </div>
                  <p className="text-sm text-slate-500 uppercase tracking-wide">Visual / Business Energy Schema</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Як ми працюємо з бізнесом
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            {/* Left - Text content block */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-3 md:text-3xl">Як ми працюємо з бізнесом</h2>
                <p className="text-slate-700">
                  Ми не починаємо з дзвінків і загальних обговорень. Ми починаємо з даних.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-yellow-400 text-black text-sm font-semibold flex items-center justify-center">1</span>
                  <p className="text-slate-700">Ви залишаєте заявку з інформацією про об'єкт, профіль споживання та бізнес-цілі</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-yellow-400 text-black text-sm font-semibold flex items-center justify-center">2</span>
                  <p className="text-slate-700">Ми аналізуємо дані та формуємо технічно і фінансово обґрунтовану конфігурацію</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-yellow-400 text-black text-sm font-semibold flex items-center justify-center">3</span>
                  <p className="text-slate-700">Готуємо попередню пропозицію з цифрами, сценаріями та логікою окупності</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-yellow-400 text-black text-sm font-semibold flex items-center justify-center">4</span>
                  <p className="text-slate-700">Наш спеціаліст зв'язується з вами вже з конкретним рішенням</p>
                </div>
              </div>

              <p className="text-slate-600">Чітко. По суті. Без зайвих витрат часу.</p>
            </div>

            {/* Right - Visual */}
            <div>
              <VisualPlaceholder label="VISUAL / DATA → ANALYSIS → SOLUTION" className="w-full min-h-[320px] md:min-h-[360px] rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Рішення для бізнесу
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            {/* Left - Visual placeholder */}
            <div className="relative order-2 md:order-1">
              <VisualPlaceholder
                label="VISUAL / Business solutions"
                className="min-h-[320px] md:min-h-[420px] rounded-2xl"
              />
            </div>

            {/* Right - Solutions list */}
            <div className="space-y-6 order-1 md:order-2">
              <h2 className="text-2xl font-semibold md:text-3xl">Рішення для бізнесу</h2>
              <div className="space-y-4">
                {biznesSolutions.map((solution) => (
                  <div key={solution.title} className="border-l-2 border-yellow-400 pl-4 py-2">
                    <h3 className="text-lg font-semibold text-slate-900">{solution.icon} {solution.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{solution.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Фінансова логіка / Фінансування / Відновлювана енергія
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-stretch">
            {/* Left - Unified text block */}
            <div className="space-y-8">
              {/* Фінансова логіка */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold md:text-3xl">Фінансова логіка та окупність</h2>
                <p className="text-slate-700">Для бізнесу рішення має сенс лише тоді, коли воно зрозуміле фінансово.</p>
                <ul className="space-y-1 text-slate-700">
                  <li>• зменшення операційних витрат</li>
                  <li>• захист від росту цін на енергію</li>
                  <li>• прогнозована окупність</li>
                  <li>• підвищення вартості активу</li>
                </ul>
                <p className="text-slate-700">
                  Ми готуємо розрахунки так, щоб фінансові рішення можна було обґрунтовано захищати перед партнерами, банками або інвесторами.
                </p>
              </div>

              {/* Фінансування */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold md:text-3xl">Фінансування та корпоративні сценарії</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600 border border-slate-200">власні інвестиції</span>
                  <span className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600 border border-slate-200">фінансування / розстрочка</span>
                  <span className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600 border border-slate-200">поетапна реалізація</span>
                  <span className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600 border border-slate-200">адаптація під наявні бюджети</span>
                </div>
                <p className="text-slate-700">
                  Ми допомагаємо підібрати реалістичну модель без завищених очікувань і без створення фінансового тиску на бізнес.
                </p>
              </div>

              {/* Відновлювана енергія */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold md:text-3xl">Відновлювана енергія як відповідальний вибір бізнесу</h2>
                <p className="text-slate-700">
                  Фотовольтаїка та інші рішення на основі відновлюваних джерел енергії є реальною альтернативою енергії з викопного палива — газу, вугілля та нафти.
                </p>
                <p className="text-slate-700">
                  Для частини компаній це — питання цінностей і відповідальності. Для інших — важливий іміджевий та стратегічний фактор.
                </p>
                <p className="text-slate-700">
                  У будь-якому випадку, це зменшення викидів CO₂ і внесок у більш стійке майбутнє — без декларацій і показухи.
                </p>
              </div>
            </div>

            {/* Right - Visual (symmetric height to text block) */}
            <div className="flex">
              <VisualPlaceholder label="VISUAL / Finance & ESG" className="w-full min-h-[400px] md:min-h-full rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Гарантії
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            {/* Left - Text content block */}
            <div>
              <h2 className="text-2xl font-semibold mb-3 md:text-3xl">Гарантії, сервіс і довгострокова підтримка</h2>
              <p className="text-slate-700 mb-3">
                Ми працюємо з перевіреним обладнанням від надійних виробників і забезпечуємо повний супровід проєкту.
              </p>
              <div className="flex flex-wrap gap-2">
                {warrantyBadges.map((badge) => (
                  <span key={badge} className="px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-600 border border-slate-200">
                    {badge}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-slate-600">Це важливо для бізнесу, який планує на роки вперед.</p>
            </div>

            {/* Right - Visual */}
            <div>
              <VisualPlaceholder label="PHOTO / Team at work" className="w-full min-h-[200px] md:min-h-[220px] rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Final CTA - Lead Form
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
