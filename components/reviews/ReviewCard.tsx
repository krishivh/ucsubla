'use client';

import { useState } from 'react';
import { formatTimestamp } from '@/lib/utils';
import type { Review } from '@/lib/types';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 100;
  const shouldTruncate = review.text.length > maxLength;
  const displayText = isExpanded || !shouldTruncate
    ? review.text
    : `${review.text.substring(0, maxLength)}...`;

  const sourceIcon = review.source === 'reddit' ? 'r' : 'B';
  const sourceColor = review.source === 'reddit' ? 'bg-orange-500' : 'bg-blue-500';
  const sourceLabel = review.source === 'reddit' ? 'Reddit' : 'Bruinwalk';

  return (
    <div className="card shadow-minimal p-4">
      {/* Source header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`${sourceColor} w-6 h-6 rounded-full flex items-center justify-center`}>
            <span className="text-white text-xs font-bold">{sourceIcon}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-small text-darkSlate font-medium">
              {review.sourceName}
            </span>
            <a
              href={review.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-tiny text-uclaBlue hover:underline"
            >
              View on {sourceLabel}
            </a>
          </div>
        </div>
        <span className="text-small text-slateGray">
          {formatTimestamp(review.timestamp)}
        </span>
      </div>

      {/* Review text */}
      <p className="text-body text-slateGray leading-relaxed">
        &quot;{displayText}&quot;
      </p>

      {/* Read more button */}
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-small text-uclaBlue font-medium mt-2 hover:underline"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}
