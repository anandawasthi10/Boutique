'use client';

import React, { useRef, useMemo } from 'react';
import { ReviewItem } from './reviewsData';
import { ReviewCard } from './ReviewCard';
import { SpeedMode, ScrollDirection } from './RatingOverview';

interface ReviewsMarqueeProps {
  reviews: ReviewItem[];
  speed: SpeedMode;
  direction?: ScrollDirection;
  isPaused: boolean;
  pauseOnHover?: boolean;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export const ReviewsMarquee: React.FC<ReviewsMarqueeProps> = ({
  reviews,
  speed,
  direction = 'ltr',
  isPaused,
  pauseOnHover = false,
  containerRef: externalContainerRef,
}) => {
  const localContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = externalContainerRef || localContainerRef;

  // Speeds in seconds for a full 50% loop
  // 'fast': 18s (lively smooth continuous scroll)
  // 'turbo': 10s (ultra fast)
  // 'normal': 32s (relaxed leisurely reading pace)
  const durationMap: Record<SpeedMode, number> = {
    turbo: 10,
    fast: 18,
    normal: 32,
  };

  const durationSec = durationMap[speed] || 18;

  // Ensure each group has at least 8 items so even filtered views (e.g. 2 reviews)
  // comfortably fill the widest screens with zero blank gaps before looping.
  const groupItems = useMemo(() => {
    if (!reviews || reviews.length === 0) return [];
    let items = [...reviews];
    while (items.length < 8) {
      items = [...items, ...reviews];
    }
    return items;
  }, [reviews]);

  return (
    <div className="relative w-full overflow-hidden py-4 select-none">
      <style>{`
        @keyframes marquee-scroll-ltr {
          0% {
            transform: translate3d(-50%, 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes marquee-scroll-rtl {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .reviews-marquee-track {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: marquee-scroll-ltr var(--marquee-duration, 18s) linear infinite;
        }
        .reviews-marquee-track.direction-ltr {
          animation-name: marquee-scroll-ltr;
        }
        .reviews-marquee-track.direction-rtl {
          animation-name: marquee-scroll-rtl;
        }
        .reviews-marquee-track.pause-on-card-hover:hover {
          animation-play-state: paused;
        }
        .reviews-marquee-track.is-paused {
          animation-play-state: paused !important;
        }
      `}</style>

      {/* Left and Right gradient fades for luxury boutique depth */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-24 z-10 bg-gradient-to-r from-[var(--color-bg)] to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-24 z-10 bg-gradient-to-l from-[var(--color-bg)] to-transparent"
        aria-hidden="true"
      />

      {/* Marquee Wrapper */}
      <div
        ref={scrollContainerRef}
        className="reviews-marquee-container w-full overflow-x-hidden no-scrollbar"
        tabIndex={0}
        aria-label="Continuous auto-scrolling customer reviews moving left to right"
      >
        <div
          className={`reviews-marquee-track direction-${direction} py-2 ${
            isPaused ? 'is-paused' : ''
          } ${pauseOnHover ? 'pause-on-card-hover' : ''}`}
          style={
            {
              '--marquee-duration': `${durationSec}s`,
            } as React.CSSProperties
          }
        >
          {/* Group 1: Base stream */}
          <div className="flex shrink-0 items-stretch gap-5 pr-5">
            {groupItems.map((review, idx) => (
              <ReviewCard
                key={`g1-${review.id}-${idx}`}
                review={review}
                className="shrink-0"
              />
            ))}
          </div>

          {/* Group 2: Cloned stream for 100% gapless continuous infinite loop */}
          <div className="flex shrink-0 items-stretch gap-5 pr-5" aria-hidden="true">
            {groupItems.map((review, idx) => (
              <ReviewCard
                key={`g2-${review.id}-${idx}`}
                review={review}
                className="shrink-0"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Status hint for user */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 text-xs text-[var(--color-text-muted)] flex-wrap px-4">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-[var(--color-text)]">
            Continuous Stream
          </span>
          <span className="text-amber-500 font-medium">
            ({direction === 'ltr' ? 'Moving Left → Right' : 'Moving Right → Left'})
          </span>
        </div>
        <span className="hidden sm:inline opacity-30">•</span>
        <span className="hidden sm:inline">Use controls above to toggle direction, speed or pause</span>
      </div>
    </div>
  );
};
