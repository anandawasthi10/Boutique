import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { PreferencesProvider, usePreferences } from '@/lib/hooks/usePreferences';
import { SoundToggle } from '@/components/layout/SoundToggle';

describe('FE-10: Preference controls (motion and sound)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('sound is off by default and exposes soundEnabled and reducedMotion', () => {
    const { result } = renderHook(() => usePreferences(), {
      wrapper: ({ children }) => <PreferencesProvider>{children}</PreferencesProvider>,
    });

    expect(result.current.soundEnabled).toBe(false);
    expect(typeof result.current.reducedMotion).toBe('boolean');
  });

  it('toggling sound saves the choice in localStorage', () => {
    const { result } = renderHook(() => usePreferences(), {
      wrapper: ({ children }) => <PreferencesProvider>{children}</PreferencesProvider>,
    });

    expect(result.current.soundEnabled).toBe(false);
    expect(localStorage.getItem('handmade_boutique_sound_preference')).toBeNull();

    act(() => {
      result.current.toggleSound();
    });

    expect(result.current.soundEnabled).toBe(true);
    expect(localStorage.getItem('handmade_boutique_sound_preference')).toBe('true');

    act(() => {
      result.current.toggleSound();
    });

    expect(result.current.soundEnabled).toBe(false);
    expect(localStorage.getItem('handmade_boutique_sound_preference')).toBe('false');
  });

  it('restores sound preference from browser storage on mount', () => {
    localStorage.setItem('handmade_boutique_sound_preference', 'true');

    const { result } = renderHook(() => usePreferences(), {
      wrapper: ({ children }) => <PreferencesProvider>{children}</PreferencesProvider>,
    });

    expect(result.current.soundEnabled).toBe(true);
  });

  it('sound toggle button has an accessible name and clearly reflects its state', () => {
    render(
      <PreferencesProvider>
        <SoundToggle />
      </PreferencesProvider>
    );

    const toggleBtn = screen.getByRole('button', { name: /enable sound effects/i });
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');

    // Click to enable sound
    fireEvent.click(toggleBtn);

    expect(screen.getByRole('button', { name: /mute sound effects/i })).toBeInTheDocument();
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');
    expect(localStorage.getItem('handmade_boutique_sound_preference')).toBe('true');
  });

  it('reads system reduced-motion setting', () => {
    // Mock matchMedia for reduced motion
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => usePreferences(), {
      wrapper: ({ children }) => <PreferencesProvider>{children}</PreferencesProvider>,
    });

    expect(result.current.reducedMotion).toBe(true);

    window.matchMedia = originalMatchMedia;
  });

  it('does not create or play audio on initial load', () => {
    const playSpy = vi.fn();
    window.Audio = vi.fn().mockImplementation(() => ({
      play: playSpy,
    })) as unknown as typeof Audio;

    render(
      <PreferencesProvider>
        <SoundToggle />
      </PreferencesProvider>
    );

    expect(playSpy).not.toHaveBeenCalled();
  });
});
