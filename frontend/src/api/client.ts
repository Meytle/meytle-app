/**
 * Client API Service
 * Handles all client-related API operations including profile management and verification
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

export interface ClientVerification {
  id?: number;
  user_id: number;
  profile_photo_url?: string;
  id_document_url?: string;
  date_of_birth?: string;
  government_id_number?: string;
  phone_number?: string;
  location?: string;
  address_line?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  bio?: string;
  verification_status: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  verified_at?: string;
  reviewed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClientProfile {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
  };
  verification: ClientVerification | null;
}

export interface UpdateProfileData {
  fullName?: string;
  phoneNumber?: string;
  location?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  bio?: string;
}

export interface VerificationFormData {
  dateOfBirth: string;
  governmentIdNumber: string;
  idDocument: File;
}

const clientApi = {
  /**
   * Get client profile including verification status
   */
  async getProfile(): Promise<ClientProfile> {
    const response = await api.get('/client/profile');
    return response.data.data;
  },

  /**
   * Update client profile information
   */
  async updateProfile(data: UpdateProfileData) {
    const response = await api.put('/client/profile', data);
    return response.data;
  },

  /**
   * Upload client profile photo
   */
  async uploadProfilePhoto(file: File) {
    const formData = new FormData();
    formData.append('profilePhoto', file);

    const response = await api.post('/client/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Submit identity verification
   */
  async submitVerification(data: VerificationFormData) {
    const formData = new FormData();
    formData.append('idDocument', data.idDocument);
    formData.append('dateOfBirth', data.dateOfBirth);
    formData.append('governmentIdNumber', data.governmentIdNumber);

    const response = await api.post('/client/verify-identity', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get verification status
   */
  async getVerificationStatus() {
    const response = await api.get('/client/verification-status');
    return response.data.data;
  },

  /**
   * Check if client has location set
   */
  async hasLocation(): Promise<boolean> {
    try {
      const profile = await this.getProfile();
      return !!(profile.verification?.location && profile.verification.location.trim() !== '');
    } catch (error) {
      console.error('Error checking location:', error);
      return false;
    }
  },

  /**
   * Check if client is verified
   */
  async isVerified(): Promise<boolean> {
    try {
      const status = await this.getVerificationStatus();
      return status.verification_status === 'approved';
    } catch (error) {
      console.error('Error checking verification:', error);
      return false;
    }
  },

  /**
   * Get client's favorite companions
   */
  async getFavorites() {
    const response = await api.get('/favorites');
    return response.data;
  },

  /**
   * Add companion to favorites
   */
  async addFavorite(companionId: number) {
    const response = await api.post('/favorites', { companionId });
    return response.data;
  },

  /**
   * Remove companion from favorites
   */
  async removeFavorite(companionId: number) {
    const response = await api.delete(`/favorites/${companionId}`);
    return response.data;
  }
};

export default clientApi;