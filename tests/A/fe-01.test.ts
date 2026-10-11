import { describe, it, expect } from 'vitest';

describe('FE-01: Project scaffold and environment', () => {
  it('runs unit tests in the Vitest environment', () => {
    expect(true).toBe(true);
  });

  it('has node environment properly configured', () => {
    expect(typeof window).toBe('object');
  });
});
