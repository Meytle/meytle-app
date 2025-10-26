/**
 * PhoneNumberInput Component
 * A phone number input field with country code selector
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { countryPhoneCodes, getDefaultCountry, validatePhoneNumber, getFullPhoneNumber, type CountryPhoneCode } from '../../data/countryPhoneCodes';

interface PhoneNumberInputProps {
  value: string;
  onChange: (fullPhoneNumber: string, countryCode: string, phoneNumber: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value = '',
  onChange,
  required = false,
  placeholder = 'Phone number',
  className = '',
  label,
  error,
  disabled = false
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryPhoneCode>(getDefaultCountry());
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Parse initial value if it contains a country code
  useEffect(() => {
    if (value) {
      // Check if value starts with a country code
      const matchingCountry = countryPhoneCodes.find(country =>
        value.startsWith(country.dialCode)
      );

      if (matchingCountry) {
        setSelectedCountry(matchingCountry);
        setPhoneNumber(value.substring(matchingCountry.dialCode.length));
      } else {
        // Assume it's just a phone number without country code
        setPhoneNumber(value);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  const handleCountrySelect = (country: CountryPhoneCode) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchTerm('');

    // Notify parent with updated values
    const fullNumber = getFullPhoneNumber(country.dialCode, phoneNumber);
    onChange(fullNumber, country.code, phoneNumber);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value;

    // Allow only numbers, spaces, hyphens, and parentheses
    if (!/^[\d\s\-()]*$/.test(newNumber)) {
      return;
    }

    setPhoneNumber(newNumber);

    // Validate and notify parent
    if (validatePhoneNumber(newNumber, selectedCountry.code)) {
      const fullNumber = getFullPhoneNumber(selectedCountry.dialCode, newNumber);
      onChange(fullNumber, selectedCountry.code, newNumber);
    } else {
      onChange('', selectedCountry.code, newNumber);
    }
  };

  const filteredCountries = countryPhoneCodes.filter(country => {
    const search = searchTerm.toLowerCase();
    return (
      country.name.toLowerCase().includes(search) ||
      country.dialCode.includes(search) ||
      country.code.toLowerCase().includes(search)
    );
  });

  const isValid = phoneNumber && validatePhoneNumber(phoneNumber, selectedCountry.code);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="flex">
        {/* Country Code Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled}
            className={`
              flex items-center gap-2 px-3 py-2.5
              border border-r-0 border-gray-300 rounded-l-lg
              bg-gray-50 hover:bg-gray-100
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-0
              transition-colors duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="text-xl">{selectedCountry.flag}</span>
            <span className="font-medium text-gray-700">{selectedCountry.dialCode}</span>
            <ChevronDownIcon className="w-4 h-4 text-gray-500" />
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute z-50 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
              {/* Search Input */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search country..."
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Country List */}
              <div className="overflow-y-auto max-h-80">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map(country => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2
                        hover:bg-purple-50 transition-colors duration-150
                        ${selectedCountry.code === country.code ? 'bg-purple-100' : ''}
                      `}
                    >
                      <span className="text-xl">{country.flag}</span>
                      <span className="flex-1 text-left">
                        <span className="font-medium text-gray-900">{country.name}</span>
                        <span className="text-gray-500 ml-2">({country.code})</span>
                      </span>
                      <span className="text-gray-600 font-mono">{country.dialCode}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No countries found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          className={`
            flex-1 px-4 py-2.5
            border border-gray-300 rounded-r-lg
            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-0
            transition-all duration-200
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${error && !isValid ? 'border-red-500' : ''}
          `}
        />
      </div>

      {/* Error Message */}
      {error && !isValid && phoneNumber && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Helper Text */}
      {phoneNumber && !isValid && (
        <p className="mt-1 text-sm text-amber-600">
          Please enter a valid phone number for {selectedCountry.name}
        </p>
      )}

      {/* Display Full Number (for debugging, can be removed) */}
      {isValid && (
        <p className="mt-1 text-xs text-gray-500">
          Full number: {getFullPhoneNumber(selectedCountry.dialCode, phoneNumber)}
        </p>
      )}
    </div>
  );
};

export default PhoneNumberInput;