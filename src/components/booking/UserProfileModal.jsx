import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Ticket, Calendar, MapPin, LogOut, Download, AlertTriangle,
  CheckCircle2, XCircle, RefreshCcw, ChevronLeft, Armchair
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../api/client';

// ─── tiny status pill ─────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    CONFIRMED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    CANCELLED:  'bg-rose-500/15    text-rose-300    border-rose-500/30',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${map[status] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
      {status === 'CONFIRMED' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {status}
    </span>
  );
}

// ─── cancel flow modal ────────────────────────────────────────────────────────
function CancelModal({ booking, onClose, onSuccess }) {
  const { addToast } = useToast();
  const [selectedSeatIds, setSelectedSeatIds] = useState([]); // BookingSeat IDs
  const [step, setStep]  = useState('select'); // 'select' | 'confirm'
  const [loading, setLoading] = useState(false);

  const allSeats = booking.seats; // BookingSeat[]

  function toggleSeat(bsId) {
    setSelectedSeatIds(prev =>
      prev.includes(bsId) ? prev.filter(s => s !== bsId) : [...prev, bsId]
    );
  }

  function selectAll() {
    setSelectedSeatIds(allSeats.map(s => s.id));
  }

  const estimatedRefund = selectedSeatIds.reduce((sum, bsId) => {
    const bs = allSeats.find(s => s.id === bsId);
    return sum + (bs ? Math.round(bs.pricePaid * 0.95) : 0);
  }, 0);

  const isFullCancel = selectedSeatIds.length === allSeats.length;

  async function handleConfirm() {
    setLoading(true);
    try {
      const data = await apiFetch(`/bookings/${booking.id}/cancel`, {
        method: 'DELETE',
        body: JSON.stringify({ seatIds: selectedSeatIds }),
      });
      addToast(data.message, 'success');
      onSuccess();
      onClose();
    } catch (err) {
      addToast(err.message || 'Cancellation failed.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0C1222] rounded-3xl max-w-md w-full p-6 border border-slate-700 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5 text-rose-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-extrabold text-base">Cancel Tickets</h3>
            <p className="text-slate-400 text-xs">{booking.showtime?.event?.title} · {booking.bookingCode}</p>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 'select' ? (
          <>
            <p className="text-slate-300 text-xs mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              Select the seat(s) you want to cancel. You'll receive a 95% refund per seat within 5–7 business days.
            </p>

            {/* Seat selector */}
            <div className="space-y-2 mb-4 max-h-52 overflow-y-auto pr-1">
              {allSeats.map(bs => {
                const checked = selectedSeatIds.includes(bs.id);
                return (
                  <button
                    key={bs.id}
                    onClick={() => toggleSeat(bs.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all cursor-pointer ${
                      checked
                        ? 'bg-rose-500/15 border-rose-500/50 text-rose-200'
                        : 'bg-[#111726] border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                      checked ? 'bg-rose-500 border-rose-500' : 'border-slate-600'
                    }`}>
                      {checked && <X className="w-3 h-3 text-white" />}
                    </div>
                    <Armchair className="w-4 h-4 flex-shrink-0 opacity-60" />
                    <span className="font-bold text-sm flex-1">
                      Seat {bs.seat.rowLabel}-{bs.seat.seatNumber}
                      <span className="ml-2 text-[10px] font-normal opacity-60">{bs.seat.tier}</span>
                    </span>
                    <span className="text-xs font-bold text-slate-400">₹{bs.pricePaid.toLocaleString()}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick actions */}
            <div className="flex gap-2 mb-5">
              <button
                onClick={selectAll}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2 cursor-pointer transition-colors"
              >
                Select all seats
              </button>
              {selectedSeatIds.length > 0 && (
                <button
                  onClick={() => setSelectedSeatIds([])}
                  className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 cursor-pointer transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Refund summary */}
            {selectedSeatIds.length > 0 && (
              <div className="bg-[#111726] rounded-xl p-3 border border-slate-700 mb-5 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Seats to cancel</span>
                  <span className="text-white font-bold">{selectedSeatIds.length} / {allSeats.length}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated refund (95%)</span>
                  <span className="text-emerald-400 font-bold">₹{estimatedRefund.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Type</span>
                  <span className="font-bold text-white">{isFullCancel ? '🔴 Full cancellation' : '🟡 Partial cancellation'}</span>
                </div>
              </div>
            )}

            <button
              disabled={selectedSeatIds.length === 0}
              onClick={() => setStep('confirm')}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all cursor-pointer"
            >
              Continue → Review Cancellation
            </button>
          </>
        ) : (
          <>
            {/* Confirmation step */}
            <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl p-4 mb-5 space-y-2 text-sm">
              <p className="text-rose-200 font-bold text-base text-center mb-2">
                {isFullCancel ? 'Cancel entire booking?' : `Cancel ${selectedSeatIds.length} seat(s)?`}
              </p>
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Booking code</span><span className="text-white font-mono font-bold">{booking.bookingCode}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Seats</span>
                <span className="text-white font-bold">
                  {allSeats
                    .filter(bs => selectedSeatIds.includes(bs.id))
                    .map(bs => `${bs.seat.rowLabel}-${bs.seat.seatNumber}`)
                    .join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Refund amount</span><span className="text-emerald-400 font-bold">₹{estimatedRefund.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Timeline</span><span className="text-white">5–7 business days</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('select')}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                {loading ? 'Cancelling…' : 'Confirm Cancel'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ─── E-Ticket sub-modal ───────────────────────────────────────────────────────
function ETicketModal({ booking, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#111726] rounded-3xl max-w-sm w-full p-6 text-center relative border border-slate-700 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-extrabold uppercase tracking-widest rounded-full mb-3">
          OFFICIAL DIGITAL PASS
        </div>
        <h3 className="text-base font-bold text-white">{booking.showtime?.event?.title}</h3>
        <p className="text-xs text-slate-400 mb-4">{booking.showtime?.venue?.name}</p>

        <div className="bg-white p-4 rounded-2xl inline-block mb-4 shadow-xl">
          <QRCodeSVG value={booking.qrCode || booking.bookingCode} size={150} />
        </div>

        <p className="text-xs font-mono font-bold text-indigo-400 mb-2 tracking-wider">{booking.bookingCode}</p>
        <div className="text-xs text-slate-300 space-y-1.5 mb-5 bg-[#161F33] p-3 rounded-xl border border-slate-700/80 text-left">
          <p><span className="text-slate-400">Seats:</span> <span className="font-bold text-white">{booking.seats.map(s => `${s.seat.rowLabel}-${s.seat.seatNumber}`).join(', ')}</span></p>
          <p><span className="text-slate-400">Date:</span> <span className="font-bold text-white">{new Date(booking.showtime?.startTime).toLocaleString()}</span></p>
          <p><span className="text-slate-400">Total:</span> <span className="font-bold text-emerald-400">₹{booking.totalAmount.toLocaleString()}</span></p>
        </div>

        <button
          onClick={() => window.print()}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs sm:text-sm rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
        >
          <Download className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>
    </div>
  );
}

// ─── Main UserProfileModal ────────────────────────────────────────────────────
export default function UserProfileModal({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [selectedTicket, setSelectedTicket] = useState(null);   // for E-Ticket view
  const [cancellingBooking, setCancellingBooking] = useState(null); // for CancelModal

  useEffect(() => {
    if (isOpen && user) fetchBookings();
  }, [isOpen, user]);

  async function fetchBookings() {
    try {
      setLoadingBookings(true);
      const data = await apiFetch('/bookings/my-bookings');
      setBookings(data);
    } catch (err) {
      console.error('Fetch bookings error:', err);
    } finally {
      setLoadingBookings(false);
    }
  }

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        role="dialog"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="bg-[#0C1222] rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-700/80"
          onClick={e => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white p-6 relative border-b border-slate-800">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-slate-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-extrabold shadow-lg shadow-indigo-600/30">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">{user.name}</h2>
                <p className="text-slate-400 text-xs sm:text-sm">{user.email}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[11px] font-bold rounded-full border border-indigo-500/30">
                  {user.role} ACCOUNT
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 mt-6 border-t border-slate-800/80 pt-3">
              {['bookings', 'profile'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs sm:text-sm font-bold pb-1 border-b-2 transition-all cursor-pointer capitalize ${
                    activeTab === tab ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab === 'bookings' ? `My Bookings (${bookings.length})` : 'Account Profile'}
                </button>
              ))}
            </div>
          </div>

          {/* ── Tab Content ── */}
          <div className="p-6 overflow-y-auto flex-1 bg-[#0A0E1A]">
            {activeTab === 'bookings' ? (
              <div>
                {loadingBookings ? (
                  <div className="py-12 text-center text-slate-400 text-sm">Loading your bookings…</div>
                ) : bookings.length === 0 ? (
                  <div className="py-14 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3 text-indigo-400">
                      <Ticket className="w-7 h-7" />
                    </div>
                    <p className="text-white font-bold text-base mb-1">No bookings yet</p>
                    <p className="text-slate-400 text-xs">Your confirmed event e-tickets and QR passes will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map(b => {
                      const isCancelled = b.status === 'CANCELLED';
                      const seatsLeft = b.seats.length;
                      return (
                        <div
                          key={b.id}
                          className={`rounded-2xl p-4 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-lg ${
                            isCancelled
                              ? 'bg-[#0e1118] border-slate-800/50 opacity-60'
                              : 'bg-[#111726] border-slate-800 hover:border-indigo-500/50'
                          }`}
                        >
                          {/* Left: Event info */}
                          <div className="flex gap-3.5 items-center flex-1 min-w-0">
                            <img
                              src={b.showtime?.event?.image || 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=800&q=80'}
                              alt=""
                              className={`w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-slate-700 ${isCancelled ? 'grayscale' : ''}`}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="px-2 py-0.5 bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 text-[10px] font-mono font-bold rounded uppercase">
                                  {b.bookingCode}
                                </span>
                                <StatusBadge status={b.status} />
                              </div>
                              <h3 className="font-bold text-white text-sm sm:text-base line-clamp-1">
                                {b.showtime?.event?.title}
                              </h3>
                              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <Calendar className="w-3 h-3 text-indigo-400" />
                                {new Date(b.showtime?.startTime).toLocaleString()}
                              </p>
                              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <MapPin className="w-3 h-3 text-indigo-400" />
                                {b.showtime?.venue?.name} · {seatsLeft} Seat{seatsLeft !== 1 ? 's' : ''}
                                {isCancelled && <span className="text-rose-400">(Cancelled)</span>}
                              </p>
                            </div>
                          </div>

                          {/* Right: Price + actions */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800 gap-2">
                            <span className={`text-base font-extrabold ${isCancelled ? 'text-slate-500 line-through' : 'text-white'}`}>
                              ₹{b.totalAmount.toLocaleString()}
                            </span>
                            <div className="flex gap-2">
                              {!isCancelled && (
                                <>
                                  <button
                                    onClick={() => setSelectedTicket(b)}
                                    className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Ticket className="w-3 h-3" /> E-Ticket
                                  </button>
                                  <button
                                    onClick={() => setCancellingBooking(b)}
                                    className="px-3 py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <XCircle className="w-3 h-3" /> Cancel
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* ── Profile tab ── */
              <div className="space-y-4 max-w-md">
                <div className="bg-[#111726] p-4 rounded-2xl border border-slate-800 space-y-3">
                  {[['Full Name', user.name], ['Email Address', user.email]].map(([label, val]) => (
                    <div key={label} className="pt-2 first:pt-0 border-t first:border-t-0 border-slate-800">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{label}</label>
                      <p className="text-sm font-bold text-white">{val}</p>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-800">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Account Role</label>
                    <p className="text-sm font-bold text-indigo-400">{user.role}</p>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => { logout(); onClose(); }}
                    className="px-5 py-2.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── E-Ticket popup ── */}
        {selectedTicket && (
          <ETicketModal booking={selectedTicket} onClose={() => setSelectedTicket(null)} />
        )}

        {/* ── Cancel popup ── */}
        <AnimatePresence>
          {cancellingBooking && (
            <CancelModal
              booking={cancellingBooking}
              onClose={() => setCancellingBooking(null)}
              onSuccess={fetchBookings}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
