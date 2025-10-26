/**
 * FloatingProfileImages Component
 * Creates an amazing floating avatar effect with dynamic animations
 */

import { motion } from 'framer-motion';
import { useMemo, useEffect, useState } from 'react';

interface FloatingProfile {
  id: number;
  name: string;
  bgColor: string;
  size: number;
  initialX: number;
  initialY: number;
  duration: number;
  delay: number;
  rotationSpeed: number;
  floatRadius: number;
  image: string;
  hasRing: boolean;
  hasOnlineIndicator: boolean;
  hasEmojiReaction: boolean;
  emojiReaction?: string;
}

interface FloatingProfileImagesProps {
  variant?: 'hero' | 'auth' | 'sides';
  className?: string;
  opacity?: number;
  zIndex?: string;
}

const FloatingProfileImages = ({
  variant = 'hero',
  className = '',
  opacity,
  zIndex = ''
}: FloatingProfileImagesProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };

    if (variant === 'hero') {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [variant]);

  // Generate profile data based on variant
  const profiles = useMemo(() => {
    // Using diverse stock photos with consistent IDs for each person
    const baseProfiles = [
      { name: 'Sarah M', bgColor: 'FF10F0', photoId: 1 },  // Pink - keep
      { name: 'Mike L', bgColor: '8B5CF6', photoId: 8 },   // Purple-500
      { name: 'Emma K', bgColor: '9945FF', photoId: 9 },   // Purple - keep
      { name: 'David R', bgColor: 'EC4899', photoId: 12 }, // Pink-500
      { name: 'Lisa T', bgColor: 'A855F7', photoId: 20 },  // Purple-500
      { name: 'James P', bgColor: '7C3AED', photoId: 15 }, // Purple-600
      { name: 'Anna S', bgColor: 'F472B6', photoId: 25 },  // Pink-400
      { name: 'Tom W', bgColor: 'FF69B4', photoId: 18 },   // Hot Pink - keep
      { name: 'Nina R', bgColor: '818CF8', photoId: 30 },  // Indigo-400
      { name: 'Alex J', bgColor: 'C084FC', photoId: 22 },  // Purple-400
      // Additional profiles for sides variant
      { name: 'Chris B', bgColor: 'FF1493', photoId: 35 }, // Deep Pink - keep
      { name: 'Diana M', bgColor: '6366F1', photoId: 40 }, // Indigo-500
      { name: 'Ryan K', bgColor: 'E879F9', photoId: 45 },  // Pink-400
      { name: 'Sophie L', bgColor: 'BA55D3', photoId: 50 }, // Medium Orchid - keep
      { name: 'Marcus T', bgColor: '4F46E5', photoId: 55 }, // Indigo-600
    ];

    const reactions = ['❤️', '⭐', '✨', '💫', '🎉'];

    if (variant === 'hero') {
      // Larger, more prominent avatars for hero section
      return baseProfiles.map((profile, index) => ({
        ...profile,
        id: index,
        image: `https://i.pravatar.cc/150?img=${profile.photoId}`,
        size: 80 + Math.random() * 40, // 80-120px
        initialX: 10 + Math.random() * 80, // Keep within 10-90% of viewport
        initialY: 10 + Math.random() * 50, // Keep within 10-60% of viewport (further reduced to avoid footer)
        duration: 20 + Math.random() * 15, // 20-35s
        delay: index * 0.3,
        rotationSpeed: 15 + Math.random() * 20,
        floatRadius: 30 + Math.random() * 30, // Increased from 15-40 to 30-60 for more movement
        hasRing: Math.random() > 0.5,
        hasOnlineIndicator: Math.random() > 0.3,
        hasEmojiReaction: Math.random() > 0.5,
        emojiReaction: reactions[Math.floor(Math.random() * reactions.length)],
      }));
    } else if (variant === 'sides') {
      // Side-positioned avatars for homepage with vertical bounce
      const allProfiles = baseProfiles.slice(0, 15); // Use all 15 profiles
      return allProfiles.map((profile, index) => {
        const isLeftSide = index < 8; // First 8 on left, rest on right
        const sideIndex = isLeftSide ? index : index - 8; // Position index for each side

        return {
          ...profile,
          id: index,
          image: `https://i.pravatar.cc/150?img=${profile.photoId}`,
          size: 60 + Math.random() * 20, // 60-80px
          initialX: isLeftSide
            ? 2 + Math.random() * 3  // 2-5% for left side
            : 95 + Math.random() * 3, // 95-98% for right side
          initialY: 10 + (sideIndex * 12), // Distribute vertically (10%, 22%, 34%, etc.)
          duration: 3 + Math.random() * 2, // 3-5s for vertical bounce
          delay: Math.random() * 2, // Random start delay for natural movement
          rotationSpeed: 5 + Math.random() * 10, // Slower rotation
          floatRadius: 20 + Math.random() * 20, // Vertical bounce height
          hasRing: Math.random() > 0.5,
          hasOnlineIndicator: Math.random() > 0.4,
          hasEmojiReaction: Math.random() > 0.6,
          emojiReaction: reactions[Math.floor(Math.random() * reactions.length)],
        };
      });
    } else {
      // Smaller avatars for auth pages
      return baseProfiles.slice(0, 7).map((profile, index) => ({
        ...profile,
        id: index,
        image: `https://i.pravatar.cc/150?img=${profile.photoId}`,
        size: 50 + Math.random() * 30, // 50-80px
        initialX: 10 + Math.random() * 80,
        initialY: 10 + Math.random() * 70,
        duration: 25 + Math.random() * 15, // 25-40s
        delay: index * 0.5,
        rotationSpeed: 10 + Math.random() * 15,
        floatRadius: 10 + Math.random() * 20,
        hasRing: Math.random() > 0.6,
        hasOnlineIndicator: false,
        hasEmojiReaction: false,
        emojiReaction: undefined,
      }));
    }
  }, [variant]);

  // Create natural floating path using sine/cosine or simple bounce for sides
  const createFloatingPath = (profile: FloatingProfile) => {
    const centerX = profile.initialX;
    const centerY = profile.initialY;
    const radius = profile.floatRadius;

    // Simple vertical bounce for sides variant
    if (variant === 'sides') {
      return {
        x: [centerX, centerX, centerX, centerX, centerX], // No horizontal movement
        y: [
          centerY,
          centerY - radius, // Move up
          centerY,          // Back to center
          centerY + radius, // Move down
          centerY           // Back to center
        ],
      };
    }

    // Create a figure-8 or circular path for other variants
    return {
      x: Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return centerX + Math.sin(angle) * radius;
      }),
      y: Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return centerY + Math.cos(angle * 2) * radius * 0.6;
      }),
    };
  };

  return (
    <div className={`fixed inset-x-0 top-16 bottom-32 overflow-hidden pointer-events-none ${zIndex} ${className}`}>
      {profiles.map((profile) => {
        const path = createFloatingPath(profile);
        const isStockPhoto = profile.image.startsWith('http'); // Check if it's a URL

        return (
          <motion.div
            key={profile.id}
            className="absolute"
            style={{
              width: profile.size,
              height: profile.size,
              left: `${profile.initialX}%`,
              top: `${profile.initialY}%`,
              transform: 'translate(-50%, -50%)', // Center the avatar on its position
            }}
            initial={{
              scale: 0,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: opacity !== undefined ? opacity : (variant === 'hero' ? 0.9 : 0.5),
            }}
            transition={{
              duration: 1.5,
              delay: profile.delay,
              ease: "easeOut",
            }}
          >
            <motion.div
              className="relative w-full h-full"
              animate={{
                x: path.x.map(x => x - profile.initialX),
                y: path.y.map(y => y - profile.initialY),
              }}
              transition={{
                duration: profile.duration,
                repeat: Infinity,
                ease: variant === 'sides' ? "easeInOut" : "linear",
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Enhanced glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, #${profile.bgColor}44 0%, #${profile.bgColor}22 40%, transparent 70%)`,
                  filter: 'blur(20px)',
                  transform: 'scale(1.5)',
                }}
                animate={{
                  scale: [1.5, 2, 1.5],
                  opacity: [0.6, 0.9, 0.6],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: profile.delay,
                  ease: "easeInOut",
                }}
              />

              {/* Glass morphism container */}
              <motion.div
                className="relative w-full h-full rounded-full overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, #${profile.bgColor}DD 0%, #${profile.bgColor}99 100%)`,
                  backdropFilter: 'blur(10px)',
                  filter: 'blur(3px)', // Add subtle blur to the entire profile image
                  boxShadow: `
                    0 0 30px rgba(${parseInt(profile.bgColor.slice(0, 2), 16)}, ${parseInt(profile.bgColor.slice(2, 4), 16)}, ${parseInt(profile.bgColor.slice(4, 6), 16)}, 0.5),
                    inset 0 0 20px rgba(255, 255, 255, 0.2)
                  `,
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: profile.rotationSpeed,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                {/* Avatar with stock photo or fallback */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {isStockPhoto ? (
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="w-full h-full rounded-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback to UI Avatars if stock photo fails to load
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=${profile.bgColor}&color=fff&size=${Math.round(profile.size * 2)}&bold=true&font-size=0.4`;
                      }}
                    />
                  ) : (
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=${profile.bgColor}&color=fff&size=${Math.round(profile.size * 2)}&bold=true&font-size=0.4`}
                      alt={profile.name}
                      className="w-full h-full rounded-full"
                    />
                  )}
                </div>

                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.5) 50%, transparent 60%)',
                  }}
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 3,
                    delay: profile.delay + 2,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>

              {/* Animated rings */}
              {profile.hasRing && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2"
                    style={{
                      borderColor: `#${profile.bgColor}`,
                    }}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.8, 0, 0.8],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: profile.delay,
                      ease: "easeOut",
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border"
                    style={{
                      borderColor: `#${profile.bgColor}`,
                    }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.6, 0, 0.6],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: profile.delay + 0.5,
                      ease: "easeOut",
                    }}
                  />
                </>
              )}

              {/* Online indicator */}
              {profile.hasOnlineIndicator && (
                <motion.div
                  className="absolute bottom-0 right-0"
                  style={{
                    width: profile.size * 0.25,
                    height: profile.size * 0.25,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: profile.delay,
                  }}
                >
                  <span className="relative flex h-full w-full">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-full w-full bg-green-400 border-2 border-white shadow-lg" />
                  </span>
                </motion.div>
              )}

              {/* Floating emoji reactions */}
              {profile.hasEmojiReaction && profile.emojiReaction && (
                <motion.div
                  className="absolute -top-4 -right-4 text-2xl"
                  animate={{
                    y: [-10, -20, -10],
                    rotate: [-15, 15, -15],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: profile.delay + 1,
                    ease: "easeInOut",
                  }}
                >
                  {profile.emojiReaction}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        );
      })}

      {/* Additional atmospheric effects */}
      {variant === 'hero' && (
        <>
          {/* Sparkles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute text-2xl"
              style={{
                left: `${20 + i * 15}%`,
                top: `${15 + i * 12}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.8,
                repeatDelay: 3 + i,
              }}
            >
              ✨
            </motion.div>
          ))}

          {/* Gradient orbs for depth */}
          <motion.div
            className="absolute top-[10%] left-[5%] w-48 h-48 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,16,240,0.1) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
            animate={{
              x: [-30, 30, -30],
              y: [-40, 40, -40],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      )}
    </div>
  );
};

export default FloatingProfileImages;