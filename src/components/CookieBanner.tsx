// src/components/CookieBanner.tsx
import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-slate-700">
          Ми використовуємо cookies лише для коректної роботи сайту та базової
          аналітики. Без передачі даних третім сторонам.
        </p>

        <button
          onClick={accept}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Прийняти
        </button>
      </div>
    </div>
  );
}
