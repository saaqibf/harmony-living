import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PhotoUpload } from '@/features/listings/components/photo-upload';

export default async function SettingsProfilePage() {
  const auth = await requireUser();
  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { id: true, profile: { select: { photoUrl: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[--color-fg]">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile photo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[--color-muted-fg]">
            Your photo is shown to other users based on your photo visibility setting. A blurred version is generated automatically.
          </p>
          <PhotoUpload
            endpoint="/api/upload/profile-photo"
            currentUrl={user?.profile?.photoUrl}
            label="Upload profile photo"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Intro media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[--color-muted-fg]">
            A short voice or video intro. Profiles with intros get a queue boost in discovery.
          </p>
          <PhotoUpload
            endpoint="/api/upload/intro-media"
            label="Upload voice / video intro"
          />
        </CardContent>
      </Card>
    </div>
  );
}
