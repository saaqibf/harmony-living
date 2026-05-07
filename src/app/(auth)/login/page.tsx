'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, type SignInInput } from '@/lib/auth/schemas';

const BANNER_MESSAGES: Record<string, string> = {
  confirmed: 'Your email is confirmed — log in below.',
  logout: "You've been logged out.",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const banner = searchParams.get('confirmed') === '1'
    ? BANNER_MESSAGES.confirmed
    : searchParams.get('logout') === '1'
    ? BANNER_MESSAGES.logout
    : null;
  const from = searchParams.get('from');
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  async function onSubmit(data: SignInInput) {
    setServerError(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = (await res.json()) as { ok: boolean; error?: { code: string; message: string } };
    if (!json.ok) {
      if (json.error?.code === 'USER_NOT_CONFIRMED') {
        router.push(`/confirm?email=${encodeURIComponent(getValues('email'))}`);
        return;
      }
      const msgMap: Record<string, string> = {
        INVALID_CREDENTIALS: 'Incorrect email or password.',
        USER_NOT_FOUND: 'No account found with this email.',
        TOO_MANY_ATTEMPTS: 'Too many attempts. Please wait a moment.',
      };
      setServerError(msgMap[json.error?.code ?? ''] ?? json.error?.message ?? 'Something went wrong.');
      return;
    }
    router.push(from ?? '/dashboard');
  }

  return (
    <div className="rounded-2xl bg-white px-8 py-8 shadow-sm ring-1 ring-gray-200">
      <h1 className="mb-1 text-xl font-semibold text-gray-900">Welcome back</h1>
      <p className="mb-6 text-sm text-gray-500">Log in to your account.</p>

      {banner && (
        <div className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 ring-1 ring-green-200">
          {banner}
        </div>
      )}
      {serverError && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            placeholder="you@example.com"
            className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
            <Link href="/forgot-password" className="text-xs text-primary-600 hover:underline">Forgot password?</Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            placeholder="Your password"
            className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-95 disabled:opacity-60"
        >
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">or continue with</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a
          href="/api/auth/oauth-start?provider=Google"
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:scale-95"
        >
          <GoogleIcon /> Google
        </a>
        <a
          href="/api/auth/oauth-start?provider=Apple"
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:scale-95"
        >
          <AppleIcon /> Apple
        </a>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-semibold text-primary-600 hover:underline">Sign up</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.54 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09z"/>
      <path d="M15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"/>
    </svg>
  );
}
