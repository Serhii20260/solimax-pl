// src/pages/Finansowanie.tsx
import VisualPlaceholder from "../components/ui/VisualPlaceholder";
import LeadFormSection from "../components/LeadFormSection";
import { useLanguage } from "../lib/LanguageContext";

export default function Finansowanie() {
  const { t } = useLanguage();
  return (
    <div className="space-y-16 md:space-y-24">
      <section className="relative w-full">
        <VisualPlaceholder label="VISUAL HERO / CALM, CLEAN" className="w-full min-h-[360px] md:min-h-[440px]" />
        <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl text-center">
            <p className="text-lg font-semibold text-slate-900 md:text-2xl">
              Фінансування без тиску і без “дрібного шрифту”
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-16 md:space-y-24 md:px-6 md:py-24 lg:px-8">
        <section className="space-y-6">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Фінансування, яке підлаштовується під вашу ситуацію
            </h1>
            <p className="text-slate-600 leading-relaxed max-w-2xl">
              Енергетичні рішення не обов’язково реалізовувати одним платежем.
              У Польщі діють конкретні програми підтримки та фінансові механізми, які дозволяють почати вже зараз — без фінансового стресу та без відкладання проєкту «на потім».
            </p>
            <p className="text-slate-600 leading-relaxed max-w-2xl">
              Ми не продаємо фінансові продукти.
              Ми допомагаємо зібрати реалістичну фінансову модель: з урахуванням доступних програм, бюджету та очікуваного енергетичного ефекту.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Як ми працюємо з фінансуванням</h2>
          <div className="grid gap-10 md:grid-cols-12 md:items-start">
            <div className="md:col-span-7 space-y-4 max-w-2xl">
              <p className="text-slate-600 leading-relaxed">Фінансування — це частина рішення, а не окремий додаток.</p>
              <ol className="grid gap-4 md:grid-cols-2 text-slate-600">
                <li>1. Ви надаєте базові дані про об’єкт, споживання та бюджет</li>
                <li>2. Ми аналізуємо технічну конфігурацію разом із фінансовими можливостями</li>
                <li>3. Перевіряємо, які програми реально застосовні саме у вашому випадку</li>
                <li>4. Ви приймаєте рішення на основі цифр і сценаріїв</li>
              </ol>
              <p className="text-slate-600 leading-relaxed">Без тиску. Без обіцянок «гарантованих дотацій». По-діловому.</p>
            </div>
            <div className="md:col-span-5">
              <VisualPlaceholder label="VISUAL / SIMPLE FLOW — “DATA → OPTIONS → DECISION”[/}" className="h-56 md:h-72 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm" />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Актуальні програми підтримки в Польщі</h2>
          <VisualPlaceholder label="VISUAL / STRUCTURED SECTION — ACCURATE, CLEAN" className="h-56 md:h-72 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm" />
          <div className="grid gap-6 md:grid-cols-2 max-w-6xl">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">Для приватних домогосподарств</h3>
              <div className="text-slate-600 leading-relaxed">Mój Prąd 6.0 (та наступні редакції)</div>
              <div className="text-slate-600 leading-relaxed">Державна програма підтримки фотовольтаїки, накопичення енергії та систем керування.</div>
              <div className="text-slate-600 leading-relaxed">Форма підтримки — безповоротна дотація.</div>
              <div className="text-slate-600 leading-relaxed">Програма закладена як довгостроковий механізм, з продовженням у 2026 році і далі.</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">Для агросектору та сільських об’єктів</h3>
              <div className="text-slate-600 leading-relaxed">Energia dla Wsi</div>
              <div className="text-slate-600 leading-relaxed">Програма для фермерів, агропідприємств і сільських бізнесів.</div>
              <div className="text-slate-600 leading-relaxed">Поєднує дотації та пільгове кредитування для реалізації OZE-рішень.</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">Для бізнесу та більших проєктів</h3>
              <div className="text-slate-600 leading-relaxed">KPO / RRF (Krajowy Plan Odbudowy, NextGenerationEU)</div>
              <div className="text-slate-600 leading-relaxed">Європейські кошти для енергетичної трансформації Польщі.</div>
              <div className="text-slate-600 leading-relaxed">Механізми: гранти, пільгове фінансування, змішані моделі.</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <div className="text-slate-600 leading-relaxed">Fundusz Wsparcia Energetyki</div>
              <div className="text-slate-600 leading-relaxed">Державний фонд для більших бізнес- та інфраструктурних енергетичних проєктів.</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">Додаткові фінансові інструменти</h3>
              <div className="text-slate-600 leading-relaxed">PFR / BGK — фінансування для бізнесу</div>
              <div className="text-slate-600 leading-relaxed">Кредитні та гарантійні інструменти для реалізації енергетичних проєктів.</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <div className="text-slate-600 leading-relaxed">Регіональні програми (воєводські фонди)</div>
              <div className="text-slate-600 leading-relaxed">У деяких регіонах доступні додаткові дотації або комбіновані інструменти.</div>
            </div>
          </div>
        </section>

        <section className="grid gap-10 md:grid-cols-12 md:items-start">
          <div className="md:col-span-7 space-y-4 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Фінанси + енергетика = один розрахунок</h2>
            <p className="text-slate-600 leading-relaxed">Ми оцінюємо фінансування разом із:</p>
            <ul className="space-y-2 text-slate-600">
              <li>вартістю рішення</li>
              <li>прогнозом економії</li>
              <li>впливом на щомісячні витрати</li>
              <li>очікуваною окупністю</li>
            </ul>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Що важливо розуміти одразу</h2>
            <ul className="space-y-2 text-slate-600">
              <li>не кожен проєкт підпадає під дотації</li>
              <li>умови програм змінюються</li>
              <li>дотація — це бонус, а не основа економіки</li>
              <li>головне — загальний фінансовий ефект і окупність</li>
            </ul>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Чому саме зараз</h2>
            <p className="text-slate-600 leading-relaxed">
              Високі ціни на енергію, доступні технології та активні програми підтримки
              роблять запуск проєктів доцільним саме зараз.
            </p>
          </div>
          <div className="md:col-span-5">
            <VisualPlaceholder label="VISUAL / CONTEXTUAL" className="h-56 md:h-72 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm" />
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
