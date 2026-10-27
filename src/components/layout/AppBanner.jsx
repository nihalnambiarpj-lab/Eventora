import { motion } from 'framer-motion';
import { Smartphone, Star, Zap, Shield, Sparkles, CheckCircle2, QrCode } from 'lucide-react';

export default function AppBanner() {
  return (
    <section className="py-20 relative overflow-hidden" aria-label="Download the Eventora app">
      {/* Background with glowing radial gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/80 via-[#0B0F1C] to-purple-950/70 border-y border-indigo-500/20" />
      <div className="absolute -top-40 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-full mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Next-Gen Ticketing App
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 leading-tight tracking-tight">
              Your tickets, always in <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                your pocket.
              </span>
            </h2>

            <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-xl leading-relaxed">
              Experience zero-queue entry with dynamic Apple Wallet & Google Pay e-tickets, instant concurrency seat lock, and exclusive discounts for mobile users.
            </p>

            {/* Feature points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: Zap, title: 'Instant QR Entry', desc: 'Scan & walk in under 5s' },
                { icon: Shield, title: 'Concurreny Lock', desc: 'Zero double bookings' },
                { icon: Star, title: 'VIP Perks', desc: 'Exclusive pre-sale access' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-left">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-2.5">
                    <Icon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <h4 className="font-bold text-white text-xs mb-0.5">{title}</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">{desc}</p>
                </div>
              ))}
            </div>

            {/* Store buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <motion.a
                href="#"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-3 px-5 py-3 bg-black/80 hover:bg-black text-white rounded-2xl border border-white/15 transition-all shadow-xl hover:border-indigo-400/40"
                aria-label="Download on App Store"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Download on the</p>
                  <p className="text-sm font-bold leading-tight">App Store</p>
                </div>
              </motion.a>

              <motion.a
                href="#"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-3 px-5 py-3 bg-black/80 hover:bg-black text-white rounded-2xl border border-white/15 transition-all shadow-xl hover:border-indigo-400/40"
                aria-label="Get it on Google Play"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a1.996 1.996 0 01-.61-1.436V3.25c0-.555.226-1.058.609-1.436zm11.233 11.233l2.42 2.42-11.8 6.744 9.38-9.164zm0-2.094L5.462 1.789l11.8 6.744-2.42 2.42zm1.463 1.047l3.864 2.21c1.096.626 1.096 1.65 0 2.276l-3.864 2.21-2.308-2.348 2.308-2.348z"/>
                </svg>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Get it on</p>
                  <p className="text-sm font-bold leading-tight">Google Play</p>
                </div>
              </motion.a>
            </div>
          </motion.div>

          {/* Interactive Phone Mockup Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full max-w-sm lg:max-w-md"
          >
            <div className="relative mx-auto w-72 sm:w-80 bg-slate-900 rounded-[44px] p-3 shadow-2xl shadow-indigo-600/20 border-4 border-slate-700">
              {/* Phone notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-20" />

              {/* Screen */}
              <div className="rounded-[36px] bg-[#0A0E1A] overflow-hidden p-4 pt-10 text-white space-y-4 border border-slate-800">
                {/* Header in phone */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs">
                      E
                    </div>
                    <span className="font-bold text-sm">Eventora Pass</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                    ACTIVE
                  </span>
                </div>

                {/* Ticket card inside phone */}
                <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 rounded-2xl p-4 border border-indigo-500/30 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-300">Live Concert</span>
                      <h4 className="font-bold text-white text-sm">Coldplay: Music of Spheres</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-white bg-indigo-600/80 px-2 py-0.5 rounded">
                      VIP-A14
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>DY Patil Stadium</span>
                    <span>Gate 4 · Bay C</span>
                  </div>

                  {/* Mock QR */}
                  <div className="bg-white p-3 rounded-xl flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-slate-900" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Apple Wallet Enabled</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
