// src/hooks/usePackages.ts
import { useState, useEffect, useCallback } from 'react';
import type { Package, PackageFilters } from '../lib/api';
import { fetchPackages, fetchBannerPackages, fetchPackageById } from '../lib/api';

interface UsePackagesState {
  packages: Package[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch packages with filters
 */
export function usePackages(filters: PackageFilters = {}) {
  const [state, setState] = useState<UsePackagesState>({
    packages: [],
    loading: true,
    error: null,
  });

  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetchPackages(filters);
      setState({ packages: data, loading: false, error: null });
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch packages',
      }));
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}

/**
 * Hook to fetch banner packages (promo or new)
 */
export function useBannerPackages() {
  const [state, setState] = useState<UsePackagesState>({
    packages: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchBannerPackages();
        setState({ packages: data, loading: false, error: null });
      } catch (err) {
        setState({
          packages: [],
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch banners',
        });
      }
    };
    load();
  }, []);

  return state;
}

/**
 * Hook to fetch single package
 */
export function usePackage(id: string | null) {
  const [pkg, setPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setPackage(null);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPackageById(id);
        setPackage(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch package');
        setPackage(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return { package: pkg, loading, error };
}
