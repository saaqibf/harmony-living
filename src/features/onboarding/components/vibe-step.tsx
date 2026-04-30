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
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div className={`grid gap-2 ${cols === 4 ? 'grid-cols-4' : 'grid-cols-2'}`}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
              value === opt.value
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
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
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Your vibe</h1>
        <p className="text-gray-500 text-sm">Help us find someone you'll actually enjoy living with.</p>
      </div>

      <ChipGroup label="Cleanliness" options={CLEAN_OPTS} value={cleanliness} onChange={setCleanliness} />
      <ChipGroup label="Daily schedule" options={SCHED_OPTS} value={schedule} onChange={setSchedule} />

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Quick questions</p>
        <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4">
          {[
            { id: 'smoke', label: 'I smoke', value: smokingSelf, set: setSmokingSelf },
            { id: 'smokeOk', label: "OK with roommate who smokes", value: smokingRoommate, set: setSmokingRoommate },
            { id: 'pets', label: 'I have pets', value: pets, set: setPets },
          ].map(({ id, label, value, set }) => (
            <label key={id} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-700">{label}</span>
              <button
                type="button"
                onClick={() => set(!value)}
                className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-primary-600' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
              </button>
            </label>
          ))}
          <div className="pt-1">
            <label className="text-sm text-gray-700 block mb-1.5">My drinking</label>
            <select
              value={drinkingSelf}
              onChange={(e) => setDrinkingSelf(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="never">Never</option>
              <option value="socially">Socially</option>
              <option value="regularly">Regularly</option>
            </select>
          </div>
        </div>
      </div>

      <ChipGroup label="Preferred roommate gender" options={GENDER_PREF} value={genderPreference} onChange={setGenderPreference} cols={4} />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={pending}
        className="w-full py-3 rounded-2xl bg-primary-600 text-white font-semibold text-sm disabled:opacity-50 transition-opacity"
      >
        {pending ? 'Saving…' : 'Continue →'}
      </button>
    </div>
  );
}
