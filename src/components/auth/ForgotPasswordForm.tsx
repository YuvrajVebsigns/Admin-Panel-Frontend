'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  AuthWorkspace,
  AuthError,
  authInputClassName,
  authButtonClassName,
  authLinkClassName,
} from './AuthWorkspace';

export default function ForgotPasswordForm() {
  const { forgotPassword, isSubmittingForgot } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await forgotPassword(email);
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link. Please try again.');
    }
  };

  return (
    <AuthWorkspace
      title="Forgot your password?"
      subtitle="Enter your account email. We’ll send a verification code to help you reset your password."
    >
      <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isSubmittingForgot}>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={authInputClassName}
          />
        </div>
        {error && <AuthError>{error}</AuthError>}
        <button type="submit" disabled={isSubmittingForgot} className={authButtonClassName}>
          {isSubmittingForgot && (
            <Loader2
              size={18}
              className="animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}
          {isSubmittingForgot ? 'Sending code…' : 'Send verification code'}
        </button>
      </form>
      <Link href="/login" className={`${authLinkClassName} mt-5`}>
        <ArrowLeft size={16} aria-hidden="true" />
        Back to sign in
      </Link>
    </AuthWorkspace>
  );
}
