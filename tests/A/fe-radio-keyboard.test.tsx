import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SwatchGroup } from '@/components/configurator/SwatchGroup';
import { ChipsGroup } from '@/components/configurator/ChipsGroup';
import { ColourGroup } from '@/components/configurator/ColourGroup';
import { OptionGroup } from '@/lib/types';

const sampleGroup: OptionGroup = {
  id: 'group-fabric',
  label: 'Fabric Selection',
  type: 'swatch',
  required: true,
  options: [
    { id: 'opt-silk', label: 'Mulberry Silk', priceDelta: 0, available: true, swatchImageUrl: '/silk.jpg' },
    { id: 'opt-linen', label: 'Pure Linen', priceDelta: 50, available: false, unavailableReason: 'Out of stock' },
    { id: 'opt-velvet', label: 'Cotton Velvet', priceDelta: 100, available: true, swatchImageUrl: '/velvet.jpg' },
    { id: 'opt-satin', label: 'Organic Satin', priceDelta: 80, available: true, swatchImageUrl: '/satin.jpg' },
  ],
};

const sampleChipsGroup: OptionGroup = {
  id: 'group-size',
  label: 'Size Selection',
  type: 'chips',
  required: true,
  options: [
    { id: 'opt-s', label: 'Small', detail: '10cm', priceDelta: 0, available: true },
    { id: 'opt-m', label: 'Medium', detail: '15cm', priceDelta: 0, available: false, unavailableReason: 'Sold out' },
    { id: 'opt-l', label: 'Large', detail: '20cm', priceDelta: 50, available: true },
  ],
};

const sampleColourGroup: OptionGroup = {
  id: 'group-colour',
  label: 'Accent Colour',
  type: 'colour',
  required: true,
  options: [
    { id: 'opt-sage', label: 'Sage Green', colourValue: '#526853', priceDelta: 0, available: true },
    { id: 'opt-rose', label: 'Dusty Rose', colourValue: '#D9A5A0', priceDelta: 0, available: false },
    { id: 'opt-lav', label: 'Soft Lavender', colourValue: '#B9A9D1', priceDelta: 0, available: true },
  ],
};

describe('WAI-ARIA Radio Group Keyboard Navigation (Task 5)', () => {
  it('implements roving tabindex: first enabled option has tabindex 0 when unselected', () => {
    render(<SwatchGroup group={sampleGroup} onChange={vi.fn()} />);

    const radios = screen.getAllByRole('radio');
    // opt-silk (first enabled) should have tabIndex 0
    expect(radios[0]).toHaveAttribute('tabindex', '0');
    // opt-linen (unavailable) should have tabIndex -1
    expect(radios[1]).toHaveAttribute('tabindex', '-1');
    // opt-velvet should have tabIndex -1
    expect(radios[2]).toHaveAttribute('tabindex', '-1');
    // opt-satin should have tabIndex -1
    expect(radios[3]).toHaveAttribute('tabindex', '-1');
  });

  it('implements roving tabindex: selected option has tabindex 0 and others -1', () => {
    render(
      <SwatchGroup
        group={sampleGroup}
        selectedOptionId="opt-velvet"
        onChange={vi.fn()}
      />
    );

    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('tabindex', '-1');
    expect(radios[1]).toHaveAttribute('tabindex', '-1');
    expect(radios[2]).toHaveAttribute('tabindex', '0'); // opt-velvet
    expect(radios[3]).toHaveAttribute('tabindex', '-1');
  });

  it('navigates with ArrowRight / ArrowDown and skips unavailable options', () => {
    const handleChange = vi.fn();
    render(
      <SwatchGroup
        group={sampleGroup}
        selectedOptionId="opt-silk"
        onChange={handleChange}
      />
    );

    const radios = screen.getAllByRole('radio');
    // ArrowRight on opt-silk should skip opt-linen (unavailable) and select opt-velvet
    fireEvent.keyDown(radios[0], { key: 'ArrowRight' });
    expect(handleChange).toHaveBeenCalledWith('opt-velvet');

    // ArrowDown on opt-silk
    fireEvent.keyDown(radios[0], { key: 'ArrowDown' });
    expect(handleChange).toHaveBeenCalledWith('opt-velvet');
  });

  it('wraps around to the first enabled option on ArrowRight at the end of the group', () => {
    const handleChange = vi.fn();
    render(
      <SwatchGroup
        group={sampleGroup}
        selectedOptionId="opt-satin"
        onChange={handleChange}
      />
    );

    const radios = screen.getAllByRole('radio');
    // opt-satin is the last enabled option -> wrap around to opt-silk
    fireEvent.keyDown(radios[3], { key: 'ArrowRight' });
    expect(handleChange).toHaveBeenCalledWith('opt-silk');
  });

  it('navigates backwards with ArrowLeft / ArrowUp with wrap-around and skips unavailable', () => {
    const handleChange = vi.fn();
    render(
      <SwatchGroup
        group={sampleGroup}
        selectedOptionId="opt-silk"
        onChange={handleChange}
      />
    );

    const radios = screen.getAllByRole('radio');
    // ArrowLeft on opt-silk (first enabled) wraps to opt-satin (last enabled)
    fireEvent.keyDown(radios[0], { key: 'ArrowLeft' });
    expect(handleChange).toHaveBeenCalledWith('opt-satin');

    // ArrowLeft on opt-velvet skips opt-linen (unavailable) and selects opt-silk
    fireEvent.keyDown(radios[2], { key: 'ArrowUp' });
    expect(handleChange).toHaveBeenCalledWith('opt-silk');
  });

  it('moves to first and last enabled options on Home and End keys', () => {
    const handleChange = vi.fn();
    render(
      <SwatchGroup
        group={sampleGroup}
        selectedOptionId="opt-velvet"
        onChange={handleChange}
      />
    );

    const radios = screen.getAllByRole('radio');
    fireEvent.keyDown(radios[2], { key: 'Home' });
    expect(handleChange).toHaveBeenCalledWith('opt-silk');

    fireEvent.keyDown(radios[2], { key: 'End' });
    expect(handleChange).toHaveBeenCalledWith('opt-satin');
  });

  it('supports roving tabindex and keyboard navigation in ChipsGroup', () => {
    const handleChange = vi.fn();
    render(
      <ChipsGroup
        group={sampleChipsGroup}
        selectedOptionId="opt-s"
        onChange={handleChange}
      />
    );

    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('tabindex', '0');
    expect(radios[1]).toHaveAttribute('tabindex', '-1');
    expect(radios[2]).toHaveAttribute('tabindex', '-1');

    // ArrowRight on opt-s skips opt-m (unavailable) to opt-l
    fireEvent.keyDown(radios[0], { key: 'ArrowRight' });
    expect(handleChange).toHaveBeenCalledWith('opt-l');
  });

  it('supports roving tabindex and keyboard navigation in ColourGroup', () => {
    const handleChange = vi.fn();
    render(
      <ColourGroup
        group={sampleColourGroup}
        selectedOptionId="opt-lav"
        onChange={handleChange}
      />
    );

    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('tabindex', '-1');
    expect(radios[1]).toHaveAttribute('tabindex', '-1');
    expect(radios[2]).toHaveAttribute('tabindex', '0');

    // ArrowLeft on opt-lav skips opt-rose (unavailable) to opt-sage
    fireEvent.keyDown(radios[2], { key: 'ArrowLeft' });
    expect(handleChange).toHaveBeenCalledWith('opt-sage');
  });
});
