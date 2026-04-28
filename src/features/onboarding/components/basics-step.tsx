'use client';

import { useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { basicsSchema, type BasicsForm } from '@/lib/onboarding/step-schemas';
import { dobToStoredDate, isAtLeast18 } from '@/lib/dates';
import { saveBasicsAction } from '@/features/onboarding/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radio-group';
import { DatePicker } from '@/components/ui/date-picker';

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'NON_BINARY', label: 'Non-binary' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

export function BasicsStep({
  initial,
}: {
  initial: {
    firstName?: string;
    dateOfBirth?: string;
    gender?: BasicsForm['gender'];
    occupation?: string;
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
      occupation: initial.occupation ?? '',
      city: initial.city ?? '',
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>About you</CardTitle>
        <p className="text-sm text-slate-500">
          This information powers compatibility matching and safety features.
        </p>
      </CardHeader>
      <CardContent>
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
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" {...form.register('firstName')} />
            {form.formState.errors.firstName ? (
              <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
            ) : null}
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
            <Label>Gender</Label>
            <Controller
              name="gender"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  name="gender"
                  options={GENDER_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  aria-invalid={!!form.formState.errors.gender}
                />
              )}
            />
            {form.formState.errors.gender ? (
              <p className="text-sm text-red-600">{form.formState.errors.gender.message}</p>
            ) : null}
            <WhyWeAskGender />
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation (optional)</Label>
            <Input id="occupation" {...form.register('occupation')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City you&apos;re looking in</Label>
            <Input id="city" {...form.register('city')} />
            {form.formState.errors.city ? (
              <p className="text-sm text-red-600">{form.formState.errors.city.message}</p>
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

function WhyWeAskGender() {
  return (
    <details className="text-sm text-slate-600">
      <summary className="cursor-pointer font-medium text-primary-700">
        Why we ask
      </summary>
      <p className="mt-2 rounded-lg bg-slate-50 p-3">
        We ask so we can match you with people who share or respect your identity. You can
        choose what&apos;s visible to others in your privacy settings.
      </p>
    </details>
  );
}
