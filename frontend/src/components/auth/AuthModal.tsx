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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-midnight-900 border border-midnight-700 rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {user && user.email !== 'explorer@ideabubbles.universe' ? (
          /* Profile & Logout */
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-cosmic-lavender/20 border border-cosmic-lavender/50 mx-auto flex items-center justify-center text-cosmic-lavender font-bold text-lg">
              {user.display_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-ivory-100">{user.display_name}</h3>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <div className="pt-4 border-t border-midnight-700">
              <button
                onClick={handleLogout}
                className="w-full py-2 px-3 rounded-xl bg-midnight-800 hover:bg-midnight-700 text-cosmic-coral text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
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
              <h3 className="text-base font-bold text-ivory-100">
                {isRegister ? 'Join Idea Bubbles' : 'Sign In to Universe'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isRegister
                  ? 'Create an isolated cosmic archive for your thoughts'
                  : 'Welcome back to your constellation of ideas'}
              </p>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-cosmic-coral/10 border border-cosmic-coral/30 text-cosmic-coral text-xs mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {isRegister && (
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                    Display Name
                  </label>
                  <div className="flex items-center gap-2 bg-midnight-950 border border-midnight-700 rounded-xl px-3 py-2 text-xs focus-within:border-cosmic-lavender">
                    <UserIcon className="w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Leonardo"
                      className="w-full bg-transparent text-ivory-100 placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Email Address
                </label>
                <div className="flex items-center gap-2 bg-midnight-950 border border-midnight-700 rounded-xl px-3 py-2 text-xs focus-within:border-cosmic-lavender">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-transparent text-ivory-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                  Password
                </label>
                <div className="flex items-center gap-2 bg-midnight-950 border border-midnight-700 rounded-xl px-3 py-2 text-xs focus-within:border-cosmic-lavender">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-transparent text-ivory-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 rounded-xl bg-cosmic-lavender hover:bg-purple-600 text-white text-xs font-semibold shadow-glow-lavender transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-midnight-700 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
                className="text-xs text-cosmic-lavender hover:underline"
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
