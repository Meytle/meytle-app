/**
 * Browse Companions Page
 * Displays all approved companions with their profile information
 */

import { useState, useEffect } from 'react';
import { FaUser, FaMapMarkerAlt, FaCalendarAlt, FaStar, FaHeart, FaEye } from 'react-icons/fa';
import { API_CONFIG } from '../constants';
import axios from 'axios';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BookingModal from '../components/booking/BookingModal';
import Badge from '../components/common/Badge';
import { useAuth } from '../hooks/useAuth';
import { companionsApi } from '../api/companions';
import type { Companion } from '../types';

interface CompanionData {
  id: number;
  name: string;
  age: number;
  profile_photo_url: string;
  joined_date: string;
  interests: string[];
}

const BrowseCompanions = () => {
  const { user } = useAuth();
  const [companions, setCompanions] = useState<CompanionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  
  // Available interest options
  const availableInterests = [
    'Coffee', 'Dinner', 'Movies', 'Sports', 'Art', 'Music', 
    'Travel', 'Shopping', 'Hiking', 'Gaming', 'Beach', 'Nightlife'
  ];

  useEffect(() => {
    fetchCompanions();
  }, [selectedInterests]);

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

  const filteredAndSortedCompanions = companions
    .filter(companion => 
      companion.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.joined_date).getTime() - new Date(a.joined_date).getTime();
        case 'oldest':
          return new Date(a.joined_date).getTime() - new Date(b.joined_date).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const handleBookCompanion = (companion: CompanionData) => {
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
      imageUrl: companion.profile_photo_url ? `${API_CONFIG.BASE_URL.replace('/api', '')}${companion.profile_photo_url}` : '',
      isVerified: true,
      isAvailable: true
    };
    
    setSelectedCompanion(companionForBooking);
    setIsBookingModalOpen(true);
  };

  const handleBookingCreated = (bookingId: number) => {
    console.log('Booking created with ID:', bookingId);
    // You could show a success message or redirect to bookings page
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCompanions}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Amazing Companions
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with verified companions who are ready to make your day special. 
              Browse profiles, find your perfect match, and create memorable experiences.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search companions by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="md:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
          
          {/* Interests Filter */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by interests:</h3>
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
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-purple-600 text-white'
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
                  className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredAndSortedCompanions.length} companion{filteredAndSortedCompanions.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Companions Grid */}
        {filteredAndSortedCompanions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No companions found' : 'No companions available'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? `Try adjusting your search term "${searchTerm}"`
                : 'Check back later for new companions'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedCompanions.map((companion) => (
              <div
                key={companion.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* Profile Photo */}
                <div className="relative h-64 bg-gray-100">
                  {companion.profile_photo_url ? (
                    <img
                      src={`${API_CONFIG.BASE_URL.replace('/api', '')}${companion.profile_photo_url}`}
                      alt={companion.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`${companion.profile_photo_url ? 'hidden' : ''} absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400`}>
                    <FaUser className="text-white text-6xl" />
                  </div>
                  
                  {/* Overlay with actions */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200">
                      <FaHeart className="text-gray-600 hover:text-red-500" />
                    </button>
                    <button className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-200">
                      <FaEye className="text-gray-600 hover:text-blue-500" />
                    </button>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {companion.name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {companion.age} years old
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <FaCalendarAlt className="mr-2" />
                    <span>Joined {formatJoinDate(companion.joined_date)}</span>
                  </div>

                  {/* Interests */}
                  {companion.interests && companion.interests.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {companion.interests.slice(0, 3).map((interest, index) => (
                          <Badge key={index} variant="info" size="sm">
                            {interest}
                          </Badge>
                        ))}
                        {companion.interests.length > 3 && (
                          <Badge variant="neutral" size="sm">
                            +{companion.interests.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Rating placeholder */}
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="w-4 h-4" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">(New companion)</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {user?.id === companion.id ? (
                      <button 
                        disabled
                        className="flex-1 bg-gray-300 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed font-medium"
                      >
                        Your Profile
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleBookCompanion(companion)}
                        className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        Book Now
                      </button>
                    )}
                    <button className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedCompanion && (
        <BookingModal
          companion={selectedCompanion}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onBookingCreated={handleBookingCreated}
        />
      )}
    </div>
  );
};

export default BrowseCompanions;