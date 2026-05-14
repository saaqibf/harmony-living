import Link from 'next/link';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';

export default async function SettingsPage() {
  const auth = await requireUser();
  const user = await prisma.user.findUnique({
    where: { cognitoSub: auth.cognitoSub },
    select: { profile: { select: { firstName: true, lastName: true, photoUrl: true } }, emailVerified: true },
  });

  const name = [user?.profile?.firstName, user?.profile?.lastName].filter(Boolean).join(' ') || 'Your Profile';

  return (
    <div className="min-h-screen bg-[#F2E6E0]">
      {/* Hero banner */}
      <div className="relative overflow-hidden bg-[#A86472] px-8 pt-10 pb-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white" />
          <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-white" />
        </div>
        <div className="relative flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-white/25 ring-2 ring-white/40 overflow-hidden flex items-center justify-center shrink-0">
            {user?.profile?.photoUrl ? (
              <img src={user.profile.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-8 h-8 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-white/60 text-xs font-mono tracking-widest uppercase mb-1">Harmony Living</p>
            <h1 className="font-serif text-2xl font-semibold text-white">{name}</h1>
            <p className="text-white/65 text-sm mt-0.5">
              {user?.emailVerified ? 'Verified member' : 'Member'}
            </p>
          </div>
        </div>
      </div>

      {/* Cards pulled up over hero */}
      <div className="max-w-lg mx-auto px-4 -mt-8 pb-20 space-y-3">
        {/* Account section */}
        <div className="bg-white rounded-2xl border border-[#E8D5D0] overflow-hidden shadow-sm">
          <div className="px-5 pt-4 pb-2">
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#A86472]">Account</p>
          </div>

          <SettingsRow
            href="/settings/profile"
            icon={
              <svg className="w-5 h-5 text-[#A86472]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            }
            label="Edit profile"
            description="Name, photo, bio, and preferences"
          />
          <div className="h-px bg-[#F5EAE4] mx-5" />
          <SettingsRow
            href="/settings/verify"
            icon={
              <svg className="w-5 h-5 text-[#2d4a3e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            }
            label="Verification"
            description="ID and identity checks"
            badge={user?.emailVerified ? 'Verified' : 'Pending'}
            badgeColor={user?.emailVerified ? '#2d4a3e' : '#C4A070'}
          />
          <div className="h-px bg-[#F5EAE4] mx-5" />
          <SettingsRow
            href="/settings/preferences"
            icon={
              <svg className="w-5 h-5 text-[#A86472]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            }
            label="Housing preferences"
            description="Budget, lifestyle, roommate rules"
          />
          <div className="h-px bg-[#F5EAE4] mx-5" />
          <SettingsRow
            href="/settings/privacy"
            icon={
              <svg className="w-5 h-5 text-[#A86472]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            }
            label="Privacy"
            description="Photo visibility, discoverability"
          />
        </div>

        {/* Listings section */}
        <div className="bg-white rounded-2xl border border-[#E8D5D0] overflow-hidden shadow-sm">
          <div className="px-5 pt-4 pb-2">
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#7d766f]">Listings</p>
          </div>
          <SettingsRow
            href="/listings/my"
            icon={
              <svg className="w-5 h-5 text-[#C4A070]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
              </svg>
            }
            label="My listings"
            description="Manage your rooms and properties"
          />
          <div className="h-px bg-[#F5EAE4] mx-5" />
          <SettingsRow
            href="/listings/new"
            icon={
              <svg className="w-5 h-5 text-[#C4A070]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            }
            label="Create listing"
            description="List a room or whole property"
          />
        </div>

        {/* Support section */}
        <div className="bg-white rounded-2xl border border-[#E8D5D0] overflow-hidden shadow-sm">
          <div className="px-5 pt-4 pb-2">
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#7d766f]">Support</p>
          </div>
          <SettingsRow
            href="/safety"
            icon={
              <svg className="w-5 h-5 text-[#A86472]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            }
            label="Safety center"
            description="Reporting, blocking, and safety tools"
          />
        </div>
      </div>
    </div>
  );
}

function SettingsRow({
  href,
  icon,
  label,
  description,
  badge,
  badgeColor,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 px-5 py-4 hover:bg-[#FBF5F3] active:scale-[0.99] transition-all group"
    >
      <div className="w-9 h-9 rounded-xl bg-[#F5EAE4] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#1c1b1b] text-sm">{label}</p>
        <p className="text-xs text-[#7d766f] mt-0.5">{description}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge && (
          <span
            className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full"
            style={{ color: badgeColor, backgroundColor: `${badgeColor}18` }}
          >
            {badge}
          </span>
        )}
        <svg className="w-4 h-4 text-[#cfc5bd] group-hover:text-[#A86472] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
