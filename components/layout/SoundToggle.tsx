'use client';

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { usePreferences } from '@/lib/hooks/usePreferences';

export interface SoundToggleProps {
  className?: string;
}

export const SoundToggle: React.FC<SoundToggleProps> = ({ className = '' }) => {
  const { soundEnabled, toggleSound } = usePreferences();

  return (
    <button
      type="button"
      onClick={toggleSound}
      aria-label={
        soundEnabled
          ? 'Mute sound effects (sound is currently enabled)'
          : 'Enable sound effects (sound is currently disabled)'
      }
      aria-pressed={soundEnabled}
      title={soundEnabled ? 'Mute sound' : 'Enable sound'}
      className={`min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-[4px] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--color-focus)] ${className}`.trim()}
    >
      {soundEnabled ? (
        <Volume2 className="w-5 h-5 text-[var(--color-primary)]" aria-hidden="true" />
      ) : (
        <VolumeX className="w-5 h-5 text-[var(--color-text-muted)]" aria-hidden="true" />
      )}
    </button>
  );
};
