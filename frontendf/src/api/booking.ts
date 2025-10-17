/**
 * Booking API Module
 * Handles all booking-related API calls
 */

import axios from 'axios';
import type { Booking, AvailabilitySlot, TimeSlot, BookingFormData, PaymentUpdateData } from '../types';
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

export const bookingApi = {
  /**
   * Create a new booking
   */
  async createBooking(bookingData: BookingFormData): Promise<{ bookingId: number; totalAmount: number; durationHours: number }> {
    const response = await api.post('/booking/create', bookingData);
    return response.data.data;
  },

  /**
   * Get user's bookings
   */
  async getBookings(params?: { status?: string; limit?: number; offset?: number }): Promise<Booking[]> {
    const response = await api.get('/booking/my-bookings', { params });
    return response.data.data;
  },

  /**
   * Get a single booking by ID
   */
  async getBookingById(bookingId: number): Promise<Booking> {
    const response = await api.get(`/booking/${bookingId}`);
    return response.data.data;
  },

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId: number, status: string): Promise<void> {
    await api.put(`/booking/${bookingId}/status`, { status });
  },

  /**
   * Update payment status for a booking
   */
  async updatePaymentStatus(bookingId: number, paymentData: PaymentUpdateData): Promise<void> {
    const { paymentStatus, paymentMethod, paymentIntentId } = paymentData;
    await api.put(`/booking/${bookingId}/payment-status`, {
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      payment_intent_id: paymentIntentId
    });
  },

  /**
   * Get companion availability
   */
  async getCompanionAvailability(companionId: number, date?: string): Promise<AvailabilitySlot[]> {
    const params = date ? { date } : {};
    const response = await api.get(`/booking/availability/${companionId}`, { params });
    return response.data.data;
  },

  /**
   * Set companion availability
   */
  async setCompanionAvailability(availability: AvailabilitySlot[]): Promise<void> {
    await api.post('/booking/availability', { availability });
  },

  /**
   * Get available time slots for a companion on a specific date
   */
  async getAvailableTimeSlots(companionId: number, date: string): Promise<{ date: string; availableSlots: TimeSlot[] }> {
    const response = await api.get(`/booking/availability/${companionId}/slots`, { 
      params: { date } 
    });
    return response.data.data;
  },

  /**
   * Get companion bookings by date range
   */
  async getCompanionBookingsByDateRange(companionId: number, startDate: string, endDate: string): Promise<Array<{ id: number; booking_date: string; start_time: string; end_time: string; status: string }>> {
    const response = await api.get(`/booking/bookings/${companionId}/date-range`, {
      params: { startDate, endDate }
    });
    return response.data.data;
  },

  // STRIPE INTEGRATION PLACEHOLDER
  // Uncomment and implement when Stripe is integrated
  // async createPaymentIntent(bookingId: number, amount: number): Promise<{ clientSecret: string }> {
  //   const response = await api.post('/payment/create-intent', { bookingId, amount });
  //   return response.data.data;
  // },
  // async confirmPayment(paymentIntentId: string): Promise<void> {
  //   await api.post('/payment/confirm', { paymentIntentId });
  // }
};

export default bookingApi;

