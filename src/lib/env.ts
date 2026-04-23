import { z } from 'zod';

/**
 * Validates environment variables at module load.
 *
 * Imported as a side-effect from `src/lib/db/prisma.ts` so any code path
 * that touches the database also triggers env validation at boot.
 * If any required variable is missing or malformed, this throws immediately
 * rather than failing at runtime in a surprising location.
 *
 * Notes:
 * - DATABASE_URL is validated as a non-empty string rather than `.url()`.
 *   Postgres connection strings (especially with SSL params and special
 *   characters in passwords) are not always accepted by strict URL parsers.
 * - NODE_ENV is NOT given a default — Node / Next.js always set it based
 *   on the command being run (`next dev` → development, `next build` →
 *   production). Setting it manually is almost always a bug.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .or(z.string().startsWith('http://localhost'))
    .default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']),

  COGNITO_USER_POOL_ID: z.string().optional(),
  COGNITO_CLIENT_ID: z.string().optional(),
  COGNITO_CLIENT_SECRET: z.string().optional(),
  COGNITO_REGION: z.string().default('us-east-1'),
  COGNITO_DOMAIN: z.string().optional(),

  AWS_S3_BUCKET: z.string().optional(),
  AWS_S3_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),

  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),

  PUSHER_APP_ID: z.string().optional(),
  PUSHER_KEY: z.string().optional(),
  PUSHER_SECRET: z.string().optional(),
  PUSHER_CLUSTER: z.string().default('us2'),
  NEXT_PUBLIC_PUSHER_KEY: z.string().optional(),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string().default('us2'),

  AUTH_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    '❌ Invalid environment variables:',
    parsed.error.flatten().fieldErrors,
  );
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
