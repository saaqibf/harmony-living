import { requireUser } from '@/lib/auth/session';
import LogoutButton from './_components/logout-button';

/**
 * Dashboard — server component.
 * `requireUser()` redirects to /login if the session is missing or expired.
 * IMPORTANT: called OUTSIDE any try/catch so the NEXT_REDIRECT throw propagates.
 */
export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-lg font-bold text-gray-900 tracking-tight">
            harmony<span className="text-[--color-primary]">.</span>living
          </span>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back{user.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            You&apos;re signed in as <span className="font-medium">{user.email}</span>
          </p>
        </div>

        {/* Placeholder content — real dashboard built in Phase 3+ */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Browse rooms', description: 'Find available rooms near you', href: '/rooms' },
            { label: 'My listings', description: 'Manage your room listings', href: '/listings' },
            { label: 'Messages', description: 'Chat with potential roommates', href: '/messages' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-[--color-primary]/40 hover:shadow-sm"
            >
              <h2 className="font-semibold text-gray-900">{item.label}</h2>
              <p className="mt-1 text-sm text-gray-500">{item.description}</p>
            </a>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-8 text-center text-sm text-gray-400">
          More features are on their way — Phase 3 incoming 🚀
        </div>
      </main>
    </div>
  );
}
