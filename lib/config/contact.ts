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
  headline: 'Contact',
  subheadline: 'Studio & Inquiries',
  leadParagraph:
    'Have a question about our accessories or an active order? Reach out directly or visit our studio.',
  email: 'hello@example.com',
  phone: '+910000000000',
  formattedPhone: '+91 00000 00000',
  address: {
    line1: 'Studio address to be added',
    line2: '',
    city: 'City to be added',
    state: 'State to be added',
    postalCode: '000000',
    country: 'India',
  },
  visitingHours: [
    {
      days: 'Tuesday to Friday',
      hours: '11:00 AM to 7:00 PM IST',
    },
    {
      days: 'Saturday',
      hours: '12:00 PM to 6:00 PM IST',
    },
    {
      days: 'Sunday to Monday',
      hours: 'Studio Closed',
    },
  ],
  visitingNote:
    'Studio visiting details to be added.',
  mapLink: 'https://maps.google.com/?q=Studio+location+to+be+added',
  mapLinkLabel: 'Open studio location in Google Maps',
  responseExpectation: 'We typically respond to inquiries within 24 to 48 business hours.',
  placeholderNotice:
    '(Store location details placeholder: client to verify physical studio address, telephone, and visiting hours prior to public launch.)',
};
