/**
 * Identity Verification Modal
 * Popup modal for clients to verify their identity
 */

import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { FaIdCard, FaShieldAlt, FaTimes, FaUpload } from 'react-icons/fa';
import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '../constants';
import { getLocalStorageItem } from '../utils/localStorage';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const VerificationModal = ({ isOpen, onClose, onSuccess }: VerificationModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
  const [idDocumentPreview, setIdDocumentPreview] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [governmentIdNumber, setGovernmentIdNumber] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIdDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Document must be less than 10MB');
        return;
      }

      setIdDocumentFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdDocumentPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success('ID document selected!');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!idDocumentFile) {
      toast.error('Please select an ID document');
      return;
    }

    if (!dateOfBirth) {
      toast.error('Please enter your date of birth');
      return;
    }

    if (!governmentIdNumber.trim()) {
      toast.error('Please enter your government ID number');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getLocalStorageItem<string>(STORAGE_KEYS.AUTH_TOKEN);

      if (!token) {
        toast.error('Please login again');
        onClose();
        return;
      }

      const formData = new FormData();
      formData.append('idDocument', idDocumentFile);
      formData.append('dateOfBirth', dateOfBirth);
      formData.append('governmentIdNumber', governmentIdNumber);

      await axios.post(`${API_CONFIG.BASE_URL}/client/verify-identity`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      toast.success('Verification submitted! We\'ll review it within 24 hours.');
      onSuccess();
      onClose();
      
      // Reset form
      setIdDocumentFile(null);
      setIdDocumentPreview('');
      setDateOfBirth('');
      setGovernmentIdNumber('');
      
    } catch (error: any) {
      console.error('❌ Error submitting verification:', error);
      toast.error(error.response?.data?.message || 'Failed to submit verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center">
              <FaShieldAlt className="text-white text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Verify Your Identity</h2>
              <p className="text-sm text-gray-500">Required for booking companions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Box */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FaIdCard className="text-purple-600 text-lg flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-purple-900 mb-1">Government ID Required</h3>
                <p className="text-sm text-purple-700">
                  Upload a government-approved ID (passport, driver's license, or national ID card) to verify your identity.
                </p>
              </div>
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth *
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* Government ID Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Government ID Number *
            </label>
            <input
              type="text"
              value={governmentIdNumber}
              onChange={(e) => setGovernmentIdNumber(e.target.value)}
              placeholder="Enter your ID number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          {/* ID Document Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Document *
            </label>
            <div
              onClick={triggerFileInput}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
            >
              {idDocumentPreview ? (
                <div className="space-y-3">
                  <img
                    src={idDocumentPreview}
                    alt="ID Document"
                    className="max-h-32 mx-auto rounded-lg"
                  />
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Document selected
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <FaUpload className="mx-auto text-3xl text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Click to upload your ID document
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, or PDF (max. 10MB)
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleIdDocumentChange}
              className="hidden"
            />
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">🔒</span>
              </div>
              <p className="text-sm text-green-700">
                Your information is secure and encrypted. We'll review within 24 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !idDocumentFile || !dateOfBirth || !governmentIdNumber}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-violet-600 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <FaShieldAlt />
            {isSubmitting ? 'Submitting...' : 'Submit Verification'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
