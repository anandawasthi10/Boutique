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
  const desktopContainerRef = useRef<HTMLDivElement | null>(null);
  const mobileContainerRef = useRef<HTMLDivElement | null>(null);

  // Synchronize external ref so that handlePrev/handleNext scrolls the active container
  React.useEffect(() => {
    if (!externalContainerRef) return;
    const target = {
      scrollBy: (options: ScrollToOptions) => {
        if (window.innerWidth >= 1024) {
          desktopContainerRef.current?.scrollBy(options);
        } else {
          mobileContainerRef.current?.scrollBy(options);
        }
      },
    };
    (externalContainerRef as any).current = target;
  }, [externalContainerRef]);

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

      {/* MOBILE ONLY: Manual swipeable row, 85vw wide cards, snap alignment */}
      <div
        ref={mobileContainerRef}
        className="lg:hidden w-full overflow-x-auto no-scrollbar snap-x snap-mandatory flex gap-4 py-2"
        tabIndex={0}
        aria-label="Customer reviews swipeable row"
      >
        {reviews.map((review, idx) => (
          <div
            key={`mobile-rev-${review.id}-${idx}`}
            className="w-[85vw] max-w-[360px] shrink-0 snap-center"
          >
            <ReviewCard review={review} className="w-full h-full" />
          </div>
        ))}
      </div>

      {/* DESKTOP ONLY: Left and Right gradient fades for luxury boutique depth */}
      <div
        className="hidden lg:block pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[var(--color-primary)] to-transparent"
        aria-hidden="true"
      />
      <div
        className="hidden lg:block pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[var(--color-primary)] to-transparent"
        aria-hidden="true"
      />

      {/* DESKTOP ONLY: Continuous Marquee Wrapper */}
      <div
        ref={desktopContainerRef}
        className="hidden lg:block reviews-marquee-container w-full overflow-x-hidden no-scrollbar"
        tabIndex={0}
        aria-label="Continuous auto-scrolling customer reviews moving left to right"
      >
        <div
          className={`reviews-marquee-track direction-${direction} py-4 ${
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
          <div
            className="flex shrink-0 items-stretch gap-5 pr-5"
            aria-hidden="true"
            inert={true}
          >
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

      {/* Desktop status hint */}
      <div className="hidden lg:flex items-center justify-center gap-3 mt-3 text-xs text-[var(--color-on-primary)]/80 flex-wrap px-4">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-[var(--color-on-primary)]">
            Continuous Stream
          </span>
          <span className="text-[var(--color-accent)] font-medium">
            ({direction === 'ltr' ? 'Moving Left → Right' : 'Moving Right → Left'})
          </span>
        </div>
        <span className="opacity-30">•</span>
        <span>Use controls above to toggle direction, speed or pause</span>
      </div>
    </div>
  );
};
