import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Menu, X, Ticket, ChevronDown, User, Shield, LogOut, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';

const CITIES = ['Mumbai', 'New Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'];
const NAV_LINKS = ['Movies', 'Concerts', 'Sports', 'Comedy', 'Theatre'];

export default function Header({ searchQuery, setSearchQuery, onCategoryChange, onOpenAuth, onOpenProfile, onOpenAdmin }) {
  const { user, isAdmin, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cityDropdown, setCityDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [userDropdown, setUserDropdown] = useState(false);

  const searchRef = useRef(null);
  const cityRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) setCityDropdown(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchFocused(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (val) => {
    setSearchQuery(val);
    if (val.trim().length > 1) {
      try {
        const results = await apiFetch(`/events?search=${encodeURIComponent(val)}`);
        setSearchResults(results.slice(0, 5));
      } catch (err) {
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/90 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-slate-800/50'
          : 'bg-slate-950/60 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 flex-shrink-0 font-bold text-xl tracking-tight group" aria-label="Eventora home">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <Ticket className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="gradient-text font-extrabold">Eventora</span>
          </a>

          {/* City selector */}
          <div ref={cityRef} className="relative hidden md:block flex-shrink-0">
            <button
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-indigo-400 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-slate-800/60"
              onClick={() => setCityDropdown(!cityDropdown)}
              aria-haspopup="listbox"
              aria-expanded={cityDropdown}
              aria-label="Select city"
            >
              <MapPin className="w-3.5 h-3.5 text-pink-400" />
              <span>{selectedCity}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${cityDropdown ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {cityDropdown && (
                <motion.ul
                  role="listbox"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-1 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl py-1 min-w-[160px] z-50"
                >
                  {CITIES.map(city => (
                    <li key={city}>
                      <button
                        role="option"
                        aria-selected={city === selectedCity}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors ${
                          city === selectedCity ? 'text-indigo-400 font-medium bg-indigo-500/10' : 'text-slate-400'
                        }`}
                        onClick={() => { setSelectedCity(city); setCityDropdown(false); }}
                      >
                        {city}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Search bar */}
          <div ref={searchRef} className="flex-1 relative max-w-xl">
            <div className={`flex items-center rounded-xl px-3 py-2 transition-all duration-200 ${
              searchFocused
                ? 'bg-slate-800/80 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/10'
                : 'bg-slate-800/50 border border-slate-700/30'
            }`}>
              <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <input
                type="search"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search events, movies, concerts…"
                className="ml-2 bg-transparent flex-1 text-sm text-slate-200 placeholder-slate-500 outline-none"
                aria-label="Search events"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  className="ml-2 text-slate-500 hover:text-slate-300"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {/* Search autocomplete */}
            <AnimatePresence>
              {searchFocused && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl py-2 z-50"
                  role="listbox"
                >
                  {searchResults.map(event => (
                    <button
                      key={event.id}
                      className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-indigo-500/10 text-left transition-colors"
                      onClick={() => {
                        setSearchQuery(event.title);
                        setSearchFocused(false);
                      }}
                    >
                      <img
                        src={event.image}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-slate-700/50"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-200">{event.title}</p>
                        <p className="text-xs text-slate-500">{event.category} · ₹{event.priceMin}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Nav links — desktop */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map(link => (
              <button
                key={link}
                onClick={() => onCategoryChange(link)}
                className="px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-all"
              >
              {link}
              </button>
            ))}
          </nav>

          {/* Auth / Profile buttons — desktop */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 border border-purple-500/20"
              >
              <Shield className="w-3.5 h-3.5" /> Admin
              </button>
            )}

            {user ? (
              <div ref={userRef} className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 transition-colors text-sm font-semibold text-slate-200 border border-slate-700/30"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs flex items-center justify-center font-bold">
                    {user.name[0]}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${userDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute right-0 top-full mt-1 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl py-2 w-48 z-50 text-xs font-medium space-y-1"
                    >
                      <button
                        onClick={() => { onOpenProfile(); setUserDropdown(false); }}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-500/10 hover:text-indigo-400 text-slate-300 transition-colors flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-indigo-400" /> My Profile & Tickets
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => { onOpenAdmin(); setUserDropdown(false); }}
                          className="w-full text-left px-4 py-2 hover:bg-purple-500/10 hover:text-purple-400 text-purple-400 transition-colors flex items-center gap-2"
                        >
                          <Shield className="w-4 h-4 text-purple-400" /> Admin Dashboard
                        </button>
                      )}

                      <div className="border-t border-slate-800 pt-1">
                        <button
                          onClick={() => { logout(); setUserDropdown(false); }}
                          className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-red-400 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-800/60 text-slate-400 transition-colors ml-auto"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-slate-800/50 bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-2"
          >
            {user ? (
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl mb-2 border border-slate-700/30">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs flex items-center justify-center font-bold">
                    {user.name[0]}
                  </div>
                  <span className="text-sm font-bold text-slate-200">{user.name}</span>
                </div>
                <button onClick={() => { onOpenProfile(); setMobileMenuOpen(false); }} className="text-xs text-indigo-400 font-semibold">
                  My Tickets
                </button>
              </div>
            ) : (
              <div className="flex gap-2 mb-2">
                <button onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }} className="flex-1 py-2 text-sm font-semibold border border-indigo-500/30 text-indigo-400 rounded-xl hover:bg-indigo-500/10 transition-colors">
                  Sign In
                </button>
                <button onClick={() => { onOpenAuth('signup'); setMobileMenuOpen(false); }} className="flex-1 py-2 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl">
                  Sign Up
                </button>
              </div>
            )}

            {NAV_LINKS.map(link => (
              <button
                key={link}
                onClick={() => { onCategoryChange(link); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg"
              >
              {link}
              </button>
            ))}

            {isAdmin && (
              <button
                onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm font-bold text-purple-400 bg-purple-500/10 rounded-lg border border-purple-500/20"
              >
              Shield Admin Dashboard
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
