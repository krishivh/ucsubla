import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { dbListingToListing } from '@/lib/supabase/mappers';
import type { DbListing } from '@/lib/supabase/mappers';

// GET /api/listings/mine — fetch only the authenticated user's listings
export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('lister_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const listings = (data as DbListing[]).map(dbListingToListing);
  return NextResponse.json({ listings });
}
