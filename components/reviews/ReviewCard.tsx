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
      className={`group relative flex flex-col justify-between w-[340px] sm:w-[380px] shrink-0 bg-[#1E222A] text-white rounded-xl p-5 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:border-amber-400/40 hover:shadow-[0_12px_36px_rgba(245,158,11,0.12)] transition-all duration-300 select-none ${className}`}
      data-testid={`review-card-${review.id}`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="relative shrink-0">
              {review.avatarImage ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20">
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
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-base ${review.avatarBg || 'bg-slate-700'}`}
                >
                  {review.avatarText || review.author.charAt(0)}
                </div>
              )}

              {/* Local Guide Star Badge */}
              {review.isLocalGuide && (
                <div
                  title="Local Guide"
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#FBBC04] flex items-center justify-center text-[#1E222A] shadow-sm border border-[#1E222A]"
                >
                  <Star className="w-2.5 h-2.5 fill-current" />
                </div>
              )}
            </div>

            {/* Author info */}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-[15px] text-white tracking-wide">
                  {review.author}
                </span>
              </div>
              <p className="text-[12px] text-gray-400 leading-tight line-clamp-1">
                {review.meta}
              </p>
            </div>
          </div>

          {/* Right menu / Google icon */}
          <div className="relative flex items-center gap-1">
            <svg
              className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity"
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
              className="p-1 text-gray-400 hover:text-white rounded hover:bg-white/10 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-7 z-20 w-36 bg-[#282D37] border border-white/15 rounded-md shadow-xl py-1 text-xs text-gray-200">
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full text-left px-3 py-1.5 hover:bg-white/10 flex items-center gap-2"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy Review</span>
                </button>
                <div className="px-3 py-1 text-[11px] text-gray-400 border-t border-white/10 mt-1">
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
                    : 'fill-transparent text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-[12px] text-gray-400 font-normal">
            {review.timeAgo}
          </span>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-amber-300/80 font-medium tracking-wide">
            {review.categoryTag}
          </span>
        </div>

        {/* Review Content */}
        <div className="mt-2 text-[13.5px] leading-relaxed text-gray-200 font-normal">
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
              className="inline-block ml-1.5 text-xs text-sky-400 hover:text-sky-300 font-medium underline underline-offset-2"
            >
              {isExpanded ? 'Show less' : 'More'}
            </button>
          )}
        </div>
      </div>

      {/* Footer Reaction Bar */}
      <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-4">
          {/* Heart button */}
          <button
            type="button"
            onClick={handleLike}
            aria-label="React with heart"
            className="group/btn flex items-center gap-1.5 py-1 px-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <Heart
              className={`w-4 h-4 transition-transform group-hover/btn:scale-110 ${
                liked
                  ? 'fill-rose-500 text-rose-500'
                  : 'text-gray-400 hover:text-rose-400'
              }`}
            />
            <span className={liked ? 'text-rose-400 font-medium' : 'text-gray-400'}>
              {likeCount > 0 ? likeCount : 'Hover to react'}
            </span>
          </button>

          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share review"
            className="flex items-center gap-1 py-1 px-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Verified boutique client label */}
        <div className="flex items-center gap-1 text-[11px] text-gray-400 font-normal">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Verified Client</span>
        </div>
      </div>
    </div>
  );
};
