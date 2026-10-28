import React from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/config/site';

export const Footer: React.FC = () => {
  return (
    <footer data-tone="dark" className="w-full bg-[var(--color-surface)] border-t border-[var(--color-border)] text-[var(--color-text)] mt-auto">
      <div className="container-custom py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Story Column */}
          <div className="md:col-span-2 space-y-3">
            <span className="font-heading text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-text)]">
              {SITE_CONFIG.brandName}
            </span>
            <p className="text-body text-[var(--color-text-muted)] max-w-md">
              Handmade fabric accessories with personal customisation.
            </p>
          </div>

          {/* Navigation Links Column */}
          <div className="space-y-2 sm:space-y-4">
            <h2 className="text-label text-[var(--color-text)] font-semibold uppercase tracking-wider text-xs">Explore</h2>
            <ul className="flex flex-col">
              {SITE_CONFIG.footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="min-h-[44px] inline-flex items-center text-body-small text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:underline transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio & Contact Column */}
          <div className="space-y-2 sm:space-y-4">
            <h2 className="text-label text-[var(--color-text)] font-semibold uppercase tracking-wider text-xs">Studio</h2>
            <div className="text-body-small text-[var(--color-text-muted)] flex flex-col">
              <p className="min-h-[32px] inline-flex items-center">{SITE_CONFIG.contact.address}</p>
              <p>
                <a
                  href={`mailto:${SITE_CONFIG.contact.email}`}
                  className="min-h-[44px] inline-flex items-center hover:text-[var(--color-text)] underline underline-offset-2"
                >
                  {SITE_CONFIG.contact.email}
                </a>
              </p>
              <p>
                <a
                  href={`tel:${SITE_CONFIG.contact.phone.replace(/\s+/g, '')}`}
                  className="min-h-[44px] inline-flex items-center hover:text-[var(--color-text)]"
                >
                  {SITE_CONFIG.contact.phone}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--color-border)] mt-10 pt-6 sm:mt-12 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[var(--color-text-muted)] text-center sm:text-left">
          <p>© 2026 {SITE_CONFIG.brandName}. All rights reserved.</p>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            <Link
              href="/privacy"
              className="min-h-[44px] inline-flex items-center hover:underline hover:text-[var(--color-text)] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="min-h-[44px] inline-flex items-center hover:underline hover:text-[var(--color-text)] transition-colors"
            >
              Terms of Service
            </Link>
          </div>
          <p className="text-body-small text-[var(--color-text-muted)]">
            Handmade accessories
          </p>
        </div>
      </div>
    </footer>
  );
};
