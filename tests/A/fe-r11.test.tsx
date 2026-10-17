import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PrivacyContent } from '@/app/privacy/PrivacyContent';
import { TermsContent } from '@/app/terms/TermsContent';
import { Footer } from '@/components/layout/Footer';
import { PRIVACY_POLICY_CONFIG, TERMS_OF_SERVICE_CONFIG } from '@/lib/config/legal';
import { SITE_CONFIG } from '@/lib/config/site';
import sitemap from '@/app/sitemap';

describe('R-11: Legal and trust pages', () => {
  describe('Privacy Policy Page (/privacy)', () => {
    it('renders editorial content from centralized config in About page style', () => {
      render(<PrivacyContent />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        PRIVACY_POLICY_CONFIG.headline
      );
      expect(screen.getByText(PRIVACY_POLICY_CONFIG.subheadline)).toBeInTheDocument();
      expect(screen.getByText(PRIVACY_POLICY_CONFIG.leadParagraph)).toBeInTheDocument();
    });

    it('contains clearly marked placeholder text requiring client and qualified legal approval', () => {
      render(<PrivacyContent />);

      const notice = screen.getByTestId('privacy-placeholder-notice');
      expect(notice).toBeInTheDocument();
      expect(notice).toHaveTextContent(
        /must be written and approved by the client and a qualified legal professional/i
      );
    });

    it('renders short headings outline only without invented legal claims', () => {
      render(<PrivacyContent />);

      const expectedHeadings = [
        'Information Collected',
        'How It Is Used',
        'Payments',
        'Delivery and Returns',
        'Contact',
      ];

      expectedHeadings.forEach((heading) => {
        expect(screen.getByRole('heading', { level: 2, name: heading })).toBeInTheDocument();
      });

      // Verify no invented legal warranties or disclaimers
      const text = document.body.textContent?.toLowerCase() || '';
      expect(text).not.toContain('indemnification');
      expect(text).not.toContain('binding arbitration');
      expect(text).not.toContain('class action waiver');
    });

    it('includes navigation link to return to shop', () => {
      render(<PrivacyContent />);
      const returnBtn = screen.getByRole('link', { name: /return to shop/i });
      expect(returnBtn).toHaveAttribute('href', '/shop');
    });
  });

  describe('Terms of Service Page (/terms)', () => {
    it('renders editorial content from centralized config in About page style', () => {
      render(<TermsContent />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        TERMS_OF_SERVICE_CONFIG.headline
      );
      expect(screen.getByText(TERMS_OF_SERVICE_CONFIG.subheadline)).toBeInTheDocument();
      expect(screen.getByText(TERMS_OF_SERVICE_CONFIG.leadParagraph)).toBeInTheDocument();
    });

    it('contains clearly marked placeholder text requiring client and qualified legal approval', () => {
      render(<TermsContent />);

      const notice = screen.getByTestId('terms-placeholder-notice');
      expect(notice).toBeInTheDocument();
      expect(notice).toHaveTextContent(
        /must be written and approved by the client and a qualified legal professional/i
      );
    });

    it('renders short headings outline only without invented legal claims', () => {
      render(<TermsContent />);

      const expectedHeadings = [
        'Information Collected',
        'How It Is Used',
        'Payments',
        'Delivery and Returns',
        'Contact',
      ];

      expectedHeadings.forEach((heading) => {
        expect(screen.getByRole('heading', { level: 2, name: heading })).toBeInTheDocument();
      });

      // Verify no invented legal assertions
      const text = document.body.textContent?.toLowerCase() || '';
      expect(text).not.toContain('limitation of liability shall not exceed');
      expect(text).not.toContain('warranties of merchantability');
    });

    it('includes navigation link to return to shop', () => {
      render(<TermsContent />);
      const returnBtn = screen.getByRole('link', { name: /return to shop/i });
      expect(returnBtn).toHaveAttribute('href', '/shop');
    });
  });

  describe('Footer Links and Site Configuration', () => {
    it('links both /privacy and /terms in the footer', () => {
      render(<Footer />);

      const privacyLinks = screen.getAllByRole('link', { name: /privacy policy/i });
      expect(privacyLinks.length).toBeGreaterThanOrEqual(1);
      privacyLinks.forEach((link) => expect(link).toHaveAttribute('href', '/privacy'));

      const termsLinks = screen.getAllByRole('link', { name: /terms of service/i });
      expect(termsLinks.length).toBeGreaterThanOrEqual(1);
      termsLinks.forEach((link) => expect(link).toHaveAttribute('href', '/terms'));
    });

    it('holds legal links in centralized site configuration', () => {
      const privacyConfig = SITE_CONFIG.footerLinks.find((l) => l.href === '/privacy');
      expect(privacyConfig).toBeDefined();

      const termsConfig = SITE_CONFIG.footerLinks.find((l) => l.href === '/terms');
      expect(termsConfig).toBeDefined();

      expect(SITE_CONFIG.legalLinks).toBeDefined();
    });

    it('includes legal pages in sitemap metadata configuration', async () => {
      const items = await sitemap();
      const privacyItem = items.find((item) => item.url.endsWith('/privacy'));
      const termsItem = items.find((item) => item.url.endsWith('/terms'));

      expect(privacyItem).toBeDefined();
      expect(termsItem).toBeDefined();
    });
  });
});
