import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { UserProfile } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'register' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid student email address.');
      return;
    }

    if (mode !== 'forgot' && (!password || password.length < 6)) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        const user = await storageService.register(email, displayName || email.split('@')[0]);
        onAuthSuccess(user);
        onClose();
      } else if (mode === 'signin') {
        const user = await storageService.login(email);
        onAuthSuccess(user);
        onClose();
      } else {
        // Password reset
        setSuccessMsg(`Password reset link sent to ${email}. Please check your inbox.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    const demoUser = await storageService.login('alex.morgan@university.edu');
    onAuthSuccess(demoUser);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-neutral-200 shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h2 className="font-bold text-neutral-900 text-lg">
              {mode === 'signin' && 'Sign In to HandWrite AI'}
              {mode === 'register' && 'Create Student Account'}
              {mode === 'forgot' && 'Reset Your Password'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Access your personalized handwriting profiles and coursework.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg pl-9 pr-3 py-2 text-neutral-800 focus:outline-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                required
                className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg pl-9 pr-3 py-2 text-neutral-800 focus:outline-indigo-500"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-neutral-700">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-indigo-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg pl-9 pr-3 py-2 text-neutral-800 focus:outline-indigo-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>
              {loading
                ? 'Processing...'
                : mode === 'signin'
                ? 'Sign In'
                : mode === 'register'
                ? 'Create Account'
                : 'Send Reset Link'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Demo Fast Login Shortcut */}
        <div className="pt-3 border-t border-neutral-100">
          <button
            type="button"
            onClick={handleDemoSignIn}
            className="w-full py-2 px-3 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Continue as Demo Student (Alex Morgan)</span>
          </button>
        </div>

        {/* Toggle Mode */}
        <div className="text-center text-xs text-neutral-500 pt-1">
          {mode === 'signin' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Sign up free
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
