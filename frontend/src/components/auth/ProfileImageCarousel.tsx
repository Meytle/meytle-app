import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ProfileImageCarouselProps {
  variant?: 'signin' | 'signup';
  className?: string;
}

const ProfileImageCarousel: React.FC<ProfileImageCarouselProps> = ({ className = '' }) => {
  // Array of beautiful female portrait URLs
  // Using specific portrait services for better quality female portraits
  const profileImages = [
    'https://randomuser.me/api/portraits/women/1.jpg',
    'https://randomuser.me/api/portraits/women/2.jpg',
    'https://randomuser.me/api/portraits/women/3.jpg',
    'https://randomuser.me/api/portraits/women/4.jpg',
    'https://randomuser.me/api/portraits/women/5.jpg',
    'https://randomuser.me/api/portraits/women/6.jpg',
    'https://randomuser.me/api/portraits/women/7.jpg',
    'https://randomuser.me/api/portraits/women/8.jpg',
    'https://randomuser.me/api/portraits/women/9.jpg',
    'https://randomuser.me/api/portraits/women/10.jpg',
    'https://randomuser.me/api/portraits/women/11.jpg',
    'https://randomuser.me/api/portraits/women/12.jpg',
    'https://randomuser.me/api/portraits/women/13.jpg',
    'https://randomuser.me/api/portraits/women/14.jpg',
    'https://randomuser.me/api/portraits/women/15.jpg',
    'https://randomuser.me/api/portraits/women/17.jpg',
    'https://randomuser.me/api/portraits/women/18.jpg',
    'https://randomuser.me/api/portraits/women/19.jpg',
    'https://randomuser.me/api/portraits/women/20.jpg',
    'https://randomuser.me/api/portraits/women/21.jpg',
    'https://randomuser.me/api/portraits/women/22.jpg',
    'https://randomuser.me/api/portraits/women/23.jpg',
    'https://randomuser.me/api/portraits/women/24.jpg',
    'https://randomuser.me/api/portraits/women/25.jpg',
    'https://randomuser.me/api/portraits/women/26.jpg',
    'https://randomuser.me/api/portraits/women/27.jpg',
    'https://randomuser.me/api/portraits/women/28.jpg',
    'https://randomuser.me/api/portraits/women/29.jpg',
    'https://randomuser.me/api/portraits/women/30.jpg',
    'https://randomuser.me/api/portraits/women/31.jpg',
    'https://randomuser.me/api/portraits/women/32.jpg',
    'https://randomuser.me/api/portraits/women/33.jpg',
    'https://randomuser.me/api/portraits/women/34.jpg',
    'https://randomuser.me/api/portraits/women/35.jpg',
    'https://randomuser.me/api/portraits/women/36.jpg',
    'https://randomuser.me/api/portraits/women/37.jpg',
    'https://randomuser.me/api/portraits/women/38.jpg',
    'https://randomuser.me/api/portraits/women/39.jpg',
    'https://randomuser.me/api/portraits/women/40.jpg',
    'https://randomuser.me/api/portraits/women/41.jpg',
    'https://randomuser.me/api/portraits/women/42.jpg',
    'https://randomuser.me/api/portraits/women/43.jpg',
    'https://randomuser.me/api/portraits/women/44.jpg',
    'https://randomuser.me/api/portraits/women/45.jpg',
    'https://randomuser.me/api/portraits/women/46.jpg',
    'https://randomuser.me/api/portraits/women/47.jpg',
    'https://randomuser.me/api/portraits/women/48.jpg',
    'https://randomuser.me/api/portraits/women/49.jpg',
    'https://randomuser.me/api/portraits/women/50.jpg',
    'https://randomuser.me/api/portraits/women/51.jpg',
    'https://randomuser.me/api/portraits/women/52.jpg',
    'https://randomuser.me/api/portraits/women/53.jpg',
    'https://randomuser.me/api/portraits/women/54.jpg',
    'https://randomuser.me/api/portraits/women/55.jpg',
    'https://randomuser.me/api/portraits/women/56.jpg',
    'https://randomuser.me/api/portraits/women/57.jpg',
    'https://randomuser.me/api/portraits/women/58.jpg',
    'https://randomuser.me/api/portraits/women/59.jpg',
    'https://randomuser.me/api/portraits/women/60.jpg',
    'https://randomuser.me/api/portraits/women/61.jpg',
    'https://randomuser.me/api/portraits/women/62.jpg',
    'https://randomuser.me/api/portraits/women/63.jpg',
    'https://randomuser.me/api/portraits/women/64.jpg',
    'https://randomuser.me/api/portraits/women/65.jpg',
    'https://randomuser.me/api/portraits/women/66.jpg',
    'https://randomuser.me/api/portraits/women/67.jpg',
    'https://randomuser.me/api/portraits/women/68.jpg',
    'https://randomuser.me/api/portraits/women/69.jpg',
    'https://randomuser.me/api/portraits/women/70.jpg',
    'https://randomuser.me/api/portraits/women/71.jpg',
    'https://randomuser.me/api/portraits/women/72.jpg',
    'https://randomuser.me/api/portraits/women/73.jpg',
    'https://randomuser.me/api/portraits/women/74.jpg',
    'https://randomuser.me/api/portraits/women/75.jpg',
    'https://randomuser.me/api/portraits/women/76.jpg',
    'https://randomuser.me/api/portraits/women/77.jpg',
    'https://randomuser.me/api/portraits/women/78.jpg',
    'https://randomuser.me/api/portraits/women/79.jpg',
    'https://randomuser.me/api/portraits/women/80.jpg',
    'https://randomuser.me/api/portraits/women/81.jpg',
    'https://randomuser.me/api/portraits/women/82.jpg',
    'https://randomuser.me/api/portraits/women/83.jpg',
    'https://randomuser.me/api/portraits/women/84.jpg',
    'https://randomuser.me/api/portraits/women/85.jpg',
    'https://randomuser.me/api/portraits/women/86.jpg',
    'https://randomuser.me/api/portraits/women/87.jpg',
    'https://randomuser.me/api/portraits/women/88.jpg',
    'https://randomuser.me/api/portraits/women/89.jpg',
    'https://randomuser.me/api/portraits/women/90.jpg',
    'https://randomuser.me/api/portraits/women/91.jpg',
    'https://randomuser.me/api/portraits/women/92.jpg',
    'https://randomuser.me/api/portraits/women/93.jpg',
    'https://randomuser.me/api/portraits/women/94.jpg',
    'https://randomuser.me/api/portraits/women/95.jpg'
  ];

  // Get a random image on component mount
  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * profileImages.length);
    return profileImages[randomIndex];
  };

  // Initialize with a single random image that won't change until page reload
  const [currentImage] = useState(getRandomImage());

  return (
    <div className={`flex justify-center items-center mb-8 ${className}`}>
      {/* Single Profile Picture - Increased Size */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-[#312E81]/10 shadow-xl">
          <motion.img
            src={currentImage}
            alt="Profile"
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onError={(e) => {
              // Fallback to a different random image if current one fails
              const target = e.target as HTMLImageElement;
              const fallbackIndex = Math.floor(Math.random() * profileImages.length);
              target.src = profileImages[fallbackIndex];
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileImageCarousel;