'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import * as Navigation from 'next/navigation';
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

let usePathnameHook: (() => string) | null = null;
try {
  if (typeof (Navigation as any).usePathname === 'function') {
    usePathnameHook = (Navigation as any).usePathname;
  }
} catch {
  usePathnameHook = null;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { count: cartCount } = useCartCount();
  const { user } = useCurrentUser();
  const { openDrawer } = useCart();
  const headerRef = useRef<HTMLElement | null>(null);

  let pathname = '/';
  try {
    if (usePathnameHook) {
      pathname = usePathnameHook() || '/';
    }
  } catch {
    pathname = '/';
  }

  // 1. Initial state rendered on server from route (home "/" starts as ivory; other routes as plum)
  const initialTone: 'ivory' | 'plum' = pathname === '/' ? 'ivory' : 'plum';
  const [toneState, setToneState] = useState<'ivory' | 'plum'>(initialTone);

  // 2. Controller to evaluate the section containing the header's bottom edge
  const updateTone = useCallback(() => {
    const headerEl = headerRef.current;
    const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : (window.innerWidth >= 1024 ? 80 : 64);
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-tone]'));

    if (sections.length === 0) {
      setToneState('plum');
      return;
    }

    // Find section that contains the header's bottom edge (top <= headerHeight and bottom > headerHeight)
    const containing = sections.find((sec) => {
      const rect = sec.getBoundingClientRect();
      return rect.top <= headerHeight && rect.bottom > headerHeight;
    });

    if (!containing) {
      setToneState('plum');
      return;
    }

    const tone = containing.getAttribute('data-tone');
    // Dark section under header -> header state "ivory"
    // Light section under header -> header state "plum"
    setToneState(tone === 'dark' ? 'ivory' : 'plum');
  }, []);

  // Update on route change, scroll, and resize
  useEffect(() => {
    updateTone();

    let ticking = false;
    const onScrollOrResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateTone();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [pathname, updateTone]);

  // 3. Menu open override: force ivory state when mobile menu is open
  const activeHeaderState = mobileMenuOpen ? 'ivory' : toneState;

  return (
    <>
      {/* Skip to Content Link - First focusable element */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[var(--color-plum)] focus:text-[var(--color-ivory)] focus:rounded-[4px] focus:shadow-md focus:font-medium"
      >
        Skip to main content
      </a>

      <header
        ref={headerRef}
        data-header-state={activeHeaderState}
        className="sticky top-0 z-40 w-full h-[var(--header-h)] flex items-center select-none"
      >
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Left: Mobile Hamburger Toggle & Desktop Nav */}
          <div className="flex items-center gap-4 lg:gap-6 lg:w-1/3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-menu"
              className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-current hover:opacity-80 rounded-[4px] transition-opacity cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>

            <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-6 xl:gap-8">
              {SITE_CONFIG.navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="header-nav-link text-[12px] uppercase tracking-[0.12em] font-medium text-current transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center: Brand Logo */}
          <div className="flex-1 lg:flex-initial flex items-center justify-center text-center">
            <Link
              href="/"
              aria-label={`${SITE_CONFIG.brandName} homepage`}
              className="group min-h-[44px] flex flex-col items-center justify-center select-none"
            >
              <span
                className="font-heading text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight transition-colors"
                style={{ color: 'var(--header-logo)' }}
              >
                {SITE_CONFIG.brandName}
              </span>
              <span className="hidden lg:block text-[10px] uppercase tracking-[0.15em] opacity-80 -mt-0.5 font-body text-current">
                {SITE_CONFIG.tagline}
              </span>
            </Link>
          </div>

          {/* Right: Actions (Search, Sound, Account / Log in, Cart) */}
          <div className="flex items-center justify-end gap-1 sm:gap-2 lg:w-1/3">
            {/* Search */}
            <Link
              href="/shop"
              aria-label="Search catalogue"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-current hover:opacity-80 rounded-[4px] transition-opacity"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Sound Toggle (hidden while showSoundToggle is false) */}
            {SITE_CONFIG.showSoundToggle && <SoundToggle />}

            {/* Account / Login - desktop in header, mobile in menu */}
            {user ? (
              <Link
                href="/account"
                aria-label={`My account (${user.name})`}
                className="min-w-[44px] min-h-[44px] hidden lg:flex items-center justify-center text-current hover:opacity-80 rounded-[4px] transition-opacity gap-1.5 px-2 text-[12px] uppercase tracking-[0.12em] font-medium"
              >
                <UserIcon className="w-4 h-4 text-current" />
                <span className="hidden xl:inline">Account</span>
              </Link>
            ) : (
              <Link
                href="/login"
                aria-label="Log in to your account"
                className="min-w-[44px] min-h-[44px] hidden lg:flex items-center justify-center text-current hover:opacity-80 rounded-[4px] transition-opacity gap-1.5 px-2 text-[12px] uppercase tracking-[0.12em] font-medium"
              >
                <LogIn className="w-4 h-4 text-current" />
                <span className="hidden xl:inline">Log in</span>
              </Link>
            )}

            {/* Cart Button */}
            <button
              type="button"
              onClick={onOpenCart || openDrawer}
              aria-label={`Shopping bag${cartCount > 0 ? `, ${cartCount} items` : ', empty'}`}
              className="relative min-w-[44px] min-h-[44px] flex items-center justify-center text-current hover:opacity-80 rounded-[4px] transition-opacity cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {/* Only show badge when cart is NOT empty */}
              {cartCount > 0 && (
                <span
                  data-testid="cart-count-badge"
                  className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-semibold rounded-full leading-none transition-colors"
                  style={{
                    backgroundColor: 'var(--header-badge-bg)',
                    color: 'var(--header-badge-text)',
                  }}
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
