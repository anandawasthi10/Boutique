'use client';

import React from 'react';
import Link from 'next/link';
import { Drawer } from '../ui/Drawer';
import { SITE_CONFIG } from '@/lib/config/site';
import { User, LogIn, Search, ShoppingBag } from 'lucide-react';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; email: string } | null;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose, user }) => {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={SITE_CONFIG.brandName} side="left">
      <nav aria-label="Mobile Navigation" className="flex flex-col gap-6 py-4">
        {/* Search shortcut */}
        <Link
          href="/shop"
          onClick={onClose}
          className="flex items-center gap-3 py-2 px-3 bg-[var(--color-bg)] rounded-[4px] border border-[var(--color-border)] text-body-small text-[var(--color-text-muted)]"
        >
          <Search className="w-4 h-4 text-[var(--color-text-muted)]" />
          <span>Search collection...</span>
        </Link>

        {/* Main Links */}
        <div className="flex flex-col gap-1 border-y border-[var(--color-border)] py-4">
          {SITE_CONFIG.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="text-h3 font-medium text-[var(--color-text)] py-2.5 px-2 hover:bg-[var(--color-surface-alt)] rounded-[4px] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Account / Login */}
        <div className="flex flex-col gap-2 pt-2">
          {user ? (
            <Link
              href="/account"
              onClick={onClose}
              className="flex items-center gap-3 p-3 bg-[var(--color-surface-alt)] rounded-[4px] text-body text-[var(--color-text)] font-medium"
            >
              <User className="w-5 h-5 text-[var(--color-primary)]" />
              <div className="flex flex-col">
                <span>{user.name}</span>
                <span className="text-[13px] text-[var(--color-text-muted)]">My Account</span>
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center gap-3 p-3 border border-[var(--color-primary)] rounded-[4px] text-body text-[var(--color-primary)] font-medium hover:bg-[var(--color-surface-alt)]"
            >
              <LogIn className="w-5 h-5" />
              <span>Log in to your account</span>
            </Link>
          )}

          <Link
            href="/cart"
            onClick={onClose}
            className="flex items-center gap-3 p-3 text-body-small text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View Shopping Bag</span>
          </Link>
        </div>
      </nav>
    </Drawer>
  );
};
