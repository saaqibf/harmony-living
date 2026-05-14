'use client';

import Link from 'next/link';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const STEPS = [
  { step: '01', title: 'Tell us who you are', body: 'Lifestyle, schedule, cleanliness, values. The things that actually matter when you share a home.' },
  { step: '02', title: 'Meet your matches', body: 'We surface compatible people every day. Real compatibility, not just proximity and price.' },
  { step: '03', title: 'Move in together', body: 'Chat, meet, decide. No pressure, no algorithms pushing urgency. Just the right fit.' },
];

const VALUES = [
  {
    icon: (
      <svg className="w-6 h-6 text-[#A86472]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    title: 'Values-first matching',
    body: 'We look at lifestyle, sleep schedule, cleanliness, and personal values — not just budget.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-[#2d4a3e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Identity verified',
    body: 'Every member is verified. You always know exactly who you are talking to.',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-[#C4A070]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: 'Mutual connections only',
    body: 'Nobody can message you unless you both connected first. Privacy is built in, not bolted on.',
  },
];

const TESTIMONIALS = [
  {
    quote: 'Found my perfect roommate in under a week. Harmony actually gets what matters to me.',
    name: 'Jordan M.',
    city: 'Calgary, AB',
    color: '#E8D5D0',
  },
  {
    quote: "The compatibility matching is unlike anything else. My roommate and I are genuinely great friends now.",
    name: 'Priya K.',
    city: 'Calgary, AB',
    color: '#d4e8df',
  },
];

export function LandingSections() {
  return (
    <>
      {/* How it works */}
      <section className="bg-white border-y border-[#E8D5D0]">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <FadeUp className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
            <div>
              <p className="text-[10px] font-mono tracking-widest uppercase text-[#A86472] mb-3">Process</p>
              <h2 className="font-serif font-semibold text-[#1c1b1b] text-4xl md:text-5xl leading-tight">
                Three steps<br />to home.
              </h2>
            </div>
            <Link href="/signup" className="text-sm text-[#A86472] hover:underline font-medium shrink-0">
              Start now →
            </Link>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-px bg-[#E8D5D0]">
            {STEPS.map((s, i) => (
              <FadeUp key={s.step} delay={i * 0.1}>
                <div className="bg-white p-10 h-full">
                  <span className="font-mono text-5xl font-bold text-[#A86472]/15 block mb-6 leading-none">{s.step}</span>
                  <h3 className="font-serif font-semibold text-[#1c1b1b] text-xl mb-3">{s.title}</h3>
                  <p className="text-sm text-[#4c4640] leading-relaxed">{s.body}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Why Harmony */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <FadeUp className="text-center mb-14">
          <p className="text-[10px] font-mono tracking-widest uppercase text-[#A86472] mb-3">Why us</p>
          <h2 className="font-serif font-semibold text-[#1c1b1b] text-4xl md:text-5xl">Built different.</h2>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-5">
          {VALUES.map((v, i) => (
            <FadeUp key={v.title} delay={i * 0.12}>
              <motion.div
                whileHover={{ y: -6, boxShadow: '0 12px 32px rgba(168,100,114,0.12)' }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-3xl p-8 border border-[#E8D5D0] h-full"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F9F0EE] flex items-center justify-center mb-6">
                  {v.icon}
                </div>
                <h3 className="font-serif font-semibold text-[#1c1b1b] text-xl mb-3">{v.title}</h3>
                <p className="text-sm text-[#4c4640] leading-relaxed">{v.body}</p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white border-y border-[#E8D5D0]">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <FadeUp>
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#A86472] mb-12">Real stories</p>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.15}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[#F9F0EE] rounded-3xl p-10 border border-[#E8D5D0]"
                >
                  <p className="font-serif italic text-[#1c1b1b] text-2xl leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full" style={{ background: t.color }} />
                    <div>
                      <p className="text-sm font-semibold text-[#1c1b1b]">{t.name}</p>
                      <p className="text-xs text-[#7d766f]">{t.city}</p>
                    </div>
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-8 py-20">
        <FadeUp>
          <motion.div
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.3 }}
            className="bg-[#A86472] rounded-3xl px-10 py-20 text-center relative overflow-hidden"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.08, 0.12, 0.08] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white translate-x-1/3 -translate-y-1/3"
            />
            <motion.div
              animate={{ scale: [1, 1.06, 1], opacity: [0.08, 0.13, 0.08] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white -translate-x-1/3 translate-y-1/3"
            />
            <div className="relative">
              <p className="text-white/60 text-xs font-mono tracking-widest uppercase mb-4">Calgary, AB</p>
              <h2 className="font-serif font-semibold text-white text-4xl md:text-5xl mb-4 leading-tight">
                Ready to find<br />your person?
              </h2>
              <p className="text-white/70 text-base mb-10 leading-relaxed">
                Join thousands finding harmony in their homes.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-white text-[#A86472] font-semibold px-9 py-4 rounded-full hover:bg-[#F9F0EE] transition-colors text-sm"
              >
                Create your free account
              </Link>
            </div>
          </motion.div>
        </FadeUp>
      </section>
    </>
  );
}
