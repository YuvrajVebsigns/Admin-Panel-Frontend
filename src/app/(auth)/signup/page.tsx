import SignUpForm from '@/components/auth/SignUpForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | Core Media Admin',
  description: 'Create a new Core Media Admin account.',
};

export default function SignupPage() {
  return <SignUpForm />;
}
