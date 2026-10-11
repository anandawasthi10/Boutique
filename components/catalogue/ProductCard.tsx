'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductSummary } from '@/lib/types';
import { formatCurrency } from '@/lib/format/currency';

export interface ProductCardProps {
  product: ProductSummary;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  const mainImage = product.images[0] || {
    url: '/images/placeholders/scrunchie-1.svg',
    alt: `${product.name} (Placeholder)`,
    order: 1,
  };

  const secondaryImage = product.images[1];

  return (
    <Link
      href={`/product/${product.slug}`}
      aria-label={`${product.name}, starting from ${formatCurrency(product.basePrice)}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={`group block text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] rounded-[4px] transition-all select-none ${className}`.trim()}
    >
      {/* 4:5 Aspect Ratio Container */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-[var(--color-surface)] rounded-[4px] border border-[var(--color-border)]">
        <Image
          src={mainImage.url}
          alt={mainImage.alt || product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-opacity duration-300 ${
            isHovered && secondaryImage ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {secondaryImage && (
          <Image
            src={secondaryImage.url}
            alt={secondaryImage.alt || `${product.name} alternate view`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>

      {/* Info */}
      <div className="mt-3.5 flex flex-col gap-1">
        <h3 className="text-h3 font-medium text-[var(--color-text)] group-hover:underline underline-offset-4 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-price text-[var(--color-text-muted)]">
          From {formatCurrency(product.basePrice)}
        </p>
      </div>
    </Link>
  );
};
