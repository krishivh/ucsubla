'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Listing, FilterState } from '@/lib/types';

interface UseListingsOptions {
  filters?: Partial<FilterState>;
  search?: string;
  myOnly?: boolean; // fetch only the current user's listings
}

export function useListings(options: UseListingsOptions = {}) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.search) params.set('search', options.search);
      if (options.filters?.maxRent && options.filters.maxRent < 4000) {
        params.set('maxRent', String(options.filters.maxRent));
      }
      if (options.filters?.maxDistance && options.filters.maxDistance < 4) {
        params.set('maxDistance', String(options.filters.maxDistance));
      }
      if (options.filters?.verifiedOnly) {
        params.set('verifiedOnly', 'true');
      }

      const endpoint = options.myOnly ? '/api/listings/mine' : '/api/listings';
      const url = `${endpoint}?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load listings');
      const { listings: data } = await res.json();
      setListings(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [options.search, options.filters?.maxRent, options.filters?.maxDistance, options.filters?.verifiedOnly, options.myOnly]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const deleteListing = async (id: string) => {
    const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? 'Failed to delete');
    }
    setListings(prev => prev.filter(l => l.id !== id));
  };

  const createListing = async (listingData: Omit<Listing, 'id' | 'createdAt' | 'listerId' | 'verifiedUCLA'>): Promise<Listing> => {
    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listingData),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? 'Failed to create listing');
    }
    const { listing } = await res.json();
    setListings(prev => [listing, ...prev]);
    return listing;
  };

  return { listings, loading, error, refetch: fetchListings, deleteListing, createListing };
}
