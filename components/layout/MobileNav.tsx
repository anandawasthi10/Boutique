'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import * as Navigation from 'next/navigation';
import { Drawer } from '../ui/Drawer';
import { SITE_CONFIG } from '@/lib/config/site';
import { User, LogIn, Search, ShoppingBag } from 'lucide-react';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; email: string } | null;
}

let usePathnameHook: (() => string) | null = null;
try {
  if (typeof (Navigation as any).usePathname === 'function') {
    usePathnameHook = (Navigation as any).usePathname;
  }
} catch {
  usePathnameHook = null;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose, user }) => {
  let pathname: string | null = null;
  try {
    if (usePathnameHook) {
      pathname = usePathnameHook();
    }
  } catch {
    pathname = null;
  }

  const prevPathnameRef = React.useRef(pathname);
  const isFirstRender = React.useRef(true);

  // Close drawer automatically only when route actually changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevPathnameRef.current = pathname;
      return;
    }
    if (prevPathnameRef.current && pathname && prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  return (
    <Drawer
      id="mobile-navigation-menu"
      isOpen={isOpen}
      onClose={onClose}
      title={SITE_CONFIG.brandName}
      side="left"
    >
      <nav aria-label="Mobile Navigation" className="flex flex-col gap-6 py-4 bg-[var(--color-ivory)]">
        {/* Search shortcut (min 48px height) */}
        <Link
          href="/shop"
          onClick={onClose}
          className="min-h-[48px] flex items-center gap-3 px-3.5 bg-[var(--color-ivory)] rounded-[4px] border border-[var(--color-line)] text-body-small text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-plum)]"
        >
          <Search className="w-5 h-5 text-[var(--color-muted)] shrink-0" />
          <span>Search collection...</span>
        </Link>

        {/* Main Links (48px tall links in ink) */}
        <div className="flex flex-col border-y border-[var(--color-line)] py-2 divide-y divide-[var(--color-line)]">
          {SITE_CONFIG.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="min-h-[48px] flex items-center text-lg font-medium text-[var(--color-ink)] px-3 hover:bg-[var(--color-surface)] rounded-[4px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-plum)]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/cart"
            onClick={onClose}
            className="min-h-[48px] flex items-center gap-3 px-3 text-lg font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface)] rounded-[4px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-plum)]"
          >
            <ShoppingBag className="w-5 h-5 shrink-0" />
            <span>Shopping Bag</span>
          </Link>
        </div>

        {/* Log in / Account at the bottom (48px tall links) */}
        <div className="flex flex-col gap-2 pt-2 mt-auto">
          {user ? (
            <Link
              href="/account"
              onClick={onClose}
              className="min-h-[48px] flex items-center gap-3 px-3 bg-[var(--color-surface)] rounded-[4px] text-body text-[var(--color-ink)] font-medium hover:bg-[var(--color-line)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-plum)]"
            >
              <User className="w-5 h-5 text-[var(--color-plum)] shrink-0" />
              <div className="flex flex-col">
                <span className="leading-tight">{user.name}</span>
                <span className="text-[12px] text-[var(--color-muted)]">My Account</span>
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="min-h-[48px] flex items-center justify-center gap-2 px-3 border border-[var(--color-plum)] rounded-[4px] text-body text-[var(--color-plum)] font-semibold hover:bg-[var(--color-surface)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-plum)]"
            >
              <LogIn className="w-5 h-5 shrink-0" />
              <span>Log in to your account</span>
            </Link>
          )}
        </div>
      </nav>
    </Drawer>
  );
};
