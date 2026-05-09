import { Routes, Route, Navigate } from "react-router-dom";

import CalculatorWizard from "./pages/CalculatorWizard";
import AdminPricing from "./pages/AdminPricing";

import Home from "./pages/Home";
import Dom from "./pages/Dom";
import Biznes from "./pages/Biznes";
import PompyCiepla from "./pages/PompyCiepla";
import Finansowanie from "./pages/Finansowanie";
import Projekty from "./pages/Projekty";
import Kontakt from "./pages/Kontakt";
import Card from "./pages/Card";

import Pakiety from "./pages/Pakiety";
import PakietDetails from "./pages/PakietDetails";
import MainLayout from "./layouts/MainLayout";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="dom" element={<Dom />} />
        <Route path="biznes" element={<Biznes />} />
        <Route path="pompy-ciepla" element={<PompyCiepla />} />
        <Route path="finansowanie" element={<Finansowanie />} />
        <Route path="projekty" element={<Projekty />} />
        <Route path="kontakt" element={<Kontakt />} />
        <Route path="contact" element={<Kontakt />} />
        <Route path="card" element={<Card />} />

        <Route path="pakiety" element={<Pakiety />} />
        <Route path="pakiety/:slug" element={<PakietDetails />} />

        <Route path="calculator" element={<CalculatorWizard />} />
        <Route path="admin" element={<AdminPricing />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
