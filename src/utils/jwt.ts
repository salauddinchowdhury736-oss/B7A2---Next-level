import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

export interface JwtPayload {
  id: number;
  name: string;
  role: 'contributor' | 'maintainer';
}

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
};
