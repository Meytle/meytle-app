/**
 * Availability Manager Component
 * Allows companions to set their availability schedule
 */

import { useState, useEffect } from 'react';
import { FaClock, FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { bookingApi } from '../../api/booking';
import type { AvailabilitySlot } from '../../types';

const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

const DAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday', 
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
];

interface AvailabilityManagerProps {
  className?: string;
}

const AvailabilityManager = ({ className = '' }: AvailabilityManagerProps) => {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setIsLoading(true);
      const slots = await bookingApi.getCompanionAvailability(0); // 0 means current user
      setAvailability(slots);
    } catch (error: any) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load availability schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const addTimeSlot = (dayOfWeek: string) => {
    const newSlot: AvailabilitySlot = {
      day_of_week: dayOfWeek,
      start_time: '09:00',
      end_time: '17:00',
      is_available: true
    };
    setAvailability(prev => [...prev, newSlot]);
  };

  const removeTimeSlot = (index: number) => {
    setAvailability(prev => prev.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, field: keyof AvailabilitySlot, value: any) => {
    setAvailability(prev => prev.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    ));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await bookingApi.setCompanionAvailability(availability);
      toast.success('Availability schedule updated successfully!');
    } catch (error: any) {
      console.error('Error saving availability:', error);
      toast.error('Failed to save availability schedule');
    } finally {
      setIsSaving(false);
    }
  };

  const getSlotsForDay = (dayOfWeek: string) => {
    return availability.filter(slot => slot.day_of_week === dayOfWeek);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaClock className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Availability Schedule</h2>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          <FaSave className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>

      <div className="space-y-4">
        {DAYS_OF_WEEK.map(day => {
          const daySlots = getSlotsForDay(day);
          
          return (
            <div key={day} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                  {DAY_LABELS[day as keyof typeof DAY_LABELS]}
                </h3>
                <button
                  onClick={() => addTimeSlot(day)}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <FaPlus className="w-3 h-3" />
                  Add Slot
                </button>
              </div>

              {daySlots.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <FaClock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No availability set for this day</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {daySlots.map((slot, index) => {
                    const globalIndex = availability.findIndex(s => s === slot);
                    
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={slot.is_available}
                            onChange={(e) => updateTimeSlot(globalIndex, 'is_available', e.target.checked)}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Available</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">From:</label>
                          <select
                            value={slot.start_time}
                            onChange={(e) => updateTimeSlot(globalIndex, 'start_time', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            {TIME_SLOTS.map(time => (
                              <option key={time} value={time}>
                                {formatTime(time)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">To:</label>
                          <select
                            value={slot.end_time}
                            onChange={(e) => updateTimeSlot(globalIndex, 'end_time', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            {TIME_SLOTS.filter(time => time > slot.start_time).map(time => (
                              <option key={time} value={time}>
                                {formatTime(time)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={() => removeTimeSlot(globalIndex)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for setting your availability:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Set multiple time slots for the same day if you have breaks</li>
          <li>• Consider your peak hours and personal schedule</li>
          <li>• You can always update your availability later</li>
          <li>• Clients will only see available time slots when booking</li>
        </ul>
      </div>
    </div>
  );
};

export default AvailabilityManager;

