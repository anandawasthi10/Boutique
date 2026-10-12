/**
 * Contact and store location configuration
 * All contact details, studio visiting hours, and map links are centralized here
 * for straightforward client customization.
 */

export interface StudioHours {
  days: string;
  hours: string;
}

export interface ContactConfig {
  headline: string;
  subheadline: string;
  leadParagraph: string;
  email: string;
  phone: string;
  formattedPhone: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  visitingHours: StudioHours[];
  visitingNote: string;
  mapLink: string;
  mapLinkLabel: string;
  responseExpectation: string;
  placeholderNotice: string;
}

export const CONTACT_CONFIG: ContactConfig = {
  headline: 'Get in Touch with Our Atelier',
  subheadline: 'Studio & Concierge',
  leadParagraph:
    'Have a question about our bespoke accessories, fabric sourcing, or an active order? Reach out directly or visit our studio during open workshop hours.',
  email: 'studio@handmadeboutique.com',
  phone: '+919876543210',
  formattedPhone: '+91 98765 43210',
  address: {
    line1: 'Atelier 4, Crafts Quarter',
    line2: '12th Main Road, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    country: 'India',
  },
  visitingHours: [
    {
      days: 'Tuesday – Friday',
      hours: '11:00 AM – 7:00 PM IST',
    },
    {
      days: 'Saturday',
      hours: '12:00 PM – 6:00 PM IST',
    },
    {
      days: 'Sunday – Monday',
      hours: 'Studio Closed (Crafting Days)',
    },
  ],
  visitingNote:
    'Our studio is a working textile workshop. Private styling appointments and bespoke fabric viewings can be scheduled in advance via email.',
  mapLink: 'https://maps.google.com/?q=Atelier+4+Crafts+Quarter+Indiranagar+Bengaluru+560038',
  mapLinkLabel: 'Open atelier location in Google Maps',
  responseExpectation: 'We typically respond to inquiries within 24 to 48 business hours.',
  placeholderNotice:
    '(Store location details placeholder: client to verify physical atelier address, telephone, and studio visiting hours prior to public launch.)',
};
