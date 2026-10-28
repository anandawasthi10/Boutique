'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductSummary } from '@/lib/types';
import { formatCurrency } from '@/lib/format/currency';
import { usePreferences } from '@/lib/hooks/usePreferences';

export interface ProductCardProps {
  product: ProductSummary;
  headingLevel?: 'h2' | 'h3' | 'h4';
  className?: string;
  tone?: 'on-ivory' | 'on-tint';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  headingLevel = 'h3',
  className = '',
  tone = 'on-ivory',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { reducedMotion } = usePreferences();

  const images = (product.images || []).filter(
    (img) => img && img.url && !img.url.includes('placeholder.svg')
  );
  const hasImages = images.length > 0 && !imageError;
  const mainImage = images[0];
  const secondaryImage = images[1];

  const transitionClass = reducedMotion
    ? 'transition-none duration-0'
    : 'transition-opacity duration-300 motion-reduce:transition-none motion-reduce:duration-0';

  const imageContainerClass =
    tone === 'on-tint'
      ? 'relative aspect-4/5 w-full overflow-hidden bg-[var(--color-ivory)] rounded-[4px]'
      : 'relative aspect-4/5 w-full overflow-hidden bg-[var(--color-surface)] rounded-[4px] border border-[var(--color-border)]';

  const badge = (product as unknown as { badge?: string }).badge;

  return (
    <Link
      href={`/product/${product.slug}`}
      aria-label={`${product.name}, starting from ${formatCurrency(product.basePrice)}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={`group block text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-plum)] rounded-[4px] select-none ${className}`.trim()}
    >
      {/* 4:5 Aspect Ratio Container */}
      <div className={imageContainerClass}>
        {badge && (
          <span className="absolute top-2 left-2 z-10 px-2 py-0.5 text-[11px] font-medium bg-[var(--color-plum)] text-[var(--color-ivory)] rounded-[4px]">
            {badge}
          </span>
        )}
        {!hasImages ? (
          <div
            data-testid="missing-image-placeholder"
            className="w-full h-full flex flex-col items-center justify-center p-4 text-center select-none"
          >
            <span className="text-[12px] font-medium text-[var(--color-muted)]">Image coming soon</span>
          </div>
        ) : (
          <>
            <Image
              src={mainImage.url}
              alt={mainImage.alt || product.name}
              fill
              onError={() => setImageError(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover ${transitionClass} ${
                isHovered && secondaryImage ? 'opacity-0' : 'opacity-100'
              }`}
            />

            {secondaryImage && (
              <Image
                src={secondaryImage.url}
                alt={secondaryImage.alt || `${product.name} alternate view`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover ${transitionClass} ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}
          </>
        )}
      </div>

      {/* Info */}
      <div className="mt-3.5 flex flex-col gap-1">
        {React.createElement(
          headingLevel,
          {
            className:
              '!font-heading text-lg sm:text-xl font-medium text-[var(--color-ink)] [@media(hover:hover)]:group-hover:underline [@media(hover:hover)]:group-hover:decoration-[var(--color-plum)] underline-offset-4 line-clamp-2 decoration-1',
          },
          product.name
        )}
        <p className="text-price font-medium text-[var(--color-plum)]">
          From {formatCurrency(product.basePrice)}
        </p>
      </div>
    </Link>
  );
};
