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
  FaUpload
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS, ROUTES } from '../constants';
import { getLocalStorageItem } from '../utils/localStorage';

interface ProfileData {
  fullName: string;
  phoneNumber: string;
  location: string;
  bio: string;
  profilePhoto: string;
  dateOfBirth: string;
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

interface VerificationStatus {
  emailVerified: boolean;
  idVerified: boolean;
  idDocumentUrl?: string;
  verificationDate?: string;
}

const ClientProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('');
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
  const [idDocumentPreview, setIdDocumentPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: user?.name || '',
    phoneNumber: '',
    location: '',
    bio: '',
    profilePhoto: '',
    dateOfBirth: '',
    interests: ['Art', 'Music', 'Travel', 'Coffee'],
    languages: ['English'],
    services: ['Coffee Date', 'Movie Night', 'Shopping']
  });

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    emailVerified: true,
    idVerified: false
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = getLocalStorageItem<string>(STORAGE_KEYS.AUTH_TOKEN);
        
        if (!token) {
          console.error('❌ No auth token found');
          setIsLoading(false);
          return;
        }

        console.log('🔍 Fetching client profile data');
        
        // TODO: Fetch from backend API
        // const response = await axios.get(`${API_CONFIG.BASE_URL}/client/profile`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        
        // For now, use placeholder data
        setProfileData({
          fullName: user?.name || '',
          phoneNumber: '',
          location: '',
          bio: '',
          profilePhoto: '',
          dateOfBirth: '',
          interests: ['Art', 'Music', 'Travel', 'Coffee'],
          languages: ['English'],
          services: ['Coffee Date', 'Movie Night', 'Shopping']
        });

        setVerificationStatus({
          emailVerified: true,
          idVerified: false
        });

      } catch (error: any) {
        console.error('❌ Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

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

  const toggleArrayItem = (field: 'interests' | 'languages' | 'services', item: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field]?.includes(item)
        ? prev[field].filter(i => i !== item)
        : [...(prev[field] || []), item]
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = getLocalStorageItem<string>(STORAGE_KEYS.AUTH_TOKEN);

      if (!token) {
        toast.error('Please login again');
        navigate(ROUTES.SIGN_IN);
        return;
      }

      // Upload profile photo if changed
      if (profilePhotoFile) {
        const photoFormData = new FormData();
        photoFormData.append('profilePhoto', profilePhotoFile);

        // TODO: Create backend endpoint for client profile photo
        // await axios.post(`${API_CONFIG.BASE_URL}/client/profile/photo`, photoFormData, {
        //   headers: {
        //     'Authorization': `Bearer ${token}`,
        //     'Content-Type': 'multipart/form-data',
        //   }
        // });
      }

      // Save profile data
      // TODO: Create backend endpoint
      // await axios.put(`${API_CONFIG.BASE_URL}/client/profile`, profileData, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });

      toast.success('Profile updated successfully!');
      setProfilePhotoFile(null);
      
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
      const token = getLocalStorageItem<string>(STORAGE_KEYS.AUTH_TOKEN);

      if (!token) {
        toast.error('Please login again');
        navigate(ROUTES.SIGN_IN);
        return;
      }

      const formData = new FormData();
      formData.append('idDocument', idDocumentFile);
      formData.append('dateOfBirth', profileData.dateOfBirth);

      // TODO: Create backend endpoint for ID verification
      // await axios.post(`${API_CONFIG.BASE_URL}/client/verify-identity`, formData, {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'multipart/form-data',
      //   }
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
                    <span className="text-sm">{profileData.location || 'Not specified'}</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                    <input
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
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
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {INTERESTS.map(interest => (
                      <label key={interest} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileData.interests?.includes(interest) || false}
                          onChange={() => toggleArrayItem('interests', interest)}
                          className="w-5 h-5 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{interest}</span>
                      </label>
                    ))}
                  </div>
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
                          checked={profileData.languages?.includes(language) || false}
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
                          checked={profileData.services?.includes(service) || false}
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientProfile;

