import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Product, OptionGroup, PriceQuote } from '@/lib/types';
import { productsApi } from '@/lib/api';

export interface UseConfiguratorOptions {
  product: Product | null;
  initialSelections?: Record<string, string>;
  debounceMs?: number;
}

export interface UseConfiguratorReturn {
  selectedOptionIds: Record<string, string>;
  selectOption: (groupId: string, optionId: string) => void;
  clearOption: (groupId: string) => void;
  quote: PriceQuote | null;
  isLoadingQuote: boolean;
  isQuoteOutdated: boolean;
  quoteError: string | null;
  isComplete: boolean;
  isValid: boolean;
  canAddToCart: boolean;
  unavailableNotice: string | null;
  clearUnavailableNotice: () => void;
  missingRequiredGroups: OptionGroup[];
}

function getInitialSelections(
  product: Product | null,
  initialSelections?: Record<string, string>
): { selections: Record<string, string>; unavailableNotice: string | null } {
  if (!product) {
    return { selections: {}, unavailableNotice: null };
  }

  const selections: Record<string, string> = {};
  let notice: string | null = null;

  product.optionGroups.forEach((group) => {
    const candidateId = initialSelections?.[group.id] ?? group.defaultOptionId;
    if (candidateId) {
      const option = group.options.find((opt) => opt.id === candidateId);
      if (option && option.available) {
        selections[group.id] = candidateId;
      } else if (option && !option.available) {
        notice = `${option.label} is currently unavailable and has been deselected.`;
      }
    }
  });

  return { selections, unavailableNotice: notice };
}

export function useConfigurator({
  product,
  initialSelections,
  debounceMs = 250,
}: UseConfiguratorOptions): UseConfiguratorReturn {
  const [selectedOptionIds, setSelectedOptionIds] = useState<Record<string, string>>(() =>
    getInitialSelections(product, initialSelections).selections
  );
  const [unavailableNotice, setUnavailableNotice] = useState<string | null>(() =>
    getInitialSelections(product, initialSelections).unavailableNotice
  );
  const [prevProductId, setPrevProductId] = useState<string | null>(product?.id ?? null);
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState<boolean>(false);
  const [isQuoteOutdated, setIsQuoteOutdated] = useState<boolean>(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const requestSeqRef = useRef<number>(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial selections if product ID changes (React render-time adjustment)
  if (product && product.id !== prevProductId) {
    setPrevProductId(product.id);
    const initial = getInitialSelections(product, initialSelections);
    setSelectedOptionIds(initial.selections);
    setUnavailableNotice(initial.unavailableNotice);
    setQuote(null);
    setIsQuoteOutdated(true);
  }

  // Check if any selected option has become unavailable during render
  if (product) {
    let hasUnavailable = false;
    const nextSelections = { ...selectedOptionIds };
    let removedNotice: string | null = null;

    product.optionGroups.forEach((group) => {
      const selectedId = nextSelections[group.id];
      if (selectedId) {
        const option = group.options.find((opt) => opt.id === selectedId);
        if (option && !option.available) {
          delete nextSelections[group.id];
          hasUnavailable = true;
          removedNotice = `${option.label} is currently unavailable and has been deselected.`;
        }
      }
    });

    if (hasUnavailable) {
      setSelectedOptionIds(nextSelections);
      if (removedNotice) {
        setUnavailableNotice(removedNotice);
      }
    }
  }

  const selectOption = useCallback((groupId: string, optionId: string) => {
    setSelectedOptionIds((prev) => {
      if (prev[groupId] === optionId) return prev;
      setIsQuoteOutdated(true);
      return {
        ...prev,
        [groupId]: optionId,
      };
    });
  }, []);

  const clearOption = useCallback((groupId: string) => {
    setSelectedOptionIds((prev) => {
      if (!prev[groupId]) return prev;
      setIsQuoteOutdated(true);
      const next = { ...prev };
      delete next[groupId];
      return next;
    });
  }, []);

  const clearUnavailableNotice = useCallback(() => {
    setUnavailableNotice(null);
  }, []);

  // Compute required groups missing a selection
  const missingRequiredGroups = useMemo(() => {
    if (!product) return [];
    return product.optionGroups.filter((group) => group.required && !selectedOptionIds[group.id]);
  }, [product, selectedOptionIds]);

  const isComplete = missingRequiredGroups.length === 0;

  // Debounced quote fetcher
  useEffect(() => {
    if (!product) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const currentSeq = ++requestSeqRef.current;

    debounceTimerRef.current = setTimeout(() => {
      setIsLoadingQuote(true);

      const optionIds = Object.values(selectedOptionIds).filter(Boolean);

      productsApi
        .getPriceQuote(product.id, { selectedOptionIds: optionIds })
        .then((newQuote) => {
          // Discard out-of-order or stale response
          if (currentSeq !== requestSeqRef.current) {
            return;
          }
          setQuote(newQuote);
          setIsQuoteOutdated(false);
          setQuoteError(null);
          setIsLoadingQuote(false);
        })
        .catch((err) => {
          if (currentSeq !== requestSeqRef.current) {
            return;
          }
          // On quote failure, keep last valid quote marked outdated and block Add to cart
          setIsQuoteOutdated(true);
          setQuoteError(err?.message || 'Failed to calculate price quote');
          setIsLoadingQuote(false);
        });
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [product, selectedOptionIds, debounceMs]);

  const isValid = Boolean(quote?.valid && !isQuoteOutdated && !quoteError);
  const canAddToCart = isComplete && isValid && !isLoadingQuote;

  return {
    selectedOptionIds,
    selectOption,
    clearOption,
    quote,
    isLoadingQuote,
    isQuoteOutdated,
    quoteError,
    isComplete,
    isValid,
    canAddToCart,
    unavailableNotice,
    clearUnavailableNotice,
    missingRequiredGroups,
  };
}
