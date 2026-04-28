'use client';

import { useState } from 'react';

export function WhyWeAsk({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="text-sm">
      <button
        type="button"
        className="font-medium text-primary-700 underline decoration-primary-300 underline-offset-2 hover:text-primary-800"
        onClick={() => setOpen((o) => !o)}
      >
        Why we ask
      </button>
      {open ? (
        <p className="mt-2 rounded-lg bg-slate-50 p-3 text-slate-600">{children}</p>
      ) : null}
    </div>
  );
}
