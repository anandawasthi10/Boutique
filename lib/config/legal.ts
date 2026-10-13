/**
 * Centralized Legal & Trust Configuration (Privacy Policy & Terms of Service)
 *
 * Conforms to R-11: Content is clearly marked placeholder text stating
 * that the policy must be written and approved by the client and a qualified person.
 * Contains short headings outline only without writing legal claims.
 */

export interface LegalSection {
  title: string;
  description: string;
}

export interface LegalPageConfig {
  headline: string;
  subheadline: string;
  leadParagraph: string;
  approvalNotice: string;
  sections: LegalSection[];
}

export const PRIVACY_POLICY_CONFIG: LegalPageConfig = {
  headline: 'Privacy Policy',
  subheadline: 'Customer Privacy & Data',
  leadParagraph:
    'Information regarding the handling, storage, and protection of customer information.',
  approvalNotice:
    'Notice: This policy is placeholder text. The final privacy policy must be written and approved by the client and a qualified legal professional prior to store launch.',
  sections: [
    {
      title: 'Information Collected',
      description:
        'Outline to be provided by the client and qualified counsel specifying personal information collected, including names, contact email, delivery addresses, and order records.',
    },
    {
      title: 'How It Is Used',
      description:
        'Outline to be provided detailing the purposes for processing customer information, such as processing orders, coordinating deliveries, and providing customer support.',
    },
    {
      title: 'Payments',
      description:
        'Outline to be provided detailing secure payment transaction processing and third-party payment gateway integrations. No raw payment credentials are stored on store servers.',
    },
    {
      title: 'Delivery and Returns',
      description:
        'Outline to be provided regarding delivery address sharing with courier partners and information needed to handle product exchanges or returns.',
    },
    {
      title: 'Contact',
      description:
        'For privacy-related inquiries, requests, or questions regarding personal data, please contact the studio at hello@example.com.',
    },
  ],
};

export const TERMS_OF_SERVICE_CONFIG: LegalPageConfig = {
  headline: 'Terms of Service',
  subheadline: 'Studio Terms & Conditions',
  leadParagraph:
    'Guidelines and terms governing orders, bespoke accessory configuration, and website usage.',
  approvalNotice:
    'Notice: This agreement is placeholder text. The final terms of service must be written and approved by the client and a qualified legal professional prior to store launch.',
  sections: [
    {
      title: 'Information Collected',
      description:
        'Outline to be provided by the client and qualified counsel regarding account credentials, accurate customer submissions, and acceptable use guidelines.',
    },
    {
      title: 'How It Is Used',
      description:
        'Outline to be provided covering terms for placing orders, customizing accessory fabrics and finishes, and studio order acceptance.',
    },
    {
      title: 'Payments',
      description:
        'Outline to be provided specifying accepted payment methods, currency, pricing accuracy, tax details, and transaction requirements.',
    },
    {
      title: 'Delivery and Returns',
      description:
        'Outline to be provided covering dispatch conditions, delivery timelines, handcrafted tolerances, and policies for cancellations, exchanges, and returns.',
    },
    {
      title: 'Contact',
      description:
        'For inquiries or notices regarding these terms of service, please reach out to the studio at hello@example.com.',
    },
  ],
};
