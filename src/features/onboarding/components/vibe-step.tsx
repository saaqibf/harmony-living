'use client';

import { useState, useTransition } from 'react';
import { saveVibeAction } from '@/features/onboarding/lib/actions';

const CLEAN_OPTS = [
  { value: 'VERY_TIDY', label: '✨ Very tidy' },
  { value: 'TIDY', label: '🧹 Tidy' },
  { value: 'AVERAGE', label: '😊 Average' },
  { value: 'RELAXED', label: '😌 Relaxed' },
] as const;

const SCHED_OPTS = [
  { value: 'EARLY_BIRD', label: '🌅 Early bird' },
  { value: 'NIGHT_OWL', label: '🦉 Night owl' },
  { value: 'FLEXIBLE', label: '🔄 Flexible' },
  { value: 'SHIFT_WORKER', label: '⏰ Shift worker' },
] as const;

const GENDER_PREF = [
  { value: 'ANY', label: 'Any' },
  { value: 'FEMALE_ONLY', label: 'Women only' },
  { value: 'MALE_ONLY', label: 'Men only' },
  { value: 'NON_BINARY_INCLUSIVE', label: 'NB inclusive' },
] as const;

type Cleanliness = typeof CLEAN_OPTS[number]['value'];
type Schedule = typeof SCHED_OPTS[number]['value'];
type GenderPref = typeof GENDER_PREF[number]['value'];

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  cols = 2,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  cols?: 2 | 4;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-[#1c1b1b]">{label}</p>
      <div className={`grid gap-2 ${cols === 4 ? 'grid-cols-4' : 'grid-cols-2'}`}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
              value === opt.value
                ? 'border-[#7B2D5C] bg-[#fdf4f9] text-[#7B2D5C]'
                : 'border-[#cfc5bd] text-[#4c4640] hover:border-[#7B2D5C]/50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function VibeStep() {
  const [pending, start] = useTransition();
  const [cleanliness, setCleanliness] = useState<Cleanliness>('AVERAGE');
  const [schedule, setSchedule] = useState<Schedule>('FLEXIBLE');
  const [smokingSelf, setSmokingSelf] = useState(false);
  const [smokingRoommate, setSmokingRoommate] = useState(false);
  const [pets, setPets] = useState(false);
  const [drinkingSelf, setDrinkingSelf] = useState('socially');
  const [genderPreference, setGenderPreference] = useState<GenderPref>('ANY');
  const [personality, setPersonality] = useState('');

  const handleSubmit = () => {
    start(async () => {
      await saveVibeAction({
        cleanliness,
        schedule,
        smokingSelf,
        smokingRoommate,
        drinkingSelf,
        pets,
        genderPreference,
        personality: personality.trim() || undefined,
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">Your vibe</h1>
        <p className="text-[#7d766f] text-sm">Help us find someone you&apos;ll actually enjoy living with.</p>
      </div>

      <ChipGroup label="Cleanliness" options={CLEAN_OPTS} value={cleanliness} onChange={setCleanliness} />
      <ChipGroup label="Daily schedule" options={SCHED_OPTS} value={schedule} onChange={setSchedule} />

      <div className="space-y-2">
        <p className="text-sm font-medium text-[#1c1b1b]">Quick questions</p>
        <div className="space-y-3 rounded-2xl border border-[#cfc5bd] bg-white p-4">
          {[
            { id: 'smoke', label: 'I smoke', value: smokingSelf, set: setSmokingSelf },
            { id: 'smokeOk', label: "OK with roommate who smokes", value: smokingRoommate, set: setSmokingRoommate },
            { id: 'pets', label: 'I have pets', value: pets, set: setPets },
          ].map(({ id, label, value, set }) => (
            <label key={id} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-[#4c4640]">{label}</span>
              <button
                type="button"
                onClick={() => set(!value)}
                className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-[#7B2D5C]' : 'bg-[#cfc5bd]'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
              </button>
            </label>
          ))}
          <div className="pt-1">
            <label className="text-sm text-[#4c4640] block mb-1.5">My drinking</label>
            <select
              value={drinkingSelf}
              onChange={(e) => setDrinkingSelf(e.target.value)}
              className="w-full rounded-xl border border-[#cfc5bd] bg-white px-3 py-2 text-sm text-[#1c1b1b] focus:outline-none focus:ring-2 focus:ring-[#7B2D5C]/20 focus:border-[#7B2D5C]"
            >
              <option value="never">Never</option>
              <option value="socially">Socially</option>
              <option value="regularly">Regularly</option>
            </select>
          </div>
        </div>
      </div>

      <ChipGroup label="Preferred roommate gender" options={GENDER_PREF} value={genderPreference} onChange={setGenderPreference} cols={4} />

      <div className="space-y-2">
        <p className="text-sm font-medium text-[#1c1b1b]">How would you describe your vibe? <span className="text-[#7d766f] font-normal">(optional)</span></p>
        <textarea
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
          maxLength={200}
          rows={2}
          placeholder="e.g. homebody who loves cooking, social butterfly, chill and laid-back..."
          className="w-full rounded-xl border border-[#cfc5bd] bg-white px-3 py-2.5 text-sm text-[#1c1b1b] resize-none focus:outline-none focus:ring-2 focus:ring-[#7B2D5C]/20 focus:border-[#7B2D5C] placeholder:text-[#7d766f]"
        />
        <p className="text-right text-xs text-[#7d766f]">{personality.length}/200</p>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={pending}
        className="w-full py-3 rounded-xl bg-[#7B2D5C] text-white font-semibold text-sm disabled:opacity-50 hover:bg-[#5A1F43] transition-colors"
      >
        {pending ? 'Saving…' : 'Continue →'}
      </button>
    </div>
  );
}
