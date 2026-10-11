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
  ],
  contact: {
    email: 'hello@brandname.com',
    phone: '+91 98765 43210',
    address: '12 Rosewood Studio, Indiranagar, Bengaluru, Karnataka 560038',
    mapLink: 'https://maps.google.com/?q=Indiranagar+Bengaluru',
  },
} as const;
