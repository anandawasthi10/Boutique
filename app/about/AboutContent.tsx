'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ABOUT_CONTENT } from '@/lib/config/about';
import { Button } from '@/components/ui/Button';

export const AboutContent: React.FC = () => {
  const content = ABOUT_CONTENT;

  return (
    <article className="min-h-screen py-12 md:py-20" data-testid="about-page">
      {/* Editorial Header */}
      <header className="max-w-3xl mx-auto px-4 text-center mb-16 md:mb-20">
        <p
          className="text-xs uppercase tracking-widest font-medium mb-3"
          style={{ color: 'var(--color-sage-deep)' }}
        >
          {content.subheadline}
        </p>

        <h1
          className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal leading-tight mb-6"
          style={{ color: 'var(--color-text)' }}
        >
          {content.headline}
        </h1>

        <p
          className="text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {content.leadParagraph}
        </p>
      </header>

      {/* Hero Image / Atelier Figure */}
      <section className="max-w-4xl mx-auto px-4 mb-20" aria-labelledby="atelier-visual-heading">
        <h2 id="atelier-visual-heading" className="sr-only">
          Atelier Imagery
        </h2>

        <figure
          className="rounded-2xl overflow-hidden p-6 md:p-8"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div className="relative aspect-16/9 w-full rounded-xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
            <Image
              src={content.image.src}
              alt={content.image.alt}
              fill
              className="object-contain p-6"
              priority
            />
          </div>
          <figcaption
            className="text-xs text-center mt-4 italic"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {content.image.caption}
          </figcaption>
        </figure>
      </section>

      {/* Founder / Artisan Note Placeholder Box */}
      <section className="max-w-3xl mx-auto px-4 mb-20" aria-labelledby="artisan-note-heading">
        <div
          className="p-6 md:p-8 rounded-xl border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="mb-3">
            <h2
              id="artisan-note-heading"
              className="text-xl sm:text-2xl font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              {content.artisanNoteTitle}
            </h2>
          </div>

          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--color-text-muted)' }}
            data-testid="artisan-placeholder-text"
          >
            {content.artisanNotePlaceholder}
          </p>
        </div>
      </section>

      {/* Core Principles Grid */}
      <section className="max-w-5xl mx-auto px-4 mb-20" aria-labelledby="principles-heading">
        <div className="text-center mb-12">
          <h2
            id="principles-heading"
            className="font-serif text-3xl sm:text-4xl font-normal"
            style={{ color: 'var(--color-text)' }}
          >
            Our Guiding Standards
          </h2>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
            Simple principles that guide every stitch and finish.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {content.sections.map((section) => {
            return (
              <div
                key={section.title}
                className="p-6 rounded-xl flex flex-col justify-between"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <h3
                    className="text-xl font-medium mb-3"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {section.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {section.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Material Story */}
      <section className="max-w-3xl mx-auto px-4 mb-20 text-center" aria-labelledby="materials-heading">
        <h2
          id="materials-heading"
          className="font-serif text-2xl sm:text-3xl font-normal mb-4"
          style={{ color: 'var(--color-text)' }}
        >
          {content.materialStoryTitle}
        </h2>
        <p
          className="text-base leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {content.materialStoryBody}
        </p>
      </section>

      {/* Call to Action */}
      <section
        className="max-w-4xl mx-auto px-4 text-center py-12 rounded-2xl"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
        aria-labelledby="cta-heading"
      >
        <h2
          id="cta-heading"
          className="font-serif text-3xl font-normal mb-3"
          style={{ color: 'var(--color-text)' }}
        >
          Discover Our Accessories
        </h2>
        <p
          className="text-sm max-w-md mx-auto mb-6"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Explore the ready collections or build your own bespoke accessory with customizable fabrics.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/shop" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto inline-flex items-center justify-center">
              Browse Collection
            </Button>
          </Link>
          <Link href="/build-your-own" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto">
              Build Your Own
            </Button>
          </Link>
        </div>
      </section>
    </article>
  );
};
