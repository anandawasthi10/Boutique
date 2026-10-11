import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header, Footer } from '@/components/layout';
import { SITE_CONFIG } from '@/lib/config/site';
import * as cartCountHook from '@/lib/hooks/useCartCount';
import * as currentUserHook from '@/lib/hooks/useCurrentUser';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('FE-08: Site layout shell (Header, Footer, MobileNav)', () => {
  it('renders skip-to-content link as the first link in header', () => {
    render(<Header />);
    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('renders the brand name from the single configuration source', () => {
    render(<Header />);
    const brandElements = screen.getAllByText(SITE_CONFIG.brandName);
    expect(brandElements.length).toBeGreaterThan(0);
  });

  it('shows no cart badge when cart count is 0', () => {
    vi.spyOn(cartCountHook, 'useCartCount').mockReturnValue({ count: 0, loading: false });
    render(<Header />);
    expect(screen.queryByTestId('cart-count-badge')).not.toBeInTheDocument();
  });

  it('shows cart count badge when items are present', () => {
    vi.spyOn(cartCountHook, 'useCartCount').mockReturnValue({ count: 3, loading: false });
    render(<Header />);
    const badge = screen.getByTestId('cart-count-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('3');
  });

  it('displays "Log in" when signed out', () => {
    vi.spyOn(currentUserHook, 'useCurrentUser').mockReturnValue({ user: null, loading: false });
    render(<Header />);
    expect(screen.getByRole('link', { name: /log in to your account/i })).toBeInTheDocument();
  });

  it('displays Account link when customer is signed in', () => {
    vi.spyOn(currentUserHook, 'useCurrentUser').mockReturnValue({
      user: { id: 'u1', name: 'Anvi Sharma', email: 'anvi@example.com' },
      loading: false,
    });
    render(<Header />);
    expect(screen.getByRole('link', { name: /my account \(anvi sharma\)/i })).toBeInTheDocument();
  });

  it('opens mobile navigation drawer and closes on Escape key', () => {
    render(<Header />);
    const openMenuBtn = screen.getByRole('button', { name: /open mobile navigation menu/i });
    fireEvent.click(openMenuBtn);

    const mobileDialog = screen.getByRole('dialog', { name: new RegExp(SITE_CONFIG.brandName, 'i') });
    expect(mobileDialog).toBeInTheDocument();

    // Close on Escape
    fireEvent.keyDown(mobileDialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders Footer with links and brand copyright', () => {
    render(<Footer />);
    expect(screen.getByText(new RegExp(`${SITE_CONFIG.brandName}. All rights reserved.`, 'i'))).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /shop all/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /build your own/i })).toBeInTheDocument();
  });
});
