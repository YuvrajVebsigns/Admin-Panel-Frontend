'use client';
import { useEffect } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { LoginCredentials, SignupCredentials } from '@/types/user.types';

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

  // Sync profile data to Zustand store automatically when fetched (e.g., on page reload)
  useEffect(() => {
    if (profileQuery.data) {
      updateUser(profileQuery.data);
    }
  }, [profileQuery.data, updateUser]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: async (data) => {
      // Set initial auth state with tokens
      setAuth(data.user, data.access_token, data.refresh_token);

      try {
        // Fetch full profile to ensure we have role permissions populated
        const fullProfile = await authService.getProfile();
        updateUser(fullProfile);
        queryClient.setQueryData(['auth-profile'], fullProfile);
      } catch (err) {
        // Silently fail or handle error appropriately without console.log
      }
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: (credentials: SignupCredentials) => authService.signup(credentials),
    onSuccess: () => {
      // Typically signup might not login automatically,
      // but if it does, we handle it here.
      // For now, let's just return the user data.
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
    },
    onError: () => {
      // Even if logout fails on server, we clear local state
      clearAuth();
      queryClient.clear();
    },
  });

  // Forgot Password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });

  // Verify OTP mutation
  const verifyOTPMutation = useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authService.verifyOTP(email, otp),
  });

  // Reset Password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authService.resetPassword(token, password),
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
