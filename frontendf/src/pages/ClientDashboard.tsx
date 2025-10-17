/**
 * Client Dashboard Page
 * Dashboard for client users to browse companions and manage bookings
 */

import { useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import { useProtectedRoute } from '../hooks/useProtectedRoute';
import type { User } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import VerificationModal from '../components/VerificationModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ROUTES } from '../constants';
import { FaCalendarAlt, FaIdCard, FaSearch, FaUser, FaHeart, FaCreditCard, FaUserTie, FaMoneyBillWave } from 'react-icons/fa';

const ClientDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Protect route and ensure only clients can access
  useProtectedRoute({ requiredRole: 'client' });

  useEffect(() => {
    const currentUser = authApi.getCurrentUser() as User | null;
    setUser(currentUser);
    
    // TODO: Fetch verification status and bookings from backend
    // For now, using placeholder data
    setIsVerified(false);
    setBookings([]);
  }, []);

  const handleVerifyIdentity = () => {
    setIsVerificationModalOpen(true);
  };

  const handleVerificationSuccess = () => {
    setIsVerified(true);
    toast.success('Verification submitted successfully!');
  };

  const handleBrowseCompanions = () => {
    toast.info('Browse companions feature coming soon!');
    // TODO: Navigate to companions listing page
    // navigate(ROUTES.COMPANIONS);
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
                <FaCalendarAlt className="text-primary-600 text-xl" />
                <h2 className="text-xl font-bold text-gray-900">My Bookings</h2>
              </div>
              
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <FaCalendarAlt className="mx-auto text-6xl text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No bookings yet</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Start browsing companions to make your first booking
                  </p>
                  <button
                    onClick={handleBrowseCompanions}
                    className="mt-6 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-medium rounded-lg hover:from-primary-700 hover:to-secondary-600 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Browse Companions
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* TODO: Map through bookings */}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleBrowseCompanions}
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 group"
                >
                  <FaSearch className="text-2xl text-gray-400 group-hover:text-primary-600 transition-colors" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Browse Companions</h3>
                    <p className="text-sm text-gray-500">Find your perfect match</p>
                  </div>
                </button>

                <button
                  onClick={() => toast.info('Favorites feature coming soon!')}
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-secondary-500 hover:bg-secondary-50 transition-all duration-200 group"
                >
                  <FaHeart className="text-2xl text-gray-400 group-hover:text-secondary-600 transition-colors" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">My Favorites</h3>
                    <p className="text-sm text-gray-500">Saved companions</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate(ROUTES.CLIENT_PROFILE)}
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-accent-500 hover:bg-accent-50 transition-all duration-200 group"
                >
                  <FaUser className="text-2xl text-gray-400 group-hover:text-accent-600 transition-colors" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">My Profile</h3>
                    <p className="text-sm text-gray-500">Edit your information</p>
                  </div>
                </button>

                <button
                  onClick={() => toast.info('Payment methods feature coming soon!')}
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-success-500 hover:bg-success-50 transition-all duration-200 group"
                >
                  <FaCreditCard className="text-2xl text-gray-400 group-hover:text-success-600 transition-colors" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Payment Methods</h3>
                    <p className="text-sm text-gray-500">Manage payments</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Identity Verification Box */}
            {!isVerified && (
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg shadow-md border-2 border-primary-200 p-6">
                <div className="flex items-start gap-3 mb-4">
                  <FaIdCard className="text-primary-600 text-2xl flex-shrink-0 mt-1" />
                  <h3 className="text-lg font-bold text-gray-900">Verify Your Identity</h3>
                </div>
                <p className="text-gray-700 text-sm mb-5 leading-relaxed">
                  Before your first booking, please verify your identity by uploading a government-approved ID.
                </p>
                <button
                  onClick={handleVerifyIdentity}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <FaIdCard />
                  Verify Now
                </button>
                <p className="text-xs text-primary-700 mt-3 text-center">
                  🔒 Your information is secure and encrypted
                </p>
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
                  <span className="text-2xl font-bold text-primary-600">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Completed</span>
                  <span className="text-2xl font-bold text-success-600">0</span>
                </div>
              </div>
            </div>

            {/* Become a Companion */}
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg shadow-md border-2 border-primary-200 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                  <FaUserTie className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Want to Earn?</h3>
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
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-secondary-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <FaUserTie />
                Apply as Companion
              </button>
              
              <p className="text-xs text-primary-700 mt-3 text-center">
                ✨ Join 500+ companions already earning
              </p>
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

export default ClientDashboard;