import { FastifyServerOptions } from 'fastify';

export const REDACTED_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'headers.authorization',
  'headers.cookie',
  'password',
  'newPassword',
  'token',
  'tokenHash',
  'secret',
  'keySecret',
  'webhookSecret',
  'PAYMENT_KEY_SECRET',
  'PAYMENT_WEBHOOK_SECRET',
  'SESSION_SECRET',
  'STAFF_API_KEY',
  'EMAIL_API_KEY',
  '*.password',
  '*.newPassword',
  '*.token',
  '*.secret',
  '*.tokenHash',
];

export function getLoggerOptions(logLevel = 'info', isPretty = false): FastifyServerOptions['logger'] {
  return {
    level: logLevel,
    redact: {
      paths: REDACTED_PATHS,
      censor: '[REDACTED]',
    },
    transport: isPretty
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  };
}
