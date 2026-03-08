'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/common/Icon';
import ChipGroup from '@/components/filters/ChipGroup';
import RangeSlider from '@/components/filters/RangeSlider';
import BottomNav from '@/components/layout/BottomNav';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatPrice } from '@/lib/utils';
import { UCLA_QUARTERS, datestoQuarters, quarterToDates } from '@/lib/quarterDates';
import type { Listing, Quarter, RoomType, BathroomType, RoommatePreference, ParkingType, Amenities } from '@/lib/types';

export default function CreateListingPage() {
  const router = useRouter();
  const { supabaseUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: '',
    address: '',
    distanceFromCampus: 0.5,
    roomType: '' as RoomType | '',
    bathroomType: '' as BathroomType | '',
    roommatePreference: '' as RoommatePreference | '',
    moveInDate: '',
    moveOutDate: '',
    quarters: [] as Quarter[],
    price: '',
    images: [''],
    description: '',
    amenities: {
      furnished: false, internet: false, ac: false, fridge: false,
      microwave: false, dishwasher: false, laundryInUnit: false,
      laundryOnSite: false, balcony: false, parking: null as ParkingType | null,
      fitnessCenter: false, pool: false, hotTub: false, accessible: false, groundFloor: false,
    },
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // When dates change → auto-select matching quarters
  const handleDateChange = (field: 'moveInDate' | 'moveOutDate', value: string) => {
    const newMoveIn = field === 'moveInDate' ? value : formData.moveInDate;
    const newMoveOut = field === 'moveOutDate' ? value : formData.moveOutDate;
    const autoQuarters = datestoQuarters(newMoveIn, newMoveOut) as Quarter[];
    setFormData(prev => ({
      ...prev,
      [field]: value,
      quarters: autoQuarters.length > 0 ? autoQuarters : prev.quarters,
    }));
  };

  // When quarter chip selected → auto-fill dates
  const handleQuarterChange = (selectedQuarters: string[]) => {
    const isValidQuarter = (q: string): q is Quarter =>
      ['fall', 'winter', 'spring', 'summer'].includes(q);
    const quarters = selectedQuarters.filter(isValidQuarter);

    // Find newly added quarter to drive date suggestion
    const newlyAdded = quarters.find(q => !formData.quarters.includes(q));
    let moveIn = formData.moveInDate;
    let moveOut = formData.moveOutDate;

    if (newlyAdded && (!formData.moveInDate || !formData.moveOutDate)) {
      const dates = quarterToDates(newlyAdded);
      if (dates) {
        moveIn = dates.moveIn;
        moveOut = dates.moveOut;
      }
    } else if (quarters.length === 1 && !formData.moveInDate) {
      const dates = quarterToDates(quarters[0]);
      if (dates) {
        moveIn = dates.moveIn;
        moveOut = dates.moveOut;
      }
    }

    setFormData(prev => ({ ...prev, quarters, moveInDate: moveIn, moveOutDate: moveOut }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    if (imageFiles.length + newFiles.length > 8) { alert('Maximum 8 images allowed'); return; }
    setImageFiles(prev => [...prev, ...newFiles]);
    const imageUrls = newFiles.map(file => URL.createObjectURL(file));
    setFormData(prev => ({ ...prev, images: [...prev.images.filter(Boolean), ...imageUrls] }));
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages.length > 0 ? newImages : [''] }));
  };

  const toggleAmenity = (key: keyof Amenities) => {
    setFormData(prev => ({ ...prev, amenities: { ...prev.amenities, [key]: !prev.amenities[key] } }));
  };

  const isFormValid = () => !!(
    formData.title.trim() && formData.address.trim() && formData.roomType &&
    formData.bathroomType && formData.roommatePreference && formData.moveInDate &&
    formData.moveOutDate && formData.quarters.length > 0 && formData.price &&
    Number(formData.price) >= 100 && Number(formData.price) <= 10000 &&
    (imageFiles.length > 0 || formData.images.filter(Boolean).length > 0) &&
    formData.description.trim()
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.roomType) newErrors.roomType = 'Room type is required';
    if (!formData.bathroomType) newErrors.bathroomType = 'Bathroom type is required';
    if (!formData.roommatePreference) newErrors.roommatePreference = 'Roommate preference is required';
    if (!formData.moveInDate) newErrors.moveInDate = 'Move-in date is required';
    if (!formData.moveOutDate) newErrors.moveOutDate = 'Move-out date is required';
    if (formData.quarters.length === 0) newErrors.quarters = 'Select at least one quarter';
    if (!formData.price || Number(formData.price) < 100 || Number(formData.price) > 10000)
      newErrors.price = 'Price must be between $100 and $10,000';
    if (imageFiles.length === 0 && !formData.images.filter(Boolean).length)
      newErrors.images = 'At least one image is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.moveInDate && formData.moveOutDate && formData.moveOutDate <= formData.moveInDate)
      newErrors.moveOutDate = 'Move-out date must be after move-in date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        const uploadResults = await Promise.all(
          imageFiles.map(async (file) => {
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            if (res.ok) { const { url } = await res.json(); return url as string; }
            return null;
          })
        );
        imageUrls = uploadResults.filter(Boolean) as string[];
      }
      if (imageUrls.length === 0) imageUrls = formData.images.filter(Boolean);

      const payload = {
        title: formData.title, price: Number(formData.price), address: formData.address,
        distanceFromCampus: formData.distanceFromCampus, images: imageUrls,
        roomType: formData.roomType as RoomType, bathroomType: formData.bathroomType as BathroomType,
        moveInDate: formData.moveInDate, moveOutDate: formData.moveOutDate,
        quarter: formData.quarters, roommatePreference: formData.roommatePreference as RoommatePreference,
        amenities: formData.amenities, description: formData.description,
      };

      const res = await fetch('/api/listings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (!res.ok) { const { error } = await res.json(); throw new Error(error ?? 'Failed to publish'); }
      const { listing } = await res.json();
      router.push(`/listing/${listing.id}`);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to publish. Try again.' });
      setIsSubmitting(false);
    }
  };

  const quarterOptions = Object.entries(UCLA_QUARTERS).map(([value, q]) => ({ value, label: q.label }));
  const roomTypeOptions = [
    { value: 'single', label: 'Single', icon: <Icon name="person" size={18} /> },
    { value: 'double', label: 'Double', icon: <Icon name="person.2" size={18} /> },
    { value: 'triple+', label: 'Triple+', icon: <Icon name="person.3" size={18} /> },
  ];
  const bathroomOptions = [{ value: 'private', label: 'Private' }, { value: 'shared', label: 'Shared' }];
  const roommateOptions = [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'coed', label: 'Co-Ed' }];
  const parkingOptions = [{ value: 'covered', label: 'Covered' }, { value: 'garage', label: 'Garage' }];

  return (
    <div className="min-h-screen pb-32 bg-background app-container">
      <div className="blurHeaderCentered app-container">
        <div className="blurHeaderCenteredContent">
          <button onClick={() => router.back()} className="text-h3 text-uclaBlue font-medium">Cancel</button>
          <h1 className="text-h1 text-darkSlate">Create Listing</h1>
          <div className="w-[60px]" />
        </div>
      </div>
      <div className="h-[52px]" style={{ marginTop: 'env(safe-area-inset-top)' }} />

      <form onSubmit={handleSubmit} className="px-5 py-6 space-y-6">
        {/* Title */}
        <div id="title">
          <label className="block text-h2 text-darkSlate mb-2">Title <span className="text-red-600">*</span></label>
          <input type="text" value={formData.title}
            onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
            placeholder="e.g., Male roommate summer 2026 single" maxLength={80}
            className="w-full bg-white border border-border rounded-lg px-4 py-3 text-body text-darkSlate placeholder:text-lightSlate focus:outline-none focus:ring-2 focus:ring-uclaBlue" />
          {errors.title && <p className="text-small text-red-600 mt-1">{errors.title}</p>}
        </div>

        {/* Address */}
        <div id="address">
          <label className="block text-h2 text-darkSlate mb-2">Address <span className="text-red-600">*</span></label>
          <input type="text" value={formData.address}
            onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
            placeholder="Street address (e.g., 625 Kelton Ave)"
            className="w-full bg-white border border-border rounded-lg px-4 py-3 text-body text-darkSlate placeholder:text-lightSlate focus:outline-none focus:ring-2 focus:ring-uclaBlue" />
          {errors.address && <p className="text-small text-red-600 mt-1">{errors.address}</p>}
          <div className="mt-4">
            <RangeSlider min={0.1} max={4} step={0.1} value={formData.distanceFromCampus}
              onChange={(value) => setFormData(p => ({ ...p, distanceFromCampus: value }))}
              formatValue={(v) => `${v.toFixed(1)} miles from campus`}
              label="Distance from UCLA" minLabel="0.1 miles" maxLabel="4 miles" />
          </div>
        </div>

        {/* Room Details */}
        <div className="space-y-6">
          <div id="roomType">
            <ChipGroup label="Room Type *" options={roomTypeOptions}
              selected={formData.roomType ? [formData.roomType] : []}
              onChange={(s) => setFormData(p => ({ ...p, roomType: s[0] as RoomType }))}
              multiSelect={false} />
            {errors.roomType && <p className="text-small text-red-600 mt-1">{errors.roomType}</p>}
          </div>
          <div id="bathroomType">
            <ChipGroup label="Bathroom *" options={bathroomOptions}
              selected={formData.bathroomType ? [formData.bathroomType] : []}
              onChange={(s) => setFormData(p => ({ ...p, bathroomType: s[0] as BathroomType }))}
              multiSelect={false} />
            {errors.bathroomType && <p className="text-small text-red-600 mt-1">{errors.bathroomType}</p>}
          </div>
          <div id="roommatePreference">
            <ChipGroup label="Roommate Preference *" options={roommateOptions}
              selected={formData.roommatePreference ? [formData.roommatePreference] : []}
              onChange={(s) => setFormData(p => ({ ...p, roommatePreference: s[0] as RoommatePreference }))}
              multiSelect={false} />
            {errors.roommatePreference && <p className="text-small text-red-600 mt-1">{errors.roommatePreference}</p>}
          </div>
        </div>

        {/* Availability */}
        <div className="space-y-4">
          <h2 className="text-h2 text-darkSlate">Availability</h2>

          {/* Quarter chips FIRST — selecting auto-fills dates */}
          <div id="quarters">
            <ChipGroup label="Quarter *" options={quarterOptions}
              selected={formData.quarters} onChange={handleQuarterChange} multiSelect={true} />
            {errors.quarters && <p className="text-small text-red-600 mt-1">{errors.quarters}</p>}
            <p className="text-xs text-slateGray mt-1">Select a quarter to auto-fill dates, or enter dates below</p>
          </div>

          {/* Date inputs — changing auto-selects quarters */}
          <div className="flex flex-col gap-4">
            <div id="moveInDate">
              <label className="block text-small text-slateGray mb-2">Move In <span className="text-red-600">*</span></label>
              <input type="date" value={formData.moveInDate}
                onChange={(e) => handleDateChange('moveInDate', e.target.value)}
                className="w-full bg-white border border-border rounded-lg px-4 py-3 text-body text-slateGray" />
              {errors.moveInDate && <p className="text-small text-red-600 mt-1">{errors.moveInDate}</p>}
            </div>
            <div id="moveOutDate">
              <label className="block text-small text-slateGray mb-2">Move Out <span className="text-red-600">*</span></label>
              <input type="date" value={formData.moveOutDate}
                onChange={(e) => handleDateChange('moveOutDate', e.target.value)}
                className="w-full bg-white border border-border rounded-lg px-4 py-3 text-body text-slateGray" />
              {errors.moveOutDate && <p className="text-small text-red-600 mt-1">{errors.moveOutDate}</p>}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div id="price">
          <h2 className="text-h2 text-darkSlate mb-3">Pricing</h2>
          <label className="block text-body text-darkSlate font-medium mb-2">Monthly Rent <span className="text-red-600">*</span></label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-body text-slateGray">$</span>
            <input type="number" value={formData.price}
              onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))}
              placeholder="1,500" min={100} max={10000}
              className="w-full bg-white border border-border rounded-lg pl-8 pr-4 py-3 text-body text-darkSlate placeholder:text-lightSlate focus:outline-none focus:ring-2 focus:ring-uclaBlue" />
          </div>
          {errors.price && <p className="text-small text-red-600 mt-1">{errors.price}</p>}
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
        <div id="images">
          <h2 className="text-h2 text-darkSlate mb-2">Images</h2>
          <p className="text-small text-slateGray mb-3">Upload photos from your device (max 8)</p>
          {imageFiles.length < 8 && (
            <label className="block">
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              <div className="bg-white border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-uclaBlue transition-colors">
                <Icon name="plus" size={32} className="text-slateGray mx-auto mb-2" />
                <p className="text-body text-darkSlate font-medium mb-1">Upload Photos</p>
                <p className="text-small text-slateGray">{imageFiles.length} of 8 photos uploaded</p>
              </div>
            </label>
          )}
          {imageFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              {formData.images.filter(Boolean).map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition-colors">
                    <Icon name="xmark" size={16} className="text-darkSlate" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {errors.images && <p className="text-small text-red-600 mt-1">{errors.images}</p>}
        </div>

        {/* Description */}
        <div id="description">
          <h2 className="text-h2 text-darkSlate mb-3">Description</h2>
          <textarea value={formData.description}
            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
            placeholder="Describe your space, the neighborhood, ideal roommate..." rows={6} maxLength={1000}
            className="w-full bg-white border border-border rounded-lg px-4 py-3 text-body text-darkSlate placeholder:text-lightSlate focus:outline-none focus:ring-2 focus:ring-uclaBlue resize-none" />
          <div className="flex justify-between mt-1">
            {errors.description && <p className="text-small text-red-600">{errors.description}</p>}
            <p className="text-small text-slateGray ml-auto">{formData.description.length}/1000</p>
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-small text-red-600">{errors.submit}</p>
          </div>
        )}
      </form>

      <div className="fixed bottom-20 left-0 right-0 px-6 py-4 app-container">
        <button onClick={handleSubmit} disabled={isSubmitting || !isFormValid()}
          className={`w-full rounded-[18px] px-4 py-4 text-body font-medium transition-all flex items-center justify-center gap-2 shadow-elevated ${isSubmitting || !isFormValid() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-uclaBlue text-white'}`}>
          {isSubmitting ? (
            <><div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-500 rounded-full animate-spin" /><span>Publishing...</span></>
          ) : 'Publish Listing'}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
