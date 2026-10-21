'use client';

import React, { useState } from 'react';
import { Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AuthWorkspace, AuthError, authInputClassName, authButtonClassName } from './AuthWorkspace';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const { resetPassword, isResettingPassword } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
      await resetPassword({ token, password });
      setIsSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    }
  };

  if (isSuccess) {
    return (
      <AuthWorkspace>
        <div role="status" className="space-y-6">
          <CheckCircle2
            className="h-12 w-12 text-success-600 dark:text-success-400"
            aria-hidden="true"
          />
          <div>
            <h1 className="font-roboto text-2xl font-semibold text-gray-900 dark:text-white">
              Password updated
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Your password has been successfully updated. You can now sign in with your new
              password.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/login?email=${encodeURIComponent(email)}`)}
            className={authButtonClassName}
          >
            Continue to sign in
          </button>
        </div>
      </AuthWorkspace>
    );
  }

  return (
    <AuthWorkspace
      title="Create a new password"
      subtitle="Choose a password with at least 8 characters to secure your account."
    >
      <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isResettingPassword}>
        <div className="space-y-2">
          <label
            htmlFor="new-password"
            className="text-sm font-semibold text-gray-700 dark:text-gray-200"
          >
            New password
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter a new password"
              required
              className={`${authInputClassName} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
              aria-pressed={showPassword}
              className="absolute right-1 top-0 flex h-12 w-11 items-center justify-center rounded-lg text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-gray-400"
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="confirm-password"
            className="text-sm font-semibold text-gray-700 dark:text-gray-200"
          >
            Confirm password
          </label>
          <input
            id="confirm-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter your new password"
            required
            className={authInputClassName}
          />
        </div>
        {error && <AuthError>{error}</AuthError>}
        <button type="submit" disabled={isResettingPassword} className={authButtonClassName}>
          {isResettingPassword && (
            <Loader2
              size={18}
              className="animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}
          {isResettingPassword ? 'Updating password…' : 'Update password'}
        </button>
      </form>
    </AuthWorkspace>
  );
}
