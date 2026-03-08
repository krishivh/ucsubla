'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Icon from '@/components/common/Icon';
import ImageCarousel from '@/components/listings/ImageCarousel';
import ReviewCard from '@/components/reviews/ReviewCard';
import BottomNav from '@/components/layout/BottomNav';
import { mockListings, mockReviews } from '@/lib/mockData';
import { formatPrice, formatDateRange } from '@/lib/utils';
import { useBookmarks } from '@/lib/hooks/useBookmarks';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Listing } from '@/lib/types';

export default function ListingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;
  const { supabaseUser } = useAuth();
  const { bookmarkedIds, toggleBookmark } = useBookmarks();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);
  const [msgModal, setMsgModal] = useState(false);
  const [initialMsg, setInitialMsg] = useState('');

  useEffect(() => {
    // Try API first
    fetch(`/api/listings/${listingId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.listing) {
          setListing(data.listing);
        } else {
          // Fall back to mock data
          const mock = mockListings.find(l => l.id === listingId);
          setListing(mock ?? null);
        }
      })
      .catch(() => {
        const mock = mockListings.find(l => l.id === listingId);
        setListing(mock ?? null);
      })
      .finally(() => setLoading(false));
  }, [listingId]);

  const reviews = mockReviews.filter(r => r.listingId === listingId);
  const isBookmarked = bookmarkedIds.includes(listingId);

  const handleMessage = async () => {
    if (!supabaseUser) { router.push('/login'); return; }
    if (!initialMsg.trim()) return;
    setMessaging(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, initialMessage: initialMsg }),
      });
      if (res.ok) {
        setMsgModal(false);
        router.push('/messages');
      }
    } finally {
      setMessaging(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-uclaBlue/30 border-t-uclaBlue rounded-full animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-body text-slateGray">Listing not found</p>
      </div>
    );
  }

  const amenityList = [
    { key: 'roommatePreference', label: listing.roommatePreference.charAt(0).toUpperCase() + listing.roommatePreference.slice(1), show: true },
    { key: 'furnished', label: 'Furnished', show: listing.amenities.furnished },
    { key: 'internet', label: 'Internet', show: listing.amenities.internet },
    { key: 'ac', label: 'AC', show: listing.amenities.ac },
    { key: 'fridge', label: 'Fridge', show: listing.amenities.fridge },
    { key: 'microwave', label: 'Microwave', show: listing.amenities.microwave },
    { key: 'laundryOnSite', label: 'On-Site Laundry', show: listing.amenities.laundryOnSite },
    { key: 'laundryInUnit', label: 'In-Unit Laundry', show: listing.amenities.laundryInUnit },
    { key: 'fitnessCenter', label: 'Fitness Center', show: listing.amenities.fitnessCenter },
    { key: 'parking', label: listing.amenities.parking ? `${listing.amenities.parking.charAt(0).toUpperCase() + listing.amenities.parking.slice(1)} Parking` : '', show: !!listing.amenities.parking },
  ].filter(item => item.show);

  return (
    <div className="min-h-screen pb-20 bg-background app-container">
      {/* Header */}
      <div className="blurHeaderWithNav app-container">
        <div className="blurHeaderWithNavContent">
          <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <Icon name="chevron.left" size={24} className="text-darkSlate" />
          </button>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <Icon name="square.and.arrow.up" size={22} className="text-darkSlate" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => supabaseUser ? toggleBookmark(listingId) : router.push('/login')}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Icon
                name="bookmark"
                size={22}
                className={isBookmarked ? 'text-uclaBlue fill-uclaBlue' : 'text-darkSlate'}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="h-[60px]" style={{ marginTop: 'env(safe-area-inset-top)' }} />

      <ImageCarousel images={listing.images} alt={listing.title} />

      <div className="px-5 pt-4 pb-24">
        <div className="mb-6">
          <h1 className="text-[20px] leading-[28px] font-medium text-darkSlate mb-2">{listing.title}</h1>
          <div className="flex items-baseline gap-2">
            <span className="text-[20px] leading-7 font-medium text-uclaBlue">{formatPrice(listing.price)}</span>
            <span className="text-body text-slateGray">/mo</span>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-0.5">
            <Icon name="location.fill" size={16} className="text-slateGray" />
            <span className="text-body text-slateGray">{listing.address} • {listing.distanceFromCampus} miles from campus</span>
          </div>
          {listing.verifiedUCLA && (
            <div className="flex items-center gap-0.5">
              <Icon name="checkmark.seal.fill" size={16} className="text-slateGray" />
              <span className="text-body text-slateGray">Verified UCLA Student</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="bg-tagBg border border-borderLight rounded-lg px-4 py-[7px] flex items-center gap-1.5">
            <Icon name="bed.double.fill" size={18} className="text-uclaBlue" />
            <span className="text-body text-darkSlate capitalize font-medium">{listing.roomType === 'triple+' ? 'Triple+' : listing.roomType}</span>
          </div>
          <div className="bg-tagBg border border-borderLight rounded-lg px-4 py-[7px] flex items-center gap-1.5">
            <Icon name="shower.fill" size={18} className="text-uclaBlue" />
            <span className="text-body text-darkSlate capitalize font-medium">{listing.bathroomType}</span>
          </div>
          <div className="bg-tagBg border border-borderLight rounded-lg px-4 py-[7px] flex items-center gap-1.5">
            <Icon name="calendar" size={18} className="text-uclaBlue" />
            <span className="text-body text-darkSlate font-medium">{formatDateRange(listing.moveInDate, listing.moveOutDate)}</span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-h2 font-semibold text-darkSlate mb-4">The Space</h2>
          <div className="flex flex-wrap gap-2">
            {amenityList.map(a => (
              <div key={a.key} className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <span className="text-body text-darkSlate">{a.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-h2 font-semibold text-darkSlate mb-3">About</h2>
          <p className="text-body text-slateGray leading-relaxed">{listing.description}</p>
        </div>

        {reviews.length > 0 && (
          <div>
            <h2 className="text-h2 font-semibold text-darkSlate mb-4">Community Insights</h2>
            <div className="space-y-3">
              {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
            </div>
          </div>
        )}
      </div>

      {/* Message Button */}
      <div className="fixed bottom-20 left-0 right-0 px-6 py-4 app-container">
        <button
          onClick={() => supabaseUser ? setMsgModal(true) : router.push('/login')}
          className="w-full btn-primary shadow-elevated flex items-center justify-center gap-2"
        >
          <Icon name="message" size={18} className="text-white" />
          <span>Message</span>
        </button>
      </div>

      {/* Message Modal */}
      {msgModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={() => setMsgModal(false)}>
          <div className="w-full max-w-[430px] bg-white rounded-t-2xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-h2 text-darkSlate font-semibold">Send a message</h2>
            <p className="text-small text-slateGray">About: {listing.title}</p>
            <textarea
              value={initialMsg}
              onChange={e => setInitialMsg(e.target.value)}
              placeholder="Hi, I'm interested in this sublease! Is it still available?"
              rows={4}
              className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-body text-darkSlate placeholder:text-lightSlate focus:outline-none focus:ring-2 focus:ring-uclaBlue resize-none"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setMsgModal(false)} className="flex-1 py-3 rounded-xl border border-border text-body text-slateGray">
                Cancel
              </button>
              <button
                onClick={handleMessage}
                disabled={!initialMsg.trim() || messaging}
                className="flex-1 py-3 rounded-xl bg-uclaBlue text-white text-body font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {messaging ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
