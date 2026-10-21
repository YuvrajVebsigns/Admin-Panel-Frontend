import { Metadata } from 'next';
import { VerifyOTPForm } from '@/modules/auth/components/VerifyOTPForm';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Verify OTP | Core Media Admin',
  description: 'Enter the verification code sent to your email.',
};

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOTPForm />
    </Suspense>
  );
}
