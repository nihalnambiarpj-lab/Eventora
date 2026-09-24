import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { featuredEvents } from '../data/events';
import { apiFetch } from '../api/client';

const AUTO_ADVANCE_MS = 5000;

export default function Hero({ onBookNow }) {
  const [heroList, setHeroList] = useState(featuredEvents);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [touchStart, setTouchStart] = useState(null);

  useEffect(() => {
    async function loadFeaturedFromApi() {
      try {
        const apiEvents = await apiFetch('/events');
        if (Array.isArray(apiEvents) && apiEvents.length > 0) {
          const featured = apiEvents.filter(e => e.featured);
          const listToUse = featured.length > 0 ? featured : apiEvents.slice(0, 5);
          const normalized = listToUse.map(e => ({
            ...e,
            showtimes: Array.isArray(e.showtimes) ? e.showtimes : [],
            venue: e.showtimes?.[0]?.venue?.name || 'Grand Venue',
            city: e.showtimes?.[0]?.venue?.city || 'Mumbai',
            date: e.showtimes?.[0]?.startTime
              ? new Date(e.showtimes[0].startTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Tonight',
            time: e.showtimes?.[0]?.startTime
              ? new Date(e.showtimes[0].startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '7:00 PM',
            tags: typeof e.tags === 'string' ? JSON.parse(e.tags || '[]') : (e.tags || ['Featured']),
            seats: {
              available: Math.floor(Math.random() * 100) + 120,
              total: 350,
            },
          }));
          setHeroList(normalized);
        }
      } catch {
        // Fallback to static featuredEvents
      }
    }
    loadFeaturedFromApi();
  }, []);

  const total = heroList.length;

  const go = useCallback((idx, dir) => {
    setDirection(dir);
    setCurrent((idx + total) % total);
  }, [total]);

  const next = useCallback(() => go(current + 1, 1), [current, go]);
  const prev = useCallback(() => go(current - 1, -1), [current, go]);

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(next, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [next, total]);

  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
    setTouchStart(null);
  };

  const event = heroList[current] || heroList[0] || featuredEvents[0];

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <section
      className="relative h-[520px] sm:h-[600px] lg:h-[680px] overflow-hidden bg-gray-900"
      aria-label="Featured events carousel"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background image */}
      <AnimatePresence custom={direction} mode="sync">
        <motion.div
          key={`bg-${current}-${event?.id || current}`}
          custom={direction}
          variants={{
            enter: (dir) => ({ opacity: 0, scale: 1.04 }),
            center: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.98 },
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="absolute inset-0"
          aria-hidden="true"
        >
          <img
            src={event.image}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={`content-${current}-${event?.id || current}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-2xl"
          >
            {/* Category badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-full tracking-wider uppercase shadow-lg shadow-indigo-600/30 border border-indigo-400/40">
                {event.category}
              </span>
              {(event.tags || []).slice(0, 2).map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-full backdrop-blur-md border border-white/15">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-2 tracking-tight">
              {event.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 mb-5 leading-relaxed max-w-xl">
              {event.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-8 text-slate-300 text-sm">
              <span className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>{event.date} · {event.time}</span>
              </span>
              <span className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>{event.venue}, {event.city}</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onBookNow(event)}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl text-base transition-all shadow-xl shadow-indigo-600/40 cursor-pointer"
                aria-label={`Book tickets for ${event.title}`}
              >
                Book Now · From ₹{(event.priceMin || 250).toLocaleString()}
              </motion.button>
              <span className="text-xs sm:text-sm font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                ⚡ {(event.seats?.available || 184).toLocaleString()} seats left
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation arrows */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-colors"
        onClick={prev}
        aria-label="Previous event"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-colors"
        onClick={next}
        aria-label="Next event"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2" role="tablist" aria-label="Carousel slides">
        {heroList.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === current}
            aria-label={`Slide ${i + 1}`}
            onClick={() => go(i, i > current ? 1 : -1)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? 'w-6 h-2 bg-indigo-500'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
