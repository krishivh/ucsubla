'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import ListingCard from '@/components/listings/ListingCard';
import FilterModal from '@/components/filters/FilterModal';
import { mockListings, mockUser } from '@/lib/mockData';
import { searchListings, filterListings } from '@/lib/utils';
import type { FilterState } from '@/lib/types';

export default function Home() {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(mockUser.bookmarks);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [allListings, setAllListings] = useState(mockListings);
  const [filters, setFilters] = useState<FilterState>({
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
  });

  // Load filters and user listings from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('ucsubla-filters');
    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters));
      } catch (e) {
        console.error('Failed to parse saved filters:', e);
      }
    }

    // Load user-created listings
    const userListings = JSON.parse(localStorage.getItem('user-listings') || '[]');
    setAllListings([...mockListings, ...userListings]);
  }, []);

  const handleBookmarkToggle = (listingId: string) => {
    setBookmarkedIds(prev => {
      if (prev.includes(listingId)) {
        return prev.filter(id => id !== listingId);
      } else {
        return [...prev, listingId];
      }
    });
  };

  const handleFilterClick = () => {
    setIsFilterOpen(true);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Save to localStorage
    localStorage.setItem('ucsubla-filters', JSON.stringify(newFilters));
  };

  // Apply search and filters
  let displayedListings = allListings;
  if (searchQuery) {
    displayedListings = searchListings(displayedListings, searchQuery);
  }
  displayedListings = filterListings(displayedListings, filters);

  // Sort by most recent
  displayedListings = [...displayedListings].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen pb-28 bg-background app-container">
      <Header
        onFilterClick={handleFilterClick}
        onSearchChange={handleSearchChange}
      />

      {/* Spacer for fixed header */}
      <div className="h-[108px] safe-area-top" />

      <main className="px-5 pt-3">
        {/* Section heading */}
        <h2 className="text-h2 text-darkSlate mb-4">
          Newest listings near campus
        </h2>

        {/* Listings grid */}
        <div className="space-y-4">
          {displayedListings.length > 0 ? (
            displayedListings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isBookmarked={bookmarkedIds.includes(listing.id)}
                onBookmarkToggle={handleBookmarkToggle}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-body text-slateGray">
                No listings found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={handleApplyFilters}
        resultCount={displayedListings.length}
      />
    </div>
  );
}
