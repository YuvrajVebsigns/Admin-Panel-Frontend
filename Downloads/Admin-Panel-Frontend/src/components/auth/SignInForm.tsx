// 'use client';
// import Checkbox from '@/components/form/input/Checkbox';
// import Input from '@/components/form/input/InputField';
// import Label from '@/components/form/Label';
// import Button from '@/components/ui/button/Button';
// import { EyeCloseIcon, EyeIcon } from '@/icons';
// import Link from 'next/link';
// import React, { useState } from 'react';
// import { useAuth } from '@/hooks/useAuth';
// import { useRouter, useSearchParams } from 'next/navigation';

// export default function SignInForm() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { login, isLoggingIn } = useAuth();

//   const [showPassword, setShowPassword] = useState(false);
//   const [isChecked, setIsChecked] = useState(false);
//   const [email, setEmail] = useState(searchParams.get('email') || '');
//   const [password, setPassword] = useState('');
//   const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

//   const validate = () => {
//     const newErrors: typeof errors = {};

//     if (!email) {
//       newErrors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(email)) {
//       newErrors.email = 'Email is invalid';
//     }

//     if (!password) {
//       newErrors.password = 'Password is required';
//     } else if (password.length < 6) {
//       newErrors.password = 'Password must be at least 6 characters';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrors({});

//     if (!validate()) return;

//     try {
//       await login({ email, password });
//       router.push('/'); // Redirect to dashboard on success
//     } catch (error: unknown) {
//       setErrors({
//         general:
//           error instanceof Error ? error.message : 'Login failed. Please check your credentials.',
//       });
//     }
//   };

//   return (
//     <div className="flex flex-col flex-1 lg:w-1/2 w-full">
//       <div className="w-full max-w-md sm:pt-10 mx-auto mb-5"></div>
//       <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
//         <div>
//           <div className="mb-5 sm:mb-8">
//             <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
//               Sign In
//             </h1>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Enter your email and password to sign in!
//             </p>
//           </div>
//           <div>
//             <form onSubmit={handleSubmit}>
//               <div className="space-y-6">
//                 {errors.general && (
//                   <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
//                     {errors.general}
//                   </div>
//                 )}
//                 <div>
//                   <Label>
//                     Email <span className="text-error-500">*</span>{' '}
//                   </Label>
//                   <Input
//                     placeholder="info@gmail.com"
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     error={!!errors.email}
//                     hint={errors.email}
//                     autoComplete="username"
//                   />
//                 </div>
//                 <div>
//                   <Label>
//                     Password <span className="text-error-500">*</span>{' '}
//                   </Label>
//                   <div className="relative">
//                     <Input
//                       type={showPassword ? 'text' : 'password'}
//                       placeholder="Enter your password"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       error={!!errors.password}
//                       hint={errors.password}
//                       autoComplete="current-password"
//                     />
//                     <span
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
//                     >
//                       {showPassword ? (
//                         <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
//                       ) : (
//                         <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
//                       )}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <Checkbox checked={isChecked} onChange={setIsChecked} />
//                     <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
//                       Keep me logged in
//                     </span>
//                   </div>
//                   <Link
//                     href="/forgetpassword"
//                     className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
//                   >
//                     Forgot password?
//                   </Link>
//                 </div>
//                 <div>
//                   <Button className="w-full" size="sm" disabled={isLoggingIn}>
//                     {isLoggingIn ? 'Signing in...' : 'Sign in'}
//                   </Button>
//                 </div>
//               </div>
//             </form>

//             <div className="mt-5">
//               <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
//                 Don&apos;t have an account? {''}
//                 <Link
//                   href="/signup"
//                   className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
//                 >
//                   Sign Up
//                 </Link>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface SignInErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function SignInForm() {
  const router = useRouter();
  const { login, isLoggingIn } = useAuth();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<SignInErrors>({});

  const validate = (): boolean => {
    const newErrors: SignInErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setErrors({});
      await login({ email, password });
      router.push('/');
    } catch (error: unknown) {
      setErrors({
        general:
          error instanceof Error ? error.message : 'Login failed. Please check your credentials.',
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-stone-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black">Sign In</h1>
          <p className="text-gray-600 mt-2">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.general && (
            <div className="bg-red-100 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-300">
              {errors.general}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-black mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-red-600"
              />
              Remember me
            </label>
            {/* <Link href="/forgetpassword" className="text-red-600 hover:text-red-700 font-medium">
              Forgot Password?
            </Link> */}
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* <p className="text-center text-sm text-gray-600 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-red-600 font-semibold hover:text-red-700">
            Sign Up
          </Link>
        </p> */}
      </div>
    </div>
  );
}