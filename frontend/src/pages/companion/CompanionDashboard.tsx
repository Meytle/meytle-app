/**
 * Companion Dashboard
 * Shows application status, bookings, and profile management
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FaCalendar,
  FaUser,
  FaStar,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaFileAlt,
  FaBell,
  FaHistory,
  FaComments,
  FaMoneyBillWave,
  FaCog,
  FaBookOpen,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { API_CONFIG, ROUTES } from '../../constants';
// Removed localStorage import - using cookies instead
import AvailabilityManager from '../../components/companion/AvailabilityManager';
import BookingsManager from '../../components/companion/BookingsManager';
import { bookingApi } from '../../api/booking';
// Stripe integration removed - will be implemented later

interface ApplicationStatus {
  status: 'pending' | 'approved' | 'rejected';
  appliedDate: string;
  reviewedDate?: string;
  rejectionReason?: string;
}

interface BookingRequest {
  id: number;
  client_name: string;
  requested_date: string;
  start_time?: string;
  end_time?: string;
  duration_hours: number;
  service_type?: string;
  extra_amount?: number;
  meeting_location?: string;
  special_requests?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

const CompanionDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'availability' | 'bookings'>('overview');
  // Stripe state removed - will be implemented later
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Fetch actual application status from API
  useEffect(() => {
    const fetchApplicationStatus = async () => {
      try {
        // Use withCredentials to send cookies automatically
        const response = await axios.get(
          `${API_CONFIG.BASE_URL}/companion/application/status`,
          {
            withCredentials: true,
          }
        );

        const app = response.data.data.application;
        setApplicationStatus({
          status: app.status,
          appliedDate: new Date(app.created_at).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
          }),
          reviewedDate: app.reviewed_at ? new Date(app.reviewed_at).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
          }) : undefined,
          rejectionReason: app.rejection_reason,
        });

        // Stripe account status check removed - will be implemented later
      } catch (error: any) {
        console.error('❌ Error fetching application status:', error);
        // If no application found (404), redirect to application form
        if (error.response?.status === 404) {
          console.log('📝 No application found - redirecting to application form');
          navigate(ROUTES.COMPANION_APPLICATION, { replace: true });
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicationStatus();
  }, []);

  // Fetch booking requests
  useEffect(() => {
    const fetchBookingRequests = async () => {
      if (applicationStatus?.status !== 'approved') return;

      setIsLoadingRequests(true);
      try {
        const requests = await bookingApi.getBookingRequests({
          role: 'companion',
          status: 'pending'
        });
        setBookingRequests(requests as any);
      } catch (error) {
        console.error('Failed to fetch booking requests:', error);
      } finally {
        setIsLoadingRequests(false);
      }
    };

    fetchBookingRequests();
  }, [applicationStatus]);

  // Handle accepting/rejecting booking requests
  const handleRequestAction = async (requestId: number, action: 'accepted' | 'rejected') => {
    try {
      await bookingApi.updateBookingRequestStatus(requestId, { status: action });
      toast.success(`Booking request ${action}`);

      // Refresh booking requests
      const requests = await bookingApi.getBookingRequests({
        role: 'companion',
        status: 'pending'
      });
      setBookingRequests(requests as any);
    } catch (error) {
      console.error(`Failed to ${action} booking request:`, error);
      toast.error(`Failed to ${action} booking request`);
    }
  };

  // Stripe onboarding functions removed - will be implemented later

  const getStatusBadge = () => {
    if (!applicationStatus) return null;
    
    switch (applicationStatus.status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-2 bg-warning-100 text-warning-800 px-4 py-2 rounded-full text-sm font-medium">
            <FaClock className="w-4 h-4" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-full text-sm font-medium">
            <FaCheckCircle className="w-4 h-4" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-2 bg-error-100 text-error-800 px-4 py-2 rounded-full text-sm font-medium">
            <FaTimesCircle className="w-4 h-4" />
            Rejected
          </span>
        );
    }
  };

  const getStatusMessage = () => {
    if (!applicationStatus) return '';
    
    switch (applicationStatus.status) {
      case 'pending':
        return "Your companion application is under review. We'll notify you once it's processed.";
      case 'approved':
        return "Congratulations! Your companion application has been approved. You are now visible on the browse page and can accept bookings.";
      case 'rejected':
        return applicationStatus.rejectionReason || "Your application was not approved. Please contact support for more information.";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Companion Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your profile, bookings, and reviews</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FaUser className="w-4 h-4" />
                Overview
              </div>
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'availability'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FaClock className="w-4 h-4" />
                Availability
              </div>
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookings'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FaCalendar className="w-4 h-4" />
                Bookings
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Bookings & Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Requests */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <FaBell className="text-primary-600 text-xl" />
                <h2 className="text-xl font-bold text-gray-900">Booking Requests</h2>
                {bookingRequests.length > 0 && (
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                    {bookingRequests.length} New
                  </span>
                )}
              </div>

              {isLoadingRequests ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                </div>
              ) : bookingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <FaBell className="mx-auto text-6xl text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No pending booking requests</p>
                  <p className="text-gray-400 text-sm mt-2">
                    You'll see new booking requests here when clients request your time
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookingRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{request.client_name}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(request.requested_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        {request.extra_amount && request.extra_amount > 0 && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                            +${request.extra_amount} tip
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 mb-3">
                        {request.start_time && request.end_time && (
                          <p>
                            <FaClock className="inline mr-1" />
                            {request.start_time} - {request.end_time}
                          </p>
                        )}
                        {request.service_type && (
                          <p>
                            <FaFileAlt className="inline mr-1" />
                            {request.service_type}
                          </p>
                        )}
                        {request.meeting_location && (
                          <p>
                            <FaMapMarkerAlt className="inline mr-1" />
                            {request.meeting_location}
                          </p>
                        )}
                        {request.special_requests && (
                          <p className="italic">"{request.special_requests}"</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRequestAction(request.id, 'accepted')}
                          className="flex-1 px-3 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FaCheckCircle className="inline mr-1" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleRequestAction(request.id, 'rejected')}
                          className="flex-1 px-3 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <FaTimesCircle className="inline mr-1" />
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* All Bookings */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <FaHistory className="text-primary-600 text-xl" />
                <h2 className="text-xl font-bold text-gray-900">All Bookings</h2>
              </div>
              <div className="text-center py-12">
                <FaHistory className="mx-auto text-6xl text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No bookings yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Your completed bookings will appear here
                </p>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <FaComments className="text-primary-600 text-xl" />
                <h2 className="text-xl font-bold text-gray-900">Recent Reviews</h2>
              </div>
              <div className="text-center py-12">
                <FaComments className="mx-auto text-6xl text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No reviews yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Client reviews will appear here after completed bookings
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Application Status & Quick Actions */}
          <div className="space-y-6">
            {/* Application Status */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <FaUser className="text-primary-600 text-xl" />
                <h2 className="text-xl font-bold text-gray-900">Companion Application Status</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  {getStatusBadge()}
                </div>
                
                <p className="text-sm text-gray-600 text-center leading-relaxed">
                  {getStatusMessage()}
                </p>
                
                <div className="space-y-1">
                  <p className="text-xs text-gray-400 text-center">
                    Applied: {applicationStatus?.appliedDate}
                  </p>
                  {applicationStatus?.reviewedDate && (
                    <p className="text-xs text-gray-400 text-center">
                      Reviewed: {applicationStatus.reviewedDate}
                    </p>
                  )}
                </div>

                {applicationStatus?.status === 'approved' && (
                  <button 
                    onClick={() => navigate(ROUTES.COMPANION_PROFILE)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-4 rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 font-medium shadow-sm"
                  >
                    <FaFileAlt className="w-4 h-4" />
                    Manage Your Profile
                  </button>
                )}
              </div>
            </div>

            {/* Payment Setup removed - will be implemented later */}

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Total Bookings</span>
                  <span className="text-lg font-semibold text-gray-900">0</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Total Reviews</span>
                  <span className="text-lg font-semibold text-gray-900">0</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate(ROUTES.COMPANION_PROFILE)}
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 group"
                >
                  <FaUser className="text-2xl text-gray-400 group-hover:text-primary-600 transition-colors" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Edit Profile</h3>
                    <p className="text-sm text-gray-500">Manage your information</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('bookings')}
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-accent-500 hover:bg-accent-50 transition-all duration-200 group"
                >
                  <FaCalendar className="text-2xl text-gray-400 group-hover:text-accent-600 transition-colors" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">View Bookings</h3>
                    <p className="text-sm text-gray-500">Manage your bookings</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('availability')}
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-success-500 hover:bg-success-50 transition-all duration-200 group"
                >
                  <FaClock className="text-2xl text-gray-400 group-hover:text-success-600 transition-colors" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Set Availability</h3>
                    <p className="text-sm text-gray-500">Update your hours</p>
                  </div>
                </button>

                {/* Payment Setup button removed - will be implemented later */}
                <button
                  onClick={() => toast('Earnings feature coming soon!', { icon: 'ℹ️' })}
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-secondary-500 hover:bg-secondary-50 transition-all duration-200 group"
                >
                  <FaMoneyBillWave className="text-2xl text-gray-400 group-hover:text-secondary-600 transition-colors" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">View Earnings</h3>
                    <p className="text-sm text-gray-500">Track your income</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'availability' && (
          <AvailabilityManager />
        )}

        {activeTab === 'bookings' && (
          <BookingsManager />
        )}
      </main>
    </div>
  );
};

export default CompanionDashboard;
