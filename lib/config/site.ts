/**
 * Single Configuration Source for Brand, Logo, Navigation, and Contact Details
 * Conforms to Frontend Specification and Architectural Defaults
 */

export const SITE_CONFIG = {
  brandName: 'Brand Name',
  tagline: 'Handmade Accessories',
  logoText: 'Brand Name',
  navLinks: [
    { label: 'Shop All', href: '/shop' },
    { label: 'Build Your Own', href: '/build-your-own' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  footerLinks: [
    { label: 'Shop All', href: '/shop' },
    { label: 'Build Your Own', href: '/build-your-own' },
    { label: 'About the Brand', href: '/about' },
    { label: 'Contact & Store', href: '/contact' },
    { label: 'My Account', href: '/account' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
  legalLinks: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
  contact: {
    email: 'hello@example.com',
    phone: '+91 00000 00000',
    address: 'Studio address to be added',
    mapLink: 'https://maps.google.com/?q=Studio+location+to+be+added',
  },
  showSoundToggle: false,
  metadata: {
    title: 'Brand Name | Handmade Accessories',
    description: 'Personalised fabric accessories crafted with care by hand.',
    icons: {
      icon: '/favicon.ico',
      apple: '/favicon.ico',
    },
  },
} as const;
