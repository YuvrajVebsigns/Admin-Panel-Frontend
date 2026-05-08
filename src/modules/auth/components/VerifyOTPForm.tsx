'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface VerifyOTPFormProps {
  onBackToLogin?: () => void;
}

import { AuthLayout } from '@/modules/auth/components/AuthLayout';

export const VerifyOTPForm: React.FC<VerifyOTPFormProps> = ({ onBackToLogin }) => {
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
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <AuthLayout title="Verify Identity" subtitle="Security verification required.">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3 text-center mb-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            We&apos;ve sent a 6-digit code to{' '}
            <span className="text-gray-900 dark:text-white font-semibold">{email}</span>
          </p>
        </div>

        <div className="flex justify-between gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-full h-14 sm:h-16 text-center text-2xl font-bold bg-gray-50 dark:bg-navy-900/50 border border-gray-100 dark:border-navy-700 rounded-xl text-gray-900 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
            />
          ))}
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl">
            <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-500 leading-tight">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            type="submit"
            disabled={isVerifyingOTP || otp.some((d) => d === '')}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-xl shadow-[0_8px_24px_-8px_rgba(79,70,229,0.5)] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-base tracking-wide"
          >
            {isVerifyingOTP ? (
              <>
                <Loader2 size={22} className="animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck size={22} />
                Verify Code
              </>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={timer > 0 || isSubmittingForgot}
              className="text-sm font-semibold text-brand-500 hover:text-brand-600 disabled:text-gray-400 dark:disabled:text-gray-500 transition-colors"
            >
              {timer > 0
                ? `Resend code in ${timer}s`
                : isSubmittingForgot
                  ? 'Sending...'
                  : 'Resend OTP Code'}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => (onBackToLogin ? onBackToLogin() : router.push('/login'))}
          className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors py-2 mt-4"
        >
          <ArrowLeft size={18} />
          Back to Sign In
        </button>
      </form>
    </AuthLayout>
  );
};
