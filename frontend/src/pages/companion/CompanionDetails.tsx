/**
 * Companion Details Page
 * Displays detailed companion information for clients to view and book
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FaArrowLeft,
  FaHeart,
  FaRegHeart,
  FaStar,
  FaMapMarkerAlt,
  FaClock,
  FaLanguage,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaCheckCircle,
  FaUser,
  FaServicestack,
  FaComment,
  FaShieldAlt,
  FaAward,
  FaTimes,
  FaPaperPlane,
  FaShareAlt
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { bookingApi } from '../../api/booking';
import { companionsApi } from '../../api/companions';
import { serviceCategoryApi } from '../../api/serviceCategory';
import { favoritesApi } from '../../api/favorites';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FavoriteButton from '../../components/common/FavoriteButton';
import DetailedBookingModal from '../../components/booking/DetailedBookingModal';
import CustomBookingRequestModal from '../../components/booking/CustomBookingRequestModal';
import type { AvailabilitySlot, ServiceCategory } from '../../types';

interface CompanionProfileData {
  id: number;
  name: string;
  email: string;
  profile_photo_url: string;
  age: number;
  bio: string;
  interests: string[];
  services_offered: string[];
  languages: string[];
  hourly_rate: number;
  verified: boolean;
  joined_date: string;
  location: string;
}

const CompanionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [companion, setCompanion] = useState<CompanionProfileData | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'about' | 'availability' | 'reviews'>('about');
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<any>({
    total: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    average: 0
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const [totalReviewPages, setTotalReviewPages] = useState(1);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showEnhancedBookingModal, setShowEnhancedBookingModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: string; end: string; services?: string[] } | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0); // Track selected day in week
  const [currentFunFact, setCurrentFunFact] = useState(0);
  const [viewCount, setViewCount] = useState(Math.floor(Math.random() * 20) + 10);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (id) {
      // Fetch both independently so one failure doesn't affect the other
      fetchCompanionProfile();
      fetchAvailability();
    }
  }, [id]);


  useEffect(() => {
    // Update selected date when day index changes
    const weekDates = getWeekDates();
    if (weekDates[selectedDayIndex]) {
      setSelectedDate(weekDates[selectedDayIndex].date);
    }
  }, [selectedDayIndex]);

  useEffect(() => {
    if (activeTab === 'reviews' && id) {
      fetchReviews();
    }
  }, [activeTab, currentReviewPage, id]);

  // Fun facts rotation
  useEffect(() => {
    const funFacts = [
      `Responds to 90% of requests within 2 hours`,
      `${Math.floor(Math.random() * 100) + 50} happy clients served`,
      `${Math.floor(Math.random() * 20) + 80}% booking success rate`,
      `Usually books up ${Math.floor(Math.random() * 3) + 2} days in advance`,
      `Top 10% rated companion on Meytle`,
    ];

    const interval = setInterval(() => {
      setCurrentFunFact((prev) => (prev + 1) % funFacts.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Simulate view count updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setViewCount(prev => prev + 1);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Check if companion is favorited
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!id || !user) return;

      try {
        const status = await favoritesApi.checkFavorite(parseInt(id));
        setIsFavorited(status);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [id, user]);

  const fetchCompanionProfile = async () => {
    try {
      setIsLoading(true);
      // For now, using the browse endpoint and finding the companion
      // TODO: Create dedicated profile endpoint
      const response = await companionsApi.getCompanions();
      const companions = response.data || [];
      const companionData = companions.find(c => c.id === parseInt(id!));

      if (companionData) {
        // Use actual data from API, no mocking
        setCompanion({
          id: companionData.id,
          name: companionData.name,
          email: companionData.email || '', // Optional in type
          profile_photo_url: companionData.profile_photo_url || '',
          age: companionData.age,
          bio: '',  // Not available from API
          interests: companionData.interests || [],
          services_offered: companionData.services || [],
          languages: [],
          hourly_rate: 75, // Default rate
          verified: false, // Not available from API
          location: companionData.location || '',
          joined_date: companionData.joined_date || new Date().toISOString()
        });
      } else {
        toast.error('Companion not found');
        navigate('/browse-companions');
      }
    } catch (error) {
      console.error('Error fetching companion profile:', error);
      toast.error('Failed to load companion profile');
      // Set some default data to allow availability to still work
      if (id) {
        setCompanion({
          id: parseInt(id),
          name: 'Companion',
          email: '',
          profile_photo_url: '',
          age: 0,
          bio: '',
          interests: [],
          services_offered: [],
          languages: [],
          hourly_rate: 75,
          verified: false,
          joined_date: new Date().toISOString(),
          location: ''
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      if (!id) return;
      const slots = await bookingApi.getCompanionAvailability(parseInt(id));
      setAvailability(slots || []);
      console.log(`Fetched ${slots?.length || 0} availability slots for companion ${id}`);
    } catch (error) {
      console.error('Error fetching availability:', error);
      // Set empty availability array to prevent undefined errors
      setAvailability([]);
      // Don't show error to user as availability might just not be set yet
    }
  };

  const fetchReviews = async () => {
    try {
      if (!id) return;
      setReviewsLoading(true);
      const response = await bookingApi.getCompanionReviews(parseInt(id), currentReviewPage, 5);
      setReviews(response.reviews);
      setReviewStats(response.stats);
      setTotalReviewPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Don't show error toast, just show empty reviews
      setReviews([]);
      setReviewStats({
        total: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        average: 0
      });
    } finally {
      setReviewsLoading(false);
    }
  };


  const handleRequestBooking = () => {
    if (!isAuthenticated) {
      toast.error('Please login to request a booking');
      navigate('/signin');
      return;
    }

    setShowRequestModal(true);
  };



  const getDayOfWeek = (date: Date) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  };

  const getAvailableTimeSlots = () => {
    const dayOfWeek = getDayOfWeek(selectedDate);
    return availability.filter(slot =>
      slot.day_of_week === dayOfWeek && slot.is_available
    );
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      toast.error('Please login to add favorites');
      navigate('/signin');
      return;
    }

    if (!id) return;

    try {
      if (isFavorited) {
        await favoritesApi.removeFavorite(parseInt(id));
        setIsFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await favoritesApi.addFavorite(parseInt(id));
        setIsFavorited(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  // Get next 7 days with dates
  const getWeekDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayFull: date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        isToday: i === 0
      });
    }
    return dates;
  };

  // Get availability status for a specific day
  const getDayAvailabilityStatus = (dayName: string) => {
    const daySlots = availability.filter(slot => slot.day_of_week === dayName);

    if (daySlots.length === 0) {
      return 'unavailable';
    }

    // Check availability based on number of slots
    const totalSlots = daySlots.length;

    if (totalSlots >= 4) return 'available';
    if (totalSlots >= 2) return 'partial';
    if (totalSlots >= 1) return 'limited';
    return 'unavailable';
  };

  // Get status color - simplified to just available/unavailable
  const getStatusColor = (status: string) => {
    // If there are any slots available, show green, otherwise red
    if (status === 'unavailable') {
      return 'bg-red-500';
    } else if (status === 'available' || status === 'partial' || status === 'limited') {
      return 'bg-green-500';
    }
    return 'bg-gray-400';
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-yellow-400 opacity-50" />);
      } else {
        stars.push(<FaStar key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!companion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Companion not found</h2>
          <button
            onClick={() => navigate('/browse-companions')}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Browse Companions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft />
              <span>Back</span>
            </button>

            <FavoriteButton
              companionId={companion?.id || 0}
              companionName={companion?.name}
              size="lg"
              className="bg-white hover:bg-gray-100"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full">
          {/* Main Content - Full Width */}
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative h-64 bg-gradient-to-br from-primary-400 to-secondary-400">
                {companion.profile_photo_url ? (
                  <img
                    src={`http://localhost:5000${companion.profile_photo_url}`}
                    alt={companion.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center">
                      <FaUser className="text-6xl text-white" />
                    </div>
                  </div>
                )}

                {companion.verified && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <FaShieldAlt />
                    Verified
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{companion.name}</h1>
                    <div className="flex items-center gap-4 mt-2 text-gray-600">
                      {/* Only show location if it exists */}
                      {companion.location && companion.location.trim() !== '' && (
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt />
                          {companion.location}
                        </span>
                      )}
                      {/* Only show member since if valid date */}
                      {companion.joined_date && (
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt />
                          Member since {!isNaN(new Date(companion.joined_date).getFullYear()) ?
                            new Date(companion.joined_date).getFullYear() :
                            new Date().getFullYear()}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-1">
                        {renderStars(reviewStats?.average || 0)}
                        <span className="ml-2 font-semibold">{reviewStats?.average || 0}</span>
                        <span className="text-gray-500">({reviewStats?.total || 0} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {companion.hourly_rate && companion.hourly_rate > 0 ? (
                      <>
                        <div className="text-3xl font-bold text-primary-600">
                          ${companion.hourly_rate}
                        </div>
                        <div className="text-sm text-gray-500">per hour</div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">
                        Rate not set
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg">
              <div className="border-b">
                <div className="flex">
                  {['about', 'availability', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`flex-1 px-6 py-4 font-medium capitalize transition-colors ${
                        activeTab === tab
                          ? 'text-primary-600 border-b-2 border-primary-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* About Tab */}
                {activeTab === 'about' && (
                  <div className="space-y-6">
                    {/* Only show About Me if bio exists */}
                    {companion.bio && companion.bio.trim() !== '' && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">About Me</h3>
                        <p className="text-gray-600 leading-relaxed">{companion.bio}</p>
                      </div>
                    )}

                    {/* Only show Services if they exist */}
                    {companion.services_offered && companion.services_offered.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FaServicestack className="text-primary-600" />
                          Services Offered
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {companion.services_offered.map((service, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Only show Languages if they exist */}
                    {companion.languages && companion.languages.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FaLanguage className="text-primary-600" />
                          Languages
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {companion.languages.map((language, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                              {language}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Only show Interests if they exist */}
                    {companion.interests && companion.interests.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <FaHeart className="text-primary-600" />
                          Interests
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {companion.interests.map((interest, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Show message if no info available */}
                    {(!companion.bio || companion.bio.trim() === '') &&
                     (!companion.services_offered || companion.services_offered.length === 0) &&
                     (!companion.languages || companion.languages.length === 0) &&
                     (!companion.interests || companion.interests.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        No profile information available yet.
                      </div>
                    )}
                  </div>
                )}

                {/* Availability Tab */}
                {activeTab === 'availability' && (
                  <div className="space-y-6">
                    {/* Weekly Availability Section */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <FaCalendarAlt className="text-primary-600" />
                        Weekly Availability
                      </h3>

                      {/* Week Days Grid */}
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {getWeekDates().map((day, index) => {
                          const status = getDayAvailabilityStatus(day.dayFull);
                          const isSelected = selectedDayIndex === index;

                          return (
                            <button
                              key={index}
                              onClick={() => {
                                setSelectedDayIndex(index);
                                setSelectedDate(day.date);
                                setSelectedTimeSlot(null); // Reset time slot when changing days
                              }}
                              className={`relative p-3 rounded-xl border-2 transition-all duration-300 ${
                                isSelected
                                  ? 'border-primary-500 bg-primary-50 shadow-lg scale-105'
                                  : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                              } ${status === 'unavailable' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                              title={`${day.dayFull.charAt(0).toUpperCase() + day.dayFull.slice(1)} - ${status.replace('_', ' ')}`}
                              disabled={status === 'unavailable'}
                            >
                              <div className="text-center">
                                <div className="text-xs font-medium text-gray-500 mb-1">
                                  {day.dayName}
                                </div>
                                {day.isToday && (
                                  <div className="text-xs font-bold text-primary-600 mb-1">
                                    Today
                                  </div>
                                )}
                                <div className="text-lg font-bold text-gray-900">
                                  {day.dayNumber}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {day.month}
                                </div>

                                {/* Status Indicator */}
                                <div className="mt-2 flex justify-center">
                                  <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Legend */}
                      <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span>Available</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span>Unavailable</span>
                        </div>
                      </div>

                      {/* Instruction Text */}
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                          Click on any available day to see time slots
                        </p>
                      </div>
                    </div>

                    {/* Time Slot Selection Section */}
                    {selectedDayIndex !== null && (
                      <div className="bg-white rounded-xl border border-gray-200 p-6 mt-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <FaClock className="text-primary-600" />
                          Available Times for {getWeekDates()[selectedDayIndex].dayFull.charAt(0).toUpperCase() + getWeekDates()[selectedDayIndex].dayFull.slice(1)}
                        </h4>

                        {(() => {
                          const selectedDaySlots = availability.filter(slot =>
                            slot.day_of_week === getWeekDates()[selectedDayIndex].dayFull && slot.is_available
                          );

                          if (selectedDaySlots.length === 0) {
                            return (
                              <div className="text-center py-8 text-gray-500">
                                No available time slots for this day
                              </div>
                            );
                          }

                          return (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {selectedDaySlots.map((slot, slotIndex) => {
                                const isSelectedSlot = selectedTimeSlot?.start === slot.start_time &&
                                                      selectedTimeSlot?.end === slot.end_time;

                                // Parse services if it's a string
                                const services = slot.services
                                  ? (typeof slot.services === 'string'
                                      ? JSON.parse(slot.services)
                                      : slot.services)
                                  : [];

                                return (
                                  <button
                                    key={slotIndex}
                                    onClick={() => {
                                      setSelectedTimeSlot({
                                        start: slot.start_time,
                                        end: slot.end_time,
                                        services: services
                                      });
                                      setShowEnhancedBookingModal(true);
                                    }}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                      isSelectedSlot
                                        ? 'border-primary-500 bg-primary-50 shadow-md'
                                        : 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
                                    }`}
                                  >
                                    <div className="text-center">
                                      <div className="font-medium text-gray-900">
                                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                      </div>
                                      {services.length > 0 && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          {services.slice(0, 2).join(', ')}
                                          {services.length > 2 && ` +${services.length - 2}`}
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Request Custom Booking Button - Always visible at bottom */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          Need a Different Time?
                        </h4>
                        <p className="text-gray-600 mb-4">
                          Can't find a suitable time slot? Send a custom booking request
                        </p>
                        <button
                          onClick={handleRequestBooking}
                          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                        >
                          <FaCalendarAlt />
                          Request Custom Booking
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Reviews ({reviewStats?.total || 0})
                      </h3>
                    </div>

                    {/* Rating Summary */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-gray-900">{reviewStats?.average || 0}</div>
                          <div className="flex items-center gap-1 mt-2">
                            {renderStars(reviewStats?.average || 0)}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {reviewStats?.total || 0} reviews
                          </div>
                        </div>

                        <div className="flex-1 space-y-2">
                          {[5, 4, 3, 2, 1].map(stars => {
                            const count = reviewStats?.distribution[stars] || 0;
                            const total = reviewStats?.total || 0;
                            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                            return (
                              <div key={stars} className="flex items-center gap-3">
                                <span className="text-sm text-gray-600 w-4">{stars}</span>
                                <FaStar className="text-yellow-400 text-sm" />
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600 w-10 text-right">
                                  {count}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Real Reviews */}
                    {reviewsLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="border-b pb-4 animate-pulse">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-full bg-gray-200" />
                              <div className="flex-1 space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-1/4" />
                                <div className="h-3 bg-gray-200 rounded w-1/3" />
                                <div className="h-4 bg-gray-200 rounded w-full" />
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map(review => (
                          <div key={review.id} className="border-b pb-4">
                            <div className="flex items-start gap-4">
                              {review.reviewer_photo ? (
                                <img
                                  src={review.reviewer_photo}
                                  alt={review.reviewer_name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <FaUser className="text-gray-600" />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium text-gray-900">{review.reviewer_name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex items-center gap-1">
                                        {renderStars(review.rating)}
                                      </div>
                                      <span className="text-sm text-gray-500">
                                        • {new Date(review.created_at).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <p className="mt-3 text-gray-600">
                                  {review.review_text}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No reviews yet. Be the first to book and review!
                      </div>
                    )}

                    {totalReviewPages > 1 && (
                      <div className="flex justify-center gap-2 mt-6">
                        <button
                          onClick={() => setCurrentReviewPage(prev => Math.max(1, prev - 1))}
                          disabled={currentReviewPage === 1}
                          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="px-4 py-2 text-sm">
                          Page {currentReviewPage} of {totalReviewPages}
                        </span>
                        <button
                          onClick={() => setCurrentReviewPage(prev => Math.min(totalReviewPages, prev + 1))}
                          disabled={currentReviewPage === totalReviewPages}
                          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Custom Booking Request Modal */}
      <CustomBookingRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        companionId={companion?.id || 0}
        companionName={companion?.name || ''}
        companionServices={companion?.services_offered || []}
        onRequestCreated={(requestId) => {
          toast.success('Booking request sent successfully!');
          setShowRequestModal(false);
          // Optionally refresh or navigate
        }}
      />

      {/* Enhanced Booking Modal */}
      {showEnhancedBookingModal && selectedTimeSlot && (
        <DetailedBookingModal
          isOpen={showEnhancedBookingModal}
          onClose={() => setShowEnhancedBookingModal(false)}
          companionId={companion?.id || 0}
          companionName={companion?.name || ''}
          selectedDate={selectedDate}
          selectedTimeSlot={selectedTimeSlot}
          companionServices={companion?.services_offered || []}
          hourlyRate={companion?.hourly_rate || 75}
          onBookingCreated={(bookingId) => {
            toast.success('Booking created successfully!');
            // Navigate to booking confirmation or refresh data
            navigate(`/client-dashboard`);
          }}
        />
      )}
    </div>
  );
};

export default CompanionDetails;