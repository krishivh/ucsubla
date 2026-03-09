'use client';

import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/common/Icon';
import Link from 'next/link';
import BottomNav from '@/components/layout/BottomNav';
import { useConversations, useMessages } from '@/lib/hooks/useMessages';
import { useAuth } from '@/lib/hooks/useAuth';
import { getInitials } from '@/lib/utils';

const readTimestamps: Record<string, string> = (() => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem('bruinlease-read-ts') || '{}');
  } catch { return {}; }
})();

export default function MessagesPage() {
  const { supabaseUser } = useAuth();
  const { conversations, loading: convsLoading, refetch } = useConversations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const { messages, loading: msgsLoading, sendMessage } = useMessages(selectedId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (!selectedId) {
      refetch();
    }
  }, [selectedId, refetch]);

  useEffect(() => {
    if (selectedId) {
      readTimestamps[selectedId] = new Date().toISOString();
      localStorage.setItem('bruinlease-read-ts', JSON.stringify(readTimestamps));
    }
  }, [selectedId]);
  

  const handleSend = async () => {
    if (!messageText.trim()) return;
    await sendMessage(messageText);
    setMessageText('');
  };

  const handleBack = () => {
    if (selectedId && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      conversations.forEach(c => {
        if (c.id === selectedId && c.lastMessage) {
          c.lastMessage.text = lastMsg.text;
          c.lastMessage.created_at = lastMsg.timestamp;
        }
      });
      // Update read timestamp to now so our own messages don't trigger the dot
      readTimestamps[selectedId] = new Date().toISOString();
      localStorage.setItem('bruinlease-read-ts', JSON.stringify(readTimestamps));
    }
    setSelectedId(null);
  };

  const selectedConv = conversations.find(c => c.id === selectedId);

  // Conversation List
  if (!selectedId) {
    return (
      <div className="min-h-screen pb-20 bg-background app-container">
        <div className="blurHeader app-container">
          <div className="blurHeaderContent">
            <h1 className="text-h1 text-darkSlate">Chat</h1>
          </div>
        </div>
        <div className="h-[52px]" style={{ marginTop: 'env(safe-area-inset-top)' }} />

        <div className="px-5 pt-4">
          {convsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="card h-20 animate-pulse bg-gray-100 rounded-2xl" />
              ))}
            </div>
          ) : conversations.length > 0 ? (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className="w-full card shadow-card p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full bg-uclaBlue flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-medium text-body">
                        {getInitials(conv.otherProfile?.name ?? '?')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-h3 text-darkSlate truncate">
                          {conv.listings?.address ?? 'Unknown Listing'}
                        </h3>
                        {conv.lastMessage && (
                          <span className="text-small text-slateGray flex-shrink-0">
                            {new Date(conv.lastMessage.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-body text-slateGray truncate">
                          {conv.lastMessage?.text ?? 'No messages yet'}
                        </p>
                        {conv.lastMessage && (!readTimestamps[conv.id] || conv.lastMessage.created_at > readTimestamps[conv.id]) && (
                          <div className="bg-uclaBlue rounded-full w-3 h-3 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center px-8">
              <div className="w-16 h-16 rounded-full bg-uclaBlue/10 flex items-center justify-center mb-4">
                <Icon name="message" size={28} className="text-uclaBlue" />
              </div>
              <h3 className="text-h2 text-darkSlate mb-1">No messages yet</h3>
              <p className="text-body text-slateGray">
                Start a conversation by tapping Message on any listing
              </p>
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  // Chat View
  return (
    <div className="min-h-screen bg-background app-container">
      <div className="blurHeaderWithNav app-container">
        <div className="blurHeaderWithNavContent">
          <button
            onClick={handleBack}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors -ml-1.5"
          >
            <Icon name="chevron.left" size={24} className="text-darkSlate" />
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-uclaBlue flex items-center justify-center">
              <span className="text-white font-medium text-small">
                {getInitials(selectedConv?.otherProfile?.name ?? '?')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/listing/${selectedConv?.listing_id}`} className="text-h3 text-darkSlate truncate hover:underline">
                {selectedConv?.listings?.address ?? 'Listing'}
              </Link>
              <div className="flex items-center gap-1">
                <p className="text-small text-slateGray truncate">
                  {selectedConv?.otherProfile?.name ?? ''}
                </p>
                {selectedConv?.otherProfile?.verified_ucla && (
                  <Icon name="checkmark.seal.fill" size={14} className="text-slateGray flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-[60px]" style={{ marginTop: 'env(safe-area-inset-top)' }} />

      <div className="overflow-y-auto px-5 py-6 pb-36 space-y-4">
        {msgsLoading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-uclaBlue/30 border-t-uclaBlue rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId === supabaseUser?.id || message.senderId === 'me';
            return (
              <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMine ? 'bg-uclaBlue text-white' : 'bg-gray-200 text-darkSlate'}`}>
                  <p className="text-body">{message.text}</p>
                  <span className={`text-xs mt-1 block ${isMine ? 'text-white/70' : 'text-slateGray'}`}>
                    {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-20 left-0 right-0 px-4 py-3 bg-background/90 backdrop-blur-sm border-t border-borderLight app-container z-30">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-white border border-border rounded-full px-4 py-2.5 text-body text-darkSlate placeholder:text-lightSlate focus:outline-none focus:ring-0 focus:border-uclaBlue"
          />
          <button
            onClick={handleSend}
            disabled={!messageText.trim()}
            className="bg-uclaBlue text-white rounded-full p-2.5 hover:bg-[#25579e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="chevron.right" size={20} className="text-white" />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
