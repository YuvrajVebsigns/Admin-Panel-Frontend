import { apiFetch } from './apiFetch';
import { API_ENDPOINTS } from '@/constants/api';
import { User } from '@/types/user.types';

interface LoginCredentials {
  email: string;
  password?: string;
  // Adjust based on your actual auth mechanism
}

interface AuthResponse {
  user: User;
  accessToken?: string;
}

export const authService = {
  /**
   * Logs a user in and returns their session/token
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiFetch<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
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
  async verifyOTP(email: string, otp: string): Promise<{ token: string }> {
    return apiFetch<{ token: string }>(API_ENDPOINTS.AUTH.VERIFY_OTP, {
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
      body: JSON.stringify({ token, password }),
      requireAuth: false,
    });
  },
};
