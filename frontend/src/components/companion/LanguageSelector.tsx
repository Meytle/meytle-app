/**
 * Language Selector Component
 * Allows companions to select languages they speak
 */

import { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaGlobe } from 'react-icons/fa';

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onLanguagesChange: (languages: string[]) => void;
  maxSelections?: number;
}

// Common languages
const COMMON_LANGUAGES = [
  'English',
  'Spanish',
  'Mandarin Chinese',
  'Hindi',
  'French',
  'Arabic',
  'Bengali',
  'Russian',
  'Portuguese',
  'Indonesian',
  'German',
  'Japanese',
  'Korean',
  'Italian',
  'Turkish',
  'Vietnamese',
  'Thai',
  'Urdu',
  'Polish',
  'Dutch',
  'Greek',
  'Swedish',
  'Hebrew',
  'Hungarian',
  'Czech'
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguages,
  onLanguagesChange,
  maxSelections = 5
}) => {
  const [showAllLanguages, setShowAllLanguages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Ensure English is always included
  useEffect(() => {
    if (!selectedLanguages.includes('English')) {
      onLanguagesChange(['English', ...selectedLanguages].slice(0, maxSelections));
    }
  }, []);

  const handleLanguageToggle = (language: string) => {
    // Don't allow removing English
    if (language === 'English' && selectedLanguages.includes('English')) {
      return;
    }

    if (selectedLanguages.includes(language)) {
      onLanguagesChange(selectedLanguages.filter(l => l !== language));
    } else if (selectedLanguages.length < maxSelections) {
      onLanguagesChange([...selectedLanguages, language]);
    }
  };

  const filteredLanguages = COMMON_LANGUAGES.filter(lang =>
    lang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedLanguages = showAllLanguages
    ? filteredLanguages
    : filteredLanguages.slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaGlobe className="text-[#312E81]" />
          <span className="font-medium text-gray-700">Languages Spoken</span>
        </div>
        <span className="text-sm text-gray-500">
          {selectedLanguages.length}/{maxSelections} selected
        </span>
      </div>

      {/* Selected Languages */}
      <div className="flex flex-wrap gap-2">
        {selectedLanguages.map(language => (
          <div
            key={language}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              language === 'English'
                ? 'bg-green-100 text-green-700'
                : 'bg-[#f0effe] text-[#1E1B4B]'
            }`}
          >
            <span>{language}</span>
            {language !== 'English' && (
              <button
                type="button"
                onClick={() => handleLanguageToggle(language)}
                className="ml-1 hover:text-red-600"
              >
                <FaTimes size={10} />
              </button>
            )}
            {language === 'English' && (
              <span className="text-xs text-green-600 ml-1">(Default)</span>
            )}
          </div>
        ))}
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search languages..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a5a3e8]"
        />
      </div>

      {/* Language List */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
        {displayedLanguages.map(language => {
          const isSelected = selectedLanguages.includes(language);
          const isEnglish = language === 'English';

          return (
            <button
              key={language}
              type="button"
              onClick={() => handleLanguageToggle(language)}
              disabled={isEnglish && isSelected}
              className={`p-2 text-sm rounded-lg transition-all ${
                isSelected
                  ? isEnglish
                    ? 'bg-green-100 text-green-700 border border-green-300 cursor-not-allowed'
                    : 'bg-[#f0effe] text-[#1E1B4B] border border-[#a5a3e8]'
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-[#d5d3f7]'
              } ${
                !isSelected && selectedLanguages.length >= maxSelections
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              {language}
            </button>
          );
        })}
      </div>

      {/* Show More/Less */}
      {filteredLanguages.length > 10 && (
        <button
          type="button"
          onClick={() => setShowAllLanguages(!showAllLanguages)}
          className="text-sm text-[#312E81] hover:text-[#1E1B4B] font-medium"
        >
          {showAllLanguages ? 'Show Less' : `Show ${filteredLanguages.length - 10} More Languages`}
        </button>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        English is set as default. Select up to {maxSelections} languages you can communicate in.
      </p>
    </div>
  );
};

export default LanguageSelector;