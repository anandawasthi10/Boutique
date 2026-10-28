'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  side?: 'right' | 'left';
  footer?: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  id,
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  footer,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store trigger focus when opened, return focus on close
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      // Focus drawer or first focusable element
      setTimeout(() => {
        if (drawerRef.current) {
          const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) {
            focusable[0].focus();
          } else {
            drawerRef.current.focus();
          }
        }
      }, 50);
    } else {
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Trap focus and close on Escape
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity duration-300"
        aria-hidden="true"
        onClick={onClose}
        data-testid="drawer-backdrop"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        className={`relative z-10 w-full sm:max-w-md h-full bg-[var(--color-ivory)] text-[var(--color-ink)] shadow-[var(--shadow-soft)] flex flex-col focus:outline-none transition-transform duration-300 ${
          side === 'right' ? 'ml-auto' : 'mr-auto'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-line)]">
          <h2 id="drawer-title" className="text-h3 font-medium text-[var(--color-ink)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-[var(--color-ink)] hover:opacity-75 rounded-[4px] transition-opacity cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-plum)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {/* Footer if provided */}
        {footer && (
          <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
