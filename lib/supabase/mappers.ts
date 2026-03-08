import type { Listing, User, Message } from '@/lib/types';

// ── Supabase row shapes ────────────────────────────────────────────────────

export interface DbAmenities {
  furnished: boolean;
  internet: boolean;
  ac: boolean;
  fridge: boolean;
  microwave: boolean;
  dishwasher: boolean;
  laundryInUnit: boolean;
  laundryOnSite: boolean;
  balcony: boolean;
  parking: string | null;
  fitnessCenter: boolean;
  pool: boolean;
  hotTub: boolean;
  accessible: boolean;
  groundFloor: boolean;
}

export interface DbListing {
  id: string;
  title: string;
  price: number;
  address: string;
  distance_from_campus: number;
  images: string[];
  room_type: string;
  bathroom_type: string;
  move_in_date: string;
  move_out_date: string;
  quarter: string[];
  roommate_preference: string;
  verified_ucla: boolean;
  description: string;
  lister_id: string;
  amenities: DbAmenities;
  created_at: string;
}

export interface DbProfile {
  id: string;
  name: string;
  email: string;
  verified_ucla: boolean;
  created_at: string;
}

export interface DbConversation {
  id: string;
  listing_id: string;
  participant_ids: string[];
  created_at: string;
  // joined fields (enriched server-side)
  listings?: { id: string; title: string; address: string; images: string[] } | null;
  otherProfile?: DbProfile | null;
  lastMessage?: DbMessage | null;
  unreadCount?: number;
}

export interface DbMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  read: boolean;
  created_at: string;
}

// ── Row → App type mappers ────────────────────────────────────────────────

export function dbListingToListing(row: DbListing): Listing {
  const a = row.amenities ?? {};
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    address: row.address,
    distanceFromCampus: row.distance_from_campus,
    images: row.images,
    roomType: row.room_type as Listing['roomType'],
    bathroomType: row.bathroom_type as Listing['bathroomType'],
    moveInDate: row.move_in_date,
    moveOutDate: row.move_out_date,
    quarter: row.quarter as Listing['quarter'],
    roommatePreference: row.roommate_preference as Listing['roommatePreference'],
    verifiedUCLA: row.verified_ucla,
    description: row.description,
    listerId: row.lister_id,
    createdAt: row.created_at,
    amenities: {
      furnished: a.furnished ?? false,
      internet: a.internet ?? false,
      ac: a.ac ?? false,
      fridge: a.fridge ?? false,
      microwave: a.microwave ?? false,
      dishwasher: a.dishwasher ?? false,
      laundryInUnit: a.laundryInUnit ?? false,
      laundryOnSite: a.laundryOnSite ?? false,
      balcony: a.balcony ?? false,
      parking: (a.parking ?? null) as Listing['amenities']['parking'],
      fitnessCenter: a.fitnessCenter ?? false,
      pool: a.pool ?? false,
      hotTub: a.hotTub ?? false,
      accessible: a.accessible ?? false,
      groundFloor: a.groundFloor ?? false,
    },
  };
}

export function listingToDbInsert(listing: Omit<Listing, 'id' | 'createdAt'> & { listerId: string }) {
  return {
    title: listing.title,
    price: listing.price,
    address: listing.address,
    distance_from_campus: listing.distanceFromCampus,
    images: listing.images,
    room_type: listing.roomType,
    bathroom_type: listing.bathroomType,
    move_in_date: listing.moveInDate,
    move_out_date: listing.moveOutDate,
    quarter: listing.quarter,
    roommate_preference: listing.roommatePreference,
    verified_ucla: listing.verifiedUCLA,
    description: listing.description,
    lister_id: listing.listerId,
    amenities: {
      furnished: listing.amenities.furnished,
      internet: listing.amenities.internet,
      ac: listing.amenities.ac,
      fridge: listing.amenities.fridge,
      microwave: listing.amenities.microwave,
      dishwasher: listing.amenities.dishwasher,
      laundryInUnit: listing.amenities.laundryInUnit,
      laundryOnSite: listing.amenities.laundryOnSite,
      balcony: listing.amenities.balcony,
      parking: listing.amenities.parking ?? null,
      fitnessCenter: listing.amenities.fitnessCenter,
      pool: listing.amenities.pool,
      hotTub: listing.amenities.hotTub,
      accessible: listing.amenities.accessible,
      groundFloor: listing.amenities.groundFloor ?? false,
    },
  };
}

export function dbProfileToUser(row: DbProfile): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    verifiedUCLA: row.verified_ucla,
    bookmarks: [],
  };
}

export function dbMessageToMessage(row: DbMessage): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    text: row.text,
    timestamp: row.created_at,
    read: row.read,
  };
}
