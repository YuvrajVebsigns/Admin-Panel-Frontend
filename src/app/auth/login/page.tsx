import SignInForm from '@/components/auth/SignInForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Core Media Admin',
  description: 'Sign in to Core Media Administration Dashboard.',
};

export default function LoginPage() {
  return <SignInForm />;
}
