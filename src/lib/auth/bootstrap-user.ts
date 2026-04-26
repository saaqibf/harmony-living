import 'server-only';
import { prisma } from '@/lib/db/prisma';
import type { AuthUser } from './types';

/**
 * Idempotent User row bootstrap. Creates the Postgres User row if it
 * doesn't exist yet, keyed on cognitoSub. Called on every login and
 * every OAuth callback. Safe to call multiple times.
 *
 * Note: cognitoSub is @unique and non-nullable in the schema, so this
 * is the hard link between Cognito identity and our DB. No User row
 * can exist before a successful Cognito authentication.
 */
export async function bootstrapUser(authUser: AuthUser) {
  return prisma.user.upsert({
    where: { cognitoSub: authUser.cognitoSub },
    create: {
      cognitoSub: authUser.cognitoSub,
      email: authUser.email,
      emailVerified: authUser.emailVerified,
    },
    update: {
      // Keep email and verification status in sync if changed in Cognito.
      email: authUser.email,
      emailVerified: authUser.emailVerified,
      lastActiveAt: new Date(),
    },
  });
}
