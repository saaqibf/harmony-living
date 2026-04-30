import Link from 'next/link';

type Props = {
  matchId: string;
  conversationId: string | null;
  firstName: string;
  photoUrl: string | null;
  city: string | null;
  matchedAt: Date;
};

export function MatchCard({ conversationId, firstName, photoUrl, city, matchedAt }: Props) {
  const timeLabel = new Intl.DateTimeFormat('en-CA', { month: 'short', day: 'numeric' }).format(matchedAt);

  const inner = (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-[--color-border] bg-[--color-surface] hover:shadow-md transition-shadow">
      <div className="w-14 h-14 rounded-full overflow-hidden bg-[--color-muted] shrink-0">
        {photoUrl ? (
          <img src={photoUrl} alt={firstName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[--color-fg]">{firstName}</p>
        {city && <p className="text-sm text-[--color-muted-fg] truncate">{city}</p>}
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-[--color-muted-fg]">{timeLabel}</p>
        {conversationId && (
          <p className="text-xs text-primary-600 font-medium mt-0.5">Message</p>
        )}
      </div>
    </div>
  );

  if (conversationId) {
    return <Link href={`/messages/${conversationId}`}>{inner}</Link>;
  }
  return inner;
}
