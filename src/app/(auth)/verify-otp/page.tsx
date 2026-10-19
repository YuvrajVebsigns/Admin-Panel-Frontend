import { Metadata } from 'next';
import VerifyOTPForm from '@/components/auth/VerifyOTPForm';
import { AuthLoading } from '@/components/auth/AuthWorkspace';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Verify OTP | Core Media Admin',
  description: 'Enter the verification code sent to your email.',
};

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <VerifyOTPForm />
    </Suspense>
  );
}
