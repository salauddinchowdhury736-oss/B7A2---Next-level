import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/response';

// Verifies JWT from Authorization header and attaches decoded payload to req.user
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers.authorization;

  if (!token) {
    sendError(res, StatusCodes.UNAUTHORIZED, 'Access denied. No token provided.');
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    sendError(res, StatusCodes.UNAUTHORIZED, 'Invalid or expired token.');
  }
}

// Must be used after authenticate — ensures the caller has the maintainer role
export function requireMaintainer(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'maintainer') {
    sendError(res, StatusCodes.FORBIDDEN, 'Access denied. Maintainer role required.');
    return;
  }
  next();
}
