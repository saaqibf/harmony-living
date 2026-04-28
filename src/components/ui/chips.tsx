'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';

export interface ChipsProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  caseSensitive?: boolean;
  className?: string;
  disabled?: boolean;
  id?: string;
}

function normalize(s: string, caseSensitive: boolean) {
  return caseSensitive ? s.trim() : s.trim().toLowerCase();
}

export function Chips({
  value,
  onChange,
  placeholder = 'Type and press Enter',
  maxItems,
  caseSensitive = false,
  className,
  disabled,
  id,
}: ChipsProps) {
  const [draft, setDraft] = useState('');

  const addTokens = useCallback(
    (raw: string) => {
      const parts = raw
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length === 0) return;

      const next = [...value];
      const seen = new Set(next.map((t) => normalize(t, caseSensitive)));

      for (const part of parts) {
        if (maxItems !== undefined && next.length >= maxItems) break;
        const key = normalize(part, caseSensitive);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        next.push(part);
      }
      onChange(next);
    },
    [caseSensitive, maxItems, onChange, value],
  );

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (draft.trim()) {
        addTokens(draft);
        setDraft('');
      }
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (text.includes(',')) {
      e.preventDefault();
      addTokens(text);
      setDraft('');
    }
  };

  return (
    <div
      className={cn(
        'flex min-h-11 w-full flex-wrap gap-2 rounded-[var(--radius-button)] border border-slate-300 bg-surface px-2 py-2',
        'focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/30',
        disabled && 'cursor-not-allowed bg-slate-50 opacity-60',
        className,
      )}
    >
      {value.map((chip, i) => (
        <span
          key={`${chip}-${i}`}
          className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-sm text-primary-900"
        >
          <span>{chip}</span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => removeAt(i)}
            className="rounded p-0.5 text-primary-700 hover:bg-primary-200/80 disabled:opacity-50"
            aria-label={`Remove ${chip}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        id={id}
        type="text"
        disabled={disabled}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        placeholder={value.length === 0 ? placeholder : undefined}
        className="min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-1 text-base text-slate-900 outline-none placeholder:text-slate-400"
      />
    </div>
  );
}
