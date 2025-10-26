/**
 * Favorites API Module
 * Handles favorite companions functionality
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

export interface FavoriteCompanion {
  id: number;
  name: string;
  email: string;
  bio?: string;
  location?: string;
  profile_photo_url?: string;
  hourly_rate?: number;
  average_rating?: number;
  review_count?: number;
  is_verified?: boolean;
  favorited_at: string;
}

export const favoritesApi = {
  /**
   * Add a companion to favorites
   */
  async addFavorite(companionId: number): Promise<void> {
    await api.post(`/favorites/${companionId}`);
  },

  /**
   * Remove a companion from favorites
   */
  async removeFavorite(companionId: number): Promise<void> {
    await api.delete(`/favorites/${companionId}`);
  },

  /**
   * Get all favorite companions
   */
  async getFavorites(): Promise<FavoriteCompanion[]> {
    const response = await api.get('/favorites');
    return response.data.data;
  },

  /**
   * Check if a companion is favorited
   */
  async checkFavorite(companionId: number): Promise<boolean> {
    const response = await api.get(`/favorites/check/${companionId}`);
    return response.data.data.isFavorited;
  },

  /**
   * Get all favorite companion IDs for bulk checking
   */
  async getFavoriteIds(): Promise<number[]> {
    const response = await api.get('/favorites/ids');
    return response.data.data;
  },

  /**
   * Toggle favorite status
   */
  async toggleFavorite(companionId: number, currentlyFavorited: boolean): Promise<boolean> {
    if (currentlyFavorited) {
      await this.removeFavorite(companionId);
      return false;
    } else {
      await this.addFavorite(companionId);
      return true;
    }
  }
};

export default favoritesApi;