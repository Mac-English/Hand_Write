import React, { useState } from 'react';
import { User, Mail, Lock, ArrowRight, ShieldCheck, PenTool } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { UserProfile } from '../../types';

interface RegisterPageProps {
  onSuccess: (user: UserProfile) => void;
  onNavigateLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess, onNavigateLogin }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!displayName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid academic email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const user = await storageService.register(email, displayName);
      onSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-xs">
            <PenTool className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Create Student Account
          </h1>
          <p className="text-xs text-neutral-500">
            Join HandWrite AI to save personal handwriting profiles and draft assignments.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Alex Morgan"
                required
                className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg pl-9 pr-3 py-2.5 text-neutral-800 focus:outline-indigo-500"
              />
            </div>
          </div>

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
                className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg pl-9 pr-3 py-2.5 text-neutral-800 focus:outline-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg pl-9 pr-3 py-2.5 text-neutral-800 focus:outline-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full text-xs bg-neutral-50 border border-neutral-300 rounded-lg pl-9 pr-3 py-2.5 text-neutral-800 focus:outline-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Creating account...' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="pt-2 border-t border-neutral-100 text-center text-xs text-neutral-500">
          Already have an account?{' '}
          <button
            onClick={onNavigateLogin}
            className="text-indigo-600 font-semibold hover:underline"
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
};
