'use client';

import { useState } from 'react';

export function WhyWeAsk({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="text-sm">
      <button
        type="button"
        className="font-medium text-[#A86472] underline decoration-[#A86472]/30 underline-offset-2 hover:text-[#8A505E]"
        onClick={() => setOpen((o) => !o)}
      >
        Why we ask
      </button>
      {open ? (
        <p className="mt-2 rounded-xl bg-[#EFE0D8] p-3 text-[#4c4640]">{children}</p>
      ) : null}
    </div>
  );
}
