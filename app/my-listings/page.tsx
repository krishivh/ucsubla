'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/common/Icon';
import BottomNav from '@/components/layout/BottomNav';
import { useListings } from '@/lib/hooks/useListings';
import { formatPrice, formatDateRange } from '@/lib/utils';

export default function MyListingsPage() {
  const router = useRouter();
  const { listings, loading, deleteListing } = useListings({ myOnly: true });
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await deleteListing(id);
      showToast('Listing deleted');
    } catch {
      showToast('Failed to delete listing');
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-background app-container">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-darkSlate text-white text-small font-medium px-4 py-2 rounded-full shadow-elevated whitespace-nowrap animate-fade-in">
          {toast}
        </div>
      )}

      <div className="blurHeaderWithNav app-container">
        <div className="blurHeaderWithNavContent">
          <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors -ml-1.5">
            <Icon name="chevron.left" size={24} className="text-darkSlate" />
          </button>
          <h1 className="text-h1 text-darkSlate flex-1">My Listings</h1>
          <Link href="/listing/new" className="btn-primary px-4 py-2 rounded-xl text-small flex items-center gap-1">
            <Icon name="plus" size={16} className="text-white" />
            New
          </Link>
        </div>
      </div>

      <div className="h-[52px]" style={{ marginTop: 'env(safe-area-inset-top)' }} />

      <div className="px-5 pt-4 space-y-4">
        {loading ? (
          // Skeleton loading
          [1, 2, 3].map(i => (
            <div key={i} className="card p-4 flex gap-3 animate-pulse">
              <div className="w-20 h-20 rounded-xl bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-8">
            <div className="w-16 h-16 rounded-full bg-uclaBlue/10 flex items-center justify-center mb-4">
              <Icon name="house" size={28} className="text-uclaBlue" />
            </div>
            <h3 className="text-h2 text-darkSlate mb-1">No listings yet</h3>
            <p className="text-body text-slateGray mb-6">Post your first sublease to get started</p>
            <Link href="/listing/new" className="btn-primary px-6 py-3 rounded-xl text-body">
              Post a Listing
            </Link>
          </div>
        ) : (
          listings.map(listing => (
            <div key={listing.id} className="card p-4 flex gap-3">
              {listing.images[0] ? (
                <img src={listing.images[0]} alt={listing.title}
                  className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Icon name="house" size={24} className="text-lightSlate" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-h3 text-darkSlate truncate">{listing.title}</p>
                <p className="text-body text-uclaBlue font-medium">{formatPrice(listing.price)}/mo</p>
                <p className="text-small text-slateGray">{formatDateRange(listing.moveInDate, listing.moveOutDate)}</p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => router.push(`/listing/edit/${listing.id}`)}
                  className="p-2 hover:bg-uclaBlue/10 rounded-lg transition-colors"
                >
                  <Icon name="pencil" size={18} className="text-uclaBlue" />
                </button>
                <button
                  onClick={() => handleDelete(listing.id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Icon name="trash" size={18} className="text-red-500" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
