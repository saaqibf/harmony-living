'use client';

import { useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { valuesSchema, type ValuesForm } from '@/lib/onboarding/step-schemas';
import { DIETARY_PRACTICE } from '@/lib/onboarding/vocabulary';
import { saveValuesAction } from '@/features/onboarding/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';

const GENDER_PREF = [
  { value: 'MALE_ONLY', label: 'Male roommate only' },
  { value: 'FEMALE_ONLY', label: 'Female roommate only' },
  { value: 'ANY', label: 'Any gender' },
  { value: 'NON_BINARY_INCLUSIVE', label: 'Non-binary inclusive' },
];

const FAITH_PRACTICE = [
  { value: 'PRACTICING', label: 'Practicing' },
  { value: 'CULTURAL', label: 'Cultural' },
  { value: 'NOT_PRACTICING', label: 'Not practicing' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

const uiSchema = z.object({
  faithPractice: z.string().optional(),
  faith: z.string().optional(),
  dietaryPractice: z.string().optional(),
  prayerSpaceNeeded: z.boolean(),
  genderPreference: z.enum(['MALE_ONLY', 'FEMALE_ONLY', 'ANY', 'NON_BINARY_INCLUSIVE']),
  ageMin: z.number().int().min(18),
  ageMax: z.number().int().max(99),
  faithMatchRequired: z.boolean(),
  personality: z.string().optional(),
  socialLevel: z.number().int().min(1).max(5),
  dNoSmoking: z.boolean(),
  dNoPets: z.boolean(),
  dFaith: z.boolean(),
  dNoDrinking: z.boolean(),
  dGender: z.enum(['', 'male_only', 'female_only']),
  dBudgetMax: z.string(),
});

type UiValues = z.infer<typeof uiSchema>;

function buildDealbreakers(data: UiValues): unknown[] {
  const out: unknown[] = [];
  if (data.dNoSmoking) out.push({ kind: 'no_smoking' });
  if (data.dNoPets) out.push({ kind: 'no_pets' });
  if (data.dFaith) out.push({ kind: 'faith_match' });
  if (data.dNoDrinking) out.push({ kind: 'no_drinking' });
  if (data.dGender === 'male_only') out.push({ kind: 'gender', value: 'male_only' });
  if (data.dGender === 'female_only') out.push({ kind: 'gender', value: 'female_only' });
  const n = Number(data.dBudgetMax);
  if (data.dBudgetMax.trim() && Number.isFinite(n) && n > 0) {
    out.push({ kind: 'budget_max', value: n });
  }
  return out;
}

function parseInitialDeals(initial: Partial<ValuesForm>) {
  const raw = initial.dealbreakers;
  const deals = Array.isArray(raw) ? raw : [];
  const has = (k: string) =>
    deals.some((d) => typeof d === 'object' && d && 'kind' in d && (d as { kind: string }).kind === k);
  const genderDeal = deals.find(
    (d) => typeof d === 'object' && d && 'kind' in d && (d as { kind: string }).kind === 'gender',
  ) as { kind: 'gender'; value: 'male_only' | 'female_only' } | undefined;
  const budgetDeal = deals.find(
    (d) => typeof d === 'object' && d && 'kind' in d && (d as { kind: string }).kind === 'budget_max',
  ) as { kind: 'budget_max'; value: number } | undefined;
  return {
    dNoSmoking: has('no_smoking'),
    dNoPets: has('no_pets'),
    dFaith: has('faith_match'),
    dNoDrinking: has('no_drinking'),
    dGender:
      genderDeal?.value === 'male_only'
        ? ('male_only' as const)
        : genderDeal?.value === 'female_only'
          ? ('female_only' as const)
          : ('' as const),
    dBudgetMax: budgetDeal?.value ? String(budgetDeal.value) : '',
  };
}

export function ValuesStep({ initial }: { initial: Partial<ValuesForm> }) {
  const [pending, start] = useTransition();
  const d0 = parseInitialDeals(initial);

  const form = useForm<UiValues>({
    resolver: zodResolver(uiSchema),
    defaultValues: {
      faithPractice: initial.faithPractice ?? '',
      faith: initial.faith ?? '',
      dietaryPractice: initial.dietaryPractice ?? '',
      prayerSpaceNeeded: initial.prayerSpaceNeeded ?? false,
      genderPreference: initial.genderPreference ?? 'ANY',
      ageMin: initial.ageMin ?? 18,
      ageMax: initial.ageMax ?? 99,
      faithMatchRequired: initial.faithMatchRequired ?? false,
      personality: initial.personality ?? '',
      socialLevel: initial.socialLevel ?? 3,
      ...d0,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Values & boundaries</CardTitle>
        <p className="text-sm text-slate-500">
          These answers shape who we suggest as compatible roommates.
        </p>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((ui) => {
            start(async () => {
              try {
                const dealbreakers = buildDealbreakers(ui);
                const payload = valuesSchema.parse({
                  faithPractice: ui.faithPractice || undefined,
                  faith: ui.faith,
                  dietaryPractice: ui.dietaryPractice || undefined,
                  prayerSpaceNeeded: ui.prayerSpaceNeeded,
                  genderPreference: ui.genderPreference,
                  ageMin: ui.ageMin,
                  ageMax: ui.ageMax,
                  faithMatchRequired: ui.faithMatchRequired,
                  personality: ui.personality,
                  socialLevel: ui.socialLevel,
                  dealbreakers,
                });
                await saveValuesAction(payload);
              } catch (e) {
                form.setError('root', {
                  message: e instanceof Error ? e.message : 'Something went wrong',
                });
              }
            });
          })}
        >
          <div className="space-y-2">
            <Label>Faith practice</Label>
            <Controller
              name="faithPractice"
              control={form.control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  <option value="">Skip</option>
                  {FAITH_PRACTICE.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="faith">Faith / tradition (optional)</Label>
            <Input id="faith" {...form.register('faith')} />
            <details className="text-sm text-slate-600">
              <summary className="cursor-pointer font-medium text-primary-700">Why we ask</summary>
              <p className="mt-2 rounded-lg bg-slate-50 p-3">
                We ask so we can match you with people who share or respect your practice.
              </p>
            </details>
          </div>

          <div className="space-y-2">
            <Label>Dietary practice</Label>
            <Controller
              name="dietaryPractice"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value)}>
                  <option value="">Skip</option>
                  {DIETARY_PRACTICE.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              )}
            />
          </div>

          <Controller
            name="prayerSpaceNeeded"
            control={form.control}
            render={({ field }) => (
              <Checkbox
                id="prayer"
                label="I need access to prayer / meditation space"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            )}
          />

          <div className="space-y-2">
            <Label>Roommate gender preference</Label>
            <Controller
              name="genderPreference"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  name="genderPreference"
                  options={GENDER_PREF}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <details className="text-sm text-slate-600">
              <summary className="cursor-pointer font-medium text-primary-700">Why we ask</summary>
              <p className="mt-2 rounded-lg bg-slate-50 p-3">
                This helps us respect comfort and faith-based housing preferences.
              </p>
            </details>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ageMin">Minimum roommate age</Label>
              <Input id="ageMin" type="number" {...form.register('ageMin', { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ageMax">Maximum roommate age</Label>
              <Input id="ageMax" type="number" {...form.register('ageMax', { valueAsNumber: true })} />
            </div>
          </div>

          <Controller
            name="faithMatchRequired"
            control={form.control}
            render={({ field }) => (
              <Checkbox
                id="faithMatch"
                label="Faith match is important for me"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            )}
          />

          <div className="space-y-2">
            <Label htmlFor="personality">Personality notes (optional)</Label>
            <Textarea id="personality" rows={3} {...form.register('personality')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="social">Social energy (1 = quiet, 5 = very social)</Label>
            <Input
              id="social"
              type="number"
              min={1}
              max={5}
              {...form.register('socialLevel', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-3 rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-medium text-slate-800">Dealbreakers (optional)</p>
            <Controller
              name="dNoSmoking"
              control={form.control}
              render={({ field }) => (
                <Checkbox
                  id="d1"
                  label="No smoking"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <Controller
              name="dNoPets"
              control={form.control}
              render={({ field }) => (
                <Checkbox
                  id="d2"
                  label="No pets"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <Controller
              name="dFaith"
              control={form.control}
              render={({ field }) => (
                <Checkbox
                  id="d3"
                  label="Must share my faith practice"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <Controller
              name="dNoDrinking"
              control={form.control}
              render={({ field }) => (
                <Checkbox
                  id="d4"
                  label="No drinking"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
            <div className="space-y-2">
              <Label>Gender dealbreaker (optional)</Label>
              <Controller
                name="dGender"
                control={form.control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(e.target.value as UiValues['dGender'])
                    }
                  >
                    <option value="">None</option>
                    <option value="male_only">Male roommate only</option>
                    <option value="female_only">Female roommate only</option>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dBudget">Max rent dealbreaker (optional, CAD)</Label>
              <Input id="dBudget" {...form.register('dBudgetMax')} placeholder="e.g. 1200" />
            </div>
          </div>

          {form.formState.errors.root ? (
            <p className="text-sm text-red-600">{String(form.formState.errors.root.message)}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Saving…' : 'Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
