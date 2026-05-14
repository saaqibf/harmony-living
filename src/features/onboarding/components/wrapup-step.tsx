'use client';

import { useState, useTransition } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { saveWrapupAction } from '@/features/onboarding/lib/actions';
import { Slider } from '@/components/ui/slider';
import { DatePicker } from '@/components/ui/date-picker';

const PROXIMITY_OPTIONS = [
  { value: 'university', label: '🎓 Near a university' },
  { value: 'transit', label: '🚌 Near public transit' },
  { value: 'grocery', label: '🛒 Near grocery stores' },
  { value: 'downtown', label: '🏙️ Near downtown' },
  { value: 'work', label: '💼 Near my workplace' },
] as const;

const PRIVACY_OPTIONS = [
  { value: 'PUBLIC', label: 'Public', desc: 'Visible in discovery' },
  { value: 'MATCHES_ONLY', label: 'Matches only', desc: 'Only people you connect with' },
  { value: 'HIDDEN', label: 'Hidden', desc: 'Invisible until you reach out' },
] as const;

const schema = z.object({
  budgetMin: z.number().int().positive(),
  budgetMax: z.number().int().positive(),
  moveInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a move-in date'),
  city: z.string().min(1, 'City is required'),
  bio: z.string().max(500).optional(),
  privacyMode: z.enum(['PUBLIC', 'MATCHES_ONLY', 'HIDDEN']),
});
type Form = z.infer<typeof schema>;

export function WrapupStep({ initialCity }: { initialCity?: string }) {
  const [pending, start] = useTransition();
  const [proximity, setProximity] = useState<string[]>([]);
  const [nearUniversity, setNearUniversity] = useState('');

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      budgetMin: 700,
      budgetMax: 2000,
      moveInDate: '',
      city: initialCity ?? '',
      bio: '',
      privacyMode: 'PUBLIC',
    },
  });

  const bMin = useWatch({ control: form.control, name: 'budgetMin', defaultValue: 700 });
  const bMax = useWatch({ control: form.control, name: 'budgetMax', defaultValue: 2000 });
  const bio = useWatch({ control: form.control, name: 'bio', defaultValue: '' });
  const privacyMode = useWatch({ control: form.control, name: 'privacyMode', defaultValue: 'PUBLIC' });

  const toggleProximity = (val: string) => {
    setProximity((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">Almost done!</h1>
        <p className="text-[#7d766f] text-sm">Tell us your budget and where you want to live.</p>
      </div>

      <form
        className="space-y-6"
        onSubmit={form.handleSubmit((data) => {
          start(async () => {
            await saveWrapupAction({
              budgetMin: data.budgetMin,
              budgetMax: data.budgetMax,
              moveInDate: data.moveInDate,
              preferredCities: [data.city],
              proximityPriorities: proximity,
              nearUniversity: proximity.includes('university') ? nearUniversity : undefined,
              bio: data.bio,
              privacyMode: data.privacyMode,
            });
          });
        })}
      >
        <Controller
          name="budgetMin"
          control={form.control}
          render={() => (
            <Slider
              label="Monthly budget (CAD)"
              description="Drag to set your range."
              min={200}
              max={6000}
              step={50}
              value={[bMin, bMax]}
              onChange={(range) => {
                form.setValue('budgetMin', range[0], { shouldValidate: true });
                form.setValue('budgetMax', range[1], { shouldValidate: true });
              }}
              formatLabel={(n) => `$${n.toLocaleString('en-CA')}`}
            />
          )}
        />
        {(form.formState.errors.budgetMin || form.formState.errors.budgetMax) && (
          <p className="text-xs text-red-500">Budget range is invalid</p>
        )}

        <Controller
          name="moveInDate"
          control={form.control}
          render={({ field, fieldState }) => (
            <DatePicker
              id="wrapup-move-in"
              label="Target move-in date"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#1c1b1b]">Preferred city</label>
          <input
            {...form.register('city')}
            placeholder="e.g. Calgary"
            className="w-full rounded-xl border border-[#cfc5bd] bg-white px-4 py-3 text-sm text-[#1c1b1b] placeholder-[#7d766f] focus:outline-none focus:ring-2 focus:ring-[#A86472]/20 focus:border-[#A86472]"
          />
          {form.formState.errors.city && (
            <p className="text-xs text-red-500">{form.formState.errors.city.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-[#1c1b1b]">What matters to you about location? <span className="text-[#7d766f] font-normal">(optional)</span></p>
          <div className="flex flex-wrap gap-2">
            {PROXIMITY_OPTIONS.map((opt) => {
              const active = proximity.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleProximity(opt.value)}
                  className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    active
                      ? 'border-[#A86472] bg-[#F9F0EE] text-[#A86472]'
                      : 'border-[#cfc5bd] text-[#4c4640] hover:border-[#A86472]/50'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {proximity.includes('university') && (
            <input
              value={nearUniversity}
              onChange={(e) => setNearUniversity(e.target.value)}
              placeholder="Which university? e.g. University of Calgary"
              className="w-full rounded-xl border border-[#cfc5bd] bg-white px-4 py-3 text-sm text-[#1c1b1b] placeholder-[#7d766f] focus:outline-none focus:ring-2 focus:ring-[#A86472]/20 focus:border-[#A86472]"
            />
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#1c1b1b]">
            Bio <span className="text-[#7d766f] font-normal">(optional)</span>
          </label>
          <textarea
            {...form.register('bio')}
            rows={3}
            maxLength={500}
            placeholder="A little about yourself: hobbies, lifestyle, what you're looking for..."
            className="w-full rounded-xl border border-[#cfc5bd] bg-white px-4 py-3 text-sm text-[#1c1b1b] placeholder-[#7d766f] focus:outline-none focus:ring-2 focus:ring-[#A86472]/20 focus:border-[#A86472] resize-none"
          />
          <p className="text-right text-xs text-[#7d766f]">{(bio ?? '').length}/500</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-[#1c1b1b]">Who can see your profile?</p>
          <div className="space-y-2">
            {PRIVACY_OPTIONS.map((opt) => {
              const active = privacyMode === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => form.setValue('privacyMode', opt.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                    active
                      ? 'border-[#A86472] bg-[#F9F0EE]'
                      : 'border-[#cfc5bd] hover:border-[#A86472]/50'
                  }`}
                >
                  <span className={`text-sm font-medium ${active ? 'text-[#2d4a3e]' : 'text-[#4c4640]'}`}>{opt.label}</span>
                  <span className="text-xs text-[#7d766f]">{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 rounded-xl bg-[#A86472] text-white font-semibold text-sm disabled:opacity-50 hover:bg-[#8A505E] transition-colors"
        >
          {pending ? 'Creating your profile…' : '🎉 Complete setup'}
        </button>
      </form>
    </div>
  );
}
