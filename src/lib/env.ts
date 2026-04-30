import { z } from 'zod';

/**
 * Validates environment variables at module load.
 *
 * Imported as a side-effect from `src/lib/db/prisma.ts` so any code path
 * that touches the database also triggers env validation at boot.
 * Also runs via `src/instrumentation.ts` at Next.js server startup.
 *
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
 * - COGNITO_CLIENT_SECRET is required — our app client is confidential
 *   (created via the "Traditional web application" quick-setup flow).
 *   All Cognito API calls that require a SECRET_HASH use this value.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .or(z.string().startsWith('http://localhost'))
    .default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']),

  // --- AWS Cognito (all required — pool is set up and auth phase is active) ---
  COGNITO_USER_POOL_ID: z.string().min(1, 'COGNITO_USER_POOL_ID is required'),
  COGNITO_CLIENT_ID: z.string().min(1, 'COGNITO_CLIENT_ID is required'),
  // Confidential client — the quick-setup "Traditional web app" flow generates
  // a client secret. All Cognito USER_PASSWORD_AUTH calls include a SECRET_HASH
  // computed from this value. Never expose it to the browser.
  COGNITO_CLIENT_SECRET: z
    .string()
    .min(1, 'COGNITO_CLIENT_SECRET is required (confidential client)'),
  COGNITO_REGION: z.string().default('us-west-2'),
  COGNITO_DOMAIN: z.string().min(1, 'COGNITO_DOMAIN is required'),

  // --- AWS S3 / IAM ---
  AWS_S3_BUCKET: z.string().min(1, 'AWS_S3_BUCKET is required'),
  AWS_S3_REGION: z.string().default('us-west-2'),
  AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID is required'),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),

  // --- Mapbox ---
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().min(1, 'NEXT_PUBLIC_MAPBOX_TOKEN is required'),

  // --- Pusher / Realtime ---
  PUSHER_APP_ID: z.string().min(1, 'PUSHER_APP_ID is required'),
  PUSHER_KEY: z.string().min(1, 'PUSHER_KEY is required'),
  PUSHER_SECRET: z.string().min(1, 'PUSHER_SECRET is required'),
  PUSHER_CLUSTER: z.string().default('us2'),
  NEXT_PUBLIC_PUSHER_KEY: z.string().min(1, 'NEXT_PUBLIC_PUSHER_KEY is required'),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string().default('us2'),

  // --- Stripe Identity ---
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),

  // --- Auth / Session ---
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 chars — run: openssl rand -base64 32'),
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
