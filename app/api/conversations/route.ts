import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET /api/conversations — list all conversations for the current user
export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: convs, error } = await supabase
    .from('conversations')
    .select(`id, listing_id, participant_ids, created_at, listings ( id, title, address, images )`)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Filter to only conversations this user is in (RLS handles it, but double-check)
  const myConvs = (convs ?? []).filter((c) =>
    Array.isArray(c.participant_ids) && c.participant_ids.includes(user.id)
  );

  // Enrich each conversation with last message, unread count, and other participant's profile
  const enriched = await Promise.all(
    myConvs.map(async (conv) => {
      const otherIds = (conv.participant_ids as string[]).filter((id) => id !== user.id);
      const otherId = otherIds[0] ?? null;

      const [{ data: lastMsgs }, { count: unreadCount }, { data: otherProfile }] =
        await Promise.all([
          supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1),
          supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('read', false)
            .neq('sender_id', user.id),
          otherId
            ? supabase.from('profiles').select('id, name, email, verified_ucla').eq('id', otherId).single()
            : Promise.resolve({ data: null }),
        ]);

      return {
        ...conv,
        otherProfile: otherProfile ?? null,
        lastMessage: lastMsgs?.[0] ?? null,
        unreadCount: unreadCount ?? 0,
      };
    })
  );

  return NextResponse.json({ conversations: enriched });
}

// POST /api/conversations — start a conversation about a listing
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { listingId, initialMessage } = await request.json();
  if (!listingId || !initialMessage) {
    return NextResponse.json({ error: 'listingId and initialMessage required' }, { status: 400 });
  }

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('lister_id')
    .eq('id', listingId)
    .single();

  if (listingError || !listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  if (listing.lister_id === user.id) {
    return NextResponse.json({ error: 'Cannot message your own listing' }, { status: 400 });
  }

  // Check if conversation already exists
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('listing_id', listingId)
    .contains('participant_ids', [user.id, listing.lister_id])
    .maybeSingle();

  let convId: string;

  if (existing) {
    convId = existing.id;
  } else {
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .insert({ listing_id: listingId, participant_ids: [user.id, listing.lister_id] })
      .select()
      .single();

    if (convError) {
      return NextResponse.json({ error: convError.message }, { status: 400 });
    }
    convId = conv.id;
  }

  const { data: msg, error: msgError } = await supabase
    .from('messages')
    .insert({ conversation_id: convId, sender_id: user.id, text: initialMessage })
    .select()
    .single();

  if (msgError) {
    return NextResponse.json({ error: msgError.message }, { status: 400 });
  }

  return NextResponse.json({ conversation: { id: convId }, message: msg }, { status: 201 });
}
