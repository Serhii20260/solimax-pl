// src/pages/PompyCiepla.tsx
import { useState } from "react";
import VisualPlaceholder from "../components/ui/VisualPlaceholder";
import LeadFormSection from "../components/LeadFormSection";
import { useLanguage } from "../lib/LanguageContext";
import { Link } from "react-router-dom";
import PromoBanner from "../components/PromoBanner";
import PackageModal from "../components/PackageModal";
import type { Package } from "../lib/api";

const efficiencyBadges = [
  { icon: "📊", title: "Високий SCOP", text: "Високий коефіцієнт ефективності в реальних умовах експлуатації." },
  { icon: "🌱", title: "Екологічність", text: "Сучасні холодоагенти з низьким впливом на довкілля." },
  { icon: "⚡", title: "Зниження споживання", text: "Менше залежності від викопного палива." },
  { icon: "🇪🇺", title: "Норми ЄС", text: "Відповідність чинним енергетичним та екологічним вимогам." },
];

const warrantyBadges = [
  "Офіційна гарантія виробника",
  "Сервісне обслуговування",
  "Післягарантійна підтримка",
  "Один підрядник — одна відповідальність",
];

export default function PompyCiepla() {
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
                Теплові насоси повітря–вода — сучасне опалення нового покоління
              </h1>
              <p className="text-lg leading-relaxed text-white/85 md:text-xl lg:text-2xl">
                Енергоефективні системи опалення та гарячого водопостачання для житлових і комерційних об'єктів.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Text + Interactive Banner Block (merged)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid gap-10 md:grid-cols-[1.1fr,0.9fr] md:items-stretch">
            {/* Left - Text content */}
            <div className="flex flex-col justify-center space-y-6">
              <h2 className="text-2xl font-semibold md:text-3xl">Коли тепловий насос — правильне рішення</h2>
              <p className="text-slate-700">Теплові насоси повітря–вода є ефективним рішенням для нових будівель, модернізації існуючих систем опалення, будинків з теплою підлогою або радіаторами, та об'єктів з фокусом на енергоефективність.</p>
              <div className="space-y-3">
                <div className="border-l-2 border-yellow-400 pl-4 py-2">
                  <h3 className="text-lg font-semibold text-slate-900">Висока енергоефективність</h3>
                  <p className="text-sm text-slate-600 mt-1">Стабільні витрати на опалення навіть при змінах тарифів.</p>
                </div>
                <div className="border-l-2 border-yellow-400 pl-4 py-2">
                  <h3 className="text-lg font-semibold text-slate-900">Сучасні технології</h3>
                  <p className="text-sm text-slate-600 mt-1">Відповідність чинним нормам ЄС та екологічним вимогам.</p>
                </div>
                <div className="border-l-2 border-yellow-400 pl-4 py-2">
                  <h3 className="text-lg font-semibold text-slate-900">Професійний сервіс</h3>
                  <p className="text-sm text-slate-600 mt-1">Підбір, монтаж і підтримка від одного підрядника.</p>
                </div>
              </div>
            </div>
            
            {/* Right - Interactive Promo Banner */}
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
          Типи систем
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            {/* Left - Text content block */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-3 md:text-3xl">Типи систем</h2>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Повітря–вода (основний напрямок)</h3>
                <p className="text-slate-700">
                  Теплові насоси повітря–вода — основний напрямок Solimax.
                  Вони забезпечують ефективне опалення, охолодження та гарячу воду з мінімальним енергоспоживанням.
                </p>
                <ul className="space-y-2 text-slate-700">
                  <li>• низькотемпературні системи — максимальна ефективність</li>
                  <li>• високотемпературні системи — оптимальні для модернізації існуючих будинків</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4">
                <h3 className="text-xl font-semibold">Повітря–повітря (додатково)</h3>
                <p className="text-slate-600 leading-relaxed">
                  Системи повітря–повітря застосовуються як альтернативне або додаткове рішення.
                  Вони не входять до калькулятора і підбираються індивідуально.
                </p>
                <Link
                  to="/kontakt"
                  className="inline-flex items-center text-sm font-medium text-slate-900 hover:text-slate-700"
                >
                  Zapytaj o system powietrze–powietrze →
                </Link>
              </div>
            </div>

            {/* Right - Visual */}
            <div>
              <VisualPlaceholder label="VISUAL / Схема роботи системи п/в" className="w-full min-h-[380px] md:min-h-[420px] rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Ефективність та екологія / Надійність і гарантії
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-stretch">
            {/* Left - Unified text block */}
            <div className="space-y-8">
              {/* Ефективність */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold md:text-3xl">Ефективність та екологія</h2>
                <div className="grid grid-cols-2 gap-3">
                  {efficiencyBadges.map((badge) => (
                    <div key={badge.title} className="space-y-1">
                      <div className="text-xl">{badge.icon}</div>
                      <h4 className="font-semibold text-slate-900">{badge.title}</h4>
                      <p className="text-sm text-slate-600">{badge.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Надійність і гарантії */}
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold md:text-3xl">Надійність і гарантії</h2>
                <p className="text-slate-700">
                  Ми працюємо з перевіреними виробниками та використовуємо сертифіковане обладнання.
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

            {/* Right - Visual (symmetric height to text block) */}
            <div className="flex">
              <VisualPlaceholder label="VISUAL / Efficiency & Warranty" className="w-full min-h-[400px] md:min-h-full rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          Наш підхід до підбору / Як ми працюємо
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            {/* Left - Text content block */}
            <div className="space-y-8">
              {/* Наш підхід */}
              <div>
                <h2 className="text-2xl font-semibold mb-3 md:text-3xl">Наш підхід до підбору</h2>
                <p className="text-slate-700 mb-4">Кожна система підбирається індивідуально з урахуванням:</p>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">✓</span>
                    <span>площі будинку</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">✓</span>
                    <span>типу опалення</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">✓</span>
                    <span>енергоефективності будівлі</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">✓</span>
                    <span>реальних потреб користувача</span>
                  </li>
                </ul>
                <p className="mt-3 text-slate-600">Ми не використовуємо універсальні рішення — тільки технічно обґрунтований підбір.</p>
              </div>

              {/* Як ми працюємо */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 md:text-3xl">Як ми працюємо</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-yellow-400 text-black text-sm font-semibold flex items-center justify-center">1</span>
                    <div>
                      <h4 className="font-semibold">Консультація</h4>
                      <p className="text-sm text-slate-600">Збираємо інформацію про об'єкт та ваші потреби.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-yellow-400 text-black text-sm font-semibold flex items-center justify-center">2</span>
                    <div>
                      <h4 className="font-semibold">Технічний підбір</h4>
                      <p className="text-sm text-slate-600">Аналізуємо дані та готуємо оптимальну конфігурацію.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-yellow-400 text-black text-sm font-semibold flex items-center justify-center">3</span>
                    <div>
                      <h4 className="font-semibold">Монтаж</h4>
                      <p className="text-sm text-slate-600">Професійна установка з дотриманням стандартів.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-yellow-400 text-black text-sm font-semibold flex items-center justify-center">4</span>
                    <div>
                      <h4 className="font-semibold">Запуск і підтримка</h4>
                      <p className="text-sm text-slate-600">Введення в експлуатацію та подальший сервіс.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Visual */}
            <div>
              <VisualPlaceholder label="VISUAL / Схема процесу підбору" className="w-full min-h-[420px] md:min-h-[480px] rounded-xl" />
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
