import React from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/config/site';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[var(--color-surface)] border-t border-[var(--color-border)] text-[var(--color-text)] mt-auto">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Story Column */}
          <div className="md:col-span-2 space-y-4">
            <span className="font-heading text-3xl font-medium tracking-tight text-[var(--color-text)]">
              {SITE_CONFIG.brandName}
            </span>
            <p className="text-body text-[var(--color-text-muted)] max-w-md">
              Handmade fabric accessories with personal customisation.
            </p>
          </div>

          {/* Navigation Links Column */}
          <div className="space-y-4">
            <h2 className="text-label text-[var(--color-text)]">Explore</h2>
            <ul className="space-y-2.5">
              {SITE_CONFIG.footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-small text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:underline transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio & Contact Column */}
          <div className="space-y-4">
            <h2 className="text-label text-[var(--color-text)]">Studio</h2>
            <div className="text-body-small text-[var(--color-text-muted)] space-y-1.5">
              <p>{SITE_CONFIG.contact.address}</p>
              <p>
                <a
                  href={`mailto:${SITE_CONFIG.contact.email}`}
                  className="hover:text-[var(--color-text)] underline underline-offset-2"
                >
                  {SITE_CONFIG.contact.email}
                </a>
              </p>
              <p>
                <a
                  href={`tel:${SITE_CONFIG.contact.phone.replace(/\s+/g, '')}`}
                  className="hover:text-[var(--color-text)]"
                >
                  {SITE_CONFIG.contact.phone}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--color-border)] mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[var(--color-text-muted)]">
          <p>© 2026 {SITE_CONFIG.brandName}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="hover:underline hover:text-[var(--color-text)] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:underline hover:text-[var(--color-text)] transition-colors"
            >
              Terms of Service
            </Link>
          </div>
          <p className="text-script text-base text-[var(--color-text-muted)]">
            Handmade accessories
          </p>
        </div>
      </div>
    </footer>
  );
};
