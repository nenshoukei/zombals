import pino from 'pino';

export type { Logger } from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  name: 'zombals',
  level: isDevelopment ? 'trace' : 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
      }
    : undefined,
});
