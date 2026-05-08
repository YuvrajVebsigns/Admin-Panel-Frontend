'use client';

import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { EyeCloseIcon, EyeIcon } from '@/icons';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';

import { AuthLayout } from '@/modules/auth/components/AuthLayout';

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoggingIn } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  // ... (useEffect and validation stay the same)
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

      router.push('/');
    } catch (error: unknown) {
      setErrors({
        general:
          error instanceof Error ? error.message : 'Login failed. Please check your credentials.',
      });
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your administration dashboard">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {errors.general && (
            <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              {errors.general}
            </div>
          )}

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
              className="bg-gray-50 dark:bg-navy-900/50 border-gray-100 dark:border-navy-700 focus:bg-white transition-all rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {/* <Link
                href="/forgetpassword"
                className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors"
              >
                Forgot password?
              </Link> */}
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

          {/* <div className="flex items-center">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isChecked}
                onChange={(checked) => {
                  setIsChecked(checked);
                  if (!checked) {
                    localStorage.removeItem('rememberMe');
                  }
                }}
              />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 select-none">
                Remember me for 30 days
              </span>
            </div>
          </div> */}

          <Button
            className="w-full py-4 text-base font-bold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-all rounded-xl"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'Signing in...' : 'Sign In to Dashboard'}
          </Button>
        </div>
      </form>

      {/* <div className="mt-8 pt-8 border-t border-gray-50 dark:border-navy-700/50 text-center">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Don&apos;t have an account yet? {''}
          <Link
            href="/signup"
            className="text-brand-500 hover:text-brand-700 dark:hover:text-brand-400 font-bold transition-colors"
          >
            Contact Administrator
          </Link>
        </p>
      </div> */}
    </AuthLayout>
  );
}
