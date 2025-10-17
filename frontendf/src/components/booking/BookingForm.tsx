/**
 * Booking Form Component
 * Form for creating new bookings
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendar, FaClock, FaMapMarkerAlt, FaComments, FaDollarSign, FaCheck, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Calendar from '../calendar/Calendar';
import TimeSlotPicker from '../calendar/TimeSlotPicker';
import { bookingApi } from '../../api/booking';
import { serviceCategoryApi } from '../../api/serviceCategory';
import { BOOKING_CONSTANTS, BOOKING_STEPS, ROUTES } from '../../constants';
import Badge from '../common/Badge';
import Button from '../common/Button';
import type { BookingFormData, TimeSlot, BookingDateInfo, ServiceCategory, MeetingType } from '../../types';

interface BookingFormProps {
  companionId: number;
  companionName: string;
  onBookingCreated: (bookingId: number) => void;
  onCancel: () => void;
  className?: string;
}

const BookingForm = ({ 
  companionId, 
  companionName, 
  onBookingCreated, 
  onCancel,
  className = ''
}: BookingFormProps) => {
  const navigate = useNavigate();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [meetingType] = useState<string>('in_person');
  const [stepValidation, setStepValidation] = useState({ step1: false, step2: false, step3: false });

  // Existing booking state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New state for booking data
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthBookings, setMonthBookings] = useState<Array<{ id: number; booking_date: string; start_time: string; end_time: string; status: string }>>([]);
  const [bookingsByDate, setBookingsByDate] = useState<Record<string, BookingDateInfo>>({});
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  
  const [formData, setFormData] = useState({
    specialRequests: '',
    meetingLocation: ''
  });

  // Helper function to create local date keys (YYYY-MM-DD) without timezone issues
  const localDateKey = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to calculate date range for a month
  const getMonthDateRange = (date: Date): { startDate: string; endDate: string } => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    
    // Extend range to include overflow days from previous/next months
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    return {
      startDate: localDateKey(startDate),
      endDate: localDateKey(endDate)
    };
  };

  // Fetch bookings for current month
  const fetchMonthBookings = async () => {
    if (!companionId) return;
    
    setIsLoadingBookings(true);
    try {
      const { startDate, endDate } = getMonthDateRange(currentMonth);
      const bookings = await bookingApi.getCompanionBookingsByDateRange(companionId, startDate, endDate);
      setMonthBookings(bookings);
      await processBookingData(bookings);
    } catch (error: any) {
      console.error('Error fetching month bookings:', error);
      toast.error('Failed to load booking data');
    } finally {
      setIsLoadingBookings(false);
    }
  };

  // Process bookings into date-based structure
  const processBookingData = async (bookings: Array<{ id: number; booking_date: string; start_time: string; end_time: string; status: string }>) => {
    const bookingsByDateMap: Record<string, BookingDateInfo> = {};
    
    // Group bookings by date
    bookings.forEach(booking => {
      const dateStr = booking.booking_date;
      if (!bookingsByDateMap[dateStr]) {
        bookingsByDateMap[dateStr] = {
          date: dateStr,
          bookings: [],
          bookingCount: 0,
          isFullyBooked: false,
          isPartiallyBooked: false
        };
      }
      
      bookingsByDateMap[dateStr].bookings.push(booking);
      bookingsByDateMap[dateStr].bookingCount++;
    });
    
    // Determine if dates are fully or partially booked
    for (const dateInfo of Object.values(bookingsByDateMap)) {
      if (dateInfo.bookingCount > 0) {
        dateInfo.isPartiallyBooked = true;
        
        // Check if fully booked by comparing against available slots
        try {
          const availableSlots = await bookingApi.getAvailableTimeSlots(companionId, dateInfo.date);
          const remaining = availableSlots.availableSlots.length;
          
          // Mark as fully booked if no slots remain and there are bookings
          // remaining === 0 indicates no slots remain after bookings
          // The extra bookingCount > 0 guards against marking unscheduled days as "fully booked by bookings"
          if (remaining === 0 && dateInfo.bookingCount > 0) {
            dateInfo.isFullyBooked = true;
          }
        } catch (error) {
          console.error('Error checking availability for date:', dateInfo.date, error);
          // If we can't check availability, don't mark as fully booked
        }
      }
    }
    
    setBookingsByDate(bookingsByDateMap);
  };

  // Fetch service categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const categories = await serviceCategoryApi.getAllCategories(true);
        setServiceCategories(categories);
      } catch (error: any) {
        console.error('Error fetching service categories:', error);
        toast.error('Failed to load service categories');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch bookings when month changes
  useEffect(() => {
    if (companionId) {
      fetchMonthBookings();
    }
  }, [currentMonth, companionId]);

  // Fetch available time slots when date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedTimeSlot(null);
    }
  }, [selectedDate, companionId]);

  const fetchAvailableSlots = async () => {
    if (!selectedDate) return;
    
    setIsLoadingSlots(true);
    try {
      const dateString = localDateKey(selectedDate);
      const response = await bookingApi.getAvailableTimeSlots(companionId, dateString);
      setAvailableSlots(response.availableSlots);
    } catch (error: any) {
      console.error('Error fetching available slots:', error);
      toast.error('Failed to load available time slots');
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Step validation functions
  const validateStep1 = () => {
    if (!selectedDate || !selectedTimeSlot) {
      return false;
    }
    
    // Validate duration constraints
    const duration = calculateDuration(selectedTimeSlot.startTime, selectedTimeSlot.endTime);
    return duration >= BOOKING_CONSTANTS.MIN_BOOKING_HOURS && duration <= BOOKING_CONSTANTS.MAX_BOOKING_HOURS;
  };

  const validateStep2 = () => {
    // Allow proceeding if no categories are available or if a category is selected
    return serviceCategories.length === 0 || selectedCategory !== null;
  };

  const validateStep3 = () => {
    return true; // Review step has no additional validation
  };

  // Update step validation when dependencies change
  useEffect(() => {
    setStepValidation({
      step1: validateStep1(),
      step2: validateStep2(),
      step3: validateStep3()
    });
  }, [selectedDate, selectedTimeSlot, selectedCategory]);

  // Navigation functions
  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      if (!selectedDate || !selectedTimeSlot) {
        toast.error('Please select a date and time slot');
      } else {
        const duration = calculateDuration(selectedTimeSlot.startTime, selectedTimeSlot.endTime);
        if (duration < BOOKING_CONSTANTS.MIN_BOOKING_HOURS) {
          toast.error(`Booking duration must be at least ${BOOKING_CONSTANTS.MIN_BOOKING_HOURS} hour(s)`);
        } else if (duration > BOOKING_CONSTANTS.MAX_BOOKING_HOURS) {
          toast.error(`Booking duration cannot exceed ${BOOKING_CONSTANTS.MAX_BOOKING_HOURS} hours`);
        }
      }
      return;
    }
    if (currentStep === 2 && !validateStep2()) {
      toast.error('Please select a service category');
      return;
    }
    if (currentStep < BOOKING_STEPS.TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep && stepValidation[`step${step}` as keyof typeof stepValidation]) {
      setCurrentStep(step);
    }
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  const calculateTotal = () => {
    if (!selectedTimeSlot) return { subtotal: 0, serviceFee: 0, total: 0, duration: 0 };
    
    const duration = calculateDuration(selectedTimeSlot.startTime, selectedTimeSlot.endTime);
    const hourlyRate = selectedCategory?.base_price || 35;
    const subtotal = duration * hourlyRate;
    const serviceFee = subtotal * BOOKING_CONSTANTS.SERVICE_FEE_PERCENTAGE;
    const total = subtotal + serviceFee;
    
    return { subtotal, serviceFee, total, duration };
  };

  // STRIPE INTEGRATION PLACEHOLDER
  // When Stripe is integrated, add payment intent creation here:
  // 1. After form validation, create payment intent: const { clientSecret } = await bookingApi.createPaymentIntent(bookingId, totalAmount)
  // 2. Show Stripe payment form with clientSecret
  // 3. On successful payment, call bookingApi.updatePaymentStatus(bookingId, { paymentStatus: 'paid', paymentMethod: 'stripe', paymentIntentId })
  // 4. Then navigate to confirmation page
  // For now, we skip payment processing and go directly to confirmation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTimeSlot) {
      toast.error('Please select a date and time slot');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingData: BookingFormData = {
        companionId,
        bookingDate: localDateKey(selectedDate),
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
        specialRequests: formData.specialRequests || undefined,
        meetingLocation: formData.meetingLocation || undefined,
        serviceCategoryId: selectedCategory?.id,
        meetingType: meetingType as MeetingType
      };

      const result = await bookingApi.createBooking(bookingData);
      
      toast.success('Booking created successfully!');
      onBookingCreated(result.bookingId);
      
      // Refresh booking data to update calendar before navigation
      await fetchMonthBookings();
      
      // Refresh available slots for the selected date if still selected
      if (selectedDate) {
        await fetchAvailableSlots();
      }
      
      // Navigate to payment confirmation page after state updates
      navigate(`${ROUTES.PAYMENT_CONFIRMATION}/${result.bookingId}`);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create booking';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Compute props for Calendar component
  const disabledDates = Object.entries(bookingsByDate)
    .filter(([_, info]) => info.isFullyBooked)
    .map(([dateStr]) => {
      // Parse date string into components to avoid timezone issues
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    });
  
  const partialDates = Object.entries(bookingsByDate)
    .filter(([_, info]) => info.isPartiallyBooked)
    .map(([dateStr]) => {
      // Parse date string into components to avoid timezone issues
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    });
  
  const bookingCounts = Object.entries(bookingsByDate)
    .reduce((acc, [dateStr, info]) => ({ ...acc, [dateStr]: info.bookingCount }), {} as Record<string, number>);

  // Compute unavailableSlots for TimeSlotPicker
  const unavailableSlots: TimeSlot[] = selectedDate 
    ? (bookingsByDate[localDateKey(selectedDate)]?.bookings.map(b => ({ 
        startTime: b.start_time, 
        endTime: b.end_time 
      })) || [])
    : [];

  // Step Indicator Component
  const StepIndicator = () => {
    const steps = [
      { number: 1, title: 'Date & Time', icon: FaCalendar },
      { number: 2, title: 'Service Details', icon: FaClock },
      { number: 3, title: 'Review & Book', icon: FaCheck }
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isClickable = isCompleted;

          return (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : isCompleted
                    ? 'border-success-500 bg-success-500 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                } ${isClickable ? 'hover:scale-105' : ''}`}
                onClick={() => isClickable && handleStepClick(step.number)}
              >
                {isCompleted ? (
                  <FaCheck className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              
              <div className="ml-3 text-center">
                <div className={`text-sm font-medium ${
                  isCurrent ? 'text-primary-600' : isCompleted ? 'text-success-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-success-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const totalCalculation = calculateTotal();

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Book {companionName}
          </h2>
          <p className="text-gray-600">
            Complete the steps below to create your booking
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Date & Time Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaCalendar className="w-5 h-5" />
                  Select Date
                </h3>
                <Calendar
                  selectedDate={selectedDate || undefined}
                  onDateSelect={handleDateSelect}
                  disabledDates={disabledDates}
                  partialDates={partialDates}
                  bookingCounts={bookingCounts}
                  onMonthChange={(year, month) => setCurrentMonth(new Date(year, month))}
                  minDate={new Date()}
                  className="max-w-md"
                />
              </div>

              {selectedDate && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaClock className="w-5 h-5" />
                    Select Time for {formatDate(selectedDate)}
                  </h3>
                  <TimeSlotPicker
                    availableSlots={availableSlots}
                    unavailableSlots={unavailableSlots}
                    selectedSlot={selectedTimeSlot || undefined}
                    onSlotSelect={handleTimeSlotSelect}
                    isLoading={isLoadingSlots}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Service Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaComments className="w-5 h-5" />
                  Service Category
                </h3>
                
                {isLoadingCategories ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    <span className="ml-2 text-gray-600">Loading categories...</span>
                  </div>
                ) : (
                  <select
                    value={selectedCategory?.id || ''}
                    onChange={(e) => {
                      if (e.target.value === 'fallback') {
                        setSelectedCategory(null);
                      } else {
                        const categoryId = parseInt(e.target.value);
                        const category = serviceCategories.find(c => c.id === categoryId);
                        setSelectedCategory(category || null);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select a service category</option>
                    {serviceCategories.length === 0 ? (
                      <option value="fallback">Standard - $35/hour</option>
                    ) : (
                      serviceCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name} - ${category.base_price}/hour
                        </option>
                      ))
                    )}
                  </select>
                )}

                {selectedCategory && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">{selectedCategory.name}</h4>
                    {selectedCategory.description && (
                      <p className="text-sm text-gray-600 mb-2">{selectedCategory.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <FaDollarSign className="w-4 h-4" />
                      <span>Base Rate: ${selectedCategory.base_price}/hour</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaMapMarkerAlt className="w-5 h-5" />
                  Meeting Type
                </h3>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <FaMapMarkerAlt className="w-5 h-5 text-primary-500" />
                  <span className="text-gray-700">In-Person Meeting</span>
                  <Badge variant="info" size="sm">Default</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review & Book */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FaCheck className="w-5 h-5" />
                  Booking Summary
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Date & Time</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Date: {selectedDate && formatDate(selectedDate)}</div>
                        <div>Time: {selectedTimeSlot?.startTime} - {selectedTimeSlot?.endTime}</div>
                        <div>Duration: {totalCalculation.duration} hours</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Service Details</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Category: {selectedCategory?.name || 'Standard'}</div>
                        <div>Meeting Type: In-Person</div>
                        <div>Rate: ${selectedCategory?.base_price || 35}/hour</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Price Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal ({totalCalculation.duration} hours × ${selectedCategory?.base_price || 35}):</span>
                        <span>${totalCalculation.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service Fee (10%):</span>
                        <span>${totalCalculation.serviceFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span className="flex items-center gap-1">
                          <FaDollarSign className="w-4 h-4" />
                          {totalCalculation.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Location (Optional)
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.meetingLocation}
                      onChange={(e) => handleInputChange('meetingLocation', e.target.value)}
                      placeholder="e.g., Central Park, Coffee Shop"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    placeholder="Any special requests or preferences..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                icon={<FaArrowLeft className="w-4 h-4" />}
                iconPosition="left"
                className="flex-1"
              >
                Back
              </Button>
            )}
            
            {currentStep < BOOKING_STEPS.TOTAL_STEPS ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                disabled={!stepValidation[`step${currentStep}` as keyof typeof stepValidation]}
                icon={<FaArrowRight className="w-4 h-4" />}
                iconPosition="right"
                className="flex-1"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                disabled={!stepValidation.step1 || !stepValidation.step2 || isSubmitting}
                loading={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Creating Booking...' : 'Create Booking'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;

