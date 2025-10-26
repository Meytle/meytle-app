/**
 * Services Selector Component
 * Allows companions to select services they offer
 */

import { useState } from 'react';
import { FaPlus, FaTimes, FaCheck } from 'react-icons/fa';

interface ServicesSelectorProps {
  selectedServices: string[];
  onServicesChange: (services: string[]) => void;
  maxSelections?: number;
}

// Predefined services
const PREDEFINED_SERVICES = [
  'Coffee Date',
  'Dinner Companion',
  'Movie Night',
  'Shopping Companion',
  'Museum Visit',
  'Concert/Event',
  'Walking/Hiking',
  'Beach Day',
  'Art Gallery',
  'Wine Tasting',
  'Cooking Together',
  'Game Night',
  'City Tour',
  'Sports Event',
  'Theater/Play',
  'Dance Partner',
  'Study Buddy',
  'Gym Partner',
  'Travel Companion',
  'Business Event'
];

const ServicesSelector: React.FC<ServicesSelectorProps> = ({
  selectedServices,
  onServicesChange,
  maxSelections = 10
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customService, setCustomService] = useState('');

  const handleServiceToggle = (service: string) => {
    if (selectedServices.includes(service)) {
      onServicesChange(selectedServices.filter(s => s !== service));
    } else if (selectedServices.length < maxSelections) {
      onServicesChange([...selectedServices, service]);
    }
  };

  const handleAddCustomService = () => {
    if (customService.trim() && selectedServices.length < maxSelections) {
      if (!selectedServices.includes(customService.trim())) {
        onServicesChange([...selectedServices, customService.trim()]);
        setCustomService('');
        setShowCustomInput(false);
      }
    }
  };

  const isCustomService = (service: string) => {
    return !PREDEFINED_SERVICES.includes(service);
  };

  return (
    <div className="space-y-4">
      {/* Selected Services Count */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>Select services you offer</span>
        <span className={selectedServices.length >= maxSelections ? 'text-red-500' : ''}>
          {selectedServices.length}/{maxSelections} selected
        </span>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {PREDEFINED_SERVICES.map(service => (
          <button
            key={service}
            type="button"
            onClick={() => handleServiceToggle(service)}
            className={`p-3 rounded-lg text-sm font-medium transition-all ${
              selectedServices.includes(service)
                ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-purple-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{service}</span>
              {selectedServices.includes(service) && (
                <FaCheck className="text-purple-600 ml-2" size={12} />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Custom Services */}
      <div className="space-y-2">
        {/* Display custom services */}
        {selectedServices
          .filter(service => isCustomService(service))
          .map(service => (
            <div
              key={service}
              className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
            >
              <span className="text-sm font-medium text-purple-700">
                {service} <span className="text-xs text-purple-500">(Custom)</span>
              </span>
              <button
                type="button"
                onClick={() => handleServiceToggle(service)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTimes size={14} />
              </button>
            </div>
          ))}

        {/* Add Custom Service */}
        {showCustomInput ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={customService}
              onChange={(e) => setCustomService(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomService()}
              placeholder="Enter custom service..."
              className="flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
              maxLength={50}
            />
            <button
              type="button"
              onClick={handleAddCustomService}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCustomInput(false);
                setCustomService('');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowCustomInput(true)}
            disabled={selectedServices.length >= maxSelections}
            className={`w-full p-3 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 transition-colors ${
              selectedServices.length >= maxSelections
                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                : 'border-purple-300 text-purple-600 hover:border-purple-400 hover:bg-purple-50'
            }`}
          >
            <FaPlus size={14} />
            <span className="font-medium">Add Custom Service</span>
          </button>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        Select the services you're comfortable providing. You can also add custom services not listed above.
      </p>
    </div>
  );
};

export default ServicesSelector;