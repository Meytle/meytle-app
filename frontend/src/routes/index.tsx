import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import App from '../App';
import MainLayout from '../components/MainLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import HomePage from '../pages/HomePage';
import SignIn from '../pages/auth/SignIn';
import SignUp from '../pages/auth/SignUp';
import ClientDashboard from '../pages/client/ClientDashboard';
import ClientProfile from '../pages/client/ClientProfile';
import CompanionDashboard from '../pages/companion/CompanionDashboard';
import CompanionApplication from '../pages/companion/CompanionApplication';
import CompanionProfile from '../pages/companion/CompanionProfile';
import AdminDashboard from '../pages/admin/AdminDashboard';
import VerifyEmail from '../pages/auth/VerifyEmail';
import BrowseCompanions from '../pages/BrowseCompanions';
import CompanionDetails from '../pages/companion/CompanionDetails';
// Payment pages removed - will be implemented later
import Favorites from '../pages/client/Favorites';
import BookingCreate from '../pages/booking/BookingCreate';

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
            element: <HomePage />,
          },
          {
            path: 'signin',
            element: <SignIn />,
          },
          {
            path: 'login',
            element: <Navigate to="/signin" replace />,
          },
          {
            path: 'signup',
            element: <SignUp />,
          },
          {
            path: 'verify-email',
            element: <VerifyEmail />,
          },
          {
            path: 'companion-application',
            element: (
              <ProtectedRoute requiredRole="companion">
                <CompanionApplication />
              </ProtectedRoute>
            ),
          },
          {
            path: 'client-dashboard',
            element: (
              <ProtectedRoute requiredRole="client">
                <ClientDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: 'client-profile',
            element: (
              <ProtectedRoute requiredRole="client">
                <ClientProfile />
              </ProtectedRoute>
            ),
          },
          {
            path: 'favorites',
            element: (
              <ProtectedRoute requiredRole="client">
                <Favorites />
              </ProtectedRoute>
            ),
          },
          {
            path: 'companion-dashboard',
            element: (
              <ProtectedRoute requiredRole="companion">
                <CompanionDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: 'companion-profile',
            element: (
              <ProtectedRoute requiredRole="companion">
                <CompanionProfile />
              </ProtectedRoute>
            ),
          },
          {
            path: 'admin-dashboard',
            element: (
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: 'browse-companions',
            element: <BrowseCompanions />,
          },
          {
            path: 'browse',
            element: <Navigate to="/browse-companions" replace />,
          },
          {
            path: 'companion/:id',
            element: <CompanionDetails />,
          },
          {
            path: 'booking/create',
            element: (
              <ProtectedRoute>
                <BookingCreate />
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