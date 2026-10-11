'use client';

import React, { useState, useRef } from 'react';
import { Address, AddressInput } from '@/lib/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

export interface AddressFormProps {
  initialAddress?: Address | null;
  onSubmit: (data: AddressInput) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverError?: string | null;
  serverFieldErrors?: Record<string, string>;
  submitLabel?: string;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  initialAddress,
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError,
  serverFieldErrors = {},
  submitLabel,
}) => {
  const [recipientName, setRecipientName] = useState(initialAddress?.recipientName ?? '');
  const [phone, setPhone] = useState(initialAddress?.phone ?? '');
  const [line1, setLine1] = useState(initialAddress?.line1 ?? '');
  const [line2, setLine2] = useState(initialAddress?.line2 ?? '');
  const [city, setCity] = useState(initialAddress?.city ?? '');
  const [state, setState] = useState(initialAddress?.state ?? '');
  const [pinCode, setPinCode] = useState(initialAddress?.pinCode ?? '');
  const [isDefault, setIsDefault] = useState(initialAddress?.isDefault ?? false);

  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const line1Ref = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLInputElement>(null);
  const pinCodeRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!recipientName.trim()) {
      errors.recipientName = 'Recipient name is required.';
    }

    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      errors.phone = 'Phone number is required.';
    } else if (!/^[6-9]\d{9}$/.test(trimmedPhone)) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number.';
    }

    if (!line1.trim()) {
      errors.line1 = 'Address line 1 is required.';
    }

    if (!city.trim()) {
      errors.city = 'City / Town is required.';
    }

    if (!state.trim()) {
      errors.state = 'State is required.';
    }

    const trimmedPin = pinCode.trim();
    if (!trimmedPin) {
      errors.pinCode = 'PIN code is required.';
    } else if (!/^\d{6}$/.test(trimmedPin)) {
      errors.pinCode = 'Please enter a valid 6-digit PIN code.';
    }

    setClientErrors(errors);

    // Focus first invalid field
    if (errors.recipientName) {
      nameRef.current?.focus();
      return false;
    }
    if (errors.phone) {
      phoneRef.current?.focus();
      return false;
    }
    if (errors.line1) {
      line1Ref.current?.focus();
      return false;
    }
    if (errors.city) {
      cityRef.current?.focus();
      return false;
    }
    if (errors.state) {
      stateRef.current?.focus();
      return false;
    }
    if (errors.pinCode) {
      pinCodeRef.current?.focus();
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) {
      return;
    }

    await onSubmit({
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      line1: line1.trim(),
      line2: line2.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      pinCode: pinCode.trim(),
      isDefault,
    });
  };

  const getFieldError = (field: string): string | undefined => {
    return clientErrors[field] || serverFieldErrors[field];
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4 text-left"
      data-testid="address-form"
    >
      {serverError && (
        <div
          role="alert"
          data-testid="address-form-server-error"
          className="p-3.5 rounded-[4px] bg-error/10 border border-error/20 flex items-start gap-2.5 text-xs text-[var(--color-error)]"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Recipient Name and Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          ref={nameRef}
          id="address-recipient-name"
          name="recipientName"
          type="text"
          label="Full Name / Recipient"
          required
          disabled={isSubmitting}
          value={recipientName}
          onChange={(e) => {
            setRecipientName(e.target.value);
            if (clientErrors.recipientName) {
              setClientErrors((prev) => ({ ...prev, recipientName: '' }));
            }
          }}
          error={getFieldError('recipientName')}
          placeholder="Ananya Roy"
        />

        <Input
          ref={phoneRef}
          id="address-phone"
          name="phone"
          type="tel"
          label="Phone Number"
          required
          disabled={isSubmitting}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (clientErrors.phone) {
              setClientErrors((prev) => ({ ...prev, phone: '' }));
            }
          }}
          error={getFieldError('phone')}
          helperText="10-digit mobile number for delivery coordination"
          placeholder="9876543210"
        />
      </div>

      {/* Address Line 1 */}
      <Input
        ref={line1Ref}
        id="address-line1"
        name="line1"
        type="text"
        label="Flat, House no., Building, Street (Line 1)"
        required
        disabled={isSubmitting}
        value={line1}
        onChange={(e) => {
          setLine1(e.target.value);
          if (clientErrors.line1) {
            setClientErrors((prev) => ({ ...prev, line1: '' }));
          }
        }}
        error={getFieldError('line1')}
        placeholder="Flat 402, Lotus Residency, 12th Main"
      />

      {/* Address Line 2 (Optional) */}
      <Input
        id="address-line2"
        name="line2"
        type="text"
        label="Area, Landmark, Sector (Line 2 - Optional)"
        disabled={isSubmitting}
        value={line2}
        onChange={(e) => setLine2(e.target.value)}
        error={getFieldError('line2')}
        placeholder="Near Sunshine Park"
      />

      {/* City, State, PIN Code */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          ref={cityRef}
          id="address-city"
          name="city"
          type="text"
          label="City / Town"
          required
          disabled={isSubmitting}
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            if (clientErrors.city) {
              setClientErrors((prev) => ({ ...prev, city: '' }));
            }
          }}
          error={getFieldError('city')}
          placeholder="Bengaluru"
        />

        <Input
          ref={stateRef}
          id="address-state"
          name="state"
          type="text"
          label="State"
          required
          disabled={isSubmitting}
          value={state}
          onChange={(e) => {
            setState(e.target.value);
            if (clientErrors.state) {
              setClientErrors((prev) => ({ ...prev, state: '' }));
            }
          }}
          error={getFieldError('state')}
          placeholder="Karnataka"
        />

        <Input
          ref={pinCodeRef}
          id="address-pincode"
          name="pinCode"
          type="text"
          label="6-Digit PIN Code"
          required
          maxLength={6}
          disabled={isSubmitting}
          value={pinCode}
          onChange={(e) => {
            setPinCode(e.target.value);
            if (clientErrors.pinCode) {
              setClientErrors((prev) => ({ ...prev, pinCode: '' }));
            }
          }}
          error={getFieldError('pinCode')}
          placeholder="560001"
        />
      </div>

      {/* Set as Default Checkbox */}
      <div className="flex items-center gap-2.5 mt-1">
        <input
          type="checkbox"
          id="address-is-default"
          name="isDefault"
          checked={isDefault}
          disabled={isSubmitting}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
        />
        <label
          htmlFor="address-is-default"
          className="text-body-small text-[var(--color-text)] select-none cursor-pointer"
        >
          Set as default delivery address
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[var(--color-border)]">
        {onCancel && (
          <Button
            type="button"
            variant="text"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          data-testid="address-submit-btn"
        >
          {submitLabel ?? (initialAddress ? 'Update Address' : 'Save Address')}
        </Button>
      </div>
    </form>
  );
};
