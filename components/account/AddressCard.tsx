'use client';

import React from 'react';
import { Address } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { MapPin, Phone, Edit2, Trash2, Check } from 'lucide-react';

export interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (address: Address) => void;
  onSetDefault: (address: Address) => void;
  isSettingDefault?: boolean;
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isSettingDefault = false,
}) => {
  return (
    <div
      className={`bg-[var(--color-surface)] border rounded-[4px] p-5 sm:p-6 transition-all duration-150 flex flex-col justify-between ${
        address.isDefault
          ? 'border-[var(--color-primary)] shadow-xs'
          : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
      }`}
      data-testid={`address-card-${address.id}`}
    >
      <div>
        {/* Header with Name and Default Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-body font-semibold text-[var(--color-text)]">
              {address.recipientName}
            </h3>
            {address.isDefault && (
              <span
                data-testid="default-badge"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--color-primary)]/10 text-[var(--color-primary)] uppercase tracking-wider"
              >
                <Check className="w-3 h-3" />
                Default
              </span>
            )}
          </div>
        </div>

        {/* Address Lines */}
        <div className="text-body-small text-[var(--color-text-muted)] space-y-1 mb-4 leading-relaxed">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 shrink-0 text-[var(--color-text-muted)] mt-0.5" />
            <div>
              <p className="text-[var(--color-text)]">{address.line1}</p>
              {address.line2 && <p>{address.line2}</p>}
              <p>
                {address.city}, {address.state} - {address.pinCode}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Phone className="w-4 h-4 shrink-0 text-[var(--color-text-muted)]" />
            <span>{address.phone}</span>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="text"
            size="sm"
            onClick={() => onEdit(address)}
            className="text-xs h-8 px-2.5"
            data-testid={`edit-address-btn-${address.id}`}
          >
            <Edit2 className="w-3.5 h-3.5 mr-1" />
            <span>Edit</span>
          </Button>

          <Button
            type="button"
            variant="text"
            size="sm"
            onClick={() => onDelete(address)}
            className="text-xs h-8 px-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
            data-testid={`delete-address-btn-${address.id}`}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            <span>Delete</span>
          </Button>
        </div>

        {!address.isDefault && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isSettingDefault}
            isLoading={isSettingDefault}
            onClick={() => onSetDefault(address)}
            className="text-xs h-8 px-3"
            data-testid={`set-default-btn-${address.id}`}
          >
            <span>Set as Default</span>
          </Button>
        )}
      </div>
    </div>
  );
};
