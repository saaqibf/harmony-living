'use client';

import { useState, useTransition } from 'react';
import { updatePreferencesAction } from '@/features/settings/lib/actions';

const inputCls = 'block w-full rounded-xl border border-[#cfc5bd] bg-[#F9F0EE] px-4 py-3 text-sm text-[#1c1b1b] outline-none transition focus:border-[#A86472] focus:ring-2 focus:ring-[#A86472]/15';
const selectCls = inputCls;
const labelCls = 'block text-sm font-medium text-[#1c1b1b] mb-1.5';

type Props = {
  initial: {
    budgetMin: number;
    budgetMax: number;
    cleanliness: string;
    schedule: string;
    smokingRoommate: boolean;
    pets: boolean;
    petsRoommate: string;
    guests: string;
  } | null;
};

export function PreferencesForm({ initial }: Props) {
  const [isPending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [budgetMin, setBudgetMin] = useState(String(initial?.budgetMin ?? 600));
  const [budgetMax, setBudgetMax] = useState(String(initial?.budgetMax ?? 2000));
  const [cleanliness, setCleanliness] = useState(initial?.cleanliness ?? 'AVERAGE');
  const [schedule, setSchedule] = useState(initial?.schedule ?? 'FLEXIBLE');
  const [smokingRoommate, setSmokingRoommate] = useState(initial?.smokingRoommate ?? false);
  const [pets, setPets] = useState(initial?.pets ?? false);
  const [petsRoommate, setPetsRoommate] = useState(initial?.petsRoommate ?? 'any');
  const [guests, setGuests] = useState(initial?.guests ?? 'sometimes');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    start(async () => {
      try {
        await updatePreferencesAction({
          budgetMin: Number(budgetMin),
          budgetMax: Number(budgetMax),
          cleanliness,
          schedule,
          smokingRoommate,
          pets,
          petsRoommate,
          guests,
        });
        setSaved(true);
      } catch {
        setError('Failed to save. Please try again.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {saved && (
        <div className="rounded-xl bg-[#F9F0EE] border border-[#E8D5D0] px-4 py-3 text-sm text-[#8A505E]">
          Preferences saved.
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Budget min (CAD/mo)</label>
          <input type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} className={inputCls} min={0} />
        </div>
        <div>
          <label className={labelCls}>Budget max (CAD/mo)</label>
          <input type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} className={inputCls} min={0} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Cleanliness level</label>
        <select value={cleanliness} onChange={(e) => setCleanliness(e.target.value)} className={selectCls}>
          <option value="VERY_TIDY">Very tidy</option>
          <option value="TIDY">Tidy</option>
          <option value="AVERAGE">Average</option>
          <option value="RELAXED">Relaxed</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Schedule</label>
        <select value={schedule} onChange={(e) => setSchedule(e.target.value)} className={selectCls}>
          <option value="EARLY_BIRD">Early bird</option>
          <option value="NIGHT_OWL">Night owl</option>
          <option value="FLEXIBLE">Flexible</option>
          <option value="SHIFT_WORKER">Shift worker</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Guests</label>
        <select value={guests} onChange={(e) => setGuests(e.target.value)} className={selectCls}>
          <option value="rarely">Rarely</option>
          <option value="sometimes">Sometimes</option>
          <option value="often">Often</option>
          <option value="any">Any</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Pets (roommate)</label>
        <select value={petsRoommate} onChange={(e) => setPetsRoommate(e.target.value)} className={selectCls}>
          <option value="any">Any</option>
          <option value="no_pets">No pets</option>
          <option value="small_only">Small only</option>
          <option value="hypoallergenic">Hypoallergenic only</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-5 pt-1">
        <label className="flex items-center gap-2.5 text-sm text-[#1c1b1b] cursor-pointer">
          <input type="checkbox" checked={smokingRoommate} onChange={(e) => setSmokingRoommate(e.target.checked)}
            className="w-4 h-4 rounded border-[#cfc5bd] accent-[#A86472]" />
          Smoking roommate OK
        </label>
        <label className="flex items-center gap-2.5 text-sm text-[#1c1b1b] cursor-pointer">
          <input type="checkbox" checked={pets} onChange={(e) => setPets(e.target.checked)}
            className="w-4 h-4 rounded border-[#cfc5bd] accent-[#A86472]" />
          I have pets
        </label>
      </div>

      <button type="submit" disabled={isPending}
        className="w-full rounded-xl bg-[#A86472] py-3 text-sm font-semibold text-white transition hover:bg-[#8A505E] disabled:opacity-60">
        {isPending ? 'Saving…' : 'Save preferences'}
      </button>
    </form>
  );
}
