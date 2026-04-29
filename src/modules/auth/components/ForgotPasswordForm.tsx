'use client';

import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ForgotPasswordFormProps {
  onSwitchToLogin?: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSwitchToLogin }) => {
  const { forgotPassword, isSubmittingForgot } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await forgotPassword(email);
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link. Please try again.');
    }
  };

  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
      <div>
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Forgot Password?
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No worries, we&apos;ll send you reset instructions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2.5">
            <label htmlFor="email" className="text-sm font-semibold text-slate-200 ml-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
                <Mail size={20} />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="admin@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`block w-full pl-12 pr-4 py-3.5 bg-slate-800/40 border ${
                  error ? 'border-red-500/50' : 'border-white/5'
                } rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-base shadow-inner`}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-500 leading-tight">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmittingForgot}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-4 rounded-2xl shadow-[0_8px_24px_-8px_rgba(79,70,229,0.5)] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-lg tracking-wide"
          >
            {isSubmittingForgot ? (
              <>
                <Loader2 size={22} className="animate-spin" />
                Sending link...
              </>
            ) : (
              'Reset Password'
            )}
          </button>

          <button
            type="button"
            onClick={() => (onSwitchToLogin ? onSwitchToLogin() : router.push('/login'))}
            className="w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-300 transition-colors mt-6 py-2"
          >
            <ArrowLeft size={18} />
            Back to Sign In
          </button>
        </form>
      </div>
    </div>
  );
};
