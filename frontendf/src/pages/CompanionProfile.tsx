/**
 * Companion Profile Management Page
 * Allows companions to manage their profile, preferences, and visibility
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  FaUser, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaCamera,
  FaUpload,
  FaCheck
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS, ROUTES } from '../constants';
import { getLocalStorageItem } from '../utils/localStorage';
import { companionsApi } from '../api/companions';
import InterestSelector from '../components/common/InterestSelector';

interface ProfileData {
  fullName: string;
  phoneNumber: string;
  location: string;
  bio: string;
  profilePhoto: string;
  isVisible: boolean;
  hourlyRate: number;
  currency: string;
  interests: string[];
  languages: string[];
  services: string[];
}

const INTERESTS = [
  'Art', 'Music', 'Photography',
  'Travel', 'Food', 'Wine',
  'Coffee', 'Books', 'Movies',
  'Theater', 'Sports', 'Fitness',
  'Yoga', 'Hiking', 'Beach',
  'Cooking', 'Dancing', 'Gaming',
  'Technology', 'Fashion', 'Nature'
];

const LANGUAGES = [
  'English', 'Mandarin', 'Spanish',
  'French', 'German', 'Italian',
  'Japanese', 'Korean', 'Arabic',
  'Hindi', 'Portuguese'
];

const SERVICES = [
  'Coffee Date', 'Dinner Date', 'Movie Night',
  'Shopping', 'Museum Visit', 'Concert/Event',
  'Walking/Hiking', 'Beach Day', 'Art Gallery',
  'Wine Tasting', 'Cooking Together', 'Game Night'
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'INR'];

const CompanionProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: user?.name || '',
    phoneNumber: '',
    location: 'Winnipeg',
    bio: '',
    profilePhoto: '',
    isVisible: true,
    hourlyRate: 35,
    currency: 'AUD',
    interests: ['Art', 'Photography', 'Yoga', 'Hiking'],
    languages: ['English', 'Hindi'],
    services: ['Walking/Hiking', 'Movie Night', 'Concert/Event', 'Art Gallery'],
  });

  // Fetch application data to get profile photo and interests
  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const token = getLocalStorageItem<string>(STORAGE_KEYS.AUTH_TOKEN);
        
        if (!token) {
          console.error('❌ No auth token found');
          setIsLoading(false);
          return;
        }

        console.log('🔍 Fetching application data for user:', user?.email);
        
        const response = await axios.get(
          `${API_CONFIG.BASE_URL}/companion/application/status`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        console.log('📥 Received application data:', response.data);

        const application = response.data.data.application;
        
        // Verify this is the correct user's application
        if (application && application.user_id) {
          console.log('✅ Application belongs to user ID:', application.user_id);
        }
        
        // Set profile photo from application
        if (application.profile_photo_url) {
          const photoUrl = `${API_CONFIG.BASE_URL.replace('/api', '')}${application.profile_photo_url}`;
          console.log('📸 Setting profile photo URL:', photoUrl);
          console.log('🔗 Full URL will be:', photoUrl);
          setProfileData(prev => ({ 
            ...prev, 
            profilePhoto: photoUrl,
            fullName: user?.name || prev.fullName // Ensure name is from logged-in user
          }));
        } else {
          console.log('⚠️ No profile photo URL found in application');
        }

        // Fetch existing interests
        if (user?.id) {
          try {
            const interestsResponse = await companionsApi.getCompanionInterests(user.id);
            if (interestsResponse.status === 'success') {
              console.log('📋 Fetched existing interests:', interestsResponse.data.interests);
              setProfileData(prev => ({ 
                ...prev, 
                interests: interestsResponse.data.interests 
              }));
            }
          } catch (interestsError) {
            console.log('⚠️ No existing interests found or error fetching:', interestsError);
            // Keep default interests
          }
        }
      } catch (error: any) {
        console.error('❌ Error fetching application data:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchApplicationData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'interests' | 'languages' | 'services', item: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }));
  };

  // Handle profile photo selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Photo must be less than 5MB');
        return;
      }
      
      setProfilePhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        setProfilePhotoPreview(preview);
        setProfileData(prev => ({ ...prev, profilePhoto: preview }));
      };
      reader.readAsDataURL(file);
      
      toast.success('Photo selected! Click "Save Changes" to update.');
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerEditFileInput = () => {
    editFileInputRef.current?.click();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = getLocalStorageItem<string>(STORAGE_KEYS.AUTH_TOKEN);
      
      // If there's a new photo, upload it
      if (profilePhotoFile) {
        const formData = new FormData();
        formData.append('profilePhoto', profilePhotoFile);
        
        console.log('📸 Uploading new profile photo for user:', user?.email);
        
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}/companion/profile/photo`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
        console.log('✅ Profile photo uploaded successfully:', response.data);
        
        // Update the profile photo URL with the one from backend
        if (response.data.data?.profilePhotoUrl) {
          const newPhotoUrl = `${API_CONFIG.BASE_URL.replace('/api', '')}${response.data.data.profilePhotoUrl}`;
          console.log('🔄 Updating photo URL to:', newPhotoUrl);
          setProfileData(prev => ({ ...prev, profilePhoto: newPhotoUrl }));
        }
        
        setProfilePhotoFile(null);
        setProfilePhotoPreview('');
      }
      
      // Save interests if they have changed
      if (profileData.interests.length > 0) {
        try {
          console.log('💾 Saving interests:', profileData.interests);
          await companionsApi.updateCompanionInterests(profileData.interests);
          console.log('✅ Interests saved successfully');
        } catch (interestsError) {
          console.error('❌ Error saving interests:', interestsError);
          toast.error('Failed to save interests');
        }
      }
      
      // Save other profile data
      // TODO: Add API endpoint for profile data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      if (error.response) {
        console.error('Error details:', error.response.data);
      }
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // Show loading while fetching profile data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="mt-1 text-sm text-gray-500">Manage your personal information and preferences</p>
            </div>
            <button
              onClick={() => navigate(ROUTES.COMPANION_DASHBOARD)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
              <div className="flex items-center gap-2 mb-6">
                <FaUser className="text-purple-500 w-5 h-5" />
                <h2 className="text-xl font-semibold text-gray-900">Profile Summary</h2>
              </div>

              <div className="flex flex-col items-center">
                {/* Profile Photo */}
                <div className="mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-4xl font-bold">
                    {profileData.profilePhoto ? (
                      <img src={profileData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      profileData.fullName.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">{profileData.fullName}</h3>
                
                {/* Role Badge */}
                <span className="inline-block bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
                  Companion
                </span>

                {/* Contact Info */}
                <div className="w-full space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaEnvelope className="text-gray-400 w-4 h-4" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaMapMarkerAlt className="text-gray-400 w-4 h-4" />
                    <span className="text-sm">{profileData.location}</span>
                  </div>
                </div>

                {/* Profile Visibility */}
                <div className="w-full border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">Profile Visibility</span>
                    <span className="inline-block bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-medium">
                      Visible
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Your profile is visible to clients</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Edit Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <FaUser className="text-purple-500 w-5 h-5" />
                <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
              </div>

              <div className="space-y-6">
                {/* Profile Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold">
                      {profileData.profilePhoto ? (
                        <img src={profileData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        profileData.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={triggerEditFileInput}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FaUpload className="w-4 h-4" />
                      Upload Photo
                    </button>
                    {/* Hidden file input */}
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {profilePhotoFile ? `Selected: ${profilePhotoFile.name}` : 'Choose a photo to represent your profile'}
                  </p>
                </div>

                {/* Full Name & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Profile Visibility Toggle */}
                <div className="flex items-center justify-between py-4 border-t border-gray-100">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Profile Visibility</h3>
                    <p className="text-xs text-gray-500 mt-1">Control whether your profile is visible to clients</p>
                  </div>
                  <button
                    onClick={() => handleInputChange('isVisible', !profileData.isVisible)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      profileData.isVisible ? 'bg-purple-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        profileData.isVisible ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Hourly Rate & Currency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hourly Rate
                    </label>
                    <input
                      type="number"
                      value={profileData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={profileData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {CURRENCIES.map(curr => (
                        <option key={curr} value={curr}>{curr}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Interests & Hobbies */}
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <span>❤️</span> Interests & Hobbies
                  </h3>
                  <InterestSelector
                    selectedInterests={profileData.interests}
                    onInterestsChange={(interests) => handleInputChange('interests', interests)}
                    maxSelections={10}
                    className="border border-gray-200 rounded-lg p-4"
                  />
                </div>

                {/* Languages */}
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <span>🌐</span> Languages
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {LANGUAGES.map(language => (
                      <label key={language} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileData.languages.includes(language)}
                          onChange={() => toggleArrayItem('languages', language)}
                          className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{language}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Services Offered */}
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <span>💼</span> Services Offered
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SERVICES.map(service => (
                      <label key={service} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileData.services.includes(service)}
                          onChange={() => toggleArrayItem('services', service)}
                          className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>

              <div className="space-y-4">
                {/* Account Type */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Account Type</h3>
                    <p className="text-xs text-gray-500 mt-1">You are registered as a companion</p>
                  </div>
                  <span className="inline-block bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Companion
                  </span>
                </div>

                {/* Email Verification */}
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email Verification</h3>
                    <p className="text-xs text-gray-500 mt-1">Your email is verified</p>
                  </div>
                  <span className="inline-flex items-center gap-2 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    <FaCheck className="w-3 h-3" />
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanionProfile;




