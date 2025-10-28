/**
 * Companions API Module
 * Handles all companion-related API calls
 * Uses HTTP-only cookies for authentication
 */

import axios from 'axios';
import { API_CONFIG } from '../constants';
import type { Companion } from '../types';
import { transformKeysSnakeToCamel } from '../types/transformers';

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
    return {
      status: response.data.status,
      data: response.data.data // Backend already transformed to camelCase
    };
  },

  /**
   * Get single companion by ID
   */
  async getCompanionById(id: number): Promise<{ status: string; data: Companion }> {
    const response = await api.get(`/companion/${id}`);
    return {
      status: response.data.status,
      data: response.data.data // Backend already transformed to camelCase
    };
  },

  /**
   * Get companion interests
   */
  async getCompanionInterests(companionId: number): Promise<{ status: string; data: { interests: string[] } }> {
    const response = await api.get(`/companion/interests/${companionId}`);
    return response.data; // Backend already transformed to camelCase
  },

  /**
   * Update companion interests
   */
  async updateCompanionInterests(interests: string[]): Promise<{ status: string; message: string; data: { interests: string[] } }> {
    const response = await api.post('/companion/interests', { interests });
    return response.data; // Backend already transformed to camelCase
  },

  /**
   * Get companion's registered services
   */
  async getCompanionServices(): Promise<{ status: string; data: { services: string[] } }> {
    const response = await api.get('/companion/services');
    return response.data; // Backend already transformed to camelCase
  },
};

export default companionsApi;




