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

  const card = (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center gap-3 hover:shadow-md hover:border-teal-100 active:scale-[0.98] transition-all group">
      {/* Circular avatar */}
      <div className="w-20 h-20 rounded-full overflow-hidden bg-teal-50 ring-4 ring-white shadow-md group-hover:ring-teal-50 transition-all shrink-0">
        {photoUrl ? (
          <img src={photoUrl} alt={firstName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
        )}
      </div>

      {/* Name */}
      <div className="text-center">
        <p className="font-bold text-gray-900 text-[15px] leading-tight">{firstName}</p>
        {city && (
          <p className="text-xs text-gray-400 mt-0.5 flex items-center justify-center gap-1">
            <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
            </svg>
            {city}
          </p>
        )}
      </div>

      {/* Matched date pill */}
      <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
        Matched {timeLabel}
      </span>

      {/* CTA button */}
      {conversationId ? (
        <div className="w-full bg-teal-600 text-white text-sm font-semibold py-2.5 rounded-xl text-center group-hover:bg-teal-700 transition-colors">
          Message →
        </div>
      ) : (
        <div className="w-full bg-gray-100 text-gray-400 text-sm font-medium py-2.5 rounded-xl text-center cursor-default">
          No chat yet
        </div>
      )}
    </div>
  );

  if (conversationId) {
    return <Link href={`/messages/${conversationId}`}>{card}</Link>;
  }
  return card;
}
