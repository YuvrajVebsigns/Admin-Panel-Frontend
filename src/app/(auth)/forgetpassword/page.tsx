import { Metadata } from 'next';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password | Core Media Admin',
  description: 'Reset your Core Media Admin password.',
};

export default function ForgetPasswordPage() {
  return <ForgotPasswordForm />;
}
