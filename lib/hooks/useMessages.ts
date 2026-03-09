'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface RawConversation {
  id: string;
  listing_id: string;
  participant_ids: string[];
  created_at: string;
  listings: { id: string; title: string; address: string; images: string[] } | null;
  otherProfile: { id: string; name: string; email: string; verified_ucla: boolean } | null;
  lastMessage: { text: string; created_at: string } | null;
  unreadCount: number;
}

export interface ConversationSummary {
  id: string;
  listingId: string;
  listingAddress: string;
  listingImages: string[];
  otherPersonName: string;
  otherPersonVerified: boolean;
  lastMessage: { text: string; timestamp: string } | null;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export function useConversations() {
  const [conversations, setConversations] = useState<RawConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations');
      if (!res.ok) throw new Error('Failed to load conversations');
      const { conversations: data } = await res.json();

      // We get the raw DB shape back; transform it for the UI
      // The API returns joined data: listings, requester/lister profiles
      setConversations(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const startConversation = async (listingId: string, initialMessage: string) => {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, initialMessage }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? 'Failed to start conversation');
    }
    const { conversation } = await res.json();
    fetchConversations(); // refresh list
    return conversation;
  };

  return { conversations, loading, error, refetch: fetchConversations, startConversation };
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (res.ok) {
        const { messages: data } = await res.json();
        setMessages((data ?? []).map((m: any) => ({
          id: m.id,
          conversationId: m.conversation_id,
          senderId: m.sender_id,
          text: m.text,
          timestamp: m.created_at,
          read: m.read,
        })));
      }
    } catch {
      // swallow polling errors
    }
  }, [conversationId]);

  // Initial load + polling every 3 seconds
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setLoading(true);
    fetchMessages().finally(() => setLoading(false));

    pollRef.current = setInterval(fetchMessages, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [conversationId, fetchMessages]);

  const sendMessage = async (text: string) => {
    if (!conversationId || !text.trim()) return;

    // Optimistic add (temp ID)
    const tempId = `temp-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: tempId,
      conversationId,
      senderId: 'me', // replaced after real response
      text: text.trim(),
      timestamp: new Date().toISOString(),
      read: true,
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const { message } = await res.json();
        // Replace temp with real
        setMessages(prev => prev.map(m => m.id === tempId ? {
          id: message.id,
          conversationId: message.conversation_id,
          senderId: message.sender_id,
          text: message.text,
          timestamp: message.created_at,
          read: message.read,
        } : m));
      } else {
        // Remove failed optimistic message
        setMessages(prev => prev.filter(m => m.id !== tempId));
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  return { messages, loading, sendMessage, refetch: fetchMessages };
}
