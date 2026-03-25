import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Routine from './pages/Routine';
import Templates from './pages/Templates';
import History from './pages/History';
import Settings from './pages/Settings';
import CustomSplitBuilder from './pages/CustomSplitBuilder';
import useAuthStore from './store/authStore';
import useGymStore from './store/gymStore';
import { AnimatePresence } from 'framer-motion';

function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const _hasHydrated = useGymStore(state => state._hasHydrated);

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-gym-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-gym-blue"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1a1a1a', color: '#fff', border: '1px solid #2a2a2a' }
      }} />
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

        {/* Protected Routes */}
        <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="routine" element={<Routine />} />
          <Route path="templates" element={<Templates />} />
          <Route path="builder" element={<CustomSplitBuilder />} />
          <Route path="builder/:sourceId" element={<CustomSplitBuilder />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
