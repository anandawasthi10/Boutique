import React from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/config/site';

export const Footer: React.FC = () => {
  const exploreLinks = SITE_CONFIG.footerLinks.filter(
    (link) => link.href !== '/privacy' && link.href !== '/terms'
  );

  return (
    <footer
      data-tone="dark"
      className="w-full bg-[var(--color-plum-deep)] border-t border-[var(--color-plum-line)] text-[var(--color-ivory)] mt-auto"
    >
      <div className="container-custom py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Story Column */}
          <div className="md:col-span-2 space-y-3">
            <span className="font-heading text-2xl sm:text-3xl font-medium tracking-tight text-[var(--color-ivory)]">
              {SITE_CONFIG.brandName}
            </span>
            <p className="text-body text-[rgba(251,247,244,0.85)] max-w-md">
              Handmade fabric accessories with personal customisation.
            </p>
          </div>

          {/* Navigation Links Column */}
          <div className="space-y-2 sm:space-y-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-rose-pale)]">
              Explore
            </h2>
            <ul className="flex flex-col">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="min-h-[44px] inline-flex items-center text-body-small text-[rgba(251,247,244,0.85)] [@media(hover:hover)]:hover:text-[var(--color-ivory)] [@media(hover:hover)]:hover:underline [@media(hover:hover)]:hover:decoration-1 [@media(hover:hover)]:hover:underline-offset-4 transition-colors rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ivory)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio & Contact Column */}
          <div className="space-y-2 sm:space-y-4">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-rose-pale)]">
              Studio
            </h2>
            <div className="text-body-small text-[rgba(251,247,244,0.85)] flex flex-col">
              <p className="min-h-[32px] inline-flex items-center">{SITE_CONFIG.contact.address}</p>
              <p>
                <a
                  href={`mailto:${SITE_CONFIG.contact.email}`}
                  className="min-h-[44px] inline-flex items-center underline decoration-1 underline-offset-4 text-[rgba(251,247,244,0.85)] [@media(hover:hover)]:hover:text-[var(--color-ivory)] transition-colors rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ivory)]"
                >
                  {SITE_CONFIG.contact.email}
                </a>
              </p>
              <p>
                <a
                  href={`tel:${SITE_CONFIG.contact.phone.replace(/\s+/g, '')}`}
                  className="min-h-[44px] inline-flex items-center underline decoration-1 underline-offset-4 text-[rgba(251,247,244,0.85)] [@media(hover:hover)]:hover:text-[var(--color-ivory)] transition-colors rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ivory)]"
                >
                  {SITE_CONFIG.contact.phone}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--color-plum-line)] mt-10 pt-6 sm:mt-12 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[rgba(251,247,244,0.75)] text-center sm:text-left">
          <p>© 2026 {SITE_CONFIG.brandName}. All rights reserved.</p>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            <Link
              href="/privacy"
              className="min-h-[44px] inline-flex items-center text-[rgba(251,247,244,0.75)] [@media(hover:hover)]:hover:text-[var(--color-ivory)] [@media(hover:hover)]:hover:underline [@media(hover:hover)]:hover:decoration-1 [@media(hover:hover)]:hover:underline-offset-4 transition-colors rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ivory)]"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="min-h-[44px] inline-flex items-center text-[rgba(251,247,244,0.75)] [@media(hover:hover)]:hover:text-[var(--color-ivory)] [@media(hover:hover)]:hover:underline [@media(hover:hover)]:hover:decoration-1 [@media(hover:hover)]:hover:underline-offset-4 transition-colors rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ivory)]"
            >
              Terms of Service
            </Link>
          </div>
          <p className="text-body-small text-[rgba(251,247,244,0.75)]">
            Handmade accessories
          </p>
        </div>
      </div>
    </footer>
  );
};
