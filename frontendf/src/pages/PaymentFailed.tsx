/**
 * Payment Failed Page
 * Displays error message and retry options when payment processing fails
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FaExclamationCircle, FaRedo, FaHome, FaCalendar, FaDollarSign, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';
import bookingApi from '../api/booking';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import type { Booking } from '../types';
import { ROUTES } from '../constants';

const PaymentFailed: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const errorMessage = searchParams.get('error') || 'payment_declined';
  const errorReason = searchParams.get('reason') || '';

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setFetchError('Booking ID is required');
        setIsLoading(false);
        return;
      }

      try {
        const bookingData = await bookingApi.getBookingById(parseInt(bookingId));
        setBooking(bookingData);
      } catch (err: any) {
        console.error('Error fetching booking:', err);
        setFetchError(err.response?.data?.message || 'Failed to load booking details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'card_declined':
        return 'Your card was declined by your bank';
      case 'insufficient_funds':
        return 'Insufficient funds in your account';
      case 'expired_card':
        return 'Your card has expired';
      case 'invalid_cvc':
        return 'Invalid security code';
      case 'network_error':
        return 'Network connection error occurred';
      case 'payment_declined':
      default:
        return 'We couldn\'t process your payment';
    }
  };

  const getCommonReasons = () => [
    {
      icon: <FaDollarSign className="text-red-500" />,
      title: 'Insufficient Funds',
      description: 'Your account may not have enough funds to cover the transaction'
    },
    {
      icon: <FaExclamationCircle className="text-red-500" />,
      title: 'Card Declined',
      description: 'Your bank may have declined the transaction for security reasons'
    },
    {
      icon: <FaCalendar className="text-red-500" />,
      title: 'Expired Card',
      description: 'Your payment method may have expired or is no longer valid'
    },
    {
      icon: <FaExclamationCircle className="text-red-500" />,
      title: 'Network Error',
      description: 'A temporary network issue may have interrupted the payment'
    }
  ];

  const handleTryAgain = () => {
    toast.error('Payment retry functionality coming soon');
    // Future: Navigate to payment retry flow
  };

  const handleViewBooking = () => {
    if (bookingId) {
      navigate(`${ROUTES.PAYMENT_CONFIRMATION}/${bookingId}`);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-error-50 to-warning-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Error Header */}
          <div className="text-center mb-8">
            <div className="text-red-500 text-8xl mb-4 animate-pulse">
              <FaExclamationCircle className="mx-auto" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-xl text-gray-600">{getErrorMessage(errorMessage)}</p>
            {errorReason && (
              <p className="text-lg text-red-600 mt-2 font-semibold">{errorReason}</p>
            )}
          </div>

          {/* Error Details Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Details</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="text-red-500 text-xl">
                  <FaExclamationCircle />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Error Code</p>
                  <p className="font-semibold text-gray-900">{errorMessage.replace('_', ' ').toUpperCase()}</p>
                </div>
              </div>

              {bookingId && (
                <div className="flex items-center space-x-3">
                  <div className="text-blue-500 text-xl">
                    <FaCalendar />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Booking Reference</p>
                    <p className="font-semibold text-gray-900">#{bookingId}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <div className="text-gray-500 text-xl">
                  <FaCalendar />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Failed At</p>
                  <p className="font-semibold text-gray-900">{new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Summary (if available) */}
          {booking && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Summary</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FaUser className="text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Companion</p>
                      <p className="font-semibold text-gray-900">{booking.companion_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaCalendar className="text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(booking.booking_date).toLocaleDateString()} at {booking.start_time}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FaDollarSign className="text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-semibold text-gray-900">${booking.total_amount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Common Reasons */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Common Reasons for Payment Failure</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {getCommonReasons().map((reason, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl mt-1">
                    {reason.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{reason.title}</h4>
                    <p className="text-sm text-gray-600">{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Button
              onClick={handleTryAgain}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <FaRedo />
              <span>Try Again</span>
            </Button>
            {bookingId && (
              <Button
                onClick={handleViewBooking}
                variant="outline"
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <FaCalendar />
                <span>View Booking Details</span>
              </Button>
            )}
            <Button
              onClick={() => navigate(ROUTES.CLIENT_DASHBOARD)}
              variant="outline"
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <FaHome />
              <span>Go to Dashboard</span>
            </Button>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Need Help?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Contact Support</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <FaPhone className="text-blue-500" />
                    <span className="text-blue-700">1-800-MEETGO-1</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaEnvelope className="text-blue-500" />
                    <span className="text-blue-700">support@meetgo.com</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => toast.info('FAQ coming soon')}
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    View FAQ
                  </button>
                  <br />
                  <button 
                    onClick={() => toast.info('Live chat coming soon')}
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    Start Live Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
