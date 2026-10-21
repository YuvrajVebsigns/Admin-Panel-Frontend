'use client';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { ChevronLeftIcon } from '@/icons';
import Link from 'next/link';
import React, { useState } from 'react';

export default function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to login
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Forgot Password?
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>
          {submitted ? (
            <div className="p-4 rounded-lg bg-success-50 border border-success-200 dark:bg-success-500/10 dark:border-success-500/20">
              <p className="text-sm text-success-700 dark:text-success-400">
                Reset link sent! Please check your email inbox.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
            >
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input placeholder="Enter your email" type="email" />
                </div>
                <div>
                  <Button className="w-full" size="sm">
                    Send Reset Link
                  </Button>
                </div>
              </div>
            </form>
          )}
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Remember your password?{' '}
              <Link
                href="/login"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
