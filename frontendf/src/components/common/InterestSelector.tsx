import React, { useState, useMemo } from 'react';
import Button from './Button';
import Card from './Card';
import Badge from './Badge';
import { 
  FaCoffee, 
  FaUtensils, 
  FaFilm, 
  FaFootballBall, 
  FaPalette, 
  FaMusic, 
  FaPlane, 
  FaShoppingBag, 
  FaMountain, 
  FaGamepad, 
  FaUmbrellaBeach, 
  FaGlassCheers 
} from 'react-icons/fa';

interface InterestSelectorProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  maxSelections?: number;
  className?: string;
}

const INTERESTS = [
  { name: 'Coffee', icon: FaCoffee },
  { name: 'Dinner', icon: FaUtensils },
  { name: 'Movies', icon: FaFilm },
  { name: 'Sports', icon: FaFootballBall },
  { name: 'Art', icon: FaPalette },
  { name: 'Music', icon: FaMusic },
  { name: 'Travel', icon: FaPlane },
  { name: 'Shopping', icon: FaShoppingBag },
  { name: 'Hiking', icon: FaMountain },
  { name: 'Gaming', icon: FaGamepad },
  { name: 'Beach', icon: FaUmbrellaBeach },
  { name: 'Nightlife', icon: FaGlassCheers },
];

const InterestSelector: React.FC<InterestSelectorProps> = ({
  selectedInterests,
  onInterestsChange,
  maxSelections = 10,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInterests = useMemo(() => {
    return INTERESTS.filter(interest =>
      interest.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleInterestToggle = (interestName: string) => {
    if (selectedInterests.includes(interestName)) {
      onInterestsChange(selectedInterests.filter(i => i !== interestName));
    } else if (selectedInterests.length < maxSelections) {
      onInterestsChange([...selectedInterests, interestName]);
    }
  };

  const canSelectMore = selectedInterests.length < maxSelections;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search interests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Selected interests count */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-600">
          {selectedInterests.length} of {maxSelections} selected
        </span>
        {!canSelectMore && (
          <Badge variant="warning" size="sm">
            Maximum reached
          </Badge>
        )}
      </div>

      {/* Selected interests */}
      {selectedInterests.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-neutral-700 mb-2">Selected:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedInterests.map((interest) => {
              const interestData = INTERESTS.find(i => i.name === interest);
              const Icon = interestData?.icon;
              return (
                <Badge
                  key={interest}
                  variant="info"
                  size="sm"
                  className="cursor-pointer hover:bg-accent-200"
                  onClick={() => handleInterestToggle(interest)}
                >
                  {Icon && <Icon className="w-3 h-3 mr-1" />}
                  {interest}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Interest grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filteredInterests.map((interest) => {
          const isSelected = selectedInterests.includes(interest.name);
          const Icon = interest.icon;
          const isDisabled = !isSelected && !canSelectMore;

          return (
            <button
              key={interest.name}
              onClick={() => handleInterestToggle(interest.name)}
              disabled={isDisabled}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200 text-center
                ${isSelected 
                  ? 'border-primary-500 bg-primary-50 text-primary-700' 
                  : isDisabled
                  ? 'border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed'
                  : 'border-neutral-200 hover:border-primary-300 hover:bg-primary-50'
                }
              `}
            >
              <Icon className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">{interest.name}</span>
            </button>
          );
        })}
      </div>

      {/* No results */}
      {filteredInterests.length === 0 && (
        <div className="text-center py-8 text-neutral-500">
          <p>No interests found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default InterestSelector;

