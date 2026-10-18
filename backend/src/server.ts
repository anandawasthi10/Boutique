import { buildApp } from './app.js';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = '0.0.0.0';

async function start() {
  const app = buildApp({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  try {
    const address = await app.listen({ port: PORT, host: HOST });
    app.log.info(`Server listening on ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Only start when executed directly
if (process.env.NODE_ENV !== 'test') {
  start();
}
