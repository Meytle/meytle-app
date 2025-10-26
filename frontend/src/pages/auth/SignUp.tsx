import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaEnvelope, FaUser, FaLock, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import FloatingProfileImages from '../../components/common/FloatingProfileImages';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'client' | 'companion' | null>(null);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Step 1: Role selection, Step 2: Registration form
  const { signUp, isLoading } = useAuth();
  const navigate = useNavigate();

  // Password requirements check
  const passwordRequirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(req => req);
  const requirementsMet = Object.values(passwordRequirements).filter(req => req).length;
  const strengthPercentage = (requirementsMet / 5) * 100;

  const handleNext = () => {
    if (selectedRole) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }
    if (!allRequirementsMet) {
      alert('Please meet all password requirements');
      return;
    }
    if (!agreedToTerms) {
      alert('Please agree to the terms');
      return;
    }

    try {
      await signUp({
        name,
        email,
        password,
        roles: [selectedRole]
      });
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Floating Browser/Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:bg-white transition-all duration-200"
      >
        <FaArrowLeft className="text-gray-700 text-lg" />
      </button>

      {/* Left Side - Visual Section (60%) */}
      <motion.div
        className="hidden lg:flex lg:w-3/5 relative bg-gradient-to-br from-[#1E1B4B] to-[#312E81] items-center justify-center"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Floating Profile Images - Auth variant */}
        <FloatingProfileImages variant="auth" zIndex="z-0" opacity={0.4} />

        {/* Gradient background with centered logo/text */}
        <div className="text-center relative z-10">
          <h1 className="text-6xl font-bold text-white mb-4" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>Join Meytle</h1>
          <p className="text-xl text-white/80" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.3)' }}>Start Your Journey Today</p>
        </div>
      </motion.div>

      {/* Right Side - Sign Up Form (40%) */}
      <div className="w-full lg:w-2/5 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8 py-12">
          {/* Three stick figures holding hands above form */}
          <div className="flex justify-center mb-6">
            <svg viewBox="0 0 300 120" className="w-64 h-24">
              {/* Person 1 */}
              <g>
                <circle cx="75" cy="35" r="12" fill="none" stroke="#2D3748" strokeWidth="2" />
                <circle cx="72" cy="33" r="1.5" fill="#2D3748" />
                <circle cx="78" cy="33" r="1.5" fill="#2D3748" />
                <path d="M 70 38 Q 75 41, 80 38" fill="none" stroke="#2D3748" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="75" y1="47" x2="75" y2="70" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
                <line x1="75" y1="55" x2="60" y2="65" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
                <line x1="75" y1="55" x2="90" y2="60" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
                <line x1="75" y1="70" x2="68" y2="85" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
                <line x1="75" y1="70" x2="82" y2="85" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Person 2 (center) */}
              <g>
                <circle cx="150" cy="35" r="12" fill="none" stroke="#2D3748" strokeWidth="2" />
                <circle cx="147" cy="33" r="1.5" fill="#2D3748" />
                <circle cx="153" cy="33" r="1.5" fill="#2D3748" />
                <path d="M 145 38 Q 150 41, 155 38" fill="none" stroke="#2D3748" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="150" y1="47" x2="150" y2="70" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
                <line x1="150" y1="55" x2="120" y2="60" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
                <line x1="150" y1="55" x2="180" y2="60" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
                <line x1="150" y1="70" x2="143" y2="85" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
                <line x1="150" y1="70" x2="157" y2="85" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Person 3 */}
              <g>
                <circle cx="225" cy="35" r="12" fill="none" stroke="#2D3748" strokeWidth="2" />
                <circle cx="222" cy="33" r="1.5" fill="#2D3748" />
                <circle cx="228" cy="33" r="1.5" fill="#2D3748" />
                <path d="M 220 38 Q 225 41, 230 38" fill="none" stroke="#2D3748" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="225" y1="47" x2="225" y2="70" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
                <line x1="225" y1="55" x2="210" y2="60" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
                <line x1="225" y1="55" x2="240" y2="65" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
                <line x1="225" y1="70" x2="218" y2="85" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
                <line x1="225" y1="70" x2="232" y2="85" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Holding hands lines */}
              <line x1="90" y1="60" x2="120" y2="60" stroke="#2D3748" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
              <line x1="180" y1="60" x2="210" y2="60" stroke="#2D3748" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
            </svg>
          </div>

          {/* Join us heading */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Join us
          </h2>

          {/* Sign Up Form */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: currentStep === 2 ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {currentStep === 1 ? (
              /* Step 1: Role Selection */
              <>
                {/* Role Selection Cards */}
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 font-medium">I am:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedRole('client')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedRole === 'client'
                          ? 'border-gray-800 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">🔍</div>
                        <div className="text-sm font-medium text-gray-700">Looking for</div>
                        <div className="text-sm text-gray-500">companions</div>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedRole('companion')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedRole === 'companion'
                          ? 'border-gray-800 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">🤝</div>
                        <div className="text-sm font-medium text-gray-700">Want to be</div>
                        <div className="text-sm text-gray-500">a companion</div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Action Buttons for Step 1 */}
                <div className="flex justify-center items-center gap-3 pt-8">
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!selectedRole}
                    className={`w-24 h-24 flex items-center justify-center rounded-full text-base font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 ${
                      !selectedRole ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Next
                  </button>

                  <Link
                    to="/signin"
                    className="w-16 h-16 flex items-center justify-center rounded-full text-xs font-medium text-gray-900 bg-white border-2 border-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                  >
                    Sign in
                  </Link>
                </div>
              </>
            ) : (
              /* Step 2: Registration Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <FaUser className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-gray-300 transition-all duration-200"
                    placeholder="Your name"
                  />
                </div>

                {/* Email Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <FaEnvelope className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-gray-300 transition-all duration-200"
                    placeholder="Email address"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="h-4 w-4 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <FaEye className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      className="block w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-gray-300 transition-all duration-200"
                      placeholder="Password"
                    />
                  </div>

                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2"
                    >
                      {/* Strength Bar */}
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full transition-all duration-300 ${
                            strengthPercentage >= 100 ? 'bg-green-500' :
                            strengthPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${strengthPercentage}%` }}
                        />
                      </div>

                      {/* Requirements (only show if focused or not all met) */}
                      {(passwordFocused || !allRequirementsMet) && (
                        <div className="mt-2 space-y-1">
                          <div className={`flex items-center text-xs ${passwordRequirements.length ? 'text-green-600' : 'text-gray-400'}`}>
                            <FaCheck className={`w-3 h-3 mr-2 ${passwordRequirements.length ? 'opacity-100' : 'opacity-30'}`} />
                            8+ characters
                          </div>
                          <div className={`flex items-center text-xs ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                            <FaCheck className={`w-3 h-3 mr-2 ${passwordRequirements.uppercase ? 'opacity-100' : 'opacity-30'}`} />
                            Uppercase letter
                          </div>
                          <div className={`flex items-center text-xs ${passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                            <FaCheck className={`w-3 h-3 mr-2 ${passwordRequirements.lowercase ? 'opacity-100' : 'opacity-30'}`} />
                            Lowercase letter
                          </div>
                          <div className={`flex items-center text-xs ${passwordRequirements.number ? 'text-green-600' : 'text-gray-400'}`}>
                            <FaCheck className={`w-3 h-3 mr-2 ${passwordRequirements.number ? 'opacity-100' : 'opacity-30'}`} />
                            Number
                          </div>
                          <div className={`flex items-center text-xs ${passwordRequirements.special ? 'text-green-600' : 'text-gray-400'}`}>
                            <FaCheck className={`w-3 h-3 mr-2 ${passwordRequirements.special ? 'opacity-100' : 'opacity-30'}`} />
                            Special character
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Terms Checkbox - styled as bubble */}
                <div className="flex justify-center">
                  <label
                    className={`inline-flex items-center px-4 py-2 rounded-full cursor-pointer transition-all ${
                      agreedToTerms
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center transition-colors ${
                      agreedToTerms ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'
                    }`}>
                      {agreedToTerms && <FaCheck className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className="text-xs text-gray-600">
                      I agree to the terms
                    </span>
                  </label>
                </div>

                {/* Submit Buttons - Circular */}
                <div className="flex justify-center items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || !allRequirementsMet || !agreedToTerms}
                    className={`w-24 h-24 flex items-center justify-center rounded-full text-base font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 ${
                      (isLoading || !allRequirementsMet || !agreedToTerms) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? '...' : 'Join'}
                  </button>

                  <Link
                    to="/signin"
                    className="w-16 h-16 flex items-center justify-center rounded-full text-xs font-medium text-gray-900 bg-white border-2 border-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                  >
                    Sign in
                  </Link>
                </div>

                {/* Back button for step 2 */}
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    ← Back to role selection
                  </button>
                </div>
              </form>
            )}

            {/* Progress dots */}
            <div className="flex justify-center gap-2 pt-4">
              <div className={`w-2 h-2 rounded-full transition-colors ${currentStep === 1 ? 'bg-gray-800' : 'bg-gray-300'}`}></div>
              <div className={`w-2 h-2 rounded-full transition-colors ${currentStep === 2 ? 'bg-gray-800' : 'bg-gray-300'}`}></div>
            </div>

            {/* Playful tooltip for step 2 */}
            {currentStep === 2 && name && email && allRequirementsMet && agreedToTerms && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-sm text-gray-600 mt-2"
              >
                Almost there! 🎉
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;