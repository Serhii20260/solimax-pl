// src/lib/api.ts
// API client for packages

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface PackageSpec {
  key: string;
  value: string;
}

export interface Package {
  id: string;
  category: 'home' | 'business' | 'heatpumps';
  tier: 'standard' | 'premium';
  title: string;
  shortDescription: string;
  fullDescription: string;
  manufacturerName: string;
  manufacturerUrl: string;
  imageUrl: string;
  datasheetUrl: string | null;
  priceLabel: string | null;
  specs: PackageSpec[] | null;
  isActive: boolean;
  isPromo: boolean;
  isNew: boolean;
  promoLabel: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PackageFilters {
  category?: 'home' | 'business' | 'heatpumps';
  tier?: 'standard' | 'premium';
  promoOnly?: boolean;
  newOnly?: boolean;
  activeOnly?: boolean;
}

/**
 * Fetch packages with optional filters
 */
export async function fetchPackages(filters: PackageFilters = {}): Promise<Package[]> {
  const params = new URLSearchParams();
  
  if (filters.category) params.set('category', filters.category);
  if (filters.tier) params.set('tier', filters.tier);
  if (filters.promoOnly) params.set('promoOnly', 'true');
  if (filters.newOnly) params.set('newOnly', 'true');
  if (filters.activeOnly === false) params.set('activeOnly', 'false');
  
  const url = `${API_BASE}/packages${params.toString() ? `?${params}` : ''}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch packages: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch packages for banners (promo or new)
 */
export async function fetchBannerPackages(): Promise<Package[]> {
  const response = await fetch(`${API_BASE}/packages/banners`);
  if (!response.ok) {
    throw new Error(`Failed to fetch banner packages: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch single package by ID
 */
export async function fetchPackageById(id: string): Promise<Package> {
  const response = await fetch(`${API_BASE}/packages/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch package: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Category labels for display
 */
export const CATEGORY_LABELS: Record<Package['category'], string> = {
  home: 'Dom',
  business: 'Firma',
  heatpumps: 'Pompy ciepła',
};

/**
 * Tier labels for display
 */
export const TIER_LABELS: Record<Package['tier'], string> = {
  standard: 'Standard',
  premium: 'Premium',
};
