// 'use client';
// import Checkbox from '@/components/form/input/Checkbox';
// import Input from '@/components/form/input/InputField';
// import Label from '@/components/form/Label';
// import { EyeCloseIcon, EyeIcon } from '@/icons';
// import Link from 'next/link';
// import React, { useState } from 'react';
// import { useAuth } from '@/hooks/useAuth';

// export default function SignUpForm() {
//   const { signup, isSigningUp } = useAuth();

//   const [showPassword, setShowPassword] = useState(false);
//   const [isChecked, setIsChecked] = useState(false);
//   const [fname, setFname] = useState('');
//   const [lname, setLname] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [errors, setErrors] = useState<{
//     fname?: string;
//     lname?: string;
//     email?: string;
//     password?: string;
//     general?: string;
//   }>({});
//   const [isSuccess, setIsSuccess] = useState(false);

//   const validate = () => {
//     const newErrors: typeof errors = {};

//     if (!fname) newErrors.fname = 'First name is required';
//     if (!lname) newErrors.lname = 'Last name is required';

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

//     if (!isChecked) {
//       newErrors.general = 'You must agree to the Terms and Conditions';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrors({});

//     if (!validate()) return;

//     try {
//       await signup({
//         email,
//         password,
//         fullName: `${fname} ${lname}`.trim(),
//         acceptTerms: isChecked,
//       });
//       setIsSuccess(true);
//     } catch (error: unknown) {
//       setErrors({
//         general: error instanceof Error ? error.message : 'Signup failed. Please try again later.',
//       });
//     }
//   };

//   if (isSuccess) {
//     return (
//       <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
//         <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto text-center space-y-6">
//           <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto">
//             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M5 13l4 4L19 7"
//               />
//             </svg>
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Account Created!</h2>
//           <p className="text-gray-500 dark:text-gray-400">
//             Your account has been successfully created. You can now sign in.
//           </p>
//           <Link
//             href="/login"
//             className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 hover:bg-brand-600"
//           >
//             Go to Sign In
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
//       <div className="w-full max-w-md sm:pt-10 mx-auto mb-5"></div>
//       <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
//         <div>
//           <div className="mb-5 sm:mb-8">
//             <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
//               Sign Up
//             </h1>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Enter your email and password to sign up!
//             </p>
//           </div>
//           <div>
//             <form onSubmit={handleSubmit}>
//               <div className="space-y-5">
//                 {errors.general && (
//                   <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
//                     {errors.general}
//                   </div>
//                 )}
//                 <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
//                   <div className="sm:col-span-1">
//                     <Label>
//                       First Name<span className="text-error-500">*</span>
//                     </Label>
//                     <Input
//                       type="text"
//                       id="fname"
//                       name="fname"
//                       placeholder="Enter your first name"
//                       value={fname}
//                       onChange={(e) => setFname(e.target.value)}
//                       error={!!errors.fname}
//                       hint={errors.fname}
//                     />
//                   </div>
//                   <div className="sm:col-span-1">
//                     <Label>
//                       Last Name<span className="text-error-500">*</span>
//                     </Label>
//                     <Input
//                       type="text"
//                       id="lname"
//                       name="lname"
//                       placeholder="Enter your last name"
//                       value={lname}
//                       onChange={(e) => setLname(e.target.value)}
//                       error={!!errors.lname}
//                       hint={errors.lname}
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <Label>
//                     Email<span className="text-error-500">*</span>
//                   </Label>
//                   <Input
//                     type="email"
//                     id="email"
//                     name="email"
//                     placeholder="Enter your email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     error={!!errors.email}
//                     hint={errors.email}
//                     autoComplete="email"
//                   />
//                 </div>
//                 <div>
//                   <Label>
//                     Password<span className="text-error-500">*</span>
//                   </Label>
//                   <div className="relative">
//                     <Input
//                       placeholder="Enter your password"
//                       type={showPassword ? 'text' : 'password'}
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       error={!!errors.password}
//                       hint={errors.password}
//                       autoComplete="new-password"
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
//                 <div className="flex items-center gap-3">
//                   <Checkbox className="w-5 h-5" checked={isChecked} onChange={setIsChecked} />
//                   <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
//                     By creating an account means you agree to the{' '}
//                     <span className="text-gray-800 dark:text-white/90">Terms and Conditions,</span>{' '}
//                     and our <span className="text-gray-800 dark:text-white">Privacy Policy</span>
//                   </p>
//                 </div>
//                 <div>
//                   <button
//                     type="submit"
//                     disabled={isSigningUp}
//                     className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-70"
//                   >
//                     {isSigningUp ? 'Creating account...' : 'Sign Up'}
//                   </button>
//                 </div>
//               </div>
//             </form>

//             <div className="mt-5">
//               <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
//                 Already have an account?
//                 <Link
//                   href="/login"
//                   className="text-brand-500 hover:text-brand-600 dark:text-brand-400 ml-1"
//                 >
//                   Sign In
//                 </Link>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




// 'use client';
// import Checkbox from '@/components/form/input/Checkbox';
// import Input from '@/components/form/input/InputField';
// import Label from '@/components/form/Label';
// import { EyeCloseIcon, EyeIcon } from '@/icons';
// import Link from 'next/link';
// import React, { useState } from 'react';
// import { useAuth } from '@/hooks/useAuth';

// export default function SignUpForm() {
//   const { signup, isSigningUp } = useAuth();

//   const [showPassword, setShowPassword] = useState(false);
//   const [isChecked, setIsChecked] = useState(false);
//   const [fname, setFname] = useState('');
//   const [lname, setLname] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [errors, setErrors] = useState<{
//     fname?: string;
//     lname?: string;
//     email?: string;
//     password?: string;
//     general?: string;
//   }>({});
//   const [isSuccess, setIsSuccess] = useState(false);

//   const validate = () => {
//     const newErrors: typeof errors = {};

//     if (!fname) newErrors.fname = 'First name is required';
//     if (!lname) newErrors.lname = 'Last name is required';

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

//     if (!isChecked) {
//       newErrors.general = 'You must agree to the Terms and Conditions';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrors({});

//     if (!validate()) return;

//     try {
//       await signup({
//         email,
//         password,
//         fullName: `${fname} ${lname}`.trim(),
//         acceptTerms: isChecked,
//       });
//       setIsSuccess(true);
//     } catch (error: unknown) {
//       setErrors({
//         general: error instanceof Error ? error.message : 'Signup failed. Please try again later.',
//       });
//     }
//   };

//   if (isSuccess) {
//     return (
//       <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
//         <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto text-center space-y-6">
//           <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto">
//             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M5 13l4 4L19 7"
//               />
//             </svg>
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Account Created!</h2>
//           <p className="text-gray-500 dark:text-gray-400">
//             Your account has been successfully created. You can now sign in.
//           </p>
//           <Link
//             href="/login"
//             className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 hover:bg-brand-600"
//           >
//             Go to Sign In
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
//       <div className="w-full max-w-md sm:pt-10 mx-auto mb-5"></div>
//       <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
//         <div>
//           <div className="mb-5 sm:mb-8">
//             <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
//               Sign Up
//             </h1>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Enter your email and password to sign up!
//             </p>
//           </div>
//           <div>
//             <form onSubmit={handleSubmit}>
//               <div className="space-y-5">
//                 {errors.general && (
//                   <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
//                     {errors.general}
//                   </div>
//                 )}
//                 <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
//                   <div className="sm:col-span-1">
//                     <Label>
//                       First Name<span className="text-error-500">*</span>
//                     </Label>
//                     <Input
//                       type="text"
//                       id="fname"
//                       name="fname"
//                       placeholder="Enter your first name"
//                       value={fname}
//                       onChange={(e) => setFname(e.target.value)}
//                       error={!!errors.fname}
//                       hint={errors.fname}
//                     />
//                   </div>
//                   <div className="sm:col-span-1">
//                     <Label>
//                       Last Name<span className="text-error-500">*</span>
//                     </Label>
//                     <Input
//                       type="text"
//                       id="lname"
//                       name="lname"
//                       placeholder="Enter your last name"
//                       value={lname}
//                       onChange={(e) => setLname(e.target.value)}
//                       error={!!errors.lname}
//                       hint={errors.lname}
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <Label>
//                     Email<span className="text-error-500">*</span>
//                   </Label>
//                   <Input
//                     type="email"
//                     id="email"
//                     name="email"
//                     placeholder="Enter your email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     error={!!errors.email}
//                     hint={errors.email}
//                     autoComplete="email"
//                   />
//                 </div>
//                 <div>
//                   <Label>
//                     Password<span className="text-error-500">*</span>
//                   </Label>
//                   <div className="relative">
//                     <Input
//                       placeholder="Enter your password"
//                       type={showPassword ? 'text' : 'password'}
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       error={!!errors.password}
//                       hint={errors.password}
//                       autoComplete="new-password"
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
//                 <div className="flex items-center gap-3">
//                   <Checkbox className="w-5 h-5" checked={isChecked} onChange={setIsChecked} />
//                   <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
//                     By creating an account means you agree to the{' '}
//                     <span className="text-gray-800 dark:text-white/90">Terms and Conditions,</span>{' '}
//                     and our <span className="text-gray-800 dark:text-white">Privacy Policy</span>
//                   </p>
//                 </div>
//                 <div>
//                   <button
//                     type="submit"
//                     disabled={isSigningUp}
//                     className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-70"
//                   >
//                     {isSigningUp ? 'Creating account...' : 'Sign Up'}
//                   </button>
//                 </div>
//               </div>
//             </form>

//             <div className="mt-5">
//               <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
//                 Already have an account?
//                 <Link
//                   href="/login"
//                   className="text-brand-500 hover:text-brand-600 dark:text-brand-400 ml-1"
//                 >
//                   Sign In
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
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SignUpErrors {
  fname?: string;
  lname?: string;
  email?: string;
  password?: string;
  general?: string;
}

export default function SignUpForm() {
  const { signup, isSigningUp } = useAuth();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [fname, setFname] = useState<string>('');
  const [lname, setLname] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errors, setErrors] = useState<SignUpErrors>({});

  const validate = (): boolean => {
    const newErrors: SignUpErrors = {};

    if (!fname) newErrors.fname = 'First name is required';
    if (!lname) newErrors.lname = 'Last name is required';

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

    if (!isChecked) {
      newErrors.general = 'You must agree to Terms and Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    try {
      await signup({
        email,
        password,
        fullName: `${fname} ${lname}`.trim(),
        acceptTerms: isChecked,
      });

      setIsSuccess(true);
    } catch (error: unknown) {
      setErrors({
        general: error instanceof Error ? error.message : 'Signup failed. Please try again.',
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={60} />
          <h2 className="text-3xl font-bold text-black mb-3">Account Created!</h2>
          <p className="text-gray-600 mb-6">
            Your account has been successfully created. You can now sign in.
          </p>
          <Link
            href="/login"
            className="inline-flex justify-center items-center w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-all duration-300"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-stone-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black">Create Account</h1>
          <p className="text-gray-600 mt-2">Enter your details to create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.general && (
            <div className="bg-red-100 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-300">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="First Name"
                value={fname}
                onChange={(e) => setFname(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.fname ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
              {errors.fname && <p className="text-red-500 text-sm mt-1">{errors.fname}</p>}
            </div>

            <div>
              <input
                type="text"
                placeholder="Last Name"
                value={lname}
                onChange={(e) => setLname(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.lname ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-red-500`}
              />
              {errors.lname && <p className="text-red-500 text-sm mt-1">{errors.lname}</p>}
            </div>
          </div>

          <div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-red-500`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <label className="flex items-start gap-3 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-1 accent-red-600"
            />
            <span>
              I agree to the <span className="text-black font-medium">Terms and Conditions</span>{' '}
              and <span className="text-black font-medium">Privacy Policy</span>
            </span>
          </label>

          <button
            type="submit"
            disabled={isSigningUp}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300 flex justify-center items-center gap-2 disabled:bg-red-400"
          >
            {isSigningUp ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Creating Account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-red-600 font-semibold hover:text-red-700">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}