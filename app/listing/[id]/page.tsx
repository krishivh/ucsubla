'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Icon from '@/components/common/Icon';
import ImageCarousel from '@/components/listings/ImageCarousel';
import ReviewCard from '@/components/reviews/ReviewCard';
import BottomNav from '@/components/layout/BottomNav';
import { mockListings, mockReviews, mockUser } from '@/lib/mockData';
import { formatPrice, formatDateRange } from '@/lib/utils';
import type { Listing } from '@/lib/types';

export default function ListingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);

  useEffect(() => {
    // Check mock listings first
    let foundListing = mockListings.find((l) => l.id === listingId);

    // If not found, check user-created listings in localStorage
    if (!foundListing) {
      const userListings = JSON.parse(localStorage.getItem('user-listings') || '[]');
      foundListing = userListings.find((l: Listing) => l.id === listingId);
    }

    setListing(foundListing || null);
  }, [listingId]);

  const reviews = mockReviews.filter((r) => r.listingId === listingId);
  const [isBookmarked, setIsBookmarked] = useState(
    mockUser.bookmarks.includes(listingId)
  );

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
  ].filter((item) => item.show);

  return (
    <div className="min-h-screen pb-20 bg-background app-container">
      {/* Top Navigation */}
      <div className="blurHeaderWithNav app-container">
        <div className="blurHeaderWithNavContent">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <Icon name="chevron.left" size={24} className="text-darkSlate" />
          </button>

          <div className="flex items-center gap-2">
            <button
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Share listing"
            >
              <Icon name="square.and.arrow.up" size={22} className="text-darkSlate" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
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

      {/* Spacer for fixed nav */}
      <div className="h-[60px]" style={{ marginTop: 'env(safe-area-inset-top)' }} />

      {/* Image Carousel */}
      <ImageCarousel images={listing.images} alt={listing.title} />

      {/* Main Content */}
      <div className="px-5 pt-4 pb-24">
        {/* Title and Price */}
        <div className="mb-6">
          <h1 className="text-[20px] leading-[28px] font-medium text-darkSlate mb-2">
            {listing.title}
          </h1>
          <div className="flex items-baseline gap-2">
            <span className="text-[20px] leading-7 font-medium text-uclaBlue">
              {formatPrice(listing.price)}
            </span>
            <span className="text-body text-slateGray">/mo</span>
          </div>
        </div>

        {/* Address and Verified Badge */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-0.5">
            <Icon name="location.fill" size={16} className="text-slateGray" />
            <span className="text-body text-slateGray">
              {listing.address} • {listing.distanceFromCampus} miles from campus
            </span>
          </div>

          {/* Verified UCLA Student Badge */}
          {listing.verifiedUCLA && (
            <div className="flex items-center gap-0.5">
              <Icon name="checkmark.seal.fill" size={16} className="text-slateGray" />
              <span className="text-body text-slateGray">Verified UCLA Student</span>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="bg-tagBg border border-borderLight rounded-lg px-4 py-[7px] flex items-center gap-1.5">
            <Icon name="bed.double.fill" size={18} className="text-uclaBlue" />
            <span className="text-body text-darkSlate capitalize font-medium">
              {listing.roomType === 'triple+' ? 'Triple+' : listing.roomType}
            </span>
          </div>

          <div className="bg-tagBg border border-borderLight rounded-lg px-4 py-[7px] flex items-center gap-1.5">
            <Icon name="shower.fill" size={18} className="text-uclaBlue" />
            <span className="text-body text-darkSlate capitalize font-medium">
              {listing.bathroomType}
            </span>
          </div>

          <div className="bg-tagBg border border-borderLight rounded-lg px-4 py-[7px] flex items-center gap-1.5">
            <Icon name="calendar" size={18} className="text-uclaBlue" />
            <span className="text-body text-darkSlate font-medium">
              {formatDateRange(listing.moveInDate, listing.moveOutDate)}
            </span>
          </div>
        </div>

        {/* The Space */}
        <div className="mb-6">
          <h2 className="text-h2 font-semibold text-darkSlate mb-4">The Space</h2>
          <div className="flex flex-wrap gap-2">
            {amenityList.map((amenity) => (
              <div
                key={amenity.key}
                className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-2"
              >
                <span className="text-body text-darkSlate">{amenity.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="mb-6">
          <h2 className="text-h2 font-semibold text-darkSlate mb-3">About</h2>
          <p className="text-body text-slateGray leading-relaxed">
            {listing.description}
          </p>
        </div>

        {/* Community Insights */}
        {reviews.length > 0 && (
          <div>
            <h2 className="text-h2 font-semibold text-darkSlate mb-4">Community Insights</h2>
            <div className="space-y-3">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Message Button (Fixed) */}
      <div className="fixed bottom-20 left-0 right-0 px-6 py-2 app-container">
        <button
          onClick={() => router.push('/messages')}
          className="w-full btn-primary py-4 rounded-xl text-h3 shadow-elevated flex items-center justify-center gap-2"
        >
          <Icon name="message" size={20} className="text-white" />
          <span>Message</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
