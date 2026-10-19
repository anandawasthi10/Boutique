import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError, ErrorDetail } from '../errors/app-error.js';

export interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function formatZodError(error: ZodError): ErrorDetail[] {
  const details: ErrorDetail[] = [];

  for (const issue of error.issues) {
    if (issue.code === 'unrecognized_keys') {
      for (const key of issue.keys) {
        details.push({
          field: key,
          message: `Unrecognized field: '${key}' is not allowed`,
        });
      }
    } else {
      details.push({
        field: issue.path.join('.') || undefined,
        message: issue.message,
      });
    }
  }

  return details;
}

export function validate(schemas: ValidationSchemas) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (schemas.params) {
      const result = schemas.params.safeParse(request.params);
      if (!result.success) {
        throw new ValidationError('Validation failed for route parameters', formatZodError(result.error));
      }
      request.params = result.data;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(request.query);
      if (!result.success) {
        throw new ValidationError('Validation failed for query parameters', formatZodError(result.error));
      }
      request.query = result.data;
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(request.body);
      if (!result.success) {
        throw new ValidationError('Validation failed for request body', formatZodError(result.error));
      }
      request.body = result.data;
    }
  };
}
