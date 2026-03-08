'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '../common/Icon';
import { formatPrice, formatDateRange } from '@/lib/utils';
import type { Listing } from '@/lib/types';

interface ListingCardProps {
  listing: Listing;
  isBookmarked: boolean;
  onBookmarkToggle: (listingId: string) => void;
}

export default function ListingCard({ listing, isBookmarked, onBookmarkToggle }: ListingCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmarkToggle(listing.id);
  };

  return (
    <Link href={`/listing/${listing.id}`} className="block">
      <div className="card shadow-minimal hover:shadow-card transition-shadow duration-200">
        {/* Image */}
        <div className="relative h-56 bg-gray-200 overflow-hidden">
          {!imageError && listing.images[0] ? (
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <Icon name="house" size={48} className="text-gray-300" />
            </div>
          )}

          {/* Price badge */}
          <div className="absolute top-3 left-3 bg-white rounded-full px-3 py-1 shadow-card">
            <span className="text-sm font-semibold text-uclaBlue">
              {formatPrice(listing.price)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-1">
          {/* Title and bookmark */}
          <div className="flex items-start justify-between gap-2 min-h-[25px]">
            <h3 className="text-h3 text-darkSlate line-clamp-1 flex-1">
              {listing.title}
            </h3>
            <button
              onClick={handleBookmarkClick}
              className="flex-shrink-0 p-0 hover:scale-110 transition-transform"
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <Icon
                name="bookmark"
                size={20}
                className={isBookmarked ? 'text-uclaBlue fill-uclaBlue' : 'text-darkSlate'}
                strokeWidth={2}
              />
            </button>
          </div>

          {/* Address */}
          <div className="flex items-center gap-0.5">
            <Icon name="location.fill" size={16} className="text-slateGray" />
            <span className="text-small text-slateGray">
              {listing.address} • {listing.distanceFromCampus} miles from campus
            </span>
          </div>

          {/* Verified badge */}
          {listing.verifiedUCLA && (
            <div className="flex items-center gap-0.5">
              <Icon name="checkmark.seal.fill" size={16} className="text-slateGray" />
              <span className="text-small text-slateGray">Verified UCLA Student</span>
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-3">
            {/* Room type */}
            <div className="bg-tagBg border border-borderLight rounded-md px-[11px] py-[7px] flex items-center gap-1.5">
              <Icon name="bed.double.fill" size={18} className="text-uclaBlue" />
              <span className="text-tiny text-darkSlate capitalize font-normal">
                {listing.roomType === 'triple+' ? 'Triple+' : listing.roomType}
              </span>
            </div>

            {/* Bathroom type */}
            <div className="bg-tagBg border border-borderLight rounded-md px-[11px] py-[7px] flex items-center gap-1.5">
              <Icon name="shower.fill" size={18} className="text-uclaBlue" />
              <span className="text-tiny text-darkSlate capitalize font-normal">
                {listing.bathroomType}
              </span>
            </div>

            {/* Dates */}
            <div className="bg-tagBg border border-borderLight rounded-md px-[11px] py-[7px] flex items-center gap-1.5">
              <Icon name="calendar" size={18} className="text-uclaBlue" />
              <span className="text-tiny text-darkSlate font-normal">
                {formatDateRange(listing.moveInDate, listing.moveOutDate)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
