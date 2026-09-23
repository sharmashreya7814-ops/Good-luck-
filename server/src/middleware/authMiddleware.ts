import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

/**
 * Admin authentication middleware.
 * Verifies the admin token from 'x-admin-token' or 'Authorization: Bearer <token>'.
 * Secret is loaded from ADMIN_API_KEY environment variable.
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const configuredSecret = process.env.ADMIN_API_KEY || 'goodluck-admin-secret-key-change-in-production';

  const authHeader = req.headers['authorization'];
  const tokenFromBearer = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;
  const tokenFromCustom = req.headers['x-admin-token'] as string;

  const providedToken = tokenFromBearer || tokenFromCustom;

  if (!providedToken || providedToken !== configuredSecret) {
    return sendError(res, 'Unauthorized. Valid administrator credentials required.', 401);
  }

  next();
}
