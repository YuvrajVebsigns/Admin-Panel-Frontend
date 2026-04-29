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
          <h2 className="text-2xl font-bold text-white">Account Created!</h2>
          <p className="text-slate-400">
            Your account has been successfully created. Redirecting to login...
          </p>
        </div>
        <button onClick={onSwitchToLogin} className="text-primary-400 font-bold hover:underline">
          Click here if you are not redirected
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm">
          <AlertCircle size={18} />
          <p>{errors.general}</p>
        </div>
      )}

      <div className="space-y-2.5">
        <label htmlFor="full-name" className="text-sm font-semibold text-slate-200 ml-1">
          Full Name
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
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
            className={`block w-full pl-12 pr-4 py-3.5 bg-slate-800/40 border ${
              errors.fullName ? 'border-red-500/50' : 'border-white/5'
            } rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-base shadow-inner`}
          />
        </div>
        {errors.fullName && <p className="text-xs text-red-500 ml-1">{errors.fullName}</p>}
      </div>

      <div className="space-y-2.5">
        <label htmlFor="email" className="text-sm font-semibold text-slate-200 ml-1">
          Email Address
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
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
            className={`block w-full pl-12 pr-4 py-3.5 bg-slate-800/40 border ${
              errors.email ? 'border-red-500/50' : 'border-white/5'
            } rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-base shadow-inner`}
          />
        </div>
        {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email}</p>}
      </div>

      <div className="space-y-2.5">
        <label htmlFor="password" className="text-sm font-semibold text-slate-200 ml-1">
          Password
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
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
            className={`block w-full pl-12 pr-4 py-3.5 bg-slate-800/40 border ${
              errors.password ? 'border-red-500/50' : 'border-white/5'
            } rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-base shadow-inner`}
          />
        </div>
        {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password}</p>}
      </div>

      <div className="flex items-start gap-3 px-1">
        <div className="flex items-center h-5">
          <input
            id="terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="w-4 h-4 rounded border-white/10 bg-slate-800/50 text-primary-500 focus:ring-primary-500/20 transition-all"
          />
        </div>
        <div className="text-sm">
          <label htmlFor="terms" className="text-slate-400">
            I agree to the{' '}
            <button type="button" className="text-primary-400 hover:underline">
              Terms of Service
            </button>{' '}
            and{' '}
            <button type="button" className="text-primary-400 hover:underline">
              Privacy Policy
            </button>
          </label>
          {errors.acceptTerms && <p className="text-xs text-red-500 mt-1">{errors.acceptTerms}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSigningUp}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-4 rounded-2xl shadow-[0_8px_24px_-8px_rgba(79,70,229,0.5)] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-lg tracking-wide"
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

      <p className="text-center text-sm text-slate-400 mt-10">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-bold text-primary-400 hover:text-primary-300 transition-colors decoration-primary-500/30 underline-offset-4 hover:underline"
        >
          Sign in
        </button>
      </p>
    </form>
  );
};
