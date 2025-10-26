/**
 * Companions API Module
 * Handles all companion-related API calls
 * Uses HTTP-only cookies for authentication
 */

import axios from 'axios';
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

export interface Companion {
  id: number;
  name: string;
  email?: string;
  profile_photo_url?: string;
  age: number;
  joined_date: string;
  interests: string[];
  services?: string[];
  location?: string;
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
   * Get single companion by ID
   */
  async getCompanionById(id: number): Promise<{ status: string; data: Companion }> {
    const response = await api.get(`/companion/${id}`);
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

  /**
   * Get companion's registered services
   */
  async getCompanionServices(): Promise<{ status: string; data: { services: string[] } }> {
    const response = await api.get('/companion/services');
    return response.data;
  },
};

export default companionsApi;




