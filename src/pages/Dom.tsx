// src/pages/Dom.tsx
import { useState } from "react";
import VisualPlaceholder from "../components/ui/VisualPlaceholder";
import LeadFormSection from "../components/LeadFormSection";
import PromoBanner from "../components/PromoBanner";
import PackageModal from "../components/PackageModal";
import { useLanguage } from "../lib/LanguageContext";
import type { Package } from "../lib/api";

const domSolutions = [
  {
    title: "Фотовольтаїка",
    icon: "☀️",
    text: "Потужність підбирається під реальне споживання, щоб рішення було логічним фінансово і ефективним у довгостроковій перспективі.",
  },
  {
    title: "Накопичення енергії",
    icon: "🔋",
    text: "Системи зберігання дозволяють використовувати більше власної електроенергії, що позитивно відображається на платіжках за електроенергію.",
  },
  {
    title: "Опалення",
    icon: "♻️",
    text: "Сучасні системи опалення, зокрема теплові насоси, адаптовані до наявної інфраструктури будинку — без радикальних змін і зайвих витрат.",
  },
  {
    title: "Smart / EMS",
    icon: "⚙️",
    text: "Розумне керування автоматично обирає найвигідніший сценарій використання енергії — без потреби постійного контролю з вашого боку.",
  },
];

export default function Dom() {
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
                  <path d="M8 5v14l11-7z" />
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
                Енергія для життя, а не навпаки
              </h1>
              <p className="text-lg leading-relaxed text-white/85 md:text-xl lg:text-2xl">
                Комфорт, економія та передбачуваність для вашого дому
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Text + Interactive Banner Block
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid gap-10 md:grid-cols-[1.1fr,0.9fr] md:items-stretch">
            {/* Left - Text content */}
            <div className="flex flex-col justify-center space-y-6">
              <h2 className="text-2xl font-semibold md:text-3xl">Енергія для дому, яка зменшує рахунки і додає спокою</h2>
              <p className="text-lg leading-relaxed text-slate-700 md:text-xl md:leading-relaxed">
                Ви отримуєте не окремі технології, а продумане енергетичне рішення, яке працює у вашому повсякденному житті — з користю для бюджету і комфорту.
              </p>
              <p className="text-lg leading-relaxed text-slate-700 md:text-xl md:leading-relaxed">
                Фотовольтаїка, накопичення енергії та опалення можуть реалізовуватись окремо або бути поєднані між собою — залежно від параметрів дому, бюджету та планів на майбутнє.
              </p>
            </div>
            {/* Right - Interactive Promo Banner (3:4 aspect ratio) */}
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
          Що ви отримаєте
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            {/* Left - Visual placeholder */}
            <div className="relative">
              <VisualPlaceholder
                label="VISUAL / Benefits illustration"
                className="min-h-[320px] md:min-h-[380px] rounded-2xl"
              />
            </div>

            {/* Right - Benefits list */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold md:text-3xl">Що ви отримаєте</h2>
              <div className="space-y-4">
                <div className="border-l-2 border-yellow-400 pl-4 py-2">
                  <h3 className="text-lg font-semibold text-slate-900">Менші рахунки за енергію</h3>
                  <p className="text-sm text-slate-600 mt-1">Ви споживаєте більше власної енергії та менше залежите від зовнішніх тарифів.</p>
                </div>
                <div className="border-l-2 border-yellow-400 pl-4 py-2">
                  <h3 className="text-lg font-semibold text-slate-900">Більше передбачуваності</h3>
                  <p className="text-sm text-slate-600 mt-1">Витрати на енергію стають зрозумілими і планованими.</p>
                </div>
                <div className="border-l-2 border-yellow-400 pl-4 py-2">
                  <h3 className="text-lg font-semibold text-slate-900">Готовність до майбутнього</h3>
                  <p className="text-sm text-slate-600 mt-1">Електромобіль, тепловий насос, розширення системи — без переробок і хаосу.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Як ми підбираємо рішення
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            {/* Left - Text content block */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4 md:text-3xl">Як ми підбираємо рішення</h2>
                <p className="text-slate-700 leading-relaxed">
                  Ми працюємо не через загальні розмови, а через аналіз конкретних даних.
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 text-black text-sm font-semibold flex items-center justify-center">1</span>
                  <p className="text-slate-700 leading-relaxed pt-1">Ви залишаєте заявку з базовою інформацією про об'єкт та споживання</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 text-black text-sm font-semibold flex items-center justify-center">2</span>
                  <p className="text-slate-700 leading-relaxed pt-1">Ми аналізуємо дані та формуємо технічно і фінансово обґрунтовану конфігурацію</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 text-black text-sm font-semibold flex items-center justify-center">3</span>
                  <p className="text-slate-700 leading-relaxed pt-1">Готуємо попередню пропозицію з цифрами і варіантами</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 text-black text-sm font-semibold flex items-center justify-center">4</span>
                  <p className="text-slate-700 leading-relaxed pt-1">Наш спеціаліст зв'язується з вами вже з конкретним рішенням</p>
                </div>
              </div>

              <p className="text-slate-500 mt-6 text-sm">Без зайвих кроків. Без втрати часу — ні вашого, ні нашого.</p>
            </div>

            {/* Right - Visual 4-step schema */}
            <div className="flex items-center justify-center">
              <div className="w-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-8 min-h-[380px] flex flex-col items-center justify-center border border-slate-300">
                <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-slate-200">
                    <div className="w-10 h-10 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center mx-auto mb-2">1</div>
                    <p className="text-xs text-slate-600">Заявка</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-slate-200">
                    <div className="w-10 h-10 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center mx-auto mb-2">2</div>
                    <p className="text-xs text-slate-600">Аналіз</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-slate-200">
                    <div className="w-10 h-10 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center mx-auto mb-2">3</div>
                    <p className="text-xs text-slate-600">Пропозиція</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-slate-200">
                    <div className="w-10 h-10 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center mx-auto mb-2">4</div>
                    <p className="text-xs text-slate-600">Рішення</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mt-6">Visual / Схема 4 кроки</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Рішення для дому
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            {/* Left - Solutions list */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold md:text-3xl">Рішення для дому</h2>
              <div className="space-y-4">
                {domSolutions.map((solution) => (
                  <div key={solution.title} className="border-l-2 border-yellow-400 pl-4 py-2">
                    <h3 className="text-lg font-semibold text-slate-900">{solution.icon} {solution.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{solution.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Visual placeholder */}
            <div className="relative">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-6 min-h-[320px] md:min-h-[400px] flex items-center justify-center border border-slate-300">
                <div className="text-center space-y-4">
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
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Акуратність / Фінансова логіка / Фінансування
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-stretch">
            {/* Left - Unified text block */}
            <div className="space-y-8">
              {/* Акуратність */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold md:text-3xl">Акуратність та естетика</h2>
                <p className="text-slate-700">Ми розуміємо, що це ваш дім.</p>
                <p className="text-slate-700">
                  Тому важливі не лише цифри, а й вигляд: чистий монтаж, порядок, зрозуміла логіка системи та документація без "сюрпризів".
                </p>
                <p className="text-slate-700">
                  Все виглядає так, як має виглядати сучасне рішення для житлового простору.
                </p>
              </div>

              {/* Фінансова логіка */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold md:text-3xl">Фінансова логіка — прозоро і зрозуміло</h2>
                <p className="text-slate-700">Перед тим як приймати рішення, ви маєте бачити цифри.</p>
                <ul className="space-y-1 text-slate-700">
                  <li>• зменшення щомісячних витрат</li>
                  <li>• захист від зростання тарифів</li>
                  <li>• прогнозований ефект у довгому горизонті</li>
                  <li>• можливість поетапного розширення системи</li>
                </ul>
                <p className="text-slate-700">
                  Ми пояснюємо розрахунок так, щоб рішення було усвідомленим, а не емоційним.
                </p>
              </div>

              {/* Фінансування */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold md:text-3xl">Фінансування та програми підтримки</h2>
                <p className="text-slate-700">
                  Можливі різні варіанти фінансування — залежно від ситуації та доступних програм підтримки.
                  Ми допомагаємо зорієнтуватися в опціях і підібрати реалістичний сценарій — без перебільшень і обіцянок "чудес".
                </p>
              </div>
            </div>

            {/* Right - Visual (symmetric height to text block) */}
            <div className="flex">
              <VisualPlaceholder label="VISUAL / Aesthetics & Finance" className="w-full min-h-[400px] md:min-h-full rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Відновлювана енергія / Гарантії
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            {/* Left - Text content block */}
            <div className="space-y-8">
              {/* Відновлювана енергія */}
              <div>
                <h2 className="text-2xl font-semibold mb-3 md:text-3xl">Відновлювана енергія — усвідомлений вибір</h2>
                <div className="space-y-3 text-slate-700">
                  <p>Фотовольтаїка та інші рішення на основі відновлюваних джерел енергії є реальною альтернативою енергії з викопного палива — газу, вугілля та нафти.</p>
                  <p>Для когось це — головна причина вибору. Для когось — додатковий, але важливий аргумент.</p>
                  <p>У будь-якому випадку, це реальний внесок у зменшення викидів CO₂ та відповідальне ставлення до ресурсів.</p>
                  <p>Багато людей обирають такі рішення ще й тому, що хочуть залишити менше проблем і більше можливостей тим, хто житиме після нас. Без пафосу — просто дорослий підхід.</p>
                </div>
              </div>

              {/* Гарантії */}
              <div>
                <h2 className="text-2xl font-semibold mb-3 md:text-3xl">Гарантії та підтримка</h2>
                <p className="text-slate-700">
                  Ми працюємо виключно з перевіреним обладнанням від надійних виробників.
                  Забезпечуємо реальні гарантії, моніторинг систем та підтримку навіть після закінчення гарантійного періоду.
                </p>
              </div>
            </div>

            {/* Right - Visual aligned with text */}
            <div>
              <VisualPlaceholder label="VISUAL / ДОВГИЙ ГОРИЗОНТ • SUSTAINABILITY" className="w-full min-h-[320px] md:min-h-[380px] rounded-xl" />
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
