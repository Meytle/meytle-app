import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import App from '../App';
import MainLayout from '../components/MainLayout';
import Home from '../pages/Home';
import SignIn from '../pages/auth/SignIn';
import SignUp from '../pages/auth/SignUp';
import ClientDashboard from '../pages/ClientDashboard';
import ClientProfile from '../pages/ClientProfile';
import CompanionDashboard from '../pages/CompanionDashboard';
import CompanionApplication from '../pages/CompanionApplication';
import CompanionProfile from '../pages/CompanionProfile';
import AdminDashboard from '../pages/AdminDashboard';
import VerifyEmail from '../pages/VerifyEmail';
import BrowseCompanions from '../pages/BrowseCompanions';
import PaymentConfirmation from '../pages/PaymentConfirmation';
import PaymentFailed from '../pages/PaymentFailed';

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
            element: <Home />,
          },
          {
            path: 'signin',
            element: <SignIn />,
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
            element: <CompanionApplication />,
          },
          {
            path: 'client-dashboard',
            element: <ClientDashboard />,
          },
          {
            path: 'client-profile',
            element: <ClientProfile />,
          },
          {
            path: 'companion-dashboard',
            element: <CompanionDashboard />,
          },
          {
            path: 'companion-profile',
            element: <CompanionProfile />,
          },
          {
            path: 'admin-dashboard',
            element: <AdminDashboard />,
          },
          {
            path: 'browse-companions',
            element: <BrowseCompanions />,
          },
          {
            path: 'payment/confirmation/:bookingId',
            element: <PaymentConfirmation />,
          },
          {
            path: 'payment/failed/:bookingId',
            element: <PaymentFailed />,
          },
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