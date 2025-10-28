/**
 * Service Category API Module
 * Handles all service category-related API calls
 * Uses HTTP-only cookies for authentication
 */

import axios from 'axios';
import type { ServiceCategory, ServiceCategoryFormData } from '../types';
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

// No request interceptor needed - cookies are sent automatically

export const serviceCategoryApi = {
  /**
   * Get all service categories
   */
  async getAllCategories(activeOnly?: boolean): Promise<ServiceCategory[]> {
    const params = activeOnly ? { activeOnly: 'true' } : {};
    const response = await api.get('/service-categories', { params });
    return response.data.data; // Backend already transformed to camelCase
  },

  /**
   * Get single category by ID
   */
  async getCategoryById(categoryId: number): Promise<ServiceCategory> {
    const response = await api.get(`/service-categories/${categoryId}`);
    return response.data.data; // Backend already transformed to camelCase
  },

  /**
   * Create new category (admin only)
   */
  async createCategory(categoryData: ServiceCategoryFormData): Promise<{ categoryId: number }> {
    const transformedData = transformKeysCamelToSnake({
      ...categoryData,
      isActive: true, // Default to active for new categories
    });
    const response = await api.post('/service-categories', transformedData);
    return { categoryId: response.data.data.categoryId }; // Backend already transformed to camelCase
  },

  /**
   * Update existing category (admin only)
   */
  async updateCategory(categoryId: number, categoryData: Partial<ServiceCategoryFormData>): Promise<void> {
    const transformedData = transformKeysCamelToSnake({
      ...categoryData,
      isActive: true, // Keep active unless explicitly changed
    });
    await api.put(`/service-categories/${categoryId}`, transformedData);
  },

  /**
   * Delete category (admin only)
   */
  async deleteCategory(categoryId: number): Promise<void> {
    await api.delete(`/service-categories/${categoryId}`);
  },
};

export default serviceCategoryApi;

