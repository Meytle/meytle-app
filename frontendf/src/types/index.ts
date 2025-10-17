/**
 * Core type definitions for the application
 * Centralized types to avoid duplication and ensure consistency
 */

export type UserRole = 'client' | 'companion' | 'admin';
export type MeetingType = 'in_person' | 'virtual';
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';

export interface User {
  id: number;
  name: string;
  email: string;
  roles: UserRole[];
  activeRole: UserRole;
  emailVerified?: boolean;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  roles: UserRole[];
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}

export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  roles: UserRole[];
}

// Service/Activity Types
export interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isPopular?: boolean;
}

export interface Interest {
  id: number;
  name: string;
  icon?: string;
}

export interface ServiceCategory {
  id: number;
  name: string;
  description: string | null;
  base_price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategoryFormData {
  name: string;
  description?: string;
  basePrice: number;
  isActive?: boolean;
}

export interface Companion {
  id: number;
  name: string;
  age: number;
  location: string;
  description: string;
  bio?: string;
  rating: number;
  reviewCount: number;
  responseTime: string;
  imageUrl: string;
  isVerified: boolean;
  isAvailable: boolean;
  interests: string[];
}

export interface Booking {
  id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  special_requests?: string;
  meeting_location?: string;
  meeting_type?: MeetingType;
  payment_status?: PaymentStatus;
  payment_method?: string | null;
  payment_intent_id?: string | null;
  paid_at?: string | null;
  created_at: string;
  companion_name?: string;
  companion_email?: string;
  companion_photo?: string;
  client_name?: string;
  client_email?: string;
  service_category_id?: number | null;
  service_category_name?: string | null;
  service_category_price?: number | null;
}

export interface AvailabilitySlot {
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface BookingDateInfo {
  date: string;
  bookings: Array<{ id: number; start_time: string; end_time: string; status: string }>;
  bookingCount: number;
  isFullyBooked: boolean;
  isPartiallyBooked: boolean;
}

export interface BookingFormData {
  companionId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  specialRequests?: string;
  meetingLocation?: string;
  serviceCategoryId?: number;
  meetingType?: MeetingType;
}

export interface RoleSwitchData {
  role: UserRole;
}

export interface InterestData {
  interests: string[];
}

export interface PaymentUpdateData {
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentIntentId?: string;
}

