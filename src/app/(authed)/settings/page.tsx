import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';

export default async function SettingsPage() {
  await requireUser();

  return (
    <div className="min-h-screen bg-[#fdf8f7]">
      <div className="px-6 pt-8 pb-5 border-b border-[#cfc5bd] bg-white">
        <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">Settings</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 pb-24 flex flex-col gap-3">
        <p className="text-xs font-semibold text-[#7d766f] uppercase tracking-widest px-1 mb-1">Account</p>

        <Link
          href="/settings/profile"
          className="bg-white rounded-2xl border border-[#cfc5bd] px-5 py-4 flex items-center justify-between hover:border-[#c96d4d]/40 hover:shadow-sm active:scale-[0.99] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#f7f3f1] flex items-center justify-center text-xl">
              👤
            </div>
            <div>
              <p className="font-semibold text-[#1c1b1b] text-sm">Edit profile</p>
              <p className="text-xs text-[#7d766f] mt-0.5">Name, photo, bio, preferences</p>
            </div>
          </div>
          <svg className="w-4 h-4 text-[#7d766f] group-hover:text-[#c96d4d] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href="/settings/verify"
          className="bg-white rounded-2xl border border-[#cfc5bd] px-5 py-4 flex items-center justify-between hover:border-[#c96d4d]/40 hover:shadow-sm active:scale-[0.99] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#edf4f1] flex items-center justify-center text-xl">
              🛡️
            </div>
            <div>
              <p className="font-semibold text-[#1c1b1b] text-sm">Verification</p>
              <p className="text-xs text-[#7d766f] mt-0.5">ID and identity checks</p>
            </div>
          </div>
          <svg className="w-4 h-4 text-[#7d766f] group-hover:text-[#c96d4d] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href="/settings/preferences"
          className="bg-white rounded-2xl border border-[#cfc5bd] px-5 py-4 flex items-center justify-between hover:border-[#c96d4d]/40 hover:shadow-sm active:scale-[0.99] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#f7f3f1] flex items-center justify-center text-xl">
              🏡
            </div>
            <div>
              <p className="font-semibold text-[#1c1b1b] text-sm">Housing preferences</p>
              <p className="text-xs text-[#7d766f] mt-0.5">Budget, lifestyle, roommate rules</p>
            </div>
          </div>
          <svg className="w-4 h-4 text-[#7d766f] group-hover:text-[#c96d4d] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href="/settings/privacy"
          className="bg-white rounded-2xl border border-[#cfc5bd] px-5 py-4 flex items-center justify-between hover:border-[#c96d4d]/40 hover:shadow-sm active:scale-[0.99] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#f7f3f1] flex items-center justify-center text-xl">
              🔒
            </div>
            <div>
              <p className="font-semibold text-[#1c1b1b] text-sm">Privacy</p>
              <p className="text-xs text-[#7d766f] mt-0.5">Photo visibility, discoverability</p>
            </div>
          </div>
          <svg className="w-4 h-4 text-[#7d766f] group-hover:text-[#c96d4d] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <p className="text-xs font-semibold text-[#7d766f] uppercase tracking-widest px-1 mt-3 mb-1">Listings</p>

        <Link
          href="/listings/my"
          className="bg-white rounded-2xl border border-[#cfc5bd] px-5 py-4 flex items-center justify-between hover:border-[#c96d4d]/40 hover:shadow-sm active:scale-[0.99] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#f7f3f1] flex items-center justify-center text-xl">
              🏠
            </div>
            <div>
              <p className="font-semibold text-[#1c1b1b] text-sm">My listings</p>
              <p className="text-xs text-[#7d766f] mt-0.5">Manage your rooms</p>
            </div>
          </div>
          <svg className="w-4 h-4 text-[#7d766f] group-hover:text-[#c96d4d] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
