// src/components/PromoBanner.tsx
import { useState, useEffect, useCallback } from 'react';
import { useBannerPackages } from '../hooks/usePackages';
import type { Package } from '../lib/api';
import { CATEGORY_LABELS } from '../lib/api';

interface PromoBannerProps {
  /** Auto-slide interval in ms (default: 2000) */
  interval?: number;
  /** Callback when package is clicked */
  onPackageClick?: (pkg: Package) => void;
  /** Custom class for container */
  className?: string;
  /** Layout variant: 1 = card bottom, 2 = card center, 3 = card with large visual */
  variant?: 1 | 2 | 3;
}

export default function PromoBanner({
  interval = 2000,
  onPackageClick,
  className = '',
  variant = 1,
}: PromoBannerProps) {
  const { packages, loading, error } = useBannerPackages();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide
  useEffect(() => {
    if (packages.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % packages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [packages.length, interval, isPaused]);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % packages.length);
  }, [packages.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + packages.length) % packages.length);
  }, [packages.length]);

  if (loading) {
    return (
      <div className={`rounded-2xl border border-slate-200 bg-slate-50 p-6 animate-pulse ${className}`}>
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-3" />
        <div className="h-4 bg-slate-200 rounded w-2/3" />
      </div>
    );
  }

  if (error || packages.length === 0) {
    return null;
  }

  const currentPackage = packages[currentIndex];

  // Different icons for each slide to show dynamic content
  const getSlideIcon = (index: number) => {
    const icons = [
      // Icon 1: Solar panel
      <svg key="solar" className="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="8" width="18" height="10" rx="1" strokeWidth={1.5} />
        <line x1="3" y1="13" x2="21" y2="13" strokeWidth={1} />
        <line x1="9" y1="8" x2="9" y2="18" strokeWidth={1} />
        <line x1="15" y1="8" x2="15" y2="18" strokeWidth={1} />
        <path d="M12 3v5M8 5l4-2 4 2" strokeWidth={1.5} strokeLinecap="round" />
      </svg>,
      // Icon 2: Battery storage
      <svg key="battery" className="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="2" y="7" width="18" height="10" rx="2" strokeWidth={1.5} />
        <path d="M20 10h2v4h-2" strokeWidth={1.5} />
        <rect x="4" y="9" width="4" height="6" fill="currentColor" opacity="0.4" />
        <rect x="9" y="9" width="4" height="6" fill="currentColor" opacity="0.25" />
      </svg>,
      // Icon 3: House with energy
      <svg key="house" className="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l9-9 9 9" />
        <path strokeWidth={1.5} d="M5 10v10h14V10" />
        <rect x="9" y="14" width="6" height="6" strokeWidth={1.5} />
      </svg>,
      // Icon 4: Heat pump / HVAC
      <svg key="hvac" className="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="6" width="18" height="14" rx="2" strokeWidth={1.5} />
        <circle cx="12" cy="13" r="4" strokeWidth={1.5} />
        <path d="M12 9v8M8 13h8" strokeWidth={1} opacity="0.5" />
      </svg>,
      // Icon 5: Lightning / Energy
      <svg key="bolt" className="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
    ];
    return icons[index % icons.length];
  };

  // Variant 1: Card at bottom, large visual area at top
  const renderVariant1 = () => (
    <div
      onClick={() => onPackageClick?.(currentPackage)}
      className="h-full flex flex-col cursor-pointer hover:bg-slate-50/50 transition"
    >
      {/* Visual area - top 60% */}
      <div className="flex-1 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-yellow-400/20 flex items-center justify-center">
            {getSlideIcon(currentIndex)}
          </div>
          <span className="text-sm text-slate-500 uppercase tracking-wider">Пакетні рішення</span>
          <p className="text-xs text-slate-400 mt-1">{currentIndex + 1} / {packages.length}</p>
        </div>
      </div>
      
      {/* Card - bottom 40% */}
      <div className="p-4 md:p-5 bg-white border-t border-slate-200 text-left">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-slate-500 uppercase">
            {CATEGORY_LABELS[currentPackage.category]}
          </span>
          {currentPackage.promoLabel && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {currentPackage.promoLabel}
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">{currentPackage.title}</h3>
        <p className="mt-1 text-sm text-slate-600 line-clamp-2">{currentPackage.shortDescription}</p>
        {currentPackage.priceLabel && (
          <div className="mt-2 text-sm font-medium text-slate-900">{currentPackage.priceLabel}</div>
        )}
      </div>
    </div>
  );

  // Variant 2: Card centered with visual above and below
  const renderVariant2 = () => (
    <div
      onClick={() => onPackageClick?.(currentPackage)}
      className="h-full flex flex-col cursor-pointer hover:bg-slate-50/50 transition"
    >
      {/* Top visual strip with dynamic icon */}
      <div className="h-24 bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-between px-5">
        <div>
          <span className="text-black font-semibold text-lg">SOLIMAX</span>
          <span className="ml-2 text-black/70 text-sm">Пакетні рішення</span>
        </div>
        <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center">
          {getSlideIcon(currentIndex)}
        </div>
      </div>
      
      {/* Card - center */}
      <div className="flex-1 p-5 md:p-6 bg-white text-left flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium text-slate-500 uppercase">
            {CATEGORY_LABELS[currentPackage.category]}
          </span>
          {currentPackage.promoLabel && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {currentPackage.promoLabel}
            </span>
          )}
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">{currentPackage.title}</h3>
        <p className="text-sm text-slate-600 line-clamp-3">{currentPackage.shortDescription}</p>
        {currentPackage.priceLabel && (
          <div className="mt-4 text-base font-semibold text-slate-900">{currentPackage.priceLabel}</div>
        )}
      </div>
      
      {/* Bottom visual strip */}
      <div className="h-16 bg-slate-100 flex items-center justify-center gap-4 px-5 border-t border-slate-200">
        <span className="text-xs text-slate-500">Huawei</span>
        <span className="text-xs text-slate-500">JA Solar</span>
        <span className="text-xs text-slate-500">BYD</span>
      </div>
    </div>
  );

  // Variant 3: Large card with side visual accent
  const renderVariant3 = () => (
    <div
      onClick={() => onPackageClick?.(currentPackage)}
      className="h-full flex cursor-pointer hover:bg-slate-50/50 transition"
    >
      {/* Left accent with dynamic icon */}
      <div className="w-16 bg-yellow-400 flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center mb-2">
          {getSlideIcon(currentIndex)}
        </div>
        <span className="text-xs text-black/60 font-medium">{currentIndex + 1}/{packages.length}</span>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-white">
          <span className="text-sm font-medium text-slate-700">Актуальні пропозиції</span>
        </div>
        
        {/* Card */}
        <div className="flex-1 p-5 md:p-6 text-left flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            {currentPackage.promoLabel && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-black">
                {currentPackage.promoLabel}
              </span>
            )}
            <span className="text-xs text-slate-500 uppercase">
              {CATEGORY_LABELS[currentPackage.category]}
            </span>
          </div>
          
          <h3 className="text-xl font-semibold text-slate-900 mb-2">{currentPackage.title}</h3>
          <p className="text-sm text-slate-600 line-clamp-3 flex-1">{currentPackage.shortDescription}</p>
          
          {currentPackage.priceLabel && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <span className="text-lg font-bold text-slate-900">{currentPackage.priceLabel}</span>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">{packages.length} пропозицій</span>
          <span className="text-xs text-yellow-600 font-medium">Дізнатися більше →</span>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Navigation Arrows */}
      {packages.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 shadow hover:bg-white transition"
            aria-label="Previous"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 shadow hover:bg-white transition"
            aria-label="Next"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Content based on variant */}
      {variant === 1 && renderVariant1()}
      {variant === 2 && renderVariant2()}
      {variant === 3 && renderVariant3()}

      {/* Dots indicator */}
      {packages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
          {packages.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); goTo(idx); }}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? 'bg-yellow-400 w-4'
                  : 'bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
