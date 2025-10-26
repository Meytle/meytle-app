/**
 * Enhanced Homepage V3 - Three Section Layout
 * Optimized for performance with memoization and reduced animations
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaArrowRight, FaStar, FaShieldAlt, FaClock, FaCheckCircle,
  FaCoffee, FaUtensils, FaFilm, FaShoppingBag,
  FaTheaterMasks, FaMusic, FaMapMarkedAlt, FaMountain,
  FaArrowDown, FaDumbbell, FaBook, FaGamepad, FaCamera
} from 'react-icons/fa';
import { ROUTES } from '../constants';
import { useAuth } from '../hooks/useAuth';
import FloatingProfileImages from '../components/common/FloatingProfileImages';

const HomePage = React.memo(() => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [activeMetric, setActiveMetric] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Fade in animation on mount and device detection
  useEffect(() => {
    setIsVisible(true);
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);

    const interval = setInterval(() => {
      setActiveMetric(prev => (prev + 1) % 3);
    }, 3000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Memoized arrays to prevent re-creation on every render
  const trustMetrics = useMemo(() => [
    { label: '100% Verified', color: 'text-purple-400' },
    { label: '4.9 Rating', color: 'text-pink-400' },
    { label: 'Instant Connect', color: 'text-indigo-400' }
  ], []);

  const services = useMemo(() => [
    {
      icon: FaCoffee,
      title: 'Coffee Date',
      description: 'Enjoy meaningful conversations over your favorite brew',
      color: 'from-purple-500 to-pink-500',
      popular: false
    },
    {
      icon: FaUtensils,
      title: 'Dinner Date',
      description: 'Fine dining experiences with great company',
      color: 'from-pink-500 to-rose-500',
      popular: true
    },
    {
      icon: FaFilm,
      title: 'Movie Night',
      description: 'Cinema experiences and film discussions',
      color: 'from-indigo-500 to-purple-500',
      popular: false
    },
    {
      icon: FaShoppingBag,
      title: 'Shopping',
      description: 'Personal shopping assistance and style advice',
      color: 'from-purple-500 to-indigo-500',
      popular: false
    },
    {
      icon: FaTheaterMasks,
      title: 'Cultural Activities',
      description: 'Museums, galleries, and cultural events',
      color: 'from-rose-500 to-pink-500',
      popular: false
    },
    {
      icon: FaMusic,
      title: 'Concerts & Events',
      description: 'Live music and entertainment experiences',
      color: 'from-pink-500 to-purple-500',
      popular: true
    },
    {
      icon: FaMapMarkedAlt,
      title: 'Travel Companion',
      description: 'Explore new destinations together',
      color: 'from-indigo-500 to-blue-500',
      popular: false
    },
    {
      icon: FaMountain,
      title: 'Outdoor Activities',
      description: 'Hiking, sports, and adventure activities',
      color: 'from-purple-600 to-indigo-600',
      popular: false
    },
    {
      icon: FaDumbbell,
      title: 'Gym & Fitness',
      description: 'Stay motivated with a workout buddy',
      color: 'from-pink-600 to-purple-600',
      popular: false
    },
    {
      icon: FaBook,
      title: 'Study & Work',
      description: 'Productive co-working and study sessions',
      color: 'from-blue-500 to-indigo-500',
      popular: false
    },
    {
      icon: FaGamepad,
      title: 'Gaming',
      description: 'Gaming sessions and esports events',
      color: 'from-purple-600 to-blue-600',
      popular: false
    },
    {
      icon: FaCamera,
      title: 'Photography',
      description: 'Capture memories with a creative companion',
      color: 'from-indigo-600 to-purple-600',
      popular: false
    }
  ], []);

  const steps = useMemo(() => [
    {
      number: '1',
      title: 'Create Account',
      description: '30-second signup',
      icon: '👤',
      color: 'from-purple-500 to-pink-500'
    },
    {
      number: '2',
      title: 'Find Match',
      description: 'Browse profiles',
      icon: '🔍',
      color: 'from-pink-500 to-rose-500'
    },
    {
      number: '3',
      title: 'Start Adventure',
      description: 'Connect instantly',
      icon: '🚀',
      color: 'from-rose-500 to-purple-500'
    }
  ], []);

  // Memoized click handlers
  const handleGetStarted = useCallback(() => {
    if (isAuthenticated && user) {
      if (user.activeRole === 'admin') {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else if (user.activeRole === 'companion') {
        navigate(ROUTES.COMPANION_DASHBOARD);
      } else {
        navigate(ROUTES.CLIENT_DASHBOARD);
      }
    } else {
      navigate(ROUTES.SIGN_UP);
    }
  }, [isAuthenticated, user, navigate]);

  const handleSignIn = useCallback(() => {
    if (isAuthenticated && user) {
      if (user.activeRole === 'admin') {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else if (user.activeRole === 'companion') {
        navigate(ROUTES.COMPANION_DASHBOARD);
      } else {
        navigate(ROUTES.CLIENT_DASHBOARD);
      }
    } else {
      navigate(ROUTES.SIGN_IN);
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Enhanced FloatingProfileImages with adaptive rendering */}
      <FloatingProfileImages variant="sides" className="z-0" opacity={0.85} />

      {/* Main content */}
      <div className="relative z-10">
        {/* SECTION 1: HERO */}
        <section className="relative overflow-hidden">
        {/* OPTIMIZED: Removed blur-3xl and mix-blend-multiply for performance */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-900 rounded-full opacity-20" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-800 rounded-full opacity-20" />
          <div className="absolute -bottom-40 left-1/2 w-80 h-80 bg-indigo-900 rounded-full opacity-20" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-24 text-center">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/20 mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
            </span>
            5 people joined in the last hour
          </div>

          {/* Main Headline */}
          <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 transition-all duration-1000 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Meet <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Amazing</span> People
          </h1>

          {/* Subheadline */}
          <p className={`text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto mb-10 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            Verified companions for every occasion.
            <br />
            Coffee dates, concerts, travel & more.
          </p>

          {/* CTA Button */}
          <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button
              onClick={handleGetStarted}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-lg rounded-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:shadow-purple-500/25"
            >
              Start Free Today
              <FaArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="mt-4">
              <a href="#steps" className="inline-flex items-center gap-2 text-purple-200 hover:text-white transition-colors">
                See how it works
                <FaArrowDown className="animate-bounce" />
              </a>
            </div>
          </div>

          {/* Trust Metrics */}
          <div className={`flex flex-wrap justify-center items-center gap-6 mt-12 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {trustMetrics.map((metric, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 transition-all duration-500 ${
                  activeMetric === index ? 'scale-110' : 'scale-100 opacity-80'
                }`}
              >
                <FaCheckCircle className={`w-5 h-5 ${metric.color}`} />
                <span className="text-white font-medium">{metric.label}</span>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div className={`mt-8 text-purple-200 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center justify-center gap-2">
              <span className="font-semibold text-white">Join 5,000+ members</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="w-4 h-4 text-pink-400" />
                ))}
                <span className="ml-2">4.9/5 from 500+ reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SERVICES */}
      <section id="services" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Discover Your Next <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Adventure</span>
            </h2>
            <p className="text-lg text-purple-100 max-w-3xl mx-auto">
              From vibrant coffee dates to exciting concert nights, explore colorful experiences with amazing companions who share your passion for life.
            </p>
          </div>

          {/* Services Grid - 12 cards total */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="relative group bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:-translate-y-1 border border-white/20"
                >
                  {/* Popular Badge */}
                  {service.popular && (
                    <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full">
                      Popular
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {service.title}
                  </h3>
                  <p className="text-purple-100 text-sm">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS / STEPS */}
      <section id="steps" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Three Simple Steps
            </h2>
            <p className="text-lg text-purple-100">
              From signup to meetup in minutes
            </p>
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Progress Line - Desktop Only */}
            <div className="hidden md:block absolute top-16 left-1/2 transform -translate-x-1/2 w-4/5 max-w-2xl h-0.5 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {steps.map((step, index) => (
                <div key={index} className="text-center relative">
                  {/* Step Circle */}
                  <div className="relative inline-flex items-center justify-center w-32 h-32 mb-6">
                    <div className={`absolute inset-0 bg-gradient-to-r ${step.color} rounded-full opacity-30 animate-pulse`} />
                    <div className="relative w-28 h-28 bg-white/10 backdrop-blur-md rounded-full shadow-xl flex items-center justify-center border-4 border-white/20">
                      <span className="text-5xl">{step.icon}</span>
                    </div>
                    <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gradient-to-r ${step.color} text-white text-sm font-bold rounded-full`}>
                      Step {step.number}
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-purple-100">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-20 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">
              Your Next Adventure Awaits
            </h3>
            <p className="text-lg text-purple-100 mb-8">
              Safe, verified, instant connections. No commitments, just experiences.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg rounded-full hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                Join Free Now
              </button>
              <button
                onClick={handleSignIn}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold text-lg rounded-full border-2 border-purple-400 hover:bg-white/20 hover:border-pink-400 transition-all duration-300"
              >
                I Have an Account
              </button>
            </div>

            {/* Trust Badge */}
            <div className="mt-10 inline-flex items-center gap-3 text-sm text-purple-200">
              <FaShieldAlt className="w-5 h-5 text-purple-400" />
              <span>SSL Secured • ID Verified • Safe Payments</span>
            </div>
          </div>
        </div>
      </section>

      </div> {/* End of content wrapper */}
    </div>
  );
});

HomePage.displayName = 'HomePage';

export default HomePage;