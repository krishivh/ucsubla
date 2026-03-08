'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import ListingCard from '@/components/listings/ListingCard';
import FilterModal from '@/components/filters/FilterModal';
import { useListings } from '@/lib/hooks/useListings';
import { useBookmarks } from '@/lib/hooks/useBookmarks';
import { filterListings } from '@/lib/utils';
import type { FilterState } from '@/lib/types';

const DEFAULT_FILTERS: FilterState = {
  verifiedOnly: false,
  moveInDate: null,
  moveOutDate: null,
  quarters: [],
  maxRent: 4000,
  maxDistance: 4,
  roomTypes: [],
  bathroomTypes: [],
  roommatePreferences: [],
  amenities: {},
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const { listings, loading, error } = useListings({ search: searchQuery, filters });
  const { bookmarkedIds, toggleBookmark } = useBookmarks();

  useEffect(() => {
    const saved = localStorage.getItem('ucsubla-filters');
    if (saved) {
      try { setFilters(JSON.parse(saved)); } catch {}
    }
  }, []);

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    localStorage.setItem('ucsubla-filters', JSON.stringify(newFilters));
  };

  const displayed = filterListings(listings, filters);

  return (
    <div className="min-h-screen pb-28 bg-background app-container">
      <Header
        onFilterClick={() => setIsFilterOpen(true)}
        onSearchChange={setSearchQuery}
      />
      <div className="h-[108px] safe-area-top" />

      <main className="px-5 pt-3">
        <h2 className="text-h2 text-darkSlate mb-4">Newest listings near campus</h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card h-48 animate-pulse bg-gray-100 rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-body text-red-500">Failed to load listings. Please try again.</p>
          </div>
        ) : displayed.length > 0 ? (
          <div className="space-y-4">
            {displayed.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isBookmarked={bookmarkedIds.includes(listing.id)}
                onBookmarkToggle={toggleBookmark}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-body text-slateGray">No listings found matching your criteria.</p>
          </div>
        )}
      </main>

      <BottomNav />

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={handleApplyFilters}
        resultCount={displayed.length}
      />
    </div>
  );
}
