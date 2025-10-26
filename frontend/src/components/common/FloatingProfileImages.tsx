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

// Adaptive profile configuration based on device
const getProfileConfig = () => {
  const width = window.innerWidth;
  const isRetina = window.devicePixelRatio > 1;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return { count: 0, complexity: 'none', imageSize: 150 };
  }

  if (width >= 1024) {
    return { count: 10, complexity: 'high', imageSize: isRetina ? 300 : 200 };
  } else if (width >= 768) {
    return { count: 8, complexity: 'medium', imageSize: isRetina ? 250 : 175 };
  } else {
    return { count: 6, complexity: 'simple', imageSize: isRetina ? 200 : 150 };
  }
};

const FloatingProfileImages = React.memo(({
  variant = 'hero',
  className = '',
  opacity,
  zIndex = ''
}: FloatingProfileImagesProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [profileConfig, setProfileConfig] = useState(getProfileConfig());
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  // Update profile config on resize
  useEffect(() => {
    const handleResize = () => {
      setProfileConfig(getProfileConfig());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Don't render if animations are disabled
  if (profileConfig.count === 0) {
    return null;
  }

  // Use Intersection Observer with rootMargin for early activation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px' // Start animations 50px before visible
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
  }, []);

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
    const { complexity, imageSize } = profileConfig;

    return selectedProfiles.map((profile, index) => ({
      ...profile,
      id: index,
      // High quality images with WebP support
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=${profile.bgColor}&color=fff&size=${imageSize}&bold=true&format=svg`,
      size: complexity === 'simple' ? 60 : complexity === 'medium' ? 70 : 80,
      initialX: 10 + (index / profileCount) * 80, // Even distribution
      initialY: 15 + Math.sin(index * 0.8) * 30 + Math.random() * 20,
      duration: complexity === 'simple' ? 40 + index * 3 : complexity === 'medium' ? 35 + index * 2 : 30 + index * 2,
      delay: index * 0.3, // Staggered start
      orbitRadius: complexity === 'simple' ? 20 : complexity === 'medium' ? 35 : 50,
      hasGlow: complexity !== 'simple' && Math.random() > 0.3,
      hasBreathing: complexity === 'high' || (complexity === 'medium' && Math.random() > 0.5),
      rotationSpeed: complexity === 'simple' ? 60 : complexity === 'medium' ? 45 : 30,
    }));
  }, [variant, profileConfig]);


  // Create orbital or simple animation path based on complexity
  const getAnimationPath = (profile: FloatingProfile) => {
    const { complexity } = profileConfig;

    if (complexity === 'simple') {
      // Simple vertical bounce for mobile
      return {
        x: 0,
        y: [-profile.orbitRadius/2, profile.orbitRadius/2, -profile.orbitRadius/2],
      };
    } else if (complexity === 'medium') {
      // Figure-8 pattern for tablet
      return {
        x: [0, profile.orbitRadius, 0, -profile.orbitRadius, 0],
        y: [0, profile.orbitRadius/2, 0, -profile.orbitRadius/2, 0],
      };
    } else {
      // Smooth orbital motion for desktop
      const steps = 8;
      const xPath = Array.from({ length: steps }, (_, i) =>
        Math.sin((i / steps) * Math.PI * 2) * profile.orbitRadius
      );
      const yPath = Array.from({ length: steps }, (_, i) =>
        Math.cos((i / steps) * Math.PI * 2) * profile.orbitRadius * 0.6
      );
      return { x: xPath, y: yPath };
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
      {/* Sparkle effects for desktop only */}
      {profileConfig.complexity === 'high' && (
        <>
          {[...Array(5)].map((_, i) => (
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
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 1.5,
                repeatDelay: 5,
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
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: opacity !== undefined ? opacity : 0.85,
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
              {/* Avatar image */}
              <div className="absolute inset-1 rounded-full overflow-hidden bg-white/10">
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />

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
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 5,
                    ease: "easeInOut",
                  }}
                />
              </div>

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