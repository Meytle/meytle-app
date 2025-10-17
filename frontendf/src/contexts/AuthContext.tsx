/**
 * Authentication Context
 * Provides shared authentication state across the entire application
 */

import { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authApi } from '../api/auth';
import type { User, SignInData, SignUpData, UserRole, RoleSwitchData } from '../types';
import { ROUTES, TOAST_MESSAGES } from '../constants';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: SignInData) => Promise<void>;
  signUp: (userData: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  canAccessRole: (role: UserRole) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check authentication status on mount
  const checkAuth = useCallback(() => {
    const currentUser = authApi.getCurrentUser();
    // Ensure user has roles array, even if it's from old localStorage data
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        roles: currentUser.roles || (currentUser.activeRole ? [currentUser.activeRole] : [])
      };
      setUser(updatedUser);
    } else {
      setUser(null);
    }
  }, []);

  // Helper functions for role management
  const hasRole = useCallback((role: UserRole): boolean => {
    return user?.roles?.includes(role) ?? false;
  }, [user]);

  const canAccessRole = useCallback((role: UserRole): boolean => {
    return hasRole(role);
  }, [hasRole]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const signIn = async (credentials: SignInData) => {
    setIsLoading(true);
    try {
      const response = await authApi.signIn(credentials);
      // Backend returns response.data.data.user
      const authenticatedUser = response.data.data.user;
      setUser(authenticatedUser);
      
      toast.success(TOAST_MESSAGES.SIGN_IN_SUCCESS);
      
      // Redirect based on user's active role - ONLY on initial sign-in
      if (authenticatedUser.activeRole === 'admin') {
        // Admin users go to admin dashboard
        console.log('👑 Admin user - redirecting to admin dashboard');
        navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      } else if (authenticatedUser.activeRole === 'companion') {
        // Check if companion has submitted application
        const hasApplication = await authApi.checkCompanionApplication();
        console.log('🔍 Initial sign-in - Application check result:', hasApplication);
        if (hasApplication) {
          // Application exists, go to dashboard
          console.log('✅ Application found - redirecting to dashboard');
          navigate(ROUTES.COMPANION_DASHBOARD, { replace: true });
        } else {
          // No application found, go to application form
          console.log('📝 No application - redirecting to form');
          navigate(ROUTES.COMPANION_APPLICATION, { replace: true });
        }
      } else {
        navigate(ROUTES.CLIENT_DASHBOARD, { replace: true });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || TOAST_MESSAGES.SIGN_IN_ERROR;
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: SignUpData) => {
    setIsLoading(true);
    try {
      const response = await authApi.signUp(userData);
      // Backend returns response.data.data.user
      const newUser = response.data.data.user;
      setUser(newUser);
      
      toast.success(TOAST_MESSAGES.SIGN_UP_SUCCESS);
      
      // Redirect based on user's active role
      if (newUser.activeRole === 'admin') {
        // Redirect admin to admin dashboard
        console.log('👑 Redirecting admin to admin dashboard');
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else if (newUser.activeRole === 'companion') {
        // Redirect companions to application form
        console.log('🔄 Redirecting companion to application page:', ROUTES.COMPANION_APPLICATION);
        navigate(ROUTES.COMPANION_APPLICATION);
      } else {
        navigate(ROUTES.CLIENT_DASHBOARD);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || TOAST_MESSAGES.SIGN_UP_ERROR;
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await authApi.signOut();
    setUser(null);
    toast.success(TOAST_MESSAGES.SIGN_OUT_SUCCESS);
    navigate(ROUTES.HOME);
  };

  const switchRole = async (role: UserRole) => {
    if (!user || !hasRole(role)) {
      throw new Error('You do not have permission to switch to this role');
    }

    setIsLoading(true);
    try {
      const response = await authApi.switchRole({ role });
      const updatedUser = response.data.data.user;
      
      // Update user state with new active role
      setUser(prevUser => prevUser ? {
        ...prevUser,
        activeRole: updatedUser.activeRole,
        roles: updatedUser.roles
      } : null);

      toast.success(`Successfully switched to ${role} role`);
      
      // Redirect based on new active role
      if (role === 'admin') {
        navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      } else if (role === 'companion') {
        navigate(ROUTES.COMPANION_DASHBOARD, { replace: true });
      } else {
        navigate(ROUTES.CLIENT_DASHBOARD, { replace: true });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to switch role';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        checkAuth,
        switchRole,
        hasRole,
        canAccessRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
