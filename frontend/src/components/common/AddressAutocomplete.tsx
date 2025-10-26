/**
 * Address Autocomplete Component
 * Provides Google Places autocomplete for address input
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  useLoadScript,
  Autocomplete,
  type LoadScriptProps
} from '@react-google-maps/api';
import { FaMapMarkerAlt, FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

// Google Maps libraries to load
const libraries: LoadScriptProps['libraries'] = ['places'];

interface AddressAutocompleteProps {
  value?: string;
  onChange: (address: string, placeDetails?: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  onBlur?: () => void;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value = '',
  onChange,
  placeholder = 'Enter a location...',
  required = false,
  className = '',
  label,
  error,
  disabled = false,
  onBlur
}) => {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value);
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);

    // Configure autocomplete options
    autocompleteInstance.setOptions({
      types: ['geocode', 'establishment'], // Allow both addresses and places
      fields: ['address_components', 'formatted_address', 'geometry', 'place_id', 'name'],
    });
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();

      if (place.formatted_address) {
        setInputValue(place.formatted_address);
        setIsValidAddress(true);
        onChange(place.formatted_address, place);
      } else if (place.name) {
        setInputValue(place.name);
        setIsValidAddress(true);
        onChange(place.name, place);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsValidAddress(false); // Reset validation when user types

    // Only call onChange for manual clearing
    if (newValue === '') {
      onChange('');
    }
  };

  const handleBlur = () => {
    // If user typed something but didn't select from dropdown, mark as invalid
    if (inputValue && !isValidAddress) {
      setIsValidAddress(false);
    }
    if (onBlur) {
      onBlur();
    }
  };

  // Handle loading and error states
  if (loadError) {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              onChange(e.target.value);
            }}
            placeholder={placeholder}
            disabled={disabled}
            onBlur={handleBlur}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
        <p className="text-xs text-amber-600 mt-1">
          Google Maps could not be loaded. You can still enter an address manually.
        </p>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            type="text"
            disabled
            placeholder="Loading address search..."
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-gray-50"
          />
          <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-500 w-4 h-4 animate-spin" />
        </div>
      </div>
    );
  }

  // Check if API key is configured
  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              onChange(e.target.value);
            }}
            placeholder={placeholder}
            disabled={disabled}
            onBlur={handleBlur}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
        <p className="text-xs text-amber-600 mt-1">
          Google Maps API key not configured. Using standard address input.
        </p>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={onPlaceChanged}
      >
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              error ? 'border-red-500' : isValidAddress ? 'border-green-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />

          {/* Validation indicator */}
          {inputValue && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isValidating ? (
                <FaSpinner className="w-4 h-4 text-gray-400 animate-spin" />
              ) : isValidAddress ? (
                <FaCheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <FaExclamationCircle className="w-4 h-4 text-amber-500" />
              )}
            </div>
          )}
        </div>
      </Autocomplete>

      {/* Helper text */}
      {inputValue && !isValidAddress && (
        <p className="text-xs text-amber-600 mt-1">
          Please select an address from the dropdown suggestions
        </p>
      )}

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default AddressAutocomplete;