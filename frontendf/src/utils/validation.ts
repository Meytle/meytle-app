/**
 * Validation Utilities
 * Common validation functions for form inputs
 */

import { VALIDATION } from '../constants';

export const validateEmail = (email: string): boolean => {
  return VALIDATION.EMAIL_REGEX.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= VALIDATION.MIN_PASSWORD_LENGTH;
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string
): boolean => {
  return password === confirmPassword;
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const getPasswordStrength = (password: string): {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
} => {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { strength: 'weak', score };
  if (score <= 4) return { strength: 'medium', score };
  return { strength: 'strong', score };
};

