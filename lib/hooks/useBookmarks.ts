'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

export function useBookmarks() {
  const { supabaseUser } = useAuth();
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    if (!supabaseUser) {
      setBookmarkedIds([]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/bookmarks');
      if (res.ok) {
        const { bookmarkIds } = await res.json();
        setBookmarkedIds(bookmarkIds ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [supabaseUser]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const toggleBookmark = async (listingId: string) => {
    if (!supabaseUser) return; // unauthenticated — no-op

    const isBookmarked = bookmarkedIds.includes(listingId);

    // Optimistic update
    setBookmarkedIds(prev =>
      isBookmarked ? prev.filter(id => id !== listingId) : [...prev, listingId]
    );

    try {
      const res = await fetch('/api/bookmarks', {
        method: isBookmarked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      });

      if (!res.ok) {
        // Revert optimistic update on failure
        setBookmarkedIds(prev =>
          isBookmarked ? [...prev, listingId] : prev.filter(id => id !== listingId)
        );
      }
    } catch {
      // Revert on network error
      setBookmarkedIds(prev =>
        isBookmarked ? [...prev, listingId] : prev.filter(id => id !== listingId)
      );
    }
  };

  return { bookmarkedIds, loading, toggleBookmark };
}
