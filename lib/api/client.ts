/**
 * Core HTTP Client
 * The ONLY place that directly invokes fetch / network calls.
 * Normalizes all network failures, HTTP errors, and malformed responses into ApiError.
 */

import { ApiError } from '../types';

export class ApiException extends Error implements ApiError {
  code: string;
  fieldErrors?: Record<string, string>;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiException';
    this.code = error.code;
    this.fieldErrors = error.fieldErrors;
  }
}

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || '';
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = new URL(endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`, 'http://localhost');

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }

  // Preserve relative path if baseUrl is relative or empty
  const requestUrl = baseUrl
    ? `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}${url.search}`
    : `${endpoint}${url.search}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  let response: Response;
  try {
    response = await fetch(requestUrl, {
      ...options,
      headers,
      credentials: 'include', // Single configuration point for session credentials
    });
  } catch (networkErr: unknown) {
    throw new ApiException({
      code: 'NETWORK_ERROR',
      message: networkErr instanceof Error ? networkErr.message : 'Unable to connect to the server. Please check your connection.',
    });
  }

  // Parse JSON response
  let data: unknown;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      throw new ApiException({
        code: 'MALFORMED_RESPONSE',
        message: 'The server returned an unreadable response format.',
      });
    }
  }

  if (!response.ok) {
    if (data && typeof data === 'object' && 'code' in data && 'message' in data) {
      const err = data as ApiError;
      throw new ApiException({
        code: String(err.code),
        message: String(err.message),
        fieldErrors: err.fieldErrors,
      });
    }

    throw new ApiException({
      code: `HTTP_${response.status}`,
      message: response.statusText || 'An error occurred while communicating with the service.',
    });
  }

  return data as T;
}
