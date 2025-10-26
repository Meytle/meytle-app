/**
 * Client Profile Management Page
 * Allows clients to manage their profile, preferences, and identity verification
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCamera,
  FaPhone,
  FaIdCard,
  FaCheck,
  FaTimes,
  FaShieldAlt,
  FaExclamationTriangle,
  FaUpload,
  FaTrashAlt
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { API_CONFIG, ROUTES } from '../../constants';
import PhoneNumberInput from '../../components/common/PhoneNumberInput';
import InterestSelector from '../../components/common/InterestSelector';
import LanguageSelector from '../../components/companion/LanguageSelector';
import clientApi from '../../api/client';
import { countryPhoneCodes } from '../../data/countryPhoneCodes';
import { getStatesForCountry } from '../../data/locationData';

interface ProfileData {
  fullName: string;
  phoneNumber: string;
  location: string;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  bio: string;
  profilePhoto: string;
  dateOfBirth: string;
  interests: string[];
  languages: string[];
}

interface VerificationStatus {
  emailVerified: boolean;
  idVerified: boolean;
  idDocumentUrl?: string;
  verificationDate?: string;
}

interface DeleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

const ClientProfile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('');
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
  const [idDocumentPreview, setIdDocumentPreview] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: user?.name || '',
    phoneNumber: '',
    location: '',
    addressLine: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    bio: '',
    profilePhoto: '',
    dateOfBirth: '',
    interests: [],
    languages: []
  });

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    emailVerified: true,
    idVerified: false
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        console.log('🔍 Fetching client profile data');

        // Fetch actual data from backend
        const response = await clientApi.getProfile();
        console.log('📋 Profile data received:', response);

        // Map the response data to component state
        if (response.verification) {
          setProfileData({
            fullName: response.user.name || '',
            phoneNumber: response.verification.phone_number || '',
            location: response.verification.location || '',
            addressLine: response.verification.address_line || '',
            city: response.verification.city || '',
            state: response.verification.state || '',
            country: response.verification.country || '',
            postalCode: response.verification.postal_code || '',
            bio: response.verification.bio || '',
            profilePhoto: response.verification.profile_photo_url || '',
            dateOfBirth: response.verification.date_of_birth || '',
            interests: [],  // TODO: Fetch interests separately
            languages: []   // TODO: Fetch languages separately
          });

          // Set verification status
          setVerificationStatus({
            emailVerified: true, // Assuming email is verified if logged in
            idVerified: response.verification.verification_status === 'approved'
          });
        } else {
          // No verification record yet, use defaults
          setProfileData({
            fullName: response.user.name || '',
            phoneNumber: '',
            location: '',
            addressLine: '',
            city: '',
            state: '',
            country: '',
            postalCode: '',
            bio: '',
            profilePhoto: '',
            dateOfBirth: '',
            interests: [],
            languages: []
          });

          setVerificationStatus({
            emailVerified: true,
            idVerified: false
          });
        }

      } catch (error: any) {
        console.error('❌ Error fetching profile:', error);

        // If error, at least set user's name
        setProfileData(prev => ({
          ...prev,
          fullName: user?.name || ''
        }));

        // Don't show error toast on initial load if profile doesn't exist yet
        if (error.response?.status !== 404) {
          toast.error('Failed to load profile data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  // Clear state field when switching to a country without states
  useEffect(() => {
    if (profileData.country) {
      const selectedCountryCode = countryPhoneCodes.find(c => c.name === profileData.country)?.code;
      const statesForCountry = selectedCountryCode ? getStatesForCountry(selectedCountryCode) : [];
      const hasStates = statesForCountry.length > 0;

      // Clear state if country doesn't have states
      if (!hasStates && profileData.state) {
        setProfileData(prev => ({ ...prev, state: '' }));
      }
    }
  }, [profileData.country]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo must be less than 5MB');
        return;
      }

      setProfilePhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
        setProfileData(prev => ({ ...prev, profilePhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
      toast.success('Photo selected! Click Save to update.');
    }
  };

  const handleIdDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Document must be less than 10MB');
        return;
      }

      setIdDocumentFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdDocumentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success('ID document selected! Click Submit Verification to upload.');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerIdInput = () => {
    idInputRef.current?.click();
  };

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteProfile = async () => {
    try {
      setIsDeleting(true);

      await axios.delete(`${API_CONFIG.BASE_URL}/auth/delete-account`, {
        withCredentials: true
      });

      toast.success('Account deleted successfully');
      signOut();
      navigate('/');
    } catch (error: any) {
      console.error('❌ Error deleting account:', error);
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Upload profile photo if changed
      if (profilePhotoFile) {
        try {
          console.log('📸 Uploading profile photo...');
          await clientApi.uploadProfilePhoto(profilePhotoFile);
          console.log('✅ Profile photo uploaded successfully');
        } catch (photoError) {
          console.error('❌ Error uploading photo:', photoError);
          toast.error('Failed to upload profile photo');
          // Continue with profile update even if photo fails
        }
      }

      // Build location string from address components
      const locationParts = [
        profileData.addressLine,
        profileData.city,
        profileData.state,
        profileData.country,
        profileData.postalCode
      ].filter(part => part && part.trim() !== '');

      const location = locationParts.join(', ');

      // Save profile data with address fields
      console.log('💾 Saving profile data...');
      await clientApi.updateProfile({
        fullName: profileData.fullName,
        phoneNumber: profileData.phoneNumber,
        addressLine: profileData.addressLine,
        city: profileData.city,
        state: profileData.state,
        country: profileData.country,
        postalCode: profileData.postalCode,
        bio: profileData.bio,
        location: location
      });

      console.log('✅ Profile saved successfully');
      toast.success('Profile updated successfully!');
      setProfilePhotoFile(null);

      // Check if address is complete for verification
      const hasCompleteAddress = profileData.addressLine && profileData.city && profileData.country;
      if (hasCompleteAddress && !verificationStatus.idVerified) {
        toast('Your address is now complete! You can submit verification to browse companions.', {
          duration: 5000,
          icon: '📋'
        });
      }

    } catch (error: any) {
      console.error('❌ Error saving profile:', error);
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitVerification = async () => {
    if (!idDocumentFile) {
      toast.error('Please select an ID document first');
      return;
    }

    try {
      setIsSaving(true);

      const formData = new FormData();
      formData.append('idDocument', idDocumentFile);
      formData.append('dateOfBirth', profileData.dateOfBirth);

      // TODO: Create backend endpoint for ID verification
      // await axios.post(`${API_CONFIG.BASE_URL}/client/verify-identity`, formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      //   withCredentials: true,
      // });

      toast.success('Verification submitted! We\'ll review it within 24 hours.');
      setIdDocumentFile(null);
      setIdDocumentPreview('');
      
      // Update verification status to pending
      setVerificationStatus(prev => ({ ...prev, idVerified: false }));
      
    } catch (error: any) {
      console.error('❌ Error submitting verification:', error);
      toast.error(error.response?.data?.message || 'Failed to submit verification');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
              <p className="mt-1 text-sm text-gray-500">Manage your personal information</p>
            </div>
            <button
              onClick={() => navigate(ROUTES.CLIENT_DASHBOARD)}
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
                      {profileData.profilePhoto || profilePhotoPreview ? (
                      <img src={profilePhotoPreview || profileData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      profileData.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                </div>

                {/* Name */}
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">{profileData.fullName || 'Your Name'}</h3>
                
                {/* Role Badge */}
                <span className="inline-block bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
                  Client
                </span>

                {/* Contact Info */}
                <div className="w-full space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaEnvelope className="text-gray-400 w-4 h-4" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <FaMapMarkerAlt className="text-gray-400 w-4 h-4" />
                    <span className="text-sm">
                      {profileData.city && profileData.country
                        ? `${profileData.city}, ${profileData.country}`
                        : 'Not specified'}
                    </span>
                  </div>
                </div>

                {/* Account Status */}
                <div className="w-full border-t border-gray-100 pt-4">
                  <div className="space-y-3">
                    {/* Email Verification */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-gray-400 text-sm" />
                        <span className="text-sm text-gray-600">Email</span>
                      </div>
                      {verificationStatus.emailVerified ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                          <FaCheck className="text-xs" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                          <FaExclamationTriangle className="text-xs" /> Pending
                        </span>
                      )}
                    </div>

                    {/* ID Verification */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaIdCard className="text-gray-400 text-sm" />
                        <span className="text-sm text-gray-600">ID Verified</span>
                      </div>
                      {verificationStatus.idVerified ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                          <FaCheck className="text-xs" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                          <FaExclamationTriangle className="text-xs" /> Pending
                        </span>
                      )}
                    </div>
                  </div>
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
                      {profileData.profilePhoto || profilePhotoPreview ? (
                        <img src={profilePhotoPreview || profileData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        profileData.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={triggerFileInput}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FaUpload className="w-4 h-4" />
                      Upload Photo
                    </button>
                    <input
                      ref={fileInputRef}
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
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <PhoneNumberInput
                    value={profileData.phoneNumber}
                    onChange={(fullNumber, countryCode, phoneNumber) => {
                      setProfileData({ ...profileData, phoneNumber: fullNumber });
                    }}
                    label="Phone Number"
                    placeholder="Enter your phone number"
                  />
                </div>
                </div>

                {/* Address Section */}
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-500 w-4 h-4" />
                    Current Address <span className="text-red-500">*</span>
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Your address is required for verification and to show companions in your area
                  </p>

                  {/* Address Line */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={profileData.addressLine}
                      onChange={(e) => setProfileData({ ...profileData, addressLine: e.target.value })}
                      placeholder="123 Main Street, Apt 4B"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* City and State */}
                  {(() => {
                    // Get states for selected country
                    const selectedCountryCode = countryPhoneCodes.find(c => c.name === profileData.country)?.code;
                    const statesForCountry = selectedCountryCode ? getStatesForCountry(selectedCountryCode) : [];
                    const hasStates = statesForCountry.length > 0;

                    // Dynamic label based on country
                    const getStateLabel = () => {
                      switch(selectedCountryCode) {
                        case 'US': return 'State';
                        case 'CA': return 'Province';
                        case 'GB': return 'Region';
                        case 'AU': return 'State/Territory';
                        case 'IN': return 'State';
                        case 'DE': return 'Federal State';
                        case 'FR': return 'Region';
                        default: return 'State/Province';
                      }
                    };

                    return (
                      <div className={`grid grid-cols-1 ${hasStates ? 'md:grid-cols-2' : ''} gap-4 mb-4`}>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={profileData.city}
                            onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                            placeholder="Enter your city"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                          />
                        </div>
                        {hasStates && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {getStateLabel()} <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={profileData.state}
                              onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              required
                            >
                              <option value="">Select {getStateLabel()}</option>
                              {statesForCountry.map((state) => (
                                <option key={state.name} value={state.abbreviation || state.name}>
                                  {state.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Country and Postal Code */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={profileData.country}
                        onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Country</option>
                        {countryPhoneCodes
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((country) => (
                            <option key={country.code} value={country.name}>
                              {country.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal/ZIP Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={profileData.postalCode}
                        onChange={(e) => setProfileData({ ...profileData, postalCode: e.target.value })}
                        placeholder="10001"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
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
                    maxSelections={10}
                  />
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
                    onClick={() => navigate(ROUTES.CLIENT_DASHBOARD)}
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
                    <p className="text-xs text-gray-500 mt-1">You are registered as a client</p>
                  </div>
                  <span className="inline-block bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Client
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

            {/* Delete Profile Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-red-100">
              <div className="flex items-center gap-2 mb-4">
                <FaTrashAlt className="text-red-500 w-5 h-5" />
                <h2 className="text-xl font-semibold text-gray-900">Danger Zone</h2>
              </div>

              <div className="bg-red-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 mb-3">
                  <strong>Warning:</strong> Deleting your profile is permanent and cannot be undone.
                </p>
                <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                  <li>All your bookings will be cancelled</li>
                  <li>Your profile information will be permanently deleted</li>
                  <li>You will lose access to your account immediately</li>
                </ul>
              </div>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaTrashAlt className="w-4 h-4" />
                Delete My Profile
              </button>
            </div>
          </div>
        </div>

        {/* Delete Profile Modal */}
        {showDeleteModal && (
          <DeleteProfileModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteProfile}
            isDeleting={isDeleting}
          />
        )}
      </main>
    </div>
  );
};

// Delete Profile Modal Component
const DeleteProfileModal: React.FC<DeleteProfileModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting
}) => {
  const [confirmEmail, setConfirmEmail] = useState('');
  const { user } = useAuth();

  const handleConfirm = () => {
    if (confirmEmail === user?.email) {
      onConfirm();
    } else {
      toast.error('Email does not match');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <FaExclamationTriangle className="text-red-600 w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Delete Profile</h3>
        </div>

        <p className="text-gray-600 mb-4">
          This action cannot be undone. This will permanently delete your profile, cancel all bookings,
          and remove all of your data from our servers.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type your email <span className="font-mono bg-gray-100 px-2 py-1 rounded">{user?.email}</span> to confirm:
          </label>
          <input
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter your email to confirm"
            disabled={isDeleting}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting || confirmEmail !== user?.email}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;

