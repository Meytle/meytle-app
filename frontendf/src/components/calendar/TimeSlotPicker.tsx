/**
 * Time Slot Picker Component
 * Allows users to select available time slots
 */

import { useState, useEffect } from 'react';
import { FaClock } from 'react-icons/fa';
import type { TimeSlot } from '../../types';

interface TimeSlotPickerProps {
  availableSlots: TimeSlot[];
  unavailableSlots?: TimeSlot[];
  selectedSlot?: TimeSlot;
  onSlotSelect: (slot: TimeSlot) => void;
  isLoading?: boolean;
  className?: string;
}

const TimeSlotPicker = ({ 
  availableSlots, 
  unavailableSlots = [],
  selectedSlot, 
  onSlotSelect, 
  isLoading = false,
  className = ''
}: TimeSlotPickerProps) => {
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(selectedSlot || null);

  useEffect(() => {
    if (selectedSlot) {
      setSelectedTime(selectedSlot);
    }
  }, [selectedSlot]);

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedTime(slot);
    onSlotSelect(slot);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isSlotSelected = (slot: TimeSlot) => {
    return selectedTime && 
           selectedTime.startTime === slot.startTime && 
           selectedTime.endTime === slot.endTime;
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl border border-neutral-200 p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <FaClock className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-neutral-900">Available Times</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-neutral-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (availableSlots.length === 0 && unavailableSlots.length === 0) {
    return (
      <div className={`bg-white rounded-xl border border-neutral-200 p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <FaClock className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-neutral-900">Available Times</h3>
        </div>
        <div className="text-center py-12">
          <FaClock className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 text-lg">No time slots for this date</p>
          <p className="text-neutral-400 text-sm mt-2">Try selecting a different date</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-neutral-200 p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <FaClock className="w-5 h-5 text-primary-500" />
        <h3 className="text-lg font-semibold text-neutral-900">Available Times</h3>
        <span className="text-sm text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
          {availableSlots.length} slots
        </span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Available slots */}
        {availableSlots.map((slot, index) => {
          const duration = (new Date(`2000-01-01 ${slot.endTime}`).getTime() - new Date(`2000-01-01 ${slot.startTime}`).getTime()) / (1000 * 60 * 60);
          const price = Math.round(duration * 35); // $35/hour
          
          return (
            <button
              key={`available-${index}`}
              onClick={() => handleSlotClick(slot)}
              className={`
                p-4 rounded-xl border-2 transition-all duration-200 text-sm font-medium hover:scale-105 relative
                ${isSlotSelected(slot)
                  ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 shadow-lg'
                  : 'border-neutral-200 hover:border-primary-300 hover:bg-primary-50 text-neutral-700'
                }
              `}
            >
              <div className="text-center">
                <div className="font-semibold text-base">
                  {formatTime(slot.startTime)}
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  to {formatTime(slot.endTime)}
                </div>
                <div className="text-xs font-medium text-primary-600 mt-2">
                  ${price}/hr
                </div>
              </div>
              {isSlotSelected(slot) && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full"></div>
              )}
            </button>
          );
        })}
        
        {/* Unavailable slots */}
        {unavailableSlots.map((slot, index) => {
          const duration = (new Date(`2000-01-01 ${slot.endTime}`).getTime() - new Date(`2000-01-01 ${slot.startTime}`).getTime()) / (1000 * 60 * 60);
          const price = Math.round(duration * 35); // $35/hour
          
          return (
            <button
              key={`unavailable-${index}`}
              disabled
              className="p-4 rounded-xl border-2 border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed text-sm font-medium relative"
            >
              <div className="text-center">
                <div className="font-semibold text-base">
                  {formatTime(slot.startTime)}
                </div>
                <div className="text-xs text-neutral-400 mt-1">
                  to {formatTime(slot.endTime)}
                </div>
                <div className="text-xs font-medium text-neutral-400 mt-2">
                  ${price}/hr
                </div>
              </div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-neutral-300 rounded-full"></div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TimeSlotPicker;

