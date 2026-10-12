/**
 * Price Quote & Configurator Types
 * Conforms to Frontend Specification Section 8
 */

export interface PriceQuoteLine {
  label: string;
  amount: number;
}

// CONTRACT-GAP (CG-11): Price quote problem breakdown structure
export interface PriceQuoteProblem {
  groupId: string;
  optionId?: string;
  message: string;
}

export interface PriceQuote {
  valid: boolean;
  lines: PriceQuoteLine[];
  total: number;
  problems?: PriceQuoteProblem[];
}

export interface PriceQuoteRequest {
  selectedOptionIds: string[];
}
