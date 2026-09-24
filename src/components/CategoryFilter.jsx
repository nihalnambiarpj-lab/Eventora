import { motion } from 'framer-motion';
import { CATEGORIES } from '../data/events';
import { Film, Music, Trophy, Laugh, Theater, Sparkles } from 'lucide-react';

const CATEGORY_ICONS = {
  All: Sparkles,
  Movies: Film,
  Concerts: Music,
  Sports: Trophy,
  Comedy: Laugh,
  Theatre: Theater,
};

export default function CategoryFilter({ active, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1" role="tablist" aria-label="Event categories">
      {CATEGORIES.map((cat) => {
        const Icon = CATEGORY_ICONS[cat] || Sparkles;
        const isActive = active === cat;

        return (
          <motion.button
            key={cat}
            role="tab"
            aria-selected={isActive}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(cat)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-600/35 border border-indigo-400/50'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80 hover:border-slate-700 backdrop-blur-md'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
            <span>{cat}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
