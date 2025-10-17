/**
 * Custom hook for route protection
 * Handles authentication and authorization for protected routes
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authApi } from '../api/auth';
import type { UserRole } from '../types';
import { ROUTES, TOAST_MESSAGES } from '../constants';

interface UseProtectedRouteOptions {
  requiredRole?: UserRole;
  redirectTo?: string;
}

export const useProtectedRoute = (options: UseProtectedRouteOptions = {}) => {
  const { requiredRole, redirectTo = ROUTES.SIGN_IN } = options;
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authApi.getCurrentUser();

    // Check if user is authenticated
    if (!currentUser) {
      toast.error(TOAST_MESSAGES.UNAUTHORIZED);
      navigate(redirectTo);
      return;
    }

    // Check if user has required role
    if (requiredRole && currentUser.role !== requiredRole) {
      const errorMessage =
        requiredRole === 'client'
          ? TOAST_MESSAGES.ACCESS_DENIED_CLIENT
          : TOAST_MESSAGES.ACCESS_DENIED_COMPANION;
      
      toast.error(errorMessage);
      navigate(redirectTo);
      return;
    }
  }, [requiredRole, redirectTo, navigate]);
};
