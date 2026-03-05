export function installationChecklistPL() {
  return [
    "BUDYNEK / DACH",
    "- Typ dachu (skośny/płaski) i materiał (dachówka/blacha/papa)",
    "- Liczba kondygnacji, dostęp do dachu (drabina/podnośnik)",
    "- Zdjęcia dachu i elewacji (opcjonalnie, ale bardzo pomaga)",
    "",
    "INSTALACJA / TRASY",
    "- Planowane miejsce falownika (garaż/kotłownia/pom. techniczne)",
    "- Odległość do rozdzielni / licznika (szacunkowo)",
    "- Czy jest miejsce na magazyn energii (ściana/podłoga)",
    "",
    "ELEKTRYKA",
    "- Rodzaj przyłącza (1F/3F), moc umowna (jeśli znana)",
    "- Zabezpieczenia w rozdzielni (jeśli znane), miejsce na dodatkowe aparaty",
    "- Uziemienie / instalacja odgromowa (jeśli jest)",
    "",
    "LICZNIK / OPERATOR",
    "- Operator (TAURON / PGE / ENEA / ENERGA / inny)",
    "- Czy jest licznik dwukierunkowy? (tak/nie)",
    "",
    "DODATKI",
    "- EV/ładowarka: moc i miejsce montażu (jeśli dotyczy)",
    "- Ogrzewanie (jeśli modernizacja): podłogówka/grzejniki/mieszane",
    "",
    "KONTAKT",
    "- Imię i nazwisko, telefon, email",
    "",
    "Uwaga: To lista do wstępnej wyceny. Dokładne ustalenia po wizji lokalnej / dokumentacji."
  ].join("\n");
}

export function checklistAsTextBlock() {
  return installationChecklistPL();
}
