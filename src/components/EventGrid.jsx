import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import EventCard from './EventCard';
import CategoryFilter from './CategoryFilter';
import SkeletonCard from './SkeletonCard';
import { apiFetch } from '../api/client';
import { events as mockEvents } from '../data/events';
import { Sparkles, Compass } from 'lucide-react';

export default function EventGrid({ activeCategory, setActiveCategory, searchQuery, onBook }) {
  const [loading, setLoading] = useState(true);
  const [visibleEvents, setVisibleEvents] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      try {
        let endpoint = '/events';
        const params = new URLSearchParams();
        if (activeCategory && activeCategory !== 'All') params.append('category', activeCategory);
        if (searchQuery && searchQuery.trim()) params.append('search', searchQuery.trim());

        if (params.toString()) endpoint += `?${params.toString()}`;

        const apiEvents = await apiFetch(endpoint);
        if (Array.isArray(apiEvents) && apiEvents.length > 0) {
          const normalized = apiEvents.map(e => ({
            ...e,
            showtimes: Array.isArray(e.showtimes) ? e.showtimes : [],
            venue: e.showtimes?.[0]?.venue?.name || 'Grand Venue',
            city: e.showtimes?.[0]?.venue?.city || 'Mumbai',
            date: e.showtimes?.[0]?.startTime
              ? new Date(e.showtimes[0].startTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Coming Soon',
            time: e.showtimes?.[0]?.startTime
              ? new Date(e.showtimes[0].startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'TBA',
            tags: typeof e.tags === 'string' ? JSON.parse(e.tags || '[]') : (e.tags || ['Popular']),
          }));
          setVisibleEvents(normalized);
        } else {
          filterFallbackMockData();
        }
      } catch (err) {
        console.warn('API fetch failed, fallback to mock events:', err);
        filterFallbackMockData();
      } finally {
        setLoading(false);
      }
    }

    function filterFallbackMockData() {
      let filtered = mockEvents;
      if (activeCategory && activeCategory !== 'All') {
        filtered = filtered.filter(e => e.category === activeCategory);
      }
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(e =>
          e.title.toLowerCase().includes(q) ||
          (e.venue && e.venue.toLowerCase().includes(q)) ||
          (e.city && e.city.toLowerCase().includes(q)) ||
          (e.category && e.category.toLowerCase().includes(q)) ||
          (e.tags && e.tags.some(t => t.toLowerCase().includes(q)))
        );
      }
      setVisibleEvents(filtered);
    }

    loadEvents();
    setShowAll(false);
  }, [activeCategory, searchQuery]);

  const displayedEvents = showAll ? visibleEvents : visibleEvents.slice(0, 8);

  return (
    <section aria-label="Event listings" className="py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Discover Experiences</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {searchQuery ? `Search Results for "${searchQuery}"` : activeCategory === 'All' ? 'All Live Events' : `${activeCategory} Events`}
            </h2>
            {!loading && (
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Showing <span className="text-indigo-400 font-semibold">{visibleEvents.length}</span> curated premier experiences
              </p>
            )}
          </div>

          {/* Category filter */}
          <div className="hidden sm:block">
            <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
          </div>
        </motion.div>

        {/* Mobile category filter */}
        <div className="sm:hidden mb-6">
          <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : visibleEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800/80 p-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 text-3xl">
              🎭
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-5">
              We couldn't find any events matching your current filter. Try browsing other categories or clear search.
            </p>
            <button
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
              onClick={() => setActiveCategory('All')}
            >
              View all events
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedEvents.map((event, i) => (
                <EventCard key={event.id} event={event} onBook={onBook} index={i} />
              ))}
            </div>

            {/* Load more */}
            {!showAll && visibleEvents.length > 8 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-12 text-center"
              >
                <button
                  onClick={() => setShowAll(true)}
                  className="px-8 py-3.5 bg-slate-900/90 hover:bg-slate-800 text-white font-bold rounded-2xl border border-slate-700/80 hover:border-indigo-500/60 shadow-xl hover:shadow-indigo-500/20 transition-all duration-300 text-sm cursor-pointer"
                >
                  Explore More Events ({visibleEvents.length - 8} more)
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
