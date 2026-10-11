/**
 * Design Tokens as defined in Frontend Specification Document
 * All colours, typography, radii, spacing, and shadows
 */

export const COLOR_TOKENS = {
  bg: '#FAF6EF',
  surface: '#F3EBDD',
  surfaceAlt: '#EDE2D1',
  border: '#E3D8C9',
  text: '#4A3A33',
  textMuted: '#7A655B',
  primary: '#4A3A33',
  primaryText: '#FAF6EF',
  blush: '#E8C4C0',
  blushDeep: '#D9A5A0',
  sage: '#9CAF98',
  sageDeep: '#6F8470',
  lavender: '#B9A9D1',
  error: '#B3463F',
  warning: '#B7883A',
  focus: '#4A3A33',
} as const;

export const TYPE_SCALE = {
  display: {
    mobile: '40px',
    desktop: '64px',
    lineHeightMobile: '1.1',
    lineHeightDesktop: '1.05',
    weight: '500',
    font: 'var(--font-heading)',
  },
  h1: {
    mobile: '32px',
    desktop: '48px',
    lineHeightMobile: '1.15',
    lineHeightDesktop: '1.1',
    weight: '500',
    font: 'var(--font-heading)',
  },
  h2: {
    mobile: '26px',
    desktop: '36px',
    lineHeightMobile: '1.2',
    lineHeightDesktop: '1.15',
    weight: '500',
    font: 'var(--font-heading)',
  },
  h3: {
    mobile: '20px',
    desktop: '24px',
    lineHeightMobile: '1.3',
    lineHeightDesktop: '1.25',
    weight: '600',
    font: 'var(--font-heading)',
  },
  body: {
    mobile: '16px',
    desktop: '16px',
    lineHeight: '1.6',
    weight: '400',
    font: 'var(--font-body)',
  },
  bodySmall: {
    mobile: '14px',
    desktop: '14px',
    lineHeight: '1.5',
    weight: '400',
    font: 'var(--font-body)',
  },
  label: {
    mobile: '13px',
    desktop: '13px',
    lineHeight: '1.4',
    weight: '500',
    font: 'var(--font-body)',
    letterSpacing: '0.05em',
  },
  button: {
    mobile: '15px',
    desktop: '15px',
    lineHeight: '1',
    weight: '500',
    font: 'var(--font-body)',
  },
  price: {
    mobile: '18px',
    desktop: '20px',
    lineHeight: '1.2',
    weight: '500',
    font: 'var(--font-body)',
  },
} as const;

export const RADII = {
  button: '4px',
  input: '4px',
  card: '4px',
  panel: '4px',
  swatch: '9999px',
} as const;

export const SHADOWS = {
  soft: '0 8px 30px rgba(74, 58, 51, 0.08)',
} as const;
