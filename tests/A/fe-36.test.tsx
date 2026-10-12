import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactContent } from '@/app/contact/ContactContent';
import { CONTACT_CONFIG } from '@/lib/config/contact';

describe('FE-36: Contact and store location', () => {
  it('renders contact details and studio address from the centralized configuration file', () => {
    render(<ContactContent />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(CONTACT_CONFIG.headline);
    expect(screen.getByText(CONTACT_CONFIG.subheadline)).toBeInTheDocument();
    expect(screen.getByText(CONTACT_CONFIG.leadParagraph)).toBeInTheDocument();

    // Verify email link
    const emailLink = screen.getByRole('link', { name: CONTACT_CONFIG.email });
    expect(emailLink).toHaveAttribute('href', `mailto:${CONTACT_CONFIG.email}`);

    // Verify phone link
    const phoneLink = screen.getByRole('link', { name: CONTACT_CONFIG.formattedPhone });
    expect(phoneLink).toHaveAttribute('href', `tel:${CONTACT_CONFIG.phone}`);

    // Verify address components
    expect(screen.getByText(CONTACT_CONFIG.address.line1)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(CONTACT_CONFIG.address.city, 'i'))).toBeInTheDocument();
  });

  it('renders a plain map link and does not load third-party map scripts or iframe embeds', () => {
    const { container } = render(<ContactContent />);

    const mapLink = screen.getByTestId('plain-map-link');
    expect(mapLink).toBeInTheDocument();
    expect(mapLink).toHaveAttribute('href', CONTACT_CONFIG.mapLink);
    expect(mapLink).toHaveAttribute('target', '_blank');
    expect(mapLink).toHaveAttribute('rel', 'noopener noreferrer');

    // Confirm no third-party Google Maps or Leaflet script tags or iframe elements
    expect(container.querySelector('iframe')).toBeNull();
    expect(container.querySelector('script')).toBeNull();
  });

  it('does not render an unagreed contact form because no API endpoint exists in the contract', () => {
    const { container } = render(<ContactContent />);

    // No form tag rendered
    expect(container.querySelector('form')).toBeNull();

    // No inputs for message or name submission
    expect(screen.queryByRole('textbox', { name: /message/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /send message|submit/i })).toBeNull();
  });

  it('displays studio visiting hours and client placeholder notice', () => {
    render(<ContactContent />);

    // Visiting hours
    CONTACT_CONFIG.visitingHours.forEach((vh) => {
      expect(screen.getByText(vh.days)).toBeInTheDocument();
      expect(screen.getByText(vh.hours)).toBeInTheDocument();
    });

    // Placeholder notice
    const notice = screen.getByTestId('contact-placeholder-notice');
    expect(notice).toBeInTheDocument();
    expect(notice).toHaveTextContent(/store location details placeholder/i);
  });
});
