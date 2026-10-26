'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { ProductSummary } from '@/lib/types';
import { formatCurrency } from '@/lib/format/currency';
import { usePreferences } from '@/lib/hooks/usePreferences';

export interface ProductCardProps {
  product: ProductSummary;
  headingLevel?: 'h2' | 'h3' | 'h4';
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  headingLevel = 'h3',
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { reducedMotion } = usePreferences();

  const images = product.images || [];
  const hasImages = images.length > 0 && !imageError;
  const mainImage = images[0];
  const secondaryImage = images[1];

  const transitionClass = reducedMotion
    ? 'transition-none duration-0'
    : 'transition-opacity duration-300 motion-reduce:transition-none motion-reduce:duration-0';

  return (
    <Link
      href={`/product/${product.slug}`}
      aria-label={`${product.name}, starting from ${formatCurrency(product.basePrice)}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={`group block text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] rounded-[4px] select-none ${className}`.trim()}
    >
      {/* 4:5 Aspect Ratio Container */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-[var(--color-surface)] rounded-[4px] border border-[var(--color-border)]">
        {!hasImages ? (
          <div
            data-testid="missing-image-placeholder"
            className="w-full h-full flex flex-col items-center justify-center bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] p-4 text-center"
          >
            <ImageOff className="w-8 h-8 opacity-40 mb-2" aria-hidden="true" />
            <span className="text-[13px] font-medium tracking-wide">Image coming soon</span>
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
              'text-h3 font-medium text-[var(--color-text)] group-hover:underline underline-offset-4 line-clamp-2',
          },
          product.name
        )}
        <p className="text-price text-[var(--color-text-muted)]">
          From {formatCurrency(product.basePrice)}
        </p>
      </div>
    </Link>
  );
};
