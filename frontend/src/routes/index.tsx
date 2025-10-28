import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import App from '../App';
import MainLayout from '../components/MainLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Simple loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
  </div>
);

// Helper to wrap lazy components with Suspense
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

// Lazy load all pages for better performance
const HomePage = lazy(() => import('../pages/HomePage'));
const SignIn = lazy(() => import('../pages/auth/SignIn'));
const SignUp = lazy(() => import('../pages/auth/SignUp'));
const ClientDashboard = lazy(() => import('../pages/client/ClientDashboard'));
const ClientProfile = lazy(() => import('../pages/client/ClientProfile'));
const CompanionDashboard = lazy(() => import('../pages/companion/CompanionDashboard'));
const CompanionApplication = lazy(() => import('../pages/companion/CompanionApplication'));
const CompanionProfile = lazy(() => import('../pages/companion/CompanionProfile'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const VerifyEmail = lazy(() => import('../pages/auth/VerifyEmail'));
const BrowseCompanions = lazy(() => import('../pages/BrowseCompanions'));
const CompanionDetails = lazy(() => import('../pages/companion/CompanionDetails'));
const Favorites = lazy(() => import('../pages/client/Favorites'));
const BookingCreate = lazy(() => import('../pages/booking/BookingCreate'));
const Notifications = lazy(() => import('../pages/Notifications'));
const DashboardRedirect = lazy(() => import('../components/redirects/DashboardRedirect'));
const ProfileRedirect = lazy(() => import('../components/redirects/ProfileRedirect'));

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthProvider>
        <App />
      </AuthProvider>
    ),
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: withSuspense(HomePage),
          },
          {
            path: 'signin',
            element: withSuspense(SignIn),
          },
          {
            path: 'login',
            element: <Navigate to="/signin" replace />,
          },
          {
            path: 'signup',
            element: withSuspense(SignUp),
          },
          {
            path: 'verify-email',
            element: withSuspense(VerifyEmail),
          },
          {
            path: 'companion-application',
            element: (
              <ProtectedRoute requiredRole="companion">
                <Suspense fallback={<PageLoader />}>
                  <CompanionApplication />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'client-dashboard',
            element: (
              <ProtectedRoute requiredRole="client">
                <Suspense fallback={<PageLoader />}>
                  <ClientDashboard />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'client-profile',
            element: (
              <ProtectedRoute requiredRole="client">
                <Suspense fallback={<PageLoader />}>
                  <ClientProfile />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'favorites',
            element: (
              <ProtectedRoute requiredRole="client">
                <Suspense fallback={<PageLoader />}>
                  <Favorites />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'companion-dashboard',
            element: (
              <ProtectedRoute requiredRole="companion">
                <Suspense fallback={<PageLoader />}>
                  <CompanionDashboard />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'companion-profile',
            element: (
              <ProtectedRoute requiredRole="companion">
                <Suspense fallback={<PageLoader />}>
                  <CompanionProfile />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'admin-dashboard',
            element: (
              <ProtectedRoute requiredRole="admin">
                <Suspense fallback={<PageLoader />}>
                  <AdminDashboard />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'browse-companions',
            element: withSuspense(BrowseCompanions),
          },
          {
            path: 'browse',
            element: <Navigate to="/browse-companions" replace />,
          },
          {
            path: 'companion/:id',
            element: withSuspense(CompanionDetails),
          },
          {
            path: 'booking/create',
            element: (
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <BookingCreate />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'notifications',
            element: (
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <Notifications />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'dashboard',
            element: (
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <DashboardRedirect />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          {
            path: 'profile',
            element: (
              <ProtectedRoute>
                <Suspense fallback={<PageLoader />}>
                  <ProfileRedirect />
                </Suspense>
              </ProtectedRoute>
            ),
          },
          // Payment routes removed - will be implemented later
          {
            path: '*',
            element: <Navigate to="/" replace />,
          },
        ],
      },
    ],
  },
]);

export default router;