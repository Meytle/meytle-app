/**
 * Companions API Module
 * Handles all companion-related API calls
 */

import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../constants';
import { getLocalStorageItem } from '../utils/localStorage';

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

export interface Companion {
  id: number;
  name: string;
  profile_photo_url?: string;
  age: number;
  joined_date: string;
  interests: string[];
}

export interface CompanionsResponse {
  status: string;
  data: Companion[];
}

export const companionsApi = {
  /**
   * Get all approved companions for browsing
   */
  async getCompanions(interests?: string[]): Promise<CompanionsResponse> {
    const params = interests ? { interests: interests.join(',') } : {};
    const response = await api.get('/companion/browse', { params });
    return response.data;
  },

  /**
   * Get companion interests
   */
  async getCompanionInterests(companionId: number): Promise<{ status: string; data: { interests: string[] } }> {
    const response = await api.get(`/companion/interests/${companionId}`);
    return response.data;
  },

  /**
   * Update companion interests
   */
  async updateCompanionInterests(interests: string[]): Promise<{ status: string; message: string; data: { interests: string[] } }> {
    const response = await api.post('/companion/interests', { interests });
    return response.data;
  },
};

export default companionsApi;




