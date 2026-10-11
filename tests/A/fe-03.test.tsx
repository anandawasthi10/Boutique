import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Button,
  Input,
  Select,
  Checkbox,
  Badge,
  Skeleton,
  Drawer,
  Modal,
  EmptyState,
  ErrorState,
} from '@/components/ui';

describe('FE-03: Base UI components', () => {
  describe('Button component', () => {
    it('renders with children and primary styling by default', () => {
      render(<Button>Click me</Button>);
      const btn = screen.getByRole('button', { name: /click me/i });
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveClass('bg-[var(--color-primary)]');
    });

    it('renders secondary and icon variants', () => {
      const { rerender } = render(<Button variant="secondary">Secondary</Button>);
      let btn = screen.getByRole('button', { name: /secondary/i });
      expect(btn).toHaveClass('border-[var(--color-primary)]');

      rerender(<Button variant="icon" aria-label="Close" />);
      btn = screen.getByRole('button', { name: /close/i });
      expect(btn).toHaveClass('rounded-full');
    });

    it('handles disabled state and prevents click events', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      const btn = screen.getByRole('button', { name: /disabled/i });
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('shows loading spinner and disables clicks when isLoading is true', () => {
      const handleClick = vi.fn();
      render(
        <Button isLoading onClick={handleClick}>
          Submit
        </Button>
      );
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Input component', () => {
    it('renders with always-visible label and 16px text', () => {
      render(<Input label="Full Name" placeholder="Enter name" />);
      const label = screen.getByText('Full Name');
      expect(label).toBeInTheDocument();
      const input = screen.getByPlaceholderText('Enter name');
      expect(input).toHaveClass('text-[16px]');
      expect(input).not.toHaveAttribute('aria-invalid', 'true');
    });

    it('displays error message linked via aria-describedby and marks aria-invalid', () => {
      render(<Input label="Email Address" error="Please enter a valid email" />);
      const input = screen.getByLabelText(/email address/i);
      expect(input).toHaveAttribute('aria-invalid', 'true');
      const errorMsg = screen.getByRole('alert');
      expect(errorMsg).toHaveTextContent('Please enter a valid email');
      expect(input).toHaveAttribute('aria-describedby', errorMsg.id);
    });
  });

  describe('Select and Checkbox', () => {
    it('renders Select with accessible options and label', () => {
      render(
        <Select
          label="Size"
          options={[
            { value: 'reg', label: 'Regular' },
            { value: 'lg', label: 'Large' },
          ]}
        />
      );
      expect(screen.getByLabelText('Size')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveValue('reg');
    });

    it('renders Checkbox and handles toggle state', () => {
      const handleChange = vi.fn();
      render(<Checkbox label="I agree to terms" onChange={handleChange} />);
      const checkbox = screen.getByRole('checkbox', { name: /i agree to terms/i });
      expect(checkbox).not.toBeChecked();
      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Drawer and Modal', () => {
    it('renders Drawer when open, handles Escape key and backdrop click', () => {
      const handleClose = vi.fn();
      const { rerender } = render(
        <Drawer isOpen={true} onClose={handleClose} title="Your Cart">
          <p>Cart content</p>
        </Drawer>
      );

      expect(screen.getByRole('dialog', { name: /your cart/i })).toBeInTheDocument();
      expect(screen.getByText('Cart content')).toBeInTheDocument();

      // Backdrop click
      const backdrop = screen.getByTestId('drawer-backdrop');
      fireEvent.click(backdrop);
      expect(handleClose).toHaveBeenCalledTimes(1);

      // Escape key
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(2);

      // Closes when isOpen is false
      rerender(
        <Drawer isOpen={false} onClose={handleClose} title="Your Cart">
          <p>Cart content</p>
        </Drawer>
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders Modal and closes with Escape key', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Edit Item">
          <p>Modal body</p>
        </Modal>
      );

      expect(screen.getByRole('dialog', { name: /edit item/i })).toBeInTheDocument();
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('EmptyState, ErrorState, Badge, Skeleton', () => {
    it('renders EmptyState with action button', () => {
      const handleAction = vi.fn();
      render(
        <EmptyState
          title="No products found"
          description="Try clearing your filters"
          actionLabel="Clear Filters"
          onAction={handleAction}
        />
      );
      expect(screen.getByRole('heading', { level: 3, name: /no products found/i })).toBeInTheDocument();
      const btn = screen.getByRole('button', { name: /clear filters/i });
      fireEvent.click(btn);
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('renders ErrorState with alert role and retry action', () => {
      const handleRetry = vi.fn();
      render(
        <ErrorState
          title="Failed to load items"
          message="Server did not respond."
          onRetry={handleRetry}
        />
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
      const btn = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(btn);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('renders Badge and Skeleton', () => {
      render(
        <div>
          <Badge variant="sage">New Arrival</Badge>
          <Skeleton width={100} height={20} />
        </div>
      );
      expect(screen.getByText('New Arrival')).toHaveClass('bg-[var(--color-sage)]');
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });
});
