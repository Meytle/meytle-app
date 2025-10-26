/**
 * Authentication API Module
 * Handles all authentication-related API calls
 * Uses HTTP-only cookies for secure token storage
 */

import axios from 'axios';
import type { SignUpData, SignInData, AuthResponse, RoleSwitchData } from '../types';
import { API_CONFIG } from '../constants';

// Configure axios instance with credentials support
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Always send cookies with requests
});

// No request interceptor needed - cookies are sent automatically

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for debugging
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.message || '';
      const requestUrl = error.config?.url || '';

      console.log('🔍 401 Error Details:', {
        url: requestUrl,
        message: errorMessage,
      });

      // Check if token is expired or missing
      const isTokenExpired =
        errorMessage === 'Token expired. Please sign in again.';

      const isNoToken =
        errorMessage === 'No token provided. Please authenticate.';

      // For expired tokens, dispatch event for auth context to handle
      if (isTokenExpired || isNoToken) {
        console.log('🔒 Authentication issue detected:', errorMessage);
        // Dispatch a custom event that AuthContext can listen to
        window.dispatchEvent(new Event('auth-expired'));
      } else {
        // For other 401 errors, just log them
        console.log('⚠️ 401 error:', errorMessage);
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  /**
   * Sign up a new user
   * Backend sets HTTP-only cookies automatically
   */
  async signUp(userData: SignUpData): Promise<AuthResponse> {
    try {
      console.log('📤 Sending sign-up request:', userData);
      const response = await api.post('/auth/signup', userData);
      console.log('📥 Sign-up response received:', response.data);

      // Backend sets cookies automatically - no localStorage needed
      console.log('✅ Authentication cookies set by server');

      return response.data;
    } catch (error: any) {
      console.error('❌ Sign-up API error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },

  /**
   * Sign in an existing user
   * Backend sets HTTP-only cookies automatically
   */
  async signIn(credentials: SignInData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);

    // Backend sets cookies automatically - no localStorage needed
    console.log('✅ Authentication cookies set by server');

    return response.data;
  },

  /**
   * Sign out the current user
   * Just needs to call the server, which will clear the cookies
   */
  async signOut(): Promise<void> {
    // Server will clear the HTTP-only cookies
    // We just need to make the request
    try {
      await api.post('/auth/signout');
    } catch (error) {
      // Even if the server call fails, we consider the user logged out
      console.log('Sign out request failed, but treating as logged out');
    }
  },

  /**
   * Get the current authenticated user from cookies
   */
  getCurrentUser() {
    // Try to get user data from the userData cookie
    const userDataCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('userData='));

    if (userDataCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataCookie.split('=')[1]));
        return userData;
      } catch (error) {
        console.error('Failed to parse user data from cookie:', error);
        return null;
      }
    }
    return null;
  },

  /**
   * Check if user is authenticated by checking for cookies
   */
  isAuthenticated() {
    // Check if we have the userData cookie
    return document.cookie.includes('userData=');
  },

  /**
   * Check if companion has submitted application
   */
  async checkCompanionApplication(): Promise<boolean> {
    try {
      console.log('📋 Checking companion application status...');
      const response = await api.get('/companion/application/status');
      console.log('✅ Application exists');
      return true;
    } catch (error: any) {
      // 404 means no application exists (this is expected for new companions)
      if (error.response?.status === 404) {
        console.log('📝 No application found (normal for new companions)');
        return false;
      }

      // Any other error - log it but return false
      console.log('⚠️ Error checking application:', {
        status: error.response?.status,
        message: error.response?.data?.message
      });
      return false;
    }
  },

  /**
   * Switch user's active role
   * Backend will update the cookies with new role
   */
  async switchRole(roleData: RoleSwitchData): Promise<AuthResponse> {
    const response = await api.post('/auth/switch-role', roleData);

    // Backend sets updated cookies automatically
    console.log('✅ Role switched, cookies updated by server');

    return response.data;
  },
};

export default authApi;
