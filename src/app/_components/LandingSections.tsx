'use client';

import Link from 'next/link';
import { motion, useInView, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

function RevealText({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div
        initial={{ y: '105%' }}
        animate={inView ? { y: 0 } : {}}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
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
    accent: '#F9F0EE',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-[#2d4a3e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Identity verified',
    body: 'Every member is verified. You always know exactly who you are talking to.',
    accent: '#edf4f1',
  },
  {
    icon: (
      <svg className="w-6 h-6 text-[#C4A070]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: 'Mutual connections only',
    body: 'Nobody can message you unless you both connected first. Privacy is built in, not bolted on.',
    accent: '#F5E6D0',
  },
];

function ParallaxSection({ children, speed = 0.3 }: { children: React.ReactNode; speed?: number }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [60 * speed, -60 * speed]);
  return (
    <motion.div ref={ref} style={{ y }}>
      {children}
    </motion.div>
  );
}

export function LandingSections() {
  return (
    <>
      {/* How it works */}
      <section className="bg-white border-y border-[#E8D5D0]">
        <div className="max-w-7xl mx-auto px-8 py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <FadeUp>
                <p className="text-[10px] font-mono tracking-widest uppercase text-[#A86472] mb-4">Process</p>
              </FadeUp>
              <div className="font-serif font-semibold text-[#1c1b1b] text-4xl md:text-5xl leading-tight">
                <RevealText>Three steps</RevealText>
                <RevealText delay={0.08}>to home.</RevealText>
              </div>
            </div>
            <FadeUp delay={0.2}>
              <Link href="/signup" className="text-sm text-[#A86472] hover:underline font-medium shrink-0">
                Start now →
              </Link>
            </FadeUp>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-[#E8D5D0]">
            {STEPS.map((s, i) => (
              <FadeUp key={s.step} delay={i * 0.12}>
                <div className="bg-white p-10 h-full">
                  <span className="font-mono text-6xl font-bold text-[#A86472]/12 block mb-6 leading-none">{s.step}</span>
                  <h3 className="font-serif font-semibold text-[#1c1b1b] text-xl mb-3">{s.title}</h3>
                  <p className="text-sm text-[#4c4640] leading-relaxed">{s.body}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Why Harmony */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <FadeUp className="text-center mb-16">
          <p className="text-[10px] font-mono tracking-widest uppercase text-[#A86472] mb-4">Why us</p>
          <h2 className="font-serif font-semibold text-[#1c1b1b] text-4xl md:text-5xl">Built different.</h2>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-5">
          {VALUES.map((v, i) => (
            <FadeUp key={v.title} delay={i * 0.13}>
              <motion.div
                whileHover={{ y: -8, boxShadow: '0 20px 48px rgba(168,100,114,0.13)' }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-3xl p-8 border border-[#E8D5D0] h-full cursor-default"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: v.accent }}>
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
        <div className="max-w-7xl mx-auto px-8 py-24">
          <FadeUp className="mb-14">
            <p className="text-[10px] font-mono tracking-widest uppercase text-[#A86472]">Real stories</p>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-8">
            <ParallaxSection speed={0.4}>
              <FadeUp>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#F9F0EE] rounded-3xl p-10 border border-[#E8D5D0]"
                >
                  <p className="font-serif italic text-[#1c1b1b] text-2xl leading-relaxed mb-8">
                    &ldquo;Found my perfect roommate in under a week. Harmony actually gets what matters to me.&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#E8D5D0] flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-[#A86472]">J</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1c1b1b]">Jordan M.</p>
                      <p className="text-xs text-[#7d766f]">Calgary, AB</p>
                    </div>
                  </div>
                </motion.div>
              </FadeUp>
            </ParallaxSection>

            <ParallaxSection speed={0.6}>
              <FadeUp delay={0.15}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#F9F0EE] rounded-3xl p-10 border border-[#E8D5D0] md:mt-10"
                >
                  <p className="font-serif italic text-[#1c1b1b] text-2xl leading-relaxed mb-8">
                    &ldquo;The compatibility matching is unlike anything else. My roommate and I are genuinely great friends now.&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#d4e8df] flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-[#2d4a3e]">P</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1c1b1b]">Priya K.</p>
                      <p className="text-xs text-[#7d766f]">Calgary, AB</p>
                    </div>
                  </div>
                </motion.div>
              </FadeUp>
            </ParallaxSection>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <FadeUp>
          <div className="bg-[#A86472] rounded-3xl px-10 py-24 text-center relative overflow-hidden">
            {/* Animated orbs */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], x: [0, 20, 0], opacity: [0.1, 0.18, 0.1] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-white translate-x-1/3 -translate-y-1/3"
            />
            <motion.div
              animate={{ scale: [1, 1.15, 1], x: [0, -15, 0], opacity: [0.1, 0.16, 0.1] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
              className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white -translate-x-1/3 translate-y-1/3"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.12, 0.06] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-white -translate-y-1/2"
            />

            <div className="relative">
              <FadeUp>
                <p className="text-white/60 text-xs font-mono tracking-widest uppercase mb-5">Calgary, AB</p>
                <div className="font-serif font-semibold text-white leading-tight mb-5" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
                  <RevealText>Ready to find</RevealText>
                  <RevealText delay={0.08}>your person?</RevealText>
                </div>
                <p className="text-white/70 text-lg mb-10 leading-relaxed">
                  Join thousands finding harmony in their homes.
                </p>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center bg-white text-[#A86472] font-semibold px-10 py-4 rounded-full hover:bg-[#F9F0EE] transition-colors text-sm shadow-lg"
                  >
                    Create your free account
                  </Link>
                </motion.div>
              </FadeUp>
            </div>
          </div>
        </FadeUp>
      </section>
    </>
  );
}
