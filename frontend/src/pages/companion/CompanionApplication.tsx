/**
 * Companion Application Page
 * Verification form for companions to complete their profile
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaUpload, FaCamera, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import { ROUTES, API_CONFIG } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api/auth';
import InterestSelector from '../../components/common/InterestSelector';
import ServicesSelector from '../../components/companion/ServicesSelector';
import LanguageSelector from '../../components/companion/LanguageSelector';
import { countries, getStatesForCountry, type StateProvince } from '../../data/locationData';
import PhoneNumberInput from '../../components/common/PhoneNumberInput';

interface ApplicationFormData {
  profilePhoto: File | null;
  governmentId: File | null;
  dateOfBirth: string;
  governmentIdNumber: string;
  phoneNumber: string;
  addressLine: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  backgroundCheckConsent: boolean;
  termsAccepted: boolean;
  interests: string[];
  bio: string;
  services: string[];
  languages: string[];
  hourlyRate: number;
}

const CompanionApplication = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingApplication, setIsCheckingApplication] = useState(true);
  const [hasSubmittedSuccessfully, setHasSubmittedSuccessfully] = useState(false);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>('');
  const [idPreview, setIdPreview] = useState<string>('');
  
  const [formData, setFormData] = useState<ApplicationFormData>({
    profilePhoto: null,
    governmentId: null,
    dateOfBirth: '',
    governmentIdNumber: '',
    phoneNumber: '',
    addressLine: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    backgroundCheckConsent: false,
    termsAccepted: false,
    interests: [],
    bio: '',
    services: [],
    languages: ['English'], // English as default
    hourlyRate: 50,
  });

  const [availableStates, setAvailableStates] = useState<StateProvince[]>([]);

  // Check if user has already submitted an application (only run once on mount)
  useEffect(() => {
    let isMounted = true;

    const checkExistingApplication = async () => {
      // Don't check if we just submitted successfully
      if (hasSubmittedSuccessfully) {
        return;
      }

      try {
        // ProtectedRoute ensures we're authenticated before rendering
        // Check if they already have an application
        const hasApplication = await authApi.checkCompanionApplication();
        
        if (hasApplication && isMounted) {
          console.log('✅ Application already exists, redirecting to dashboard');
          toast('You have already submitted an application', {
            icon: 'ℹ️',
          });
          navigate(ROUTES.COMPANION_DASHBOARD, { replace: true });
        } else if (isMounted) {
          console.log('📝 No application found, user can submit');
          setIsCheckingApplication(false);
        }
      } catch (error) {
        if (isMounted) {
          console.log('📝 No application found (or error checking), allowing submission');
          setIsCheckingApplication(false);
        }
      }
    };

    checkExistingApplication();
    
    return () => {
      isMounted = false;
    };
  }, [navigate, hasSubmittedSuccessfully]);

  // Update available states when country changes
  useEffect(() => {
    if (formData.country) {
      const states = getStatesForCountry(formData.country);
      setAvailableStates(states);
      // Clear state selection if switching countries
      if (formData.state && states.length > 0) {
        const stateExists = states.some(s => s.name === formData.state);
        if (!stateExists) {
          setFormData(prev => ({ ...prev, state: '' }));
        }
      }
    } else {
      setAvailableStates([]);
    }
  }, [formData.country]);

  // Handle country change
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setFormData({ ...formData, country: newCountry, state: '' });
  };

  // Handle profile photo upload
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Photo must be less than 5MB');
        return;
      }
      setFormData({ ...formData, profilePhoto: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle government ID upload
  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('ID file must be less than 5MB');
        return;
      }
      setFormData({ ...formData, governmentId: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.profilePhoto) {
      toast.error('Please upload a profile photo');
      return;
    }
    if (!formData.governmentId) {
      toast.error('Please upload your government-issued ID');
      return;
    }
    if (!formData.dateOfBirth) {
      toast.error('Please enter your date of birth');
      return;
    }
    if (!formData.governmentIdNumber) {
      toast.error('Please enter your government ID number');
      return;
    }
    if (!formData.phoneNumber) {
      toast.error('Please enter your phone number');
      return;
    }
    if (!formData.addressLine) {
      toast.error('Please enter your address');
      return;
    }
    if (!formData.city) {
      toast.error('Please enter your city');
      return;
    }
    if (!formData.country) {
      toast.error('Please select your country');
      return;
    }
    if (!formData.state) {
      toast.error('Please select your state/province');
      return;
    }
    if (!formData.postalCode) {
      toast.error('Please enter your postal/zip code');
      return;
    }
    if (formData.services.length === 0) {
      toast.error('Please select at least one service you offer');
      return;
    }
    if (formData.languages.length === 0) {
      toast.error('Please select at least one language');
      return;
    }
    if (!formData.hourlyRate || formData.hourlyRate < 20) {
      toast.error('Please enter a valid hourly rate (minimum $20)');
      return;
    }
    if (!formData.backgroundCheckConsent) {
      toast.error('Please consent to the background check');
      return;
    }
    if (!formData.termsAccepted) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData to handle file uploads
      const formDataToSend = new FormData();
      
      // Add files
      if (formData.profilePhoto) {
        formDataToSend.append('profilePhoto', formData.profilePhoto);
        console.log('📸 Profile photo added:', formData.profilePhoto.name);
      }
      if (formData.governmentId) {
        formDataToSend.append('governmentId', formData.governmentId);
        console.log('🆔 Government ID added:', formData.governmentId.name);
      }
      
      // Add other fields
      formDataToSend.append('dateOfBirth', formData.dateOfBirth);
      formDataToSend.append('governmentIdNumber', formData.governmentIdNumber);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('backgroundCheckConsent', formData.backgroundCheckConsent.toString());

      // Add address fields
      formDataToSend.append('addressLine', formData.addressLine);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('country', formData.country);
      formDataToSend.append('postalCode', formData.postalCode);

      // Add interests and bio
      if (formData.interests.length > 0) {
        formDataToSend.append('interests', JSON.stringify(formData.interests));
      }
      if (formData.bio) {
        formDataToSend.append('bio', formData.bio);
      }

      // Add new fields
      formDataToSend.append('servicesOffered', JSON.stringify(formData.services));
      formDataToSend.append('languages', JSON.stringify(formData.languages));
      formDataToSend.append('hourlyRate', formData.hourlyRate.toString());

      // Log what we're sending for debugging
      console.log('📤 Submitting companion application with data:', {
        dateOfBirth: formData.dateOfBirth,
        governmentIdNumber: formData.governmentIdNumber,
        backgroundCheckConsent: formData.backgroundCheckConsent,
        hasProfilePhoto: !!formData.profilePhoto,
        hasGovernmentId: !!formData.governmentId,
        profilePhotoName: formData.profilePhoto?.name,
        governmentIdName: formData.governmentId?.name
      });
      
      // Submit application with files
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/companion/application`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      console.log('✅ Application submitted successfully!', response.data);

      // Mark as submitted to prevent useEffect from interfering
      setHasSubmittedSuccessfully(true);

      // Show success message for pending approval
      toast.success('Application submitted successfully! An admin will review it soon.', {
        duration: 3000,
      });

      // Navigate to companion dashboard to show pending status
      console.log('🔄 Navigating to companion dashboard to show pending status...');
      setTimeout(() => {
        window.location.href = ROUTES.COMPANION_DASHBOARD;
      }, 1500);
      
    } catch (error: any) {
      console.error('❌ Application submission error:', error);
      
      // More detailed error message
      let errorMessage = 'Failed to submit application';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        console.error('🔴 Backend Error Message:', error.response.data.message);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { duration: 5000 });
      
      // Log detailed error for debugging
      if (error.response) {
        console.error('📋 Full Error Response:', {
          status: error.response.status,
          message: error.response.data?.message,
          fullData: error.response.data,
          headers: error.response.headers,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking for existing application
  if (isCheckingApplication) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f9f8ff] to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#312E81] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Checking application status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f9f8ff] to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#312E81] to-[#312E81] bg-clip-text text-transparent mb-4">
            Companion Application
          </h1>
          <p className="text-gray-600">
            Complete your application to become a verified companion on MeetAndGo
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Profile Photo Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Profile Photo <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {profilePhotoPreview ? (
                  <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-[#d5d3f7]">
                    <img 
                      src={profilePhotoPreview} 
                      alt="Profile preview" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProfilePhotoPreview('');
                        setFormData({ ...formData, profilePhoto: null });
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-[#a5a3e8] rounded-xl cursor-pointer hover:border-[#312E81] hover:bg-[#f9f8ff] transition-all duration-200">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FaUpload className="w-12 h-12 text-[#4A47A3] mb-4" />
                      <p className="text-lg font-semibold text-gray-700 mb-2">Upload Profile Photo</p>
                      <p className="text-sm text-gray-500">Upload a clear photo of yourself</p>
                      <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Government-Issued ID Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Government-Issued ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {idPreview ? (
                  <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-[#d5d3f7]">
                    <img 
                      src={idPreview} 
                      alt="ID preview" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIdPreview('');
                        setFormData({ ...formData, governmentId: null });
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-[#a5a3e8] rounded-xl cursor-pointer hover:border-[#312E81] hover:bg-[#f9f8ff] transition-all duration-200">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FaCamera className="w-12 h-12 text-[#4A47A3] mb-4" />
                      <p className="text-lg font-semibold text-gray-700 mb-2">Upload Legal ID</p>
                      <p className="text-sm text-gray-500">Upload driver's license, passport, or national ID</p>
                      <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIdChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-900 mb-3">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-[#d5d3f7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a5a3e8] focus:border-transparent transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-2">You must be at least 18 years old</p>
            </div>

            {/* Government ID Number */}
            <div>
              <label htmlFor="governmentIdNumber" className="block text-sm font-semibold text-gray-900 mb-3">
                Government ID Number <span className="text-red-500">*</span>
              </label>
              <input
                id="governmentIdNumber"
                type="text"
                placeholder="Enter your ID number"
                value={formData.governmentIdNumber}
                onChange={(e) => setFormData({ ...formData, governmentIdNumber: e.target.value })}
                className="w-full px-4 py-3 border-2 border-[#d5d3f7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a5a3e8] focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Phone Number with Country Code */}
            <div>
              <PhoneNumberInput
                value={formData.phoneNumber}
                onChange={(fullNumber, countryCode, phoneNumber) => {
                  setFormData({ ...formData, phoneNumber: fullNumber });
                }}
                required={true}
                label="Phone Number"
                placeholder="Enter your phone number"
                error="Please enter a valid phone number"
              />
            </div>

            {/* Current Address Section */}
            <div>
              <div className="flex items-center mb-4">
                <FaMapMarkerAlt className="text-[#312E81] mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Current Address</h3>
              </div>

              {/* Address Line */}
              <div className="mb-4">
                <label htmlFor="addressLine" className="block text-sm font-semibold text-gray-900 mb-3">
                  Address Line <span className="text-red-500">*</span>
                </label>
                <input
                  id="addressLine"
                  type="text"
                  placeholder="Street address, P.O. box, apartment, suite, etc."
                  value={formData.addressLine}
                  onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#d5d3f7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a5a3e8] focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-gray-900 mb-3">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="city"
                    type="text"
                    placeholder="Enter your city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#d5d3f7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a5a3e8] focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-semibold text-gray-900 mb-3">
                    Postal/Zip Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="postalCode"
                    type="text"
                    placeholder="Enter postal/zip code"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-[#d5d3f7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a5a3e8] focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Country */}
                <div>
                  <label htmlFor="country" className="block text-sm font-semibold text-gray-900 mb-3">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="country"
                    value={formData.country}
                    onChange={handleCountryChange}
                    className="w-full px-4 py-3 border-2 border-[#d5d3f7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a5a3e8] focus:border-transparent transition-all bg-white"
                    required
                  >
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* State/Province */}
                <div>
                  <label htmlFor="state" className="block text-sm font-semibold text-gray-900 mb-3">
                    State/Province <span className="text-red-500">*</span>
                  </label>
                  {availableStates.length > 0 ? (
                    <select
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#d5d3f7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a5a3e8] focus:border-transparent transition-all bg-white"
                      required
                      disabled={!formData.country}
                    >
                      <option value="">Select a state/province</option>
                      {availableStates.map((state) => (
                        <option key={state.name} value={state.name}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="state"
                      type="text"
                      placeholder={formData.country ? "Enter state/province" : "Select country first"}
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-[#d5d3f7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a5a3e8] focus:border-transparent transition-all"
                      required
                      disabled={!formData.country}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-semibold text-gray-900 mb-3">
                Bio <span className="text-gray-500">(Optional)</span>
              </label>
              <textarea
                id="bio"
                placeholder="Tell us about yourself, your interests, and what makes you a great companion..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border-2 border-[#d5d3f7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a5a3e8] focus:border-transparent transition-all resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">Tell potential clients about yourself</p>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Interests <span className="text-gray-500">(Optional)</span>
              </label>
              <div className="overflow-hidden">
                <InterestSelector
                  selectedInterests={formData.interests}
                  onInterestsChange={(interests) => setFormData({ ...formData, interests })}
                  maxSelections={8}
                  className="border-2 border-[#d5d3f7] rounded-xl p-4"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Select activities you enjoy to help clients find you</p>
            </div>

            {/* Services Offered */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Services Offered <span className="text-red-500">*</span>
              </label>
              <ServicesSelector
                selectedServices={formData.services}
                onServicesChange={(services) => setFormData({ ...formData, services })}
                maxSelections={10}
              />
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Languages Spoken <span className="text-red-500">*</span>
              </label>
              <LanguageSelector
                selectedLanguages={formData.languages}
                onLanguagesChange={(languages) => setFormData({ ...formData, languages })}
                maxSelections={5}
              />
            </div>

            {/* Hourly Rate */}
            <div>
              <label htmlFor="hourlyRate" className="block text-sm font-semibold text-gray-900 mb-3">
                Base Hourly Rate (USD) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="text-2xl text-gray-600 mr-2">$</span>
                <input
                  id="hourlyRate"
                  type="number"
                  min="20"
                  max="500"
                  placeholder="50"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                  className="w-32 px-4 py-3 border-2 border-[#d5d3f7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a5a3e8] focus:border-transparent transition-all text-lg font-semibold"
                  required
                />
                <span className="text-gray-600 ml-2">/hour</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">You can negotiate different rates for specific bookings</p>
            </div>

            {/* Consent Checkboxes */}
            <div className="space-y-4 pt-4">
              <div className="flex items-start">
                <input
                  id="backgroundCheck"
                  type="checkbox"
                  checked={formData.backgroundCheckConsent}
                  onChange={(e) => setFormData({ ...formData, backgroundCheckConsent: e.target.checked })}
                  className="w-5 h-5 text-[#312E81] border-2 border-gray-300 rounded focus:ring-[#312E81] focus:ring-2 mt-0.5"
                  required
                />
                <label htmlFor="backgroundCheck" className="ml-3 text-sm text-gray-700">
                  I consent to a background check being performed as part of the verification process{' '}
                  <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  className="w-5 h-5 text-[#312E81] border-2 border-gray-300 rounded focus:ring-[#312E81] focus:ring-2 mt-0.5"
                  required
                />
                <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                  I accept the{' '}
                  <a href="#" className="text-[#312E81] hover:text-[#1E1B4B] font-semibold">
                    terms and conditions
                  </a>
                  {' '}and{' '}
                  <a href="#" className="text-[#312E81] hover:text-[#1E1B4B] font-semibold">
                    privacy policy
                  </a>{' '}
                  <span className="text-red-500">*</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting || hasSubmittedSuccessfully}
                className={`w-full bg-gradient-to-r from-[#312E81] to-[#312E81] text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-[#312E81] hover:to-[#312E81] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                  isSubmitting || hasSubmittedSuccessfully ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {hasSubmittedSuccessfully 
                  ? '✓ Submitted! Redirecting...' 
                  : isSubmitting 
                  ? 'Submitting Application...' 
                  : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Note */}
        <div className="mt-8 bg-[#f9f8ff] border border-[#d5d3f7] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#1E1B4B] mb-2">📋 What happens next?</h3>
          <ul className="space-y-2 text-sm text-[#1E1B4B]">
            <li>• Our team will review your application within 24-48 hours</li>
            <li>• You'll receive an email notification once verified</li>
            <li>• All information is encrypted and kept confidential</li>
            <li>• You can check your application status in your dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CompanionApplication;
