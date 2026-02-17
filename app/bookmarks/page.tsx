'use client';

import { useState } from 'react';
import Icon from '@/components/common/Icon';
import BottomNav from '@/components/layout/BottomNav';
import ListingCard from '@/components/listings/ListingCard';
import { mockListings, mockUser } from '@/lib/mockData';

export default function BookmarksPage() {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(mockUser.bookmarks);

  const bookmarkedListings = mockListings.filter((listing) =>
    bookmarkedIds.includes(listing.id)
  );

  const handleBookmarkToggle = (listingId: string) => {
    setBookmarkedIds((prev) => {
      if (prev.includes(listingId)) {
        return prev.filter((id) => id !== listingId);
      } else {
        return [...prev, listingId];
      }
    });
  };

  return (
    <div className="min-h-screen pb-20 bg-background app-container">
      {/* Header */}
      <div className="blurHeader app-container">
        <div className="blurHeaderContent">
          <h1 className="text-h1 text-darkSlate">Saved Listings</h1>
        </div>
      </div>

      {/* Spacer for fixed nav */}
      <div className="h-[52px]" style={{ marginTop: 'env(safe-area-inset-top)' }} />

      {/* Content */}
      <main className="px-5 pt-4">
        {bookmarkedListings.length > 0 ? (
          <div className="space-y-3">
            {bookmarkedListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isBookmarked={bookmarkedIds.includes(listing.id)}
                onBookmarkToggle={handleBookmarkToggle}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Icon name="bookmark" size={64} className="text-lightSlate mx-auto mb-4" />
            <h2 className="text-h2 text-darkSlate mb-2">No saved listings</h2>
            <p className="text-body text-slateGray">
              Bookmark listings to save them for later
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
