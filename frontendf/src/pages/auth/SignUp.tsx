/**
 * SignUp Page
 * Handles new user registration
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaUser, FaUserFriends, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import type { SignUpFormData, UserRole } from '../../types';
import { ROUTES, TOAST_MESSAGES, VALIDATION } from '../../constants';
import { validatePasswordMatch } from '../../utils/validation';

const SignUp = () => {
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role') as UserRole | null;
  
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    roles: roleFromUrl ? [roleFromUrl] : ['client'],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp, isLoading } = useAuth();

  // Update roles if URL parameter changes - add roleFromUrl if not already present
  useEffect(() => {
    if (roleFromUrl && !formData.roles.includes(roleFromUrl)) {
      setFormData(prev => ({ ...prev, roles: [...prev.roles, roleFromUrl] }));
    }
  }, [roleFromUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleRole = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (!validatePasswordMatch(formData.password, formData.confirmPassword)) {
      toast.error(TOAST_MESSAGES.PASSWORD_MISMATCH);
      return;
    }

    // Validate password length
    if (formData.password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
      toast.error(TOAST_MESSAGES.PASSWORD_TOO_SHORT);
      return;
    }

    // Validate at least one role is selected
    if (formData.roles.length === 0) {
      toast.error('Please select at least one role');
      return;
    }
    
    try {
      const { confirmPassword, ...signUpData } = formData;
      await signUp(signUpData);
    } catch (error) {
      // Error handling is done in the useAuth hook
      console.error('Sign up error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-primary-600">
            Already have an account?{' '}
            <Link to={ROUTES.SIGN_IN} className="font-semibold text-primary-600 hover:text-primary-500">
              Sign in here
            </Link>
          </p>
        </div>
        
        {/* Role Selection */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-primary-700 mb-3">
            I want to join as:
          </label>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              onClick={() => toggleRole('client')}
              className={`px-4 py-3 rounded-xl border-2 transition-all flex flex-col items-center ${
                formData.roles.includes('client')
                  ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md'
                  : 'border-primary-100 hover:border-primary-300 bg-white text-primary-600'
              }`}
            >
              <FaUser className="w-5 h-5 mb-1" />
              <span>Client</span>
            </button>
            <button
              type="button"
              onClick={() => toggleRole('companion')}
              className={`px-4 py-3 rounded-xl border-2 transition-all flex flex-col items-center ${
                formData.roles.includes('companion')
                  ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-md'
                  : 'border-primary-100 hover:border-primary-300 bg-white text-primary-600'
              }`}
            >
              <FaUserFriends className="w-5 h-5 mb-1" />
              <span>Companion</span>
            </button>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-primary-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none block w-full px-4 py-3 border border-primary-100 rounded-xl placeholder-primary-300 text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all duration-200"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-primary-700 mb-1">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-4 py-3 border border-primary-100 rounded-xl placeholder-primary-300 text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all duration-200"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-700 mb-1">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-4 py-3 pr-12 border border-primary-100 rounded-xl placeholder-primary-300 text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-primary-400 hover:text-primary-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-primary-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-4 py-3 pr-12 border border-primary-100 rounded-xl placeholder-primary-300 text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-primary-400 hover:text-primary-600 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-primary-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-primary-600">
              I agree to the{' '}
              <a href="#" className="font-medium text-primary-700 hover:text-primary-600">
                Terms and Conditions
              </a>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || formData.roles.length === 0}
              className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400 shadow-md hover:shadow-primary-200 transition-all duration-200 ${
                isLoading || formData.roles.length === 0 ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;