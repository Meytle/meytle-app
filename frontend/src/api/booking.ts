/**
 * Booking API Module
 * Handles all booking-related API calls
 * Uses HTTP-only cookies for authentication
 */

import axios from 'axios';
import type { Booking, AvailabilitySlot, TimeSlot, BookingFormData } from '../types';
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

export const bookingApi = {
  /**
   * Create a new booking
   */
  async createBooking(bookingData: BookingFormData): Promise<{
    bookingId: number;
    totalAmount: number;
    durationHours: number;
  }> {
    const transformedData = transformKeysCamelToSnake(bookingData);
    const response = await api.post('/booking/create', transformedData);
    return response.data.data; // Backend already transformed to camelCase
  },

  /**
   * Get user's bookings
   */
  async getBookings(params?: { status?: string; limit?: number; offset?: number }): Promise<Booking[]> {
    const response = await api.get('/booking/my-bookings', { params });
    return response.data.data; // Backend already transformed to camelCase
  },

  /**
   * Get a single booking by ID
   */
  async getBookingById(bookingId: number): Promise<Booking> {
    const response = await api.get(`/booking/${bookingId}`);
    return response.data.data; // Backend already transformed to camelCase
  },

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId: number, status: string): Promise<void> {
    await api.put(`/booking/${bookingId}/status`, { status });
  },

  // Payment status update removed - will be implemented later

  /**
   * Get companion availability
   */
  async getCompanionAvailability(companionId: number, date?: string): Promise<AvailabilitySlot[]> {
    const params = date ? { date } : {};
    const response = await api.get(`/booking/availability/${companionId}`, { params });
    return response.data.data; // Backend already transformed to camelCase
  },

  /**
   * Set companion availability
   */
  async setCompanionAvailability(availability: AvailabilitySlot[]): Promise<void> {
    const transformedAvailability = transformKeysCamelToSnake(availability);
    await api.post('/booking/availability', { availability: transformedAvailability });
  },

  /**
   * Get available time slots for a companion on a specific date
   */
  async getAvailableTimeSlots(companionId: number, date: string): Promise<{ date: string; availableSlots: TimeSlot[] }> {
    const response = await api.get(`/booking/availability/${companionId}/slots`, {
      params: { date }
    });
    return response.data.data; // Backend already transformed to camelCase
  },

  /**
   * Get companion bookings by date range
   */
  async getCompanionBookingsByDateRange(companionId: number, startDate: string, endDate: string): Promise<Array<{ id: number; bookingDate: string; startTime: string; endTime: string; status: string }>> {
    const response = await api.get(`/booking/bookings/${companionId}/date-range`, {
      params: { startDate, endDate }
    });
    return response.data.data; // Backend already transformed to camelCase
  },

  /**
   * Submit a review for a booking
   */
  async createReview(bookingId: number, review: { rating: number; comment: string }): Promise<void> {
    await api.post(`/booking/${bookingId}/review`, review);
  },

  /**
   * Get reviews for a companion
   */
  async getCompanionReviews(companionId: number, page: number = 1, limit: number = 10): Promise<{
    reviews: Array<{
      id: number;
      rating: number;
      reviewText: string;
      createdAt: string;
      reviewerName: string;
      reviewerPhoto?: string;
      bookingDate: string;
      serviceId?: number;
    }>;
    stats: {
      total: number;
      distribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
      };
    };
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> {
    const response = await api.get(`/booking/companion/${companionId}/reviews`, {
      params: { page, limit }
    });
    return response.data.data; // Backend already transformed to camelCase
  },

  /**
   * Check if a booking has been reviewed
   */
  async getBookingReview(bookingId: number): Promise<{
    hasReviewed: boolean;
    review?: {
      id: number;
      rating: number;
      reviewText: string;
      createdAt: string;
    };
  }> {
    try {
      const response = await api.get(`/booking/${bookingId}/review`);
      return response.data.data; // Backend already transformed to camelCase
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { hasReviewed: false };
      }
      throw error;
    }
  },

  /**
   * Get companion's weekly availability pattern
   * Returns the regular weekly schedule for a companion
   */
  async getCompanionWeeklyAvailability(companionId: number): Promise<{
    weeklyPattern: {
      monday: Array<{ startTime: string; endTime: string; services: string[] }>;
      tuesday: Array<{ startTime: string; endTime: string; services: string[] }>;
      wednesday: Array<{ startTime: string; endTime: string; services: string[] }>;
      thursday: Array<{ startTime: string; endTime: string; services: string[] }>;
      friday: Array<{ startTime: string; endTime: string; services: string[] }>;
      saturday: Array<{ startTime: string; endTime: string; services: string[] }>;
      sunday: Array<{ startTime: string; endTime: string; services: string[] }>;
    };
    summary: {
      totalSlotsPerWeek: number;
      daysAvailable: number;
      availableDays: string[];
    };
  }> {
    const response = await api.get(`/booking/availability/${companionId}/weekly`);
    return response.data; // Backend already transformed to camelCase
  },

  /**
   * Get companion's availability for a date range
   * Returns available dates and their time slots for calendar display
   */
  async getCompanionAvailabilityForDateRange(companionId: number, startDate: string, endDate: string): Promise<{
    availabilityCalendar: {
      [date: string]: {
        dayOfWeek: string;
        totalSlots: number;
        availableSlots: number;
        bookedSlots: number;
        isAvailable: boolean;
        slots: Array<{ startTime: string; endTime: string; services: string[] }>;
      };
    };
  }> {
    const response = await api.get(`/booking/availability/${companionId}/calendar`, {
      params: { startDate, endDate }
    });
    return response.data; // Backend already transformed to camelCase
  },

  /**
   * Create a booking request when no time slots are available
   */
  async createBookingRequest(requestData: {
    companionId: number;
    requestedDate: string;
    preferredTime?: string;
    startTime?: string;
    endTime?: string;
    durationHours?: number;
    serviceCategoryId?: number;
    serviceType?: string;
    extraAmount?: number;
    meetingType?: 'in_person' | 'virtual';
    specialRequests?: string;
    meetingLocation?: string;
  }): Promise<{ requestId: number }> {
    console.log('API createBookingRequest called with:', requestData);
    const transformedData = transformKeysCamelToSnake(requestData);
    const response = await api.post('/booking/requests/create', transformedData);
    console.log('API response:', response.data);
    return response.data.data || response.data; // Backend already transformed to camelCase
  },

  /**
   * Get booking requests for a user
   */
  async getBookingRequests(params?: {
    role?: 'client' | 'companion';
    status?: 'pending' | 'accepted' | 'rejected' | 'expired'
  }): Promise<Array<{
    id: number;
    clientId: number;
    companionId: number;
    requestedDate: string;
    preferredTime?: string;
    durationHours: number;
    serviceCategoryId?: number;
    meetingType: 'in_person' | 'virtual';
    specialRequests?: string;
    meetingLocation?: string;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    companionResponse?: string;
    suggestedDate?: string;
    suggestedStartTime?: string;
    suggestedEndTime?: string;
    expiresAt?: string;
    createdAt: string;
    updatedAt: string;
    respondedAt?: string;
    clientName?: string;
    clientEmail?: string;
    clientPhoto?: string;
    companionName?: string;
    companionEmail?: string;
    companionPhoto?: string;
    serviceCategoryName?: string;
    servicePrice?: number;
  }>> {
    const response = await api.get('/booking/requests', { params });
    return response.data.requests; // Backend already transformed to camelCase
  },

  /**
   * Get a single booking request by ID
   */
  async getBookingRequestById(requestId: number): Promise<{
    id: number;
    clientId: number;
    companionId: number;
    requestedDate: string;
    preferredTime?: string;
    durationHours: number;
    status: string;
    companionResponse?: string;
    suggestedDate?: string;
    suggestedStartTime?: string;
    suggestedEndTime?: string;
    clientName: string;
    companionName: string;
  }> {
    const response = await api.get(`/booking/requests/${requestId}`);
    return response.data.request; // Backend already transformed to camelCase
  },

  /**
   * Update booking request status (for companions)
   */
  async updateBookingRequestStatus(requestId: number, data: {
    status: 'accepted' | 'rejected';
    companionResponse?: string;
    suggestedDate?: string;
    suggestedStartTime?: string;
    suggestedEndTime?: string;
  }): Promise<void> {
    const transformedData = transformKeysCamelToSnake(data);
    await api.put(`/booking/requests/${requestId}/status`, transformedData);
  },

  /**
   * Get pending bookings for companion approval
   */
  async getPendingBookingsForCompanion(): Promise<Booking[]> {
    const response = await api.get('/booking/companion/pending');
    return response.data.data; // Backend already transformed to camelCase
  },

  /**
   * Approve a booking (companion only)
   */
  async approveBooking(bookingId: number): Promise<void> {
    await api.put(`/booking/companion/approve/${bookingId}`);
  },

  /**
   * Reject a booking (companion only)
   */
  async rejectBooking(bookingId: number): Promise<void> {
    await api.put(`/booking/companion/reject/${bookingId}`);
  }
};

export default bookingApi;

