'use client';

import { useRouter } from 'next/navigation';
import Icon from '@/components/common/Icon';
import BottomNav from '@/components/layout/BottomNav';
import { useAuth } from '@/lib/hooks/useAuth';
import { getInitials } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, supabaseUser, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center app-container">
        <div className="w-8 h-8 border-2 border-uclaBlue/30 border-t-uclaBlue rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = profile?.name ?? supabaseUser?.email?.split('@')[0] ?? 'Bruin';
  const email = profile?.email ?? supabaseUser?.email ?? '';

  const menuItems = [
    { icon: 'house', label: 'My Listings', onClick: () => router.push('/my-listings') },
    { icon: 'bookmark', label: 'Saved', onClick: () => router.push('/bookmarks') },
    { icon: 'person', label: 'Account Settings', onClick: () => router.push('/settings') },
  ];

  return (
    <div className="min-h-screen pb-20 bg-background app-container">
      <div className="blurHeader app-container">
        <div className="blurHeaderContent">
          <h1 className="text-h1 text-darkSlate">Profile</h1>
        </div>
      </div>
      <div className="h-[52px]" style={{ marginTop: 'env(safe-area-inset-top)' }} />

      <div className="px-5 pt-4 mb-6">
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-uclaBlue flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-medium">{getInitials(displayName)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-h2 text-darkSlate truncate">{displayName}</h2>
              <p className="text-body text-slateGray truncate">{email}</p>
              {profile?.verifiedUCLA && (
                <div className="flex items-center gap-1 mt-1">
                  <Icon name="checkmark.seal.fill" size={14} className="text-uclaBlue" />
                  <span className="text-small text-uclaBlue font-medium">UCLA Verified</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="w-full card p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
          >
            <Icon name={item.icon} size={20} className="text-uclaBlue" />
            <span className="text-body text-darkSlate flex-1 text-left">{item.label}</span>
            <Icon name="chevron.right" size={16} className="text-lightSlate" />
          </button>
        ))}

        <button
          onClick={handleSignOut}
          className="w-full card p-4 flex items-center gap-3 hover:bg-red-50 transition-colors mt-4"
        >
          <Icon name="arrow.right.square" size={20} className="text-red-500" />
          <span className="text-body text-red-500 flex-1 text-left">Sign Out</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
