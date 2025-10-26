/**
 * Detailed Booking Modal Component
 * Multi-step booking wizard in a modal popup with Google Places integration
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaServicestack,
  FaMapMarkerAlt,
  FaDollarSign,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaSpinner,
  FaExclamationCircle
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { bookingApi } from '../../api/booking';
import { serviceCategoryApi } from '../../api/serviceCategory';
import AddressSearch from '../common/AddressSearch';
import type { ServiceCategory, AvailabilitySlot } from '../../types';

interface DetailedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  companionId: number;
  companionName: string;
  selectedDate: Date;
  selectedTimeSlot: {
    start: string;
    end: string;
    services?: string[];
  };
  companionServices?: string[];
  hourlyRate?: number;
  onBookingCreated?: (bookingId: number) => void;
}

interface TimeSlot {
  start: string;
  end: string;
  services?: string[] | string;
}

interface BookingData {
  selectedTime: TimeSlot | null;
  selectedService: string;
  meetingLocation: string;
  placeDetails?: any; // Using any to avoid Google Maps type dependency
  specialRequests: string;
  // Removed custom service fields as they're not used in regular booking
  isCustomService?: boolean;
  customServiceName?: string;
  customServiceDescription?: string;
}

const DetailedBookingModal: React.FC<DetailedBookingModalProps> = ({
  isOpen,
  onClose,
  companionId,
  companionName,
  selectedDate,
  selectedTimeSlot,
  companionServices = [],
  hourlyRate = 75,
  onBookingCreated
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bookingData, setBookingData] = useState<BookingData>({
    selectedTime: selectedTimeSlot,
    selectedService: '',
    meetingLocation: '',
    placeDetails: undefined,
    specialRequests: ''
  });

  // Get available services based on selected time slot
  const getAvailableServices = () => {
    if (bookingData.selectedTime?.services) {
      // Parse services if they're a string
      const services = typeof bookingData.selectedTime.services === 'string'
        ? JSON.parse(bookingData.selectedTime.services)
        : bookingData.selectedTime.services;

      // Filter out empty strings and return unique services
      return Array.from(new Set(services.filter((s: string) => s && s.trim() !== '')));
    }

    // Fallback to companion's general services if no slot-specific services
    return companionServices;
  };

  const totalSteps = 3;

  // Fetch service categories when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchServiceCategories();
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setBookingData({
        selectedTime: selectedTimeSlot,
        selectedService: '',
        meetingLocation: '',
        placeDetails: undefined,
        specialRequests: ''
      });
    }
  }, [isOpen, selectedTimeSlot]);


  const fetchServiceCategories = async () => {
    setIsLoadingServices(true);
    try {
      const categories = await serviceCategoryApi.getAllCategories(true);
      setServiceCategories(categories);
    } catch (error) {
      console.error('Error fetching service categories:', error);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateDuration = (start: string, end: string) => {
    const startTime = new Date(`2000-01-01 ${start}`);
    const endTime = new Date(`2000-01-01 ${end}`);
    return (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  };

  const calculateTotal = () => {
    if (!bookingData.selectedTime) return { subtotal: 0, serviceFee: 0, total: 0 };

    const duration = calculateDuration(bookingData.selectedTime.start, bookingData.selectedTime.end);
    const subtotal = duration * hourlyRate;
    const serviceFee = subtotal * 0.10; // 10% platform fee
    const total = subtotal + serviceFee;

    return { subtotal, serviceFee, total, duration };
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (!bookingData.selectedService) {
        toast.error('Please select a service');
        return;
      }
    }
    if (currentStep === 2 && !bookingData.meetingLocation) {
      toast.error('Please provide a meeting location');
      return;
    }

    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];

      // Use snake_case field names to match backend expectations
      const bookingPayload = {
        companionId: companionId, // Keep for TypeScript interface
        companion_id: companionId, // Add snake_case for backend
        bookingDate: dateStr, // Keep for TypeScript interface
        booking_date: dateStr, // Add snake_case for backend
        startTime: bookingData.selectedTime!.start, // Keep for TypeScript interface
        start_time: bookingData.selectedTime!.start, // Add snake_case for backend
        endTime: bookingData.selectedTime!.end, // Keep for TypeScript interface
        end_time: bookingData.selectedTime!.end, // Add snake_case for backend
        meetingLocation: bookingData.meetingLocation,
        meeting_location: bookingData.meetingLocation, // Add snake_case
        specialRequests: bookingData.specialRequests || undefined,
        special_requests: bookingData.specialRequests || undefined, // Add snake_case
        meetingType: 'in_person' as const,
        meeting_type: 'in_person' as const, // Add snake_case
        serviceCategoryId: bookingData.selectedService ? undefined : 1, // Default service category
        service_category_id: bookingData.selectedService ? undefined : 1 // Snake case for backend
      };

      const result = await bookingApi.createBooking(bookingPayload as any);

      toast.success('Booking created successfully!');
      if (onBookingCreated) {
        onBookingCreated(result.bookingId);
      }
      onClose();
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: 'Service' },
      { number: 2, title: 'Location' },
      { number: 3, title: 'Review' }
    ];

    return (
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  currentStep >= step.number
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep > step.number ? (
                  <FaCheckCircle className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <span className={`text-xs mt-1 ${
                currentStep >= step.number ? 'text-primary-600' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-colors ${
                  currentStep > step.number ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  const { subtotal, serviceFee, total, duration } = calculateTotal();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-600 to-secondary-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    Book {companionName}
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <FaTimes className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-white/80 mt-1">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                {renderStepIndicator()}

                <AnimatePresence mode="wait">
                  {/* Step 1: Service Selection */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FaServicestack className="text-primary-600" />
                        Select Service
                      </h3>

                      {isLoadingServices ? (
                        <div className="flex items-center justify-center py-8">
                          <FaSpinner className="w-6 h-6 text-primary-600 animate-spin" />
                        </div>
                      ) : (
                        <>
                          {(() => {
                            const availableServices = getAvailableServices();

                            return (
                              <>
                                <select
                                  value={bookingData.selectedService}
                                  onChange={(e) => {
                                    setBookingData(prev => ({
                                      ...prev,
                                      selectedService: e.target.value
                                    }));
                                  }}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                  <option value="">-- Please Select a Service --</option>
                                  {availableServices.length > 0 ? (
                                    availableServices.map((service, index) => (
                                      <option key={index} value={String(service)}>
                                        {String(service)}
                                      </option>
                                    ))
                                  ) : (
                                    <option value="" disabled>No services available for this time slot</option>
                                  )}
                                </select>

                                {availableServices.length === 0 && (
                                  <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-sm text-amber-800">
                                      No specific services are configured for this time slot.
                                      Please use the "Request Custom Booking" option to specify your needs.
                                    </p>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </>
                      )}
                    </motion.div>
                  )}

                  {/* Step 2: Location */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-primary-600" />
                        Meeting Location
                      </h3>

                      <AddressSearch
                        value={bookingData.meetingLocation}
                        onChange={(address, placeDetails) => {
                          setBookingData(prev => ({
                            ...prev,
                            meetingLocation: address,
                            placeDetails: placeDetails as any
                          }));
                        }}
                        label="Where would you like to meet?"
                        placeholder="Search for a location..."
                        required
                        showMap={true}
                        className="mb-4"
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Special Requests (Optional)
                        </label>
                        <textarea
                          value={bookingData.specialRequests}
                          onChange={(e) => setBookingData(prev => ({ ...prev, specialRequests: e.target.value }))}
                          placeholder="Any special requests or preferences..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          rows={3}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Review */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FaCheckCircle className="text-primary-600" />
                        Review & Confirm
                      </h3>

                      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                        {/* Date & Time */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <FaCalendarAlt className="text-gray-500 mt-1" />
                            <div>
                              <p className="font-semibold text-gray-900">Date & Time</p>
                              <p className="text-sm text-gray-600">
                                {selectedDate.toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              <p className="text-sm text-gray-600">
                                {bookingData.selectedTime && `${formatTime(bookingData.selectedTime.start)} - ${formatTime(bookingData.selectedTime.end)}`}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Duration: {duration} hours
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Service */}
                        <div className="flex justify-between items-start border-t pt-4">
                          <div className="flex items-start gap-3">
                            <FaServicestack className="text-gray-500 mt-1" />
                            <div>
                              <p className="font-semibold text-gray-900">Service</p>
                              <p className="text-sm text-gray-600">
                                {bookingData.selectedService || 'Not selected'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex justify-between items-start border-t pt-4">
                          <div className="flex items-start gap-3">
                            <FaMapMarkerAlt className="text-gray-500 mt-1" />
                            <div>
                              <p className="font-semibold text-gray-900">Location</p>
                              <p className="text-sm text-gray-600">
                                {bookingData.meetingLocation}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="border-t pt-4">
                          <div className="flex items-start gap-3">
                            <FaDollarSign className="text-gray-500 mt-1" />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 mb-2">Price Breakdown</p>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Service ({duration} hours × ${hourlyRate})</span>
                                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Platform Fee (10%)</span>
                                  <span className="font-medium">${serviceFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t text-base font-bold">
                                  <span>Total</span>
                                  <span className="text-primary-600">${total.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {bookingData.specialRequests && (
                          <div className="border-t pt-4">
                            <p className="font-semibold text-gray-900 mb-2">Special Requests</p>
                            <p className="text-sm text-gray-600">{bookingData.specialRequests}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
                <button
                  onClick={currentStep === 1 ? onClose : handleBack}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  <FaArrowLeft />
                  {currentStep === 1 ? 'Cancel' : 'Back'}
                </button>

                {currentStep < totalSteps ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                  >
                    Next
                    <FaArrowRight />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-500 text-white rounded-lg hover:from-primary-700 hover:to-secondary-600 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle />
                        Confirm Booking
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DetailedBookingModal;