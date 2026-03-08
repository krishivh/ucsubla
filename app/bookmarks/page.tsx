'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/common/Icon';
import BottomNav from '@/components/layout/BottomNav';
import ListingCard from '@/components/listings/ListingCard';
import { useBookmarks } from '@/lib/hooks/useBookmarks';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Listing } from '@/lib/types';

export default function BookmarksPage() {
  const { supabaseUser } = useAuth();
  const { bookmarkedIds, loading: bmLoading, toggleBookmark } = useBookmarks();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bmLoading) return;
    if (bookmarkedIds.length === 0) { setLoading(false); return; }

    // Fetch each bookmarked listing from the API
    Promise.all(
      bookmarkedIds.map(id =>
        fetch(`/api/listings/${id}`)
          .then(r => r.ok ? r.json() : null)
          .then(data => data?.listing ?? null)
      )
    )
      .then(results => setListings(results.filter(Boolean) as Listing[]))
      .finally(() => setLoading(false));
  }, [bookmarkedIds, bmLoading]);

  return (
    <div className="min-h-screen pb-28 bg-background app-container">
      <div className="blurHeader app-container">
        <div className="blurHeaderContent">
          <h1 className="text-h1 text-darkSlate">Saved Listings</h1>
        </div>
      </div>
      <div className="h-[52px]" style={{ marginTop: 'env(safe-area-inset-top)' }} />

      <main className="px-5 pt-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-56 bg-gray-200 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="space-y-4">
            {listings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isBookmarked={bookmarkedIds.includes(listing.id)}
                onBookmarkToggle={supabaseUser ? toggleBookmark : () => {}}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Icon name="bookmark" size={64} className="text-lightSlate mx-auto mb-4" />
            <h2 className="text-h2 text-darkSlate mb-2">No saved listings</h2>
            <p className="text-body text-slateGray">Bookmark listings to save them for later</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
