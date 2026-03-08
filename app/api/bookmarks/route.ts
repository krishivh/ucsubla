import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/bookmarks — get all bookmarked listing IDs for current user
export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('bookmarks')
    .select('listing_id')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const bookmarkIds = (data ?? []).map((b: { listing_id: string }) => b.listing_id);
  return NextResponse.json({ bookmarkIds });
}

// POST /api/bookmarks — add a bookmark
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { listingId } = await request.json();
  if (!listingId) {
    return NextResponse.json({ error: 'listingId required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('bookmarks')
    .upsert({ user_id: user.id, listing_id: listingId }, { onConflict: 'user_id,listing_id' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/bookmarks — remove a bookmark
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { listingId } = await request.json();
  if (!listingId) {
    return NextResponse.json({ error: 'listingId required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', user.id)
    .eq('listing_id', listingId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
