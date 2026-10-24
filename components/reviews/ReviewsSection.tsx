'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Star, MessageSquareQuote, ExternalLink, Plus, Check } from 'lucide-react';
import { REVIEWS_DATA, ReviewItem } from './reviewsData';
import { RatingOverview, SpeedMode, ScrollDirection } from './RatingOverview';
import { ReviewsMarquee } from './ReviewsMarquee';
import { Button } from '@/components/ui/Button';

export const ReviewsSection: React.FC = () => {
  const [speed, setSpeed] = useState<SpeedMode>('fast'); // Default to fast lively pace
  const [direction, setDirection] = useState<ScrollDirection>('ltr'); // Default to Left-to-Right moving!
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newReviewSubmitted, setNewReviewSubmitted] = useState<boolean>(false);

  // Form state for writing a review
  const [authorName, setAuthorName] = useState('');
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewBody, setReviewBody] = useState('');

  const marqueeRef = useRef<HTMLDivElement | null>(null);

  // Filter reviews based on user selection
  const filteredReviews = useMemo(() => {
    switch (activeFilter) {
      case '5star':
        return REVIEWS_DATA.filter((r) => r.rating === 5);
      case 'custom':
        return REVIEWS_DATA.filter(
          (r) =>
            r.categoryTag.toLowerCase().includes('custom') ||
            r.content.toLowerCase().includes('measurements') ||
            r.content.toLowerCase().includes('fit') ||
            r.content.toLowerCase().includes('stitched')
        );
      case 'localguide':
        return REVIEWS_DATA.filter((r) => r.isLocalGuide);
      case 'all':
      default:
        return REVIEWS_DATA;
    }
  }, [activeFilter]);

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handlePrev = () => {
    if (marqueeRef.current) {
      marqueeRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (marqueeRef.current) {
      marqueeRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  const handleNewReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !reviewBody.trim()) return;

    const newRev: ReviewItem = {
      id: `user-${Date.now()}`,
      author: authorName.trim(),
      meta: '1 review · Verified Customer',
      rating: ratingVal,
      timeAgo: 'Just now',
      avatarText: authorName.charAt(0).toUpperCase(),
      avatarBg: 'bg-emerald-600',
      content: reviewBody.trim(),
      initialLikes: 0,
      categoryTag: 'Customer Review',
      verified: true,
    };

    REVIEWS_DATA.unshift(newRev);
    setNewReviewSubmitted(true);
    setTimeout(() => {
      setNewReviewSubmitted(false);
      setIsModalOpen(false);
      setAuthorName('');
      setReviewBody('');
      setRatingVal(5);
    }, 1800);
  };

  return (
    <section
      id="reviews-section"
      className="w-full py-12 md:py-20 bg-[var(--color-primary)] text-[var(--color-on-primary)] border-y border-[var(--color-border)] overflow-hidden"
      aria-label="Client Ratings and Reviews"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col gap-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/15 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-plum-raised)] border border-white/20 rounded-full">
              <Star className="w-3.5 h-3.5 text-[var(--color-accent)] fill-[var(--color-accent)]" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-on-primary)]">
                Verified Google Reviews
              </span>
            </div>
            <h2 className="text-h1 text-[var(--color-on-primary)] font-normal tracking-tight">
              Ratings & Reviews
            </h2>
            <p className="text-body text-[var(--color-on-primary)]/80 max-w-xl">
              Authentic stories from clients who trust Jyoti & Sakshi for bespoke tailoring,
              outfit styling, and artisanal craft.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-on-primary)] text-[var(--color-primary)] text-xs font-semibold hover:bg-[var(--color-surface)] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-white/20 bg-[var(--color-plum-raised)] text-[var(--color-on-primary)] text-xs font-medium hover:bg-white/10 transition-colors"
            >
              <span>View on Google</span>
              <ExternalLink className="w-3.5 h-3.5 text-[var(--color-on-primary)]/70" />
            </a>
          </div>
        </div>

        {/* 4.3 Star Rating Overview & Controls */}
        <RatingOverview
          currentSpeed={speed}
          onSpeedChange={setSpeed}
          direction={direction}
          onDirectionChange={setDirection}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          onPrev={handlePrev}
          onNext={handleNext}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          totalFilteredCount={filteredReviews.length}
        />

        {/* Continuous Left-to-Right Moving Reviews Marquee */}
        <ReviewsMarquee
          reviews={filteredReviews}
          speed={speed}
          direction={direction}
          isPaused={isPaused}
          pauseOnHover={false}
          containerRef={marqueeRef}
        />
      </div>

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 shadow-2xl relative text-[var(--color-text)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <MessageSquareQuote className="w-5 h-5 text-[var(--color-accent-text)]" />
                <h3 className="text-h3 font-medium">Leave a Review</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-xl font-bold p-1"
                aria-label="Close review dialog"
              >
                ✕
              </button>
            </div>

            {newReviewSubmitted ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-primary)]">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-lg font-medium">Thank You!</h4>
                <p className="text-xs text-[var(--color-text-muted)] max-w-xs">
                  Your review has been verified and added to the customer showcase.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNewReviewSubmit} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Nikita, Priya, Ritu"
                    className="w-full px-3.5 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-sm focus:outline-hidden focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingVal(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= ratingVal
                              ? 'fill-[var(--color-accent)] text-[var(--color-accent)]'
                              : 'fill-transparent text-[var(--color-border)]'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-medium text-[var(--color-text-muted)] ml-2">
                      {ratingVal} Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                    Your Experience
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                    placeholder="Share your thoughts about Jyoti & Sakshi's designs, fitting, fabric quality, and service..."
                    className="w-full px-3.5 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-sm focus:outline-hidden focus:border-[var(--color-primary)] resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  >
                    Cancel
                  </button>
                  <Button variant="primary" type="submit">
                    Submit Review
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
