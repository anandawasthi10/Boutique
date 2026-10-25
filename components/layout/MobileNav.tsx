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

  // Close drawer automatically only when route actually changes
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
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
      <nav aria-label="Mobile Navigation" className="flex flex-col gap-6 py-4">
        {/* Search shortcut (min 48px height) */}
        <Link
          href="/shop"
          onClick={onClose}
          className="min-h-[48px] flex items-center gap-3 px-3.5 bg-[var(--color-bg)] rounded-[4px] border border-[var(--color-border)] text-body-small text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          <Search className="w-5 h-5 text-[var(--color-text-muted)] shrink-0" />
          <span>Search collection...</span>
        </Link>

        {/* Main Links (48px tall links) */}
        <div className="flex flex-col border-y border-[var(--color-border)] py-2">
          {SITE_CONFIG.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="min-h-[48px] flex items-center text-h3 font-medium text-[var(--color-text)] px-3 hover:bg-[var(--color-surface-alt)] rounded-[4px] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Account / Login (48px tall links) */}
        <div className="flex flex-col gap-2 pt-1">
          {user ? (
            <Link
              href="/account"
              onClick={onClose}
              className="min-h-[48px] flex items-center gap-3 px-3 bg-[var(--color-surface-alt)] rounded-[4px] text-body text-[var(--color-text)] font-medium hover:bg-[var(--color-border)] transition-colors"
            >
              <User className="w-5 h-5 text-[var(--color-primary)] shrink-0" />
              <div className="flex flex-col">
                <span className="leading-tight">{user.name}</span>
                <span className="text-[12px] text-[var(--color-text-muted)]">My Account</span>
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="min-h-[48px] flex items-center gap-3 px-3 border border-[var(--color-primary)] rounded-[4px] text-body text-[var(--color-primary)] font-medium hover:bg-[var(--color-surface-alt)] transition-colors"
            >
              <LogIn className="w-5 h-5 shrink-0" />
              <span>Log in to your account</span>
            </Link>
          )}

          <Link
            href="/cart"
            onClick={onClose}
            className="min-h-[48px] flex items-center gap-3 px-3 text-body-small text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-[4px] hover:bg-[var(--color-surface-alt)] transition-colors"
          >
            <ShoppingBag className="w-5 h-5 shrink-0" />
            <span>View Shopping Bag</span>
          </Link>
        </div>
      </nav>
    </Drawer>
  );
};
