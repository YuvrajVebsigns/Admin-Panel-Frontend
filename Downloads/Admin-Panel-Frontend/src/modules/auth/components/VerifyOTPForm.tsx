// 'use client';

// import React, { useState, useRef, useEffect } from 'react';
// import { Loader2, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { useAuth } from '@/hooks/useAuth';

// interface VerifyOTPFormProps {
//   onBackToLogin?: () => void;
// }

// export const VerifyOTPForm: React.FC<VerifyOTPFormProps> = ({ onBackToLogin }) => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const email = searchParams.get('email') || '';
//   const { verifyOTP, forgotPassword, isVerifyingOTP, isSubmittingForgot } = useAuth();

//   const [otp, setOtp] = useState(['', '', '', '', '', '']);
//   const [error, setError] = useState<string | null>(null);
//   const [timer, setTimer] = useState(60);

//   const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

//   useEffect(() => {
//     if (timer > 0) {
//       const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
//       return () => clearInterval(interval);
//     }
//   }, [timer]);

//   const handleChange = (index: number, value: string) => {
//     if (!/^\d*$/.test(value)) return;

//     const newOtp = [...otp];
//     newOtp[index] = value.slice(-1);
//     setOtp(newOtp);

//     if (value && index < 5) {
//       inputRefs.current[index + 1]?.focus();
//     }
//   };

//   const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Backspace' && !otp[index] && index > 0) {
//       inputRefs.current[index - 1]?.focus();
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const otpString = otp.join('');
//     if (otpString.length !== 6) {
//       setError('Please enter all 6 digits');
//       return;
//     }

//     setError(null);

//     try {
//       const response = await verifyOTP({ email, otp: otpString });
//       router.push(
//         `/reset-password?token=${response?.reset_token}&email=${encodeURIComponent(email)}`,
//       );
//     } catch (err: unknown) {
//       setError(err instanceof Error ? err.message : 'Invalid OTP code. Please try again.');
//     }
//   };

//   const handleResend = async () => {
//     if (timer > 0) return;

//     try {
//       await forgotPassword(email);
//       setTimer(60);
//       setOtp(['', '', '', '', '', '']);
//       inputRefs.current[0]?.focus();
//     } catch (err: unknown) {
//       setError(err instanceof Error ? err.message : 'Failed to resend OTP');
//     }
//   };

//   return (
//     <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
//       <div>
//         <div className="mb-5 sm:mb-8">
//           <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
//             Verify Identity
//           </h1>
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             Security verification required.
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-8">
//           <div className="space-y-3 text-center mb-4">
//             <p className="text-slate-400 text-sm">
//               We&apos;ve sent a 6-digit code to{' '}
//               <span className="text-white font-semibold">{email}</span>
//             </p>
//           </div>

//           <div className="flex justify-between gap-2 sm:gap-3">
//             {otp.map((digit, index) => (
//               <input
//                 key={index}
//                 ref={(el) => {
//                   inputRefs.current[index] = el;
//                 }}
//                 type="text"
//                 maxLength={1}
//                 value={digit}
//                 onChange={(e) => handleChange(index, e.target.value)}
//                 onKeyDown={(e) => handleKeyDown(index, e)}
//                 className="w-full h-14 sm:h-16 text-center text-2xl font-bold bg-slate-800/40 border border-white/5 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-inner"
//               />
//             ))}
//           </div>

//           {error && (
//             <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
//               <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
//               <p className="text-sm text-red-500 leading-tight">{error}</p>
//             </div>
//           )}

//           <div className="space-y-4">
//             <button
//               type="submit"
//               disabled={isVerifyingOTP || otp.some((d) => d === '')}
//               className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-4 rounded-2xl shadow-[0_8px_24px_-8px_rgba(79,70,229,0.5)] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-lg tracking-wide"
//             >
//               {isVerifyingOTP ? (
//                 <>
//                   <Loader2 size={22} className="animate-spin" />
//                   Verifying...
//                 </>
//               ) : (
//                 <>
//                   <ShieldCheck size={22} />
//                   Verify Code
//                 </>
//               )}
//             </button>

//             <div className="text-center">
//               <button
//                 type="button"
//                 onClick={handleResend}
//                 disabled={timer > 0 || isSubmittingForgot}
//                 className="text-sm font-semibold text-primary-400 hover:text-primary-300 disabled:text-slate-500 transition-colors"
//               >
//                 {timer > 0
//                   ? `Resend code in ${timer}s`
//                   : isSubmittingForgot
//                     ? 'Sending...'
//                     : 'Resend OTP Code'}
//               </button>
//             </div>
//           </div>

//           <button
//             type="button"
//             onClick={() => (onBackToLogin ? onBackToLogin() : router.push('/login'))}
//             className="w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-300 transition-colors py-2"
//           >
//             <ArrowLeft size={18} />
//             Back to Sign In
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };



'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface VerifyOTPFormProps {
  onBackToLogin?: () => void;
}

export const VerifyOTPForm: React.FC<VerifyOTPFormProps> = ({ onBackToLogin }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const { verifyOTP, forgotPassword, isVerifyingOTP, isSubmittingForgot } = useAuth();

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string): void => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
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
        `/reset-password?token=${response?.reset_token}&email=${encodeURIComponent(email)}`
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid OTP code. Please try again.');
    }
  };

  const handleResend = async (): Promise<void> => {
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
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black">Verify Identity</h1>
          <p className="text-gray-600 mt-2">
            Enter the 6-digit code sent to
          </p>
          <p className="text-red-600 font-medium text-sm mt-1">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2">
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
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            ))}
          </div>

          {error !== null && (
            <div className="flex items-start gap-2 p-3 bg-red-100 border border-red-300 rounded-xl">
              <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600 leading-tight">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifyingOTP || otp.some((digit) => digit === '')}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-red-600"
          >
            {isVerifyingOTP ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                Verify Code
              </>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={timer > 0 || isSubmittingForgot}
              className="text-sm font-medium text-red-600 hover:text-red-700 disabled:text-gray-400"
            >
              {timer > 0
                ? `Resend code in ${timer}s`
                : isSubmittingForgot
                ? 'Sending...'
                : 'Resend OTP Code'}
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              onBackToLogin !== undefined ? onBackToLogin() : router.push('/login')
            }
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </button>
        </form>
      </div>
    </div>
  );
};