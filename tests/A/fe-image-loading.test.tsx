import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductCard } from '@/components/catalogue/ProductCard';

// Mock next/image to inspect props passed to it
vi.mock('next/image', () => {
  return {
    __esModule: true,
    default: ({ src, alt, priority, preload, fill, ...props }: any) => {
      return (
        <img
          src={src}
          alt={alt}
          data-preload={String(preload ?? false)}
          data-priority={String(priority ?? false)}
          {...props}
        />
      );
    },
  };
});

describe('TASK 9: Image preload hints', () => {
  it('applies preload hint to first gallery image in ProductGallery and not to other cards', () => {
    const images = [
      { url: '/images/productimages/classic-scrunchie-1.jpg', alt: 'Image 1', order: 1 },
      { url: '/images/productimages/classic-scrunchie-2.jpg', alt: 'Image 2', order: 2 },
    ];

    const { rerender } = render(<ProductGallery images={images} productName="Test Product" />);
    const mainImg = screen.getByAltText('Image 1');
    expect(mainImg.getAttribute('data-preload')).toBe('true');

    // ProductCard should NOT have preload or priority set
    const sampleProduct = {
      id: 'p1',
      slug: 'test-item',
      name: 'Test Item',
      basePrice: 199,
      category: { id: 'c1', name: 'Accessories' },
      images: [{ url: '/img/sample.jpg', alt: 'Sample', order: 1 }],
      optionGroups: [],
    };
    rerender(<ProductCard product={sampleProduct} />);
    const cardImg = screen.getByAltText('Sample');
    expect(cardImg.getAttribute('data-preload')).toBe('false');
    expect(cardImg.getAttribute('data-priority')).toBe('false');
  });
});
