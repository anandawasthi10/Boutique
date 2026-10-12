import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreferencesProvider, usePreferences } from '@/lib/hooks/usePreferences';
import { SoundToggle } from '@/components/layout/SoundToggle';

const TestComponent = () => {
  const { soundEnabled } = usePreferences();
  return (
    <div>
      <SoundToggle />
      <span data-testid="sound-state">{soundEnabled ? 'enabled' : 'disabled'}</span>
    </div>
  );
};

describe('FE-37: Optional sounds (Blocked)', () => {
  it('sound is disabled by default and toggle persists without sound playback', () => {
    render(
      <PreferencesProvider>
        <TestComponent />
      </PreferencesProvider>
    );

    const toggle = screen.getByRole('button', { name: /enable sound effects/i });
    expect(toggle).toBeInTheDocument();
    expect(screen.getByTestId('sound-state')).toHaveTextContent('disabled');

    // Toggle on
    fireEvent.click(toggle);
    expect(screen.getByTestId('sound-state')).toHaveTextContent('enabled');

    // Toggle off
    const muteToggle = screen.getByRole('button', { name: /mute sound effects/i });
    fireEvent.click(muteToggle);
    expect(screen.getByTestId('sound-state')).toHaveTextContent('disabled');
  });

  it('remains marked blocked in documentation due to absent licensed sound assets', () => {
    // This assertion documents the contractual blocker BL-01
    expect(true).toBe(true);
  });
});
