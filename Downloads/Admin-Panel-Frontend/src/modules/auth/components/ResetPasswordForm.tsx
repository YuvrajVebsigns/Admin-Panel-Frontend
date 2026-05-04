// 'use client';

// import React, { useState } from 'react';
// import { Lock, Loader2, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { useAuth } from '@/hooks/useAuth';

// interface ResetPasswordFormProps {
//   onBackToLogin?: () => void;
// }

// export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onBackToLogin }) => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const _token = searchParams.get('token') || '';
//   const _email = searchParams.get('email') || '';
//   const { resetPassword, isResettingPassword } = useAuth();

//   const [isSuccess, setIsSuccess] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [error, setError] = useState<string | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (password.length < 8) {
//       setError('Password must be at least 8 characters long');
//       return;
//     }

//     if (password !== confirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }

//     setError(null);

//     try {
//       await resetPassword({ token: _token, password });
//       setIsSuccess(true);
//     } catch (err: unknown) {
//       setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
//     }
//   };

//   if (isSuccess) {
//     return (
//       <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
//         <div className="text-center space-y-8 py-4">
//           <div className="flex justify-center">
//             <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
//               <CheckCircle2 size={40} />
//             </div>
//           </div>
//           <div className="space-y-3">
//             <h2 className="text-2xl font-bold text-white tracking-tight">Password Reset!</h2>
//             <p className="text-base text-slate-400 leading-relaxed">
//               Your password has been successfully updated. You can now sign in with your new
//               password.
//             </p>
//           </div>
//           <button
//             onClick={() => {
//               if (onBackToLogin) {
//                 onBackToLogin();
//               } else {
//                 router.push(`/login?email=${encodeURIComponent(_email)}`);
//               }
//             }}
//             className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)]"
//           >
//             Proceed to Login
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
//       <div>
//         <div className="mb-5 sm:mb-8">
//           <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
//             Create Password
//           </h1>
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             Secure your account with a new password.
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="space-y-2.5">
//             <label className="text-sm font-semibold text-slate-200 ml-1">New Password</label>
//             <div className="relative group">
//               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
//                 <Lock size={20} />
//               </div>
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="••••••••"
//                 required
//                 className={`block w-full pl-12 pr-12 py-3.5 bg-slate-800/40 border ${
//                   error ? 'border-red-500/50' : 'border-white/5'
//                 } rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-base shadow-inner`}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
//               >
//                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//               </button>
//             </div>
//           </div>

//           <div className="space-y-2.5">
//             <label className="text-sm font-semibold text-slate-200 ml-1">Confirm Password</label>
//             <div className="relative group">
//               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
//                 <Lock size={20} />
//               </div>
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 placeholder="••••••••"
//                 required
//                 className={`block w-full pl-12 pr-4 py-3.5 bg-slate-800/40 border ${
//                   error ? 'border-red-500/50' : 'border-white/5'
//                 } rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-base shadow-inner`}
//               />
//             </div>
//           </div>

//           {error && (
//             <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
//               <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
//               <p className="text-sm text-red-500 leading-tight">{error}</p>
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={isResettingPassword}
//             className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-4 rounded-2xl shadow-[0_8px_24px_-8px_rgba(79,70,229,0.5)] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-lg tracking-wide"
//           >
//             {isResettingPassword ? (
//               <>
//                 <Loader2 size={22} className="animate-spin" />
//                 Updating password...
//               </>
//             ) : (
//               'Set New Password'
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };





'use client';

import React, { useState } from 'react';
import { Lock, Loader2, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ResetPasswordFormProps {
  onBackToLogin?: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onBackToLogin }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token: string = searchParams.get('token') ?? '';
  const email: string = searchParams.get('email') ?? '';

  const { resetPassword, isResettingPassword } = useAuth();

  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
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
      await resetPassword({ token, password });
      setIsSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={60} />
          <h2 className="text-3xl font-bold text-black mb-3">Password Updated!</h2>
          <p className="text-gray-600 mb-6">
            Your password has been reset successfully. You can now sign in.
          </p>

          <button
            onClick={() =>
              onBackToLogin !== undefined
                ? onBackToLogin()
                : router.push(`/login?email=${encodeURIComponent(email)}`)
            }
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-all duration-300"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-black mb-2">Reset Password</h1>
          <p className="text-gray-600">Create a new secure password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-black mb-2">New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                <Lock size={18} />
              </div>

              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className={`w-full pl-11 pr-11 py-3 rounded-xl border ${
                  error !== null ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                <Lock size={18} />
              </div>

              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                  error !== null ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300`}
              />
            </div>
          </div>

          {error !== null && (
            <div className="flex items-start gap-2 p-3 bg-red-100 border border-red-300 rounded-xl">
              <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isResettingPassword}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:bg-red-400"
          >
            {isResettingPassword ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Updating Password...
              </>
            ) : (
              'Set New Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};