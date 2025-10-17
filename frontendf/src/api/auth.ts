/**
 * Authentication API Module
 * Handles all authentication-related API calls
 */

import axios from 'axios';
import type { SignUpData, SignInData, AuthResponse, RoleSwitchData } from '../types';
import { API_CONFIG, STORAGE_KEYS, ROUTES } from '../constants';
import { setLocalStorageItem, removeLocalStorageItem, getLocalStorageItem } from '../utils/localStorage';

// Configure axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = getLocalStorageItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      removeLocalStorageItem(STORAGE_KEYS.AUTH_TOKEN);
      removeLocalStorageItem(STORAGE_KEYS.USER_DATA);
      window.location.href = ROUTES.SIGN_IN;
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  /**
   * Sign up a new user
   */
  async signUp(userData: SignUpData): Promise<AuthResponse> {
    const response = await api.post('/auth/signup', userData);
    
    // Store token and user data
    if (response.data.token) {
      setLocalStorageItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
      setLocalStorageItem(STORAGE_KEYS.USER_DATA, response.data.data.user);
    }
    
    return response.data;
  },

  /**
   * Sign in an existing user
   */
  async signIn(credentials: SignInData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    
    // Store token and user data
    if (response.data.token) {
      setLocalStorageItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
      setLocalStorageItem(STORAGE_KEYS.USER_DATA, response.data.data.user);
    }
    
    return response.data;
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    removeLocalStorageItem(STORAGE_KEYS.AUTH_TOKEN);
    removeLocalStorageItem(STORAGE_KEYS.USER_DATA);
  },

  /**
   * Get the current authenticated user
   */
  getCurrentUser() {
    return getLocalStorageItem(STORAGE_KEYS.USER_DATA);
  },

  /**
   * Get the authentication token
   */
  getToken() {
    return getLocalStorageItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Check if companion has submitted application
   */
  async checkCompanionApplication(): Promise<boolean> {
    try {
      const response = await api.get('/companion/application/status');
      return response.status === 200;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false; // No application found
      }
      // For other errors, also return false to be safe
      console.error('Error checking companion application:', error);
      return false;
    }
  },

  /**
   * Switch user's active role
   */
  async switchRole(roleData: RoleSwitchData): Promise<AuthResponse> {
    const response = await api.post('/auth/switch-role', roleData);
    
    // Update stored token and user data
    if (response.data.token) {
      setLocalStorageItem(STORAGE_KEYS.AUTH_TOKEN, response.data.token);
      setLocalStorageItem(STORAGE_KEYS.USER_DATA, response.data.data.user);
    }
    
    return response.data;
  },
};

export default authApi;
