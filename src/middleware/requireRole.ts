import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sendError } from '../utils/response';

export const requireRole = (...roles: Array<'contributor' | 'maintainer'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, StatusCodes.UNAUTHORIZED, 'Not authenticated.');
      return;
    }
    if (!roles.includes(req.user.role)) {
      sendError(res, StatusCodes.FORBIDDEN, 'Insufficient permissions.');
      return;
    }
    next();
  };
};
