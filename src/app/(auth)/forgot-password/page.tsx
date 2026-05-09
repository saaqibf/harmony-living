'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Stage = 'request' | 'reset';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email) { setError('Email is required.'); return; }
    setLoading(true);
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setStage('reset');
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (newPassword.length < 10) { setError('Password must be at least 10 characters.'); return; }
    setLoading(true);
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });
    const json = await res.json() as { ok: boolean; error?: string };
    setLoading(false);
    if (!json.ok) { setError(json.error ?? 'Something went wrong.'); return; }
    router.push('/login?reset=1');
  }

  const inputCls = 'block w-full rounded-xl border border-[#cfc5bd] px-4 py-3 text-sm text-[#1c1b1b] placeholder-[#7d766f] outline-none transition focus:border-[#2d4a3e] focus:ring-2 focus:ring-[#2d4a3e]/20';
  const btnCls = 'w-full rounded-xl bg-[#1c1916] py-3 text-sm font-semibold text-white transition hover:bg-[#2e2b28] active:scale-95 disabled:opacity-60';

  return (
    <div className="rounded-2xl bg-white border border-[#cfc5bd] px-8 py-8">
      {stage === 'request' ? (
        <>
          <div className="mb-5 w-12 h-12 rounded-2xl bg-[#f1edec] flex items-center justify-center">
            <svg className="w-6 h-6 text-[#4c4640]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="mb-1 text-xl font-serif font-semibold text-[#1c1b1b]">Reset your password</h1>
          <p className="mb-6 text-sm text-[#7d766f]">Enter your email and we&apos;ll send a reset code.</p>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">{error}</div>
          )}

          <form onSubmit={handleRequest} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#1c1b1b]">Email</label>
              <input id="email" type="email" autoComplete="email" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
            </div>
            <button type="submit" disabled={loading} className={btnCls}>
              {loading ? 'Sending…' : 'Send reset code'}
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="mb-5 w-12 h-12 rounded-2xl bg-[#edf4f1] flex items-center justify-center">
            <svg className="w-6 h-6 text-[#2d4a3e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h1 className="mb-1 text-xl font-serif font-semibold text-[#1c1b1b]">Check your email</h1>
          <p className="mb-6 text-sm text-[#7d766f]">
            Sent a code to <span className="font-medium text-[#1c1b1b]">{email}</span>.
          </p>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">{error}</div>
          )}

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-[#1c1b1b]">Reset code</label>
              <input id="code" type="text" inputMode="numeric" maxLength={8} value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="123456" className={inputCls} />
            </div>
            <div>
              <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-[#1c1b1b]">New password</label>
              <input id="newPassword" type="password" autoComplete="new-password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 10 characters" className={inputCls} />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-[#1c1b1b]">Confirm password</label>
              <input id="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" className={inputCls} />
            </div>
            <button type="submit" disabled={loading} className={btnCls}>
              {loading ? 'Resetting…' : 'Reset password'}
            </button>
            <button type="button" onClick={() => { setStage('request'); setError(null); }}
              className="w-full text-center text-sm text-[#7d766f] hover:text-[#4c4640] transition">
              ← Send a new code
            </button>
          </form>
        </>
      )}

      <p className="mt-6 text-center text-sm text-[#7d766f]">
        Remembered it?{' '}
        <Link href="/login" className="font-semibold text-[#7B2D5C] hover:underline">Log in</Link>
      </p>
    </div>
  );
}
