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
  createdAt?: string;
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
  profilePhotoUrl?: string;
  isVerified: boolean;
  isAvailable: boolean;
  interests: string[];
  services?: string[];
  joinedDate?: string;
  servicesOffered?: string[];
  languages?: string[];
  hourlyRate?: number;
}

export interface Booking {
  id: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  specialRequests?: string;
  meetingLocation?: string;
  meetingType?: string;
  createdAt: string;
  paymentStatus?: string;
  paymentMethod?: string;
  paymentIntentId?: string;
  paidAt?: string;
  serviceCategoryId?: number;
  serviceCategoryName?: string;
  serviceCategoryPrice?: number;
  platformFeeAmount?: number;
  transferId?: string;
  transferStatus?: string;
  hasReview?: boolean;
  companionName?: string;
  companionEmail?: string;
  companionPhoto?: string;
  clientName?: string;
  clientEmail?: string;
}

export interface AvailabilitySlot {
  id?: number | string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
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
  basePrice: number;
  isActive: boolean;
}

export interface ServiceCategoryFormData {
  name: string;
  description?: string;
  basePrice: number;
}

// Meeting types
export type MeetingType = 'in_person' | 'virtual';

// Booking Date Info
export interface BookingDateInfo {
  date: string;
  bookings: Array<{
    id: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
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
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  status?: string;
  requirements?: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
  };
}

