import Link from 'next/link';

type Props = {
  matchId: string;
  conversationId: string | null;
  firstName: string;
  photoUrl: string | null;
  city: string | null;
  matchedAt: Date;
  ageYears?: number | null;
  occupation?: string | null;
  bio?: string | null;
  faith?: string | null;
};

export function MatchCard({ conversationId, firstName, photoUrl, city, matchedAt, ageYears, occupation, bio, faith }: Props) {
  const timeLabel = new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric' }).format(matchedAt);

  const card = (
    <div className="rounded-2xl overflow-hidden bg-white border border-[#cfc5bd] hover:shadow-md hover:border-[#e8cede] active:scale-[0.98] transition-all group">
      <div className="h-44 bg-[#f1edec] relative overflow-hidden">
        {photoUrl ? (
          <img src={photoUrl} alt={firstName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-30">👤</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-2.5 left-3 right-3">
          <p className="text-white font-semibold text-sm leading-tight drop-shadow">
            {firstName}{ageYears ? `, ${ageYears}` : ''}
          </p>
          {city && (
            <p className="text-white/80 text-[11px] flex items-center gap-1 mt-0.5">
              <svg className="w-2.5 h-2.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
              {city}
            </p>
          )}
        </div>
        <div className="absolute top-2.5 right-2.5">
          <span className="text-[10px] font-semibold text-white bg-[#7B2D5C]/70 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {timeLabel}
          </span>
        </div>
      </div>

      <div className="p-3 flex flex-col gap-2">
        {(occupation || faith) && (
          <div className="flex flex-wrap gap-1.5">
            {occupation && (
              <span className="text-[10px] font-medium text-[#7B2D5C] bg-[#fdf4f9] border border-[#e8cede] px-2 py-0.5 rounded-full truncate max-w-[90px]">
                {occupation}
              </span>
            )}
            {faith && (
              <span className="text-[10px] font-medium text-[#4c4640] bg-[#f1edec] border border-[#cfc5bd] px-2 py-0.5 rounded-full truncate max-w-[90px]">
                {faith}
              </span>
            )}
          </div>
        )}

        {bio && (
          <p className="text-[11px] text-[#7d766f] leading-relaxed line-clamp-2">{bio}</p>
        )}

        {conversationId ? (
          <div className="w-full bg-[#7B2D5C] text-white text-xs font-semibold py-2.5 rounded-xl text-center group-hover:bg-[#5A1F43] transition-colors mt-0.5">
            Message →
          </div>
        ) : (
          <div className="w-full bg-[#f1edec] text-[#7d766f] text-xs font-medium py-2.5 rounded-xl text-center cursor-default mt-0.5">
            No chat yet
          </div>
        )}
      </div>
    </div>
  );

  if (conversationId) {
    return <Link href={`/messages/${conversationId}`}>{card}</Link>;
  }
  return card;
}
