/**
 * Client API Service
 * Handles all client-related API operations including profile management and verification
 */

import axios from 'axios';
import { API_CONFIG } from '../constants';
import { transformKeysSnakeToCamel, transformKeysCamelToSnake } from '../types/transformers';

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
  userId: number;
  profilePhotoUrl?: string;
  idDocumentUrl?: string;
  dateOfBirth?: string;
  governmentIdNumber?: string;
  phoneNumber?: string;
  location?: string;
  addressLine?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  bio?: string;
  verificationStatus: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  verifiedAt?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientProfile {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: string;
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
    return response.data.data; // Backend already transformed to camelCase
  },

  /**
   * Update client profile information
   */
  async updateProfile(data: UpdateProfileData) {
    const transformedData = transformKeysCamelToSnake(data);
    const response = await api.put('/client/profile', transformedData);
    return response.data; // Backend already transformed to camelCase
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
    return response.data; // Backend already transformed to camelCase
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
    return response.data; // Backend already transformed to camelCase
  },

  /**
   * Get verification status
   */
  async getVerificationStatus() {
    const response = await api.get('/client/verification-status');
    return response.data.data; // Backend already transformed to camelCase
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
      return status.verificationStatus === 'approved';
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
    return response.data; // Backend already transformed to camelCase
  },

  /**
   * Add companion to favorites
   */
  async addFavorite(companionId: number) {
    const response = await api.post('/favorites', { companionId });
    return response.data; // Backend already transformed to camelCase
  },

  /**
   * Remove companion from favorites
   */
  async removeFavorite(companionId: number) {
    const response = await api.delete(`/favorites/${companionId}`);
    return response.data; // Backend already transformed to camelCase
  }
};

export default clientApi;