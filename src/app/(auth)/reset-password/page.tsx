import { Metadata } from 'next';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { AuthLoading } from '@/components/auth/AuthWorkspace';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Reset Password | Core Media Admin',
  description: 'Create a new password for your account.',
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
