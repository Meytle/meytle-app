/**
 * Service Category API Module
 * Handles all service category-related API calls
 */

import axios from 'axios';
import type { ServiceCategory, ServiceCategoryFormData } from '../types';
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

export const serviceCategoryApi = {
  /**
   * Get all service categories
   */
  async getAllCategories(activeOnly?: boolean): Promise<ServiceCategory[]> {
    const params = activeOnly ? { activeOnly: 'true' } : {};
    const response = await api.get('/service-categories', { params });
    return response.data.data;
  },

  /**
   * Get single category by ID
   */
  async getCategoryById(categoryId: number): Promise<ServiceCategory> {
    const response = await api.get(`/service-categories/${categoryId}`);
    return response.data.data;
  },

  /**
   * Create new category (admin only)
   */
  async createCategory(categoryData: ServiceCategoryFormData): Promise<{ categoryId: number }> {
    const response = await api.post('/service-categories', {
      name: categoryData.name,
      description: categoryData.description,
      basePrice: categoryData.basePrice,
      isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
    });
    return { categoryId: response.data.data.categoryId };
  },

  /**
   * Update existing category (admin only)
   */
  async updateCategory(categoryId: number, categoryData: Partial<ServiceCategoryFormData>): Promise<void> {
    await api.put(`/service-categories/${categoryId}`, {
      name: categoryData.name,
      description: categoryData.description,
      basePrice: categoryData.basePrice,
      isActive: categoryData.isActive,
    });
  },

  /**
   * Delete category (admin only)
   */
  async deleteCategory(categoryId: number): Promise<void> {
    await api.delete(`/service-categories/${categoryId}`);
  },
};

export default serviceCategoryApi;

