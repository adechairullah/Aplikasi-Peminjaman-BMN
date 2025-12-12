
import React from 'react';
import { MemoryRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { UserRole } from './types';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { LoanRequest } from './pages/LoanRequest';
import { LoanManage } from './pages/LoanManage';
import { History } from './pages/History';
import { UserManage } from './pages/UserManage';
import { Settings } from './pages/Settings';
import { Validation } from './pages/Validation';
import { Report } from './pages/Report';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { currentUser } = useApp();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
};

// Admin Route to restrict access
const AdminRoute = ({ children }: { children?: React.ReactNode }) => {
  const { currentUser } = useApp();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (currentUser.role !== UserRole.ADMIN) {
    // Redirect non-admin users to home if they try to access admin routes
    return <Navigate to="/" replace />;
  }
  return <Layout>{children}</Layout>;
};

const AppContent = () => {
  const { currentUser } = useApp();

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!currentUser ? <Login /> : <Navigate to="/" replace />} 
        />
        
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* Admin Routes - Secured with AdminRoute */}
        <Route path="/inventory" element={<AdminRoute><Inventory /></AdminRoute>} />
        <Route path="/loans" element={<AdminRoute><LoanManage /></AdminRoute>} />
        <Route path="/reports" element={<AdminRoute><Report /></AdminRoute>} />
        <Route path="/users" element={<AdminRoute><UserManage /></AdminRoute>} />
        <Route path="/settings" element={<AdminRoute><Settings /></AdminRoute>} />
        <Route path="/validation" element={<AdminRoute><Validation /></AdminRoute>} />
        
        {/* Borrower Routes */}
        <Route path="/request" element={<ProtectedRoute><LoanRequest /></ProtectedRoute>} />
        <Route path="/my-loans" element={<ProtectedRoute><History /></ProtectedRoute>} />
        
        {/* Shared */}
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
