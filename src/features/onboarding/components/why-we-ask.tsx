'use client';

import { useState } from 'react';

export function WhyWeAsk({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="text-sm">
      <button
        type="button"
        className="font-medium text-[#7B2D5C] underline decoration-[#7B2D5C]/30 underline-offset-2 hover:text-[#5A1F43]"
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
