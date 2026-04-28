import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { buttonClasses } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function SettingsProfilePage() {
  await requireUser();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile editing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-600">
          <p>
            Profile editing is coming in a future update. For now, your onboarding answers are
            your profile.
          </p>
          <Link
            href="/dashboard"
            className={buttonClasses({ variant: 'secondary', className: 'inline-flex' })}
          >
            Back to dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
