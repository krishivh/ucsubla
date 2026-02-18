'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/common/Icon';
import ChipGroup from '@/components/filters/ChipGroup';
import RangeSlider from '@/components/filters/RangeSlider';
import BottomNav from '@/components/layout/BottomNav';
import { mockUser } from '@/lib/mockData';
import { formatPrice } from '@/lib/utils';
import type { Listing, Quarter, RoomType, BathroomType, RoommatePreference, ParkingType, Amenities } from '@/lib/types';

export default function CreateListingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasAutoFilledQuarters = useRef(false);

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
      furnished: false,
      internet: false,
      ac: false,
      fridge: false,
      microwave: false,
      dishwasher: false,
      laundryInUnit: false,
      laundryOnSite: false,
      balcony: false,
      parking: null as ParkingType | null,
      fitnessCenter: false,
      pool: false,
      hotTub: false,
      accessible: false,
      groundFloor: false,
    },
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Clear image error when user adds images
  useEffect(() => {
    if (imageFiles.length > 0 && errors.images) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });
    }
  }, [imageFiles.length, errors.images]);

  // Clear description error when user types
  useEffect(() => {
    if (formData.description.trim() && errors.description) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.description;
        return newErrors;
      });
    }
  }, [formData.description, errors.description]);

  // Auto-calculate quarters based on dates (with infinite loop prevention)
  useEffect(() => {
    // Only auto-fill quarters if:
    // 1. Dates are entered
    // 2. No quarters are selected yet
    // 3. We haven't already auto-filled (prevents loop)
    if (
      formData.moveInDate &&
      formData.moveOutDate &&
      formData.quarters.length === 0 &&
      !hasAutoFilledQuarters.current
    ) {
      const suggestedQuarters: Quarter[] = [];
      const startMonth = new Date(formData.moveInDate).getMonth();
      const endMonth = new Date(formData.moveOutDate).getMonth();

      const monthRanges = {
        spring: [2, 3, 4, 5],  // Mar, Apr, May, Jun (updated to include March)
        summer: [5, 6, 7, 8],  // Jun, Jul, Aug, Sep (updated to include June)
        fall: [8, 9, 10, 11],  // Sep, Oct, Nov, Dec
        winter: [0, 1, 2]      // Jan, Feb, Mar
      };

      Object.entries(monthRanges).forEach(([quarter, months]) => {
        if (months.includes(startMonth) || months.includes(endMonth)) {
          suggestedQuarters.push(quarter as Quarter);
        }
      });

      if (suggestedQuarters.length > 0) {
        setFormData(prev => ({ ...prev, quarters: suggestedQuarters }));
        hasAutoFilledQuarters.current = true;
      }
    }

    // Reset the flag if user clears quarters manually
    if (formData.quarters.length === 0) {
      hasAutoFilledQuarters.current = false;
    }
  }, [formData.moveInDate, formData.moveOutDate, formData.quarters.length]);

  const handleQuarterChange = (selectedQuarters: string[]) => {
    // Validate quarters are actually valid Quarter types
    const isValidQuarter = (q: string): q is Quarter =>
      ['fall', 'winter', 'spring', 'summer'].includes(q);

    const quarters = selectedQuarters.filter(isValidQuarter);

    // Find newly added quarter
    const newlyAdded = quarters.find(q => !formData.quarters.includes(q));

    // Calculate dates if needed
    let moveIn = formData.moveInDate;
    let moveOut = formData.moveOutDate;

    if (newlyAdded && (!formData.moveInDate || !formData.moveOutDate)) {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();

      switch (newlyAdded) {
        case 'spring':
          // Spring 2026: Mar 25 - Jun 12
          const springYear = currentMonth >= 2 && currentMonth < 6 ? currentYear : currentYear + 1;
          moveIn = `${springYear}-03-25`;
          moveOut = `${springYear}-06-12`;
          break;
        case 'summer':
          // Summer 2026: Jun 22 - Sep 11
          const summerYear = currentMonth >= 5 && currentMonth < 9 ? currentYear : currentYear + 1;
          moveIn = `${summerYear}-06-22`;
          moveOut = `${summerYear}-09-11`;
          break;
        case 'fall':
          // Fall 2026: Sep 21 - Dec 11
          const fallYear = currentMonth >= 8 ? currentYear : currentYear + 1;
          moveIn = `${fallYear}-09-21`;
          moveOut = `${fallYear}-12-11`;
          break;
        case 'winter':
          // Winter 2027: Jan 4 - Mar 19
          const winterYear = currentMonth >= 0 && currentMonth < 3 ? currentYear : currentYear + 1;
          moveIn = `${winterYear}-01-04`;
          moveOut = `${winterYear}-03-19`;
          break;
      }
    }

    // SINGLE state update with all changes
    setFormData(prev => ({
      ...prev,
      quarters,
      moveInDate: moveIn,
      moveOutDate: moveOut
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const totalFiles = imageFiles.length + newFiles.length;

      if (totalFiles > 8) {
        alert('Maximum 8 images allowed');
        return;
      }

      setImageFiles(prev => [...prev, ...newFiles]);

      // Convert files to URLs for display in listing
      const imageUrls = newFiles.map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images.filter(img => img), ...imageUrls]
      }));
    }
  };

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    setImageFiles(newFiles);

    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages.length > 0 ? newImages : [''] });
  };

  const toggleAmenity = (key: keyof Amenities) => {
    setFormData({
      ...formData,
      amenities: {
        ...formData.amenities,
        [key]: !formData.amenities[key],
      },
    });
  };

  const isFormValid = (): boolean => {
    return !!(
      formData.title.trim() &&
      formData.address.trim() &&
      formData.roomType &&
      formData.bathroomType &&
      formData.roommatePreference &&
      formData.moveInDate &&
      formData.moveOutDate &&
      formData.quarters.length > 0 &&
      formData.price &&
      Number(formData.price) >= 100 &&
      Number(formData.price) <= 10000 &&
      (imageFiles.length > 0 || formData.images.filter(img => img.trim()).length > 0) &&
      formData.description.trim()
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.roomType) newErrors.roomType = 'Room type is required';
    if (!formData.bathroomType) newErrors.bathroomType = 'Bathroom type is required';
    if (!formData.roommatePreference) newErrors.roommatePreference = 'Roommate preference is required';
    if (!formData.moveInDate) newErrors.moveInDate = 'Move-in date is required';
    if (!formData.moveOutDate) newErrors.moveOutDate = 'Move-out date is required';
    if (formData.quarters.length === 0) newErrors.quarters = 'Select at least one quarter';
    if (!formData.price || Number(formData.price) < 100 || Number(formData.price) > 10000) {
      newErrors.price = 'Price must be between $100 and $10,000';
    }
    if (imageFiles.length === 0 && formData.images.filter(img => img.trim()).length === 0) {
      newErrors.images = 'At least one image is required';
    }
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    if (formData.moveInDate && formData.moveOutDate && formData.moveOutDate <= formData.moveInDate) {
      newErrors.moveOutDate = 'Move-out date must be after move-in date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorKey = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorKey);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);

    // Create new listing
    const newListing: Listing = {
      id: `listing-${Date.now()}`,
      title: formData.title,
      price: Number(formData.price),
      address: formData.address,
      distanceFromCampus: formData.distanceFromCampus,
      images: formData.images.filter(img => img.trim()),
      roomType: formData.roomType as RoomType,
      bathroomType: formData.bathroomType as BathroomType,
      moveInDate: formData.moveInDate,
      moveOutDate: formData.moveOutDate,
      quarter: formData.quarters,
      roommatePreference: formData.roommatePreference as RoommatePreference,
      verifiedUCLA: mockUser.verifiedUCLA,
      amenities: formData.amenities,
      description: formData.description,
      listerId: mockUser.id,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage (mock persistence)
    const savedListings = JSON.parse(localStorage.getItem('user-listings') || '[]');
    savedListings.push(newListing);
    localStorage.setItem('user-listings', JSON.stringify(savedListings));

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Redirect to the new listing
    router.push(`/listing/${newListing.id}`);
  };

  const roomTypeOptions = [
    { value: 'single', label: 'Single', icon: <Icon name="person" size={18} /> },
    { value: 'double', label: 'Double', icon: <Icon name="person.2" size={18} /> },
    { value: 'triple+', label: 'Triple+', icon: <Icon name="person.3" size={18} /> },
  ];

  const bathroomOptions = [
    { value: 'private', label: 'Private' },
    { value: 'shared', label: 'Shared' },
  ];

  const roommateOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'coed', label: 'Co-Ed' },
  ];

  const quarterOptions = [
    { value: 'spring', label: 'Spring 2026' },
    { value: 'summer', label: 'Summer 2026' },
    { value: 'fall', label: 'Fall 2026' },
    { value: 'winter', label: 'Winter 2027' },
  ];

  const parkingOptions = [
    { value: 'covered', label: 'Covered' },
    { value: 'garage', label: 'Garage' },
  ];

  return (
    <div className="min-h-screen pb-32 bg-background app-container">
      {/* Header */}
      <div className="blurHeaderCentered app-container">
        <div className="blurHeaderCenteredContent">
          <button
            onClick={() => router.back()}
            className="text-h3 text-uclaBlue font-medium"
          >
            Cancel
          </button>
          <h1 className="text-h1 text-darkSlate">Create Listing</h1>
          <div className="w-[60px]" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Spacer for fixed nav */}
      <div className="h-[52px]" style={{ marginTop: 'env(safe-area-inset-top)' }} />

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-5 py-6 space-y-6">
        {/* Title */}
        <div className="space-y-4">
          <div id="title">
            <label htmlFor="title-input" className="block text-h2 text-darkSlate mb-2">
              Title <span className="text-red-600">*</span>
            </label>
            <input
              id="title-input"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Male roommate summer 2026 single"
              maxLength={80}
              className="w-full bg-white border border-border rounded-lg px-4 py-3 text-body text-darkSlate placeholder:text-lightSlate focus:outline-none focus:ring-2 focus:ring-uclaBlue"
            />
            {errors.title && <p className="text-small text-red-600 mt-1">{errors.title}</p>}
            <p className="text-small text-slateGray mt-1">Be specific about what you're offering</p>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4">
          <div id="address">
            <label htmlFor="address-input" className="block text-h2 text-darkSlate mb-2">
              Address <span className="text-red-600">*</span>
            </label>
            <input
              id="address-input"
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street address (e.g., 625 Kelton Ave)"
              className="w-full bg-white border border-border rounded-lg px-4 py-3 text-body text-darkSlate placeholder:text-lightSlate focus:outline-none focus:ring-2 focus:ring-uclaBlue"
            />
            {errors.address && <p className="text-small text-red-600 mt-1">{errors.address}</p>}
          </div>

          <RangeSlider
            min={0.1}
            max={4}
            step={0.1}
            value={formData.distanceFromCampus}
            onChange={(value) => setFormData({ ...formData, distanceFromCampus: value })}
            formatValue={(v) => `${v.toFixed(1)} miles from campus`}
            label="Distance from UCLA"
            minLabel="0.1 miles"
            maxLabel="4 miles"
          />
        </div>

        {/* Room Details */}
        <div className="space-y-6">
          <div id="roomType">
            <ChipGroup
              label="Room Type *"
              options={roomTypeOptions}
              selected={formData.roomType ? [formData.roomType] : []}
              onChange={(selected) => setFormData({ ...formData, roomType: selected[0] as RoomType })}
              multiSelect={false}
            />
            {errors.roomType && <p className="text-small text-red-600 mt-1">{errors.roomType}</p>}
          </div>

          <div id="bathroomType">
            <ChipGroup
              label="Bathroom *"
              options={bathroomOptions}
              selected={formData.bathroomType ? [formData.bathroomType] : []}
              onChange={(selected) => setFormData({ ...formData, bathroomType: selected[0] as BathroomType })}
              multiSelect={false}
            />
            {errors.bathroomType && <p className="text-small text-red-600 mt-1">{errors.bathroomType}</p>}
          </div>

          <div id="roommatePreference">
            <ChipGroup
              label="Roommate Preference *"
              options={roommateOptions}
              selected={formData.roommatePreference ? [formData.roommatePreference] : []}
              onChange={(selected) => setFormData({ ...formData, roommatePreference: selected[0] as RoommatePreference })}
              multiSelect={false}
            />
            {errors.roommatePreference && <p className="text-small text-red-600 mt-1">{errors.roommatePreference}</p>}
          </div>
        </div>

        {/* Availability */}
        <div className="space-y-4">
          <h2 className="text-h2 text-darkSlate">Availability</h2>
          <div className="flex flex-col gap-4">
            <div id="moveInDate">
              <label htmlFor="move-in-input" className="block text-small text-slateGray mb-2">
                Move In <span className="text-red-600">*</span>
              </label>
              <input
                id="move-in-input"
                type="date"
                value={formData.moveInDate}
                onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                className="w-full bg-white border border-border rounded-lg px-4 py-3 text-body text-slateGray text-left"
              />
              {errors.moveInDate && <p className="text-small text-red-600 mt-1">{errors.moveInDate}</p>}
            </div>
            <div id="moveOutDate">
              <label htmlFor="move-out-input" className="block text-small text-slateGray mb-2">
                Move Out <span className="text-red-600">*</span>
              </label>
              <input
                id="move-out-input"
                type="date"
                value={formData.moveOutDate}
                onChange={(e) => setFormData({ ...formData, moveOutDate: e.target.value })}
                className="w-full bg-white border border-border rounded-lg px-4 py-3 text-body text-slateGray text-left"
              />
              {errors.moveOutDate && <p className="text-small text-red-600 mt-1">{errors.moveOutDate}</p>}
            </div>
          </div>

          <div id="quarters">
            <ChipGroup
              label="Quarters *"
              options={quarterOptions}
              selected={formData.quarters}
              onChange={handleQuarterChange}
              multiSelect={true}
            />
            {errors.quarters && <p className="text-small text-red-600 mt-1">{errors.quarters}</p>}
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-4" id="price">
          <h2 className="text-h2 text-darkSlate">Pricing</h2>
          <div>
            <label htmlFor="price-input" className="block text-body text-darkSlate font-medium mb-2">
              Monthly Rent <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-body text-slateGray">$</span>
              <input
                id="price-input"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="1,500"
                min={100}
                max={10000}
                className="w-full bg-white border border-border rounded-lg pl-8 pr-4 py-3 text-body text-darkSlate placeholder:text-lightSlate focus:outline-none focus:ring-2 focus:ring-uclaBlue"
              />
            </div>
            {errors.price && <p className="text-small text-red-600 mt-1">{errors.price}</p>}
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-6">
          <h2 className="text-h2 text-darkSlate">Amenities</h2>

          {/* Essentials */}
          <div>
            <h3 className="text-body text-darkSlate font-medium mb-3">Essentials</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'furnished', label: 'Furnished' },
                { key: 'internet', label: 'Internet' },
                { key: 'ac', label: 'AC' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleAmenity(item.key as keyof Amenities)}
                  className={`px-4 py-2.5 rounded-xl border transition-colors ${
                    formData.amenities[item.key as keyof Amenities]
                      ? 'bg-uclaBlue/10 border-uclaBlue text-uclaBlue font-medium'
                      : 'bg-white border-gray-200 text-slateGray'
                  }`}
                >
                  <span className="text-body">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Appliances */}
          <div>
            <h3 className="text-body text-darkSlate font-medium mb-3">Appliances</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'fridge', label: 'Fridge' },
                { key: 'microwave', label: 'Microwave' },
                { key: 'dishwasher', label: 'Dishwasher' },
                { key: 'laundryInUnit', label: 'In-Unit Laundry' },
                { key: 'laundryOnSite', label: 'On-Site Laundry' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleAmenity(item.key as keyof Amenities)}
                  className={`px-4 py-2.5 rounded-xl border transition-colors ${
                    formData.amenities[item.key as keyof Amenities]
                      ? 'bg-uclaBlue/10 border-uclaBlue text-uclaBlue font-medium'
                      : 'bg-white border-gray-200 text-slateGray'
                  }`}
                >
                  <span className="text-body">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Building */}
          <div>
            <h3 className="text-body text-darkSlate font-medium mb-3">Building</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'fitnessCenter', label: 'Fitness Center' },
                { key: 'pool', label: 'Pool' },
                { key: 'hotTub', label: 'Hot Tub/Spa' },
                { key: 'balcony', label: 'Balcony/Patio' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleAmenity(item.key as keyof Amenities)}
                  className={`px-4 py-2.5 rounded-xl border transition-colors ${
                    formData.amenities[item.key as keyof Amenities]
                      ? 'bg-uclaBlue/10 border-uclaBlue text-uclaBlue font-medium'
                      : 'bg-white border-gray-200 text-slateGray'
                  }`}
                >
                  <span className="text-body">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Parking */}
          <div>
            <h3 className="text-body text-darkSlate font-medium mb-3">Parking</h3>
            <div className="flex flex-wrap gap-2">
              {parkingOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    const parking = formData.amenities.parking === option.value ? null : option.value as ParkingType;
                    setFormData({
                      ...formData,
                      amenities: { ...formData.amenities, parking },
                    });
                  }}
                  className={`px-4 py-2.5 rounded-xl border transition-colors ${
                    formData.amenities.parking === option.value
                      ? 'bg-uclaBlue/10 border-uclaBlue text-uclaBlue font-medium'
                      : 'bg-white border-gray-200 text-slateGray'
                  }`}
                >
                  <span className="text-body">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility */}
          <div>
            <h3 className="text-body text-darkSlate font-medium mb-3">Accessibility</h3>
            <div className="bg-white border border-gray-100 rounded-lg p-4 space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-body text-slateGray">Wheelchair Accessible</span>
                <input
                  type="checkbox"
                  checked={formData.amenities.accessible}
                  onChange={() => toggleAmenity('accessible')}
                  className="w-5 h-5 rounded border-gray-300 text-uclaBlue focus:ring-uclaBlue"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-body text-slateGray">Ground Floor</span>
                <input
                  type="checkbox"
                  checked={formData.amenities.groundFloor}
                  onChange={() => toggleAmenity('groundFloor')}
                  className="w-5 h-5 rounded border-gray-300 text-uclaBlue focus:ring-uclaBlue"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4" id="images">
          <h2 className="text-h2 text-darkSlate">Images</h2>
          <p className="text-small text-slateGray">Upload photos from your device (max 8)</p>

          {/* Upload Button */}
          {imageFiles.length < 8 && (
            <label className="block">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="bg-white border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-uclaBlue transition-colors">
                <Icon name="plus" size={32} className="text-slateGray mx-auto mb-2" />
                <p className="text-body text-darkSlate font-medium mb-1">
                  Upload Photos
                </p>
                <p className="text-small text-slateGray">
                  {imageFiles.length} of 8 photos uploaded
                </p>
              </div>
            </label>
          )}

          {/* Image Previews */}
          {imageFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {formData.images.filter(img => img).map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition-colors"
                  >
                    <Icon name="xmark" size={16} className="text-darkSlate" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {errors.images && <p className="text-small text-red-600">{errors.images}</p>}
        </div>

        {/* Description */}
        <div className="space-y-4" id="description">
          <h2 className="text-h2 text-darkSlate">Description</h2>
          <div>
            <label htmlFor="description-input" className="block text-body text-darkSlate font-medium mb-2">
              About this listing <span className="text-red-600">*</span>
            </label>
            <textarea
              id="description-input"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your space, the neighborhood, ideal roommate..."
              rows={6}
              maxLength={1000}
              className="w-full bg-white border border-border rounded-lg px-4 py-3 text-body text-darkSlate placeholder:text-lightSlate focus:outline-none focus:ring-2 focus:ring-uclaBlue resize-none"
            />
            <div className="flex items-center justify-between mt-1">
              {errors.description && <p className="text-small text-red-600">{errors.description}</p>}
              <p className="text-small text-slateGray ml-auto">
                {formData.description.length}/1000
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-20 left-0 right-0 px-6 py-4 app-container">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !isFormValid()}
          className={`w-full py-4 rounded-xl text-h3 flex items-center justify-center gap-2 transition-all ${
            isSubmitting || !isFormValid()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
              : 'btn-primary shadow-elevated'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-500 rounded-full animate-spin" />
              <span>Publishing...</span>
            </>
          ) : (
            'Publish Listing'
          )}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
