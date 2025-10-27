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
  FaCheck,
  FaTrashAlt,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { API_CONFIG, ROUTES } from '../../constants';
import { companionsApi } from '../../api/companions';
import InterestSelector from '../../components/common/InterestSelector';
import ServicesSelector from '../../components/companion/ServicesSelector';
import LanguageSelector from '../../components/companion/LanguageSelector';
import PhoneNumberInput from '../../components/common/PhoneNumberInput';

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

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'INR'];

const CompanionProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: user?.name || '',
    phoneNumber: '',
    location: '',
    bio: '',
    profilePhoto: '',
    isVisible: true,
    hourlyRate: 50,
    currency: 'USD',
    interests: [],
    languages: [],
    services: [],
  });

  // Fetch application data to get profile photo and interests
  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        console.log('🔍 Fetching application data for user:', user?.email);

        const response = await axios.get(
          `${API_CONFIG.BASE_URL}/companion/application/status`,
          {
            withCredentials: true,
          }
        );

        console.log('📥 Received application data:', response.data);

        const application = response.data.data.application;

        // Verify this is the correct user's application
        if (application && application.user_id) {
          console.log('✅ Application belongs to user ID:', application.user_id);
        }

        // Set all data from application
        const photoUrl = application.profile_photo_url
          ? `${API_CONFIG.BASE_URL.replace('/api', '')}${application.profile_photo_url}`
          : '';

        // Parse services and languages if they're JSON strings
        let services = [];
        let languages = [];
        try {
          services = application.services_offered ? JSON.parse(application.services_offered) : [];
        } catch (e) {
          services = application.services_offered || [];
        }
        try {
          languages = application.languages ? JSON.parse(application.languages) : [];
        } catch (e) {
          languages = application.languages || [];
        }

        // Format location
        const location = [application.city, application.state, application.country]
          .filter(Boolean)
          .join(', ');

        setProfileData(prev => ({
          ...prev,
          profilePhoto: photoUrl,
          fullName: user?.name || prev.fullName,
          phoneNumber: application.phone_number || '',
          location: location || '',
          bio: application.bio || '',
          hourlyRate: application.hourly_rate || 50,
          services: Array.isArray(services) ? services : [],
          languages: Array.isArray(languages) ? languages : []
        }));

        console.log('📋 Updated profile data with application info');

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

  // Handle hash navigation for scrolling to services section
  useEffect(() => {
    if (window.location.hash === '#services-section') {
      // Wait for the page to load then scroll to the services section
      setTimeout(() => {
        const servicesSection = document.getElementById('services-section');
        if (servicesSection) {
          servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Add a highlight effect
          servicesSection.style.backgroundColor = '#fef3c7';
          setTimeout(() => {
            servicesSection.style.transition = 'background-color 1s ease';
            servicesSection.style.backgroundColor = '';
          }, 1000);
        }
      }, 500);
    }
  }, []);

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
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
              'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
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

      // Save profile data (phone, bio, services, languages, hourly rate)
      console.log('💾 Saving profile data...');
      const profileUpdateResponse = await axios.put(
        `${API_CONFIG.BASE_URL}/companion/profile`,
        {
          phoneNumber: profileData.phoneNumber,
          bio: profileData.bio,
          services: profileData.services,
          languages: profileData.languages,
          hourlyRate: profileData.hourlyRate
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      console.log('✅ Profile data saved successfully:', profileUpdateResponse.data);
      
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

  const handleDeleteAccount = async () => {
    // Verify email matches
    if (deleteConfirmEmail !== user?.email) {
      toast.error('Email does not match. Please enter your email correctly.');
      return;
    }

    setIsDeleting(true);
    try {
      // Call delete account endpoint
      const response = await axios.request({
        method: 'DELETE',
        url: `${API_CONFIG.BASE_URL}/auth/account`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          email: deleteConfirmEmail
        },
        withCredentials: true,
      });

      if (response.data.status === 'success') {
        toast.success('Account deleted successfully. Redirecting...');

        // Use window.location for hard redirect to ensure complete logout
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      }
    } catch (error: any) {
      console.error('❌ Error deleting account:', error);
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteConfirmEmail('');
    }
  };

  // Show loading while fetching profile data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#312E81] mx-auto mb-4"></div>
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
                <FaUser className="text-[#312E81] w-5 h-5" />
                <h2 className="text-xl font-semibold text-gray-900">Profile Summary</h2>
              </div>

              <div className="flex flex-col items-center">
                {/* Profile Photo */}
                <div className="mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-[#4A47A3] to-[#4A47A3] flex items-center justify-center text-white text-4xl font-bold">
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
                <span className="inline-block bg-[#312E81] text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
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
                    <span className="inline-block bg-[#f0effe] text-[#312E81] px-3 py-1 rounded-full text-xs font-medium">
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
                <FaUser className="text-[#312E81] w-5 h-5" />
                <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
              </div>

              <div className="space-y-6">
                {/* Profile Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#4A47A3] to-[#4A47A3] flex items-center justify-center text-white text-xl font-bold">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#312E81] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <PhoneNumberInput
                      value={profileData.phoneNumber}
                      onChange={(fullNumber, countryCode, phoneNumber) => {
                        handleInputChange('phoneNumber', fullNumber);
                      }}
                      label="Phone Number"
                      placeholder="Enter your phone number"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#312E81] focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#312E81] focus:border-transparent resize-none"
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
                      profileData.isVisible ? 'bg-[#312E81]' : 'bg-gray-300'
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#312E81] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={profileData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#312E81] focus:border-transparent"
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
                  <LanguageSelector
                    selectedLanguages={profileData.languages}
                    onLanguagesChange={(languages) => handleInputChange('languages', languages)}
                  />
                </div>

                {/* Services Offered */}
                <div id="services-section" className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <span>💼</span> Services Offered
                  </h3>
                  <ServicesSelector
                    selectedServices={profileData.services}
                    onServicesChange={(services) => handleInputChange('services', services)}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-[#312E81] to-[#312E81] text-white py-3 px-6 rounded-lg font-medium hover:from-[#312E81] hover:to-[#312E81] transition-all duration-200 disabled:opacity-50"
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
                  <span className="inline-block bg-[#312E81] text-white px-4 py-1 rounded-full text-sm font-medium">
                    Companion
                  </span>
                </div>

                {/* Email Verification */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email Verification</h3>
                    <p className="text-xs text-gray-500 mt-1">Your email is verified</p>
                  </div>
                  <span className="inline-flex items-center gap-2 bg-[#312E81] text-white px-4 py-1 rounded-full text-sm font-medium">
                    <FaCheck className="w-3 h-3" />
                    Verified
                  </span>
                </div>

                {/* Delete Account Section */}
                <div className="pt-6 border-t-2 border-red-100">
                  <div className="bg-red-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
                      <FaExclamationTriangle className="text-red-600" />
                      Danger Zone
                    </h3>
                    <p className="text-xs text-red-600 mb-4">
                      Once you delete your account, there is no going back. All your data will be permanently removed.
                    </p>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                    >
                      <FaTrashAlt />
                      Delete My Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <FaExclamationTriangle className="text-red-600 text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delete Account</h2>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">Warning: This will permanently delete:</h3>
                  <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                    <li>Your profile and all personal information</li>
                    <li>Your companion application and verification</li>
                    <li>All bookings and transaction history</li>
                    <li>Your reviews and ratings</li>
                    <li>Access to the Meytle platform</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type your email <span className="font-bold">{user?.email}</span> to confirm:
                  </label>
                  <input
                    type="email"
                    value={deleteConfirmEmail}
                    onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                    placeholder="Enter your email to confirm"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    This helps prevent accidental deletions
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmEmail('');
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmEmail !== user?.email}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanionProfile;




