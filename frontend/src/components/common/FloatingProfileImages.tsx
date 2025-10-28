/**
 * FloatingProfileImages Component
 * Enhanced with beautiful visual effects and optimized performance
 */

import { motion } from 'framer-motion';
import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';

interface FloatingProfile {
  id: number;
  name: string;
  bgColor: string;
  gradientColors: string[];
  size: number;
  initialX: number;
  initialY: number;
  duration: number;
  delay: number;
  orbitRadius: number;
  hasGlow: boolean;
  hasBreathing: boolean;
  rotationSpeed: number;
}

interface FloatingProfileImagesProps {
  variant?: 'hero' | 'auth' | 'sides';
  className?: string;
  opacity?: number;
  zIndex?: string;
}

// Adaptive profile configuration based on device and variant
const getProfileConfig = (variant?: string) => {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return { count: 6, complexity: 'simple', imageSize: 150 };
  }

  const width = window.innerWidth;
  const isRetina = window.devicePixelRatio > 1;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return { count: 0, complexity: 'none', imageSize: 150 };
  }

  // Auth pages get fewer, subtler profiles
  if (variant === 'auth') {
    if (width >= 1024) {
      return { count: 3, complexity: 'high', imageSize: 120 };
    } else if (width >= 768) {
      return { count: 2, complexity: 'medium', imageSize: 100 };
    } else {
      return { count: 2, complexity: 'simple', imageSize: 80 };
    }
  }

  // Regular pages get more dynamic profiles
  if (width >= 1024) {
    return { count: 5, complexity: 'high', imageSize: 150 };
  } else if (width >= 768) {
    return { count: 4, complexity: 'medium', imageSize: 150 };
  } else {
    return { count: 3, complexity: 'simple', imageSize: 150 };
  }
};

// Extract initials from name
const getInitials = (name: string): string => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

// Generate SVG fallback as data URI
const generateFallbackSVG = (name: string, bgColor: string): string => {
  const initials = getInitials(name);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
      <circle cx="75" cy="75" r="75" fill="#${bgColor}"/>
      <text x="75" y="75" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">
        ${initials}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Profile Avatar Component with loading and error handling
const ProfileAvatar: React.FC<{
  profile: FloatingProfile;
  variant?: string;
}> = ({ profile, variant }) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  // Use random person photos from randomuser.me
  const [imageSrc, setImageSrc] = useState<string>(() =>
    `https://randomuser.me/api/portraits/${profile.id % 2 === 0 ? 'men' : 'women'}/${profile.id % 50}.jpg`
  );

  const handleImageLoad = useCallback(() => {
    setImageState('loaded');
  }, []);

  const handleImageError = useCallback(() => {
    setImageState('error');
    // Use a different random person photo as fallback
    const fallbackSrc = `https://randomuser.me/api/portraits/${profile.id % 2 === 0 ? 'women' : 'men'}/${(profile.id + 10) % 50}.jpg`;
    setImageSrc(fallbackSrc);
  }, [profile.id]);


  return (
    <div className="absolute inset-1 rounded-full overflow-hidden bg-white/10">
      {/* Main image - show immediately when imageSrc is available */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={profile.name}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            imageState === 'loaded' ? 'opacity-100' : imageState === 'error' ? 'opacity-90' : 'opacity-70'
          }`}
          loading="lazy"
          decoding="async"
          fetchPriority={variant === 'auth' ? "auto" : "high"}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {/* Show initials overlay only when image fails */}
      {imageState === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="text-white text-2xl font-bold">
            {getInitials(profile.name)}
          </div>
        </div>
      )}

      {/* Shimmer effect overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.4) 50%, transparent 60%)',
        }}
        animate={{
          x: ['-200%', '200%'],
        }}
        transition={{
          duration: variant === 'auth' ? 4 : 3,
          repeat: Infinity,
          repeatDelay: variant === 'auth' ? 5 : 3,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

const FloatingProfileImages = React.memo(({
  variant = 'hero',
  className = '',
  opacity,
  zIndex = ''
}: FloatingProfileImagesProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [profileConfig, setProfileConfig] = useState(getProfileConfig(variant));
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Update profile config on resize
  useEffect(() => {
    const handleResize = () => {
      setProfileConfig(getProfileConfig(variant));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [variant]);

  // Don't render if animations are disabled
  if (profileConfig.count === 0) {
    return null;
  }

  // Use Intersection Observer for visibility control
  useEffect(() => {
    // For auth variant, always show immediately (subtle background)
    if (variant === 'auth') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '100px' // Start animations 100px before visible
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
      observer.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [variant]);

  // Enhanced profiles with gradient colors and visual effects
  const profiles = useMemo(() => {
    const baseProfiles = [
      { name: 'Sarah M', bgColor: 'FF10F0', gradientColors: ['FF10F0', 'FF69B4', 'FF1493'] },
      { name: 'Mike L', bgColor: '8B5CF6', gradientColors: ['8B5CF6', 'A78BFA', '7C3AED'] },
      { name: 'Emma K', bgColor: '9945FF', gradientColors: ['9945FF', 'B794F4', 'A855F7'] },
      { name: 'David R', bgColor: 'EC4899', gradientColors: ['EC4899', 'F472B6', 'DB2777'] },
      { name: 'Lisa T', bgColor: 'A855F7', gradientColors: ['A855F7', 'C084FC', '9333EA'] },
      { name: 'James P', bgColor: '7C3AED', gradientColors: ['7C3AED', '8B5CF6', '6D28D9'] },
      { name: 'Anna S', bgColor: 'F472B6', gradientColors: ['F472B6', 'EC4899', 'F9A8D4'] },
      { name: 'Tom W', bgColor: 'FF69B4', gradientColors: ['FF69B4', 'FF10F0', 'FF1493'] },
      { name: 'Nina R', bgColor: '818CF8', gradientColors: ['818CF8', '6366F1', '4F46E5'] },
      { name: 'Alex J', bgColor: 'C084FC', gradientColors: ['C084FC', 'A855F7', 'D8B4FE'] }
    ];

    // Adaptive profile count based on device
    const profileCount = profileConfig.count;
    const selectedProfiles = baseProfiles.slice(0, profileCount);
    const { complexity } = profileConfig;

    return selectedProfiles.map((profile, index) => {
      // Create better random distribution across viewport
      const zones = [
        { x: 15, y: 20 },  // Top left
        { x: 85, y: 25 },  // Top right
        { x: 20, y: 70 },  // Bottom left
        { x: 80, y: 65 },  // Bottom right
        { x: 50, y: 40 },  // Center
      ];

      const zone = zones[index % zones.length];
      const randomOffsetX = (Math.random() - 0.5) * 15;
      const randomOffsetY = (Math.random() - 0.5) * 15;

      // Variant-specific delays
      const getDelay = () => {
        if (variant === 'auth') {
          return index * 0.3; // Slower, subtle appearance for auth pages
        }
        return index * 0.8; // One by one appearance with 0.8s between each
      };

      return {
        ...profile,
        id: index,
        size: complexity === 'simple' ? 60 : complexity === 'medium' ? 70 : 85,
        initialX: zone.x + randomOffsetX,
        initialY: zone.y + randomOffsetY,
        duration: complexity === 'simple' ? 45 : complexity === 'medium' ? 40 : 35,
        delay: getDelay(),
        orbitRadius: complexity === 'simple' ? 30 : complexity === 'medium' ? 45 : 60,
        hasGlow: complexity !== 'simple' && Math.random() > 0.4,
        hasBreathing: complexity === 'high' || (complexity === 'medium' && Math.random() > 0.6),
        rotationSpeed: complexity === 'simple' ? 60 : complexity === 'medium' ? 50 : 40,
      };
    });
  }, [variant, profileConfig]);

  // Create varied animation patterns for more natural movement
  const getAnimationPath = (profile: FloatingProfile) => {
    const { complexity } = profileConfig;
    const patterns = ['float', 'orbit', 'figure8', 'diagonal'];
    const pattern = patterns[profile.id % patterns.length];

    if (complexity === 'simple') {
      // Gentle floating for mobile
      return {
        x: [0, 10, 0, -10, 0],
        y: [-profile.orbitRadius * 0.7, profile.orbitRadius * 0.7, -profile.orbitRadius * 0.7],
      };
    }

    switch (pattern) {
      case 'float':
        // Gentle floating up and down with slight horizontal drift
        return {
          x: [0, profile.orbitRadius * 0.3, profile.orbitRadius * 0.2, -profile.orbitRadius * 0.2, 0],
          y: [-profile.orbitRadius, -profile.orbitRadius * 0.5, profile.orbitRadius * 0.8, profile.orbitRadius * 0.3, -profile.orbitRadius],
        };

      case 'orbit':
        // Smooth circular orbit
        const orbitSteps = 12;
        const orbitX = Array.from({ length: orbitSteps }, (_, i) =>
          Math.sin((i / orbitSteps) * Math.PI * 2) * profile.orbitRadius
        );
        const orbitY = Array.from({ length: orbitSteps }, (_, i) =>
          Math.cos((i / orbitSteps) * Math.PI * 2) * profile.orbitRadius * 0.7
        );
        return { x: orbitX, y: orbitY };

      case 'figure8':
        // Elegant figure-8 pattern
        return {
          x: [0, profile.orbitRadius, profile.orbitRadius * 0.5, -profile.orbitRadius * 0.5, -profile.orbitRadius, -profile.orbitRadius * 0.5, profile.orbitRadius * 0.5, 0],
          y: [0, -profile.orbitRadius * 0.5, -profile.orbitRadius, 0, profile.orbitRadius * 0.5, profile.orbitRadius, 0, 0],
        };

      case 'diagonal':
        // Diagonal drift pattern
        return {
          x: [0, profile.orbitRadius * 0.8, profile.orbitRadius * 0.6, -profile.orbitRadius * 0.4, -profile.orbitRadius * 0.6, 0],
          y: [0, -profile.orbitRadius * 0.6, profile.orbitRadius * 0.4, profile.orbitRadius * 0.8, -profile.orbitRadius * 0.4, 0],
        };

      default:
        return { x: 0, y: 0 };
    }
  };


  return (
    <div
      ref={containerRef}
      className={`fixed inset-x-0 top-16 bottom-32 overflow-hidden pointer-events-none ${zIndex} ${className}`}
      style={{
        transform: 'translateZ(0)',
        willChange: 'transform',
        contain: 'layout style paint'
      }}
    >
      {/* Sparkle effects for non-auth desktop only */}
      {profileConfig.complexity === 'high' && variant !== 'auth' && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute text-2xl"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + i * 15}%`,
                filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))'
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.2,  // Reduced from 1.5 to 0.2
                repeatDelay: 3,   // Reduced from 5 to 3
                ease: "easeInOut"
              }}
            >
              ✨
            </motion.div>
          ))}
        </>
      )}

      {isVisible && profiles.map((profile, index) => {
        const animationPath = getAnimationPath(profile);

        return (
          <motion.div
            key={profile.id}
            className="absolute"
            style={{
              width: profile.size,
              height: profile.size,
              left: `${profile.initialX}%`,
              top: `${profile.initialY}%`,
              transform: 'translate3d(-50%, -50%, 0)',
              filter: profile.hasGlow ? 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))' : 'none'
            }}
            initial={{
              opacity: variant === 'auth' ? 0 : 0,
              scale: variant === 'auth' ? 0 : 0,
              y: variant === 'auth' ? 0 : 50
            }}
            animate={{
              opacity: opacity !== undefined ? opacity : (variant === 'auth' ? 0.4 : 0.85),
              scale: profile.hasBreathing ? [1, 1.05, 1] : 1,
              x: animationPath.x,
              y: animationPath.y,
            }}
            transition={{
              duration: profile.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: profile.delay,
              scale: profile.hasBreathing ? {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              } : undefined
            }}
          >
            {/* Enhanced gradient container with glow effects */}
            <motion.div
              className="relative w-full h-full rounded-full overflow-hidden"
              style={{
                background: `linear-gradient(135deg, #${profile.gradientColors[0]}, #${profile.gradientColors[1]}, #${profile.gradientColors[2]})`,
                boxShadow: profile.hasGlow ?
                  `0 0 30px rgba(${parseInt(profile.bgColor.slice(0, 2), 16)}, ${parseInt(profile.bgColor.slice(2, 4), 16)}, ${parseInt(profile.bgColor.slice(4, 6), 16)}, 0.6),
                   0 0 60px rgba(${parseInt(profile.bgColor.slice(0, 2), 16)}, ${parseInt(profile.bgColor.slice(2, 4), 16)}, ${parseInt(profile.bgColor.slice(4, 6), 16)}, 0.3),
                   inset 0 0 20px rgba(255, 255, 255, 0.2)` :
                  `0 8px 32px rgba(${parseInt(profile.bgColor.slice(0, 2), 16)}, ${parseInt(profile.bgColor.slice(2, 4), 16)}, ${parseInt(profile.bgColor.slice(4, 6), 16)}, 0.3)`,
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
              animate={{
                rotate: profile.rotationSpeed ? [0, 360] : 0
              }}
              transition={{
                rotate: {
                  duration: profile.rotationSpeed,
                  repeat: Infinity,
                  ease: "linear"
                }
              }}
            >
              {/* Avatar image with loading and error handling */}
              <ProfileAvatar
                profile={profile}
                variant={variant}
              />

              {/* Optional pulse ring */}
              {profile.hasGlow && (
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
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
});

FloatingProfileImages.displayName = 'FloatingProfileImages';

export default FloatingProfileImages;