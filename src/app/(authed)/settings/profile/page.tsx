import { requireDbUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { PhotoUpload } from '@/features/listings/components/photo-upload';
import { ProfileInfoForm } from './_form';

export default async function SettingsProfilePage() {
  const { userId } = await requireDbUser();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      profile: {
        select: {
          firstName: true,
          lastName: true,
          occupation: true,
          bio: true,
          city: true,
          photoUrl: true,
        },
      },
    },
  });
  const p = user?.profile;

  return (
    <div className="min-h-screen bg-[#F2E6E0]">
      <div className="px-6 pt-8 pb-5 border-b border-[#cfc5bd] bg-white">
        <h1 className="text-2xl font-serif font-semibold text-[#1c1b1b]">Edit profile</h1>
      </div>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Photo */}
        <div className="bg-white rounded-2xl border border-[#cfc5bd] p-5">
          <h2 className="font-semibold text-[#1c1b1b] mb-1 text-sm">Profile photo</h2>
          <p className="text-xs text-[#7d766f] mb-4">A blurred version is shown until you match.</p>
          <PhotoUpload endpoint="/api/upload/profile-photo" currentUrl={p?.photoUrl} label="Upload photo" />
        </div>

        {/* Text info */}
        <div className="bg-white rounded-2xl border border-[#cfc5bd] p-5">
          <h2 className="font-semibold text-[#1c1b1b] mb-4 text-sm">About you</h2>
          <ProfileInfoForm
            initial={{
              firstName: p?.firstName ?? '',
              lastName: p?.lastName ?? '',
              occupation: p?.occupation ?? '',
              bio: p?.bio ?? '',
              city: p?.city ?? '',
            }}
          />
        </div>

        {/* Intro media */}
        <div className="bg-white rounded-2xl border border-[#cfc5bd] p-5">
          <h2 className="font-semibold text-[#1c1b1b] mb-1 text-sm">Intro media</h2>
          <p className="text-xs text-[#7d766f] mb-4">Short voice or video intro. Boosts your place in the discovery queue.</p>
          <PhotoUpload endpoint="/api/upload/intro-media" label="Upload voice / video intro" />
        </div>
      </div>
    </div>
  );
}
