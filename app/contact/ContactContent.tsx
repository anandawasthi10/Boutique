'use client';

import React from 'react';
import { Mail, Phone, MapPin, Clock, ExternalLink, Info, Sparkles } from 'lucide-react';
import { CONTACT_CONFIG } from '@/lib/config/contact';

export const ContactContent: React.FC = () => {
  const config = CONTACT_CONFIG;

  return (
    <div className="min-h-screen py-12 md:py-20" data-testid="contact-page">
      {/* Header */}
      <header className="max-w-3xl mx-auto px-4 text-center mb-12 md:mb-16">
        <p
          className="text-xs uppercase tracking-widest font-medium mb-3"
          style={{ color: 'var(--color-sage-deep)' }}
        >
          {config.subheadline}
        </p>

        <h1
          className="font-serif text-4xl sm:text-5xl font-normal leading-tight mb-4"
          style={{ color: 'var(--color-text)' }}
        >
          {config.headline}
        </h1>

        <p
          className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {config.leadParagraph}
        </p>
      </header>

      {/* Main Content Grid */}
      <div className="max-w-5xl mx-auto px-4">
        {/* Placeholder banner */}
        <div
          className="p-4 sm:p-5 rounded-xl border mb-10 flex items-start gap-3"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
          data-testid="contact-placeholder-notice"
        >
          <Info className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {config.placeholderNotice}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Direct Contact & Inquiries (5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            <section
              className="p-6 sm:p-8 rounded-2xl border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
              aria-labelledby="direct-contact-heading"
            >
              <h2
                id="direct-contact-heading"
                className="font-serif text-2xl font-normal mb-6 flex items-center gap-2"
                style={{ color: 'var(--color-text)' }}
              >
                <Sparkles className="w-5 h-5" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                Direct Concierge
              </h2>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Mail className="w-4 h-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                    <span className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--color-text-muted)' }}>
                      Email Inquiries
                    </span>
                  </div>
                  <a
                    href={`mailto:${config.email}`}
                    className="text-base font-medium underline underline-offset-4 transition-colors"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {config.email}
                  </a>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Phone className="w-4 h-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                    <span className="text-xs uppercase tracking-wider font-medium" style={{ color: 'var(--color-text-muted)' }}>
                      Telephone / WhatsApp
                    </span>
                  </div>
                  <a
                    href={`tel:${config.phone}`}
                    className="text-base font-medium underline underline-offset-4 transition-colors"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {config.formattedPhone}
                  </a>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    {config.responseExpectation}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Studio Address, Hours & Map Link (7 columns) */}
          <div className="lg:col-span-7 space-y-6">
            <section
              className="p-6 sm:p-8 rounded-2xl border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
              aria-labelledby="studio-location-heading"
            >
              <h2
                id="studio-location-heading"
                className="font-serif text-2xl font-normal mb-6 flex items-center gap-2"
                style={{ color: 'var(--color-text)' }}
              >
                <MapPin className="w-5 h-5" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                Studio Atelier
              </h2>

              <address className="not-italic mb-6 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--color-text)' }}>
                <p className="font-medium">{config.address.line1}</p>
                {config.address.line2 && <p>{config.address.line2}</p>}
                <p>
                  {config.address.city}, {config.address.state} {config.address.postalCode}
                </p>
                <p>{config.address.country}</p>
              </address>

              {/* Plain Map Link - No third-party map script */}
              <div className="mb-8">
                <a
                  href={config.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-bg)',
                  }}
                  data-testid="plain-map-link"
                >
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  <span>{config.mapLinkLabel}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" aria-hidden="true" />
                </a>
                <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                  Opens your device&apos;s map application directly.
                </p>
              </div>

              {/* Visiting Hours */}
              <div className="pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <h3
                  className="text-xs uppercase tracking-wider font-medium mb-4 flex items-center gap-2"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <Clock className="w-4 h-4" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                  Visiting & Workshop Hours
                </h3>

                <ul className="space-y-2 mb-4">
                  {config.visitingHours.map((schedule) => (
                    <li
                      key={schedule.days}
                      className="flex flex-col sm:flex-row sm:items-center justify-between text-sm py-1 border-b last:border-b-0"
                      style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}
                    >
                      <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                        {schedule.days}
                      </span>
                      <span style={{ color: 'var(--color-text-muted)' }}>{schedule.hours}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-xs leading-relaxed italic" style={{ color: 'var(--color-text-muted)' }}>
                  {config.visitingNote}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
