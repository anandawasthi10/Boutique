import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import { setupRequestId } from './middleware/request-id.js';
import { setupErrorHandler } from './middleware/error-handler.js';
import { setupSecurity } from './middleware/security.js';
import { AppDatabase, initDatabase } from './db/index.js';
import { UserRepository } from './repositories/user-repository.js';
import { SessionRepository } from './repositories/session-repository.js';
import { ResetTokenRepository } from './repositories/reset-token-repository.js';
import { CategoryRepository } from './repositories/category-repository.js';
import { ProductRepository } from './repositories/product-repository.js';
import { EmailAdapter, getEmailAdapter } from './adapters/email/index.js';
import { AuthService } from './services/auth-service.js';
import { AuthController } from './controllers/auth-controller.js';
import { CatalogueService } from './services/catalogue-service.js';
import { CatalogueController } from './controllers/catalogue-controller.js';
import { createAuthMiddleware } from './middleware/auth.js';
import { registerAuthRoutes } from './routes/auth-routes.js';
import { registerCatalogueRoutes } from './routes/catalogue-routes.js';

export interface AppOptions extends FastifyServerOptions {
  trustProxy?: boolean;
  frontendOrigin?: string;
  sessionSecret?: string;
  cookieSecure?: boolean;
  cookieSameSite?: 'lax' | 'strict' | 'none';
  cookieDomain?: string;
  db?: AppDatabase;
  emailAdapter?: EmailAdapter;
}

export function buildApp(options: AppOptions = {}): FastifyInstance {
  const app = fastify({
    logger: options.logger ?? false,
    trustProxy: options.trustProxy ?? true,
    ...options,
  });

  const sessionSecret =
    options.sessionSecret ??
    process.env.SESSION_SECRET ??
    'default-dev-session-secret-must-be-32-characters-minimum';

  const frontendOrigin =
    options.frontendOrigin ??
    process.env.FRONTEND_ORIGIN ??
    'http://localhost:3000';

  const cookieSecure =
    options.cookieSecure ??
    (process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production');

  const cookieSameSite =
    options.cookieSameSite ??
    ((process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') || 'lax');

  // 1. Request ID hook
  setupRequestId(app);

  // 2. Cookie support
  app.register(fastifyCookie, {
    secret: sessionSecret,
  });

  // 3. Global Error Handler
  setupErrorHandler(app);

  // 4. Security headers & CORS
  setupSecurity(app, {
    frontendOrigin,
  });

  // 5. Database & Domain services plugin
  app.register(async (instance) => {
    let db = options.db;
    if (!db) {
      const initialized = await initDatabase();
      db = initialized.db;
    }

    const emailAdapter = options.emailAdapter ?? getEmailAdapter();

    // Repositories
    const userRepo = new UserRepository(db);
    const sessionRepo = new SessionRepository(db);
    const resetTokenRepo = new ResetTokenRepository(db);
    const categoryRepo = new CategoryRepository(db);
    const productRepo = new ProductRepository(db);

    // Middleware
    const authMiddleware = createAuthMiddleware(sessionRepo, process.env.STAFF_API_KEY);

    // Services
    const authService = new AuthService(userRepo, sessionRepo, resetTokenRepo, emailAdapter);
    const catalogueService = new CatalogueService(categoryRepo, productRepo);

    // Controllers
    const authController = new AuthController(
      authService,
      {
        secure: cookieSecure,
        sameSite: cookieSameSite,
        domain: options.cookieDomain,
      },
      frontendOrigin
    );
    const catalogueController = new CatalogueController(catalogueService);

    // Routes
    registerAuthRoutes(instance, authController, authMiddleware.authenticateCustomer);
    registerCatalogueRoutes(instance, catalogueController);
  });

  // Health check routes
  const healthHandler = async (_request: unknown, reply: any) => {
    return reply.status(200).send({
      status: 'ok',
      service: 'boutique-backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  };

  app.get('/health', healthHandler);
  app.get('/api/v1/health', healthHandler);

  return app;
}
