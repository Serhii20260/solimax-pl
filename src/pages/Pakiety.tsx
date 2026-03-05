// src/pages/Pakiety.tsx
import { useState, useRef } from 'react';
import { usePackages } from '../hooks/usePackages';
import PackageCard from '../components/PackageCard';
import PackageModal from '../components/PackageModal';
import type { Package } from '../lib/api';
import { CATEGORY_LABELS, TIER_LABELS } from '../lib/api';

type CategoryFilter = 'all' | 'home' | 'business' | 'heatpumps';
type TierFilter = 'all' | 'standard' | 'premium';

export default function Pakiety() {
  const { packages, loading, error } = usePackages();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');

  // Section refs for scroll
  const homeRef = useRef<HTMLDivElement>(null);
  const businessRef = useRef<HTMLDivElement>(null);
  const heatpumpsRef = useRef<HTMLDivElement>(null);

  const openModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedPackage(null), 200);
  };

  // Filter packages
  const filteredPackages = packages.filter((pkg) => {
    if (categoryFilter !== 'all' && pkg.category !== categoryFilter) return false;
    if (tierFilter !== 'all' && pkg.tier !== tierFilter) return false;
    return true;
  });

  // Group by category
  const homePackages = filteredPackages.filter(p => p.category === 'home');
  const businessPackages = filteredPackages.filter(p => p.category === 'business');
  const heatpumpsPackages = filteredPackages.filter(p => p.category === 'heatpumps');

  const scrollToSection = (category: 'home' | 'business' | 'heatpumps') => {
    const refs = { home: homeRef, business: businessRef, heatpumps: heatpumpsRef };
    refs[category].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setCategoryFilter('all');
  };

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-600 mb-4">Nie udało się załadować pakietów</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-yellow-400 text-slate-900 font-medium hover:bg-yellow-300"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-white">
      {/* Header */}
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
            Pakiety i oferty
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl">
            Gotowe rozwiązania fotowoltaiczne, magazyny energii i pompy ciepła. 
            Wybierz pakiet dopasowany do Twoich potrzeb.
          </p>

          {/* Quick nav */}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => scrollToSection('home')}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
            >
              🏠 Dom
            </button>
            <button
              onClick={() => scrollToSection('business')}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
            >
              🏢 Firma
            </button>
            <button
              onClick={() => scrollToSection('heatpumps')}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
            >
              ♨️ Pompy ciepła
            </button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-0 z-20 bg-white border-b border-slate-200 py-4">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Category filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Kategoria:</span>
              <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                {(['all', 'home', 'business', 'heatpumps'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      categoryFilter === cat
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat === 'all' ? 'Wszystkie' : CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* Tier filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Poziom:</span>
              <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                {(['all', 'standard', 'premium'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setTierFilter(tier)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                      tierFilter === tier
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tier === 'all' ? 'Wszystkie' : TIER_LABELS[tier]}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count */}
            <div className="ml-auto text-sm text-slate-500">
              {loading ? 'Ładowanie...' : `${filteredPackages.length} pakietów`}
            </div>
          </div>
        </div>
      </section>

      {/* Loading state */}
      {loading && (
        <div className="py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50 animate-pulse">
                  <div className="aspect-[16/10] bg-slate-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-5 bg-slate-200 rounded w-2/3" />
                    <div className="h-4 bg-slate-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Package sections */}
      {!loading && (
        <div className="py-8 md:py-12 space-y-16 md:space-y-20">
          {/* Home section */}
          {(categoryFilter === 'all' || categoryFilter === 'home') && homePackages.length > 0 && (
            <section ref={homeRef} id="home" className="scroll-mt-24">
              <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">🏠</span>
                  <h2 className="text-2xl font-semibold text-slate-900">Dom</h2>
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    {homePackages.length}
                  </span>
                </div>

                {/* Standard */}
                {homePackages.filter(p => p.tier === 'standard').length > 0 && (tierFilter === 'all' || tierFilter === 'standard') && (
                  <div className="mb-10">
                    <h3 className="text-lg font-medium text-slate-700 mb-4">Standard</h3>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {homePackages.filter(p => p.tier === 'standard').map((pkg) => (
                        <PackageCard key={pkg.id} pkg={pkg} onClick={openModal} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Premium */}
                {homePackages.filter(p => p.tier === 'premium').length > 0 && (tierFilter === 'all' || tierFilter === 'premium') && (
                  <div>
                    <h3 className="text-lg font-medium text-slate-700 mb-4">Premium</h3>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {homePackages.filter(p => p.tier === 'premium').map((pkg) => (
                        <PackageCard key={pkg.id} pkg={pkg} onClick={openModal} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Business section */}
          {(categoryFilter === 'all' || categoryFilter === 'business') && businessPackages.length > 0 && (
            <section ref={businessRef} id="business" className="scroll-mt-24">
              <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">🏢</span>
                  <h2 className="text-2xl font-semibold text-slate-900">Firma</h2>
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    {businessPackages.length}
                  </span>
                </div>

                {/* Standard */}
                {businessPackages.filter(p => p.tier === 'standard').length > 0 && (tierFilter === 'all' || tierFilter === 'standard') && (
                  <div className="mb-10">
                    <h3 className="text-lg font-medium text-slate-700 mb-4">Standard</h3>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {businessPackages.filter(p => p.tier === 'standard').map((pkg) => (
                        <PackageCard key={pkg.id} pkg={pkg} onClick={openModal} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Premium */}
                {businessPackages.filter(p => p.tier === 'premium').length > 0 && (tierFilter === 'all' || tierFilter === 'premium') && (
                  <div>
                    <h3 className="text-lg font-medium text-slate-700 mb-4">Premium</h3>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {businessPackages.filter(p => p.tier === 'premium').map((pkg) => (
                        <PackageCard key={pkg.id} pkg={pkg} onClick={openModal} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Heat pumps section */}
          {(categoryFilter === 'all' || categoryFilter === 'heatpumps') && heatpumpsPackages.length > 0 && (
            <section ref={heatpumpsRef} id="heatpumps" className="scroll-mt-24">
              <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">♨️</span>
                  <h2 className="text-2xl font-semibold text-slate-900">Pompy ciepła</h2>
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                    {heatpumpsPackages.length}
                  </span>
                </div>

                {/* Standard */}
                {heatpumpsPackages.filter(p => p.tier === 'standard').length > 0 && (tierFilter === 'all' || tierFilter === 'standard') && (
                  <div className="mb-10">
                    <h3 className="text-lg font-medium text-slate-700 mb-4">Standard</h3>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {heatpumpsPackages.filter(p => p.tier === 'standard').map((pkg) => (
                        <PackageCard key={pkg.id} pkg={pkg} onClick={openModal} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Premium */}
                {heatpumpsPackages.filter(p => p.tier === 'premium').length > 0 && (tierFilter === 'all' || tierFilter === 'premium') && (
                  <div>
                    <h3 className="text-lg font-medium text-slate-700 mb-4">Premium</h3>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {heatpumpsPackages.filter(p => p.tier === 'premium').map((pkg) => (
                        <PackageCard key={pkg.id} pkg={pkg} onClick={openModal} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Empty state */}
          {filteredPackages.length === 0 && !loading && (
            <div className="py-16 text-center">
              <p className="text-lg text-slate-600">Brak pakietów dla wybranych filtrów</p>
              <button
                onClick={() => {
                  setCategoryFilter('all');
                  setTierFilter('all');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition"
              >
                Resetuj filtry
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <PackageModal
        pkg={selectedPackage}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </main>
  );
}
