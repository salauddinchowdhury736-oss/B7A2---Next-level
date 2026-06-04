import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { query } from '../../utils/query';
import { signToken } from '../../utils/jwt';
import { SignupBody, LoginBody, UserRecord, SafeUser } from './auth.types';

const SALT_ROUNDS = 10; // within spec range of 8-12

export class AuthService {
  async signup(body: SignupBody): Promise<SafeUser> {
    const { name, email, password, role = 'contributor' } = body;

    // Validate role
    if (!['contributor', 'maintainer'].includes(role)) {
      const err = new Error('Role must be contributor or maintainer.');
      (err as NodeJS.ErrnoException).code = String(StatusCodes.BAD_REQUEST);
      throw err;
    }

    // Check for duplicate email
    const existing = await query<UserRecord>(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (existing.rowCount && existing.rowCount > 0) {
      const err = new Error('Email is already registered.');
      (err as NodeJS.ErrnoException).code = String(StatusCodes.BAD_REQUEST);
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await query<UserRecord>(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at, updated_at`,
      [name, email, hashedPassword, role]
    );

    return result.rows[0] as SafeUser;
  }

  async login(body: LoginBody): Promise<{ token: string; user: SafeUser }> {
    const { email, password } = body;

    const result = await query<UserRecord>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (!result.rowCount || result.rowCount === 0) {
      const err = new Error('Invalid email or password.');
      (err as NodeJS.ErrnoException).code = String(StatusCodes.UNAUTHORIZED);
      throw err;
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const err = new Error('Invalid email or password.');
      (err as NodeJS.ErrnoException).code = String(StatusCodes.UNAUTHORIZED);
      throw err;
    }

    const token = signToken({ id: user.id, name: user.name, role: user.role });

    // Return user without password
    const { password: _pw, ...safeUser } = user;
    void _pw; // suppress unused var warning

    return { token, user: safeUser as SafeUser };
  }
}

export const authService = new AuthService();
