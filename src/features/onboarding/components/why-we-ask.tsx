'use client';

import { useState } from 'react';

export function WhyWeAsk({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="text-sm">
      <button
        type="button"
        className="font-medium text-[#c96d4d] underline decoration-[#c96d4d]/30 underline-offset-2 hover:text-[#b05e3d]"
        onClick={() => setOpen((o) => !o)}
      >
        Why we ask
      </button>
      {open ? (
        <p className="mt-2 rounded-xl bg-[#f1edec] p-3 text-[#4c4640]">{children}</p>
      ) : null}
    </div>
  );
}
