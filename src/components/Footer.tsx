// src/components/Footer.tsx
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer id="footer" className="mt-16 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-slate-600 md:grid-cols-3 md:items-start md:gap-10 md:px-6 lg:px-8">
        <div className="space-y-2">
          <div className="text-base font-semibold text-slate-900">Solimax PL</div>
          <div>Проєктування та монтаж рішень OZE відповідно до норм PL та ЄС</div>
          <div className="text-xs">© {new Date().getFullYear()}</div>
        </div>

        <nav className="flex flex-col gap-2">
          <Link to="/" className="hover:text-slate-900">Головна</Link>
          <Link to="/dom" className="hover:text-slate-900">Дім</Link>
          <Link to="/biznes" className="hover:text-slate-900">Бізнес</Link>
          <Link to="/finansowanie" className="hover:text-slate-900">Фінансування</Link>
          <Link to="/projekty" className="hover:text-slate-900">Проєкти</Link>
          <Link to="/kontakt" className="hover:text-slate-900">Контакти</Link>
        </nav>

        <div className="flex flex-col gap-2">
          <Link to="/polityka-konfidentsiinosti" className="hover:text-slate-900">Політика конфіденційності</Link>
          <Link to="/cookies" className="hover:text-slate-900">Cookies</Link>
          <Link to="/dani-kompanii" className="hover:text-slate-900">Дані компанії</Link>
        </div>
      </div>
    </footer>
  );
}
