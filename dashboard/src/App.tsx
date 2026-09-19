import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layout/AdminLayout';
import OverviewPage from './pages/OverviewPage';
import UserManagementPage from './pages/UserManagementPage';
import WordLibraryPage from './pages/WordLibraryPage';
import SystemConfigPage from './pages/SystemConfigPage';
import LoginPage from './pages/LoginPage';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import { Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AuditLogPage from './pages/AuditLogPage/AuditLogPage';
import ModerationPage from './pages/ModerationPage/ModerationPage';
import TrashPage from './pages/TrashPage/TrashPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<AdminLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="words" element={<WordLibraryPage />} />
            <Route path="moderation" element={<ModerationPage />} />
            <Route path="audit" element={<AuditLogPage />} />
            <Route path="trash" element={<TrashPage />} />
            <Route path="config" element={<SystemConfigPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
