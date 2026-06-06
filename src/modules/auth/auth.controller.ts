import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { authService } from './auth.service';
import { SignupBody, LoginBody } from './auth.types';
import { sendSuccess, sendError } from '../../utils/response';
import { formatUserResponse } from '../../utils/format';

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as SignupBody;

      // Basic validation
      if (!body.name || !body.email || !body.password) {
        sendError(res, StatusCodes.BAD_REQUEST, 'name, email, and password are required.');
        return;
      }

      const user = await authService.signup(body);
      sendSuccess(res, StatusCodes.CREATED, 'User registered successfully', formatUserResponse(user));
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      const code = Number(error.code);
      if (code === StatusCodes.BAD_REQUEST) {
        sendError(res, StatusCodes.BAD_REQUEST, error.message);
        return;
      }
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as LoginBody;

      if (!body.email || !body.password) {
        sendError(res, StatusCodes.BAD_REQUEST, 'email and password are required.');
        return;
      }

      const result = await authService.login(body);
      const formattedResult = {
        token: result.token,
        user: formatUserResponse(result.user),
      };
      sendSuccess(res, StatusCodes.OK, 'Login successful', formattedResult);
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      const code = Number(error.code);
      if (code === StatusCodes.UNAUTHORIZED) {
        sendError(res, StatusCodes.UNAUTHORIZED, error.message);
        return;
      }
      next(err);
    }
  }
}

export const authController = new AuthController();
