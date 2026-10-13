'use client';

import React from 'react';
import Link from 'next/link';
import { TERMS_OF_SERVICE_CONFIG } from '@/lib/config/legal';
import { Button } from '@/components/ui/Button';

export const TermsContent: React.FC = () => {
  const config = TERMS_OF_SERVICE_CONFIG;

  return (
    <article className="min-h-screen py-12 md:py-20" data-testid="terms-page">
      {/* Editorial Header */}
      <header className="max-w-3xl mx-auto px-4 text-center mb-16 md:mb-20">
        <p
          className="text-xs uppercase tracking-widest font-medium mb-3"
          style={{ color: 'var(--color-sage-deep)' }}
        >
          {config.subheadline}
        </p>

        <h1
          className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-tight mb-6"
          style={{ color: 'var(--color-text)' }}
        >
          {config.headline}
        </h1>

        <p
          className="text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {config.leadParagraph}
        </p>
      </header>

      {/* Mandatory Client & Legal Approval Notice */}
      <section className="max-w-3xl mx-auto px-4 mb-16" aria-labelledby="terms-notice-heading">
        <div
          className="p-6 md:p-8 rounded-xl border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <h2
            id="terms-notice-heading"
            className="font-serif text-xl sm:text-2xl font-normal mb-3"
            style={{ color: 'var(--color-text)' }}
          >
            Draft Terms Notice
          </h2>

          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-muted)' }}
            data-testid="terms-placeholder-notice"
          >
            {config.approvalNotice}
          </p>
        </div>
      </section>

      {/* Short Headings Outline */}
      <section className="max-w-3xl mx-auto px-4 space-y-6 mb-20" aria-label="Terms Outline">
        <div className="space-y-6">
          {config.sections.map((section) => (
            <div
              key={section.title}
              className="p-6 md:p-8 rounded-xl border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <h2
                className="font-serif text-xl sm:text-2xl font-medium mb-3"
                style={{ color: 'var(--color-text)' }}
              >
                {section.title}
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {section.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Return to Shop navigation */}
      <section className="max-w-3xl mx-auto px-4 text-center">
        <Link href="/shop">
          <Button variant="secondary">Return to Shop</Button>
        </Link>
      </section>
    </article>
  );
};
