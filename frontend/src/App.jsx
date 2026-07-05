import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import TrainingHub from './pages/TrainingHub';
import ProgressHub from './pages/ProgressHub';
import Notes from './pages/Notes';
import Nutrition from './pages/Nutrition';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import CustomSplitBuilder from './pages/CustomSplitBuilder';
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

        {/* Protected Routes */}
        <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="training" element={<TrainingHub />} />
          <Route path="progress" element={<ProgressHub />} />
          <Route path="builder" element={<CustomSplitBuilder />} />
          <Route path="builder/:sourceId" element={<CustomSplitBuilder />} />
          <Route path="notes" element={<Notes />} />
          <Route path="nutrition" element={<Nutrition />} />

          <Route path="routine"   element={<Navigate to="/training" replace />} />
          <Route path="prs"       element={<Navigate to="/training" replace />} />
          <Route path="templates" element={<Navigate to="/training" replace />} />
          <Route path="history"   element={<Navigate to="/progress" replace />} />
          <Route path="analysis"  element={<Navigate to="/progress" replace />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={<Admin />} />
        </Route>
        
        {/* Catch-all Route for 404s */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AnimatePresence>
        {showNewWeekSummary && <NewWeekModal summary={showNewWeekSummary} />}
      </AnimatePresence>
    </Router>
  );
}

export default App;
