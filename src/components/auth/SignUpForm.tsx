'use client';
import Checkbox from '@/components/form/input/Checkbox';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { EyeCloseIcon, EyeIcon } from '@/icons';
import Link from 'next/link';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

import { AuthLayout } from '@/modules/auth/components/AuthLayout';

export default function SignUpForm() {
  const { signup, isSigningUp } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    fname?: string;
    lname?: string;
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!fname) newErrors.fname = 'First name is required';
    if (!lname) newErrors.lname = 'Last name is required';

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isChecked) {
      newErrors.general = 'You must agree to the Terms and Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        general: error instanceof Error ? error.message : 'Signup failed. Please try again later.',
      });
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout>
        <div className="flex flex-col justify-center w-full mx-auto text-center space-y-6 pt-2 pb-6">
          <div className="h-24 w-24 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto shadow-[0_0_40px_rgba(34,197,94,0.15)] mb-2">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Account Created!
            </h2>
            <p className="text-base font-medium text-gray-500 dark:text-gray-400 max-w-[300px] mx-auto leading-relaxed">
              Your account has been successfully created. You can now sign in to your dashboard.
            </p>
          </div>
          <div className="pt-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-4 text-base font-bold text-white transition rounded-xl bg-brand-500 hover:bg-brand-600 shadow-lg shadow-brand-500/20 w-full active:scale-[0.98]"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Sign Up" subtitle="Enter your details to create an account">
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-1 space-y-2">
            <Label htmlFor="fname">
              First Name<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              type="text"
              id="fname"
              name="fname"
              placeholder="First name"
              value={fname}
              onChange={(e) => setFname(e.target.value)}
              error={!!errors.fname}
              hint={errors.fname}
              className="bg-gray-50 dark:bg-navy-900/50 border-gray-100 dark:border-navy-700 focus:bg-white transition-all rounded-xl"
            />
          </div>
          <div className="sm:col-span-1 space-y-2">
            <Label htmlFor="lname">
              Last Name<span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              type="text"
              id="lname"
              name="lname"
              placeholder="Last name"
              value={lname}
              onChange={(e) => setLname(e.target.value)}
              error={!!errors.lname}
              hint={errors.lname}
              className="bg-gray-50 dark:bg-navy-900/50 border-gray-100 dark:border-navy-700 focus:bg-white transition-all rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email Address<span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            hint={errors.email}
            autoComplete="email"
            className="bg-gray-50 dark:bg-navy-900/50 border-gray-100 dark:border-navy-700 focus:bg-white transition-all rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">
            Password<span className="text-red-500 ml-1">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              hint={errors.password}
              autoComplete="new-password"
              className="bg-gray-50 dark:bg-navy-900/50 border-gray-100 dark:border-navy-700 focus:bg-white transition-all rounded-xl pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10"
            >
              {showPassword ? (
                <EyeIcon className="w-5 h-5 fill-current" />
              ) : (
                <EyeCloseIcon className="w-5 h-5 fill-current" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Checkbox checked={isChecked} onChange={setIsChecked} />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            By creating an account, you agree to the{' '}
            <span className="text-gray-900 dark:text-white font-semibold">
              Terms and Conditions
            </span>{' '}
            and our{' '}
            <span className="text-gray-900 dark:text-white font-semibold">Privacy Policy</span>.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSigningUp}
          className="w-full py-4 text-base font-bold text-white transition-all rounded-xl bg-brand-500 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 hover:bg-brand-600 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSigningUp ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-8 pt-8 border-t border-gray-50 dark:border-navy-700/50 text-center">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-bold transition-colors ml-1"
          >
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
