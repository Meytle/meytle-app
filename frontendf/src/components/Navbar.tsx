import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { FaUser, FaSignOutAlt, FaBell, FaEdit, FaTachometerAlt, FaUserCircle } from 'react-icons/fa';
import Button from './common/Button';
import RoleSwitcher from './common/RoleSwitcher';
import { theme } from '../styles/theme';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
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

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              {/* START of Logo Change to match the outline style */}
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-lg">
                <svg
                  className="w-full h-full p-1"
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
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">MeetGo</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'text-primary-600' 
                  : 'text-neutral-600 hover:text-primary-600'
              }`}
            >
              Home
            </Link>
            <button
              onClick={() => scrollToSection('services')}
              className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
            >
              How It Works
            </button>
            <Link
              to="/browse-companions"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/browse-companions' 
                  ? 'text-primary-600' 
                  : 'text-neutral-600 hover:text-primary-600'
              }`}
            >
              Browse Companions
            </Link>
            <Link
              to="/about"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/about' 
                  ? 'text-primary-600' 
                  : 'text-neutral-600 hover:text-primary-600'
              }`}
            >
              About
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              // Authenticated User Menu
              <>
                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="relative p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                  >
                    <FaBell className="w-5 h-5" />
                    {/* Notification Badge */}
                    <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"></span>
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-neutral-200">
                        <h3 className="font-semibold text-neutral-900">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {/* Sample Notifications */}
                        <div className="px-4 py-3 hover:bg-primary-50 cursor-pointer border-b border-neutral-100">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <p className="text-sm text-neutral-800">Welcome to MeetGo! Complete your profile to get started.</p>
                              <p className="text-xs text-neutral-500 mt-1">2 hours ago</p>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-3 hover:bg-primary-50 cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-neutral-300 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <p className="text-sm text-neutral-600">Your application is under review.</p>
                              <p className="text-xs text-neutral-500 mt-1">1 day ago</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-2 border-t border-neutral-200 text-center">
                        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
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
                    className="flex items-center gap-3 text-sm text-neutral-700 hover:bg-primary-50 px-3 py-2 rounded-lg transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold shadow-md">
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
                        <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-600 text-xs rounded-full capitalize">
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
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
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
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
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
                  size="sm"
                  onClick={() => navigate('/signin')}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/signup?role=companion')}
                >
                  Join as Companion
                </Button>
              </>
            )}
          </div>

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
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-primary-50"
            >
              Home
            </Link>
            <button
              onClick={() => {
                scrollToSection('services');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-primary-50"
            >
              Services
            </button>
            <button
              onClick={() => {
                scrollToSection('how-it-works');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-primary-50"
            >
              How It Works
            </button>
            <Link
              to="/browse-companions"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-primary-50"
            >
              Browse Companions
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-700 hover:text-neutral-900 hover:bg-primary-50"
            >
              About
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-neutral-200">
            <div className="px-2 space-y-1">
              {isAuthenticated ? (
                // Authenticated Mobile Menu
                <>
                  <div className="px-3 py-3 text-base font-medium text-neutral-900 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold shadow-md">
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
                      navigate('/signup?role=companion');
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-center"
                  >
                    Join as Companion
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;