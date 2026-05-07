'use client';

import { useState, useTransition } from 'react';
import { reportUserAction, blockUserAction } from '@/features/trust/lib/actions';

const REPORT_REASONS = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'SCAM', label: 'Scam or fraud' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate content' },
  { value: 'DISCRIMINATION', label: 'Discrimination' },
] as const;

type Props = {
  targetUserId: string;
  targetName: string;
};

export function ReportBlockMenu({ targetUserId, targetName }: Props) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'menu' | 'report' | 'reported' | 'blocked'>('menu');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const submitReport = () => {
    if (!selectedReason) return;
    setError(null);
    startTransition(async () => {
      const result = await reportUserAction(
        targetUserId,
        selectedReason as 'SPAM' | 'HARASSMENT' | 'SCAM' | 'INAPPROPRIATE_CONTENT' | 'DISCRIMINATION',
      );
      if (result.ok) setView('reported');
      else setError(result.error ?? 'Failed to report');
    });
  };

  const submitBlock = () => {
    startTransition(async () => {
      await blockUserAction(targetUserId);
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-[#7d766f] hover:text-[#4c4640] transition-colors"
        aria-label="More options"
      >
        ···
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => { setOpen(false); setView('menu'); }}>
      <div
        className="w-full max-w-sm bg-white rounded-t-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {view === 'menu' && (
          <>
            <h3 className="font-semibold text-[#1c1b1b]">{targetName}</h3>
            <button
              onClick={() => setView('report')}
              className="w-full text-left py-3 text-sm text-[#4c4640] border-b border-[#cfc5bd]"
            >
              Report
            </button>
            <button
              onClick={submitBlock}
              disabled={isPending}
              className="w-full text-left py-3 text-sm text-red-500 disabled:opacity-50"
            >
              Block
            </button>
            <button onClick={() => setOpen(false)} className="w-full text-center py-2 text-sm text-[#7d766f]">
              Cancel
            </button>
          </>
        )}

        {view === 'report' && (
          <>
            <h3 className="font-semibold text-[#1c1b1b]">Report {targetName}</h3>
            <div className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <label key={r.value} className="flex items-center gap-3 py-2 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={selectedReason === r.value}
                    onChange={() => setSelectedReason(r.value)}
                    className="accent-[#1c1916]"
                  />
                  <span className="text-sm text-[#4c4640]">{r.label}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-3">
              <button onClick={() => setView('menu')} className="flex-1 py-2 text-sm text-[#7d766f]">Back</button>
              <button
                onClick={submitReport}
                disabled={!selectedReason || isPending}
                className="flex-1 py-2 text-sm font-medium text-white bg-red-500 rounded-xl disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </>
        )}

        {view === 'reported' && (
          <>
            <h3 className="font-semibold text-[#1c1b1b]">Report submitted</h3>
            <p className="text-sm text-[#7d766f]">Thanks for letting us know. Our team will review it.</p>
            <button onClick={() => { setOpen(false); setView('menu'); }} className="w-full py-2 text-sm text-[#7d766f]">Close</button>
          </>
        )}
      </div>
    </div>
  );
}
