import { BottomNav } from '@/components/nav/BottomNav';

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[--color-bg]">
      <main className="flex-1 pb-16">{children}</main>
      <BottomNav />
    </div>
  );
}
