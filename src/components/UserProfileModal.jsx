import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ticket, Calendar, MapPin, User, LogOut, Download, QrCode, Shield, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client';

export default function UserProfileModal({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings'); // bookings | profile
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchBookings();
    }
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
          {/* Header */}
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
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  {user.name}
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm">{user.email}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[11px] font-bold rounded-full border border-indigo-500/30">
                  {user.role} ACCOUNT
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 mt-6 border-t border-slate-800/80 pt-3">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`text-xs sm:text-sm font-bold pb-1 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'bookings' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                My Bookings ({bookings.length})
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`text-xs sm:text-sm font-bold pb-1 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'profile' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Account Profile
              </button>
            </div>
          </div>

          {/* Tab Content */}
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
                    {bookings.map(b => (
                      <div
                        key={b.id}
                        className="bg-[#111726] rounded-2xl p-4 border border-slate-800 hover:border-indigo-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-lg"
                      >
                        <div className="flex gap-3.5 items-center">
                          <img
                            src={b.showtime?.event?.image || 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=800&q=80'}
                            alt=""
                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-slate-700"
                          />
                          <div>
                            <span className="px-2 py-0.5 bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 text-[10px] font-mono font-bold rounded uppercase">
                              {b.bookingCode}
                            </span>
                            <h3 className="font-bold text-white text-sm sm:text-base mt-1 line-clamp-1">
                              {b.showtime?.event?.title}
                            </h3>
                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <Calendar className="w-3 h-3 text-indigo-400" />
                              {new Date(b.showtime?.startTime).toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <MapPin className="w-3 h-3 text-indigo-400" />
                              {b.showtime?.venue?.name} · {b.seats.length} Seat{b.seats.length > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800 gap-2">
                          <span className="text-base font-extrabold text-white">₹{b.totalAmount.toLocaleString()}</span>
                          <button
                            onClick={() => setSelectedTicket(b)}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer"
                          >
                            View E-Ticket
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 max-w-md">
                <div className="bg-[#111726] p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name</label>
                    <p className="text-sm font-bold text-white">{user.name}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Address</label>
                    <p className="text-sm font-bold text-white">{user.email}</p>
                  </div>
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
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* E-Ticket Sub-Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#111726] rounded-3xl max-w-sm w-full p-6 text-center relative border border-slate-700 shadow-2xl text-white">
              <button
                onClick={() => setSelectedTicket(null)}
                className="absolute top-4 right-4 p-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-extrabold uppercase tracking-widest rounded-full mb-3">
                OFFICIAL DIGITAL PASS
              </div>
              <h3 className="text-base font-bold text-white">{selectedTicket.showtime?.event?.title}</h3>
              <p className="text-xs text-slate-400 mb-4">{selectedTicket.showtime?.venue?.name}</p>

              {/* QR Code */}
              <div className="bg-white p-4 rounded-2xl inline-block mb-4 shadow-xl">
                <QRCodeSVG value={selectedTicket.qrCode || selectedTicket.bookingCode} size={150} />
              </div>

              <p className="text-xs font-mono font-bold text-indigo-400 mb-2 tracking-wider">{selectedTicket.bookingCode}</p>
              <div className="text-xs text-slate-300 space-y-1.5 mb-5 bg-[#161F33] p-3 rounded-xl border border-slate-700/80 text-left">
                <p><span className="text-slate-400">Seats:</span> <span className="font-bold text-white">{selectedTicket.seats.map(s => `${s.seat.rowLabel}-${s.seat.seatNumber}`).join(', ')}</span></p>
                <p><span className="text-slate-400">Date:</span> <span className="font-bold text-white">{new Date(selectedTicket.showtime?.startTime).toLocaleString()}</span></p>
                <p><span className="text-slate-400">Total:</span> <span className="font-bold text-emerald-400">₹{selectedTicket.totalAmount.toLocaleString()}</span></p>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs sm:text-sm rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
