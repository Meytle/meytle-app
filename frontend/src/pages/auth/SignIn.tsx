import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import FloatingProfileImages from '../../components/common/FloatingProfileImages';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn({ email, password });
    } catch (error) {
      console.error('Sign in error:', error);
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
          <h1 className="text-6xl font-bold text-white mb-4" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>Meytle</h1>
          <p className="text-xl text-white/80" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.3)' }}>Connect. Meet. Experience.</p>
        </div>
      </motion.div>

      {/* Right Side - Login Form (40%) */}
      <div className="w-full lg:w-2/5 flex items-center justify-center bg-white">
        <div className="w-full max-w-md px-8 py-12">
          {/* Simple stick figure hugging couple above login */}
          <div className="flex justify-center mb-8">
            <svg viewBox="0 0 200 150" className="w-80 h-64">
              {/* Person 1 - Simple stick figure */}
              {/* Head */}
              <circle cx="85" cy="45" r="15" fill="none" stroke="#2D3748" strokeWidth="2.5" />
              {/* Eyes */}
              <circle cx="80" cy="42" r="2" fill="#2D3748" />
              <circle cx="90" cy="42" r="2" fill="#2D3748" />
              {/* Smile */}
              <path d="M 80 48 Q 85 52, 90 48" fill="none" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
              {/* Body */}
              <line x1="85" y1="60" x2="85" y2="90" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />
              {/* Arms hugging */}
              <path d="M 85 70 L 70 75 Q 65 80, 70 85" fill="none" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 85 70 L 100 68 L 115 70" fill="none" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />
              {/* Legs */}
              <line x1="85" y1="90" x2="78" y2="110" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="85" y1="90" x2="92" y2="110" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />

              {/* Person 2 - Simple stick figure */}
              {/* Head */}
              <circle cx="115" cy="45" r="15" fill="none" stroke="#2D3748" strokeWidth="2.5" />
              {/* Eyes */}
              <circle cx="110" cy="42" r="2" fill="#2D3748" />
              <circle cx="120" cy="42" r="2" fill="#2D3748" />
              {/* Smile */}
              <path d="M 110 48 Q 115 52, 120 48" fill="none" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
              {/* Body */}
              <line x1="115" y1="60" x2="115" y2="90" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />
              {/* Arms hugging back */}
              <path d="M 115 70 L 130 75 Q 135 80, 130 85" fill="none" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 115 70 L 100 68" fill="none" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />
              {/* Legs */}
              <line x1="115" y1="90" x2="108" y2="110" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="115" y1="90" x2="122" y2="110" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" />

              {/* Small floating heart */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                  y: [0, -5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <path d="M 100 25 C 98 23, 96 25, 98 27 L 100 29 L 102 27 C 104 25, 102 23, 100 25 Z"
                      fill="#FF8A80" stroke="#2D3748" strokeWidth="1.5" />
              </motion.g>
            </svg>
          </div>

          {/* Simple Log in heading */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
            Log in
          </h2>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Email Field */}
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-gray-300 transition-all duration-200"
                placeholder="Username / Email"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                )}
              </button>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-gray-300 transition-all duration-200"
                placeholder="Password"
              />
            </div>

            {/* Submit Buttons - Circular */}
            <div className="flex justify-center items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-24 h-24 flex items-center justify-center rounded-full text-base font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? '...' : 'Log in'}
              </button>

              <Link
                to="/signup"
                className="w-16 h-16 flex items-center justify-center rounded-full text-xs font-medium text-gray-900 bg-white border-2 border-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                Join us
              </Link>
            </div>

            {/* Forgot password link - Cloud-like box */}
            <div className="flex justify-center pt-6">
              <div
                className="inline-block px-6 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                style={{
                  borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <a
                  href="#"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;