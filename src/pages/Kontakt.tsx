// src/pages/Kontakty.tsx
import { useState } from "react";
import LeadFormSection from "../components/LeadFormSection";
import VisualPlaceholder from "../components/ui/VisualPlaceholder";
import { useLanguage } from "../lib/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

type ProductType = "pv" | "heat_pump";

interface LeadFormData {
  name: string;
  phone: string;
  email: string;
  productType: ProductType;
  region: string;
  consumption: string;
  packageName: string;
  consentRODO: boolean;
}

const initialFormData: LeadFormData = {
  name: "",
  phone: "",
  email: "",
  productType: "pv",
  region: "",
  consumption: "",
  packageName: "",
  consentRODO: false,
};

export default function Kontakty() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<LeadFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    // Validate RODO consent
    if (!formData.consentRODO) {
      setErrorMessage(t.contactConsentRequired);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/consultant/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          source: "contact",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t.contactError);
      }

      setSubmitStatus("success");
      setFormData(initialFormData);
    } catch (err) {
      setSubmitStatus("error");
      setErrorMessage(err instanceof Error ? err.message : t.contactError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-16 md:space-y-24 md:px-6 md:py-24 lg:px-8">
      <section id="lead-form" className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-10">
        <div className="mx-auto max-w-3xl space-y-4">
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-slate-900">
            {t.contactFormTitle}
          </h1>

          <p className="text-slate-700 text-sm sm:text-lg leading-relaxed">
            {t.contactFormSubtitle}
          </p>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            {submitStatus === "success" ? (
              <div className="text-center py-8">
                <div className="text-green-600 text-5xl mb-4">✓</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {t.contactFormThankYou}
                </h3>
                <p className="text-slate-600">
                  {t.contactFormThankYouMsg}
                </p>
                <button
                  onClick={() => setSubmitStatus("idle")}
                  className="mt-6 text-sm text-slate-500 hover:text-slate-700 underline"
                >
                  {t.contactFormSubmitAnother}
                </button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Product Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">
                    {t.contactProductType} *
                  </label>
                  <select
                    name="productType"
                    value={formData.productType}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    required
                  >
                    <option value="pv">{t.contactProductPV}</option>
                    <option value="heat_pump">{t.contactProductHeatPump}</option>
                  </select>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">
                    {t.contactName} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    placeholder={t.contactNamePlaceholder}
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">
                    {t.contactPhone} *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    placeholder={t.contactPhonePlaceholder}
                    required
                    minLength={5}
                    maxLength={30}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">
                    {t.contactEmail} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    placeholder={t.contactEmailPlaceholder}
                    required
                    maxLength={200}
                  />
                </div>

                {/* Region */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">
                    {t.contactRegion}
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    placeholder={t.contactRegionPlaceholder}
                    maxLength={200}
                  />
                </div>

                {/* Consumption */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">
                    {t.contactConsumption}
                  </label>
                  <input
                    type="text"
                    name="consumption"
                    value={formData.consumption}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    placeholder={t.contactConsumptionPlaceholder}
                    maxLength={500}
                  />
                </div>

                {/* Package Name (manual input) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">
                    {t.contactPackage}
                  </label>
                  <input
                    type="text"
                    name="packageName"
                    value={formData.packageName}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    placeholder={t.contactPackagePlaceholder}
                    maxLength={200}
                  />
                </div>

                {/* RODO Consent */}
                <div className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    name="consentRODO"
                    id="consentRODO"
                    checked={formData.consentRODO}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                    required
                  />
                  <label htmlFor="consentRODO" className="text-xs text-slate-600 leading-relaxed">
                    {t.contactConsent} *
                  </label>
                </div>

                {/* Error Message */}
                {submitStatus === "error" && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                    {errorMessage || t.contactError}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t.contactSubmitting}
                    </>
                  ) : (
                    t.contactSubmit
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Як це працює
        </h2>

        <ol className="grid gap-6 sm:grid-cols-3 text-slate-700 text-sm sm:text-base">
          <li>Ви заповнюєте форму з базовими даними</li>
          <li>Ми аналізуємо технічну і фінансову частину</li>
          <li>Наш спеціаліст зв'язується з вами вже з готовим рішенням</li>
        </ol>

        <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
          Без порожніх розмов і втрати часу.
        </p>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Форма заявки — що ми запитуємо і чому
        </h2>
        <div className="grid gap-10 md:grid-cols-12 md:items-start">
          <div className="md:col-span-7 space-y-4 max-w-2xl">
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              Ми запитуємо лише те, що потрібно для підготовки пропозиції:
            </p>
            <ul className="space-y-2 text-slate-700 text-sm sm:text-base">
              <li>тип продукту (PV / тепловий насос)</li>
              <li>контактні дані (ім'я, телефон, email)</li>
              <li>регіон / локація</li>
              <li>орієнтовне споживання</li>
            </ul>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              Чим точніші дані — тим точніша пропозиція.
            </p>
          </div>
          <div className="md:col-span-5">
            <VisualPlaceholder label="FORM MOCKUP" className="h-56 md:h-72 rounded-2xl border border-slate-200 bg-slate-50 shadow-sm" />
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Кілька важливих моментів
        </h2>

        <ul className="space-y-2 text-slate-700 text-sm sm:text-base">
          <li>ми не передаємо дані третім сторонам</li>
          <li>ви не зобов'язані приймати рішення</li>
          <li>пропозиція готується на основі наданої інформації</li>
          <li>консультація відбувається по суті, з цифрами</li>
        </ul>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Контактна інформація
        </h2>
        <div className="max-w-3xl space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed">
          <p>Якщо потрібно:</p>
          <ul className="space-y-2">
            <li>електронна пошта</li>
            <li>телефон</li>
            <li>юридичні дані компанії</li>
          </ul>
          <p>
            Але основний шлях — через форму заявки. Так швидше і ефективніше для
            обох сторін.
          </p>
        </div>
      </section>

      <LeadFormSection 
        title={t.leadFormTitle}
        subtitle={t.leadFormSubtitle}
        description={t.leadFormDescription}
      />
    </div>
  );
}
