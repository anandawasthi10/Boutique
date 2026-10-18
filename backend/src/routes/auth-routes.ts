import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth-controller.js';
import { validate } from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth-schemas.js';

export function registerAuthRoutes(
  app: FastifyInstance,
  controller: AuthController,
  authenticateCustomer: any
): void {
  // 1. Register / Signup
  app.post(
    '/api/v1/auth/register',
    { preHandler: [validate({ body: registerSchema })] },
    controller.register
  );
  // Alias for frontend compatibility
  app.post(
    '/api/v1/auth/signup',
    { preHandler: [validate({ body: registerSchema })] },
    controller.register
  );

  // 2. Login
  app.post(
    '/api/v1/auth/login',
    { preHandler: [validate({ body: loginSchema })] },
    controller.login
  );

  // 3. Logout (Customer protected)
  app.post(
    '/api/v1/auth/logout',
    { preHandler: [authenticateCustomer] },
    controller.logout
  );

  // 4. Current User (Customer protected)
  app.get(
    '/api/v1/auth/me',
    { preHandler: [authenticateCustomer] },
    controller.me
  );
  // Alias for frontend compatibility
  app.get(
    '/api/v1/me',
    { preHandler: [authenticateCustomer] },
    controller.me
  );

  // 5. Forgot Password
  app.post(
    '/api/v1/auth/forgot-password',
    { preHandler: [validate({ body: forgotPasswordSchema })] },
    controller.forgotPassword
  );

  // 6. Reset Password
  app.post(
    '/api/v1/auth/reset-password',
    { preHandler: [validate({ body: resetPasswordSchema })] },
    controller.resetPassword
  );
}
