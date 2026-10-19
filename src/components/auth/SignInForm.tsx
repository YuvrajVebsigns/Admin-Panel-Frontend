'use client';

import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { EyeCloseIcon, EyeIcon } from '@/icons';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AuthWorkspace,
  AuthError,
  authButtonClassName,
  authInputClassName,
  authLinkClassName,
} from './AuthWorkspace';

export default function SignInForm() {
  const searchParams = useSearchParams();
  const { login, isLoggingIn } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  React.useEffect(() => {
    const savedData = localStorage.getItem('rememberMe');
    if (savedData) {
      const {
        email: savedEmail,
        password: savedPassword,
        isChecked: savedIsChecked,
      } = JSON.parse(savedData);
      if (savedIsChecked) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setIsChecked(true);
      }
    }
  }, []);

  const validate = () => {
    const newErrors: typeof errors = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    try {
      await login({ email, password });

      if (isChecked) {
        localStorage.setItem('rememberMe', JSON.stringify({ email, password, isChecked: true }));
      } else {
        localStorage.removeItem('rememberMe');
      }

      window.location.replace('/');
    } catch (error: unknown) {
      setErrors({
        general:
          error instanceof Error ? error.message : 'Login failed. Please check your credentials.',
      });
    }
  };

  return (
    <AuthWorkspace title="Welcome back" subtitle="Sign in to manage your Core Media workspace.">
      <form onSubmit={handleSubmit} aria-busy={isLoggingIn}>
        <div className="space-y-5">
          {errors.general && <AuthError>{errors.general}</AuthError>}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              hint={errors.email}
              autoComplete="username"
              aria-invalid={!!errors.email}
              className={authInputClassName}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                hint={errors.password}
                autoComplete="current-password"
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

          <Button className={authButtonClassName} disabled={isLoggingIn}>
            {isLoggingIn ? 'Signing in…' : 'Sign in'}
          </Button>
        </div>
      </form>

      <div className="mt-5 border-t border-gray-100 pt-4 dark:border-navy-700">
        <Link href="/forgetpassword" className={authLinkClassName}>
          Forgot your password?
        </Link>
        <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          Use the account provided by your administrator.
        </p>
      </div>
    </AuthWorkspace>
  );
}
