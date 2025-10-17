import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/ScrollToTop';

const App = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Toaster position="top-right" />
    </div>
  );
};

export default App;
