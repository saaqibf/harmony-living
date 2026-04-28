'use client';

import { useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { intentSchema, type IntentForm } from '@/lib/onboarding/step-schemas';
import { saveIntentAction } from '@/features/onboarding/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const OPTIONS = [
  { value: 'seeker', label: "I'm looking for a room / roommate" },
  { value: 'lister', label: "I'm listing a spare room" },
  { value: 'both', label: 'Both' },
];

export function IntentStep({ initialIntent }: { initialIntent: string | null }) {
  const [pending, start] = useTransition();
  const form = useForm<IntentForm>({
    resolver: zodResolver(intentSchema),
    defaultValues: {
      intent:
        initialIntent === 'seeker' || initialIntent === 'lister' || initialIntent === 'both'
          ? initialIntent
          : undefined,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>What brings you here?</CardTitle>
        <p className="text-sm text-slate-500">
          We use this to tailor your experience. You can change it later.
        </p>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((data) => {
            start(async () => {
              await saveIntentAction(data);
            });
          })}
        >
          <div className="space-y-2">
            <Label>Your goal</Label>
            <Controller
              name="intent"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  name="intent"
                  options={OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  aria-invalid={!!form.formState.errors.intent}
                />
              )}
            />
            {form.formState.errors.intent ? (
              <p className="text-sm text-red-600">{form.formState.errors.intent.message}</p>
            ) : null}
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Saving…' : 'Continue'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
