import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { buttonClasses } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function SettingsPage() {
  await requireUser();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your account</CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            href="/settings/profile"
            className={buttonClasses({ variant: 'secondary', className: 'inline-flex w-full sm:w-auto' })}
          >
            Profile
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
