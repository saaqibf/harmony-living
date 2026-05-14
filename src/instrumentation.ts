/**
 * Next.js instrumentation hook, runs once at server startup, before the
 * first request is handled. Guaranteed bootstrap point for side effects.
 *
 * Guarded on NEXT_RUNTIME === 'nodejs' so this does NOT execute in the Edge
 * runtime (where `process.env` access and the `zod` module load behave
 * differently and env validation is not useful). The DB layer is Node-only
 * anyway.
 *
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('@/lib/env');
  }
}
