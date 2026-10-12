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
  headline: 'Crafted with Intention and Care',
  subheadline: 'Our Studio Philosophy',
  leadParagraph:
    'We believe everyday accessories should feel personal, enduring, and pleasurable to touch. Every scrunchie, pouch, and sleeve in our collection is cut, stitched, and assembled by hand in our independent studio using carefully chosen natural textiles.',
  artisanNoteTitle: 'About the Atelier',
  artisanNotePlaceholder:
    '(Founder story placeholder: client to supply personal studio background, craft journey, and regional textile inspiration.)',
  sections: [
    {
      title: 'Small-Batch Handcrafting',
      body:
        'Rather than mass manufacturing, we produce pieces in restrained quantities. This allows us to inspect every seam, finish edges with precision, and offer customizable options so each accessory reflects its owner.',
    },
    {
      title: 'Tactile, Natural Materials',
      body:
        'We work predominantly with tactile fabrics that age gracefully: breathable linen, ribbed corduroy, soft cotton prints, and plush velvet. Every textile is selected for its hand-feel, durability, and daily comfort.',
    },
    {
      title: 'Form Meets Daily Utility',
      body:
        'A pouch must zip smoothly; a sleeve must cushion your laptop without unnecessary bulk; a scrunchie must hold gently without tugging. We refine every measurement so our pieces serve your routine effortlessly.',
    },
  ],
  materialStoryTitle: 'A Commitment to Quality',
  materialStoryBody:
    'From brass zippers to reinforced lining, we use hardware and threads chosen for longevity. When you choose a bespoke accessory, you receive a piece made thoughtfully from first cut to final knot.',
  image: {
    src: '/images/placeholders/pouch-1.svg',
    alt: 'Handcrafted studio accessory with natural fabric texture (Placeholder)',
    caption: 'Studio work in progress: textile cutting and tactile finishing (Placeholder).',
  },
};
