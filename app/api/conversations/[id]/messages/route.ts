import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/conversations/[id]/messages
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify the user is a participant
  const { data: conv } = await supabase
    .from('conversations')
    .select('id, participant_ids')
    .eq('id', id)
    .single();

  if (!conv || !Array.isArray(conv.participant_ids) || !conv.participant_ids.includes(user.id)) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Mark messages from other person as read
  await supabase
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', id)
    .neq('sender_id', user.id)
    .eq('read', false);

  return NextResponse.json({ messages: messages ?? [] });
}

// POST /api/conversations/[id]/messages — send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { text } = await request.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: 'text required' }, { status: 400 });
  }

  // Verify participant
  const { data: conv } = await supabase
    .from('conversations')
    .select('id, participant_ids')
    .eq('id', id)
    .single();

  if (!conv || !Array.isArray(conv.participant_ids) || !conv.participant_ids.includes(user.id)) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  const { data: message, error } = await supabase
    .from('messages')
    .insert({ conversation_id: id, sender_id: user.id, text: text.trim() })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message }, { status: 201 });
}
