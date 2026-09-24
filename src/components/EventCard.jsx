import { motion } from 'framer-motion';
import { Star, Calendar, MapPin, Clock, Sparkles } from 'lucide-react';

export default function EventCard({ event, onBook, index = 0 }) {
  const catStyle = getCategoryBadgeStyle(event.category);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3), ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group relative bg-[#0D1424]/90 hover:bg-[#111A30]/95 backdrop-blur-xl rounded-2xl border border-slate-800/80 hover:border-indigo-500/50 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
      onClick={() => onBook(event)}
      role="article"
      aria-label={`${event.title} — ${event.category}`}
    >
      {/* Top glowing ambient accent on hover */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover:via-indigo-500/70 transition-all duration-500 z-10" />

      {/* Poster Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-900 flex-shrink-0">
        <img
          src={event.image}
          alt={`Poster for ${event.title}`}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
        />
        {/* Subtle vignette gradient over image */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1424] via-transparent to-black/40 opacity-90 group-hover:opacity-75 transition-opacity" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 z-10">
          <span className={`px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase rounded-full backdrop-blur-md shadow-lg ${catStyle.badge}`}>
            {event.category}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-black/75 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-white text-xs font-bold">{event.rating || 4.8}</span>
        </div>

        {/* Language & Duration pills at bottom of image */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 z-10">
          {event.language && (
            <span className="px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-md font-medium text-slate-200 border border-white/10">
              {event.language}
            </span>
          )}
          {event.duration && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-md font-medium text-slate-200 border border-white/10 ml-auto">
              <Clock className="w-3 h-3 text-indigo-400" />
              {event.duration}
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Title */}
          <h3 className="font-bold text-white text-base sm:text-lg leading-snug mb-1 line-clamp-1 group-hover:text-indigo-300 transition-colors">
            {event.title}
          </h3>
          <p className="text-xs text-slate-400 mb-3.5 line-clamp-1">{event.subtitle}</p>

          {/* Meta Details */}
          <div className="space-y-1.5 mb-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-3 h-3 text-indigo-400" />
              </div>
              <span className="truncate">{event.date} · {event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-3 h-3 text-indigo-400" />
              </div>
              <span className="truncate">{event.venue}, {event.city}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(event.tags || []).slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-slate-800/90 text-slate-300 border border-slate-700/60 text-[11px] font-medium rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing & Booking Action */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mt-auto">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-white">
                ₹{(event.priceMin || 250).toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400">/ seat</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/30 group-hover:shadow-indigo-500/40"
            onClick={(e) => {
              e.stopPropagation();
              onBook(event);
            }}
            aria-label={`Book tickets for ${event.title}`}
          >
            Book Now
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

function getCategoryBadgeStyle(category) {
  const map = {
    Movies: {
      badge: 'bg-purple-600/90 text-white border border-purple-400/40 shadow-purple-500/30',
    },
    Concerts: {
      badge: 'bg-pink-600/90 text-white border border-pink-400/40 shadow-pink-500/30',
    },
    Sports: {
      badge: 'bg-emerald-600/90 text-white border border-emerald-400/40 shadow-emerald-500/30',
    },
    Comedy: {
      badge: 'bg-amber-600/90 text-white border border-amber-400/40 shadow-amber-500/30',
    },
    Theatre: {
      badge: 'bg-cyan-600/90 text-white border border-cyan-400/40 shadow-cyan-500/30',
    },
  };
  return map[category] || {
    badge: 'bg-indigo-600/90 text-white border border-indigo-400/40 shadow-indigo-500/30',
  };
}
