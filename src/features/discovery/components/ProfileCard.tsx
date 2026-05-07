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
  const photoSrc = showPhoto
    ? profile.photoUrl
    : profile.photoVisibility === 'HIDDEN'
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
    <div className="rounded-3xl overflow-hidden bg-white shadow-2xl w-full select-none" style={{ height: 520 }}>
      {/* Photo — top 65% */}
      <div className="relative" style={{ height: '65%' }}>
        {photoSrc ? (
          <img
            src={photoSrc}
            alt={profile.firstName}
            className="w-full h-full object-cover"
            style={!showPhoto ? { filter: 'blur(12px)', transform: 'scale(1.05)' } : undefined}
          />
        ) : (
          <div className="w-full h-full bg-[#f1edec] flex items-center justify-center">
            <span className="text-8xl opacity-40">👤</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-[#2d4a3e] rounded-full px-3 py-1 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          <span className="text-white text-xs font-bold tracking-wide">Active</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-10">
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {chips.map((c) => (
                <span
                  key={c}
                  className="bg-white/20 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/30"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
          <h2 className="text-[28px] font-serif font-semibold text-white leading-tight drop-shadow-lg">
            {profile.firstName}, {profile.ageYears}
          </h2>
          {profile.city && (
            <p className="text-white/75 text-sm mt-1 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
              {profile.city}
            </p>
          )}
        </div>

        {profile.photoVisibility === 'HIDDEN' && (
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
      <div className="px-5 py-4 flex flex-col justify-center" style={{ height: '35%' }}>
        {profile.bio ? (
          <p className="text-sm text-[#4c4640] leading-relaxed line-clamp-3">{profile.bio}</p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="h-3 bg-[#f1edec] rounded-full w-4/5" />
            <div className="h-3 bg-[#f1edec] rounded-full w-3/5" />
          </div>
        )}
      </div>
    </div>
  );
}
