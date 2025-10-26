/**
 * Footer Component
 * Consistent footer across all pages
 */

import { Link } from 'react-router-dom';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Logo and Description */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-full h-full p-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C8.686 2 6 4.686 6 8c0 4 6 14 6 14s6-10 6-14c0-3.314-2.686-6-6-6zm0 9a3 3 0 100-6 3 3 0 000 6z"
                    className="stroke-white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">Meytle</h3>
            </div>
            <p className="text-purple-200 text-sm leading-relaxed mb-6">
              The vibrant platform for finding amazing social companions. Colorful experiences, 
              trustworthy connections, and memorable adventures.
            </p>
            {/* Social Media Icons */}
            <div className="flex gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-pink-400 transition-all duration-200 transform hover:scale-125"
                aria-label="Facebook"
              >
                <FaFacebookF className="w-6 h-6" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-pink-400 transition-all duration-200 transform hover:scale-125"
                aria-label="Twitter"
              >
                <FaTwitter className="w-6 h-6" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-pink-400 transition-all duration-200 transform hover:scale-125"
                aria-label="Instagram"
              >
                <FaInstagram className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Column 2: Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/#services" className="text-purple-200 hover:text-white transition-colors text-sm">
                  Coffee Dates
                </Link>
              </li>
              <li>
                <Link to="/#services" className="text-purple-200 hover:text-white transition-colors text-sm">
                  Dinner Dates
                </Link>
              </li>
              <li>
                <Link to="/#services" className="text-purple-200 hover:text-white transition-colors text-sm">
                  Event Companions
                </Link>
              </li>
              <li>
                <Link to="/#services" className="text-purple-200 hover:text-white transition-colors text-sm">
                  Cultural Activities
                </Link>
              </li>
              <li>
                <Link to="/#services" className="text-purple-200 hover:text-white transition-colors text-sm">
                  Outdoor Adventures
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-purple-200 hover:text-white transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="text-purple-200 hover:text-white transition-colors text-sm">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/safety" className="text-purple-200 hover:text-white transition-colors text-sm">
                  Safety & Trust
                </Link>
              </li>
              <li>
                <Link to="/signup?role=companion" className="text-purple-200 hover:text-white transition-colors text-sm">
                  Become a Companion
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-purple-200 hover:text-white transition-colors text-sm">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <FaEnvelope className="w-5 h-5 text-purple-300 mt-0.5 flex-shrink-0" />
                <a 
                  href="mailto:support@meetandgo.com" 
                  className="text-purple-200 hover:text-white transition-colors text-sm"
                >
                  support@meetandgo.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <FaPhone className="w-5 h-5 text-purple-300 mt-0.5 flex-shrink-0" />
                <a 
                  href="tel:+18002633846" 
                  className="text-purple-200 hover:text-white transition-colors text-sm"
                >
                  1-800-MEYTLE
                </a>
              </li>
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="w-5 h-5 text-purple-300 mt-0.5 flex-shrink-0" />
                <span className="text-purple-200 text-sm">
                  San Francisco, CA
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-purple-500 border-opacity-30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-purple-200 text-sm">
              © {currentYear} Meytle. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-6 justify-center">
              <Link to="/privacy" className="text-purple-200 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-purple-200 hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-purple-200 hover:text-white transition-colors text-sm">
                Cookie Policy
              </Link>
              <Link to="/sitemap" className="text-purple-200 hover:text-white transition-colors text-sm">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;



