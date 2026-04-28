'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, Loader2 } from 'lucide-react';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2.5">
        <label className="text-sm font-semibold text-slate-200 ml-1">Full Name</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
            <User size={20} />
          </div>
          <input
            type="text"
            placeholder="John Doe"
            required
            className="block w-full pl-12 pr-4 py-3.5 bg-slate-800/40 border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-base shadow-inner"
          />
        </div>
      </div>

      <div className="space-y-2.5">
        <label className="text-sm font-semibold text-slate-200 ml-1">Email Address</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
            <Mail size={20} />
          </div>
          <input
            type="email"
            placeholder="name@company.com"
            required
            className="block w-full pl-12 pr-4 py-3.5 bg-slate-800/40 border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-base shadow-inner"
          />
        </div>
      </div>

      <div className="space-y-2.5">
        <label className="text-sm font-semibold text-slate-200 ml-1">Password</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary-400 transition-colors">
            <Lock size={20} />
          </div>
          <input
            type="password"
            placeholder="••••••••"
            required
            className="block w-full pl-12 pr-4 py-3.5 bg-slate-800/40 border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-base shadow-inner"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-4 rounded-2xl shadow-[0_8px_24px_-8px_rgba(79,70,229,0.5)] transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-lg tracking-wide"
      >
        {isLoading ? (
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
