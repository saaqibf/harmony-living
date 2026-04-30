'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login?logout=1');
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10 disabled:opacity-50"
    >
      {loading ? 'Logging out…' : 'Log out'}
    </button>
  );
}
