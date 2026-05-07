import { AppError } from '@/lib/errors';

export const AuthErrorCode = {
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_CONFIRMED: 'USER_NOT_CONFIRMED',
  CODE_MISMATCH: 'CODE_MISMATCH',
  CODE_EXPIRED: 'CODE_EXPIRED',
  PASSWORD_POLICY: 'PASSWORD_POLICY',
  TOO_MANY_ATTEMPTS: 'TOO_MANY_ATTEMPTS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  UNKNOWN: 'UNKNOWN',
} as const;

export type AuthErrorCode = (typeof AuthErrorCode)[keyof typeof AuthErrorCode];

export class AuthError extends AppError {
  constructor(
    public readonly code: AuthErrorCode,
    message?: string,
  ) {
    super(code, message);
    this.name = 'AuthError';
  }
}
