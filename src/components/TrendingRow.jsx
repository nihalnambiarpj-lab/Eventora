import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Calendar, MapPin, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { trendingEvents } from '../data/events';

export default function TrendingRow({ onBook }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 320, behavior: 'smooth' });
  };

  return (
    <section className="py-12 relative overflow-hidden" aria-label="Trending events">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-purple-500/20 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Trending Now
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold uppercase tracking-wider animate-pulse">
                  HOT
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Top-selling events selling fast this week</p>
            </div>
          </div>

          {/* Navigation arrow buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll(-1)}
              className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 rounded-xl text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
              aria-label="Scroll trending events left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 rounded-xl text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
              aria-label="Scroll trending events right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Carousel container */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto no-scrollbar pb-3 pt-1"
          role="list"
          aria-label="Trending events carousel"
        >
          {trendingEvents.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              role="listitem"
              className="flex-shrink-0 w-64 sm:w-72"
            >
              <motion.button
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="w-full text-left bg-[#0D1424]/90 hover:bg-[#111A30] border border-slate-800/90 hover:border-indigo-500/50 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden group flex flex-col cursor-pointer"
                onClick={() => onBook(event)}
                aria-label={`View ${event.title}`}
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-slate-900">
                  <img
                    src={event.image}
                    alt={`${event.title} thumbnail`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1424] via-transparent to-black/40" />

                  {/* Rating */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 bg-black/75 backdrop-blur-md rounded-full border border-white/10">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-white text-xs font-bold">{event.rating || 4.8}</span>
                  </div>

                  {/* Trending Fire Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-0.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[11px] font-extrabold rounded-full shadow-md shadow-rose-500/40 flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-white" /> Trending
                    </span>
                  </div>

                  {/* Category */}
                  <div className="absolute bottom-2 left-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-700/50">
                      {event.category}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-indigo-300 transition-colors mb-2">
                      {event.title}
                    </h3>
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span className="line-clamp-1">{event.city}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500">From</span>
                      <p className="text-sm font-bold text-white">
                        ₹{(event.priceMin || 250).toLocaleString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:from-indigo-500 group-hover:to-purple-500 text-white text-xs font-bold rounded-lg shadow-sm shadow-indigo-600/30 transition-all">
                      Book →
                    </span>
                  </div>
                </div>
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
