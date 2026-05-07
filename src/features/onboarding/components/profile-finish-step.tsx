'use client';

import { useRef, useTransition } from 'react';
import type { Resolver } from 'react-hook-form';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileFinishSchema, type ProfileFinishForm } from '@/lib/onboarding/step-schemas';
import { saveProfileFinishAction } from '@/features/onboarding/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup } from '@/components/ui/radio-group';
import { Chips } from '@/components/ui/chips';

const PRIVACY = [
  { value: 'PUBLIC', label: 'Public — visible in discovery' },
  { value: 'MATCHES_ONLY', label: 'Matches only' },
  { value: 'HIDDEN', label: 'Hidden until I connect' },
];

export function ProfileFinishStep({
  initial,
}: {
  initial: { bio?: string; languages?: string[]; privacyMode?: ProfileFinishForm['privacyMode'] };
}) {
  const [pending, start] = useTransition();
  const form = useForm<ProfileFinishForm>({
    resolver: zodResolver(profileFinishSchema) as Resolver<ProfileFinishForm>,
    defaultValues: {
      bio: initial.bio ?? '',
      languages: initial.languages ?? [],
      privacyMode: initial.privacyMode ?? 'PUBLIC',
    },
  });

  const bioRef = useRef<HTMLTextAreaElement | null>(null);
  const bio = useWatch({ control: form.control, name: 'bio', defaultValue: '' });
  const bioLen = bio?.length ?? 0;

  const BIO_PROMPTS = [
    "I'm the kind of roommate who...",
    "My ideal home vibe is...",
    "One thing about living with me...",
  ];

  function injectPrompt(prompt: string) {
    const current = form.getValues('bio') ?? '';
    const next = current ? `${current} ${prompt}` : prompt;
    form.setValue('bio', next.slice(0, 500), { shouldDirty: true });
    setTimeout(() => bioRef.current?.focus(), 0);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finish your profile</CardTitle>
        <p className="text-sm text-slate-500">
          You can finish onboarding without a photo. Add one anytime from Settings → Profile.
        </p>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit((data) => {
            start(async () => {
              await saveProfileFinishAction(data);
            });
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="bio">Introduce yourself <span className="text-slate-400 font-normal">(optional)</span></Label>
            <p className="text-xs text-slate-500">Tap a prompt to get started, or write your own.</p>
            <div className="flex flex-wrap gap-2">
              {BIO_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => injectPrompt(p)}
                  className="text-xs px-3 py-1.5 rounded-full border border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors font-medium"
                >
                  {p}
                </button>
              ))}
            </div>
            <Textarea
              id="bio"
              maxLength={500}
              placeholder="Tell future roommates who you are..."
              {...form.register('bio')}
              ref={(el) => {
                form.register('bio').ref(el);
                bioRef.current = el;
              }}
            />
            <p className="text-right text-xs text-slate-500">{bioLen}/500</p>
          </div>

          <div className="space-y-2">
            <Label>Languages you speak</Label>
            <Controller
              name="languages"
              control={form.control}
              render={({ field }) => (
                <Chips
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Type a language, press Enter"
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Privacy</Label>
            <Controller
              name="privacyMode"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  name="privacy"
                  options={PRIVACY}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-600">
            <p className="font-medium text-slate-800">Photo</p>
            <p className="mt-2">
              You can finish onboarding without a photo. Add one anytime from Settings → Profile.
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-4 opacity-60"
              aria-disabled
              disabled
            >
              Photo upload coming in a future update
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Finishing…' : 'Complete onboarding'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
