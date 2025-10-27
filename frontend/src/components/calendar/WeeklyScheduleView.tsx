/**
 * Weekly Schedule View Component
 * Shows a companion's weekly availability schedule in a clear, visual format
 */

import { useState, useEffect } from 'react';
import { FaClock, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import { bookingApi } from '../../api/booking';
import { toast } from 'react-hot-toast';

interface WeeklySlot {
  startTime: string;
  endTime: string;
  services: string[];
}

interface WeeklyAvailability {
  weeklyPattern: {
    monday: WeeklySlot[];
    tuesday: WeeklySlot[];
    wednesday: WeeklySlot[];
    thursday: WeeklySlot[];
    friday: WeeklySlot[];
    saturday: WeeklySlot[];
    sunday: WeeklySlot[];
  };
  summary: {
    totalSlotsPerWeek: number;
    daysAvailable: number;
    availableDays: string[];
  };
}

interface WeeklyScheduleViewProps {
  companionId: number;
  className?: string;
  showServices?: boolean;
  compact?: boolean;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Mon', fullLabel: 'Monday' },
  { key: 'tuesday', label: 'Tue', fullLabel: 'Tuesday' },
  { key: 'wednesday', label: 'Wed', fullLabel: 'Wednesday' },
  { key: 'thursday', label: 'Thu', fullLabel: 'Thursday' },
  { key: 'friday', label: 'Fri', fullLabel: 'Friday' },
  { key: 'saturday', label: 'Sat', fullLabel: 'Saturday' },
  { key: 'sunday', label: 'Sun', fullLabel: 'Sunday' }
] as const;

const WeeklyScheduleView = ({
  companionId,
  className = '',
  showServices = false,
  compact = false
}: WeeklyScheduleViewProps) => {
  const [availability, setAvailability] = useState<WeeklyAvailability | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeeklyAvailability();
  }, [companionId]);

  const fetchWeeklyAvailability = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bookingApi.getCompanionWeeklyAvailability(companionId);
      setAvailability(data);
    } catch (err: any) {
      console.error('Error fetching weekly availability:', err);
      setError('Failed to load availability schedule');
      toast.error('Failed to load availability schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  const getDayStatus = (dayKey: keyof WeeklyAvailability['weeklyPattern']) => {
    if (!availability) return { available: false, slots: 0 };
    const daySlots = availability.weeklyPattern[dayKey];
    return {
      available: daySlots.length > 0,
      slots: daySlots.length
    };
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !availability) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <FaInfoCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">{error || 'No availability information available'}</p>
        </div>
      </div>
    );
  }

  if (compact) {
    // Compact view for embedding in other components
    return (
      <div className={`bg-gradient-to-br from-[#f9f8ff] to-blue-50 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <FaCalendarAlt className="w-5 h-5 text-[#312E81]" />
          <h3 className="font-semibold text-gray-900">Weekly Schedule</h3>
          {availability.summary.daysAvailable > 0 && (
            <span className="ml-auto text-sm text-green-600 font-medium">
              Available {availability.summary.daysAvailable} days/week
            </span>
          )}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {DAYS_OF_WEEK.map(day => {
            const status = getDayStatus(day.key as keyof WeeklyAvailability['weeklyPattern']);
            return (
              <div
                key={day.key}
                className={`text-center p-2 rounded-lg transition-all ${
                  status.available
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}
                title={status.available ? `${status.slots} time slot(s) available` : 'Not available'}
              >
                <div className="text-xs font-medium">{day.label}</div>
                {status.available && (
                  <FaCheckCircle className="w-3 h-3 mx-auto mt-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#312E81] to-[#312E81] text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FaCalendarAlt className="w-6 h-6" />
              Weekly Availability
            </h2>
            <p className="text-[#f0effe] mt-1">
              Regular schedule across the week
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{availability.summary.daysAvailable}</div>
            <div className="text-[#f0effe] text-sm">Days Available</div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#312E81]">{availability.summary.totalSlotsPerWeek}</div>
          <div className="text-xs text-gray-600">Total Slots/Week</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{availability.summary.daysAvailable}</div>
          <div className="text-xs text-gray-600">Days Available</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#312E81]">
            {availability.summary.totalSlotsPerWeek > 0
              ? Math.round(availability.summary.totalSlotsPerWeek / Math.max(1, availability.summary.daysAvailable))
              : 0}
          </div>
          <div className="text-xs text-gray-600">Avg Slots/Day</div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="p-6">
        <div className="space-y-3">
          {DAYS_OF_WEEK.map(day => {
            const daySlots = availability.weeklyPattern[day.key as keyof WeeklyAvailability['weeklyPattern']];
            const isAvailable = daySlots.length > 0;

            return (
              <div
                key={day.key}
                className={`rounded-xl border-2 transition-all ${
                  isAvailable
                    ? 'border-green-200 bg-green-50 hover:shadow-md'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isAvailable ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                      }`}>
                        {isAvailable ? <FaCheckCircle className="w-5 h-5" /> : <FaTimesCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{day.fullLabel}</h3>
                        <p className="text-sm text-gray-600">
                          {isAvailable ? `${daySlots.length} time slot${daySlots.length > 1 ? 's' : ''} available` : 'Not available'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isAvailable && (
                    <div className="ml-13 space-y-2">
                      {daySlots.map((slot, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <FaClock className="w-4 h-4 text-[#312E81] mt-1" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">
                              {formatTimeRange(slot.startTime, slot.endTime)}
                            </div>
                            {showServices && slot.services.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {slot.services.map((service, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block px-2 py-1 text-xs bg-[#f0effe] text-[#1E1B4B] rounded"
                                  >
                                    {service}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      {availability.summary.daysAvailable === 0 && (
        <div className="p-4 bg-yellow-50 border-t border-yellow-200">
          <div className="flex items-center gap-2 text-yellow-800">
            <FaInfoCircle className="w-4 h-4" />
            <p className="text-sm">This companion hasn't set their availability yet.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyScheduleView;