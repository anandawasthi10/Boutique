'use client';

import React, { createContext, useContext, useSyncExternalStore, useCallback } from 'react';

export interface PreferencesContextValue {
  soundEnabled: boolean;
  reducedMotion: boolean;
  toggleSound: () => void;
  setSoundEnabled: (enabled: boolean) => void;
}

const STORAGE_KEY = 'handmade_boutique_sound_preference';
const SOUND_EVENT = 'handmade_boutique_sound_change';

function subscribeSound(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener(SOUND_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(SOUND_EVENT, callback);
  };
}

function getSoundSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function getSoundServerSnapshot(): boolean {
  return false;
}

function subscribeMotion(callback: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', callback);
    return () => mediaQuery.removeEventListener('change', callback);
  }
  return () => {};
}

function getMotionSnapshot(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getMotionServerSnapshot(): boolean {
  return false;
}

const PreferencesContext = createContext<PreferencesContextValue>({
  soundEnabled: false,
  reducedMotion: false,
  toggleSound: () => {},
  setSoundEnabled: () => {},
});

export interface PreferencesProviderProps {
  children: React.ReactNode;
  overrideReducedMotion?: boolean;
}

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({
  children,
  overrideReducedMotion,
}) => {
  const soundEnabled = useSyncExternalStore(subscribeSound, getSoundSnapshot, getSoundServerSnapshot);
  const mediaReducedMotion = useSyncExternalStore(subscribeMotion, getMotionSnapshot, getMotionServerSnapshot);
  const reducedMotion = overrideReducedMotion !== undefined ? overrideReducedMotion : mediaReducedMotion;

  const setSoundEnabled = useCallback((enabled: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(SOUND_EVENT));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const toggleSound = useCallback(() => {
    try {
      const current = localStorage.getItem(STORAGE_KEY) === 'true';
      const next = !current;
      localStorage.setItem(STORAGE_KEY, String(next));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(SOUND_EVENT));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  return (
    <PreferencesContext.Provider
      value={{
        soundEnabled,
        reducedMotion,
        toggleSound,
        setSoundEnabled,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextValue => {
  return useContext(PreferencesContext);
};

