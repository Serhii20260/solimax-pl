// src/pages/Proekty.tsx
import VisualPlaceholder from "../components/ui/VisualPlaceholder";
import LeadFormSection from "../components/LeadFormSection";
import { useLanguage } from "../lib/LanguageContext";

export default function Proekty() {
  const { t } = useLanguage();
  return (
    <div className="space-y-16 md:space-y-24">
      <section className="relative w-full">
        <VisualPlaceholder label="REAL PROJECT PHOTO / FULL-WIDTH" className="w-full min-h-[360px] md:min-h-[440px]" />
        <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Реалізовані проєкти — як виглядають рішення на практиці
            </h1>
            <p className="mt-4 text-sm text-slate-700 sm:text-lg leading-relaxed">
              Кожен проєкт відрізняється. Ми показуємо реальні рішення, з
              реальними обмеженнями і реальним результатом.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-16 md:space-y-24 md:px-6 md:py-24 lg:px-8">
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Як читати наші кейси
          </h2>
          <div className="grid gap-10 md:grid-cols-12 md:items-start">
            <div className="md:col-span-7 space-y-4 max-w-2xl">
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                Ми не прикрашаємо цифри і не ускладнюємо опис.
              </p>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                У кожному проєкті ви бачите:
              </p>
              <ul className="space-y-2 text-slate-700 text-sm sm:text-base">
                <li>тип об’єкта</li>
                <li>логіку рішення</li>
                <li>масштаб системи</li>
                <li>ключову користь для клієнта</li>
              </ul>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                Це дає уявлення, чи підходить такий підхід саме вам.
              </p>
            </div>
            <div className="md:col-span-5">
              <VisualPlaceholder label="LEGEND / LIGHT VISUAL" className="h-40 md:h-56 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm" />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Приклад кейсу — приватний клієнт
          </h2>
          <div className="grid gap-10 md:grid-cols-12 md:items-start">
            <div className="md:col-span-7 grid gap-4 sm:grid-cols-3">
              <VisualPlaceholder label="REAL PROJECT PHOTO" className="aspect-[16/10] rounded-2xl border border-slate-200 bg-slate-50 shadow-sm" />
              <VisualPlaceholder label="REAL PROJECT PHOTO" className="aspect-[16/10] rounded-2xl border border-slate-200 bg-slate-50 shadow-sm" />
              <VisualPlaceholder label="REAL PROJECT PHOTO" className="aspect-[16/10] rounded-2xl border border-slate-200 bg-slate-50 shadow-sm" />
            </div>
            <div className="md:col-span-5 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2 text-slate-700 text-sm sm:text-base shadow-sm">
                <div>
                  <strong>Тип об’єкта:</strong> приватний будинок
                </div>
                <div>
                  <strong>Завдання:</strong> зменшення рахунків, готовність до EV
                </div>
                <div>
                  <strong>Рішення:</strong> фотовольтаїка + накопичення енергії
                </div>
                <div>
                  <strong>Результат:</strong> вищий рівень власного споживання,
                  стабільні витрати
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                  Ключовий момент: рішення підібране під реальне споживання, без
                  перевантаження системи і без зайвих витрат.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Приклад кейсу — бізнес
          </h2>
          <div className="grid gap-10 md:grid-cols-12 md:items-start">
            <div className="md:col-span-5 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2 text-slate-700 text-sm sm:text-base shadow-sm">
                <div>
                  <strong>Тип об’єкта:</strong> комерційна будівля
                </div>
                <div>
                  <strong>Завдання:</strong> контроль витрат і прогнозованість
                </div>
                <div>
                  <strong>Рішення:</strong> фотовольтаїка + EMS
                </div>
                <div>
                  <strong>Результат:</strong> зниження операційних витрат і кращий
                  фінансовий контроль
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                  Рішення спроєктоване з урахуванням можливого масштабування.
                </p>
              </div>
            </div>
            <div className="md:col-span-7 grid gap-4 sm:grid-cols-2">
              <VisualPlaceholder label="REAL PROJECT PHOTO" className="aspect-[16/9] rounded-2xl border border-slate-200 bg-slate-50 shadow-sm" />
              <VisualPlaceholder label="REAL PROJECT PHOTO" className="aspect-[16/9] rounded-2xl border border-slate-200 bg-slate-50 shadow-sm" />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Чому ми показуємо саме так
          </h2>
          <div className="max-w-3xl space-y-3 text-slate-700 text-sm sm:text-base leading-relaxed">
            <p>
              Ми вважаємо, що кейси мають допомагати приймати рішення, а не створювати
              ілюзію “ідеальних проєктів”.
            </p>
            <p>Тому:</p>
            <ul className="space-y-2">
              <li>без перебільшень</li>
              <li>без “маркетингових” цифр</li>
              <li>без однакових шаблонів</li>
            </ul>
          </div>
        </section>

        <LeadFormSection
          id="lead-form"
          title={t.leadFormTitle}
          subtitle={t.leadFormSubtitle}
          description={<p>{t.leadFormDescription}</p>}
        />
      </div>
    </div>
  );
}
