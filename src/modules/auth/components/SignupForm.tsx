'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const { signup, isSigningUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    acceptTerms?: string;
    general?: string;
  }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!fullName) {
      newErrors.fullName = 'Full Name is required';
    }

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

    if (!acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    try {
      await signup({ email, password, fullName, acceptTerms });
      setIsSuccess(true);
      // Wait a bit then switch to login
      setTimeout(() => {
        onSwitchToLogin();
      }, 3000);
    } catch (error: unknown) {
      setErrors({
        general: error instanceof Error ? error.message : 'Signup failed. Please try again later.',
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 py-8">
        <div className="flex justify-center">
          <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
            <CheckCircle size={40} />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Created!</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Your account has been successfully created. Redirecting to login...
          </p>
        </div>
        <button onClick={onSwitchToLogin} className="text-brand-500 font-bold hover:underline">
          Click here if you are not redirected
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="p-4 bg-brand-500/10 border border-brand-500/20 rounded-2xl flex items-center gap-3 text-brand-500 text-sm">
          <AlertCircle size={18} />
          <p>{errors.general}</p>
        </div>
      )}

      <div className="space-y-2.5">
        <label
          htmlFor="full-name"
          className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1"
        >
          Full Name
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
            <User size={20} />
          </div>
          <input
            id="full-name"
            name="name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            placeholder="John Doe"
            required
            className={`block w-full pl-12 pr-4 py-3.5 bg-white dark:bg-navy-800 border ${
              errors.fullName ? 'border-brand-500/50' : 'border-gray-200 dark:border-navy-700'
            } rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-base shadow-sm`}
          />
        </div>
        {errors.fullName && <p className="text-xs text-brand-500 ml-1">{errors.fullName}</p>}
      </div>

      <div className="space-y-2.5">
        <label
          htmlFor="email"
          className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1"
        >
          Email Address
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
            <Mail size={20} />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="name@company.com"
            required
            className={`block w-full pl-12 pr-4 py-3.5 bg-white dark:bg-navy-800 border ${
              errors.email ? 'border-brand-500/50' : 'border-gray-200 dark:border-navy-700'
            } rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-base shadow-sm`}
          />
        </div>
        {errors.email && <p className="text-xs text-brand-500 ml-1">{errors.email}</p>}
      </div>

      <div className="space-y-2.5">
        <label
          htmlFor="password"
          className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1"
        >
          Password
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
            <Lock size={20} />
          </div>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••"
            required
            className={`block w-full pl-12 pr-4 py-3.5 bg-white dark:bg-navy-800 border ${
              errors.password ? 'border-brand-500/50' : 'border-gray-200 dark:border-navy-700'
            } rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-base shadow-sm`}
          />
        </div>
        {errors.password && <p className="text-xs text-brand-500 ml-1">{errors.password}</p>}
      </div>

      <div className="flex items-start gap-3 px-1">
        <div className="flex items-center h-5">
          <input
            id="terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 dark:border-navy-700 bg-white dark:bg-navy-800 accent-brand-500 focus:ring-brand-500/20 transition-all cursor-pointer"
          />
        </div>
        <div className="text-sm">
          <label htmlFor="terms" className="text-gray-500 dark:text-gray-400">
            I agree to the{' '}
            <button type="button" className="text-brand-500 hover:underline">
              Terms of Service
            </button>{' '}
            and{' '}
            <button type="button" className="text-brand-500 hover:underline">
              Privacy Policy
            </button>
          </label>
          {errors.acceptTerms && (
            <p className="text-xs text-brand-500 mt-1">{errors.acceptTerms}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSigningUp}
        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-lg tracking-wide"
      >
        {isSigningUp ? (
          <>
            <Loader2 size={22} className="animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </button>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-10">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-bold text-brand-500 hover:text-brand-600 transition-colors decoration-brand-500/30 underline-offset-4 hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
};
