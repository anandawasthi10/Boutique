import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  SwatchGroup,
  ColourGroup,
  ChipsGroup,
  ToggleGroup,
  OptionGroupRenderer,
} from '@/components/configurator';
import { OptionGroup } from '@/lib/types';

describe('FE-16: Option group components', () => {
  const mockSwatchGroup: OptionGroup = {
    id: 'fabric',
    label: 'Fabric',
    type: 'swatch',
    required: true,
    options: [
      {
        id: 'opt-floral',
        label: 'Floral',
        priceDelta: 0,
        available: true,
        swatchImageUrl: '/images/swatches/floral.svg',
      },
      {
        id: 'opt-corduroy',
        label: 'Corduroy',
        priceDelta: 50,
        available: true,
        swatchImageUrl: '/images/swatches/corduroy.svg',
      },
      {
        id: 'opt-silk',
        label: 'Silk',
        priceDelta: 100,
        available: false,
        unavailableReason: 'Out of stock',
        swatchImageUrl: '/images/swatches/silk.svg',
      },
    ],
  };

  const mockColourGroup: OptionGroup = {
    id: 'zipper-colour',
    label: 'Zipper Colour',
    type: 'colour',
    required: false,
    options: [
      {
        id: 'col-gold',
        label: 'Antique Gold',
        colourValue: '#D4AF37',
        priceDelta: 0,
        available: true,
      },
      {
        id: 'col-silver',
        label: 'Silver',
        colourValue: '#C0C0C0',
        priceDelta: 20,
        available: false,
        unavailableReason: 'Backorder',
      },
    ],
  };

  const mockChipsGroup: OptionGroup = {
    id: 'size',
    label: 'Size',
    type: 'chips',
    required: true,
    options: [
      {
        id: 'size-reg',
        label: 'Regular',
        detail: '10 cm dia',
        priceDelta: 0,
        available: true,
      },
      {
        id: 'size-lg',
        label: 'Large',
        detail: '15 cm dia',
        priceDelta: 40,
        available: true,
      },
    ],
  };

  const mockToggleGroup: OptionGroup = {
    id: 'lining',
    label: 'Silk Lining',
    type: 'toggle',
    required: false,
    options: [
      {
        id: 'opt-lining',
        label: 'Add Silk Lining',
        priceDelta: 150,
        available: true,
        detail: 'Handmade pure mulberry silk lining',
      },
    ],
  };

  it('swatch group displays texture image, selected fabric name, and check icon', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <SwatchGroup
        group={mockSwatchGroup}
        selectedOptionId="opt-floral"
        onChange={handleChange}
      />
    );

    // Selected fabric name is displayed in plain text
    expect(screen.getByText(/selected:/i)).toHaveTextContent('Selected: Floral');

    // Selected radio has aria-checked="true"
    const floralRadio = screen.getByRole('radio', { name: /floral/i });
    expect(floralRadio).toHaveAttribute('aria-checked', 'true');

    // Checkmark SVG icon is rendered inside selected swatch (not colour alone)
    expect(container.querySelector('svg')).toBeInTheDocument();

    // Clicking available option triggers onChange
    const corduroyRadio = screen.getByRole('radio', { name: /corduroy/i });
    fireEvent.click(corduroyRadio);
    expect(handleChange).toHaveBeenCalledWith('opt-corduroy');
  });

  it('colour group displays colour dot, selected name, check icon, and unavailable reason', () => {
    const handleChange = vi.fn();
    render(
      <ColourGroup
        group={mockColourGroup}
        selectedOptionId="col-gold"
        onChange={handleChange}
      />
    );

    // Selected colour name displayed
    expect(screen.getByText(/selected:/i)).toHaveTextContent('Selected: Antique Gold');

    // Selected radio has check icon and aria-checked
    const goldRadio = screen.getByRole('radio', { name: /antique gold/i });
    expect(goldRadio).toHaveAttribute('aria-checked', 'true');

    // Unavailable option is disabled and displays its reason
    const silverRadio = screen.getByRole('radio', { name: /silver.*backorder/i });
    expect(silverRadio).toBeDisabled();
    expect(screen.getByText('Backorder')).toBeInTheDocument();
  });

  it('chips group displays details, price deltas, and check icon', () => {
    const handleChange = vi.fn();
    render(
      <ChipsGroup
        group={mockChipsGroup}
        selectedOptionId="size-lg"
        onChange={handleChange}
      />
    );

    // Detail text displayed
    expect(screen.getByText('(10 cm dia)')).toBeInTheDocument();
    expect(screen.getByText('(15 cm dia)')).toBeInTheDocument();

    // Price delta displayed
    expect(screen.getByText('+₹40')).toBeInTheDocument();

    // Selected radio has aria-checked
    const lgRadio = screen.getByRole('radio', { name: /large/i });
    expect(lgRadio).toHaveAttribute('aria-checked', 'true');
  });

  it('toggle group functions as accessible switch with label and price change', () => {
    const handleChange = vi.fn();
    render(
      <ToggleGroup
        group={mockToggleGroup}
        selectedOptionId=""
        onChange={handleChange}
      />
    );

    const toggle = screen.getByRole('switch', { name: /add silk lining/i });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText('(+₹150)')).toBeInTheDocument();

    // Clicking toggles on
    fireEvent.click(toggle);
    expect(handleChange).toHaveBeenCalledWith('opt-lining');
  });

  it('OptionGroupRenderer displays Required and Optional labels and handles safe fallbacks', () => {
    const handleChange = vi.fn();

    // 1. Required group
    const { rerender } = render(
      <OptionGroupRenderer
        group={mockSwatchGroup}
        selectedOptionId="opt-floral"
        onChange={handleChange}
      />
    );
    expect(screen.getByText('Required')).toBeInTheDocument();

    // 2. Optional group
    rerender(
      <OptionGroupRenderer
        group={mockColourGroup}
        selectedOptionId="col-gold"
        onChange={handleChange}
      />
    );
    expect(screen.getByText('Optional')).toBeInTheDocument();

    // 3. Unknown display type safe fallback (does not crash)
    const unknownGroup: OptionGroup = {
      id: 'custom-drop',
      label: 'Special Feature',
      type: 'dropdown' as unknown as OptionGroup['type'], // unrecognised type
      required: false,
      options: [
        { id: 'opt-1', label: 'Feature A', priceDelta: 0, available: true },
      ],
    };

    rerender(
      <OptionGroupRenderer
        group={unknownGroup}
        selectedOptionId=""
        onChange={handleChange}
      />
    );

    expect(screen.getByText(/unrecognised type/i)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /feature a/i })).toBeInTheDocument();
  });
});
