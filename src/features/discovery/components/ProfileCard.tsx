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
  // Photo visibility logic — unchanged
  const showPhoto =
    profile.photoVisibility === 'ALWAYS' ||
    (profile.photoVisibility === 'UNTIL_MATCH' && hasMatch);
  const photoSrc = showPhoto
    ? profile.photoUrl
    : profile.photoVisibility === 'PRIVATE'
      ? null
      : profile.photoUrlBlurred;

  const faithLabel =
    profile.faith && profile.faithPractice
      ? `${FAITH_LABELS[profile.faithPractice] ?? ''} ${profile.faith}`.trim()
      : profile.faith ?? null;

  const chips: string[] = [];
  if (profile.occupation) chips.push(profile.occupation);
  if (faithLabel) chips.push(faithLabel);
  if (profile.introMediaUrl)
    chips.push(profile.introMediaType === 'VIDEO' ? '🎥 Video intro' : '🎤 Voice intro');

  return (
    <div className="rounded-3xl overflow-hidden bg-white shadow-xl w-full" style={{ height: 520 }}>
      {/* Photo — 65% of card */}
      <div className="relative" style={{ height: '65%' }}>
        {photoSrc ? (
          <img
            src={photoSrc}
            alt={profile.firstName}
            className="w-full h-full object-cover"
            style={!showPhoto ? { filter: 'blur(12px)', transform: 'scale(1.05)' } : undefined}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-teal-100 via-teal-200 to-teal-400 flex items-center justify-center">
            <span className="text-8xl opacity-60">👤</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        {/* Active badge */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-emerald-500 rounded-full px-3 py-1 shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          <span className="text-white text-xs font-bold tracking-wide">Active</span>
        </div>

        {/* Name + age + city overlaid on photo */}
        <div className="absolute bottom-5 left-5 right-5">
          <h2 className="text-3xl font-bold text-white leading-tight drop-shadow-lg">
            {profile.firstName}, {profile.ageYears}
          </h2>
          {profile.city && (
            <p className="text-white/80 text-sm mt-1 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
              {profile.city}
            </p>
          )}
        </div>

        {/* Private photo overlay */}
        {profile.photoVisibility === 'PRIVATE' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-center">
              <span className="text-5xl">🔒</span>
              <p className="text-white text-sm font-semibold mt-3">Photo private</p>
              <p className="text-white/60 text-xs mt-1">Visible after matching</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom info — 35% */}
      <div className="p-5" style={{ height: '35%' }}>
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {chips.map((c) => (
              <span
                key={c}
                className="bg-teal-50 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full border border-teal-100"
              >
                {c}
              </span>
            ))}
          </div>
        )}
        {profile.bio && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{profile.bio}</p>
        )}
      </div>
    </div>
  );
}
