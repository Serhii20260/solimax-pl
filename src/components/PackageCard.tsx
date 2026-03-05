// src/components/PackageCard.tsx
import type { Package } from '../lib/api';
import { TIER_LABELS } from '../lib/api';

interface PackageCardProps {
  pkg: Package;
  onClick?: (pkg: Package) => void;
}

export default function PackageCard({ pkg, onClick }: PackageCardProps) {
  return (
    <div
      className="group rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-slate-300 cursor-pointer"
      onClick={() => onClick?.(pkg)}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        {pkg.imageUrl ? (
          <img
            src={pkg.imageUrl}
            alt={pkg.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-package.svg';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {pkg.isNew && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500 text-white shadow">
              Nowość
            </span>
          )}
          {pkg.isPromo && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-slate-900 shadow">
              {pkg.promoLabel || 'Promocja'}
            </span>
          )}
        </div>

        {/* Tier badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium shadow ${
            pkg.tier === 'premium'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-700'
          }`}>
            {TIER_LABELS[pkg.tier]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Manufacturer */}
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
          {pkg.manufacturerName}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 group-hover:text-slate-700">
          {pkg.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-sm text-slate-600 line-clamp-2">
          {pkg.shortDescription}
        </p>

        {/* Specs preview */}
        {pkg.specs && pkg.specs.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {pkg.specs.slice(0, 4).map((spec, idx) => (
              <div key={idx} className="text-xs">
                <span className="text-slate-500">{spec.key}:</span>{' '}
                <span className="font-medium text-slate-700">{spec.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price & CTA */}
        <div className="mt-4 flex items-center justify-between">
          {pkg.priceLabel && (
            <div className="text-sm font-semibold text-slate-900">
              {pkg.priceLabel}
            </div>
          )}
          <button className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-yellow-600 hover:text-yellow-700 transition">
            Szczegóły
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
