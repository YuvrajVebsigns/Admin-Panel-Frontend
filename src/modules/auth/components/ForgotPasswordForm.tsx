'use client';

import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ForgotPasswordFormProps {
  onSwitchToLogin?: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSwitchToLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        setIsSubmitted(true);
        // router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (_error) {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-8 py-4">
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <CheckCircle2 size={40} />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-white tracking-tight">Check your email</h2>
          <p className="text-base text-slate-400 leading-relaxed">
            We&apos;ve sent a password reset link to your email address.
          </p>
        </div>
        <button
          onClick={() => (onSwitchToLogin ? onSwitchToLogin() : router.push('/login'))}
          className="w-full bg-slate-800/50 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] border border-white/5"
        >
          Back to Login
        </button>
      </div>
    );
  }

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
            <label className="text-sm font-semibold text-slate-200 ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
                <Mail size={20} />
              </div>
              <input
                type="email"
                placeholder="admin@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-12 pr-4 py-3.5 bg-slate-800/40 border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-base shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-4 rounded-2xl shadow-[0_8px_24px_-8px_rgba(79,70,229,0.5)] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-lg tracking-wide"
          >
            {isLoading ? (
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
