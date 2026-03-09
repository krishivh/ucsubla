export type RoomType = 'single' | 'double' | 'triple+';
export type BathroomType = 'private' | 'shared';
export type Quarter = 'fall' | 'winter' | 'spring' | 'summer';
export type RoommatePreference = 'male' | 'female' | 'coed';
export type ParkingType = 'covered' | 'garage' | 'street';
export type ReviewSource = 'reddit' | 'bruinwalk' | 'yelp';

export interface Amenities {
  furnished: boolean;
  internet: boolean;
  ac: boolean;
  fridge: boolean;
  microwave: boolean;
  dishwasher: boolean;
  laundryInUnit: boolean;
  laundryOnSite: boolean;
  balcony: boolean;
  parking: ParkingType | null;
  fitnessCenter: boolean;
  pool: boolean;
  hotTub: boolean;
  accessible: boolean;
  groundFloor?: boolean;
}

export interface Listing {
  id: string;
  title: string;
  price: number; // monthly rent
  address: string;
  distanceFromCampus: number; // miles
  images: string[];
  roomType: RoomType;
  bathroomType: BathroomType;
  moveInDate: string; // ISO date string
  moveOutDate: string; // ISO date string
  quarter: Quarter[];
  roommatePreference: RoommatePreference;
  verifiedUCLA: boolean;
  amenities: Amenities;
  description: string;
  listerId: string;
  createdAt: string; // ISO date string
}

export interface Review {
  id: string;
  listingId: string;
  address?: string;
  source: ReviewSource;
  sourceUrl: string;
  sourceName: string; // e.g. "r/ucla" or "Bruinwalk Apartments"
  text: string;
  timestamp: string; // ISO date string
}

export interface User {
  id: string;
  name: string;
  email: string;
  verifiedUCLA: boolean;
  bookmarks: string[]; // listing IDs
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string; // ISO date string
  read: boolean;
}

export interface Conversation {
  id: string;
  listingId: string;
  participants: string[]; // user IDs
  lastMessage: Message;
  unreadCount: number;
}

export interface FilterState {
  verifiedOnly: boolean;
  moveInDate: string | null;
  moveOutDate: string | null;
  quarters: Quarter[];
  maxRent: number;
  maxDistance: number;
  roomTypes: RoomType[];
  bathroomTypes: BathroomType[];
  roommatePreferences: RoommatePreference[];
  amenities: Partial<Amenities>;
}
