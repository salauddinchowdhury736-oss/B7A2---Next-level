import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sendError } from '../utils/response';

/**
 * Centralized error-handling middleware.
 * Must have 4 parameters so Express identifies it as an error handler.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  console.error('[Error]', err.message);
  sendError(
    res,
    StatusCodes.INTERNAL_SERVER_ERROR,
    'An unexpected error occurred.',
    process.env.NODE_ENV === 'development' ? err.message : undefined
  );
};
