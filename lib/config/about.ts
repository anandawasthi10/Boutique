/**
 * Editorial content for the About page
 * All text is centralized in this configuration file for straightforward client replacement.
 * Contains no invented history, artificial awards, fake metrics, or fabricated testimonials.
 */

export interface AboutSection {
  title: string;
  body: string;
}

export interface AboutContentConfig {
  headline: string;
  subheadline: string;
  leadParagraph: string;
  artisanNoteTitle: string;
  artisanNotePlaceholder: string;
  sections: AboutSection[];
  materialStoryTitle: string;
  materialStoryBody: string;
  image: {
    src: string;
    alt: string;
    caption: string;
  };
}

export const ABOUT_CONTENT: AboutContentConfig = {
  headline: 'Handmade Fabric Accessories',
  subheadline: 'Studio & Workshop',
  leadParagraph:
    'We make fabric accessories including scrunchies, pouches, and sleeves. Every piece is cut, stitched, and assembled by hand in our studio using natural textiles.',
  artisanNoteTitle: 'About the Studio',
  artisanNotePlaceholder:
    '(Founder story placeholder: client to supply personal studio background, craft journey, and regional textile inspiration.)',
  sections: [
    {
      title: 'Handmade Assembly',
      body:
        'We produce pieces in our studio and offer customizable options so each accessory can be tailored to your preference.',
    },
    {
      title: 'Fabrics & Textiles',
      body:
        'We work with textiles including linen, corduroy, cotton prints, and velvet across our collection.',
    },
    {
      title: 'Everyday Utility',
      body:
        'Our collection includes pouches with zippers, padded device sleeves, and hair scrunchies designed for daily use.',
    },
  ],
  materialStoryTitle: 'Materials & Details',
  materialStoryBody:
    'Hardware and textiles are chosen for each accessory type. Custom options allow you to choose fabrics, dimensions, and finishes.',
  image: {
    src: '/images/placeholders/pouch-1.svg',
    alt: 'Handcrafted studio accessory with natural fabric texture (Placeholder)',
    caption: 'Studio work in progress: textile cutting and tactile finishing (Placeholder).',
  },
};
