/**
 * Client Dashboard Page
 * Dashboard for client users to browse companions and manage bookings
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { Booking } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import VerificationModal from '../../components/VerificationModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ROUTES } from '../../constants';
import { bookingApi } from '../../api/booking';
import clientApi from '../../api/client';
import { FaCalendarAlt, FaIdCard, FaSearch, FaUser, FaHeart, FaCreditCard, FaUserTie, FaMoneyBillWave, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';
import ErrorBoundary from '../../components/ErrorBoundary';
import AsyncErrorBoundary, { useAsyncError } from '../../components/AsyncErrorBoundary';
import logger, { logComponentError } from '../../utils/logger';

type VerificationStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

const ClientDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { throwError } = useAsyncError();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('not_submitted');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
    fetchVerificationStatus();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoadingBookings(true);
      const fetchedBookings = await bookingApi.getBookings();
      logger.info('Client received bookings', { bookingsCount: fetchedBookings?.length || 0 });
      if (fetchedBookings && fetchedBookings.length > 0) {
        logger.debug('First booking details', {
          firstBooking: fetchedBookings[0],
          bookingDate: fetchedBookings[0].bookingDate
        });
      }
      setBookings(fetchedBookings || []);
    } catch (error) {
      logComponentError('ClientDashboard', error, { action: 'fetchBookings' });
      toast.error('Failed to load bookings');
      throwError(error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const fetchVerificationStatus = async () => {
    try {
      const status = await clientApi.getVerificationStatus();
      setVerificationStatus(status.verificationStatus || 'not_submitted');
    } catch (error) {
      logComponentError('ClientDashboard', error, { action: 'fetchVerificationStatus' });
      // Default to not_submitted if there's an error
      setVerificationStatus('not_submitted');
    }
  };

  const handleVerifyIdentity = () => {
    setIsVerificationModalOpen(true);
  };

  const handleVerificationSuccess = () => {
    setVerificationStatus('pending');
    toast.success('Verification submitted successfully! We\'ll review it within 24 hours.');
  };

  const handleBrowseCompanions = () => {
    navigate('/browse-companions');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'confirmed':
        return <FaCheckCircle className="text-green-500" />;
      case 'completed':
        return <FaCheckCircle className="text-[#312E81]" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaExclamationCircle className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Awaiting Approval';
      case 'confirmed':
        return 'Approved';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'no_show':
        return 'No Show';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (date: string) => {
    // Handle null, undefined, or empty date
    if (!date) {
      return 'Date not available';
    }

    // Try to parse the date
    const parsedDate = new Date(date);

    // Check if the date is valid
    if (isNaN(parsedDate.getTime())) {
      return 'Date not available';
    }

    // Format valid date
    return parsedDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    // Handle null, undefined, or empty time
    if (!time || !time.includes(':')) {
      return 'Time not available';
    }

    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const minute = parseInt(minutes);

      // Validate the parsed values
      if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        return 'Time not available';
      }

      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return 'Time not available';
    }
  };

  if (!user) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">View your bookings and activity</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - My Bookings */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Bookings Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <FaCalendarAlt className="text-[#312E81] text-xl" />
                <h2 className="text-xl font-bold text-gray-900">My Bookings</h2>
              </div>
              
              {isLoadingBookings ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-32"></div>
                    </div>
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12">
                  <FaCalendarAlt className="mx-auto text-6xl text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No bookings yet</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Start browsing companions to make your first booking
                  </p>
                  <button
                    onClick={handleBrowseCompanions}
                    className="mt-6 px-6 py-2.5 bg-gradient-to-r from-[#312E81] to-[#FFCCCB] text-white font-medium rounded-lg hover:from-[#1E1B4B] hover:to-[#FFCCCB] hover:shadow-[0_0_25px_rgba(255,204,203,0.5)] transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Browse Companions
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4A47A3] to-[#FFC7C7] flex items-center justify-center text-white font-semibold">
                              {booking.companionName?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {booking.companionName || 'Companion'}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {formatDate(booking.bookingDate)}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                              <FaClock className="text-gray-400" />
                              <span className="text-gray-600">
                                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FaMoneyBillWave className="text-gray-400" />
                              <span className="text-gray-900 font-semibold">
                                ${booking.totalAmount}
                              </span>
                            </div>
                          </div>

                          {booking.meetingLocation && (
                            <p className="text-sm text-gray-600 mt-2">
                              📍 {booking.meetingLocation}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            {getStatusLabel(booking.status)}
                          </span>

                          <div className="flex gap-2">
                            {booking.status === 'pending' && (
                              <button
                                onClick={() => toast('Cancel feature coming soon', { icon: '🚫' })}
                                className="text-xs px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                            {booking.status === 'completed' && !booking.hasReview && (
                              <button
                                onClick={() => toast('Review feature coming soon', { icon: '⭐' })}
                                className="text-xs px-3 py-1 border border-[#312E81]/30 text-[#312E81] rounded hover:bg-[#312E81]/10 transition-colors"
                              >
                                Leave Review
                              </button>
                            )}
                            <button
                              onClick={() => toast('Details view coming soon', { icon: '📋' })}
                              className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Become a Companion */}
            <div className="bg-gradient-to-br from-[#F5F4FB] to-[#FFF0F0] rounded-lg shadow-md border-2 border-[#312E81]/20 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#312E81] to-[#FFCCCB] rounded-full flex items-center justify-center">
                  <FaUserTie className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Want to Earn?</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Become a companion and start earning money by offering your time and company!
                  </p>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <FaMoneyBillWave className="text-success-600" />
                  <span className="text-sm font-semibold text-gray-900">Earn up to $50/hour</span>
                </div>
                <ul className="space-y-1 text-xs text-gray-600 ml-6">
                  <li>• Flexible schedule</li>
                  <li>• Choose your clients</li>
                  <li>• Safe and secure platform</li>
                </ul>
              </div>

              <button
                onClick={() => navigate(ROUTES.COMPANION_APPLICATION)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#312E81] to-[#FFCCCB] text-white font-semibold rounded-lg hover:from-[#1E1B4B] hover:to-[#FFCCCB] hover:shadow-[0_0_25px_rgba(255,204,203,0.5)] transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <FaUserTie />
                Apply as Companion
              </button>

              <p className="text-xs text-[#1E1B4B] mt-3 text-center">
                ✨ Join 500+ companions already earning
              </p>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
                {verificationStatus === 'approved' && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    <FaCheckCircle className="text-xs" />
                    <span className="text-xs">Verified</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleBrowseCompanions}
                  className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-[#312E81] hover:bg-[#312E81]/10 hover:shadow-[0_0_15px_rgba(255,204,203,0.3)] transition-all duration-200 group"
                >
                  <FaSearch className="text-xl text-gray-400 group-hover:text-[#312E81] transition-colors" />
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">Browse Companions</h3>
                    <p className="text-xs text-gray-500">Find your perfect match</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/favorites')}
                  className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-[#FFCCCB] hover:bg-[#FFCCCB]/10 hover:shadow-[0_0_15px_rgba(255,204,203,0.3)] transition-all duration-200 group"
                >
                  <FaHeart className="text-xl text-gray-400 group-hover:text-[#FF9F9F] transition-colors" />
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">My Favorites</h3>
                    <p className="text-xs text-gray-500">Saved companions</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate(ROUTES.CLIENT_PROFILE)}
                  className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-[#312E81] hover:bg-[#312E81]/10 hover:shadow-[0_0_15px_rgba(255,204,203,0.3)] transition-all duration-200 group"
                >
                  <FaUser className="text-xl text-gray-400 group-hover:text-[#312E81] transition-colors" />
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">My Profile</h3>
                    <p className="text-xs text-gray-500">Edit your information</p>
                  </div>
                </button>

                <button
                  onClick={() => toast('Payment methods feature coming soon!', { icon: '💳' })}
                  className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-[#22c55e] hover:bg-[#22c55e]/10 hover:shadow-[0_0_15px_rgba(255,204,203,0.3)] transition-all duration-200 group"
                >
                  <FaCreditCard className="text-xl text-gray-400 group-hover:text-[#22c55e] transition-colors" />
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">Payment Methods</h3>
                    <p className="text-xs text-gray-500">Manage payments</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Identity Verification Box */}
            {verificationStatus !== 'approved' && (
              <div className={`rounded-lg shadow-md border-2 p-6 ${
                verificationStatus === 'pending'
                  ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200'
                  : verificationStatus === 'rejected'
                  ? 'bg-gradient-to-br from-red-50 to-blue-50 border-red-200'
                  : 'bg-gradient-to-br from-[#F5F4FB] to-[#FFF0F0] border-[#312E81]/20'
              }`}>
                {verificationStatus === 'pending' ? (
                  <>
                    <div className="flex items-start gap-3 mb-4">
                      <FaClock className="text-yellow-600 text-2xl flex-shrink-0 mt-1" />
                      <h3 className="text-lg font-bold text-gray-900">Verification Pending</h3>
                    </div>
                    <p className="text-gray-700 text-sm mb-5 leading-relaxed">
                      Your identity verification is being reviewed. We'll notify you within 24 hours once it's approved.
                    </p>
                    <div className="bg-yellow-100 rounded-lg p-3 text-center">
                      <p className="text-sm text-yellow-800 font-medium">
                        ⏱️ Review in progress...
                      </p>
                    </div>
                  </>
                ) : verificationStatus === 'rejected' ? (
                  <>
                    <div className="flex items-start gap-3 mb-4">
                      <FaExclamationCircle className="text-red-600 text-2xl flex-shrink-0 mt-1" />
                      <h3 className="text-lg font-bold text-gray-900">Verification Rejected</h3>
                    </div>
                    <p className="text-gray-700 text-sm mb-5 leading-relaxed">
                      Your verification was not approved. Please resubmit with clear, valid documents.
                    </p>
                    <button
                      onClick={handleVerifyIdentity}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-[#1E1B4B] text-white font-semibold rounded-lg hover:from-red-600 hover:to-[#1E1B4B] transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <FaIdCard />
                      Resubmit Verification
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3 mb-4">
                      <FaIdCard className="text-[#312E81] text-2xl flex-shrink-0 mt-1" />
                      <h3 className="text-lg font-bold text-gray-900">Verify Your Identity</h3>
                    </div>
                    <p className="text-gray-700 text-sm mb-5 leading-relaxed">
                      Before your first booking, please verify your identity by uploading a government-approved ID.
                    </p>
                    <button
                      onClick={handleVerifyIdentity}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#312E81] to-[#FFCCCB] text-white font-semibold rounded-lg hover:from-[#1E1B4B] hover:to-[#FFCCCB] hover:shadow-[0_0_25px_rgba(255,204,203,0.5)] transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <FaIdCard />
                      Verify Now
                    </button>
                    <p className="text-xs text-[#1E1B4B] mt-3 text-center">
                      🔒 Your information is secure and encrypted
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Total Bookings</span>
                  <span className="text-2xl font-bold text-gray-900">{bookings.length}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Upcoming</span>
                  <span className="text-2xl font-bold text-[#312E81]">
                    {bookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Completed</span>
                  <span className="text-2xl font-bold text-success-600">
                    {bookings.filter(b => b.status === 'completed').length}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onSuccess={handleVerificationSuccess}
      />
    </div>
  );
};

const ClientDashboardWithErrorBoundary = () => (
  <ErrorBoundary level="page" showDetails={false}>
    <AsyncErrorBoundary maxRetries={3} retryDelay={1000}>
      <ClientDashboard />
    </AsyncErrorBoundary>
  </ErrorBoundary>
);

export default ClientDashboardWithErrorBoundary;