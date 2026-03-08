'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Icon from '@/components/common/Icon';
import ChipGroup from '@/components/filters/ChipGroup';
import RangeSlider from '@/components/filters/RangeSlider';
import BottomNav from '@/components/layout/BottomNav';
import { UCLA_QUARTERS, datestoQuarters, quarterToDates } from '@/lib/quarterDates';
import type { Listing, Quarter, RoomType, BathroomType, RoommatePreference, ParkingType, Amenities } from '@/lib/types';

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: '', address: '', distanceFromCampus: 0.5,
    roomType: '' as RoomType | '', bathroomType: '' as BathroomType | '',
    roommatePreference: '' as RoommatePreference | '',
    moveInDate: '', moveOutDate: '', quarters: [] as Quarter[],
    price: '', images: [] as string[], description: '',
    amenities: {
      furnished: false, internet: false, ac: false, fridge: false,
      microwave: false, dishwasher: false, laundryInUnit: false,
      laundryOnSite: false, balcony: false, parking: null as ParkingType | null,
      fitnessCenter: false, pool: false, hotTub: false,
      accessible: false, groundFloor: false,
    },
  });

  // New image files selected by the user (not yet uploaded)
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  // Preview URLs for new files (blob URLs)
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/listings/${listingId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.listing) {
          const l: Listing = data.listing;
          setFormData({
            title: l.title, address: l.address,
            distanceFromCampus: l.distanceFromCampus,
            roomType: l.roomType, bathroomType: l.bathroomType,
            roommatePreference: l.roommatePreference,
            moveInDate: l.moveInDate, moveOutDate: l.moveOutDate,
            quarters: l.quarter, price: String(l.price),
            images: l.images, description: l.description,
            amenities: l.amenities as typeof formData.amenities,
          });
        }
      })
      .finally(() => setLoading(false));
  }, [listingId]);

  const handleDateChange = (field: 'moveInDate' | 'moveOutDate', value: string) => {
    const newMoveIn = field === 'moveInDate' ? value : formData.moveInDate;
    const newMoveOut = field === 'moveOutDate' ? value : formData.moveOutDate;
    const autoQuarters = datestoQuarters(newMoveIn, newMoveOut) as Quarter[];
    setFormData(prev => ({ ...prev, [field]: value, quarters: autoQuarters.length > 0 ? autoQuarters : prev.quarters }));
  };

  const handleQuarterChange = (selectedQuarters: string[]) => {
    const isValidQuarter = (q: string): q is Quarter => ['fall', 'winter', 'spring', 'summer'].includes(q);
    const quarters = selectedQuarters.filter(isValidQuarter);
    const newlyAdded = quarters.find(q => !formData.quarters.includes(q));
    let moveIn = formData.moveInDate;
    let moveOut = formData.moveOutDate;
    if (newlyAdded && (!formData.moveInDate || !formData.moveOutDate)) {
      const dates = quarterToDates(newlyAdded);
      if (dates) { moveIn = dates.moveIn; moveOut = dates.moveOut; }
    }
    setFormData(prev => ({ ...prev, quarters, moveInDate: moveIn, moveOutDate: moveOut }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const incoming = Array.from(files);
    const totalImages = formData.images.length + newImageFiles.length + incoming.length;
    if (totalImages > 8) { alert('Maximum 8 images allowed'); return; }
    setNewImageFiles(prev => [...prev, ...incoming]);
    setNewImagePreviews(prev => [...prev, ...incoming.map(f => URL.createObjectURL(f))]);
  };

  const removeExistingImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (key: keyof Amenities) => {
    setFormData(prev => ({ ...prev, amenities: { ...prev.amenities, [key]: !prev.amenities[key] } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Upload any new image files to Supabase Storage
      let uploadedUrls: string[] = [];
      if (newImageFiles.length > 0) {
        const uploadResults = await Promise.all(
          newImageFiles.map(async (file) => {
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            if (res.ok) { const { url } = await res.json(); return url as string; }
            return null;
          })
        );
        uploadedUrls = uploadResults.filter(Boolean) as string[];
      }

      // Combine existing (already-uploaded) images with newly uploaded ones
      const allImages = [...formData.images, ...uploadedUrls];

      const payload = {
        title: formData.title, price: Number(formData.price), address: formData.address,
        distance_from_campus: formData.distanceFromCampus, images: allImages,
        room_type: formData.roomType, bathroom_type: formData.bathroomType,
        move_in_date: formData.moveInDate, move_out_date: formData.moveOutDate,
        quarter: formData.quarters, roommate_preference: formData.roommatePreference,
        amenities: formData.amenities, description: formData.description,
      };
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (!res.ok) { const { error } = await res.json(); throw new Error(error); }
      router.push(`/listing/${listingId}`);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to update' });
      setIsSubmitting(false);
    }
  };

  const quarterOptions = Object.entries(UCLA_QUARTERS).map(([value, q]) => ({ value, label: q.label }));
  const roomTypeOptions = [{ value: 'single', label: 'Single' }, { value: 'double', label: 'Double' }, { value: 'triple+', label: 'Triple+' }];
  const bathroomOptions = [{ value: 'private', label: 'Private' }, { value: 'shared', label: 'Shared' }];
  const roommateOptions = [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'coed', label: 'Co-Ed' }];
  const parkingOptions = [{ value: 'covered', label: 'Covered' }, { value: 'garage', label: 'Garage' }];

  const totalImages = formData.images.length + newImageFiles.length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-uclaBlue/30 border-t-uclaBlue rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pb-32 bg-background app-container">
      <div className="blurHeaderCentered app-container">
        <div className="blurHeaderCenteredContent">
          <button onClick={() => router.back()} className="text-h3 text-uclaBlue font-medium">Cancel</button>
          <h1 className="text-h1 text-darkSlate">Edit Listing</h1>
          <div className="w-[60px]" />
        </div>
      </div>
      <div className="h-[52px]" style={{ marginTop: 'env(safe-area-inset-top)' }} />

      <form onSubmit={handleSubmit} className="px-5 py-6 space-y-6">
        <div>
          <label className="block text-h2 text-darkSlate mb-2">Title</label>
          <input type="text" value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
            className="w-full bg-white border border-border rounded-lg px-4 py-3 text-body text-darkSlate focus:outline-none focus:ring-2 focus:ring-uclaBlue" />
        </div>

        <div>
          <label className="block text-h2 text-darkSlate mb-2">Address</label>
          <input type="text" value={formData.address} onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
            className="w-full bg-white border border-border rounded-lg px-4 py-3 text-body text-darkSlate focus:outline-none focus:ring-2 focus:ring-uclaBlue" />
          <div className="mt-4">
            <RangeSlider min={0.1} max={4} step={0.1} value={formData.distanceFromCampus}
              onChange={(v) => setFormData(p => ({ ...p, distanceFromCampus: v }))}
              formatValue={(v) => `${v.toFixed(1)} miles from campus`}
              label="Distance from UCLA" minLabel="0.1 miles" maxLabel="4 miles" />
          </div>
        </div>

        <ChipGroup label="Room Type" options={roomTypeOptions}
          selected={formData.roomType ? [formData.roomType] : []}
          onChange={(s) => setFormData(p => ({ ...p, roomType: s[0] as RoomType }))} multiSelect={false} />

        <ChipGroup label="Bathroom" options={bathroomOptions}
          selected={formData.bathroomType ? [formData.bathroomType] : []}
          onChange={(s) => setFormData(p => ({ ...p, bathroomType: s[0] as BathroomType }))} multiSelect={false} />

        <ChipGroup label="Roommate Preference" options={roommateOptions}
          selected={formData.roommatePreference ? [formData.roommatePreference] : []}
          onChange={(s) => setFormData(p => ({ ...p, roommatePreference: s[0] as RoommatePreference }))} multiSelect={false} />

        <div className="space-y-4">
          <h2 className="text-h2 text-darkSlate">Availability</h2>
          <ChipGroup label="Quarter" options={quarterOptions} selected={formData.quarters}
            onChange={handleQuarterChange} multiSelect={true} />
          <div>
            <label className="block text-small text-slateGray mb-2">Move In</label>
            <input type="date" value={formData.moveInDate} onChange={(e) => handleDateChange('moveInDate', e.target.value)}
              className="w-full bg-white border border-border rounded-lg px-4 py-3 text-body text-slateGray" />
          </div>
          <div>
            <label className="block text-small text-slateGray mb-2">Move Out</label>
            <input type="date" value={formData.moveOutDate} onChange={(e) => handleDateChange('moveOutDate', e.target.value)}
              className="w-full bg-white border border-border rounded-lg px-4 py-3 text-body text-slateGray" />
          </div>
        </div>

        <div>
          <label className="block text-h2 text-darkSlate mb-2">Monthly Rent</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-body text-slateGray">$</span>
            <input type="number" value={formData.price} onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))}
              className="w-full bg-white border border-border rounded-lg pl-8 pr-4 py-3 text-body text-darkSlate focus:outline-none focus:ring-2 focus:ring-uclaBlue" />
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-6">
          <h2 className="text-h2 text-darkSlate">Amenities</h2>
          {[
            { label: 'Essentials', items: [{ key: 'furnished', label: 'Furnished' }, { key: 'internet', label: 'Internet' }, { key: 'ac', label: 'AC' }] },
            { label: 'Appliances', items: [{ key: 'fridge', label: 'Fridge' }, { key: 'microwave', label: 'Microwave' }, { key: 'dishwasher', label: 'Dishwasher' }, { key: 'laundryInUnit', label: 'In-Unit Laundry' }, { key: 'laundryOnSite', label: 'On-Site Laundry' }] },
            { label: 'Building', items: [{ key: 'fitnessCenter', label: 'Fitness Center' }, { key: 'pool', label: 'Pool' }, { key: 'hotTub', label: 'Hot Tub/Spa' }, { key: 'balcony', label: 'Balcony/Patio' }] },
          ].map(section => (
            <div key={section.label}>
              <h3 className="text-body text-darkSlate font-medium mb-3">{section.label}</h3>
              <div className="flex flex-wrap gap-2">
                {section.items.map(item => (
                  <button key={item.key} type="button" onClick={() => toggleAmenity(item.key as keyof Amenities)}
                    className={`px-4 py-2.5 rounded-xl border transition-colors ${formData.amenities[item.key as keyof Amenities] ? 'bg-uclaBlue/10 border-uclaBlue text-uclaBlue font-medium' : 'bg-white border-gray-200 text-slateGray'}`}>
                    <span className="text-body">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div>
            <h3 className="text-body text-darkSlate font-medium mb-3">Parking</h3>
            <div className="flex flex-wrap gap-2">
              {parkingOptions.map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => setFormData(p => ({ ...p, amenities: { ...p.amenities, parking: p.amenities.parking === opt.value ? null : opt.value as ParkingType } }))}
                  className={`px-4 py-2.5 rounded-xl border transition-colors ${formData.amenities.parking === opt.value ? 'bg-uclaBlue/10 border-uclaBlue text-uclaBlue font-medium' : 'bg-white border-gray-200 text-slateGray'}`}>
                  <span className="text-body">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Images */}
        <div>
          <h2 className="text-h2 text-darkSlate mb-2">Images</h2>
          <p className="text-small text-slateGray mb-3">Upload photos from your device (max 8)</p>

          {/* Existing images (already uploaded to Supabase) */}
          {(formData.images.length > 0 || newImagePreviews.length > 0) && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              {formData.images.map((url, index) => (
                <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={url} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeExistingImage(index)}
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition-colors">
                    <Icon name="xmark" size={16} className="text-darkSlate" />
                  </button>
                </div>
              ))}
              {newImagePreviews.map((url, index) => (
                <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={url} alt={`New ${index + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-uclaBlue/80 text-white text-xs px-2 py-0.5 rounded-full">New</div>
                  <button type="button" onClick={() => removeNewImage(index)}
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition-colors">
                    <Icon name="xmark" size={16} className="text-darkSlate" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {totalImages < 8 && (
            <label className="block">
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              <div className="bg-white border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-uclaBlue transition-colors">
                <Icon name="plus" size={32} className="text-slateGray mx-auto mb-2" />
                <p className="text-body text-darkSlate font-medium mb-1">Upload Photos</p>
                <p className="text-small text-slateGray">{totalImages} of 8 photos</p>
              </div>
            </label>
          )}
        </div>

        <div>
          <label className="block text-h2 text-darkSlate mb-2">Description</label>
          <textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
            rows={6} maxLength={1000}
            className="w-full bg-white border border-border rounded-lg px-4 py-3 text-body text-darkSlate focus:outline-none focus:ring-2 focus:ring-uclaBlue resize-none" />
          <div className="flex justify-between mt-1">
            <div />
            <p className="text-small text-slateGray">{formData.description.length}/1000</p>
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-small text-red-600">{errors.submit}</p>
          </div>
        )}
      </form>

      <div className="fixed bottom-20 left-0 right-0 px-6 py-4 app-container">
        <button onClick={handleSubmit} disabled={isSubmitting}
          className={`w-full rounded-[18px] px-4 py-4 text-body font-medium transition-all flex items-center justify-center gap-2 shadow-elevated ${isSubmitting ? 'bg-gray-300 text-gray-500' : 'bg-uclaBlue text-white'}`}>
          {isSubmitting ? <><div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-500 rounded-full animate-spin" /><span>Saving...</span></> : 'Save Changes'}
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
