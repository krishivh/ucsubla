'use client';

import { useState, useEffect } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  label?: string;
  minLabel?: string;
  maxLabel?: string;
}

export default function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue = (v) => v.toString(),
  label,
  minLabel,
  maxLabel,
}: RangeSliderProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setLocalValue(newValue);
  };

  const handleMouseUp = () => {
    onChange(localValue);
  };

  const percentage = ((localValue - min) / (max - min)) * 100;

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between">
          <h3 className="text-h2 text-darkSlate">{label}</h3>
          <p className="text-body text-[#94A3B8]">{formatValue(localValue)}</p>
        </div>
      )}

      {/* Slider */}
      <div className="relative pt-2 pb-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #2d68c4 0%, #2d68c4 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
          }}
        />
      </div>

      {/* Min/Max labels */}
      {(minLabel || maxLabel) && (
        <div className="flex items-center justify-between text-small text-slateGray">
          <span>{minLabel || min}</span>
          <span>{maxLabel || `${max}+`}</span>
        </div>
      )}

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          border: 2px solid #2d68c4;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .slider-thumb::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          border: 2px solid #2d68c4;
          cursor: pointer;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
