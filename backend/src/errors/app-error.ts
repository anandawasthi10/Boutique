export interface ErrorDetail {
  field?: string;
  message: string;
  [key: string]: unknown;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ErrorDetail[];

  constructor(statusCode: number, code: string, message: string, details?: ErrorDetail[]) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: ErrorDetail[]) {
    super(400, 'VALIDATION_FAILED', message, details);
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message = 'Authentication required') {
    super(401, 'UNAUTHENTICATED', message);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor(message = 'Invalid email or password') {
    super(401, 'INVALID_CREDENTIALS', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(403, 'FORBIDDEN', message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, 'NOT_FOUND', message);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'A conflict occurred with existing resource') {
    super(409, 'CONFLICT', message);
  }
}

export class CartChangedError extends AppError {
  constructor(message = 'Items in your cart have changed or become unavailable', details?: ErrorDetail[]) {
    super(409, 'CART_CHANGED', message, details);
  }
}

export class InvalidConfigurationError extends AppError {
  constructor(message = 'Invalid product configuration', details?: ErrorDetail[]) {
    super(422, 'INVALID_CONFIGURATION', message, details);
  }
}

export class RateLimitedError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(429, 'RATE_LIMITED', message);
  }
}

export class PaymentUnavailableError extends AppError {
  constructor(message = 'Payment service is temporarily unavailable. Please try again.') {
    super(502, 'PAYMENT_UNAVAILABLE', message);
  }
}

export class InternalError extends AppError {
  constructor(message = 'An unexpected error occurred. Please try again later.') {
    super(500, 'INTERNAL_ERROR', message);
  }
}
