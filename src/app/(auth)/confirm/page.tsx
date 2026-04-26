'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { confirmSchema, type ConfirmInput } from '@/lib/auth/schemas';

function ConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get('email') ?? '';

  const [serverError, setServerError] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ConfirmInput>({
    resolver: zodResolver(confirmSchema),
    defaultValues: { email: emailFromUrl, code: '' },
  });

  // Keep the hidden email field in sync if the URL changes.
  useEffect(() => {
    if (emailFromUrl) setValue('email', emailFromUrl);
  }, [emailFromUrl, setValue]);

  async function onSubmit(data: ConfirmInput) {
    setServerError(null);

    const res = await fetch('/api/auth/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = (await res.json()) as { ok: boolean; error?: { code: string; message: string } };

    if (!json.ok) {
      const msgMap: Record<string, string> = {
        CODE_MISMATCH: 'Incorrect confirmation code. Please try again.',
        CODE_EXPIRED: 'This code has expired. Click "Resend code" to get a new one.',
      };
      setServerError(msgMap[json.error?.code ?? ''] ?? json.error?.message ?? 'Something went wrong.');
      return;
    }

    router.push('/login?confirmed=1');
  }

  async function handleResend() {
    if (!emailFromUrl) return;
    setResendStatus('sending');

    await fetch('/api/auth/resend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailFromUrl }),
    });

    setResendStatus('sent');
    setTimeout(() => setResendStatus('idle'), 30_000);
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
      <h1 className="mb-1 text-2xl font-semibold text-gray-900">Check your email</h1>
      <p className="mb-6 text-sm text-gray-500">
        We sent a 6-digit code to{' '}
        <span className="font-medium text-gray-700">{emailFromUrl || 'your email'}</span>.
        Enter it below to verify your account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {serverError}
          </div>
        )}

        {/* Hidden email field — included so schema validation passes */}
        <input type="hidden" {...register('email')} />

        <div>
          <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-gray-700">
            Confirmation code
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            {...register('code')}
            className="block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-center text-lg font-mono tracking-widest text-gray-900 focus:border-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20"
            placeholder="000000"
          />
          {errors.code && (
            <p className="mt-1.5 text-xs text-red-600">{errors.code.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-lg bg-[--color-primary] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[--color-primary-dark] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/40 disabled:opacity-60"
        >
          {isSubmitting ? 'Verifying…' : 'Verify email'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-500">
        Didn&apos;t receive a code?{' '}
        <button
          onClick={handleResend}
          disabled={resendStatus !== 'idle'}
          className="font-medium text-[--color-primary] hover:underline disabled:opacity-50"
        >
          {resendStatus === 'idle' && 'Resend code'}
          {resendStatus === 'sending' && 'Sending…'}
          {resendStatus === 'sent' && 'Code sent!'}
        </button>
      </div>

      <p className="mt-4 text-center text-sm text-gray-500">
        Wrong email?{' '}
        <Link href="/signup" className="font-medium text-[--color-primary] hover:underline">
          Start over
        </Link>
      </p>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmForm />
    </Suspense>
  );
}
