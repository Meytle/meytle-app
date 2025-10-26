/**
 * Core type definitions for the application
 * Centralized types to avoid duplication and ensure consistency
 */

export type UserRole = 'client' | 'companion' | 'admin';

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

export interface Companion {
  id: number;
  name: string;
  email?: string;
  age: number;
  location: string;
  description?: string;
  bio?: string;
  rating: number;
  reviewCount: number;
  responseTime: string;
  imageUrl?: string;
  profile_photo_url?: string;
  isVerified: boolean;
  isAvailable: boolean;
  interests: string[];
  services?: string[];
  joined_date?: string;
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
  meeting_type?: string;
  created_at: string;
  payment_status?: string;
  payment_method?: string;
  payment_intent_id?: string;
  paid_at?: string;
  service_category_id?: number;
  service_category_name?: string;
  service_category_price?: number;
  platform_fee_amount?: number;
  transfer_id?: string;
  transfer_status?: string;
  has_review?: boolean;
  companion_name?: string;
  companion_email?: string;
  companion_photo?: string;
  client_name?: string;
  client_email?: string;
}

export interface AvailabilitySlot {
  id?: number | string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  services?: string[] | string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface BookingFormData {
  companionId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  specialRequests?: string;
  meetingLocation?: string;
  meetingType?: MeetingType;
  serviceCategoryId?: number;
  customService?: {
    name: string;
    description?: string;
  };
}

export interface RoleSwitchData {
  role: UserRole;
}

export interface InterestData {
  interests: string[];
}

// Service Category Types
export interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  is_active: boolean;
}

export interface ServiceCategoryFormData {
  name: string;
  description?: string;
  base_price: number;
}

// Meeting types
export type MeetingType = 'in_person' | 'virtual';

// Booking Date Info
export interface BookingDateInfo {
  date: string;
  bookings: Array<{
    id: number;
    booking_date: string;
    start_time: string;
    end_time: string;
    status: string;
  }>;
  bookingCount: number;
  isFullyBooked: boolean;
  isPartiallyBooked: boolean;
}

// Payment Update Data
export interface PaymentUpdateData {
  paymentStatus: string;
  paymentMethod: string;
  paymentIntentId?: string;
}

// Stripe Account
export interface StripeAccount {
  accountId: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  status?: string;
  requirements?: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
  };
}

