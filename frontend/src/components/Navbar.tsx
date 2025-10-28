import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useModal } from '../context/ModalContext';
import { FaUser, FaSignOutAlt, FaBell, FaEdit, FaTachometerAlt, FaUserCircle } from 'react-icons/fa';
import Button from './common/Button';
import RoleSwitcher from './common/RoleSwitcher';
import { theme } from '../styles/theme';
import notificationApi from '../api/notifications';
import type { Notification } from '../api/notifications';

// Throttle utility for scroll performance
const throttle = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout | null;
  let lastExecTime = 0;
  return (...args: any[]) => {
    const currentTime = Date.now();
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    }
  };
};

const Navbar = React.memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAnyModalOpen } = useModal();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const lastScrollY = useRef(0);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, signOut } = useAuth();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Throttled scroll handler for 60fps (16ms)
  useEffect(() => {
    const handleScroll = throttle(() => {
      // Don't update visibility based on scroll when modal is open
      if (isAnyModalOpen) return;

      const currentScrollY = window.scrollY;

      // Only hide header after scrolling down past 80px
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        // Scrolling DOWN - hide header
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling UP - show header
        setIsHeaderVisible(true);
      }

      lastScrollY.current = currentScrollY;
    }, 16);

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Proper cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isAnyModalOpen]);

  // Fetch notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
      // Refresh notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoadingNotifications(true);
    try {
      const response = await notificationApi.getNotifications(10, 0);
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [isAuthenticated]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await notificationApi.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [isAuthenticated]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationApi.markAsRead(notificationId);
      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  // Format notification timestamp
  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Handle notification click
  const handleNotificationItemClick = useCallback((notification: Notification) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    // Navigate if action URL exists
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      setIsNotificationOpen(false);
    }
  }, [markAsRead, navigate]);

  // Get notification icon color based on type
  const getNotificationIconColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-neutral-300';
    switch(type) {
      case 'application': return 'bg-primary-500';
      case 'booking': return 'bg-secondary-500';
      case 'payment': return 'bg-green-500';
      case 'account': return 'bg-[#312E81]';
      case 'system': return 'bg-orange-500';
      default: return 'bg-primary-500';
    }
  };

  // Memoized event handlers
  const handleSignOut = useCallback(() => {
    signOut();
    setIsProfileDropdownOpen(false);
  }, [signOut]);

  const handleProfileClick = useCallback(() => {
    setIsProfileDropdownOpen(prev => !prev);
  }, []);

  const handleNotificationClick = useCallback(() => {
    setIsNotificationOpen(prev => !prev);
    if (!isNotificationOpen) {
      fetchNotifications();
    }
  }, [isNotificationOpen, fetchNotifications]);

  const scrollToSection = useCallback((sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        if (sectionId === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (sectionId === 'footer') {
          const element = document.getElementById('footer');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          } else {
            // If no footer element, scroll to bottom of page
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }
        } else {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 100);
    } else {
      if (sectionId === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (sectionId === 'footer') {
        const element = document.getElementById('footer');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          // If no footer element, scroll to bottom of page
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
      } else {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [location.pathname, navigate]);

  return (
    <>
      {/* Floating Auth Buttons - Only show when header is hidden and no modals are open */}
      {!isHeaderVisible && !isAnyModalOpen && (
        <div className="fixed top-6 right-6 z-[9999] hidden md:flex items-center gap-3 glass-navy px-4 py-3 rounded-2xl shadow-[0_10px_40px_rgba(30,27,75,0.2)] border border-[#312E81]/20 transition-all duration-300 animate-fadeIn">
        {isAuthenticated ? (
          // Authenticated User Menu
          <>
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={handleNotificationClick}
                className="relative p-2 text-white hover:text-secondary-200 hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <FaBell className="w-5 h-5" />
                {/* Notification Badge */}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[8px] h-2 bg-error-500 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? (
                      <span className="text-white text-[10px] px-1">9+</span>
                    ) : (
                      <span className="text-white text-[10px] px-0.5">{unreadCount}</span>
                    )}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-neutral-200 flex items-center justify-between">
                    <h3 className="font-semibold text-neutral-900">Notifications</h3>
                    {notifications.some(n => !n.isRead) && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {isLoadingNotifications ? (
                      <div className="px-4 py-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                        <p className="text-sm text-neutral-500 mt-2">Loading notifications...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <FaBell className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                        <p className="text-sm text-neutral-500">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationItemClick(notification)}
                          className={`px-4 py-3 hover:bg-primary-50 cursor-pointer border-b border-neutral-100 transition-colors ${
                            notification.isRead ? 'opacity-70' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${getNotificationIconColor(notification.type, notification.isRead)}`}></div>
                            <div className="flex-1">
                              <p className={`text-sm ${notification.isRead ? 'text-neutral-600' : 'text-neutral-800 font-medium'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-neutral-600 mt-0.5">{notification.message}</p>
                              <p className="text-xs text-neutral-500 mt-1">
                                {formatNotificationTime(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-neutral-200 text-center">
                    <button
                      onClick={() => {
                        navigate('/notifications');
                        setIsNotificationOpen(false);
                      }}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher */}
            <RoleSwitcher />

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-3 text-sm text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#312E81] to-[#1E1B4B] flex items-center justify-center text-white font-semibold shadow-[0_0_15px_rgba(255,204,203,0.3)]">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{user?.name}</span>
                <svg className={`w-4 h-4 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-neutral-200">
                    <p className="text-sm font-semibold text-neutral-900">{user?.name}</p>
                    <p className="text-xs text-neutral-500">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-[#312E81]/10 text-[#312E81] text-xs rounded-full capitalize">
                      {user?.activeRole}
                    </span>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate(user?.activeRole === 'companion' ? '/companion-dashboard' : '/client-dashboard');
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#1E1B4B] hover:bg-[#312E81]/10 hover:text-[#312E81] transition-colors"
                    >
                      <FaTachometerAlt className="w-4 h-4" />
                      Dashboard
                    </button>

                    <button
                      onClick={() => {
                        if (user?.activeRole === 'companion') {
                          navigate('/companion-profile');
                        } else if (user?.activeRole === 'client') {
                          navigate('/client-profile');
                        }
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#1E1B4B] hover:bg-[#312E81]/10 hover:text-[#312E81] transition-colors"
                    >
                      <FaEdit className="w-4 h-4" />
                      Edit Profile
                    </button>

                    <div className="border-t border-neutral-200 my-1"></div>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors"
                    >
                      <FaSignOutAlt className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          // Guest Menu
          <>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/signin')}
              className="btn-premium-light px-6 py-2 rounded-lg transition-all duration-300 font-semibold"
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/signup')}
              className="btn-premium-light px-6 py-2 rounded-lg transition-all duration-300 font-semibold"
            >
              Join Us
            </Button>
          </>
        )}
        </div>
      )}

      {/* Main Navigation Bar */}
      <nav className={`bg-white/95 border-b border-neutral-200 sticky top-0 z-50 shadow-lg transition-transform duration-300 ${
        (isHeaderVisible && !isAnyModalOpen) ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={{
        transform: `translateY(${(isHeaderVisible && !isAnyModalOpen) ? '0' : '-100%'})`,
        willChange: 'transform',
      }}>
        <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12">
          <div className="relative flex justify-between items-center h-20">
          {/* Desktop Navigation - LEFT SIDE */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => {
                if (location.pathname === '/') {
                  scrollToSection('top');
                } else {
                  navigate('/');
                }
              }}
              className={`px-4 py-2 rounded-lg text-base font-semibold transition-all duration-300 ${
                location.pathname === '/'
                  ? 'bg-gradient-to-r from-[#312E81]/10 to-[#FFCCCB]/10 text-[#312E81] shadow-[0_0_15px_rgba(255,204,203,0.3)]'
                  : 'text-neutral-700 hover:bg-gradient-to-r hover:from-[#312E81]/10 hover:to-[#FFCCCB]/10 hover:text-[#312E81] hover:shadow-[0_0_15px_rgba(255,204,203,0.3)]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="px-4 py-2 rounded-lg text-base font-semibold text-neutral-700 hover:bg-gradient-to-r hover:from-[#312E81]/10 hover:to-[#FFCCCB]/10 hover:text-[#312E81] hover:shadow-[0_0_15px_rgba(255,204,203,0.3)] transition-all duration-300"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('steps')}
              className="px-4 py-2 rounded-lg text-base font-semibold text-neutral-700 hover:bg-gradient-to-r hover:from-[#312E81]/10 hover:to-[#FFCCCB]/10 hover:text-[#312E81] hover:shadow-[0_0_15px_rgba(255,204,203,0.3)] transition-all duration-300"
            >
              How It Works
            </button>
            <Link
              to="/browse-companions"
              className={`px-4 py-2 rounded-lg text-base font-semibold transition-all duration-300 ${
                location.pathname === '/browse-companions'
                  ? 'bg-gradient-to-r from-[#312E81]/10 to-[#FFCCCB]/10 text-[#312E81] shadow-[0_0_15px_rgba(255,204,203,0.3)]'
                  : 'text-neutral-700 hover:bg-gradient-to-r hover:from-[#312E81]/10 hover:to-[#FFCCCB]/10 hover:text-[#312E81] hover:shadow-[0_0_15px_rgba(255,204,203,0.3)]'
              }`}
            >
              Browse
            </Link>
            <button
              onClick={() => scrollToSection('footer')}
              className="px-4 py-2 rounded-lg text-base font-semibold text-neutral-700 hover:bg-gradient-to-r hover:from-[#312E81]/10 hover:to-[#FFCCCB]/10 hover:text-[#312E81] hover:shadow-[0_0_15px_rgba(255,204,203,0.3)] transition-all duration-300"
            >
              About
            </button>
          </div>

          {/* Logo - CENTER POSITION (Desktop and Mobile) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
            <Link to="/" className="flex items-center space-x-3 hover:scale-110 transition-transform duration-300">
              {/* START of Logo Change to match the outline style */}
              <div className="w-10 h-10 bg-gradient-to-r from-[#312E81] to-[#1E1B4B] rounded-xl flex items-center justify-center shadow-xl hover:shadow-[0_0_20px_rgba(255,204,203,0.4)] transition-all duration-300">
                <svg
                  className="w-full h-full p-1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    // This path creates the pin shape and the inner circle, but we make it hollow.
                    // The 'fill-none' will be applied implicitly since we removed the 'fill-white' class.
                    d="M12 2C8.686 2 6 4.686 6 8c0 4 6 14 6 14s6-10 6-14c0-3.314-2.686-6-6-6zm0 9a3 3 0 100-6 3 3 0 000 6z"
                    className="stroke-white" // Only stroke is white for the outline effect
                    strokeWidth="2.5" // Increased stroke width slightly for visibility
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {/* END of Logo Change */}
              <span className="text-2xl font-bold bg-gradient-to-r from-[#312E81] to-[#1E1B4B] bg-clip-text text-transparent">Meytle</span>
            </Link>
          </div>

          {/* Auth Buttons in Header - Only show when header is visible */}
          {isHeaderVisible ? (
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                // Authenticated User Menu
                <>
                  {/* Notification Bell */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={handleNotificationClick}
                      className="relative p-2 text-[#312E81] hover:text-[#1E1B4B] hover:bg-[#312E81]/10 rounded-lg transition-all duration-200"
                    >
                      <FaBell className="w-5 h-5" />
                      {/* Notification Badge */}
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 min-w-[8px] h-2 bg-error-500 rounded-full flex items-center justify-center">
                          {unreadCount > 9 ? (
                            <span className="text-white text-[10px] px-1">9+</span>
                          ) : (
                            <span className="text-white text-[10px] px-0.5">{unreadCount}</span>
                          )}
                        </span>
                      )}
                    </button>

                    {/* Notification Dropdown */}
                    {isNotificationOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-neutral-200 flex items-center justify-between">
                          <h3 className="font-semibold text-neutral-900">Notifications</h3>
                          {notifications.some(n => !n.isRead) && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {isLoadingNotifications ? (
                            <div className="px-4 py-8 text-center">
                              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                              <p className="text-sm text-neutral-500 mt-2">Loading notifications...</p>
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                              <FaBell className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                              <p className="text-sm text-neutral-500">No notifications yet</p>
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                onClick={() => handleNotificationItemClick(notification)}
                                className={`px-4 py-3 hover:bg-primary-50 cursor-pointer border-b border-neutral-100 transition-colors ${
                                  notification.isRead ? 'opacity-70' : ''
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-2 h-2 rounded-full mt-2 ${getNotificationIconColor(notification.type, notification.isRead)}`}></div>
                                  <div className="flex-1">
                                    <p className={`text-sm ${notification.isRead ? 'text-neutral-600' : 'text-neutral-800 font-medium'}`}>
                                      {notification.title}
                                    </p>
                                    <p className="text-xs text-neutral-600 mt-0.5">{notification.message}</p>
                                    <p className="text-xs text-neutral-500 mt-1">
                                      {formatNotificationTime(notification.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="px-4 py-2 border-t border-neutral-200 text-center">
                          <button
                            onClick={() => {
                              navigate('/notifications');
                              setIsNotificationOpen(false);
                            }}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            View All Notifications
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Role Switcher */}
                  <RoleSwitcher />

                  {/* Profile Dropdown */}
                  <div className="relative" ref={profileDropdownRef}>
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center gap-3 text-sm text-[#1E1B4B] hover:bg-[#312E81]/10 px-3 py-2 rounded-lg transition-all duration-200"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#312E81] to-[#1E1B4B] flex items-center justify-center text-white font-semibold shadow-[0_0_15px_rgba(255,204,203,0.3)]">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-[#1E1B4B]">{user?.name}</span>
                      <svg className={`w-4 h-4 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Profile Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50">
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-neutral-200">
                          <p className="text-sm font-semibold text-neutral-900">{user?.name}</p>
                          <p className="text-xs text-neutral-500">{user?.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-[#312E81]/10 text-[#312E81] text-xs rounded-full capitalize">
                            {user?.activeRole}
                          </span>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          <button
                            onClick={() => {
                              navigate(user?.activeRole === 'companion' ? '/companion-dashboard' : '/client-dashboard');
                              setIsProfileDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#1E1B4B] hover:bg-[#312E81]/10 hover:text-[#312E81] transition-colors"
                          >
                            <FaTachometerAlt className="w-4 h-4" />
                            Dashboard
                          </button>

                          <button
                            onClick={() => {
                              if (user?.activeRole === 'companion') {
                                navigate('/companion-profile');
                              } else if (user?.activeRole === 'client') {
                                navigate('/client-profile');
                              }
                              setIsProfileDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#1E1B4B] hover:bg-[#312E81]/10 hover:text-[#312E81] transition-colors"
                          >
                            <FaEdit className="w-4 h-4" />
                            Edit Profile
                          </button>

                          <div className="border-t border-neutral-200 my-1"></div>

                          <button
                            onClick={() => {
                              signOut();
                              setIsProfileDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error-600 hover:bg-error-50 transition-colors"
                          >
                            <FaSignOutAlt className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // Guest Menu
                <>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => navigate('/signin')}
                    className="btn-premium text-white px-6 py-2 rounded-lg hover:shadow-[0_0_30px_rgba(255,204,203,0.6)] transition-all duration-300 font-semibold"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => navigate('/signup')}
                    className="btn-premium text-white px-6 py-2 rounded-lg hover:shadow-[0_0_30px_rgba(255,204,203,0.6)] transition-all duration-300 font-semibold"
                  >
                    Join Us
                  </Button>
                </>
              )}
            </div>
          ) : (
            // Right spacer when header is hiding
            <div className="hidden md:block w-[200px]"></div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-neutral-200">
            <button
              onClick={() => {
                if (location.pathname === '/') {
                  scrollToSection('top');
                } else {
                  navigate('/');
                }
                setIsMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                location.pathname === '/'
                  ? 'bg-gradient-to-r from-[#312E81]/10 to-[#FFCCCB]/10 text-[#312E81]'
                  : 'text-neutral-700 hover:bg-gradient-to-r hover:from-[#312E81]/10 hover:to-[#FFCCCB]/10 hover:text-[#312E81]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                scrollToSection('services');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-gradient-to-r hover:from-[#312E81]/10 hover:to-[#FFCCCB]/10 hover:text-[#312E81] transition-all duration-300"
            >
              Services
            </button>
            <button
              onClick={() => {
                scrollToSection('steps');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-gradient-to-r hover:from-[#312E81]/10 hover:to-[#FFCCCB]/10 hover:text-[#312E81] transition-all duration-300"
            >
              How It Works
            </button>
            <Link
              to="/browse-companions"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                location.pathname === '/browse-companions'
                  ? 'bg-gradient-to-r from-[#312E81]/10 to-[#FFCCCB]/10 text-[#312E81]'
                  : 'text-neutral-700 hover:bg-gradient-to-r hover:from-[#312E81]/10 hover:to-[#FFCCCB]/10 hover:text-[#312E81]'
              }`}
            >
              Browse Companions
            </Link>
            <button
              onClick={() => {
                scrollToSection('footer');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-gradient-to-r hover:from-[#312E81]/10 hover:to-[#FFCCCB]/10 hover:text-[#312E81] transition-all duration-300"
            >
              About
            </button>
          </div>
          <div className="pt-4 pb-3 border-t border-neutral-200">
            <div className="px-2 space-y-1">
              {isAuthenticated ? (
                // Authenticated Mobile Menu
                <>
                  <div className="px-3 py-3 text-base font-medium text-[#1E1B4B] bg-gradient-to-r from-[#312E81]/10 to-[#FFCCCB]/10 rounded-lg mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#312E81] to-[#1E1B4B] flex items-center justify-center text-white font-semibold shadow-[0_0_15px_rgba(255,204,203,0.3)]">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold">{user?.name}</div>
                        <div className="text-xs text-neutral-500">{user?.email}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full capitalize">
                          {user?.activeRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notifications */}
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-600"
                  >
                    <FaBell className="w-5 h-5" />
                    <span>Notifications</span>
                    <span className="ml-auto w-2 h-2 bg-error-500 rounded-full"></span>
                  </button>

                  {/* Dashboard */}
                  <button
                    onClick={() => {
                      navigate(user?.activeRole === 'companion' ? '/companion-dashboard' : '/client-dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-600"
                  >
                    <FaTachometerAlt className="w-5 h-5" />
                    Dashboard
                  </button>

                  {/* Edit Profile */}
                  <button
                    onClick={() => {
                      if (user?.activeRole === 'companion') {
                        navigate('/companion-profile');
                      } else if (user?.activeRole === 'client') {
                        navigate('/client-profile');
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:bg-primary-50 hover:text-primary-600"
                  >
                    <FaEdit className="w-5 h-5" />
                    Edit Profile
                  </button>

                  <div className="border-t border-neutral-200 my-2"></div>

                  {/* Sign Out */}
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-white bg-error-500 hover:bg-error-600"
                  >
                    <FaSignOutAlt className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                // Guest Mobile Menu
                <>
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      navigate('/signin');
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-center"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      navigate('/signup');
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-center"
                  >
                    Join Us
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      </nav>
    </>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;