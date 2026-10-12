import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AboutContent } from '@/app/about/AboutContent';
import { ABOUT_CONTENT } from '@/lib/config/about';

describe('FE-35: About the brand', () => {
  it('renders editorial content from the centralized configuration file', () => {
    render(<AboutContent />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(ABOUT_CONTENT.headline);
    expect(screen.getByText(ABOUT_CONTENT.subheadline)).toBeInTheDocument();
    expect(screen.getByText(ABOUT_CONTENT.leadParagraph)).toBeInTheDocument();

    // Verify all principle sections are rendered
    ABOUT_CONTENT.sections.forEach((sec) => {
      expect(screen.getByText(sec.title)).toBeInTheDocument();
      expect(screen.getByText(sec.body)).toBeInTheDocument();
    });
  });

  it('contains clearly marked placeholder copy for pending client founder story', () => {
    render(<AboutContent />);

    const placeholder = screen.getByTestId('artisan-placeholder-text');
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).toHaveTextContent(/founder story placeholder/i);
  });

  it('does not contain invented history, artificial awards, fake numbers, or fabricated customer reviews', () => {
    const { container } = render(<AboutContent />);
    const pageText = container.textContent?.toLowerCase() || '';

    // No invented years like "established in 1890" or "since 1920"
    expect(pageText).not.toMatch(/established in 1[89]\d\d/);
    expect(pageText).not.toMatch(/since 1[89]\d\d/);

    // No fake award claims
    expect(pageText).not.toMatch(/award-winning|voted #1|best artisan of/);

    // No invented customer metric claims
    expect(pageText).not.toMatch(/10,000\+ happy customers|5-star reviews|trusted by thousands/);
  });

  it('renders images with real descriptive alternative text and semantic figure caption', () => {
    render(<AboutContent />);

    const img = screen.getByAltText(ABOUT_CONTENT.image.alt);
    expect(img).toBeInTheDocument();
    expect(screen.getByText(ABOUT_CONTENT.image.caption)).toBeInTheDocument();
  });

  it('provides navigation links to the shop catalogue and configurator', () => {
    render(<AboutContent />);

    const shopLink = screen.getByRole('link', { name: /browse collection/i });
    expect(shopLink).toHaveAttribute('href', '/shop');

    const byoLink = screen.getByRole('link', { name: /build your own/i });
    expect(byoLink).toHaveAttribute('href', '/build-your-own');
  });
});
