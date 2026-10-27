import { motion } from 'framer-motion';
import { Shield, CheckCircle, Headphones, Star, Quote, Award } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Priya Sharma',
    handle: '@priyasharma_del',
    avatar: 'PS',
    color: 'bg-purple-900/60 text-purple-300 border border-purple-500/40',
    text: 'Booked tickets for Coldplay in under 2 minutes. The interactive live seat layout is incredible — you can actually see the real screen view. Seamless checkout with instant Apple Wallet integration!',
    rating: 5,
    event: 'Coldplay: Music of the Spheres',
  },
  {
    id: 2,
    name: 'Arjun Mehta',
    handle: '@arjunm_bom',
    avatar: 'AM',
    color: 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40',
    text: 'Got IPL Final tickets at Wankhede Stadium. Concurrency locking meant our seats were instantly secured without losing them to bots. The turnstile QR scanner scanned in literally one second.',
    rating: 5,
    event: 'IPL 2026 Final (Wankhede)',
  },
  {
    id: 3,
    name: 'Sneha Rao',
    handle: '@sneha.blr',
    avatar: 'SR',
    color: 'bg-indigo-900/60 text-indigo-300 border border-indigo-500/40',
    text: 'The UI is so clean, dark, and vibrant! Browsing movies like Pushpa 2 and concerts is so delightful. Everything is verified, no hidden service charges, and customer support responds instantly.',
    rating: 5,
    event: 'Pushpa 2: The Rule (IMAX 4K)',
  },
];

const TRUST_BADGES = [
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    desc: '256-bit SSL encryption & instant tokenized payment processing',
  },
  {
    icon: CheckCircle,
    title: '100% Genuine Tickets',
    desc: 'Official barcode verification backed by venue organizers',
  },
  {
    icon: Headphones,
    title: '24/7 VIP Concierge',
    desc: 'Live chat, WhatsApp assistance, and rapid rescheduling',
  },
];

function StarRating({ rating }) {
  return (
    <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700 fill-slate-700'}`}
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-20 relative" aria-label="Customer testimonials and trust indicators">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-16"
        >
          {TRUST_BADGES.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="flex items-start gap-4 bg-[#0D1424]/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/90 hover:border-indigo-500/40 shadow-xl transition-all"
            >
              <div className="w-12 h-12 bg-indigo-600/15 border border-indigo-500/30 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-600/10">
                <Icon className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm mb-1">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/25 rounded-full text-indigo-300 text-xs font-bold mb-3">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            Loved By Over 5 Million Fans
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Trusted by Passionate Event-Goers
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            See why millions of fans across the country choose Eventora for their concert, movie, and sporting moments.
          </p>
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.blockquote
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-[#0D1424]/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/90 hover:border-indigo-500/40 shadow-xl flex flex-col justify-between transition-all"
            >
              <div>
                <Quote className="w-7 h-7 text-indigo-500/40 mb-3" aria-hidden="true" />
                <p className="text-slate-300 text-sm leading-relaxed mb-6 font-normal">"{t.text}"</p>
              </div>

              <div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-xs font-extrabold flex-shrink-0 shadow-md`}>
                      {t.avatar}
                    </div>
                    <div>
                      <cite className="text-sm font-bold text-white not-italic block">{t.name}</cite>
                      <p className="text-xs text-slate-400">{t.handle}</p>
                    </div>
                  </div>
                  <StarRating rating={t.rating} />
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/50 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Verified Attendee</span>
                  <span className="text-indigo-400 font-semibold">{t.event}</span>
                </div>
              </div>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
