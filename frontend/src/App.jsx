import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Routine from './pages/Routine';
import Templates from './pages/Templates';
import History from './pages/History';
import Progress from './pages/Progress';
import Notes from './pages/Notes';
import Nutrition from './pages/Nutrition';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import CustomSplitBuilder from './pages/CustomSplitBuilder';
import VerifyOTP from './pages/VerifyOTP';
import useAuthStore from './store/authStore';
import useGymStore from './store/gymStore';
import { AnimatePresence } from 'framer-motion';
import NewWeekModal from './components/NewWeekModal';
import { useEffect } from 'react';

function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const { checkNewWeek, showNewWeekSummary } = useGymStore();

  useEffect(() => {
    if (isAuthenticated) {
      checkNewWeek();
    }
  }, [isAuthenticated, checkNewWeek]);

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1a1a1a', color: '#fff', border: '1px solid #2a2a2a' }
      }} />
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="/verify-otp" element={!isAuthenticated ? <VerifyOTP /> : <Navigate to="/" />} />

        {/* Protected Routes */}
        <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="routine" element={<Routine />} />
          <Route path="templates" element={<Templates />} />
          <Route path="builder" element={<CustomSplitBuilder />} />
          <Route path="builder/:sourceId" element={<CustomSplitBuilder />} />
          <Route path="history" element={<History />} />
          <Route path="progress" element={<Progress />} />
          <Route path="notes" element={<Notes />} />
          <Route path="nutrition" element={<Nutrition />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
      <AnimatePresence>
        {showNewWeekSummary && <NewWeekModal summary={showNewWeekSummary} />}
      </AnimatePresence>
    </Router>
  );
}

export default App;
