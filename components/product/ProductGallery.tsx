'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductImage } from '@/lib/types';
import { usePreferences } from '@/lib/hooks/usePreferences';

export interface ProductGalleryProps {
  images?: ProductImage[];
  productName: string;
  className?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images = [],
  productName,
  className = '',
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const { reducedMotion } = usePreferences();

  const count = images.length;

  const handleNext = useCallback(() => {
    if (count <= 1) return;
    setSelectedIndex((prev) => (prev + 1) % count);
  }, [count]);

  const handlePrev = useCallback(() => {
    if (count <= 1) return;
    setSelectedIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  // Touch Swipe Handlers for Mobile
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 40; // 40px minimum drag

    if (diff > threshold) {
      // Swiped left -> next
      handleNext();
    } else if (diff < -threshold) {
      // Swiped right -> prev
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Case 1: No images -> neutral placeholder
  if (!images || images.length === 0) {
    return (
      <div
        data-testid="gallery-placeholder"
        className={`w-full aspect-4/5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] flex flex-col items-center justify-center text-[var(--color-text-muted)] p-8 text-center ${className}`.trim()}
      >
        <ImageOff className="w-12 h-12 opacity-40 mb-3" aria-hidden="true" />
        <p className="text-body font-medium">{productName}</p>
        <span className="text-body-small mt-1 text-[var(--color-text-muted)]">
          No images available
        </span>
      </div>
    );
  }

  const currentImage = images[selectedIndex] || images[0];
  const transitionClasses = reducedMotion
    ? 'transition-none duration-0'
    : 'transition-opacity duration-250 motion-reduce:transition-none';

  return (
    <div
      data-testid="product-gallery"
      className={`flex flex-col gap-4 w-full select-none ${className}`.trim()}
    >
      {/* Main Image Container */}
      <div
        data-testid="gallery-main-container"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative aspect-4/5 w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] overflow-hidden group"
      >
        <Image
          key={currentImage.url}
          src={currentImage.url}
          alt={currentImage.alt || `${productName} view ${selectedIndex + 1}`}
          fill
          priority={selectedIndex === 0}
          loading={selectedIndex === 0 ? undefined : 'lazy'}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          className={`object-cover ${transitionClasses}`}
        />

        {/* Previous / Next buttons for mobile or hover assistance */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous gallery image"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-[var(--color-bg)]/85 text-[var(--color-text)] rounded-full border border-[var(--color-border)] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-[var(--color-bg)] cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next gallery image"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[var(--color-bg)]/85 text-[var(--color-text)] rounded-full border border-[var(--color-border)] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-[var(--color-bg)] cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row - Only displayed if more than 1 image exists */}
      {count > 1 && (
        <div
          role="region"
          aria-label="Image thumbnails"
          className="flex items-center gap-3 overflow-x-auto pb-1"
        >
          {images.map((img, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={img.url}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-label={`View image ${idx + 1} of ${count}: ${img.alt || productName}`}
                aria-pressed={isSelected}
                className={`relative aspect-square w-16 sm:w-20 rounded-[4px] overflow-hidden shrink-0 border-2 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] ${
                  isSelected
                    ? 'border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]'
                    : 'border-[var(--color-border)] opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
