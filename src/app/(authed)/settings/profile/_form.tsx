'use client';

import { useState, useTransition } from 'react';
import { updateProfileAction } from '@/features/settings/lib/actions';

const inputCls = 'block w-full rounded-xl border border-[#cfc5bd] bg-[#f7f3f1] px-4 py-3 text-sm text-[#1c1b1b] placeholder-[#7d766f] outline-none transition focus:border-[#2d4a3e] focus:ring-2 focus:ring-[#2d4a3e]/15';
const labelCls = 'block text-sm font-medium text-[#1c1b1b] mb-1.5';

type Props = {
  initial: {
    firstName: string;
    lastName: string;
    occupation: string;
    bio: string;
    city: string;
  };
};

export function ProfileInfoForm({ initial }: Props) {
  const [isPending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initial);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    start(async () => {
      try {
        await updateProfileAction(form);
        setSaved(true);
      } catch {
        setError('Failed to save. Please try again.');
      }
    });
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {saved && (
        <div className="rounded-xl bg-[#edf4f1] border border-[#c1d9d1] px-4 py-3 text-sm text-[#2d4a3e]">
          Profile saved.
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>First name</label>
          <input value={form.firstName} onChange={set('firstName')} placeholder="First name" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Last name</label>
          <input value={form.lastName} onChange={set('lastName')} placeholder="Last name (optional)" className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Occupation</label>
        <input value={form.occupation} onChange={set('occupation')} placeholder="e.g. Nurse, Student, Engineer" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>City</label>
        <input value={form.city} onChange={set('city')} placeholder="e.g. Calgary" className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Bio <span className="text-[#7d766f] font-normal">({form.bio.length}/500)</span></label>
        <textarea value={form.bio} onChange={set('bio')} placeholder="Tell potential roommates about yourself…" rows={4}
          maxLength={500}
          className="block w-full rounded-xl border border-[#cfc5bd] bg-[#f7f3f1] px-4 py-3 text-sm text-[#1c1b1b] placeholder-[#7d766f] outline-none transition focus:border-[#2d4a3e] focus:ring-2 focus:ring-[#2d4a3e]/15 resize-none" />
      </div>

      <button type="submit" disabled={isPending}
        className="w-full rounded-lg bg-[#1c1916] py-3 text-sm font-semibold text-white transition hover:bg-[#2e2b28] disabled:opacity-60">
        {isPending ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}
