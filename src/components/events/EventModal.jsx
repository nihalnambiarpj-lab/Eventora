import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Calendar, MapPin, Clock, Users, ChevronLeft, ChevronRight, Minus, Plus, Shield, CheckCircle } from 'lucide-react';

const SEAT_CATEGORIES = [
  { id: 'premium', label: 'Premium', color: 'bg-yellow-500', textColor: 'text-yellow-700', bg: 'bg-yellow-50', multiplier: 2.5 },
  { id: 'gold', label: 'Gold', color: 'bg-orange-400', textColor: 'text-orange-700', bg: 'bg-orange-50', multiplier: 1.8 },
  { id: 'silver', label: 'Silver', color: 'bg-gray-400', textColor: 'text-gray-700', bg: 'bg-gray-50', multiplier: 1.2 },
  { id: 'general', label: 'General', color: 'bg-blue-400', textColor: 'text-blue-700', bg: 'bg-blue-50', multiplier: 1 },
];

export default function EventModal({ event, onClose }) {
  const [selectedShowtime, setSelectedShowtime] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('silver');
  const [quantity, setQuantity] = useState(2);
  const [step, setStep] = useState(1); // 1 = details, 2 = confirmation
  const [bookingDone, setBookingDone] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const catInfo = SEAT_CATEGORIES.find(c => c.id === selectedCategory);
  const pricePerTicket = Math.round(event.priceMin * catInfo.multiplier);
  const subtotal = pricePerTicket * quantity;
  const fees = Math.round(subtotal * 0.05);
  const total = subtotal + fees;

  const handleBook = useCallback(() => {
    if (step === 1) {
      setStep(2);
    } else {
      setBookingDone(true);
    }
  }, [step]);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        role="dialog"
        aria-modal="true"
        aria-label={`Book tickets for ${event.title}`}
      >
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl max-h-[95vh] overflow-y-auto shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Success state */}
          {bookingDone ? (
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
              >
                <CheckCircle className="w-10 h-10 text-green-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-500 text-sm mb-1">Your {quantity} ticket{quantity > 1 ? 's' : ''} for</p>
              <p className="text-indigo-600 font-semibold text-base mb-6">{event.title}</p>
              <div className="bg-gray-50 rounded-2xl p-4 w-full mb-6 text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Booking ID</span>
                  <span className="font-mono font-semibold text-gray-900">EVT-{Math.random().toString(36).substr(2,8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Total Paid</span>
                  <span className="font-bold text-gray-900">₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">E-tickets sent to</span>
                  <span className="text-gray-700">your email</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Header image */}
              <div className="relative h-52 sm:h-64 overflow-hidden rounded-t-3xl bg-gray-900">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full text-white transition-colors"
                  aria-label="Close booking modal"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-5 right-5">
                  <span className="text-xs text-indigo-300 font-medium uppercase tracking-wider">{event.category}</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight mt-0.5 line-clamp-2">{event.title}</h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6">
                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-5" aria-label="Booking steps">
                  {['Select Details', 'Review & Pay'].map((label, i) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${step > i + 1 || step === i + 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step > i ? 'bg-indigo-600 text-white' : step === i + 1 ? 'border-2 border-indigo-600 text-indigo-600' : 'border-2 border-gray-200 text-gray-300'}`}>
                          {step > i + 1 ? '✓' : i + 1}
                        </div>
                        <span className="hidden sm:inline">{label}</span>
                      </div>
                      {i === 0 && <div className={`flex-1 h-0.5 w-8 ${step > 1 ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
                    </div>
                  ))}
                </div>

                {step === 1 ? (
                  <>
                    {/* Event info */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-5 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-indigo-400" />
                        <span className="line-clamp-1">{event.venue}, {event.city}</span>
                      </div>
                      {event.duration && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-indigo-400" />
                          <span>{event.duration}</span>
                        </div>
                      )}
                    </div>

                    {/* Showtime selection */}
                    <div className="mb-5">
                      <h3 className="text-sm font-semibold text-gray-800 mb-2.5">Select Showtime</h3>
                      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Showtime selection">
                        {event.showtimes.map((time, i) => (
                          <button
                            key={time}
                            role="radio"
                            aria-checked={selectedShowtime === i}
                            onClick={() => setSelectedShowtime(i)}
                            className={`px-4 py-2 text-sm font-medium rounded-xl border-2 transition-all ${
                              selectedShowtime === i
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Seat category */}
                    <div className="mb-5">
                      <h3 className="text-sm font-semibold text-gray-800 mb-2.5">Seat Category</h3>
                      <div className="space-y-2" role="radiogroup" aria-label="Seat category">
                        {SEAT_CATEGORIES.map(cat => (
                          <button
                            key={cat.id}
                            role="radio"
                            aria-checked={selectedCategory === cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center justify-between w-full p-3.5 rounded-xl border-2 transition-all ${
                              selectedCategory === cat.id
                                ? `border-indigo-500 ${cat.bg}`
                                : 'border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                              <span className={`text-sm font-medium ${selectedCategory === cat.id ? cat.textColor : 'text-gray-700'}`}>
                                {cat.label}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              ₹{Math.round(event.priceMin * cat.multiplier).toLocaleString()}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center justify-between mb-6 bg-gray-50 rounded-xl p-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Number of Tickets</p>
                        <p className="text-xs text-gray-400 mt-0.5">Max 10 tickets per booking</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-indigo-400 transition-colors"
                          aria-label="Decrease ticket count"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-lg font-bold text-gray-900 min-w-[24px] text-center" aria-live="polite">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(q => Math.min(10, q + 1))}
                          className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-indigo-400 transition-colors"
                          aria-label="Increase ticket count"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Review step */
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-800 mb-4">Booking Summary</h3>
                    <div className="bg-gray-50 rounded-2xl p-4 mb-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Event</span>
                        <span className="font-medium text-gray-900 text-right max-w-[60%] line-clamp-1">{event.title}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Date & Time</span>
                        <span className="font-medium text-gray-900">{event.date} · {event.showtimes[selectedShowtime]}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Venue</span>
                        <span className="font-medium text-gray-900 text-right max-w-[60%] line-clamp-1">{event.venue}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Seat Category</span>
                        <span className="font-medium text-gray-900">{catInfo.label}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{quantity} × ₹{pricePerTicket.toLocaleString()}</span>
                        <span className="font-medium text-gray-900">₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Convenience Fee</span>
                        <span className="font-medium text-gray-900">₹{fees.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3 flex justify-between">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-bold text-indigo-600 text-lg">₹{total.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-green-50 rounded-xl p-3">
                      <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Your payment is secured with 256-bit SSL encryption. 100% genuine tickets guaranteed.</span>
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="flex gap-3">
                  {step === 2 && (
                    <button
                      onClick={() => setStep(1)}
                      className="px-5 py-3.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 transition-colors flex items-center gap-1.5"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBook}
                    className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors text-base shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                    aria-label={step === 1 ? 'Proceed to payment' : 'Confirm and pay'}
                  >
                    {step === 1 ? (
                      <>
                        Continue · ₹{subtotal.toLocaleString()}
                        <ChevronRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Confirm & Pay · ₹{total.toLocaleString()}
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
