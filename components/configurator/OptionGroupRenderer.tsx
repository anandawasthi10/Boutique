import React from 'react';
import { OptionGroup } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { SwatchGroup } from './SwatchGroup';
import { ColourGroup } from './ColourGroup';
import { ChipsGroup } from './ChipsGroup';
import { ToggleGroup } from './ToggleGroup';

export interface OptionGroupRendererProps {
  group: OptionGroup;
  selectedOptionId?: string;
  onChange: (optionId: string) => void;
  disabled?: boolean;
}

/**
 * Safe fallback component for unrecognised display types
 * Prevents application crashes while still rendering selectable options.
 */
const FallbackOptionGroup: React.FC<OptionGroupRendererProps> = ({
  group,
  selectedOptionId,
  onChange,
  disabled,
}) => {
  return (
    <div className="space-y-2">
      <div className="text-xs text-warning bg-surface-alt p-2 rounded-xs">
        Standard display option (unrecognised type &ldquo;{group.type}&rdquo;)
      </div>
      <ChipsGroup
        group={group}
        selectedOptionId={selectedOptionId}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
};

export const OptionGroupRenderer: React.FC<OptionGroupRendererProps> = ({
  group,
  selectedOptionId,
  onChange,
  disabled = false,
}) => {
  const renderControl = () => {
    switch (group.type) {
      case 'swatch':
        return (
          <SwatchGroup
            group={group}
            selectedOptionId={selectedOptionId}
            onChange={onChange}
            disabled={disabled}
          />
        );
      case 'colour':
        return (
          <ColourGroup
            group={group}
            selectedOptionId={selectedOptionId}
            onChange={onChange}
            disabled={disabled}
          />
        );
      case 'chips':
        return (
          <ChipsGroup
            group={group}
            selectedOptionId={selectedOptionId}
            onChange={onChange}
            disabled={disabled}
          />
        );
      case 'toggle':
        return (
          <ToggleGroup
            group={group}
            selectedOptionId={selectedOptionId}
            onChange={onChange}
            disabled={disabled}
          />
        );
      default:
        return (
          <FallbackOptionGroup
            group={group}
            selectedOptionId={selectedOptionId}
            onChange={onChange}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <fieldset className="border-none p-0 m-0 space-y-2.5">
      {/* Group Header: Label and Required/Optional status */}
      <div className="flex items-center justify-between">
        <legend className="text-xs font-medium uppercase tracking-wider text-text">
          {group.label}
        </legend>
        {group.required ? (
          <Badge variant="muted" className="text-[11px] text-primary">
            Required
          </Badge>
        ) : (
          <span className="text-xs text-text-muted">Optional</span>
        )}
      </div>

      {/* Render matching display type */}
      {renderControl()}
    </fieldset>
  );
};
