import { Metadata } from 'next';
import { ResetPasswordForm } from '@/modules/auth/components/ResetPasswordForm';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Reset Password | Core Media Admin',
  description: 'Create a new password for your account.',
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
