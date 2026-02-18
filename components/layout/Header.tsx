'use client';

import { useState } from 'react';
import Link from 'next/link';
import Icon from '../common/Icon';

interface HeaderProps {
  onFilterClick?: () => void;
  onSearchChange?: (query: string) => void;
  hideSearch?: boolean;
}

export default function Header({ onFilterClick, onSearchChange, hideSearch = false }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  return (
    <header className="blurHeaderLarge app-container">
      <div className="blurHeaderLargeContent">
        {/* Logo and List button */}
        <div className="flex items-center justify-between mb-1.5">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-uclaBlue rounded-lg p-1.5">
            <Icon name="graduationcap.fill" size={20} className="text-white" />
          </div>
          <h1 className="text-h1 text-uclaBlue">UCSubLA</h1>
        </Link>

        <Link
          href="/listing/new"
          className="bg-uclaBlue text-white rounded-[18px] px-2.5 py-1.5 flex items-center gap-1 text-small font-medium hover:bg-[#25579e] active:scale-95 transition-all duration-150"
        >
          <Icon name="plus" size={16} className="text-white" />
          <span>List</span>
        </Link>
      </div>

      {/* Search bar and filter button */}
      {!hideSearch && (
        <div className="flex items-center gap-0 bg-white border border-border rounded-full overflow-hidden">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search streets (e.g. Kelton)..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-transparent pl-9 pr-4 py-2 text-body text-slateGray placeholder:text-lightSlate focus:outline-none"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Icon name="search" size={18} className="text-lightSlate" strokeWidth={2} />
            </div>
          </div>

          <button
            onClick={onFilterClick}
            className="px-3 py-2 hover:bg-gray-50 transition-colors border-l border-border"
          >
            <Icon name="slider.horizontal.3" size={20} className="text-slateGray" strokeWidth={2} />
          </button>
        </div>
      )}
      </div>
    </header>
  );
}
