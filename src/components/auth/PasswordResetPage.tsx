import React, { useState } from 'react';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, PenTool } from 'lucide-react';

interface PasswordResetPageProps {
  onNavigateLogin: () => void;
}

export const PasswordResetPage: React.FC<PasswordResetPageProps> = ({ onNavigateLogin }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-neutral-200 shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-xs">
            <PenTool className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Reset Password
          </h1>
          <p className="text-xs text-neutral-500">
            Enter your university or personal email to receive secure recovery instructions.
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Password Reset Link Sent</span>
              </div>
              <p>
                We have dispatched a password reset link to <strong className="font-semibold text-emerald-950">{email}</strong>. Please check your inbox and spam folder.
              </p>
            </div>

            <button
              onClick={onNavigateLogin}
              className="w-full py-2.5 px-4 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Sign In</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Your Account Email Address
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

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Sending Instructions...' : 'Send Password Reset Email'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="pt-2 border-t border-neutral-100 text-center text-xs text-neutral-500">
              Remember your password?{' '}
              <button
                type="button"
                onClick={onNavigateLogin}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
