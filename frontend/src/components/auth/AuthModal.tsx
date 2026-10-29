import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, login, register, logout } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password, displayName || undefined);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/20 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white/95 backdrop-blur-2xl border border-stone-200/90 rounded-3xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-charcoal transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {user && user.email !== 'explorer@ideabubbles.universe' ? (
          /* Profile & Logout */
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-iridescent-lavender/30 to-iridescent-pink/30 border border-stone-200 mx-auto flex items-center justify-center text-charcoal font-bold text-lg shadow-sm">
              {user.display_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-charcoal">{user.display_name}</h3>
              <p className="text-xs text-stone-400 font-sans">{user.email}</p>
            </div>
            <div className="pt-4 border-t border-stone-100">
              <button
                onClick={handleLogout}
                className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-rose-200 shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div>
            <div className="text-center mb-5">
              <h3 className="font-handwriting text-3xl font-bold text-charcoal">
                {isRegister ? 'Join Idea Bubbles' : 'Welcome Back'}
              </h3>
              <p className="font-editorial italic text-stone-400 text-sm mt-0.5">
                {isRegister
                  ? 'Create a personal, ethereal archive for your thoughts'
                  : 'Step back into your luminous world of ideas'}
              </p>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-4 font-sans">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 font-sans">
              {isRegister && (
                <div>
                  <label className="text-xs text-stone-400 block mb-1 font-editorial italic">
                    Display Name
                  </label>
                  <div className="flex items-center gap-2 bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2 text-xs focus-within:border-iridescent-lavender">
                    <UserIcon className="w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Leonardo"
                      className="w-full bg-transparent text-charcoal placeholder-stone-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-stone-400 block mb-1 font-editorial italic">
                  Email Address
                </label>
                <div className="flex items-center gap-2 bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2 text-xs focus-within:border-iridescent-lavender">
                  <Mail className="w-4 h-4 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-transparent text-charcoal placeholder-stone-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-stone-400 block mb-1 font-editorial italic">
                  Password
                </label>
                <div className="flex items-center gap-2 bg-[#FAF7F2] border border-stone-200 rounded-xl px-3 py-2 text-xs focus-within:border-iridescent-lavender">
                  <Lock className="w-4 h-4 text-stone-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-transparent text-charcoal placeholder-stone-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-iridescent-lavender to-iridescent-cyan text-white text-xs font-semibold shadow-sm hover:opacity-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-stone-100 text-center font-sans">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
                className="text-xs text-stone-500 hover:text-charcoal underline"
              >
                {isRegister
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
