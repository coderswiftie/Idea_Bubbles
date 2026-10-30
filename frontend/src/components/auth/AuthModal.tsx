import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CoquetteBow, PearlSparkle } from '../common/CoquetteBow';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cocoa/30 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-pearl border border-powder rounded-3xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-mauve hover:text-cocoa hover:bg-blush transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {user && user.email !== 'explorer@ideabubbles.universe' ? (
          /* Profile & Logout */
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-blush border border-powder mx-auto flex items-center justify-center text-rose font-bold text-lg shadow-sm">
              {user.display_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-cocoa">{user.display_name}</h3>
              <p className="text-xs text-mauve font-sans">{user.email}</p>
            </div>
            <div className="pt-4 border-t border-powder">
              <button
                onClick={handleLogout}
                className="w-full py-2 px-3 rounded-xl bg-blush/60 hover:bg-blush text-rose text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-powder shadow-sm"
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
              <h3 className="font-brand text-4xl font-normal text-cocoa lowercase">
                {isRegister ? 'join' : 'welcome'}
              </h3>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-blush/80 border border-rose/30 text-rose text-xs mb-4 font-sans">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 font-sans">
              {isRegister && (
                <div>
                  <label className="text-xs text-mauve block mb-1 font-sans">
                    display name
                  </label>
                  <div className="flex items-center gap-2 bg-blush/20 border border-powder rounded-xl px-3 py-2 text-xs focus-within:border-rose/80 focus-within:ring-2 focus-within:ring-rose/20 transition-all">
                    <UserIcon className="w-4 h-4 text-mauve" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="name"
                      className="w-full bg-transparent text-cocoa placeholder:text-mauve/60 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-mauve block mb-1 font-sans">
                  email
                </label>
                <div className="flex items-center gap-2 bg-blush/20 border border-powder rounded-xl px-3 py-2 text-xs focus-within:border-rose/80 focus-within:ring-2 focus-within:ring-rose/20 transition-all">
                  <Mail className="w-4 h-4 text-mauve" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-transparent text-cocoa placeholder:text-mauve/60 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-mauve block mb-1 font-sans">
                  password
                </label>
                <div className="flex items-center gap-2 bg-blush/20 border border-powder rounded-xl px-3 py-2 text-xs focus-within:border-rose/80 focus-within:ring-2 focus-within:ring-rose/20 transition-all">
                  <Lock className="w-4 h-4 text-mauve" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    className="w-full bg-transparent text-cocoa placeholder:text-mauve/60 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 rounded-xl bg-cocoa text-pearl text-xs font-sans tracking-wide shadow-sm hover:bg-cocoa-soft transition-all disabled:opacity-50 lowercase"
              >
                {loading ? 'loading...' : isRegister ? 'create account' : 'sign in'}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-powder text-center font-sans">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
                className="text-xs text-mauve hover:text-rose underline"
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
