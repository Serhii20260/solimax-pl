// src/components/PackageModal.tsx
import { useEffect, useRef } from 'react';
import type { Package } from '../lib/api';
import { CATEGORY_LABELS, TIER_LABELS } from '../lib/api';

interface PackageModalProps {
  pkg: Package | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PackageModal({ pkg, isOpen, onClose }: PackageModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen || !pkg) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 shadow hover:bg-white transition"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Image header */}
          <div className="relative aspect-[21/9] bg-slate-100">
            {pkg.imageUrl ? (
              <img
                src={pkg.imageUrl}
                alt={pkg.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300" />
            )}
            
            {/* Badges overlay */}
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              {pkg.isNew && (
                <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-green-500 text-white shadow-lg">
                  Nowość
                </span>
              )}
              {pkg.isPromo && (
                <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-yellow-400 text-slate-900 shadow-lg">
                  {pkg.promoLabel || 'Promocja'}
                </span>
              )}
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium shadow-lg ${
                pkg.tier === 'premium'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700'
              }`}>
                {TIER_LABELS[pkg.tier]}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-medium text-slate-500">
                  {CATEGORY_LABELS[pkg.category]}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-sm text-slate-500">{pkg.manufacturerName}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
                {pkg.title}
              </h2>
              <p className="mt-2 text-lg text-slate-600">
                {pkg.shortDescription}
              </p>
            </div>

            {/* Price */}
            {pkg.priceLabel && (
              <div className="py-4 px-5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-sm text-slate-500 mb-1">Cena orientacyjna</div>
                <div className="text-xl font-semibold text-slate-900">{pkg.priceLabel}</div>
              </div>
            )}

            {/* Specs */}
            {pkg.specs && pkg.specs.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Specyfikacja</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {pkg.specs.map((spec, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-50"
                    >
                      <span className="text-sm text-slate-600">{spec.key}</span>
                      <span className="text-sm font-medium text-slate-900">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full description */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Opis</h3>
              <div
                className="prose prose-slate prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: pkg.fullDescription
                    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
                    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-medium mt-4 mb-2">$1</h3>')
                    .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
                    .replace(/\n\n/g, '</p><p class="mt-3">')
                    .replace(/\n/g, '<br/>')
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
              <a
                href={pkg.manufacturerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Strona producenta
              </a>
              
              {pkg.datasheetUrl && (
                <a
                  href={pkg.datasheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Karta katalogowa
                </a>
              )}

              <a
                href="/kontakt"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-yellow-300 transition sm:ml-auto"
              >
                Zapytaj o ofertę
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
