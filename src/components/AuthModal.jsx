import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Mail, User, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'signup', alertMessage = '' }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    setIsLogin(initialMode === 'login');
    setError('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const user = await login(email, password);
        addToast(`Welcome back, ${user.name}!`, 'success');
      } else {
        const user = await signup(name, email, password, role);
        addToast(`Account created successfully! Welcome, ${user.name}.`, 'success');
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#0C1222] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-700/80 relative"
          onClick={e => e.stopPropagation()}
        >
          {/* Header Banner */}
          <div className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 p-6 text-white text-center border-b border-indigo-700/40">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/20 shadow-lg shadow-indigo-950/50">
              <Lock className="w-6 h-6 text-indigo-300" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              {isLogin ? 'Sign In to Eventora' : 'Create Your Account'}
            </h2>
            <p className="text-indigo-200 text-xs sm:text-sm mt-1">
              {isLogin
                ? 'Access your digital e-tickets and verified bookings'
                : 'Register to unlock seat reservation and instant e-tickets'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Prominent Alert Message when user tried to book without account */}
            {alertMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-2xl text-rose-300 text-xs font-semibold flex items-start gap-2.5 shadow-sm"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{alertMessage}</span>
              </motion.div>
            )}

            {/* Form submission error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-xs font-medium flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Account Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('CUSTOMER')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      role === 'CUSTOMER'
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        : 'border-slate-800 text-slate-400 bg-slate-900/60'
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      role === 'ADMIN'
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        : 'border-slate-800 text-slate-400 bg-slate-900/60'
                    }`}
                  >
                    Administrator
                  </button>
                </div>
              </div>
            )}

            {/* Quick Demo Hint */}
            {isLogin && (
              <div className="p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-[11px] text-indigo-300 space-y-1">
                <p className="font-bold flex items-center gap-1 text-indigo-200">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Existing Accounts:
                </p>
                <p>• Admin: <span className="font-mono bg-slate-900/90 px-1 py-0.5 rounded text-white border border-slate-700">admin@eventora.com</span> / <span className="font-mono bg-slate-900/90 px-1 py-0.5 rounded text-white border border-slate-700">Admin@123</span></p>
                <p>• Customer: <span className="font-mono bg-slate-900/90 px-1 py-0.5 rounded text-white border border-slate-700">user@eventora.com</span> / <span className="font-mono bg-slate-900/90 px-1 py-0.5 rounded text-white border border-slate-700">User@123</span></p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-200 text-sm shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Processing…' : isLogin ? 'Sign In to Account' : 'Register & Continue'}
            </button>

            <div className="text-center pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                {isLogin ? "Don't have an account yet? Register here" : 'Already have an account? Sign In'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
