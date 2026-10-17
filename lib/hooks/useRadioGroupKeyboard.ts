import { useRef, useCallback, useMemo } from 'react';
import { Option } from '@/lib/types';

export interface UseRadioGroupKeyboardProps {
  options: Option[];
  selectedOptionId?: string;
  onChange: (optionId: string) => void;
  disabled?: boolean;
}

/**
 * WAI-ARIA Radio Group keyboard navigation hook.
 * Implements roving tabindex:
 * - Selected option has tabIndex 0, all others -1.
 * - If nothing is selected, the first enabled option has tabIndex 0.
 * - Arrow keys move focus and selection to next/previous enabled option with wrap-around.
 * - Home and End keys jump to first and last enabled options.
 * - Unavailable/disabled options are skipped.
 * - Tab key is unhandled so it naturally leaves the group.
 */
export function useRadioGroupKeyboard({
  options,
  selectedOptionId,
  onChange,
  disabled = false,
}: UseRadioGroupKeyboardProps) {
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Enabled options only (available and group not disabled)
  const enabledOptions = useMemo(() => {
    if (disabled) return [];
    return options.filter((opt) => opt.available);
  }, [options, disabled]);

  // Determine active option for roving tabindex
  const activeTabOptionId = useMemo(() => {
    if (enabledOptions.length === 0) return null;
    const isSelectedEnabled = enabledOptions.some((opt) => opt.id === selectedOptionId);
    if (isSelectedEnabled) {
      return selectedOptionId;
    }
    return enabledOptions[0]?.id ?? null;
  }, [enabledOptions, selectedOptionId]);

  const getTabIndex = useCallback(
    (optionId: string): 0 | -1 => {
      return optionId === activeTabOptionId ? 0 : -1;
    },
    [activeTabOptionId]
  );

  const registerButton = useCallback((optionId: string) => {
    return (el: HTMLButtonElement | null) => {
      if (el) {
        buttonRefs.current.set(optionId, el);
      } else {
        buttonRefs.current.delete(optionId);
      }
    };
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, currentOptionId: string) => {
      if (disabled || enabledOptions.length === 0) return;

      const currentIndex = enabledOptions.findIndex((opt) => opt.id === currentOptionId);
      if (currentIndex === -1) return;

      let nextIndex: number | null = null;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextIndex = (currentIndex + 1) % enabledOptions.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          nextIndex = (currentIndex - 1 + enabledOptions.length) % enabledOptions.length;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = enabledOptions.length - 1;
          break;
        default:
          return;
      }

      if (nextIndex !== null) {
        const nextOption = enabledOptions[nextIndex];
        if (nextOption) {
          onChange(nextOption.id);
          const btn = buttonRefs.current.get(nextOption.id);
          btn?.focus();
        }
      }
    },
    [disabled, enabledOptions, onChange]
  );

  return {
    getTabIndex,
    registerButton,
    handleKeyDown,
  };
}
