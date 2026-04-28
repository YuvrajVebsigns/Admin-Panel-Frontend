import { Metadata } from 'next';
import { ResetPasswordForm } from '@/modules/auth/components/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password | Core Media Admin',
  description: 'Create a new password for your account.',
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
