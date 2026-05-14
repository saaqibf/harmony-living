'use client';

import Link from 'next/link';
import { motion } from 'motion/react';

export function LandingHero() {
  return (
    <section className="max-w-7xl mx-auto px-8 pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="grid md:grid-cols-2 gap-12 items-start">

        {/* Left: copy */}
        <div className="pt-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="inline-flex items-center gap-2 text-[#A86472] text-xs font-semibold tracking-widest uppercase mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#A86472] animate-pulse" />
            Now live in Calgary, AB
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="font-serif font-semibold text-[#1c1b1b] leading-[1.0] mb-8"
            style={{ fontSize: 'clamp(52px, 6vw, 80px)' }}
          >
            Find your<br />
            people.<br />
            Find your<br />
            <em className="text-[#A86472]">home.</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22, ease: 'easeOut' }}
            className="text-[#4c4640] text-lg leading-relaxed mb-10 max-w-sm"
          >
            Compatibility-based roommate matching for people who actually want to live together.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row gap-3 mb-6"
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-[#A86472] text-white font-semibold px-7 py-3.5 rounded-full hover:bg-[#8A505E] transition-colors text-sm"
            >
              Find your match. It&apos;s free.
            </Link>
            <Link
              href="/listings"
              className="inline-flex items-center justify-center text-[#1c1b1b] font-medium px-7 py-3.5 rounded-full border border-[#cfc5bd] hover:bg-white hover:border-[#A86472]/30 transition-colors text-sm"
            >
              Browse rooms
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="text-xs text-[#7d766f]"
          >
            Free &middot; Takes 3 minutes &middot; No credit card
          </motion.p>
        </div>

        {/* Right: animated card collage */}
        <div className="hidden md:flex flex-col gap-3 h-[520px] relative">
          <div className="flex gap-3 flex-1">
            {/* Large hero card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="flex-1 rounded-3xl overflow-hidden relative flex flex-col justify-end p-6 bg-gradient-to-b from-[#C4909A] to-[#8A505E]"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              <div className="relative">
                <p className="text-white font-serif font-semibold text-xl leading-tight">Amara, 29</p>
                <p className="text-white/75 text-sm mt-0.5">Nurse &middot; NW Calgary</p>
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/15">Cat lover</span>
                  <span className="text-xs bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/15">Early riser</span>
                </div>
              </div>
            </motion.div>

            {/* Right column */}
            <div className="w-48 flex flex-col gap-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
                className="flex-1 bg-[#2d4a3e] rounded-3xl flex flex-col justify-end p-5"
              >
                <p className="text-white font-serif font-semibold leading-tight">Sarah, 26</p>
                <p className="text-white/65 text-xs mt-0.5">Engineer &middot; Calgary</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.02 }}
                className="h-36 bg-white rounded-3xl flex flex-col items-center justify-center p-4 border border-[#E8D5D0] shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-[#F9F0EE] flex items-center justify-center mb-2 ring-4 ring-[#F9F0EE]">
                  <svg className="w-5 h-5 text-[#A86472]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-[#1c1b1b] text-center">It&apos;s a match!</p>
                <p className="text-[10px] text-[#A86472] font-mono font-semibold mt-0.5">94% compatible</p>
              </motion.div>
            </div>
          </div>

          {/* Bottom strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55, ease: 'easeOut' }}
            className="h-20 bg-white rounded-3xl border border-[#E8D5D0] flex items-center px-6 gap-4 shadow-sm"
          >
            <div className="flex -space-x-2">
              {['#E8D5D0', '#d4e8df', '#F5E6D0', '#EFE0D8'].map((c, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white" style={{ background: c }} />
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1c1b1b]">2,000+ members in Calgary</p>
              <p className="text-xs text-[#7d766f]">Finding harmony, one home at a time.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
