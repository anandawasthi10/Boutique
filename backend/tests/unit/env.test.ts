import { describe, it, expect } from 'vitest';
import { validateEnv } from '../../src/config/env.js';

describe('BE-02: Configuration and Environment Validation', () => {
  const validEnv = {
    NODE_ENV: 'test',
    PORT: '3001',
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/boutique_test',
    SESSION_SECRET: 'super-secret-session-key-at-least-32-chars-long!',
    STAFF_API_KEY: 'staff-secret-key-16-chars!',
    PAYMENT_GATEWAY: 'fake',
  };

  it('successfully validates complete valid environment configuration', () => {
    const config = validateEnv(validEnv);
    expect(config.NODE_ENV).toBe('test');
    expect(config.PORT).toBe(3001);
    expect(config.DATABASE_URL).toBe(validEnv.DATABASE_URL);
    expect(config.SESSION_SECRET).toBe(validEnv.SESSION_SECRET);
    expect(config.STAFF_API_KEY).toBe(validEnv.STAFF_API_KEY);
    expect(config.PAYMENT_GATEWAY).toBe('fake');
    expect(config.SHIPPING_FLAT_RATE).toBe(0);
    expect(config.TAX_RATE_BPS).toBe(0);
  });

  it('refuses to start and names DATABASE_URL when missing', () => {
    const invalidEnv = { ...validEnv, DATABASE_URL: undefined };
    expect(() => validateEnv(invalidEnv as any)).toThrowError(/DATABASE_URL/);
  });

  it('refuses to start and names SESSION_SECRET when missing', () => {
    const invalidEnv = { ...validEnv, SESSION_SECRET: undefined };
    expect(() => validateEnv(invalidEnv as any)).toThrowError(/SESSION_SECRET/);
  });

  it('refuses to start and names STAFF_API_KEY when missing', () => {
    const invalidEnv = { ...validEnv, STAFF_API_KEY: undefined };
    expect(() => validateEnv(invalidEnv as any)).toThrowError(/STAFF_API_KEY/);
  });

  it('enforces SESSION_SECRET minimum length of 32 characters', () => {
    const invalidEnv = { ...validEnv, SESSION_SECRET: 'too-short' };
    expect(() => validateEnv(invalidEnv as any)).toThrowError(/SESSION_SECRET must be at least 32 characters/);
  });

  it('enforces STAFF_API_KEY minimum length of 16 characters', () => {
    const invalidEnv = { ...validEnv, STAFF_API_KEY: 'short' };
    expect(() => validateEnv(invalidEnv as any)).toThrowError(/STAFF_API_KEY must be at least 16 characters/);
  });

  it('refuses to start when PAYMENT_GATEWAY is razorpay but credentials are missing', () => {
    const razorpayMissingKeys = {
      ...validEnv,
      PAYMENT_GATEWAY: 'razorpay',
    };
    expect(() => validateEnv(razorpayMissingKeys as any)).toThrowError(/PAYMENT_KEY_ID is required/);
  });

  it('succeeds when PAYMENT_GATEWAY is razorpay and all required keys are provided', () => {
    const razorpayValid = {
      ...validEnv,
      PAYMENT_GATEWAY: 'razorpay',
      PAYMENT_KEY_ID: 'rzp_test_12345',
      PAYMENT_KEY_SECRET: 'secret_key_67890',
      PAYMENT_WEBHOOK_SECRET: 'webhook_secret_abcde',
    };
    const config = validateEnv(razorpayValid as any);
    expect(config.PAYMENT_GATEWAY).toBe('razorpay');
    expect(config.PAYMENT_KEY_ID).toBe('rzp_test_12345');
  });
});
