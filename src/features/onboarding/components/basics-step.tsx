'use client';

import { useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { basicsSchema, type BasicsForm } from '@/lib/onboarding/step-schemas';
import { dobToStoredDate, isAtLeast18 } from '@/lib/dates';
import { saveBasicsAction } from '@/features/onboarding/lib/actions';
import { DatePicker } from '@/components/ui/date-picker';

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Man' },
  { value: 'FEMALE', label: 'Woman' },
  { value: 'NON_BINARY', label: 'Non-binary' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
] as const;

export function BasicsStep({
  initial,
}: {
  initial: {
    firstName?: string;
    dateOfBirth?: string;
    gender?: BasicsForm['gender'];
    city?: string;
  };
}) {
  const [pending, start] = useTransition();
  const form = useForm<BasicsForm>({
    resolver: zodResolver(basicsSchema),
    defaultValues: {
      firstName: initial.firstName ?? '',
      dateOfBirth: initial.dateOfBirth ?? '',
      gender: initial.gender ?? 'PREFER_NOT_TO_SAY',
      occupation: '',
      city: initial.city ?? '',
    },
  });

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">About you</h1>
        <p className="text-[#7d766f] text-sm">Just the basics. Takes 60 seconds.</p>
      </div>

      <form
        className="space-y-5"
        onSubmit={form.handleSubmit((data) => {
          const dob = dobToStoredDate(data.dateOfBirth);
          if (!isAtLeast18(dob)) {
            form.setError('dateOfBirth', { message: 'You must be at least 18.' });
            return;
          }
          start(async () => {
            await saveBasicsAction(data);
          });
        })}
      >
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#1c1b1b]">First name</label>
          <input
            {...form.register('firstName')}
            placeholder="Your first name"
            className="w-full rounded-xl border border-[#cfc5bd] bg-white px-4 py-3 text-sm text-[#1c1b1b] placeholder-[#7d766f] focus:outline-none focus:ring-2 focus:ring-[#A86472]/20 focus:border-[#A86472] transition-colors"
          />
          {form.formState.errors.firstName && (
            <p className="text-xs text-red-500">{form.formState.errors.firstName.message}</p>
          )}
        </div>

        <Controller
          name="dateOfBirth"
          control={form.control}
          render={({ field, fieldState }) => (
            <DatePicker
              label="Date of birth"
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#1c1b1b]">Gender</label>
          <div className="grid grid-cols-2 gap-2">
            {GENDER_OPTIONS.map((opt) => {
              const selected = form.watch('gender') === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => form.setValue('gender', opt.value)}
                  className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    selected
                      ? 'border-[#A86472] bg-[#F9F0EE] text-[#A86472]'
                      : 'border-[#cfc5bd] text-[#4c4640] hover:border-[#A86472]/50'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#1c1b1b]">City you&apos;re looking in</label>
          <input
            {...form.register('city')}
            placeholder="e.g. Calgary"
            className="w-full rounded-xl border border-[#cfc5bd] bg-white px-4 py-3 text-sm text-[#1c1b1b] placeholder-[#7d766f] focus:outline-none focus:ring-2 focus:ring-[#A86472]/20 focus:border-[#A86472] transition-colors"
          />
          {form.formState.errors.city && (
            <p className="text-xs text-red-500">{form.formState.errors.city.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 rounded-xl bg-[#A86472] text-white font-semibold text-sm disabled:opacity-50 hover:bg-[#8A505E] transition-colors"
        >
          {pending ? 'Saving…' : 'Continue →'}
        </button>
      </form>
    </div>
  );
}
