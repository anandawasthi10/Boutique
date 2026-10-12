import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import { ConfiguratorPreview } from '@/components/configurator/ConfiguratorPreview';
import { PreferencesProvider } from '@/lib/hooks/usePreferences';
import { Product } from '@/lib/types';

const mockProduct: Product = {
  id: 'prod-test',
  name: 'Velvet Hair Tie',
  slug: 'velvet-hair-tie',
  description: 'Handmade velvet hair tie.',
  basePrice: 499,
  images: [{ url: '/images/test.jpg', alt: 'Velvet Hair Tie', order: 0 }],
  category: { id: 'cat-1', name: 'Scrunchies' },
  optionGroups: [
    {
      id: 'grp-fabric',
      label: 'Fabric',
      type: 'swatch',
      required: true,
      options: [
        {
          id: 'opt-velvet',
          label: 'Plush Velvet',
          priceDelta: 0,
          available: true,
          previewImageUrl: '/images/preview-velvet.jpg',
        },
      ],
    },
  ],
};

describe('FE-38: Motion polish', () => {
  it('defines global prefers-reduced-motion CSS reset that eliminates transition and animation durations', () => {
    const cssPath = path.resolve(process.cwd(), 'app/globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
    expect(cssContent).toContain('animation-duration: 0.01ms !important');
    expect(cssContent).toContain('transition-duration: 0.01ms !important');
    expect(cssContent).toContain('animation-iteration-count: 1 !important');
  });

  it('verifies that no continuous, infinite, or decorative looping animations exist in CSS', () => {
    const cssPath = path.resolve(process.cwd(), 'app/globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // No infinite decorative keyframes
    expect(cssContent).not.toMatch(/animation:\s*[^;]*infinite/i);
    expect(cssContent).not.toMatch(/@keyframes\s+float/i);
    expect(cssContent).not.toMatch(/@keyframes\s+pulse-glow/i);
  });

  it('respects reduced motion in ConfiguratorPreview by applying transition-none', () => {
    render(
      <PreferencesProvider overrideReducedMotion={true}>
        <ConfiguratorPreview
          product={mockProduct}
          selectedOptionIds={{ 'grp-fabric': 'opt-velvet' }}
        />
      </PreferencesProvider>
    );

    const img = screen.getByAltText(/Velvet Hair Tie/i);
    expect(img.className).toContain('transition-none');
    expect(img.className).not.toContain('transition-opacity duration-');
  });

  it('keeps preview crossfade duration strictly within stated table limit (< 300 ms)', () => {
    render(
      <PreferencesProvider overrideReducedMotion={false}>
        <ConfiguratorPreview
          product={mockProduct}
          selectedOptionIds={{ 'grp-fabric': 'opt-velvet' }}
        />
      </PreferencesProvider>
    );

    const img = screen.getByAltText(/Velvet Hair Tie/i);
    expect(img.className).toContain('transition-opacity');
    // Verify it is duration-250 (which is strictly under 300ms)
    expect(img.className).toContain('duration-250');
  });
});
