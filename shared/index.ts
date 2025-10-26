// Shared utilities and types for Meytle application
// This module will contain shared code between frontend and backend

export const APP_NAME = 'Meytle';
export const APP_VERSION = '1.0.0';

// Placeholder for shared types and utilities
export interface BaseUser {
  id: number;
  email: string;
  name: string;
}

export interface BaseResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}