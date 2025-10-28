import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/common/ScrollToTopButton';
import { ModalProvider } from './context/ModalContext';
import ErrorBoundary from './components/ErrorBoundary';
import AsyncErrorBoundary from './components/AsyncErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary level="page" showDetails={false}>
      <AsyncErrorBoundary maxRetries={3} retryDelay={1000}>
        <ModalProvider>
          <div className="min-h-screen flex flex-col">
            <ScrollToTop />
            <main className="flex-grow">
              <Outlet />
            </main>
            <Toaster position="top-right" />
            <ScrollToTopButton />
          </div>
        </ModalProvider>
      </AsyncErrorBoundary>
    </ErrorBoundary>
  );
};

export default App;
