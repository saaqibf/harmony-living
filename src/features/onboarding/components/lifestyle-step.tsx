'use client';

import { useTransition } from 'react';
import type { Control, FieldPath } from 'react-hook-form';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lifestyleSchema, type LifestyleForm } from '@/lib/onboarding/step-schemas';
import {
  COOKING_FREQUENCY,
  DRINKING_ROOMMATE,
  DRINKING_SELF,
  GUESTS,
  NOISE_TOLERANCE,
  PETS_ROOMMATE,
} from '@/lib/onboarding/vocabulary';
import { saveLifestyleAction } from '@/features/onboarding/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';

const CLEAN_OPTS = [
  { value: 'VERY_TIDY', label: 'Very tidy' },
  { value: 'TIDY', label: 'Tidy' },
  { value: 'AVERAGE', label: 'Average' },
  { value: 'RELAXED', label: 'Relaxed' },
];

const SCHED_OPTS = [
  { value: 'EARLY_BIRD', label: 'Early bird' },
  { value: 'NIGHT_OWL', label: 'Night owl' },
  { value: 'FLEXIBLE', label: 'Flexible' },
  { value: 'SHIFT_WORKER', label: 'Shift worker' },
];

function VocabSelect<K extends FieldPath<LifestyleForm>>({
  label,
  name,
  control,
  options,
}: {
  label: string;
  name: K;
  control: Control<LifestyleForm>;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select {...field} value={field.value as string}>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        )}
      />
    </div>
  );
}

export function LifestyleStep({ initial }: { initial: Partial<LifestyleForm> }) {
  const [pending, start] = useTransition();
  const form = useForm<LifestyleForm>({
    resolver: zodResolver(lifestyleSchema),
    defaultValues: {
      cleanliness: initial.cleanliness ?? 'AVERAGE',
      schedule: initial.schedule ?? 'FLEXIBLE',
      smokingSelf: initial.smokingSelf ?? false,
      smokingRoommate: initial.smokingRoommate ?? false,
      drinkingSelf: initial.drinkingSelf ?? 'never',
      drinkingRoommate: initial.drinkingRoommate ?? 'any',
      pets: initial.pets ?? false,
      petsRoommate: initial.petsRoommate ?? 'any',
      guests: initial.guests ?? 'sometimes',
      noiseTolerance: initial.noiseTolerance ?? 'moderate',
      cookingFrequency: initial.cookingFrequency ?? 'sometimes',
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lifestyle</CardTitle>
        <p className="text-sm text-slate-500">Honest answers help us find compatible roommates.</p>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((data) => {
            start(async () => {
              await saveLifestyleAction(data);
            });
          })}
        >
          <div className="space-y-2">
            <Label>Cleanliness</Label>
            <Controller
              name="cleanliness"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  name="cleanliness"
                  options={CLEAN_OPTS}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Daily schedule</Label>
            <Controller
              name="schedule"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  name="schedule"
                  options={SCHED_OPTS}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-3">
            <Controller
              name="smokingSelf"
              control={form.control}
              render={({ field }) => (
                <Checkbox
                  id="smokingSelf"
                  label="I smoke"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <Controller
              name="smokingRoommate"
              control={form.control}
              render={({ field }) => (
                <Checkbox
                  id="smokingRoommate"
                  label="OK with a roommate who smokes"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <Controller
              name="pets"
              control={form.control}
              render={({ field }) => (
                <Checkbox
                  id="pets"
                  label="I have a pet"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
          </div>

          <VocabSelect
            label="Your drinking"
            name="drinkingSelf"
            control={form.control}
            options={DRINKING_SELF}
          />
          <VocabSelect
            label="Roommate drinking"
            name="drinkingRoommate"
            control={form.control}
            options={DRINKING_ROOMMATE}
          />
          <VocabSelect
            label="Roommate pets"
            name="petsRoommate"
            control={form.control}
            options={PETS_ROOMMATE}
          />
          <VocabSelect
            label="Guests"
            name="guests"
            control={form.control}
            options={GUESTS}
          />
          <VocabSelect
            label="Noise preference"
            name="noiseTolerance"
            control={form.control}
            options={NOISE_TOLERANCE}
          />
          <VocabSelect
            label="Cooking frequency"
            name="cookingFrequency"
            control={form.control}
            options={COOKING_FREQUENCY}
          />

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Saving…' : 'Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
