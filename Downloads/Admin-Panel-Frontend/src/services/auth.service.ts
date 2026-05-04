import { apiFetch } from './apiFetch';
import { API_ENDPOINTS } from '@/constants/api';
import { User, LoginCredentials, SignupCredentials, AuthResponse } from '@/types/user.types';

export const authService = {
  /**
   * Logs a user in and returns their session/tokens
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiFetch<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
      requireAuth: false,
    });
  },

  /**
   * Registers a new user
   */
  async signup(credentials: SignupCredentials): Promise<User> {
    return apiFetch<User>(API_ENDPOINTS.AUTH.SIGNUP, {
      method: 'POST',
      body: JSON.stringify(credentials),
      requireAuth: false,
    });
  },

  /**
   * Logs a user out
   */
  async logout(): Promise<void> {
    return apiFetch<void>(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    });
  },

  /**
   * Fetches the current authenticated user's profile
   */
  async getProfile(): Promise<User> {
    return apiFetch<User>(API_ENDPOINTS.AUTH.ME, {
      method: 'GET',
    });
  },

  /**
   * Refreshes the access token using the refresh token
   */
  async refreshToken(): Promise<{ access_token: string }> {
    return apiFetch<{ access_token: string }>(API_ENDPOINTS.AUTH.REFRESH, {
      method: 'POST',
    });
  },

  /**
   * Initiates the forgot password process
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email }),
      requireAuth: false,
    });
  },

  /**
   * Verifies the OTP sent to the user's email
   */
  async verifyOTP(email: string, otp: string): Promise<{ reset_token: string; message?: string }> {
    return apiFetch<{ reset_token: string; message?: string }>(API_ENDPOINTS.AUTH.VERIFY_OTP, {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
      requireAuth: false,
    });
  },

  /**
   * Resets the user's password using the provided token
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ resetToken: token, newPassword: password }),
      requireAuth: false,
    });
  },
};
