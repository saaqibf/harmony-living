'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type SignUpInput } from '@/lib/auth/schemas';

const inputCls = 'block w-full rounded-xl border border-[#cfc5bd] bg-[#F9F0EE] px-4 py-3 text-sm text-[#1c1b1b] placeholder-[#7d766f] outline-none transition focus:border-[#A86472] focus:ring-2 focus:ring-[#A86472]/15';

export default function SignUpPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  async function onSubmit(data: SignUpInput) {
    setServerError(null);

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = (await res.json()) as {
      ok: boolean;
      error?: { code: string; message: string };
    };

    if (!json.ok) {
      if (json.error?.code === 'USER_ALREADY_EXISTS') {
        setServerError('An account with this email already exists. Try logging in.');
      } else {
        setServerError(json.error?.message ?? 'Something went wrong. Please try again.');
      }
      return;
    }

    router.push(`/confirm?email=${encodeURIComponent(data.email)}`);
  }

  return (
    <div>
      <h1 className="mb-1 text-3xl font-serif font-semibold text-[#1c1b1b]">Create your account</h1>
      <p className="mb-8 text-sm text-[#7d766f]">Find your perfect living situation.</p>

      {serverError && (
        <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#1c1b1b]">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            placeholder="you@example.com"
            className={inputCls}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#1c1b1b]">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register('password')}
            placeholder="At least 10 characters"
            className={inputCls}
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-[#1c1b1b]">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            placeholder="Repeat your password"
            className={inputCls}
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <div className="flex items-start gap-2.5 pt-1">
          <input
            id="terms"
            type="checkbox"
            {...register('terms')}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#cfc5bd] accent-[#A86472]"
          />
          <label htmlFor="terms" className="text-sm text-[#4c4640]">
            I agree to the{' '}
            <Link href="/terms" className="text-[#A86472] underline-offset-2 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-[#A86472] underline-offset-2 hover:underline">
              Privacy Policy
            </Link>
          </label>
        </div>
        {errors.terms && <p className="text-xs text-red-500">{errors.terms.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-[#A86472] py-3 text-sm font-semibold text-white transition hover:bg-[#8A505E] active:scale-95 disabled:opacity-60"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-[#E8D5D0]" />
        <span className="text-xs text-[#7d766f]">or continue with</span>
        <span className="h-px flex-1 bg-[#E8D5D0]" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a
          href="/api/auth/oauth-start?provider=Google"
          className="flex items-center justify-center gap-2 rounded-xl border border-[#cfc5bd] px-3 py-2.5 text-sm font-medium text-[#4c4640] transition hover:bg-[#F9F0EE] hover:border-[#E8D5D0] active:scale-95"
        >
          <GoogleIcon /> Google
        </a>
        <a
          href="/api/auth/oauth-start?provider=Apple"
          className="flex items-center justify-center gap-2 rounded-xl border border-[#cfc5bd] px-3 py-2.5 text-sm font-medium text-[#4c4640] transition hover:bg-[#F9F0EE] hover:border-[#E8D5D0] active:scale-95"
        >
          <AppleIcon /> Apple
        </a>
      </div>

      <p className="mt-6 text-center text-sm text-[#7d766f]">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-[#A86472] hover:underline">Log in</Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.54 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09z" />
      <path d="M15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
    </svg>
  );
}
