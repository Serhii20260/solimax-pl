const tests = [
  { lang: "ua", q: "Що таке інвертор у сонячній електростанції?" },
  { lang: "ua", q: "Чи має сенс акумулятор, якщо найбільше споживання ввечері?" },
  { lang: "ua", q: "Як підібрати потужність інвертора до 10 кВт панелей?" },
  { lang: "ua", q: "Чи працює СЕС під час відключення електрики без батареї?" },
  { lang: "pl", q: "Co to jest falownik w instalacji fotowoltaicznej?" },
  { lang: "pl", q: "Czy magazyn energii ma sens przy dużym zużyciu wieczorem?" },
  { lang: "pl", q: "Jak dobrać moc falownika do 10 kWp paneli?" },
  { lang: "pl", q: "Czy PV działa podczas braku prądu bez baterii?" },
  { lang: "de", q: "Was ist ein Wechselrichter in einer PV-Anlage?" },
  { lang: "de", q: "Lohnt sich ein Batteriespeicher bei hohem Verbrauch am Abend?" },
  { lang: "de", q: "Wie dimensioniert man den Wechselrichter für 10 kWp PV?" },
  { lang: "de", q: "Funktioniert PV bei Stromausfall ohne Batterie?" },
  { lang: "en", q: "What is an inverter in a solar PV system?" },
  { lang: "en", q: "Is a home battery worth it if evening usage is high?" },
  { lang: "en", q: "How do you size an inverter for a 10 kWp PV array?" },
  { lang: "en", q: "Does a PV system work during a power outage without a battery?" },
];

const run = async () => {
  for (const t of tests) {
    const res = await fetch("http://127.0.0.1:4000/api/consultant/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: t.q, language: t.lang }),
    });
    const json = await res.json();
    console.log("---");
    console.log("lang:", t.lang);
    console.log("question:", t.q);
    console.log("answer:", (json.answer_text || "").trim());
  }
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
