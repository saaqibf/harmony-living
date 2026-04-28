'use client';

import { useTransition } from 'react';
import type { Resolver } from 'react-hook-form';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  housingPrefsSchema,
  type HousingPrefsForm,
} from '@/lib/onboarding/step-schemas';
import { saveHousingPrefsAction } from '@/features/onboarding/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { DatePicker } from '@/components/ui/date-picker';
import { Chips } from '@/components/ui/chips';

function isoDateOnly(iso?: string): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function HousingPrefsStep({ initial }: { initial: Partial<HousingPrefsForm> }) {
  const [pending, start] = useTransition();
  const defaultBudgetMin = initial.budgetMin ?? 600;
  const defaultBudgetMax = initial.budgetMax ?? 2000;

  const form = useForm<HousingPrefsForm>({
    resolver: zodResolver(housingPrefsSchema) as Resolver<HousingPrefsForm>,
    defaultValues: {
      budgetMin: defaultBudgetMin,
      budgetMax: defaultBudgetMax,
      moveInDate: isoDateOnly(initial.moveInDate) || '',
      moveInFlexibilityDays: initial.moveInFlexibilityDays ?? 14,
      leaseMinMonths: initial.leaseMinMonths ?? 6,
      leaseMaxMonths: initial.leaseMaxMonths ?? 12,
      preferredCities: initial.preferredCities ?? [],
      preferredNeighborhoods: initial.preferredNeighborhoods ?? [],
    },
  });

  const b0 = useWatch({ control: form.control, name: 'budgetMin', defaultValue: defaultBudgetMin });
  const b1 = useWatch({ control: form.control, name: 'budgetMax', defaultValue: defaultBudgetMax });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Housing preferences</CardTitle>
        <p className="text-sm text-slate-500">
          Monthly budget is in CAD. You can refine this anytime.
        </p>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((data) => {
            start(async () => {
              await saveHousingPrefsAction({
                ...data,
                moveInDate: data.moveInDate,
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
                description="Drag both handles to set your range."
                min={200}
                max={6000}
                step={50}
                value={[b0 ?? defaultBudgetMin, b1 ?? defaultBudgetMax]}
                onChange={(range) => {
                  form.setValue('budgetMin', range[0], { shouldValidate: true });
                  form.setValue('budgetMax', range[1], { shouldValidate: true });
                }}
                formatLabel={(n) => `$${n.toLocaleString('en-CA')}`}
              />
            )}
          />
          {form.formState.errors.budgetMin || form.formState.errors.budgetMax ? (
            <p className="text-sm text-red-600">
              {form.formState.errors.budgetMax?.message ??
                form.formState.errors.budgetMin?.message}
            </p>
          ) : null}

          <Controller
            name="moveInDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <DatePicker
                label="Target move-in date"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="flex">Move-in flexibility (days)</Label>
              <Input
                id="flex"
                type="number"
                min={0}
                {...form.register('moveInFlexibilityDays', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leaseMin">Min lease (months)</Label>
              <Input
                id="leaseMin"
                type="number"
                min={1}
                {...form.register('leaseMinMonths', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leaseMax">Max lease (months)</Label>
              <Input
                id="leaseMax"
                type="number"
                min={1}
                {...form.register('leaseMaxMonths', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preferred cities</Label>
            <Controller
              name="preferredCities"
              control={form.control}
              render={({ field }) => (
                <Chips
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="e.g. Calgary — press Enter"
                />
              )}
            />
            {form.formState.errors.preferredCities ? (
              <p className="text-sm text-red-600">Add at least one city.</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Preferred neighborhoods (optional)</Label>
            <Controller
              name="preferredNeighborhoods"
              control={form.control}
              render={({ field }) => (
                <Chips
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Neighborhood — press Enter"
                />
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Saving…' : 'Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
