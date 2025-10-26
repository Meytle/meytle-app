import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingProfileImages from './common/FloatingProfileImages';

const MainLayout = () => {
  const location = useLocation();

  // Hide navbar and footer on signin/signup pages
  const isAuthPage = ['/signin', '/signup', '/login'].includes(location.pathname);

  // Show floating images only on homepage
  const isHomePage = location.pathname === '/';

  // Determine if floating images should be shown (only on auth pages now, homepage handles its own)
  const showFloatingImages = isAuthPage;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 relative">
      {!isAuthPage && <Navbar />}

      {/* Floating Profile Images - Only on auth pages now, homepage handles its own */}
      {showFloatingImages && (
        <FloatingProfileImages
          variant="auth"
          className="z-0"
        />
      )}

      <main className="flex-grow relative z-10">
        <Outlet />
      </main>

      {/* Footer with higher z-index to stay above floating images */}
      {!isAuthPage && (
        <div className="relative z-30">
          <Footer />
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
};

export default MainLayout;