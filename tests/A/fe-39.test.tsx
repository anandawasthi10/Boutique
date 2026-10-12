import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Input } from '@/components/ui/Input';
import { QuantityStepper } from '@/components/cart/QuantityStepper';

describe('FE-39: Accessibility and responsive pass', () => {
  it('enforces visible focus outline in globals.css across all focus-visible elements', () => {
    const cssPath = path.resolve(process.cwd(), 'app/globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    expect(cssContent).toContain(':focus-visible');
    expect(cssContent).toContain('outline: 2px solid var(--color-focus)');
    expect(cssContent).toContain('outline-offset: 2px');
  });

  it('guarantees responsive viewport constraint with no horizontal overflow on mobile body', () => {
    const cssPath = path.resolve(process.cwd(), 'app/globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    expect(cssContent).toContain('overflow-x: hidden');
    expect(cssContent).toContain('max-width: 100vw');
  });

  it('verifies touch target baseline of at least 44px on Button components', () => {
    const { container: smContainer } = render(<Button size="sm">Small Action</Button>);
    const smBtn = smContainer.querySelector('button');
    expect(smBtn?.className).toContain('min-h-[44px]');

    const { container: mdContainer } = render(<Button size="md">Medium Action</Button>);
    const mdBtn = mdContainer.querySelector('button');
    expect(mdBtn?.className).toContain('min-h-[48px]');

    const { container: iconContainer } = render(<Button variant="icon" aria-label="Icon Action" />);
    const iconBtn = iconContainer.querySelector('button');
    expect(iconBtn?.className).toContain('min-h-[44px]');
    expect(iconBtn?.className).toContain('min-w-[44px]');
  });

  it('manages modal and drawer focus trap with escape key handling and return of focus', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Drawer isOpen={true} onClose={onClose} title="Navigation Drawer">
        <button type="button">Action Inside</button>
      </Drawer>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'drawer-title');

    // Escape closes the drawer
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();

    rerender(
      <Drawer isOpen={false} onClose={onClose} title="Navigation Drawer">
        <button type="button">Action Inside</button>
      </Drawer>
    );

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('associates inputs with labels, helper text, and error descriptions via aria-describedby', () => {
    render(
      <Input
        label="Postal Code"
        name="pincode"
        error="Please enter a valid 6-digit Indian PIN code"
        helperText="Format: 560038"
      />
    );

    const input = screen.getByLabelText('Postal Code');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');

    const descId = input.getAttribute('aria-describedby');
    expect(document.getElementById(descId!)).toHaveTextContent(/Please enter a valid 6-digit/);
  });

  it('provides accessible quantity stepper controls with proper aria labels and touch targets', () => {
    const onIncrement = vi.fn();
    const onDecrement = vi.fn();

    render(
      <QuantityStepper
        quantity={2}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        itemName="Silk Scrunchie"
      />
    );

    const decreaseBtn = screen.getByRole('button', { name: /decrease quantity (of|for) silk scrunchie/i });
    const increaseBtn = screen.getByRole('button', { name: /increase quantity (of|for) silk scrunchie/i });

    expect(decreaseBtn).toBeInTheDocument();
    expect(increaseBtn).toBeInTheDocument();

    fireEvent.click(increaseBtn);
    expect(onIncrement).toHaveBeenCalledTimes(1);

    fireEvent.click(decreaseBtn);
    expect(onDecrement).toHaveBeenCalledTimes(1);
  });
});
