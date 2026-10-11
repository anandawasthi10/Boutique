import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  ConfiguratorPreview,
  PriceBreakdown,
  SelectionSummary,
} from '@/components/configurator';
import { Product, PriceQuote } from '@/lib/types';

describe('FE-18: Preview, price breakdown and selection summary', () => {
  const mockProduct: Product = {
    id: 'prod-pouch',
    slug: 'everyday-zip-pouch',
    name: 'Everyday Zip Pouch',
    basePrice: 499,
    description: 'A versatile lined zip pouch.',
    images: [{ url: '/images/products/pouch-main.svg', alt: 'Everyday Zip Pouch Main', order: 1 }],
    category: { id: 'cat-pouches', name: 'Pouches' },
    optionGroups: [
      {
        id: 'grp-fabric',
        label: 'Fabric',
        type: 'swatch',
        required: true,
        options: [
          {
            id: 'opt-floral',
            label: 'Floral',
            priceDelta: 0,
            available: true,
            swatchImageUrl: '/images/swatches/floral.svg',
            // No previewImageUrl on floral!
          },
          {
            id: 'opt-corduroy',
            label: 'Corduroy',
            priceDelta: 50,
            available: true,
            swatchImageUrl: '/images/swatches/corduroy.svg',
            previewImageUrl: '/images/products/pouch-corduroy-preview.svg',
          },
        ],
      },
      {
        id: 'grp-size',
        label: 'Size',
        type: 'chips',
        required: true,
        options: [
          { id: 'opt-reg', label: 'Regular', priceDelta: 0, available: true },
          { id: 'opt-large', label: 'Large', priceDelta: 100, available: true },
        ],
      },
    ],
  };

  it('preview changes only when API supplies preview image; otherwise photo stays and swatch card shows chosen fabric', () => {
    // 1. When selected option does NOT have previewImageUrl:
    // Main photo stays, swatch card shows chosen fabric
    const { rerender } = render(
      <ConfiguratorPreview
        product={mockProduct}
        selectedOptionIds={{ 'grp-fabric': 'opt-floral' }}
      />
    );

    const mainImage = screen.getByRole('img', { name: /Everyday Zip Pouch Main/i });
    expect(mainImage).toHaveAttribute('src', expect.stringContaining('pouch-main.svg'));

    // Swatch card appears with fabric name
    expect(screen.getByTestId('selected-swatch-card')).toBeInTheDocument();
    expect(screen.getByText('Floral')).toBeInTheDocument();

    // 2. When selected option DOES have previewImageUrl:
    // It crossfades/replaces the image with API preview, no swatch card needed
    rerender(
      <ConfiguratorPreview
        product={mockProduct}
        selectedOptionIds={{ 'grp-fabric': 'opt-corduroy' }}
      />
    );

    const previewImage = screen.getByRole('img', {
      name: /Everyday Zip Pouch customised with Corduroy/i,
    });
    expect(previewImage).toHaveAttribute(
      'src',
      expect.stringContaining('pouch-corduroy-preview.svg')
    );
    expect(screen.queryByTestId('selected-swatch-card')).not.toBeInTheDocument();
  });

  it('price breakdown lists base price, option changes, and total in Indian Rupee format', () => {
    const mockQuote: PriceQuote = {
      valid: true,
      lines: [
        { label: 'Base Price', amount: 499 },
        { label: 'Fabric: Corduroy', amount: 50 },
        { label: 'Size: Large', amount: 100 },
      ],
      total: 649,
    };

    render(<PriceBreakdown quote={mockQuote} />);

    // Breakdown lines
    expect(screen.getByText('Base Price')).toBeInTheDocument();
    expect(screen.getByText('₹499')).toBeInTheDocument();
    expect(screen.getByText('Fabric: Corduroy')).toBeInTheDocument();
    expect(screen.getByText('₹50')).toBeInTheDocument();
    expect(screen.getByText('Size: Large')).toBeInTheDocument();
    expect(screen.getByText('₹100')).toBeInTheDocument();

    // Total
    expect(screen.getByTestId('quote-total')).toHaveTextContent('₹649');
  });

  it('announces price changes to screen readers via aria-live', () => {
    const mockQuote: PriceQuote = {
      valid: true,
      lines: [{ label: 'Base Price', amount: 499 }],
      total: 499,
    };

    const { container } = render(<PriceBreakdown quote={mockQuote} />);

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveTextContent('Total price is ₹499');
  });

  it('selection summary lists chosen options and clearly names any missing required choices', () => {
    // Both groups missing
    const { rerender } = render(
      <SelectionSummary
        product={mockProduct}
        selectedOptionIds={{}}
        missingRequiredGroups={mockProduct.optionGroups}
      />
    );

    expect(screen.getByText(/no options selected yet/i)).toBeInTheDocument();
    expect(screen.getByTestId('missing-required-alert')).toHaveTextContent(
      'Required choices still missing: Fabric, Size'
    );
    expect(screen.getByText('Incomplete')).toBeInTheDocument();

    // Fabric selected, size still missing
    rerender(
      <SelectionSummary
        product={mockProduct}
        selectedOptionIds={{ 'grp-fabric': 'opt-floral' }}
        missingRequiredGroups={[mockProduct.optionGroups[1]]}
      />
    );

    expect(screen.getByText('Fabric:')).toBeInTheDocument();
    expect(screen.getByText('Floral')).toBeInTheDocument();
    expect(screen.getByTestId('missing-required-alert')).toHaveTextContent(
      'Required choices still missing: Size'
    );

    // Both selected
    rerender(
      <SelectionSummary
        product={mockProduct}
        selectedOptionIds={{ 'grp-fabric': 'opt-floral', 'grp-size': 'opt-reg' }}
        missingRequiredGroups={[]}
      />
    );

    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.queryByTestId('missing-required-alert')).not.toBeInTheDocument();
  });
});
