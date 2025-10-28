/**
 * Browse Companions Page
 * Displays all approved companions with their profile information
 * Includes client identity verification requirements
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaMapMarkerAlt, FaCalendarAlt, FaStar, FaEye, FaUserTie, FaExchangeAlt, FaShieldAlt, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import { API_CONFIG, ROUTES } from '../constants';
import axios from 'axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import QuickBookingModal from '../components/booking/QuickBookingModal';
import Badge from '../components/common/Badge';
import VerificationModal from '../components/VerificationModal';
import { useAuth } from '../hooks/useAuth';
import { companionsApi } from '../api/companions';
import clientApi from '../api/client';
import type { Companion } from '../types';
import { toast } from 'react-hot-toast';
import FavoriteButton from '../components/common/FavoriteButton';
import { favoritesApi } from '../api/favorites';

type VerificationStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected';

const BrowseCompanions = () => {
  const { user, isAuthenticated, switchRole, hasRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  // Client verification states
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('not_submitted');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);

  // Available interest options
  const availableInterests = [
    'Coffee', 'Dinner', 'Movies', 'Sports', 'Art', 'Music',
    'Travel', 'Shopping', 'Hiking', 'Gaming', 'Beach', 'Nightlife'
  ];

  // Available service options
  const availableServices = [
    'Coffee Date', 'Dinner Companion', 'Movie Night', 'Shopping Companion',
    'Museum Visit', 'Concert/Event', 'Walking/Hiking', 'Beach Day',
    'City Tour', 'Sports Event', 'Theater/Play', 'Travel Companion'
  ];

  // Check if current user is a companion
  const isCompanion = user?.activeRole === 'companion';
  const isClient = user?.activeRole === 'client';
  const hasClientRole = hasRole && hasRole('client');

  // Get dashboard route based on user role
  const getDashboardRoute = () => {
    if (!user) return ROUTES.HOME;
    switch (user.activeRole) {
      case 'admin':
        return ROUTES.ADMIN_DASHBOARD;
      case 'companion':
        return ROUTES.COMPANION_DASHBOARD;
      case 'client':
        return ROUTES.CLIENT_DASHBOARD;
      default:
        return '/dashboard'; // Will use the redirect route
    }
  };

  // Check client verification status on mount
  useEffect(() => {
    if (isAuthenticated && isClient) {
      checkClientVerification();
      fetchFavoriteIds();
    } else {
      fetchCompanions();
    }
  }, [isAuthenticated, isClient]);

  useEffect(() => {
    if (verificationStatus === 'approved' || !isAuthenticated || !isClient) {
      fetchCompanions();
    }
  }, [verificationStatus]); // Removed selectedInterests to prevent reload on filter change

  const checkClientVerification = async () => {
    try {
      setCheckingVerification(true);

      // Check verification status
      const status = await clientApi.getVerificationStatus();
      setVerificationStatus(status.verificationStatus || 'not_submitted');

      // Check if location is set (checking for proper address fields)
      const profile = await clientApi.getProfile();
      const hasAddress = !!(
        profile.verification?.addressLine &&
        profile.verification?.city &&
        profile.verification?.country
      );
      setHasLocation(hasAddress);

      // Don't automatically show modal - let the UI handle it
      if (status.verificationStatus === 'not_submitted' || status.verificationStatus === 'rejected') {
        // Just set the status, don't open modal automatically
        // setShowVerificationModal(true); // Removed to keep header visible
      } else if (!hasAddress && status.verificationStatus !== 'approved') {
        toast.error('Please add your complete address in your profile before browsing companions');
        navigate('/client-profile');
      }

      // Only fetch companions if approved
      if (status.verificationStatus === 'approved') {
        await fetchCompanions();
      }
    } catch (error) {
      console.error('Error checking verification:', error);
      // Don't load companions if verification check fails
      setVerificationStatus('not_submitted');
      // Don't automatically show modal - let UI handle it
      // setShowVerificationModal(true); // Removed to keep header visible
    } finally {
      setCheckingVerification(false);
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    setVerificationStatus('pending');
    setShowVerificationModal(false);
    toast.success('Verification submitted! We\'ll review it within 24 hours.');
  };

  const fetchCompanions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await companionsApi.getCompanions(selectedInterests.length > 0 ? selectedInterests : undefined);

      if (response.status === 'success') {
        setCompanions(response.data);
      } else {
        setError('Failed to fetch companions');
      }
    } catch (error: any) {
      console.error('Error fetching companions:', error);
      setError(error.response?.data?.message || 'Failed to fetch companions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFavoriteIds = async () => {
    if (!isAuthenticated) return;

    try {
      const ids = await favoritesApi.getFavoriteIds();
      setFavoriteIds(ids);
    } catch (error) {
      console.error('Error fetching favorite IDs:', error);
      // Silently fail - favorites feature will still work without initial state
    }
  };

  const filteredCompanions = companions
    .filter(companion => {
      // Filter by interests if any selected
      if (selectedInterests.length > 0) {
        const hasMatchingInterest = companion.interests?.some((interest: string) =>
          selectedInterests.includes(interest)
        );
        if (!hasMatchingInterest) return false;
      }

      // Filter by services if any selected
      if (selectedServices.length > 0) {
        const hasMatchingService = companion.services?.some((service: string) =>
          selectedServices.includes(service)
        );
        if (!hasMatchingService) return false;
      }

      return true;
    });

  const formatJoinDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    } catch (error) {
      return 'Recently';
    }
  };

  const handleBookCompanion = (companion: Companion) => {
    // Redirect to signin if not authenticated
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    // Convert CompanionData to Companion type for the modal
    const companionForBooking: Companion = {
      id: companion.id,
      name: companion.name,
      age: companion.age,
      location: 'Winnipeg', // Default location
      description: 'Professional companion',
      rating: 5,
      reviewCount: 0,
      responseTime: '30 minutes',
      imageUrl: companion.profilePhotoUrl ? `${API_CONFIG.BASE_URL.replace('/api', '')}${companion.profilePhotoUrl}` : '',
      profilePhotoUrl: companion.profilePhotoUrl,
      isVerified: true,
      isAvailable: true,
      interests: companion.interests || [],
      joinedDate: companion.joinedDate
    };

    setSelectedCompanion(companionForBooking);
    setIsBookingModalOpen(true);
  };

  const handleViewProfile = (companionId: number) => {
    // Redirect to signin if not authenticated
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    // Navigate to profile page
    navigate(`/companion/${companionId}`);
  };

  const handleBookingCreated = (bookingId: number) => {
    console.log('Booking created with ID:', bookingId);
    // You could show a success message or redirect to bookings page
  };

  const handleSwitchToClient = async () => {
    try {
      await switchRole('client');
      toast.success('Switched to client mode');
      // Page will refresh automatically after role switch
    } catch (error) {
      toast.error('Failed to switch role. Please try again.');
    }
  };

  if (isLoading || checkingVerification) {
    return (
      <div className="py-32 px-4">
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-32 px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCompanions}
            className="bg-[#312E81] text-white px-6 py-2 rounded-lg hover:bg-[#1E1B4B] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show verification requirement for unverified clients
  if (isAuthenticated && isClient && (verificationStatus === 'not_submitted' || verificationStatus === 'rejected')) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Page content - header remains visible */}
        <div className="py-16 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              {/* Icon */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#f0effe] to-[#f0effe] rounded-full mb-4">
                  <FaShieldAlt className="text-[#312E81] text-5xl" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Identity Verification Required
                </h1>
                <p className="text-lg text-gray-600">
                  To browse and book companions, you need to verify your identity
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex justify-center mb-6">
                {verificationStatus === 'rejected' ? (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <FaTimesCircle className="mr-2" />
                    Verification Rejected - Please Resubmit
                  </span>
                ) : (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                    <FaExclamationTriangle className="mr-2" />
                    Verification Not Started
                  </span>
                )}
              </div>

              {/* Requirements */}
              <div className="bg-[#f9f8ff] rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-[#1E1B4B] mb-3">What you'll need:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-[#312E81] mt-0.5 flex-shrink-0" />
                    <span className="text-[#1E1B4B]">Complete address information in your profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-[#312E81] mt-0.5 flex-shrink-0" />
                    <span className="text-[#1E1B4B]">Government-issued photo ID</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaCheckCircle className="text-[#312E81] mt-0.5 flex-shrink-0" />
                    <span className="text-[#1E1B4B]">Date of birth and ID number</span>
                  </li>
                </ul>
              </div>

              {/* Process Info */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Verification Process:</h3>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-[#312E81] text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                    <div>
                      <p className="font-medium text-gray-800">Complete Your Profile</p>
                      <p className="text-sm text-gray-600">Add your full address information</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-[#312E81] text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                    <div>
                      <p className="font-medium text-gray-800">Submit Verification</p>
                      <p className="text-sm text-gray-600">Upload your ID and personal details</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-[#312E81] text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                    <div>
                      <p className="font-medium text-gray-800">Admin Review</p>
                      <p className="text-sm text-gray-600">We'll review within 24 hours</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">✓</span>
                    <div>
                      <p className="font-medium text-gray-800">Start Browsing!</p>
                      <p className="text-sm text-gray-600">Access all companions once approved</p>
                    </div>
                  </li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {!hasLocation ? (
                  <button
                    onClick={() => navigate('/client-profile')}
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#312E81] to-[#312E81] text-white font-semibold rounded-lg hover:from-[#1E1B4B] hover:to-[#1E1B4B] transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <FaMapMarkerAlt />
                    Complete Profile First
                  </button>
                ) : (
                  <button
                    onClick={() => setShowVerificationModal(true)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#312E81] to-[#312E81] text-white font-semibold rounded-lg hover:from-[#1E1B4B] hover:to-[#1E1B4B] transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <FaShieldAlt />
                    {verificationStatus === 'rejected' ? 'Resubmit Verification' : 'Start Verification'}
                  </button>
                )}
                <button
                  onClick={() => navigate('/client-dashboard')}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Modal - Only opens when button clicked */}
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          onSuccess={handleVerificationSuccess}
        />
      </div>
    );
  }

  // Show verification status for clients
  if (isAuthenticated && isClient) {
    // Pending verification
    if (verificationStatus === 'pending') {
      return (
        <div className="py-12 px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full">
                  <FaClock className="text-yellow-600 text-4xl" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Verification In Progress
              </h2>
              <p className="text-gray-600 mb-6">
                Thank you for submitting your verification! Our team is reviewing your documents and will approve your account within 24 hours.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Status:</strong> Waiting for admin approval
                </p>
              </div>
              <button
                onClick={() => navigate('/client-dashboard')}
                className="w-full px-6 py-3 bg-[#312E81] text-white rounded-lg hover:bg-[#1E1B4B] transition-colors font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Rejected verification
    if (verificationStatus === 'rejected') {
      return (
        <div className="py-12 px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
                  <FaTimesCircle className="text-red-600 text-4xl" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Verification Rejected
              </h2>
              <p className="text-gray-600 mb-6">
                Unfortunately, your verification was not approved. Please submit new documents with clear, valid information.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setShowVerificationModal(true)}
                  className="w-full px-6 py-3 bg-[#312E81] text-white rounded-lg hover:bg-[#1E1B4B] transition-colors font-medium"
                >
                  Submit New Verification
                </button>
                <button
                  onClick={() => navigate('/client-dashboard')}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Check location requirement
    if (!hasLocation && verificationStatus === 'approved') {
      return (
        <div className="py-12 px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full">
                  <FaMapMarkerAlt className="text-[#312E81] text-4xl" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Location Required
              </h2>
              <p className="text-gray-600 mb-6">
                Please add your current location to your profile before browsing companions. This helps us show you companions in your area.
              </p>
              <button
                onClick={() => navigate('/client-profile')}
                className="w-full px-6 py-3 bg-[#312E81] text-white rounded-lg hover:bg-[#1E1B4B] transition-colors font-medium"
              >
                Update Profile Location
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Show simplified view for companions - clear message with options
  if (isAuthenticated && isCompanion) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
            {/* Icon */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#f0effe] rounded-full">
                <FaUserTie className="text-[#312E81] text-4xl" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Join as a Client to Browse Companions
            </h2>

            {/* Description */}
            <p className="text-gray-600 mb-6">
              As a companion, you need to switch to client mode to browse and book other companions.
              This ensures a professional boundary between service providers.
            </p>

            {/* Actions */}
            <div className="space-y-3">
              {hasClientRole ? (
                <>
                  <button
                    onClick={handleSwitchToClient}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#312E81] text-white rounded-lg hover:bg-[#1E1B4B] transition-colors font-medium"
                  >
                    <FaExchangeAlt />
                    Switch to Client Mode
                  </button>
                  <button
                    onClick={() => navigate('/companion-dashboard')}
                    className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Back to Dashboard
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-4">
                    You don't have a client account. To browse companions, you need to create a separate client account.
                    <br />
                    <strong className="text-gray-700">You will be logged out to create a new account.</strong>
                  </p>
                  <button
                    onClick={async () => {
                      // Actually sign out the user first
                      await signOut();
                      // Then redirect to signup page
                      navigate('/signup');
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#312E81] text-white rounded-lg hover:bg-[#1E1B4B] transition-colors font-medium"
                  >
                    <FaUser />
                    Create Client Account
                  </button>
                  <button
                    onClick={() => navigate('/companion-dashboard')}
                    className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Back to Dashboard
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal view for clients and non-authenticated users
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Always Visible */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Browse Companions</h1>
              <p className="mt-1 text-sm text-gray-500">
                Find your perfect companion for memorable experiences
              </p>
            </div>
            {isAuthenticated && (
              <button
                onClick={() => navigate(getDashboardRoute())}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                ← Back to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isAuthenticated && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            {/* Interests Filter */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-[#312E81]">💜</span> Filter by Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableInterests.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedInterests(selectedInterests.filter(i => i !== interest));
                        } else {
                          setSelectedInterests([...selectedInterests, interest]);
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#312E81] to-[#312E81] text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
                {selectedInterests.length > 0 && (
                  <button
                    onClick={() => setSelectedInterests([])}
                    className="px-3 py-2 rounded-full text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>
            </div>

            {/* Services Filter */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-[#312E81]">✨</span> Filter by Services
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableServices.map((service) => {
                  const isSelected = selectedServices.includes(service);
                  return (
                    <button
                      key={service}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedServices(selectedServices.filter(s => s !== service));
                        } else {
                          setSelectedServices([...selectedServices, service]);
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#312E81] to-[#312E81] text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {service}
                    </button>
                  );
                })}
                {selectedServices.length > 0 && (
                  <button
                    onClick={() => setSelectedServices([])}
                    className="px-3 py-2 rounded-full text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  >
                    ✕ Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredCompanions.length} companion{filteredCompanions.length !== 1 ? 's' : ''}
            {(selectedInterests.length > 0 || selectedServices.length > 0) && ' (filtered)'}
          </p>
        </div>

        {/* Companions Grid */}
        {filteredCompanions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {(selectedInterests.length > 0 || selectedServices.length > 0) ? 'No matching companions' : 'No companions available'}
            </h3>
            <p className="text-gray-600">
              {(selectedInterests.length > 0 || selectedServices.length > 0)
                ? 'Try adjusting your filters or clear them to see all companions'
                : 'Check back later for new companions'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCompanions.map((companion) => {
              // Extract the name from email if name looks like an email
              const displayName = companion.name && companion.name.includes('@')
                ? companion.email?.split('@')[0] || companion.name.split('@')[0] || 'Companion'
                : companion.name || 'Companion';

              return (
                <div
                  key={companion.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
                >
                  {/* Profile Photo - Cleaner, smaller */}
                  <div className="relative h-56 bg-gradient-to-br from-[#f0effe] to-[#f0effe]">
                    {companion.profilePhotoUrl ? (
                      <img
                        src={`${API_CONFIG.BASE_URL.replace('/api', '')}${companion.profilePhotoUrl}`}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`${companion.profilePhotoUrl ? 'hidden' : ''} absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#4A47A3] to-[#4A47A3]`}>
                      <FaUser className="text-white text-5xl opacity-80" />
                    </div>

                    {/* Favorite button overlay */}
                    {isAuthenticated && (
                      <div className="absolute top-3 right-3">
                        <FavoriteButton
                          companionId={companion.id}
                          companionName={displayName}
                          initialFavorited={favoriteIds.includes(companion.id)}
                          size="md"
                          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-md"
                          onToggle={(isFavorited) => {
                            if (isFavorited) {
                              setFavoriteIds(prev => [...prev, companion.id]);
                            } else {
                              setFavoriteIds(prev => prev.filter(id => id !== companion.id));
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Profile Info - Simplified */}
                  <div className="p-5 flex flex-col flex-1">
                    {/* Top section - Name, Age, Interests */}
                    <div className="flex-grow">
                      {/* Name and Age */}
                      <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 capitalize">
                        {displayName}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-600">
                          {companion.age} years
                        </span>
                        {companion.location && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                              <FaMapMarkerAlt className="text-[#312E81]" size={12} />
                              {companion.location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Interests - Simplified */}
                    {companion.interests && companion.interests.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1.5">
                          {companion.interests.slice(0, 3).map((interest: string, index: number) => (
                            <span
                              key={index}
                              className="px-2.5 py-1 bg-[#f0effe] text-[#1E1B4B] text-xs font-medium rounded-full"
                            >
                              {interest}
                            </span>
                          ))}
                          {companion.interests.length > 3 && (
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                              +{companion.interests.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    </div>

                    {/* Action Buttons - Always at bottom */}
                    <div className="flex gap-2 mt-auto">
                      {isAuthenticated && user?.id === companion.id ? (
                        <button
                          disabled
                          className="flex-1 bg-gray-100 text-gray-400 py-2.5 px-4 rounded-lg cursor-not-allowed font-medium text-sm"
                        >
                          Your Profile
                        </button>
                      ) : (
                        <button
                          onClick={() => handleViewProfile(companion.id)}
                          className="w-full bg-gradient-to-r from-[#312E81] to-[#312E81] text-white py-2.5 px-4 rounded-lg hover:from-[#1E1B4B] hover:to-[#1E1B4B] transition-all font-medium text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <FaEye className="text-lg" />
                          <span>View Profile</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedCompanion && (
        <QuickBookingModal
          companion={selectedCompanion}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onBookingCreated={handleBookingCreated}
        />
      )}

      {/* Verification Modal for Clients */}
      {isAuthenticated && isClient && (
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          onSuccess={handleVerificationSuccess}
        />
      )}
    </div>
  );
};

export default BrowseCompanions;