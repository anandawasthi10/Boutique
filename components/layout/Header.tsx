'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Search, ShoppingBag, User as UserIcon, LogIn } from 'lucide-react';
import { SITE_CONFIG } from '@/lib/config/site';
import { useCartCount } from '@/lib/hooks/useCartCount';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useCart } from '@/lib/hooks/useCart';
import { MobileNav } from './MobileNav';

import { SoundToggle } from './SoundToggle';

export interface HeaderProps {
  onOpenCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { count: cartCount } = useCartCount();
  const { user } = useCurrentUser();
  const { openDrawer } = useCart();

  return (
    <>
      {/* Skip to Content Link - First focusable element */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[var(--color-primary)] focus:text-[var(--color-on-primary)] focus:rounded-[4px] focus:shadow-md focus:font-medium"
      >
        Skip to main content
      </a>

      {/* Top Announcement Bar */}
      <div className="w-full bg-[var(--color-primary)] text-[var(--color-on-primary)] text-xs py-1.5 px-4 text-center font-medium tracking-wide">
        Complimentary standard shipping on all orders
      </div>

      <header className="sticky top-0 z-40 w-full bg-[var(--color-bg)] border-b border-[var(--color-border)] transition-colors">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
          {/* Left: Mobile Menu Toggle & Desktop Nav */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile navigation menu"
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-surface)] rounded-[4px] transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>

            <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-8">
              {SITE_CONFIG.navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-body font-medium text-[var(--color-text)] hover:text-[var(--color-text-muted)] underline-offset-4 hover:underline transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center: Brand Logo Placeholder */}
          <div className="flex items-center justify-center">
            <Link
              href="/"
              aria-label={`${SITE_CONFIG.brandName} homepage`}
              className="group flex flex-col items-center select-none"
            >
              <span className="font-heading text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-[var(--color-text)] group-hover:opacity-85 transition-opacity">
                {SITE_CONFIG.brandName}
              </span>
              <span className="hidden sm:block text-[11px] uppercase tracking-widest text-[var(--color-text-muted)] -mt-1 font-body">
                {SITE_CONFIG.tagline}
              </span>
            </Link>
          </div>

          {/* Right: Actions (Search, Sound, Account, Cart) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <Link
              href="/shop"
              aria-label="Search catalogue"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-[4px] transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Sound Toggle (hidden while showSoundToggle is false) */}
            {SITE_CONFIG.showSoundToggle && <SoundToggle />}

            {/* Account / Login */}
            {user ? (
              <Link
                href="/account"
                aria-label={`My account (${user.name})`}
                className="min-w-[44px] min-h-[44px] hidden sm:flex items-center justify-center text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-[4px] transition-colors gap-2 px-2"
              >
                <UserIcon className="w-5 h-5 text-[var(--color-text)]" />
                <span className="text-body-small font-medium text-[var(--color-text)] hidden md:inline">
                  Account
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                aria-label="Log in to your account"
                className="min-w-[44px] min-h-[44px] hidden sm:flex items-center justify-center text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-[4px] transition-colors gap-1.5 px-2"
              >
                <LogIn className="w-5 h-5 text-[var(--color-text)]" />
                <span className="text-body-small font-medium text-[var(--color-text)] hidden md:inline">
                  Log in
                </span>
              </Link>
            )}

            {/* Cart Button */}
            <button
              type="button"
              onClick={onOpenCart || openDrawer}
              aria-label={`Shopping bag${cartCount > 0 ? `, ${cartCount} items` : ', empty'}`}
              className="relative min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-[4px] transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {/* Only show badge when cart is NOT empty */}
              {cartCount > 0 && (
                <span
                  data-testid="cart-count-badge"
                  className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[var(--color-primary)] text-[var(--color-on-primary)] text-[11px] font-semibold rounded-full leading-none"
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
      />
    </>
  );
};
