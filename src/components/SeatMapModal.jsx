import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Lock,
  Sparkles,
  RefreshCw,
  Film,
  Calendar,
  Info,
  Smartphone,
  Building,
  Check,
  Download,
  AlertCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function SeatMapModal({ event, initialShowtimeId, onClose, onRequireAuth }) {
  const { user, login } = useAuth();
  const { addToast } = useToast();

  // Active event & showtime state
  const [activeEvent, setActiveEvent] = useState(event);
  const [showtimesList, setShowtimesList] = useState(
    Array.isArray(event?.showtimes) && event.showtimes.length > 0 && event.showtimes[0]?.id
      ? event.showtimes
      : []
  );
  const [showtimeId, setShowtimeId] = useState(
    initialShowtimeId || (event?.showtimes?.[0]?.id ? event.showtimes[0].id : null)
  );

  const [loadingSeats, setLoadingSeats] = useState(true);
  const [seatData, setSeatData] = useState(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [step, setStep] = useState(0); // 0 = Date & Time, 1 = Seat Map, 2 = Payment, 3 = Confirmed
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // 'YYYY-MM-DD' string
  const [bookingResult, setBookingResult] = useState(null);

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('882');
  const [upiId, setUpiId] = useState(user?.email ? `${user.email.split('@')[0]}@okaxis` : '');
  const [billingName, setBillingName] = useState(user?.name || '');

  useEffect(() => {
    if (user) {
      if (!billingName) setBillingName(user.name || '');
      if (!upiId) setUpiId(user.email ? `${user.email.split('@')[0]}@okaxis` : '');
    }
  }, [user]);

  // Step 1: Ensure we have a valid showtimeId from API if not readily available
  useEffect(() => {
    async function resolveShowtimes() {
      if (showtimesList.length > 0 && showtimeId) return;

      try {
        let matched = null;
        // Try searching events catalog for matching title
        const searchRes = await apiFetch(`/events?search=${encodeURIComponent(event.title || '')}`);
        if (Array.isArray(searchRes) && searchRes.length > 0) {
          matched = searchRes[0];
        } else {
          const allRes = await apiFetch('/events');
          if (Array.isArray(allRes) && allRes.length > 0) {
            matched = allRes.find(e => e.title?.toLowerCase() === event.title?.toLowerCase()) || allRes[0];
          }
        }

        if (matched && Array.isArray(matched.showtimes) && matched.showtimes.length > 0) {
          setActiveEvent(prev => ({ ...prev, ...matched }));
          setShowtimesList(matched.showtimes);
          setShowtimeId(prev => prev || matched.showtimes[0].id);
        }
      } catch (err) {
        console.warn('Could not auto-resolve showtimes:', err);
      }
    }

    resolveShowtimes();
  }, [event.title, showtimeId, showtimesList.length]);

  // Step 2: Fetch live seat map & polling
  const fetchSeatMap = useCallback(async (isPoll = false) => {
    if (!showtimeId) return;
    try {
      if (!isPoll) setLoadingSeats(true);
      const data = await apiFetch(`/showtimes/${showtimeId}/seats`);
      setSeatData(data);
    } catch (err) {
      console.error('Fetch seats error:', err);
      if (!isPoll) addToast('Failed to load venue seat layout.', 'error');
    } finally {
      if (!isPoll) setLoadingSeats(false);
    }
  }, [showtimeId, addToast]);

  useEffect(() => {
    if (showtimeId) {
      fetchSeatMap(false);
      // Poll every 4 seconds for live concurrency updates
      const interval = setInterval(() => fetchSeatMap(true), 4000);
      return () => clearInterval(interval);
    }
  }, [showtimeId, fetchSeatMap]);

  // Handle seat selection toggle
  const toggleSeat = (seatId) => {
    if (seatData?.bookedSeatIds?.includes(seatId)) return;

    if (selectedSeatIds.includes(seatId)) {
      setSelectedSeatIds(prev => prev.filter(id => id !== seatId));
    } else {
      if (selectedSeatIds.length >= 10) {
        addToast('Maximum 10 seats allowed per booking.', 'info');
        return;
      }
      setSelectedSeatIds(prev => [...prev, seatId]);
    }
  };

  // Compute pricing
  const basePrice = seatData?.priceBase || activeEvent?.priceMin || 250;
  const selectedSeats = useMemo(() => {
    return seatData?.seats?.filter(s => selectedSeatIds.includes(s.id)) || [];
  }, [seatData?.seats, selectedSeatIds]);

  const subtotal = selectedSeats.reduce(
    (acc, s) => acc + Math.round(basePrice * (s.priceMultiplier || 1)),
    0
  );
  const convenienceFee = selectedSeats.length > 0 ? Math.round(subtotal * 0.05) : 0;
  const totalAmount = subtotal + convenienceFee;

  // Handle Checkout submission
  const handleConfirmBooking = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }

    if (selectedSeatIds.length === 0) {
      addToast('Please select at least one seat.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiFetch('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          showtimeId,
          seatIds: selectedSeatIds,
          paymentMethod,
        }),
      });

      setBookingResult(res);
      setStep(3);
      addToast('🎉 Booking confirmed successfully!', 'success');
    } catch (err) {
      console.error('Booking submission error:', err);
      if (err.status === 409) {
        addToast('⚠️ Seats no longer available! A seat was just booked by another user. Refreshing grid…', 'error');
        setSelectedSeatIds([]);
        fetchSeatMap(false);
        setStep(1);
      } else {
        addToast(err.message || 'Payment processing failed.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Organize seats into rows & tier sections for authentic multiplex display
  const { tiers, seatsByRow, rowKeys } = useMemo(() => {
    if (!seatData?.seats) return { tiers: [], seatsByRow: {}, rowKeys: [] };

    const grouped = {};
    const tierMap = {};

    seatData.seats.forEach(s => {
      if (!grouped[s.rowLabel]) grouped[s.rowLabel] = [];
      grouped[s.rowLabel].push(s);

      if (!tierMap[s.tier]) {
        tierMap[s.tier] = {
          tier: s.tier,
          multiplier: s.priceMultiplier,
          price: Math.round(basePrice * s.priceMultiplier),
          rows: new Set(),
        };
      }
      tierMap[s.tier].rows.add(s.rowLabel);
    });

    // Row order: Back to Front (J, I, H, G, F, E, D, C, B, A) as in Indian multiplexes (Recliner on top/back)
    const sortedRowKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    const tierOrder = ['RECLINER', 'PREMIUM', 'GOLD', 'SILVER'];
    const sortedTiers = Object.values(tierMap).sort((a, b) => {
      const idxA = tierOrder.indexOf(a.tier);
      const idxB = tierOrder.indexOf(b.tier);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    return { tiers: sortedTiers, seatsByRow: grouped, rowKeys: sortedRowKeys };
  }, [seatData?.seats, basePrice]);

  // Screen aisle gaps default
  const aisleGaps = seatData?.screen?.aisleGaps || [4, 10];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-3 md:p-6 overflow-y-auto"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        role="dialog"
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.98 }}
          className="bg-[#0B0F17] text-white w-full sm:max-w-5xl rounded-t-3xl sm:rounded-3xl max-h-[94vh] flex flex-col overflow-hidden shadow-2xl border border-slate-800"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#101726] px-5 py-4 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700 hidden xs:block shadow-md">
                <img
                  src={activeEvent.image}
                  alt={activeEvent.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 text-[10px] font-bold rounded-md uppercase tracking-wider">
                    {activeEvent.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" /> {activeEvent.duration || '2h 15m'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {activeEvent.language || 'English'}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white mt-0.5 line-clamp-1">
                  {activeEvent.title}
                </h2>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span>{seatData?.venue?.name || activeEvent.venue || 'PVR IMAX Grand'}</span>
                  <span className="text-slate-600">•</span>
                  <span>{seatData?.screen?.name || 'Audi 1 (IMAX 4K Laser)'}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator — 4 steps */}
          <div className="bg-[#0e1420] border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between text-xs font-semibold flex-shrink-0">
            {[
              { n: 0, label: 'Date & Time' },
              { n: 1, label: 'Select Seats' },
              { n: 2, label: 'Payment' },
              { n: 3, label: 'Confirmed', emerald: true },
            ].map(({ n, label, emerald }, idx) => (
              <>
                <div key={n} className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step === n && emerald ? 'bg-emerald-600 text-white'
                    : step > n ? 'bg-indigo-600 text-white'
                    : step === n ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                  }`}>{step > n ? '✓' : n + 1}</span>
                  <span className={`hidden sm:inline ${
                    step === n && emerald ? 'text-emerald-400'
                    : step >= n ? 'text-indigo-400'
                    : 'text-slate-500'
                  }`}>{label}</span>
                </div>
                {idx < 3 && <div className={`flex-1 h-0.5 mx-1 ${step > n ? 'bg-indigo-600' : 'bg-slate-800'}`} />}
              </>
            ))}
          </div>

          {/* Body content based on step */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-[#0B0F17]">

            {/* ─── Step 0: Date & Time Picker ─── */}
            {step === 0 && (() => {
              // Group showtimes by date
              const dateMap = {};
              showtimesList.forEach(st => {
                const d = new Date(st.startTime);
                const key = isNaN(d.getTime()) ? 'today' : d.toISOString().split('T')[0];
                if (!dateMap[key]) dateMap[key] = [];
                dateMap[key].push(st);
              });
              const dateKeys = Object.keys(dateMap).sort();
              const selectedDateKey = selectedDate || dateKeys[0] || null;
              const timesForDate = selectedDateKey ? (dateMap[selectedDateKey] || []) : [];

              return (
                <div className="max-w-2xl mx-auto space-y-6 py-2">
                  {/* Decorative header */}
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                      <Calendar className="w-3.5 h-3.5" /> Choose your Date & Time
                    </div>
                    <p className="text-slate-400 text-xs mt-2">Select a date first, then pick your preferred showtime</p>
                  </div>

                  {showtimesList.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-700 rounded-2xl">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      No showtimes available for this event yet.
                    </div>
                  ) : (
                    <>
                      {/* ── Date selector ── */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">1 — Pick a Date</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {dateKeys.map(dk => {
                            const d = new Date(dk);
                            const isValid = !isNaN(d.getTime());
                            const isSelected = selectedDateKey === dk;
                            const dayName = isValid ? d.toLocaleDateString('en-IN', { weekday: 'short' }) : 'Today';
                            const dayNum = isValid ? d.getDate() : new Date().getDate();
                            const monthName = isValid ? d.toLocaleDateString('en-IN', { month: 'short' }) : 'Now';
                            const isToday = isValid && d.toDateString() === new Date().toDateString();
                            const slotCount = dateMap[dk].length;

                            return (
                              <button
                                key={dk}
                                type="button"
                                onClick={() => {
                                  setSelectedDate(dk);
                                  // Auto-select first showtime on this date
                                  const firstSt = dateMap[dk][0];
                                  if (firstSt?.id) {
                                    setShowtimeId(firstSt.id);
                                    setSelectedSeatIds([]);
                                  }
                                }}
                                className={`relative p-3 rounded-2xl border-2 text-center transition-all ${
                                  isSelected
                                    ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20'
                                    : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800'
                                }`}
                              >
                                {isToday && (
                                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[9px] font-bold bg-indigo-600 text-white rounded-full whitespace-nowrap">
                                    TODAY
                                  </span>
                                )}
                                <p className={`text-[10px] font-semibold uppercase tracking-wide ${
                                  isSelected ? 'text-indigo-300' : 'text-slate-500'
                                }`}>{dayName}</p>
                                <p className={`text-2xl font-extrabold leading-tight ${
                                  isSelected ? 'text-white' : 'text-slate-200'
                                }`}>{dayNum}</p>
                                <p className={`text-[10px] font-medium ${
                                  isSelected ? 'text-indigo-300' : 'text-slate-500'
                                }`}>{monthName}</p>
                                <p className={`text-[10px] mt-1 font-semibold ${
                                  isSelected ? 'text-indigo-400' : 'text-slate-600'
                                }`}>{slotCount} slot{slotCount !== 1 ? 's' : ''}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* ── Time slot selector ── */}
                      {selectedDateKey && (
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">2 — Pick a Time</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {timesForDate.map(st => {
                              const d = new Date(st.startTime);
                              const isValid = !isNaN(d.getTime());
                              const timeStr = isValid
                                ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                                : (typeof st.startTime === 'string' ? st.startTime : '7:00 PM');
                              const isPast = isValid && d < new Date();
                              const isSelected = showtimeId === st.id;

                              return (
                                <button
                                  key={st.id}
                                  type="button"
                                  disabled={isPast}
                                  onClick={() => {
                                    setShowtimeId(st.id);
                                    setSelectedSeatIds([]);
                                  }}
                                  className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                                    isPast
                                      ? 'opacity-40 cursor-not-allowed bg-slate-900 border-slate-800'
                                      : isSelected
                                      ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20'
                                      : 'bg-slate-800/60 border-slate-700/60 hover:border-indigo-500/50 hover:bg-slate-800'
                                  }`}
                                >
                                  {isSelected && (
                                    <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                                      <Info className="w-2.5 h-2.5 text-white" />
                                    </span>
                                  )}
                                  <p className={`text-base font-extrabold ${
                                    isSelected ? 'text-indigo-300' : 'text-white'
                                  }`}>{timeStr}</p>
                                  {st.venue?.name && (
                                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                                      <span className="truncate">{st.venue.name}</span>
                                    </p>
                                  )}
                                  {st.priceBase && (
                                    <p className="text-[11px] text-emerald-400 font-bold mt-1">from ₹{st.priceBase}</p>
                                  )}
                                  {isPast && <p className="text-[10px] text-red-400 mt-1">Show ended</p>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* CTA */}
                      <button
                        type="button"
                        disabled={!showtimeId}
                        onClick={() => setStep(1)}
                        className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                      >
                        <Clock className="w-4 h-4" />
                        Continue to Seat Selection
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              );
            })()}

            {step === 1 && (
              <div className="space-y-4">
                {/* Compact selected showtime reminder pill */}
                {showtimeId && showtimesList.length > 0 && (() => {
                  const st = showtimesList.find(s => s.id === showtimeId);
                  if (!st) return null;
                  const d = new Date(st.startTime);
                  const isValid = !isNaN(d.getTime());
                  const timeStr = isValid
                    ? d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
                    : '';
                  const dayStr = isValid
                    ? d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
                    : 'Selected';
                  return (
                    <div className="bg-[#121927] px-4 py-2.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-xs text-slate-300 font-medium">{dayStr} · <span className="text-indigo-300 font-bold">{timeStr}</span></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(0)}
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
                      >
                        Change
                      </button>
                    </div>
                  );
                })()}

                {/* Real Multiplex Tier Legend */}
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs font-medium bg-[#111726] py-2.5 px-4 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-700 text-slate-500 flex items-center justify-center text-[8px]">✕</div>
                    <span className="text-slate-400">Sold</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-indigo-600 ring-2 ring-indigo-400 animate-pulse" />
                    <span className="text-white font-bold">Selected</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-amber-500/20 border border-amber-500/70" />
                    <span className="text-amber-300">Recliner (₹{Math.round(basePrice * 2.5)})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-purple-500/20 border border-purple-500/70" />
                    <span className="text-purple-300">Prime (₹{Math.round(basePrice * 1.8)})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-teal-500/20 border border-teal-500/70" />
                    <span className="text-teal-300">Executive (₹{Math.round(basePrice * 1.4)})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-sky-500/20 border border-sky-500/70" />
                    <span className="text-sky-300">Classic (₹{basePrice})</span>
                  </div>
                </div>

                {/* Cinema Screen Projection Curved Header */}
                <div className="relative pt-2 pb-5 text-center select-none overflow-hidden">
                  <div className="w-4/5 sm:w-2/3 mx-auto relative">
                    {/* Screen ambient light cone */}
                    <div className="h-10 bg-gradient-to-b from-cyan-500/25 via-indigo-500/10 to-transparent blur-sm rounded-t-full" />
                    {/* Curved screen line */}
                    <div className="w-full h-3.5 border-t-4 border-cyan-400 rounded-[100%] shadow-[0_-6px_20px_rgba(34,211,238,0.6)]" />
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <Film className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-[0.25em]">
                      {seatData?.venue?.screenType === 'STAGE_CONCERT' ? 'CONCERT STAGE THIS WAY' : 'ALL EYES THIS WAY • CINEMA SCREEN'}
                    </span>
                  </div>
                </div>

                {/* Seating Grid / Layout */}
                {loadingSeats ? (
                  <div className="py-20 text-center">
                    <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-300">Loading live cinema seat layout…</p>
                    <p className="text-xs text-slate-500 mt-1">Checking real-time seat availability</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto pb-6">
                    <div className="min-w-[580px] sm:min-w-[660px] mx-auto flex flex-col items-center gap-3">
                      {tiers.map(tierInfo => {
                        const tierRowKeys = rowKeys.filter(rk => tierInfo.rows.has(rk));
                        if (tierRowKeys.length === 0) return null;

                        return (
                          <div key={tierInfo.tier} className="w-full flex flex-col items-center gap-2 mb-2">
                            {/* Tier Zone Divider Header */}
                            <div className="w-full flex items-center justify-center gap-3 my-1">
                              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-slate-700/50" />
                              <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full border ${getTierBadgeStyle(tierInfo.tier)}`}>
                                {tierInfo.tier} · ₹{tierInfo.price}
                              </span>
                              <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-slate-700 to-slate-700/50" />
                            </div>

                            {/* Rows belonging to this tier */}
                            {tierRowKeys.map(rowLabel => {
                              const rowSeats = (seatsByRow[rowLabel] || []).sort((a, b) => a.seatNumber - b.seatNumber);

                              return (
                                <div key={rowLabel} className="flex items-center gap-2 sm:gap-3">
                                  {/* Left Row Label */}
                                  <span className="w-5 text-xs font-bold text-slate-400 text-center">
                                    {rowLabel}
                                  </span>

                                  {/* Seats in Row */}
                                  <div className="flex items-center gap-1 sm:gap-1.5">
                                    {rowSeats.map(seat => {
                                      const isBooked = seatData?.bookedSeatIds?.includes(seat.id);
                                      const isSelected = selectedSeatIds.includes(seat.id);
                                      const seatPrice = Math.round(basePrice * (seat.priceMultiplier || 1));

                                      return (
                                        <div key={seat.id} className="flex items-center">
                                          <motion.button
                                            whileHover={!isBooked ? { scale: 1.15 } : {}}
                                            whileTap={!isBooked ? { scale: 0.92 } : {}}
                                            transition={{ duration: 0.12 }}
                                            onClick={() => toggleSeat(seat.id)}
                                            onMouseEnter={() => setHoveredSeat({ ...seat, price: seatPrice })}
                                            onMouseLeave={() => setHoveredSeat(null)}
                                            disabled={isBooked}
                                            aria-label={`Seat ${seat.rowLabel}-${seat.seatNumber}, ${seat.tier}, ₹${seatPrice}`}
                                            className={`relative rounded-md text-[10px] font-bold flex flex-col items-center justify-center transition-all ${
                                              seat.tier === 'RECLINER'
                                                ? 'w-7 h-7 sm:w-8 sm:h-8 rounded-lg'
                                                : 'w-6 h-6 sm:w-7 sm:h-7'
                                            } ${
                                              isBooked
                                                ? 'bg-slate-800 text-slate-600 border border-slate-700/50 cursor-not-allowed'
                                                : isSelected
                                                ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-1 ring-offset-[#0B0F17] shadow-lg shadow-indigo-500/50 font-extrabold'
                                                : getTierSeatStyle(seat.tier)
                                            }`}
                                          >
                                            {isBooked ? (
                                              <span className="text-[8px]">✕</span>
                                            ) : isSelected ? (
                                              <Check className="w-3 h-3 stroke-[3]" />
                                            ) : (
                                              <span>{seat.seatNumber}</span>
                                            )}
                                          </motion.button>

                                          {/* Render Aisle Gangways */}
                                          {aisleGaps.includes(seat.seatNumber) && (
                                            <div className="w-4 sm:w-6 text-center select-none">
                                              <span className="text-[7px] text-slate-600 font-mono tracking-tighter">|</span>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Right Row Label */}
                                  <span className="w-5 text-xs font-bold text-slate-400 text-center">
                                    {rowLabel}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Hover Seat Info Pill */}
                {hoveredSeat && (
                  <div className="text-center text-xs text-slate-300 bg-slate-800/80 py-1.5 px-4 rounded-xl max-w-xs mx-auto border border-slate-700">
                    <span className="font-bold text-white">Seat {hoveredSeat.rowLabel}-{hoveredSeat.seatNumber}</span> ·{' '}
                    <span className="text-indigo-400 font-semibold">{hoveredSeat.tier}</span> ·{' '}
                    <span className="text-emerald-400 font-bold">₹{hoveredSeat.price}</span>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Payment Details Checkout */}
            {step === 2 && (
              <div className="max-w-lg mx-auto bg-[#111726] p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-400" /> Payment & Ticket Confirmation
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">Step 2 of 3</span>
                </div>

                {/* Order Summary Card */}
                <div className="bg-[#161f33] p-4 rounded-2xl text-xs space-y-2.5 border border-slate-700/70">
                  <div className="flex items-center gap-3 pb-2 border-b border-slate-700/60">
                    <img
                      src={activeEvent.image}
                      alt={activeEvent.title}
                      className="w-12 h-16 rounded-lg object-cover border border-slate-600 flex-shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm line-clamp-1">{activeEvent.title}</h4>
                      <p className="text-[11px] text-slate-400">{seatData?.venue?.name || activeEvent.venue}</p>
                      <p className="text-[11px] text-indigo-400 font-medium">{seatData?.screen?.name}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-400">Selected Seats ({selectedSeats.length})</span>
                    <span className="font-bold text-white flex flex-wrap gap-1 justify-end">
                      {selectedSeats.map(s => (
                        <span key={s.id} className="px-1.5 py-0.5 bg-indigo-900/60 border border-indigo-700 rounded text-[11px]">
                          {s.rowLabel}-{s.seatNumber}
                        </span>
                      ))}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Base Ticket Amount</span>
                    <span className="text-white font-medium">₹{subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Convenience Fee (5%)</span>
                    <span className="text-white font-medium">₹{convenienceFee.toLocaleString()}</span>
                  </div>

                  <div className="border-t border-slate-700/80 pt-2.5 flex justify-between text-sm">
                    <span className="font-bold text-white">Total Payable</span>
                    <span className="font-bold text-emerald-400 text-base">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">Select Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'CARD', label: 'Credit/Debit Card', icon: CreditCard },
                      { id: 'UPI', label: 'UPI / GPay', icon: Smartphone },
                      { id: 'NETBANKING', label: 'Net Banking', icon: Building },
                    ].map(method => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1.5 ${
                            paymentMethod === method.id
                              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500'
                              : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[11px]">{method.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Card Fields */}
                {paymentMethod === 'CARD' && (
                  <div className="space-y-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={billingName}
                        onChange={e => setBillingName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                        placeholder="Name on card"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-mono"
                        placeholder="•••• •••• •••• ••••"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-mono"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-mono"
                          placeholder="•••"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI Fields */}
                {paymentMethod === 'UPI' && (
                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                    <label className="block text-xs text-slate-400">UPI ID / VPA</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500 font-mono"
                      placeholder="username@okhdfcbank"
                    />
                    <p className="text-[10px] text-slate-500">Supports Google Pay, PhonePe, Paytm & BHIM UPI</p>
                  </div>
                )}

                {/* Net Banking */}
                {paymentMethod === 'NETBANKING' && (
                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                    <label className="block text-xs text-slate-400 mb-1">Select Bank</label>
                    <select className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500">
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>State Bank of India</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-2 text-[11px] text-emerald-300 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/60">
                  <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>256-Bit SSL Encrypted. Atomic transaction guarantees instant seat lock.</span>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation - Digital Cinema E-Ticket */}
            {step === 3 && bookingResult && (
              <div className="max-w-md mx-auto space-y-4 py-2">
                <div className="text-center space-y-1">
                  <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400 mb-2">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">Booking Confirmed!</h3>
                  <p className="text-xs text-slate-400">Your tickets have been issued and saved to your Eventora account.</p>
                </div>

                {/* Cinema E-Ticket Component */}
                <div className="bg-[#121927] rounded-3xl border border-slate-700 overflow-hidden shadow-2xl relative">
                  {/* Ticket Header Banner */}
                  <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-4 border-b border-indigo-700/50 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">
                        OFFICIAL CINEMA E-TICKET
                      </span>
                      <h4 className="text-base font-bold text-white line-clamp-1">{bookingResult.event?.title}</h4>
                    </div>
                    <div className="px-2.5 py-1 bg-indigo-600/60 border border-indigo-400/50 rounded-lg text-xs font-mono font-bold text-white">
                      {bookingResult.booking?.bookingCode}
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Cinema & Audi Details */}
                    <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Venue & City</span>
                        <span className="font-bold text-slate-200">{bookingResult.venue?.name}</span>
                        <p className="text-[11px] text-slate-400">{bookingResult.venue?.city}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase">Screen & Audi</span>
                        <span className="font-bold text-indigo-400">
                          {bookingResult.venue?.screens?.[0]?.name || 'IMAX Audi 1'}
                        </span>
                        <p className="text-[11px] text-slate-400">Dolby Atmos Sound</p>
                      </div>
                    </div>

                    {/* QR Code section */}
                    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl">
                      <QRCodeSVG
                        value={bookingResult.booking?.qrCode || bookingResult.booking?.bookingCode || 'EVT'}
                        size={150}
                        level="H"
                        includeMargin={false}
                      />
                      <span className="text-[10px] text-slate-700 font-mono font-bold mt-2 tracking-widest uppercase">
                        SCAN AT ENTRANCE TURNSTILE
                      </span>
                    </div>

                    {/* Booked Seats Chips & Payment Summary */}
                    <div className="bg-[#161f33] p-3 rounded-xl space-y-2 text-xs border border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Confirmed Seats:</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {selectedSeats.map(s => (
                            <span key={s.id} className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded font-bold text-xs">
                              {s.rowLabel}-{s.seatNumber} ({s.tier})
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Total Paid:</span>
                        <span className="text-white font-bold text-sm">
                          ₹{bookingResult.booking?.totalAmount?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Transaction ID:</span>
                        <span className="font-mono">{bookingResult.payment?.transactionId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Perforated ticket edge effect */}
                  <div className="relative border-t-2 border-dashed border-slate-700 py-3 px-5 bg-[#0e1422] flex items-center justify-between">
                    <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-[#0B0F17]" />
                    <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-[#0B0F17]" />
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Eventora Verified Ticket
                    </span>
                    <button
                      onClick={() => window.print()}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Print / Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Bar — only for seat, payment and confirmation steps */}
          {step >= 1 && (
          <div className="bg-[#101726] border-t border-slate-800 p-4 px-6 flex items-center justify-between flex-shrink-0 shadow-xl">
            {step === 1 && (
              <>
                <div>
                  <span className="text-xs text-slate-400 block">
                    Selected ({selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'})
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white">₹{totalAmount.toLocaleString()}</span>
                    {selectedSeats.length > 0 && (
                      <span className="text-xs text-slate-400">incl. fees</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="px-3 py-2.5 border border-slate-700 hover:bg-slate-800 text-slate-400 font-semibold rounded-xl text-xs flex items-center gap-1 transition-colors"
                    title="Change date/time"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (selectedSeatIds.length === 0) {
                        addToast('Please select at least one seat to proceed.', 'info');
                        return;
                      }
                      if (!user) {
                        onRequireAuth();
                        return;
                      }
                      setStep(2);
                    }}
                    disabled={selectedSeatIds.length === 0}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <span>Proceed to Book</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Seats
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={submitting}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/30 text-sm flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Processing Payment…
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" /> Pay ₹{totalAmount.toLocaleString()}
                    </>
                  )}
                </button>
              </>
            )}

            {step === 3 && (
              <button
                onClick={onClose}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors text-sm"
              >
                Done & Return to Events
              </button>
            )}
          </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function getTierSeatStyle(tier) {
  switch (tier) {
    case 'RECLINER':
      return 'bg-amber-500/15 border border-amber-500/70 text-amber-300 hover:bg-amber-500/30 hover:shadow-[0_0_8px_rgba(245,158,11,0.5)]';
    case 'PREMIUM':
      return 'bg-purple-500/15 border border-purple-500/70 text-purple-300 hover:bg-purple-500/30 hover:shadow-[0_0_8px_rgba(168,85,247,0.5)]';
    case 'GOLD':
      return 'bg-teal-500/15 border border-teal-500/70 text-teal-300 hover:bg-teal-500/30 hover:shadow-[0_0_8px_rgba(20,184,166,0.5)]';
    default:
      return 'bg-sky-500/15 border border-sky-500/70 text-sky-300 hover:bg-sky-500/30 hover:shadow-[0_0_8px_rgba(14,165,233,0.5)]';
  }
}

function getTierBadgeStyle(tier) {
  switch (tier) {
    case 'RECLINER':
      return 'bg-amber-950/60 border-amber-600/70 text-amber-300';
    case 'PREMIUM':
      return 'bg-purple-950/60 border-purple-600/70 text-purple-300';
    case 'GOLD':
      return 'bg-teal-950/60 border-teal-600/70 text-teal-300';
    default:
      return 'bg-sky-950/60 border-sky-600/70 text-sky-300';
  }
}
