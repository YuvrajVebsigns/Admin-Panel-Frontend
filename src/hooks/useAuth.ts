'use client';
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { LoginCredentials, SignupCredentials, AuthResponse, User } from '@/types/user.types';
import toast from 'react-hot-toast';

export function useAuth() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, access_token, setAuth, clearAuth, updateUser } = useAuthStore();

  // Fetch profile query
  const profileQuery = useQuery({
    queryKey: ['auth-profile'],
    queryFn: () => authService.getProfile(),
    enabled: !!access_token, // Only run if we have a token
    retry: false,
  });

  // Sync profile data to Zustand store automatically
  useEffect(() => {
    if (profileQuery.data) {
      updateUser(profileQuery.data);
    }
  }, [profileQuery.data, updateUser]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => {
      const promise = authService.login(credentials);
      toast.promise(promise, {
        loading: 'Signing in...',
        success: (res: AuthResponse) => res.message || 'Login successful!',
        error: (err: Error) => err.message || 'Login failed. Please check your credentials.',
      });
      return promise;
    },
    onSuccess: async (data) => {
      setAuth(data.user, data.access_token, data.refresh_token);
      try {
        const fullProfile = await authService.getProfile();
        updateUser(fullProfile);
        queryClient.setQueryData(['auth-profile'], fullProfile);
      } catch (err) {
        // Silently fail profile fetch after login
      }
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: (credentials: SignupCredentials) => {
      const promise = authService.signup(credentials);
      toast.promise(promise, {
        loading: 'Creating account...',
        success: (_res: User) => 'Account created successfully!',
        error: (err: Error) => err.message || 'Signup failed. Please try again.',
      });
      return promise;
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => {
      const promise = authService.logout();
      toast.promise(promise, {
        loading: 'Logging out...',
        success: 'Logged out successfully!',
        error: 'Logged out with session clear',
      });
      return promise;
    },
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
    },
    onError: () => {
      clearAuth();
      queryClient.clear();
    },
  });

  // Forgot Password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => {
      const promise = authService.forgotPassword(email);
      toast.promise(promise, {
        loading: 'Sending OTP...',
        success: (res: { message: string }) => res.message || 'OTP sent to your email!',
        error: (err: Error) => err.message || 'Failed to send OTP.',
      });
      return promise;
    },
  });

  // Verify OTP mutation
  const verifyOTPMutation = useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) => {
      const promise = authService.verifyOTP(email, otp);
      toast.promise(promise, {
        loading: 'Verifying OTP...',
        success: (res: { reset_token: string; message?: string }) => res.message || 'OTP verified!',
        error: (err: Error) => err.message || 'Invalid OTP.',
      });
      return promise;
    },
  });

  // Reset Password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) => {
      const promise = authService.resetPassword(token, password);
      toast.promise(promise, {
        loading: 'Resetting password...',
        success: (res: { message: string }) => res.message || 'Password reset successful!',
        error: (err: Error) => err.message || 'Reset failed.',
      });
      return promise;
    },
  });

  return {
    user,
    isAuthenticated,
    isLoading: profileQuery.isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    signup: signupMutation.mutateAsync,
    isSigningUp: signupMutation.isPending,
    signupError: signupMutation.error,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    isSubmittingForgot: forgotPasswordMutation.isPending,
    verifyOTP: verifyOTPMutation.mutateAsync,
    isVerifyingOTP: verifyOTPMutation.isPending,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,
  };
}
