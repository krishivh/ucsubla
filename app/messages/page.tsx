'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/common/Icon';
import BottomNav from '@/components/layout/BottomNav';
import { mockConversations, mockMessages, mockListings, mockUser } from '@/lib/mockData';
import { formatTimestamp, getInitials } from '@/lib/utils';
import type { Conversation, Message } from '@/lib/types';

export default function MessagesPage() {
  const router = useRouter();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');

  const selectedConversation = mockConversations.find(
    (c) => c.id === selectedConversationId
  );
  const conversationMessages = selectedConversationId
    ? mockMessages.filter((m) => m.conversationId === selectedConversationId)
    : [];

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    // In a real app, this would send the message to the backend
    console.log('Sending message:', messageText);
    setMessageText('');
  };

  // Conversation List View
  if (!selectedConversationId) {
    return (
      <div className="min-h-screen pb-20 bg-background app-container">
        {/* Header */}
        <div className="blurHeader app-container">
          <div className="blurHeaderContent">
            <h1 className="text-h1 text-darkSlate">Chat</h1>
          </div>
        </div>

        {/* Spacer for fixed nav */}
        <div className="h-[52px]" style={{ marginTop: 'env(safe-area-inset-top)' }} />

        {/* Conversations */}
        <div className="px-5 pt-4">
          {mockConversations.length > 0 ? (
            <div className="space-y-2">
              {mockConversations.map((conversation) => {
                const listing = mockListings.find(
                  (l) => l.id === conversation.listingId
                );
                const otherParticipantId = conversation.participants.find(
                  (p) => p !== mockUser.id
                );

                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className="w-full card p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-uclaBlue flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium text-body">
                          {getInitials('Other User')}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-h3 text-darkSlate truncate">
                            {listing?.address || 'Unknown Listing'}
                          </h3>
                          <span className="text-small text-slateGray flex-shrink-0">
                            {formatTimestamp(conversation.lastMessage.timestamp)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <p className="text-body text-slateGray truncate">
                            {conversation.lastMessage.text}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <div className="bg-uclaBlue rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-medium">
                                {conversation.unreadCount}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Icon name="message" size={48} className="text-lightSlate mx-auto mb-3" />
              <p className="text-body text-slateGray">No messages yet</p>
              <p className="text-small text-lightSlate mt-1">
                Start a conversation by messaging a listing
              </p>
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    );
  }

  // Chat View
  const listing = mockListings.find((l) => l.id === selectedConversation?.listingId);
  // Get the other participant (lister)
  const otherParticipantId = selectedConversation?.participants.find(
    (p) => p !== mockUser.id
  );
  // For now, use a mock lister name. In production, you'd fetch the actual user data
  const listerName = 'Sarah Johnson';
  const listerVerified = true;

  return (
    <div className="min-h-screen bg-background app-container">
      {/* Chat Header */}
      <div className="blurHeaderWithNav app-container">
        <div className="blurHeaderWithNavContent">
          <button
            onClick={() => setSelectedConversationId(null)}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors -ml-1.5"
            aria-label="Back to messages"
          >
            <Icon name="chevron.left" size={24} className="text-darkSlate" />
          </button>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-uclaBlue flex items-center justify-center">
              <span className="text-white font-medium text-small">
                {getInitials(listerName)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-h3 text-darkSlate truncate">
                {listing?.address || 'Unknown Listing'}
              </h2>
              <div className="flex items-center gap-1">
                <p className="text-small text-slateGray truncate">
                  {listerName}
                </p>
                {listerVerified && (
                  <Icon name="checkmark.seal.fill" size={14} className="text-slateGray flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed nav */}
      <div className="h-[60px]" style={{ marginTop: 'env(safe-area-inset-top)' }} />

      {/* Messages */}
      <div className="overflow-y-auto px-5 py-6 pb-36 space-y-4">
        {conversationMessages.map((message) => {
          const isSentByMe = message.senderId === mockUser.id;

          return (
            <div
              key={message.id}
              className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isSentByMe
                    ? 'bg-uclaBlue text-white'
                    : 'bg-gray-200 text-darkSlate'
                }`}
              >
                <p className="text-body">{message.text}</p>
                <span
                  className={`text-xs mt-1 block ${
                    isSentByMe ? 'text-white/70' : 'text-slateGray'
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message Input - Fixed above nav bar */}
      <div className="fixed bottom-20 left-0 right-0 px-6 py-3 bg-background app-container z-30">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-white border border-border rounded-full px-4 py-2.5 text-body text-darkSlate placeholder:text-lightSlate focus:outline-none focus:ring-0 focus:border-uclaBlue"
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="bg-uclaBlue text-white rounded-full p-2.5 hover:bg-[#25579e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Icon name="chevron.right" size={20} className="text-white" />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function formatPrice(price: number): string {
  return `$${price.toLocaleString()}`;
}
