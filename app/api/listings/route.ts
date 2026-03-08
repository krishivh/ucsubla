import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { dbListingToListing, listingToDbInsert } from '@/lib/supabase/mappers';
import type { DbListing } from '@/lib/supabase/mappers';

// GET /api/listings — fetch all listings (with optional search/filter params)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  let query = supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });

  // Optional text search
  const search = searchParams.get('search');
  if (search) {
    query = query.or(`title.ilike.%${search}%,address.ilike.%${search}%`);
  }

  // Optional price ceiling
  const maxRent = searchParams.get('maxRent');
  if (maxRent) query = query.lte('price', parseInt(maxRent));

  // Optional distance ceiling
  const maxDistance = searchParams.get('maxDistance');
  if (maxDistance) query = query.lte('distance_from_campus', parseFloat(maxDistance));

  // Verified only
  if (searchParams.get('verifiedOnly') === 'true') {
    query = query.eq('verified_ucla', true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const listings = (data as DbListing[]).map(dbListingToListing);
  return NextResponse.json({ listings });
}

// POST /api/listings — create a new listing (authenticated)
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Get user profile to check verifiedUCLA
  const { data: profile } = await supabase
    .from('profiles')
    .select('verified_ucla')
    .eq('id', user.id)
    .single();

  const dbRow = listingToDbInsert({
    ...body,
    listerId: user.id,
    verifiedUCLA: profile?.verified_ucla ?? false,
  });

  const { data, error } = await supabase
    .from('listings')
    .insert(dbRow)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ listing: dbListingToListing(data as DbListing) }, { status: 201 });
}
