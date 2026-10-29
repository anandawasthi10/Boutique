'use client';

import React from 'react';
import { Star, Sparkles, Zap, Play, Pause, ChevronLeft, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';
import { RATING_SUMMARY } from './reviewsData';

export type SpeedMode = 'turbo' | 'fast' | 'normal';
export type ScrollDirection = 'ltr' | 'rtl';

interface RatingOverviewProps {
  currentSpeed: SpeedMode;
  onSpeedChange: (speed: SpeedMode) => void;
  direction?: ScrollDirection;
  onDirectionChange?: (dir: ScrollDirection) => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onPrev: () => void;
  onNext: () => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  totalFilteredCount: number;
}

export const RatingOverview: React.FC<RatingOverviewProps> = ({
  currentSpeed,
  onSpeedChange,
  direction = 'ltr',
  onDirectionChange,
  isPaused,
  onTogglePause,
  onPrev,
  onNext,
  activeFilter,
  onFilterChange,
  totalFilteredCount,
}) => {
  const filters = [
    { id: 'all', label: 'All Reviews' },
    { id: '5star', label: '5-Star Loved' },
    { id: 'custom', label: 'Custom Tailoring' },
    { id: 'localguide', label: 'Local Guides' },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Banner / Rating Summary Box */}
      <div className="bg-[var(--color-plum-raised)] rounded-[4px] p-6 sm:p-8 text-[var(--color-ivory)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main 4.3 Score Column */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center sm:items-start text-center sm:text-left gap-4 border-b lg:border-b-0 lg:border-r border-[rgba(251,247,244,0.20)] pb-6 lg:pb-0 lg:pr-8">
            <div className="flex items-center gap-3">
              <span className="text-5xl sm:text-6xl font-heading font-medium text-[var(--color-ivory)] tracking-tight">
                4.3
              </span>
              <div className="flex flex-col items-start">
                <div
                  className="flex items-center gap-1 text-[var(--color-rose-light)]"
                  role="img"
                  aria-label="4.3 out of 5 stars"
                >
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[var(--color-rose-light)] stroke-[var(--color-rose-light)]" />
                  ))}
                  {/* Partial 0.3 star visual */}
                  <div className="relative w-5 h-5">
                    <Star className="w-5 h-5 text-[rgba(251,247,244,0.22)] fill-[rgba(251,247,244,0.22)] stroke-[rgba(251,247,244,0.22)]" />
                    <div className="absolute inset-0 overflow-hidden w-[40%]">
                      <Star className="w-5 h-5 text-[var(--color-rose-light)] fill-[var(--color-rose-light)] stroke-[var(--color-rose-light)]" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  {/* Google G icon */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-[var(--color-ivory)] tracking-wider uppercase">
                    Google Reviews
                  </span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--color-ivory)]">
                Rated <span className="font-semibold text-[var(--color-ivory)]">4.3 / 5.0</span>
              </p>
              <p className="text-xs text-[rgba(251,247,244,0.78)] mt-0.5">
                Based on {RATING_SUMMARY.totalReviews} verified reviews
              </p>
            </div>
          </div>

          {/* Breakdown Bars Column */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-1.5 border-b lg:border-b-0 lg:border-r border-[rgba(251,247,244,0.20)] pb-6 lg:pb-0 lg:pr-8">
            {RATING_SUMMARY.distribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-3 text-xs">
                <span className="w-8 font-medium text-[rgba(251,247,244,0.82)] text-right">
                  {item.stars} ★
                </span>
                <div className="flex-1 h-2 bg-[rgba(251,247,244,0.22)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-rose-light)] rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="w-10 text-[rgba(251,247,244,0.82)] text-right font-medium">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>

          {/* Highlights Column */}
          <div className="lg:col-span-3 flex flex-col justify-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-rose-pale)]">
              Customer Highlights
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-[var(--color-ivory)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-rose-light)] shrink-0" />
                <span>Custom Phone Measurements & Sizing</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--color-ivory)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-rose-light)] shrink-0" />
                <span>Jyoti & Sakshi Personal Consultations</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--color-ivory)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-rose-light)] shrink-0" />
                <span>Indian, Western & Indo-Western Fits</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--color-ivory)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-rose-light)] shrink-0" />
                <span>Premium Quality Fabric & Fast Service</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters + Speed Controls + Manual Navigation */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Filter Pills: Single horizontally scrollable row */}
        <div className="w-full lg:w-auto overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-2 flex-nowrap w-max">
            {filters.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onFilterChange(tab.id)}
                className={`text-xs px-4 min-h-[44px] rounded-full transition-colors shrink-0 inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ivory)] ${
                  activeFilter === tab.id
                    ? 'bg-[var(--color-ivory)] text-[var(--color-plum)] font-medium border border-[var(--color-ivory)]'
                    : 'bg-transparent text-[var(--color-ivory)] border border-[rgba(251,247,244,0.45)] [@media(hover:hover)]:hover:border-[var(--color-ivory)]'
                }`}
              >
                {tab.label}
                {activeFilter === tab.id && ` (${totalFilteredCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Speed Controls & Navigation Controls */}
        <div className="flex items-center justify-end gap-3 w-full lg:w-auto ml-auto">
          {/* Speed Preset Selector - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:inline-flex items-center bg-transparent border border-[rgba(251,247,244,0.45)] rounded-[4px] p-1 text-xs">
            <span className="px-2 text-[11px] font-semibold text-[rgba(251,247,244,0.82)] uppercase tracking-wider">
              Speed:
            </span>
            <button
              type="button"
              onClick={() => onSpeedChange('fast')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ivory)] ${
                currentSpeed === 'fast'
                  ? 'bg-[var(--color-ivory)] text-[var(--color-plum)] font-medium'
                  : 'text-[rgba(251,247,244,0.82)] [@media(hover:hover)]:hover:text-[var(--color-ivory)]'
              }`}
              title="Fast auto scroll"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>Fast</span>
            </button>
            <button
              type="button"
              onClick={() => onSpeedChange('turbo')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ivory)] ${
                currentSpeed === 'turbo'
                  ? 'bg-[var(--color-ivory)] text-[var(--color-plum)] font-medium'
                  : 'text-[rgba(251,247,244,0.82)] [@media(hover:hover)]:hover:text-[var(--color-ivory)]'
              }`}
              title="Ultra fast auto scroll"
            >
              <Sparkles className="w-3 h-3" />
              <span>Turbo</span>
            </button>
            <button
              type="button"
              onClick={() => onSpeedChange('normal')}
              className={`px-2.5 py-1.5 rounded-[4px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ivory)] ${
                currentSpeed === 'normal'
                  ? 'bg-[var(--color-ivory)] text-[var(--color-plum)] font-medium'
                  : 'text-[rgba(251,247,244,0.82)] [@media(hover:hover)]:hover:text-[var(--color-ivory)]'
              }`}
              title="Relaxed pace"
            >
              <span>Normal</span>
            </button>
          </div>

          {/* Direction Selector (Flow) - Hidden on mobile, visible on desktop */}
          {onDirectionChange && (
            <button
              type="button"
              onClick={() => onDirectionChange(direction === 'ltr' ? 'rtl' : 'ltr')}
              className="hidden lg:flex items-center gap-1.5 px-3 min-h-[44px] rounded-[4px] border border-[rgba(251,247,244,0.45)] bg-transparent text-xs font-medium text-[var(--color-ivory)] [@media(hover:hover)]:hover:border-[var(--color-ivory)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ivory)]"
              title={
                direction === 'ltr'
                  ? 'Currently scrolling Left → Right (Click to switch)'
                  : 'Currently scrolling Right → Left (Click to switch)'
              }
              aria-label="Toggle scroll direction"
            >
              <ArrowRight
                className={`w-3.5 h-3.5 transition-transform duration-300 ${
                  direction === 'rtl' ? 'rotate-180' : ''
                }`}
              />
              <span>Flow:</span>
              <span>{direction === 'ltr' ? 'Left → Right' : 'Right → Left'}</span>
            </button>
          )}

          {/* Pause / Play Toggle (Visible on mobile & desktop) */}
          <button
            type="button"
            onClick={onTogglePause}
            className={`min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-2 rounded-[4px] border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ivory)] ${
              isPaused
                ? 'bg-[var(--color-ivory)] text-[var(--color-plum)] border-[var(--color-ivory)] font-medium'
                : 'bg-transparent text-[var(--color-ivory)] border-[rgba(251,247,244,0.45)] [@media(hover:hover)]:hover:border-[var(--color-ivory)]'
            }`}
            title={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
            aria-label={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Left / Right manual scroll nudge */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onPrev}
              className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-2 rounded-[4px] bg-transparent border border-[rgba(251,247,244,0.45)] text-[var(--color-ivory)] [@media(hover:hover)]:hover:border-[var(--color-ivory)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ivory)]"
              title="Scroll left"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center p-2 rounded-[4px] bg-transparent border border-[rgba(251,247,244,0.45)] text-[var(--color-ivory)] [@media(hover:hover)]:hover:border-[var(--color-ivory)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ivory)]"
              title="Scroll right"
              aria-label="Next review"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
