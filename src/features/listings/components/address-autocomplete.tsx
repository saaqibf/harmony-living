'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export type AddressResult = {
  addressLine: string;
  city: string;
  postalCode: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  displayName: string;
};

type Props = {
  onSelect: (result: AddressResult) => void;
  defaultValue?: string;
  error?: string;
};

type MapboxFeature = {
  id: string;
  place_name: string;
  center: [number, number];
  text: string;
  address?: string;
  context?: { id: string; text: string }[];
};

function parseFeature(f: MapboxFeature): AddressResult {
  const ctx = f.context ?? [];
  const get = (prefix: string) => ctx.find((c) => c.id.startsWith(prefix))?.text ?? '';

  return {
    addressLine: f.address ? `${f.address} ${f.text}` : f.text,
    city: get('place'),
    postalCode: get('postcode'),
    neighborhood: get('neighborhood'),
    latitude: f.center[1],
    longitude: f.center[0],
    displayName: f.place_name,
  };
}

export function AddressAutocomplete({ onSelect, defaultValue = '', error }: Props) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${token}&autocomplete=true&types=address&limit=6`;
      const res = await fetch(url);
      const data = await res.json();
      setSuggestions(data.features ?? []);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(f: MapboxFeature) {
    const result = parseFeature(f);
    setQuery(result.displayName);
    setSuggestions([]);
    setOpen(false);
    onSelect(result);
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); if (!e.target.value) setSuggestions([]); }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Start typing your address…"
          autoComplete="off"
          className={`w-full rounded-xl border px-4 py-3 text-sm text-[#1c1b1b] placeholder-[#7d766f] outline-none transition-colors ${
            error ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/20' : 'border-[#cfc5bd] focus:border-[#2d4a3e] focus:ring-2 focus:ring-[#2d4a3e]/20'
          }`}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="w-4 h-4 animate-spin text-[#7d766f]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-[#cfc5bd] rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(f); }}
                className="w-full text-left px-4 py-3 text-sm hover:bg-[#F2E6E0] transition-colors border-b border-[#cfc5bd] last:border-0"
              >
                <span className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-[#7d766f] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  <span>
                    <span className="font-medium text-[#1c1b1b]">{f.text}{f.address ? '' : ''}</span>
                    <span className="text-[#7d766f] ml-1">{f.place_name.replace(f.text, '').replace(/^,\s*/, '')}</span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      <p className="mt-1.5 text-xs text-[#7d766f]">
        Coordinates are set automatically. The map shows an approximate location to protect your privacy.
      </p>
    </div>
  );
}
