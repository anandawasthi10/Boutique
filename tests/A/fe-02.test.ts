import { describe, it, expect } from 'vitest';
import { COLOR_TOKENS, RADII, SHADOWS, TYPE_SCALE } from '@/styles/tokens';
import fs from 'fs';
import path from 'path';

// WCAG relative luminance calculation
function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

describe('FE-02: Design tokens, typography, and contrast', () => {
  it('contains all 16 required color tokens with exact hex codes', () => {
    expect(COLOR_TOKENS.bg).toBe('#FAF6EF');
    expect(COLOR_TOKENS.surface).toBe('#F3EBDD');
    expect(COLOR_TOKENS.surfaceAlt).toBe('#EDE2D1');
    expect(COLOR_TOKENS.border).toBe('#E3D8C9');
    expect(COLOR_TOKENS.text).toBe('#4A3A33');
    expect(COLOR_TOKENS.textMuted).toBe('#7A655B');
    expect(COLOR_TOKENS.primary).toBe('#4A3A33');
    expect(COLOR_TOKENS.primaryText).toBe('#FAF6EF');
    expect(COLOR_TOKENS.blush).toBe('#E8C4C0');
    expect(COLOR_TOKENS.blushDeep).toBe('#D9A5A0');
    expect(COLOR_TOKENS.sage).toBe('#9CAF98');
    expect(COLOR_TOKENS.sageDeep).toBe('#6F8470');
    expect(COLOR_TOKENS.lavender).toBe('#B9A9D1');
    expect(COLOR_TOKENS.error).toBe('#B3463F');
    expect(COLOR_TOKENS.warning).toBe('#B7883A');
    expect(COLOR_TOKENS.focus).toBe('#4A3A33');
  });

  it('defines radii and shadows as specified', () => {
    expect(RADII.button).toBe('4px');
    expect(RADII.input).toBe('4px');
    expect(SHADOWS.soft).toContain('0 8px 30px');
  });

  it('defines complete type scale according to specification', () => {
    expect(TYPE_SCALE.display.mobile).toBe('40px');
    expect(TYPE_SCALE.display.desktop).toBe('64px');
    expect(TYPE_SCALE.h1.mobile).toBe('32px');
    expect(TYPE_SCALE.h1.desktop).toBe('48px');
    expect(TYPE_SCALE.body.mobile).toBe('16px');
    expect(TYPE_SCALE.label.mobile).toBe('13px');
  });

  it('checks contrast for primary text on background (meets WCAG AAA)', () => {
    const ratio = getContrastRatio(COLOR_TOKENS.text, COLOR_TOKENS.bg);
    expect(ratio).toBeGreaterThanOrEqual(7.0); // > 10:1
  });

  it('checks contrast for primary text on surface (meets WCAG AAA)', () => {
    const ratio = getContrastRatio(COLOR_TOKENS.text, COLOR_TOKENS.surface);
    expect(ratio).toBeGreaterThanOrEqual(7.0); // > 9:1
  });

  it('checks contrast for primary button text on primary background (meets WCAG AAA)', () => {
    const ratio = getContrastRatio(COLOR_TOKENS.primaryText, COLOR_TOKENS.primary);
    expect(ratio).toBeGreaterThanOrEqual(7.0);
  });

  it('checks contrast for muted text on background (meets WCAG AA for normal text)', () => {
    const ratio = getContrastRatio(COLOR_TOKENS.textMuted, COLOR_TOKENS.bg);
    expect(ratio).toBeGreaterThanOrEqual(4.5); // ~5.1:1
  });

  it('checks contrast for error color on background (meets WCAG AA for normal text)', () => {
    const ratio = getContrastRatio(COLOR_TOKENS.error, COLOR_TOKENS.bg);
    expect(ratio).toBeGreaterThanOrEqual(4.5); // ~5.05:1
  });

  it('has reduced-motion and focus-visible rules in globals.css', () => {
    const cssContent = fs.readFileSync(path.resolve(process.cwd(), 'app/globals.css'), 'utf-8');
    expect(cssContent).toContain(':focus-visible');
    expect(cssContent).toContain('prefers-reduced-motion: reduce');
    expect(cssContent).toContain('--color-bg: #FAF6EF');
    expect(cssContent).toContain('--color-primary: #4A3A33');
  });
});
