'use client';

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
      {/* Top Banner / Rating Cards Grid */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-soft)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main 4.3 Score Column */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center sm:items-start text-center sm:text-left gap-4 border-b lg:border-b-0 lg:border-r border-[var(--color-border)] pb-6 lg:pb-0 lg:pr-8">
            <div className="flex items-center gap-3">
              <span className="text-5xl sm:text-6xl font-serif font-bold text-[var(--color-text)] tracking-tight">
                4.3
              </span>
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1 text-[#F59E0B]" aria-label="4.3 out of 5 stars">
                  {[...Array(4)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current stroke-current" />
                  ))}
                  {/* Partial 0.3 star visual */}
                  <div className="relative w-5 h-5">
                    <Star className="w-5 h-5 text-gray-300 fill-gray-200 stroke-gray-300" />
                    <div className="absolute inset-0 overflow-hidden w-[40%]">
                      <Star className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B] stroke-[#F59E0B]" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  {/* Google G icon */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  <span className="text-xs font-semibold text-[var(--color-text)] tracking-wider uppercase">
                    Google Reviews
                  </span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">
                Rated <span className="font-semibold text-amber-700">4.3 / 5.0</span> by happy clients
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Based on {RATING_SUMMARY.totalReviews} verified reviews & testimonials
              </p>
            </div>
          </div>

          {/* Breakdown Bars Column */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-1.5 border-b lg:border-b-0 lg:border-r border-[var(--color-border)] pb-6 lg:pb-0 lg:pr-8">
            {RATING_SUMMARY.distribution.map((item) => (
              <div key={item.stars} className="flex items-center gap-3 text-xs">
                <span className="w-8 font-medium text-[var(--color-text)] text-right">
                  {item.stars} ★
                </span>
                <div className="flex-1 h-2 bg-[var(--color-bg)] rounded-full overflow-hidden border border-[var(--color-border)]">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="w-10 text-[var(--color-text-muted)] text-right font-medium">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>

          {/* Highlights Column */}
          <div className="lg:col-span-3 flex flex-col justify-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Customer Highlights
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-[var(--color-text)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Custom Phone Measurements & Sizing</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--color-text)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Jyoti & Sakshi Personal Consultations</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--color-text)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Indian, Western & Indo-Western Fits</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--color-text)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Premium Quality Fabric & Fast Service</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters + Fast Speed Controls + Manual Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterChange(tab.id)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-all ${
                activeFilter === tab.id
                  ? 'bg-[var(--color-text)] text-[var(--color-bg)] shadow-sm'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]'
              }`}
            >
              {tab.label}
              {activeFilter === tab.id && ` (${totalFilteredCount})`}
            </button>
          ))}
        </div>

        {/* Speed Controls & Navigation Controls */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Speed Preset Selector */}
          <div className="inline-flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-1 text-xs">
            <span className="px-2 text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider hidden sm:inline">
              Speed:
            </span>
            <button
              type="button"
              onClick={() => onSpeedChange('fast')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                currentSpeed === 'fast'
                  ? 'bg-amber-500 text-stone-900 font-bold shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
              title="Fast auto scroll"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>Fast</span>
            </button>
            <button
              type="button"
              onClick={() => onSpeedChange('turbo')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                currentSpeed === 'turbo'
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
              title="Ultra fast auto scroll"
            >
              <Sparkles className="w-3 h-3" />
              <span>Turbo</span>
            </button>
            <button
              type="button"
              onClick={() => onSpeedChange('normal')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                currentSpeed === 'normal'
                  ? 'bg-[var(--color-text)] text-[var(--color-bg)] font-medium shadow-xs'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
              title="Relaxed pace"
            >
              <span>Normal</span>
            </button>
          </div>

          {/* Direction Selector */}
          {onDirectionChange && (
            <button
              type="button"
              onClick={() => onDirectionChange(direction === 'ltr' ? 'rtl' : 'ltr')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                direction === 'ltr'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 shadow-xs'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-alt)]'
              }`}
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
              <span className="hidden sm:inline">Flow:</span>
              <span>{direction === 'ltr' ? 'Left → Right' : 'Right → Left'}</span>
            </button>
          )}

          {/* Pause / Play Toggle */}
          <button
            type="button"
            onClick={onTogglePause}
            className={`p-2 rounded-lg border border-[var(--color-border)] transition-colors ${
              isPaused
                ? 'bg-amber-500 text-stone-900 font-bold'
                : 'bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-alt)]'
            }`}
            title={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
            aria-label={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Left / Right manual scroll nudge */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onPrev}
              className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] transition-colors"
              title="Scroll left"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] transition-colors"
              title="Scroll right"
              aria-label="Next review"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
