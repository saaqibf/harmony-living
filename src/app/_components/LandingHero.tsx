'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

export function LandingHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const cardsY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative max-w-7xl mx-auto px-8 pt-16 pb-20 md:pt-20 md:pb-24 overflow-visible">
      <div className="grid md:grid-cols-2 gap-12 items-center min-h-[calc(100vh-64px)]">

        {/* Left: copy with parallax */}
        <motion.div style={{ y: heroY, opacity }} className="pt-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-[#A86472] text-xs font-semibold tracking-widest uppercase mb-8"
          >
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-[#A86472]"
            />
            Now live in Calgary, AB
          </motion.div>

          {/* Headline — words reveal one by one */}
          <div className="font-serif font-semibold text-[#1c1b1b] leading-[1.0] mb-8" style={{ fontSize: 'clamp(52px, 6vw, 76px)' }}>
            {['Find your', 'people.', 'Find your'].map((line, li) => (
              <div key={li} className="overflow-hidden">
                <motion.div
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.65, delay: 0.08 + li * 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  {line}
                </motion.div>
              </div>
            ))}
            <div className="overflow-hidden">
              <motion.div
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.65, delay: 0.44, ease: [0.22, 1, 0.36, 1] }}
              >
                <em className="text-[#A86472] not-italic">home.</em>
              </motion.div>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.58, ease: 'easeOut' }}
            className="text-[#4c4640] text-lg leading-relaxed mb-10 max-w-sm"
          >
            Compatibility-based roommate matching for people who actually want to live together.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.68 }}
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-[#A86472] text-white font-semibold px-7 py-3.5 rounded-full hover:bg-[#8A505E] transition-colors text-sm"
              >
                Find your match. It&apos;s free.
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/listings"
                className="inline-flex items-center justify-center text-[#1c1b1b] font-medium px-7 py-3.5 rounded-full border border-[#cfc5bd] hover:bg-white hover:border-[#A86472]/30 transition-colors text-sm"
              >
                Browse rooms
              </Link>
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.82 }}
            className="text-xs text-[#7d766f]"
          >
            Free &middot; Takes 3 minutes &middot; No credit card
          </motion.p>
        </motion.div>

        {/* Right: floating card collage */}
        <motion.div style={{ y: cardsY }} className="hidden md:block relative h-[560px]">

          {/* Main large card — Amara */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, rotate: -4, y: 40 }}
            animate={{ opacity: 1, scale: 1, rotate: -2, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ rotate: -2 }}
            className="absolute left-0 top-8 w-[58%] h-[440px] rounded-3xl overflow-hidden shadow-2xl"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full h-full bg-gradient-to-b from-[#C4909A] via-[#A86472] to-[#6B3D4A] relative flex flex-col justify-end p-6"
            >
              {/* Subtle texture overlay */}
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="relative">
                <p className="text-white font-serif font-semibold text-2xl leading-tight">Amara, 29</p>
                <p className="text-white/75 text-sm mt-0.5">Nurse &middot; NW Calgary</p>
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">Cat lover</span>
                  <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">Early riser</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Sarah card — top right, tilted other way */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, rotate: 6, x: 30, y: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 4, x: 0, y: 0 }}
            transition={{ duration: 0.85, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-0 w-[40%] h-[220px] rounded-3xl overflow-hidden shadow-xl"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="w-full h-full bg-[#2d4a3e] flex flex-col justify-end p-5"
            >
              <p className="text-white font-serif font-semibold text-lg leading-tight">Sarah, 26</p>
              <p className="text-white/65 text-sm mt-0.5">Engineer &middot; Calgary</p>
            </motion.div>
          </motion.div>

          {/* Match card — overlapping bottom-right of main card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-4 bottom-24 w-[42%] z-10"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              whileHover={{ scale: 1.04, rotate: 1 }}
              className="bg-white rounded-2xl p-5 shadow-xl border border-[#E8D5D0] flex flex-col items-center text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="w-10 h-10 rounded-full bg-[#F9F0EE] flex items-center justify-center mb-2"
              >
                <svg className="w-5 h-5 text-[#A86472]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </motion.div>
              <p className="text-sm font-semibold text-[#1c1b1b]">It&apos;s a match!</p>
              <p className="text-xs text-[#A86472] font-mono font-bold mt-0.5">94% compatible</p>
            </motion.div>
          </motion.div>

          {/* Members strip — bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="absolute left-0 bottom-0 w-[56%] bg-white rounded-2xl border border-[#E8D5D0] flex items-center px-5 py-3.5 gap-3 shadow-sm z-20"
          >
            <div className="flex -space-x-2 shrink-0">
              {['#E8D5D0', '#d4e8df', '#F5E6D0', '#EFE0D8'].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white" style={{ background: c }} />
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1c1b1b]">2,000+ Calgary members</p>
              <p className="text-[10px] text-[#7d766f]">Finding harmony, one home at a time</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
