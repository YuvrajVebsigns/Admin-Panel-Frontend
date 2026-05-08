'use client';

import React, { useState } from 'react';
import { Lock, Loader2, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ResetPasswordFormProps {
  onBackToLogin?: () => void;
}

import { AuthLayout } from '@/modules/auth/components/AuthLayout';

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onBackToLogin }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const _token = searchParams.get('token') || '';
  const _email = searchParams.get('email') || '';
  const { resetPassword, isResettingPassword } = useAuth();

  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError(null);

    try {
      await resetPassword({ token: _token, password });
      setIsSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="flex flex-col justify-center w-full mx-auto text-center space-y-6 pt-2 pb-6">
          <div className="h-24 w-24 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto shadow-[0_0_40px_rgba(34,197,94,0.15)] mb-2">
            <CheckCircle2 size={50} strokeWidth={2.5} />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Password Reset!
            </h2>
            <p className="text-base font-medium text-gray-500 dark:text-gray-400 max-w-[300px] mx-auto leading-relaxed">
              Your password has been successfully updated. You can now sign in with your new
              password.
            </p>
          </div>
          <div className="pt-4">
            <button
              onClick={() => {
                if (onBackToLogin) {
                  onBackToLogin();
                } else {
                  router.push(`/login?email=${encodeURIComponent(_email)}`);
                }
              }}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/20 transition-all active:scale-[0.98] text-base tracking-wide"
            >
              Proceed to Login
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create Password" subtitle="Secure your account with a new password.">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1">
            New Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
              <Lock size={20} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={`block w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-navy-900/50 border ${
                error ? 'border-red-500/50' : 'border-gray-100 dark:border-navy-700'
              } rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-base shadow-sm`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1">
            Confirm Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
              <Lock size={20} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={`block w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-navy-900/50 border ${
                error ? 'border-red-500/50' : 'border-gray-100 dark:border-navy-700'
              } rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-base shadow-sm`}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl">
            <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-500 leading-tight">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isResettingPassword}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-base tracking-wide"
        >
          {isResettingPassword ? (
            <>
              <Loader2 size={22} className="animate-spin" />
              Updating password...
            </>
          ) : (
            'Set New Password'
          )}
        </button>
      </form>
    </AuthLayout>
  );
};
