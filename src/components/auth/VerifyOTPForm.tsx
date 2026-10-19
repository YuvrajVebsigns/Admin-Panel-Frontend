'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AuthWorkspace, AuthError, authButtonClassName, authLinkClassName } from './AuthWorkspace';

export default function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { verifyOTP, forgotPassword, isVerifyingOTP, isSubmittingForgot } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((previous) => previous - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    setError(null);
    try {
      const response = await verifyOTP({ email, otp: otpString });
      router.push(
        `/reset-password?token=${response?.reset_token}&email=${encodeURIComponent(email)}`,
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid OTP code. Please try again.');
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await forgotPassword(email);
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    }
  };

  return (
    <AuthWorkspace
      title="Check your email"
      subtitle="Enter the 6-digit verification code to continue resetting your password."
    >
      <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isVerifyingOTP}>
        <p className="break-words text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          Code sent to <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
        </p>
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
            Verification code
          </legend>
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                aria-label={`Digit ${index + 1} of 6`}
                maxLength={1}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                className="h-12 min-w-0 w-full rounded-lg border border-gray-200 bg-white text-center font-roboto text-xl font-semibold tabular-nums text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15 dark:border-navy-600 dark:bg-navy-900 dark:text-white sm:h-14"
              />
            ))}
          </div>
        </fieldset>
        {error && <AuthError>{error}</AuthError>}
        <button
          type="submit"
          disabled={isVerifyingOTP || otp.some((digit) => digit === '')}
          className={authButtonClassName}
        >
          {isVerifyingOTP && (
            <Loader2
              size={18}
              className="animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}
          {isVerifyingOTP ? 'Verifying…' : 'Verify code'}
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={timer > 0 || isSubmittingForgot}
          className={`${authLinkClassName} disabled:cursor-not-allowed disabled:text-gray-400`}
        >
          {timer > 0
            ? `Resend code in ${timer}s`
            : isSubmittingForgot
              ? 'Sending…'
              : 'Resend verification code'}
        </button>
      </form>
      <div className="mt-5 border-t border-gray-100 pt-4 dark:border-navy-700">
        <Link href="/login" className={authLinkClassName}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to sign in
        </Link>
      </div>
    </AuthWorkspace>
  );
}
