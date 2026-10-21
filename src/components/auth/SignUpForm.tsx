'use client';
import Checkbox from '@/components/form/input/Checkbox';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { EyeCloseIcon, EyeIcon } from '@/icons';
import Link from 'next/link';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

import {
  AuthWorkspace,
  AuthError,
  authInputClassName,
  authButtonClassName,
  authLinkClassName,
} from './AuthWorkspace';

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
      <AuthWorkspace>
        <div className="w-full space-y-6" role="status">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400">
            <svg
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="space-y-3">
            <h1 className="font-roboto text-2xl font-semibold text-gray-900 dark:text-white">
              Account created
            </h1>
            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Your account has been successfully created. You can now sign in to your dashboard.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/login" className={authButtonClassName}>
              Go to Sign In
            </Link>
          </div>
        </div>
      </AuthWorkspace>
    );
  }

  return (
    <AuthWorkspace
      title="Create your account"
      subtitle="Enter your details to join the Core Media workspace."
    >
      <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isSigningUp}>
        {errors.general && <AuthError>{errors.general}</AuthError>}

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
              autoComplete="given-name"
              aria-invalid={!!errors.fname}
              className={authInputClassName}
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
              autoComplete="family-name"
              aria-invalid={!!errors.lname}
              className={authInputClassName}
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
            aria-invalid={!!errors.email}
            className={authInputClassName}
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
              aria-invalid={!!errors.password}
              className={`${authInputClassName} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute right-1 top-0 flex h-12 w-11 items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-gray-400 dark:hover:text-white"
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
            <Checkbox
              id="accept-terms"
              checked={isChecked}
              onChange={setIsChecked}
              className="focus-visible:ring-2 focus-visible:ring-brand-500"
            />
          </div>
          <label
            htmlFor="accept-terms"
            className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 leading-relaxed"
          >
            By creating an account, you agree to the{' '}
            <span className="text-gray-900 dark:text-white font-semibold">
              Terms and Conditions
            </span>{' '}
            and our{' '}
            <span className="text-gray-900 dark:text-white font-semibold">Privacy Policy</span>.
          </label>
        </div>

        <button type="submit" disabled={isSigningUp} className={authButtonClassName}>
          {isSigningUp ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <div className="mt-6 border-t border-gray-100 pt-4 dark:border-navy-700">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className={authLinkClassName}>
            Sign In
          </Link>
        </p>
      </div>
    </AuthWorkspace>
  );
}
