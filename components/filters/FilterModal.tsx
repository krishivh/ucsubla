'use client';

import { useState, useEffect } from 'react';
import Icon from '../common/Icon';
import RangeSlider from './RangeSlider';
import ToggleSwitch from './ToggleSwitch';
import ChipGroup from './ChipGroup';
import { formatPrice, countActiveFilters } from '@/lib/utils';
import type { FilterState, Quarter, RoomType, BathroomType, RoommatePreference } from '@/lib/types';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  resultCount: number;
}

export default function FilterModal({
  isOpen,
  onClose,
  filters: initialFilters,
  onApply,
  resultCount,
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  if (!isOpen) return null;

  const handleReset = () => {
    const resetFilters: FilterState = {
      verifiedOnly: false,
      moveInDate: null,
      moveOutDate: null,
      quarters: [],
      maxRent: 4000,
      maxDistance: 4,
      roomTypes: [],
      bathroomTypes: [],
      roommatePreferences: [],
      amenities: {},
    };
    setFilters(resetFilters);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const quarterOptions = [
    { value: 'spring', label: 'Spring 2026' },
    { value: 'summer', label: 'Summer 2026' },
    { value: 'fall', label: 'Fall 2026' },
    { value: 'winter', label: 'Winter 2027' },
  ];

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

  const essentialOptions = [
    { key: 'furnished', label: 'Furnished' },
    { key: 'internet', label: 'Internet' },
    { key: 'ac', label: 'AC' },
  ];

  const applianceOptions = [
    { key: 'fridge', label: 'Fridge' },
    { key: 'microwave', label: 'Microwave' },
    { key: 'dishwasher', label: 'Dishwasher' },
    { key: 'laundryInUnit', label: 'In-Unit Laundry' },
    { key: 'laundryOnSite', label: 'On-Site Laundry' },
  ];

  const amenityOptions = [
    { key: 'fitnessCenter', label: 'Fitness Center' },
    { key: 'pool', label: 'Pool' },
    { key: 'hotTub', label: 'Hot Tub/Spa' },
  ];

  const parkingOptions = [
    { key: 'covered', label: 'Covered' },
    { key: 'garage', label: 'Garage' },
  ];

  const accessibilityOptions = [
    { key: 'accessible', label: 'Wheelchair Accessible' },
    { key: 'groundFloor', label: 'Ground Floor' },
  ];

  const toggleAmenity = (key: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [key]: !prev.amenities[key as keyof typeof prev.amenities],
      },
    }));
  };

  return (
    <div className="fixed inset-0 bg-background z-[1001] overflow-y-auto">
      <div className="min-h-screen pb-28">
        {/* Header */}
        <div className="sticky top-0 bg-[#F8FAFC] border-b-[1.5px] border-[#E2E8F0] z-10 safe-area-top">
          <div className="flex items-center justify-between px-5 py-3">
            <button
              onClick={handleReset}
              className="text-h3 text-uclaBlue font-medium"
            >
              Reset
            </button>
            <h1 className="text-h1 text-darkSlate">Filters</h1>
            <button
              onClick={onClose}
              className="p-1"
            >
              <Icon name="xmark" size={20} className="text-slateGray" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-6 space-y-6">
          {/* Verified UCLA Toggle */}
          <ToggleSwitch
            checked={filters.verifiedOnly}
            onChange={(checked) => setFilters({ ...filters, verifiedOnly: checked })}
            label="Verified Listings Only"
            description="Only show student-verified posts"
            icon={<Icon name="checkmark.seal.fill" size={24} className="text-uclaBlue" />}
          />

          {/* Availability Section */}
          <div className="space-y-4">
            <h2 className="text-h2 text-darkSlate">Availability</h2>

            {/* Date inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-small text-slateGray block mb-2">Move In</label>
                <input
                  type="date"
                  value={filters.moveInDate || ''}
                  onChange={(e) => setFilters({ ...filters, moveInDate: e.target.value || null })}
                  className="w-full bg-white border border-border rounded-lg px-4 py-3 text-body text-slateGray"
                />
              </div>
              <div>
                <label className="text-small text-slateGray block mb-2">Move Out</label>
                <input
                  type="date"
                  value={filters.moveOutDate || ''}
                  onChange={(e) => setFilters({ ...filters, moveOutDate: e.target.value || null })}
                  className="w-full bg-white border border-border rounded-lg px-4 py-3 text-body text-slateGray"
                />
              </div>
            </div>

            {/* Quarter chips */}
            <ChipGroup
              options={quarterOptions}
              selected={filters.quarters}
              onChange={(quarters) => setFilters({ ...filters, quarters: quarters as Quarter[] })}
            />
          </div>

          {/* Budget */}
          <RangeSlider
            min={600}
            max={4000}
            step={50}
            value={filters.maxRent}
            onChange={(maxRent) => setFilters({ ...filters, maxRent })}
            formatValue={(v) => `${formatPrice(v)}/mo max`}
            label="Maximum Rent"
            minLabel="$600"
            maxLabel="$4,000+"
          />

          {/* Distance */}
          <RangeSlider
            min={0.1}
            max={4}
            step={0.1}
            value={filters.maxDistance}
            onChange={(maxDistance) => setFilters({ ...filters, maxDistance })}
            formatValue={(v) => `Within ${v.toFixed(1)} miles`}
            label="Distance from Campus"
            minLabel="0.1 miles"
            maxLabel="4 miles"
          />

          {/* Room Details */}
          <div className="space-y-6">
            <ChipGroup
              label="Room Type"
              options={roomTypeOptions}
              selected={filters.roomTypes}
              onChange={(roomTypes) => setFilters({ ...filters, roomTypes: roomTypes as RoomType[] })}
            />

            <ChipGroup
              label="Bathroom"
              options={bathroomOptions}
              selected={filters.bathroomTypes}
              onChange={(bathroomTypes) => setFilters({ ...filters, bathroomTypes: bathroomTypes as BathroomType[] })}
            />
          </div>

          {/* Roommate Preference */}
          <ChipGroup
            label="Roommate Preference"
            options={roommateOptions}
            selected={filters.roommatePreferences}
            onChange={(roommatePreferences) => setFilters({ ...filters, roommatePreferences: roommatePreferences as RoommatePreference[] })}
          />

          {/* Essentials */}
          <div className="space-y-4">
            <h3 className="text-h2 text-darkSlate">Essentials</h3>
            <div className="flex flex-wrap gap-2">
              {essentialOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => toggleAmenity(option.key)}
                  className={`px-4 py-2.5 rounded-xl border transition-colors ${
                    filters.amenities[option.key as keyof typeof filters.amenities]
                      ? 'bg-uclaBlue/10 border-uclaBlue text-uclaBlue font-medium'
                      : 'bg-white border-gray-200 text-slateGray hover:border-gray-300'
                  }`}
                >
                  <span className="text-body">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Appliances */}
          <div className="space-y-4">
            <h3 className="text-h2 text-darkSlate">Appliances</h3>
            <div className="flex flex-wrap gap-2">
              {applianceOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => toggleAmenity(option.key)}
                  className={`px-4 py-2.5 rounded-xl border transition-colors ${
                    filters.amenities[option.key as keyof typeof filters.amenities]
                      ? 'bg-uclaBlue/10 border-uclaBlue text-uclaBlue font-medium'
                      : 'bg-white border-gray-200 text-slateGray hover:border-gray-300'
                  }`}
                >
                  <span className="text-body">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="text-h2 text-darkSlate">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {amenityOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => toggleAmenity(option.key)}
                  className={`px-4 py-2.5 rounded-xl border transition-colors ${
                    filters.amenities[option.key as keyof typeof filters.amenities]
                      ? 'bg-uclaBlue/10 border-uclaBlue text-uclaBlue font-medium'
                      : 'bg-white border-gray-200 text-slateGray hover:border-gray-300'
                  }`}
                >
                  <span className="text-body">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Parking */}
          <div className="space-y-4">
            <h3 className="text-h2 text-darkSlate">Parking</h3>
            <div className="flex flex-wrap gap-2">
              {parkingOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => toggleAmenity(option.key)}
                  className={`px-4 py-2.5 rounded-xl border transition-colors ${
                    filters.amenities[option.key as keyof typeof filters.amenities]
                      ? 'bg-uclaBlue/10 border-uclaBlue text-uclaBlue font-medium'
                      : 'bg-white border-gray-200 text-slateGray hover:border-gray-300'
                  }`}
                >
                  <span className="text-body">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility */}
          <div className="space-y-4">
            <h3 className="text-h2 text-darkSlate">Accessibility</h3>
            <div className="bg-white border border-gray-100 rounded-lg p-4 space-y-4">
              {accessibilityOptions.map((option) => (
                <label key={option.key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-body text-slateGray">{option.label}</span>
                  <input
                    type="checkbox"
                    checked={!!filters.amenities[option.key as keyof typeof filters.amenities]}
                    onChange={() => toggleAmenity(option.key)}
                    className="w-5 h-5 rounded border-gray-300 text-uclaBlue focus:ring-uclaBlue"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Apply Button (Fixed) */}
        <div className="fixed bottom-0 left-0 right-0 p-6 pb-safe app-container">
          <button
            onClick={handleApply}
            className="w-full btn-primary py-4 rounded-xl text-h3 shadow-lg"
          >
            Apply Filters ({resultCount})
          </button>
        </div>
      </div>
    </div>
  );
}
