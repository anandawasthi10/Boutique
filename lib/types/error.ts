/**
 * API Standard Error Response Shape
 * Conforms to Frontend Specification Section 8 & Technical Architecture Document
 */

export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}
