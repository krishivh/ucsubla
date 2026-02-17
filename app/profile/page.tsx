'use client';

import { useRouter } from 'next/navigation';
import Icon from '@/components/common/Icon';
import BottomNav from '@/components/layout/BottomNav';
import { mockUser, mockListings } from '@/lib/mockData';
import { getInitials } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const myListings = mockListings.filter((l) => l.listerId === mockUser.id);

  const menuItems = [
    { icon: 'house', label: 'My Listings', count: myListings.length, onClick: () => {} },
    { icon: 'bookmark', label: 'Saved', count: mockUser.bookmarks.length, onClick: () => router.push('/bookmarks') },
    { icon: 'person', label: 'Account Settings', onClick: () => {} },
    { icon: 'checkmark.seal.fill', label: 'Verification', badge: mockUser.verifiedUCLA ? 'Verified' : 'Not Verified', onClick: () => {} },
  ];

  return (
    <div className="min-h-screen pb-20 bg-background app-container">
      {/* Header */}
      <div className="blurHeader app-container">
        <div className="blurHeaderContent">
          <h1 className="text-h1 text-darkSlate">Profile</h1>
        </div>
      </div>

      {/* Spacer for fixed nav */}
      <div className="h-[52px]" style={{ marginTop: 'env(safe-area-inset-top)' }} />

      {/* Profile Info */}
      <div className="px-5 mb-6">
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-uclaBlue flex items-center justify-center">
              <span className="text-white font-medium text-xl">
                {getInitials(mockUser.name)}
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-h2 text-darkSlate">{mockUser.name}</h2>
              <p className="text-body text-slateGray">{mockUser.email}</p>
            </div>
          </div>

          {/* Verification Badge */}
          {mockUser.verifiedUCLA && (
            <div className="bg-uclaBlue/10 border border-uclaBlue/20 rounded-lg px-3 py-2 flex items-center gap-2">
              <Icon name="checkmark.seal.fill" size={16} className="text-uclaBlue" />
              <span className="text-small text-uclaBlue font-medium">
                Verified UCLA Student
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-5 space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="w-full card p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Icon name={item.icon} size={20} className="text-uclaBlue" />
              </div>
              <span className="text-body text-darkSlate font-medium">
                {item.label}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {item.count !== undefined && (
                <span className="text-small text-slateGray">{item.count}</span>
              )}
              {item.badge && (
                <span className="text-small text-uclaBlue font-medium">
                  {item.badge}
                </span>
              )}
              <Icon name="chevron.right" size={20} className="text-slateGray" />
            </div>
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="px-5 mt-6">
        <button
          onClick={() => router.push('/login')}
          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-body text-red-600 font-medium hover:bg-red-50 transition-colors"
        >
          Log Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
