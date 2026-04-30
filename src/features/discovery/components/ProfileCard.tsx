import type { DiscoveryProfile } from '@/server/services/discovery';

type Props = {
  profile: DiscoveryProfile;
  hasMatch: boolean;
};

const FAITH_LABELS: Record<string, string> = {
  PRACTICING: 'Practicing',
  CULTURAL: 'Cultural',
  NOT_PRACTICING: 'Not practicing',
  PREFER_NOT_TO_SAY: '',
};

export function ProfileCard({ profile, hasMatch }: Props) {
  const showPhoto =
    profile.photoVisibility === 'ALWAYS' ||
    (profile.photoVisibility === 'UNTIL_MATCH' && hasMatch);
  const photoSrc = showPhoto ? profile.photoUrl : profile.photoUrlBlurred;

  const faithLabel =
    profile.faith && profile.faithPractice
      ? `${FAITH_LABELS[profile.faithPractice] ?? ''} ${profile.faith}`.trim()
      : profile.faith ?? null;

  const bullets: string[] = [];
  if (profile.occupation) bullets.push(profile.occupation);
  if (faithLabel) bullets.push(faithLabel);
  if (profile.introMediaUrl) bullets.push(profile.introMediaType === 'VIDEO' ? 'Has video intro' : 'Has voice intro');

  return (
    <div className="rounded-2xl overflow-hidden border border-[--color-border] bg-[--color-surface] shadow-md w-full max-w-sm">
      <div className="aspect-[3/4] bg-[--color-muted] relative overflow-hidden">
        {photoSrc ? (
          <img
            src={photoSrc}
            alt={profile.firstName}
            className="w-full h-full object-cover"
            style={!showPhoto ? { filter: 'blur(12px)', transform: 'scale(1.05)' } : undefined}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[--color-muted-fg]">
            <span className="text-6xl">👤</span>
          </div>
        )}
        {profile.photoVisibility === 'PRIVATE' && (
          <div className="absolute inset-0 flex items-center justify-center bg-[--color-muted]/60">
            <p className="text-sm text-[--color-muted-fg] font-medium">Photo private</p>
          </div>
        )}
      </div>

      <div className="p-5 space-y-2">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-bold text-[--color-fg]">
            {profile.firstName}, {profile.ageYears}
          </h2>
          <span className="text-sm text-[--color-muted-fg]">{profile.city}</span>
        </div>

        {bullets.length > 0 && (
          <ul className="space-y-0.5">
            {bullets.map((b) => (
              <li key={b} className="text-sm text-[--color-muted-fg] flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[--color-muted-fg] shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        )}

        {profile.bio && (
          <p className="text-sm text-[--color-fg] line-clamp-3 pt-1">{profile.bio}</p>
        )}
      </div>
    </div>
  );
}
