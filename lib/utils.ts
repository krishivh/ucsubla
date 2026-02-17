import type { Listing, FilterState, Quarter } from './types';

// Format price with comma separator
export function formatPrice(price: number): string {
  return `$${price.toLocaleString()}`;
}

// Format date range for listing cards
export function formatDateRange(moveInDate: string, moveOutDate: string): string {
  const moveIn = new Date(moveInDate);
  const moveOut = new Date(moveOutDate);

  const formatDate = (date: Date) => {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  return `${formatDate(moveIn)} - ${formatDate(moveOut)}`;
}

// Format timestamp for reviews and messages
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 30) return `${diffInDays} days ago`;
  if (diffInMonths === 1) return '1 month ago';
  if (diffInMonths < 12) return `${diffInMonths} months ago`;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Filter listings based on filter state
export function filterListings(listings: Listing[], filters: FilterState): Listing[] {
  return listings.filter(listing => {
    // Verified UCLA
    if (filters.verifiedOnly && !listing.verifiedUCLA) return false;

    // Price
    if (listing.price > filters.maxRent) return false;

    // Distance
    if (listing.distanceFromCampus > filters.maxDistance) return false;

    // Room type
    if (filters.roomTypes.length > 0 && !filters.roomTypes.includes(listing.roomType)) return false;

    // Bathroom type
    if (filters.bathroomTypes.length > 0 && !filters.bathroomTypes.includes(listing.bathroomType)) return false;

    // Roommate preference
    if (filters.roommatePreferences.length > 0 && !filters.roommatePreferences.includes(listing.roommatePreference)) return false;

    // Quarters
    if (filters.quarters.length > 0) {
      const hasMatchingQuarter = filters.quarters.some(q => listing.quarter.includes(q));
      if (!hasMatchingQuarter) return false;
    }

    // Move-in date
    if (filters.moveInDate && listing.moveInDate < filters.moveInDate) return false;

    // Move-out date
    if (filters.moveOutDate && listing.moveOutDate > filters.moveOutDate) return false;

    // Amenities
    if (filters.amenities.furnished && !listing.amenities.furnished) return false;
    if (filters.amenities.internet && !listing.amenities.internet) return false;
    if (filters.amenities.ac && !listing.amenities.ac) return false;
    if (filters.amenities.fridge && !listing.amenities.fridge) return false;
    if (filters.amenities.microwave && !listing.amenities.microwave) return false;
    if (filters.amenities.dishwasher && !listing.amenities.dishwasher) return false;
    if (filters.amenities.laundryInUnit && !listing.amenities.laundryInUnit) return false;
    if (filters.amenities.laundryOnSite && !listing.amenities.laundryOnSite) return false;
    if (filters.amenities.balcony && !listing.amenities.balcony) return false;
    if (filters.amenities.fitnessCenter && !listing.amenities.fitnessCenter) return false;
    if (filters.amenities.pool && !listing.amenities.pool) return false;
    if (filters.amenities.hotTub && !listing.amenities.hotTub) return false;
    if (filters.amenities.accessible && !listing.amenities.accessible) return false;
    if (filters.amenities.parking && listing.amenities.parking !== filters.amenities.parking) return false;

    return true;
  });
}

// Count active filters
export function countActiveFilters(filters: FilterState): number {
  let count = 0;

  if (filters.verifiedOnly) count++;
  if (filters.moveInDate) count++;
  if (filters.moveOutDate) count++;
  if (filters.quarters.length > 0) count++;
  if (filters.maxRent < 4000) count++;
  if (filters.maxDistance < 4) count++;
  if (filters.roomTypes.length > 0) count++;
  if (filters.bathroomTypes.length > 0) count++;
  if (filters.roommatePreferences.length > 0) count++;

  // Count amenity filters
  Object.values(filters.amenities).forEach(value => {
    if (value) count++;
  });

  return count;
}

// Get quarter display name
export function getQuarterDisplay(quarter: Quarter): string {
  const quarterMap: Record<Quarter, string> = {
    fall: 'Fall',
    winter: 'Winter',
    spring: 'Spring',
    summer: 'Summer',
  };
  return quarterMap[quarter];
}

// Check if listing matches search query
export function searchListings(listings: Listing[], query: string): Listing[] {
  if (!query.trim()) return listings;

  const lowerQuery = query.toLowerCase();
  return listings.filter(listing =>
    listing.address.toLowerCase().includes(lowerQuery) ||
    listing.title.toLowerCase().includes(lowerQuery)
  );
}

// Get initials from name for avatar
export function getInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}
