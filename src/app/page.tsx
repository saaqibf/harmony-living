import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const valueProps = [
  {
    title: 'Deep compatibility',
    body: 'We match on lifestyle, schedule, cleanliness, and values — not just price and location.',
  },
  {
    title: 'Verified community',
    body: 'ID checks, profile reviews, and clear reporting so you can trust who you meet.',
  },
  {
    title: 'Inclusive by design',
    body: 'Welcoming to every background, faith, and identity. Preferences respected, not filtered out.',
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-6 py-16 md:py-24">
        <section className="flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium tracking-wide text-primary-700 uppercase">
            Harmony Living
          </span>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Find a home. Find a roommate. Find harmony.
          </h1>

          <p className="max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
            Compatibility-based roommate and room matching.
          </p>

          <div className="mt-4 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/signup"
              className={buttonClasses({
                variant: 'primary',
                size: 'lg',
                className: 'w-full sm:w-auto',
              })}
            >
              Get started
            </Link>
            <Link
              href="/search"
              className={buttonClasses({
                variant: 'secondary',
                size: 'lg',
                className: 'w-full sm:w-auto',
              })}
            >
              Browse rooms
            </Link>
          </div>
        </section>

        <section className="mt-20 grid w-full gap-6 md:mt-28 md:grid-cols-3">
          {valueProps.map((prop) => (
            <Card key={prop.title}>
              <CardHeader>
                <CardTitle>{prop.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed">{prop.body}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t border-slate-200 py-6">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 text-sm text-slate-500">
          <span>© {new Date().getFullYear()} Harmony Living</span>
          <span className="hidden sm:inline">Compatibility in every home.</span>
        </div>
      </footer>
    </div>
  );
}
