import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): Response => {
  const payload: ApiResponse<T> = { success: true, message };
  if (data !== undefined) payload.data = data;
  return res.status(statusCode).json(payload);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown
): Response => {
  const payload: ApiResponse = { success: false, message };
  if (errors !== undefined) payload.errors = errors;
  return res.status(statusCode).json(payload);
};
