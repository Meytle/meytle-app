/**
 * Payment Confirmation Page
 * Displays booking details and success message after booking creation
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaCalendar, FaClock, FaDollarSign, FaMapMarkerAlt, FaUser, FaArrowRight } from 'react-icons/fa';
import toast from 'react-hot-toast';
import bookingApi from '../api/booking';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useAuth } from '../hooks/useAuth';
import type { Booking } from '../types';
import { ROUTES } from '../constants';

const PaymentConfirmation: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError('Booking ID is required');
        setIsLoading(false);
        return;
      }

      try {
        const bookingData = await bookingApi.getBookingById(parseInt(bookingId));
        setBooking(bookingData);
      } catch (err: any) {
        console.error('Error fetching booking:', err);
        setError(err.response?.data?.message || 'Failed to load booking details');
        toast.error('Failed to load booking details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status?: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return 'Unpaid';
    }
  };

  const getDashboardRoute = () => {
    if (!user) return ROUTES.CLIENT_DASHBOARD;
    
    // Check if user has companion role
    if (user.activeRole === 'companion' || user.roles?.includes('companion')) {
      return ROUTES.COMPANION_DASHBOARD;
    }
    
    // Default to client dashboard
    return ROUTES.CLIENT_DASHBOARD;
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-error-50 to-warning-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 text-6xl mb-4">
            <FaCheckCircle className="mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Booking not found'}</p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate(getDashboardRoute())}
              className="w-full"
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={() => navigate(ROUTES.BROWSE_COMPANIONS)}
              variant="outline"
              className="w-full"
            >
              Browse Companions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = booking.duration_hours * (booking.service_category_price || 35);
  const serviceFee = subtotal * 0.10; // 10% service fee

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-50 to-primary-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="text-green-500 text-8xl mb-4 animate-bounce">
              <FaCheckCircle className="mx-auto" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-xl text-gray-600">Your booking has been successfully created</p>
          </div>

          {/* Booking Details Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
              <Badge className="bg-blue-100 text-blue-800">
                ID: #{booking.id}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FaUser className="text-blue-500 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Companion</p>
                    <p className="font-semibold text-gray-900">{booking.companion_name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaCalendar className="text-blue-500 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-semibold text-gray-900">{formatDate(booking.booking_date)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaClock className="text-blue-500 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-semibold text-gray-900">
                      {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                    </p>
                    <p className="text-sm text-gray-500">({booking.duration_hours} hours)</p>
                  </div>
                </div>

                {booking.meeting_location && (
                  <div className="flex items-center space-x-3">
                    <FaMapMarkerAlt className="text-blue-500 text-xl" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-semibold text-gray-900">{booking.meeting_location}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Service & Payment Info */}
              <div className="space-y-4">
                {booking.service_category_name && (
                  <div>
                    <p className="text-sm text-gray-500">Service Category</p>
                    <p className="font-semibold text-gray-900">{booking.service_category_name}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500">Meeting Type</p>
                  <Badge className={booking.meeting_type === 'virtual' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}>
                    {booking.meeting_type === 'virtual' ? 'Virtual' : 'In-Person'}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <Badge className={getPaymentStatusColor(booking.payment_status)}>
                    {getPaymentStatusText(booking.payment_status)}
                  </Badge>
                </div>
              </div>
            </div>

            {booking.special_requests && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Special Requests</p>
                <p className="text-gray-900">{booking.special_requests}</p>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Price Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({booking.duration_hours} hours × ${booking.service_category_price || 35}/hour)</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Fee (10%)</span>
                <span className="font-semibold">${serviceFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <div className="flex items-center space-x-2">
                    <FaDollarSign className="text-green-500" />
                    <span className="text-2xl font-bold text-green-600">${booking.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="text-blue-500 text-xl mt-1">
                <FaCheckCircle />
              </div>
              <div>
                <p className="text-blue-800 font-semibold">Payment Information</p>
                <p className="text-blue-700 text-sm mt-1">
                  Payment will be processed separately. You'll receive a confirmation email shortly.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate(getDashboardRoute())}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <span>View My Bookings</span>
              <FaArrowRight />
            </Button>
            <Button
              onClick={() => navigate(ROUTES.BROWSE_COMPANIONS)}
              variant="outline"
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <span>Browse More Companions</span>
              <FaArrowRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
