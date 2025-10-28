import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingProfileImages from './common/FloatingProfileImages';
import { useModal } from '../context/ModalContext';

const MainLayout = () => {
  const location = useLocation();
  const { isAnyModalOpen } = useModal();

  // Hide navbar and footer on signin/signup pages
  const isAuthPage = ['/signin', '/signup', '/login'].includes(location.pathname);

  // Show floating images only on homepage
  const isHomePage = location.pathname === '/';

  // Determine if floating images should be shown (only on auth pages now, homepage handles its own)
  const showFloatingImages = isAuthPage;

  // Hide navbar and footer when modals are open or on auth pages
  const shouldHideNavbar = isAuthPage || isAnyModalOpen;
  const shouldHideFooter = isAuthPage || isAnyModalOpen;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 relative">
      {/* Navbar with smooth transition */}
      <div className={`transition-all duration-300 ${shouldHideNavbar ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {!isAuthPage && <Navbar />}
      </div>

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

      {/* Footer with smooth transition and higher z-index to stay above floating images */}
      <div className={`relative z-30 transition-all duration-300 ${shouldHideFooter ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {!isAuthPage && <Footer />}
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

export default MainLayout;