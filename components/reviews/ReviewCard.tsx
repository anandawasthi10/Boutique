'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Heart, Share2, MoreVertical, Check, Sparkles } from 'lucide-react';
import { ReviewItem } from './reviewsData';

interface ReviewCardProps {
  review: ReviewItem;
  className?: string;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, className = '' }) => {
  const [liked, setLiked] = useState<boolean>(Boolean(review.isInitiallyHearted));
  const [likeCount, setLikeCount] = useState<number>(review.initialLikes);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) {
      setLiked(false);
      setLikeCount((prev) => Math.max(0, prev - 1));
    } else {
      setLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = `"${review.content}" — ${review.author} on Boutique (Google Review)`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isLong = review.content.length > 150;
  const displayedContent = isLong && !isExpanded
    ? review.content.slice(0, 140) + '...'
    : review.content;

  return (
    <div
      className={`group relative flex flex-col justify-between w-[340px] sm:w-[380px] shrink-0 bg-white text-stone-900 rounded-2xl p-5 sm:p-6 border border-stone-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_36px_rgba(217,119,6,0.12)] hover:border-amber-400/60 transition-all duration-300 select-none hover:-translate-y-1.5 overflow-hidden ${className}`}
      data-testid={`review-card-${review.id}`}
    >
      {/* Top golden gradient accent on hover */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Subtle ambient warm glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl group-hover:bg-amber-400/15 transition-all duration-500" />

      {/* Top Header */}
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative shrink-0">
              {review.avatarImage ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-stone-200 shadow-xs">
                  <Image
                    src={review.avatarImage}
                    alt={review.author}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-base shadow-xs ${review.avatarBg || 'bg-stone-700'}`}
                >
                  {review.avatarText || review.author.charAt(0)}
                </div>
              )}

              {/* Local Guide Star Badge */}
              {review.isLocalGuide && (
                <div
                  title="Local Guide"
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#FBBC04] flex items-center justify-center text-stone-900 shadow-xs border-2 border-white"
                >
                  <Star className="w-2.5 h-2.5 fill-current" />
                </div>
              )}
            </div>

            {/* Author info */}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[15px] text-stone-900 tracking-tight group-hover:text-amber-800 transition-colors">
                  {review.author}
                </span>
              </div>
              <p className="text-[12px] text-stone-500 leading-tight line-clamp-1">
                {review.meta}
              </p>
            </div>
          </div>

          {/* Right menu / Google icon */}
          <div className="relative flex items-center gap-1">
            <svg
              className="w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity"
              viewBox="0 0 24 24"
              aria-label="Google Review"
            >
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

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              aria-label="Review options"
              className="p-1 text-stone-400 hover:text-stone-700 rounded hover:bg-stone-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-7 z-20 w-36 bg-white border border-stone-200 rounded-lg shadow-xl py-1 text-xs text-stone-700">
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full text-left px-3 py-1.5 hover:bg-stone-50 flex items-center gap-2 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy Review</span>
                </button>
                <div className="px-3 py-1 text-[11px] text-stone-400 border-t border-stone-100 mt-1">
                  Google Verified
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stars and Date */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < review.rating
                    ? 'fill-[#FBBC04] text-[#FBBC04]'
                    : 'fill-transparent text-stone-300'
                }`}
              />
            ))}
          </div>
          <span className="text-[12px] text-stone-500 font-medium">
            {review.timeAgo}
          </span>
          <span className="ml-auto text-[10.5px] px-2.5 py-0.5 rounded-full bg-stone-50 border border-stone-200/80 text-stone-700 group-hover:bg-amber-50 group-hover:text-amber-900 group-hover:border-amber-200/80 font-medium tracking-wide transition-colors">
            {review.categoryTag}
          </span>
        </div>

        {/* Review Content */}
        <div className="mt-2 text-[13.5px] leading-relaxed text-stone-700 font-normal">
          <p className="inline">
            {displayedContent}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="inline-block ml-1.5 text-xs text-amber-700 hover:text-amber-800 font-medium underline underline-offset-2"
            >
              {isExpanded ? 'Show less' : 'More'}
            </button>
          )}
        </div>
      </div>

      {/* Footer Reaction Bar */}
      <div className="relative z-10 pt-3.5 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-3">
          {/* Heart button */}
          <button
            type="button"
            onClick={handleLike}
            aria-label="React with heart"
            className="group/btn flex items-center gap-1.5 py-1 px-2.5 rounded-full hover:bg-stone-50 transition-colors"
          >
            <Heart
              className={`w-4 h-4 transition-transform group-hover/btn:scale-110 ${
                liked
                  ? 'fill-rose-500 text-rose-500'
                  : 'text-stone-400 group-hover/btn:text-rose-500'
              }`}
            />
            <span className={liked ? 'text-rose-600 font-medium' : 'text-stone-600'}>
              {likeCount > 0 ? likeCount : 'Helpful'}
            </span>
          </button>

          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share review"
            className="flex items-center gap-1 py-1 px-2.5 rounded-full hover:bg-stone-50 transition-colors text-stone-400 hover:text-stone-700"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] text-emerald-600 font-medium">Copied!</span>
              </>
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Verified boutique client label */}
        <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Verified Client</span>
        </div>
      </div>
    </div>
  );
};
