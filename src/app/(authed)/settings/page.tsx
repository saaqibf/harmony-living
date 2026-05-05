import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';

export default async function SettingsPage() {
  await requireUser();

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="px-5 pt-10 pb-6 border-b border-stone-100 bg-white">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-3">
        {/* Account section */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 mb-1">Account</p>

        <Link
          href="/settings/profile"
          className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4 flex items-center justify-between hover:border-teal-100 hover:shadow-md active:scale-[0.99] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-xl">
              👤
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Edit profile</p>
              <p className="text-xs text-gray-400 mt-0.5">Name, photo, bio, preferences</p>
            </div>
          </div>
          <svg className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <Link
          href="/settings/verify"
          className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4 flex items-center justify-between hover:border-teal-100 hover:shadow-md active:scale-[0.99] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl">
              🛡️
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Verification</p>
              <p className="text-xs text-gray-400 mt-0.5">ID and identity checks</p>
            </div>
          </div>
          <svg className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1 mt-3 mb-1">Listings</p>

        <Link
          href="/listings/my"
          className="bg-white rounded-2xl border border-stone-100 shadow-sm px-5 py-4 flex items-center justify-between hover:border-teal-100 hover:shadow-md active:scale-[0.99] transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-xl">
              🏠
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">My listings</p>
              <p className="text-xs text-gray-400 mt-0.5">Manage your rooms</p>
            </div>
          </div>
          <svg className="w-4 h-4 text-gray-300 group-hover:text-teal-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
