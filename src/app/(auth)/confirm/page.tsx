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
    <div className="rounded-2xl bg-white border border-[#cfc5bd] px-8 py-8">
      <div className="w-12 h-12 rounded-full bg-[#f7f3f1] flex items-center justify-center mb-5">
        <svg className="w-6 h-6 text-[#c96d4d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      </div>

      <h1 className="mb-1 text-xl font-serif font-semibold text-[#1c1b1b]">Check your email</h1>
      <p className="mb-6 text-sm text-[#7d766f]">
        We sent a 6-digit code to{' '}
        <span className="font-medium text-[#1c1b1b]">{emailFromUrl || 'your email'}</span>.
        Enter it below to verify your account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
            {serverError}
          </div>
        )}

        <input type="hidden" {...register('email')} />

        <div>
          <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-[#1c1b1b]">
            Confirmation code
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            {...register('code')}
            className="block w-full rounded-xl border border-[#cfc5bd] px-4 py-3 text-center text-lg font-mono tracking-widest text-[#1c1b1b] outline-none transition focus:border-[#2d4a3e] focus:ring-2 focus:ring-[#2d4a3e]/20"
            placeholder="000000"
          />
          {errors.code && (
            <p className="mt-1.5 text-xs text-red-500">{errors.code.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-xl bg-[#1c1916] py-3 text-sm font-semibold text-white transition hover:bg-[#2e2b28] active:scale-95 disabled:opacity-60"
        >
          {isSubmitting ? 'Verifying…' : 'Verify email'}
        </button>
      </form>

      <div className="mt-5 text-center text-sm text-[#7d766f]">
        Didn&apos;t receive a code?{' '}
        <button
          onClick={handleResend}
          disabled={resendStatus !== 'idle'}
          className="font-medium text-[#c96d4d] hover:underline disabled:opacity-50"
        >
          {resendStatus === 'idle' && 'Resend code'}
          {resendStatus === 'sending' && 'Sending…'}
          {resendStatus === 'sent' && 'Code sent!'}
        </button>
      </div>

      <p className="mt-3 text-center text-sm text-[#7d766f]">
        Wrong email?{' '}
        <Link href="/signup" className="font-medium text-[#c96d4d] hover:underline">
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
