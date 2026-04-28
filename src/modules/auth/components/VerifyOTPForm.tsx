'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/auth.service';

interface VerifyOTPFormProps {
  onBackToLogin?: () => void;
}

export const VerifyOTPForm: React.FC<VerifyOTPFormProps> = ({ onBackToLogin }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
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

    setIsLoading(true);
    setError(null);

    try {
      // For demonstration, using a mock success if API fails or isn't ready
      // In production, this would call authService.verifyOTP
      // const { token } = await authService.verifyOTP(email, otpString);

      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock success token
      const mockToken = 'mock-reset-token';
      router.push(`/reset-password?token=${mockToken}&email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid OTP code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
      <div>
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Verify Identity
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Security verification required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3 text-center mb-4">
            <p className="text-slate-400 text-sm">
              We&apos;ve sent a 6-digit code to{' '}
              <span className="text-white font-semibold">{email}</span>
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
                className="w-full h-14 sm:h-16 text-center text-2xl font-bold bg-slate-800/40 border border-white/5 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-inner"
              />
            ))}
          </div>

          {error && <p className="text-rose-500 text-sm text-center font-medium">{error}</p>}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isLoading || otp.some((d) => d === '')}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-4 rounded-2xl shadow-[0_8px_24px_-8px_rgba(79,70,229,0.5)] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-lg tracking-wide"
            >
              {isLoading ? (
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
                disabled={timer > 0 || isLoading}
                className="text-sm font-semibold text-primary-400 hover:text-primary-300 disabled:text-slate-500 transition-colors"
              >
                {timer > 0 ? `Resend code in ${timer}s` : 'Resend OTP Code'}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => (onBackToLogin ? onBackToLogin() : router.push('/login'))}
            className="w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-300 transition-colors py-2"
          >
            <ArrowLeft size={18} />
            Back to Sign In
          </button>
        </form>
      </div>
    </div>
  );
};
